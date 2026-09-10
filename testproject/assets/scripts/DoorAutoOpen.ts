import { _decorator, Component, SkeletalAnimation, AnimationClip, AnimationState, Vec3 } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

/**
 * 플레이어가 가까이 오면 클립을 정방향, 멀어지면 역방향으로 재생해서 문을 자동으로
 * 여닫는다. Door2처럼 컬리전 없이 통과 가능한 문에 사용 — 별도의 "닫힘" 클립 없이
 * 하나의 클립(예: open)을 앞/뒤로만 재생해서 열림·닫힘을 표현한다.
 *
 * closeDistance를 openDistance보다 크게 둬서(히스테리시스), 경계선에 걸쳐 서성일 때
 * 매 프레임 여닫힘이 떨리는 걸 막는다.
 */
@ccclass('DoorAutoOpen')
export class DoorAutoOpen extends Component {
    @property({ type: AnimationClip, displayName: '문 열림 클립', tooltip: '정방향 재생=열림, 역방향 재생=닫힘으로 사용할 클립 (예: open). Animation/SkeletalAnimation의 clips 목록에 이미 등록되어 있어야 한다' })
    clipOpen: AnimationClip | null = null;

    @property({ displayName: '열림 거리(m)', tooltip: '플레이어가 이 거리 안으로 들어오면 문이 열린다' })
    openDistance: number = 2.5;

    @property({ displayName: '닫힘 거리(m)', tooltip: '플레이어가 이 거리 밖으로 나가면 문이 닫힌다 — 열림 거리와 같거나 비슷하게 둬도 된다. 실제 판정에는 최소 MIN_HYSTERESIS_GAP만큼의 여유가 항상 자동으로 더해지므로(경계선에서 매 프레임 열림/닫힘이 번갈아 떨리는 걸 막기 위해) 여기 적은 값 그대로 쓰이지 않을 수 있다' })
    closeDistance: number = 3.2;

    /** openDistance/closeDistance를 인스펙터에서 똑같거나 비슷하게 둬도(예: 둘 다 2) 경계선에서
     * 플레이어가 살짝만 움직여도 매 프레임 열림→닫힘→열림이 반복 트리거되는 걸 막기 위한
     * 최소 강제 여유(m) — 실제 닫힘 판정 거리는 max(closeDistance, openDistance + 이 값)이다. */
    private static readonly MIN_HYSTERESIS_GAP = 0.5;

    /** BuildingTrigger가 이 문의 건설(appear) 애니메이션을 다 재생한 뒤에만 true로 켠다.
     * 그 전까지 update()가 완전히 아무 것도 하지 않는다 — 문이 아직 안 지어져 메쉬가 숨겨진
     * 동안에도 이 스크립트는 계속 살아있어서(onLoad/start는 씬 시작과 함께 돈다), 플레이어가
     * 우연히 근처에 있으면 "open" 상태를 미리 재생해버릴 수 있었다. 그 상태로 있다가
     * BuildingTrigger가 별도의 "appear" 클립을 재생하면 같은 뼈대를 두 애니메이션 상태가
     * 동시에 건드리게 되어, 문이 등장하는 순간 두 포즈가 뒤섞이며 잠깐 튀는 것처럼 보였다. */
    active = false;

    private _anim: SkeletalAnimation | null = null;
    private _isOpen = false;

    onLoad() {
        this._anim = this.getComponent(SkeletalAnimation) ?? this.getComponentInChildren(SkeletalAnimation);
    }

    /** BuildingTrigger가 appear 재생 시간만큼 지연시킨 뒤 호출 — TowerAttack.combatEnabled와
     * 동일한 패턴. 이 시점부터 비로소 open 상태를 건드리기 시작한다. */
    activate() {
        this.active = true;
    }

    /** onLoad()가 아니라 start()에서 처리한다 — SkeletalAnimation은 자신의 onLoad()에서 clips로부터
     * 애니메이션 상태(state)를 만드는데, 같은 노드라도 컴포넌트 실행 순서에 따라 DoorAutoOpen의
     * onLoad()가 그보다 먼저 돌 수 있어 getState()가 아직 null을 반환하는 경우가 있었다.
     * start()는 씬의 모든 onLoad()가 끝난 뒤에 실행되므로 이 시점엔 항상 state가 존재한다.
     *
     * wrapMode는 Loop로 둔다(반복 재생용이 아니라 자동 정지를 일부러 끄기 위해) — 엔진의
     * Normal(1회 재생) 모드는 "누적 재생 시간이 클립 길이를 넘었는가"로 정지를 판단하는데,
     * 역재생을 시작할 때 time을 클립 끝(duration)으로 강제로 옮겨두면 그 순간 이미 "한 바퀴
     * 다 돈 것"으로 계산되어 역재생이 시작되자마자 즉시 멈춰버리는 문제가 있었다(그래서 문이
     * 열린 채로 안 닫히는 것처럼 보였다). Loop는 repeatCount가 무한대라 이 오작동이 없고,
     * 정지 시점은 update()에서 직접 감시해서 처리한다. */
    start() {
        const state = this._getState();
        if (!state) return;
        state.wrapMode = AnimationClip.WrapMode.Loop;
        state.sample();
    }

    update() {
        if (!this.active) return;
        const player = Player.instance?.node;
        if (player && player.isValid) {
            const d = Vec3.distance(this.node.worldPosition, player.worldPosition);
            const effectiveCloseDistance = Math.max(this.closeDistance, this.openDistance + DoorAutoOpen.MIN_HYSTERESIS_GAP);
            if (!this._isOpen && d <= this.openDistance) {
                this._isOpen = true;
                this._setDirection(1);
            } else if (this._isOpen && d >= effectiveCloseDistance) {
                this._isOpen = false;
                this._setDirection(-1);
            }
        }

        // 끝에 도달했는지 직접 감시해서 정확히 그 지점에서 멈춘다(위 start()의 설명 참고).
        if (this.clipOpen) {
            const state = this._getState();
            if (state && state.isPlaying) {
                if (state.speed > 0 && state.time >= this.clipOpen.duration) {
                    state.setTime(this.clipOpen.duration);
                    state.sample();
                    state.stop();
                } else if (state.speed < 0 && state.time <= 0) {
                    state.setTime(0);
                    state.sample();
                    state.stop();
                }
            }
        }
    }

    private _getState(): AnimationState | null {
        if (!this._anim || !this.clipOpen) return null;
        return this._anim.getState(this.clipOpen.name);
    }

    /** dir=1(열림)/-1(닫힘)로 재생 방향을 바꾼다. 이미 재생 중이면 방향만 바꿔서 현재
     * 진행 위치에서 자연스럽게 이어지고, 멈춰있었다면(완전히 열렸거나 최초 상태) 새로
     * play()하되 — play()는 항상 time을 0(클립 시작점)으로 되돌리는 엔진 동작이라,
     * 역방향으로 새로 시작하는 경우에만 시작 위치를 클립 끝으로 보정해준다. */
    private _setDirection(dir: 1 | -1) {
        const state = this._getState();
        if (!state || !this.clipOpen) return;
        // 매번 확인 — Loop가 아니면(=start()가 아직 못 잡았으면) 여기서도 한 번 더 강제한다.
        if (state.wrapMode !== AnimationClip.WrapMode.Loop) state.wrapMode = AnimationClip.WrapMode.Loop;
        state.speed = dir;
        if (!state.isPlaying) {
            state.play();
            // play()는 항상 time을 0으로 되돌리므로, 역방향 시작은 클립 끝으로 다시 보정해야
            // 한다 — 그 직후 sample()까지 호출해 이번 프레임 바로 정확한 포즈를 반영한다.
            // (다음 프레임의 AnimationManager 갱신을 기다리지 않고 즉시 튐 없이 이어지게 함)
            state.setTime(dir < 0 ? this.clipOpen.duration : 0);
            state.sample();
        }
    }
}
