import { _decorator, Component, Node, Vec3, Quat, NodeSpace } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import type { CoinPool } from './CoinPool';
import type { CoinStackTarget } from './CoinStack';
const { ccclass } = _decorator;

/**
 * CoinPool이 activate() 시 넘겨주는 동작 튜닝 값 묶음. 코인은 런타임에 addComponent()로
 * 붙기 때문에 이 컴포넌트 자체엔 인스펙터에 남는 프로퍼티가 없다 — 실제 조정은 항상
 * CoinPool 쪽 인스펙터에서 한다.
 */
export interface CoinTuning {
    spinSpeed:          number; // deg/sec, 자전 속도
    bobHeight:          number; // 대기 중 상하 진폭(m)
    bobSpeed:           number; // 대기 중 상하 진동 속도
    collectEaseRate:    number; // 자석에 끌릴 때 남은 거리를 좁히는 속도 계수(클수록 빠르게 수렴 — 처음엔 빠르고 도착할수록 느려짐)
    collectMinSpeed:    number; // 최소 수집 속도(m/s) — 거리 비례 속도(collectEaseRate)의 하한선. 이게 없으면
                                 // 캐릭터가 계속 이동할 때 "거리가 줄어드는 속도"가 캐릭터 이동 속도에 못 미쳐
                                 // 코인이 목표(등 뒤 스택 자리)를 영원히 따라잡지 못하고 일정 거리 뒤에 붕 뜬 채로
                                 // 남는 문제가 생긴다 — 이 하한선이 캐릭터의 최대 이동 속도보다 커야 함을 보장한다.
    collectArcHeight:   number; // 자석에 끌려가는 동안 위로 볼록하게 그리는 곡선의 높이(m)
    collectArriveDist:  number; // 이 거리 이내면 수집 완료 처리
    popHeight:          number; // 스폰 시 튀어오르는 최고 높이(m)
    popDuration:        number; // 스폰~착지까지 걸리는 시간(초)
    popScatterFactor:   number; // 착지 지점의 랜덤 수평 스캐터 최대 반경(m). 0이면 제자리에서 위로만 튐
    groundY:            number; // 착지 후 정착하는 월드 Y (코인 두께 때문에 0보다 살짝 위)
    groundRotationX:    number; // 착지 시 적용할 로컬 X 회전(도). 코인이 세워진 채로 임포트되어 눕히려면 음수
}

type Phase = 'pop' | 'idle' | 'collecting';

/**
 * 드롭된 코인 하나의 동작. 애니메이션 클립 없이 update()에서 코드로만 처리한다.
 *
 * 1. pop: 스폰 지점에서 scale 0 → 1로 커지며, 랜덤한 수평 방향으로 살짝 스캐터된 착지
 *    지점까지 포물선(이차 베지어 호 — 실제 중력처럼 위로 솟았다가 떨어짐)을 그리며 낙하한다.
 *    이 동안은 자석 반경의 영향을 받지 않는다. 착지 순간 groundY/groundRotationX로 자세를 고정한다.
 * 2. idle: 착지 후 제자리 통통 튐. 플레이어와의 자석 반경 진입을 감시한다.
 * 3. collecting: 진입 즉시 CoinStack에 다음 빈 슬롯을 예약해두고, 캐릭터가 아니라 그 슬롯의
 *    (매 프레임 갱신되는) 월드 좌표를 향해 끌려간다. 직선이 아니라 남은 거리에 비례해서
 *    매 프레임 조금씩 다가가는 지수 감쇠 방식으로 이동해 "처음엔 빠르고 도착할수록 느려지는"
 *    느낌을 내고, 그 위에 위로 볼록한 곡선(포물선) 오프셋을 더해 곡선 궤적을 그린다.
 *    도달하면 CoinCollected를 emit하고 풀로 반환된다 — CoinStack이 그 이벤트를 받아
 *    같은 자리에 실제 스택 비주얼을 세운다.
 */
@ccclass('Coin')
export class Coin extends Component {
    private _pool:   CoinPool  | null = null;
    private _target: Node     | null = null;
    private _stack:  CoinStackTarget | null = null;
    private _tuning!: CoinTuning;

    /** 이 코인이 collecting 단계에서 향하고 있는(또는 향했던) 스택. CoinStack/CoinGroundStack이
     * CoinCollected 수신 시 "이 코인이 정말 나를 향한 것이었는지" 구분하는 데 쓴다. */
    get stack(): CoinStackTarget | null { return this._stack; }

    private _phase: Phase = 'idle';
    private _magnetRadiusSq = 0;
    private _baseY = 0;
    private _bobPhase = 0;
    private _spinDelta = new Quat();
    private _stackSlot = -1;
    private _chaseTarget = new Vec3();
    private _chaseDir = new Vec3();
    private _collectPos = new Vec3();       // 곡선 오프셋을 뺀 순수 추적 위치 (렌더링용 실제 위치와 분리)
    private _collectInitialDist = 0.0001;   // 수집 시작 시점의 거리 — 곡선 진행도 계산용

    private _popTimer = 0;
    private _popStartPos  = new Vec3(); // 스폰 시작 지점
    private _popGroundPos = new Vec3(); // 착지 지점 (스캐터 오프셋 적용된 XZ)

    /** CoinPool이 풀에서 꺼내 스폰할 때 호출. stack은 없어도(null) 동작하되, 그 경우 플레이어 위치로 수집된다 */
    activate(pos: Vec3, target: Node, magnetRadius: number, pool: CoinPool, tuning: CoinTuning, stack: CoinStackTarget | null) {
        this._target = target;
        this._stack = stack;
        this._stackSlot = -1;
        this._magnetRadiusSq = magnetRadius * magnetRadius;
        this._pool = pool;
        this._tuning = tuning;
        this._bobPhase = Math.random() * Math.PI * 2;

        // 위로만 튀지 않고 랜덤한 수평 방향/거리로도 스캐터 (popScatterFactor로 정도 조절)
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * tuning.popScatterFactor;
        this._popStartPos.set(pos);
        this._popGroundPos.set(pos.x + Math.cos(angle) * dist, pos.y, pos.z + Math.sin(angle) * dist);

        this.node.setWorldPosition(this._popStartPos);
        this.node.setScale(0, 0, 0);
        this.node.setRotationFromEuler(0, Math.random() * 360, 0);
        this.node.active = true;

        this._phase = 'pop';
        this._popTimer = 0;

        CoinEvents.emit(CoinEventName.CoinSpawned, this);
    }

    update(dt: number) {
        // 자전은 모든 단계에서 항상 재생. WORLD 공간 기준으로 돌려야 착지 후 눕혀진(X=-90)
        // 상태에서도 로컬축이 뒤틀리지 않고 계속 수직축(월드 Y) 기준으로 자연스럽게 회전한다.
        Quat.fromAxisAngle(this._spinDelta, Vec3.UP, this._tuning.spinSpeed * dt * Math.PI / 180);
        this.node.rotate(this._spinDelta, NodeSpace.WORLD);

        if (this._phase === 'pop') { this._updatePop(dt); return; }

        if (!this._target || !this._target.isValid) return;

        if (this._phase === 'idle') {
            // 대기: 통통 튐 + 자석 반경 진입 체크 (착지 전에는 이 분기 자체를 안 탐)
            this._bobPhase += dt * this._tuning.bobSpeed;
            const p = this.node.worldPosition;
            this.node.setWorldPosition(p.x, this._baseY + Math.sin(this._bobPhase) * this._tuning.bobHeight, p.z);

            if (Vec3.squaredDistance(this.node.worldPosition, this._target.worldPosition) <= this._magnetRadiusSq) {
                this._phase = 'collecting';
                this._stackSlot = this._stack?.reserveSlot() ?? -1;
                this._collectPos.set(this.node.worldPosition);
                this._resolveChaseTarget();
                this._collectInitialDist = Math.max(0.0001, Vec3.distance(this._collectPos, this._chaseTarget));
            }
            return;
        }

        // collecting: 플레이어가 아니라 예약된 코인 탑의 다음 자리(있다면)를 향해 이동.
        // "순수 추적 위치(_collectPos)"는 곡선 오프셋 없이 목표를 향해 다가가고(남은 거리에
        // 비례하는 속도 + 최소 속도 하한 중 큰 쪽을 사용 — 비례 속도만 쓰면 목표 자체가 계속
        // 움직일 때 결코 따라잡지 못하고 일정 거리 뒤에서 붕 뜬 채로 남는 문제가 있었다),
        // 실제로 화면에 그리는 위치에만 위로 볼록한 포물선 오프셋을 더해 곡선처럼 보이게 한다.
        this._resolveChaseTarget();

        const dist = Vec3.distance(this._collectPos, this._chaseTarget);
        if (dist <= this._tuning.collectArriveDist) { this._onCollected(); return; }

        const speed = Math.max(dist * this._tuning.collectEaseRate, this._tuning.collectMinSpeed);
        const step = Math.min(dist, speed * dt); // 목표를 지나치지 않도록 남은 거리로 클램프
        Vec3.subtract(this._chaseDir, this._chaseTarget, this._collectPos);
        Vec3.normalize(this._chaseDir, this._chaseDir);
        Vec3.scaleAndAdd(this._collectPos, this._collectPos, this._chaseDir, step);

        const progress = 1 - Math.min(1, dist / this._collectInitialDist);
        const arc = 4 * this._tuning.collectArcHeight * progress * (1 - progress);
        this.node.setWorldPosition(this._collectPos.x, this._collectPos.y + arc, this._collectPos.z);
    }

    /** 예약된 코인 탑 슬롯이 있으면 그 슬롯의 실시간 월드 좌표를, 없으면 플레이어 위치를 _chaseTarget에 채운다 */
    private _resolveChaseTarget() {
        if (this._stack && this._stackSlot >= 0) {
            this._stack.getSlotWorldPosition(this._stackSlot, this._chaseTarget);
        } else {
            Vec3.copy(this._chaseTarget, this._target!.worldPosition);
        }
    }

    private _updatePop(dt: number) {
        this._popTimer += dt;
        const dur = Math.max(0.0001, this._tuning.popDuration);
        const t = Math.min(1, this._popTimer / dur);

        // 스케일: 0 → 1, ease-out(초반에 빠르게 팝) — t=1에서 정확히 1.0
        const s = 1 - Math.pow(1 - t, 3);
        this.node.setScale(s, s, s);

        // XZ: 시작점 → 착지점 선형 보간. Y: 대칭 이차 베지어(=포물선) 호로 t=0.5에서 popHeight만큼
        // 솟았다가 다시 떨어짐 — 등속이 아니라 실제 중력처럼 위에서 느려지고 아래서 빨라짐.
        const x = this._popStartPos.x + (this._popGroundPos.x - this._popStartPos.x) * t;
        const z = this._popStartPos.z + (this._popGroundPos.z - this._popStartPos.z) * t;
        const arc = 4 * this._tuning.popHeight * t * (1 - t);
        this.node.setWorldPosition(x, this._popStartPos.y + arc, z);

        if (t >= 1) {
            this._phase = 'idle';
            this._baseY = this._tuning.groundY;
            // 착지 순간 최종 자세 고정: 두께 보정된 groundY + 눕혀진 X 회전.
            // 자전으로 쌓여있던 Y축 헤딩(euler.y)은 그대로 유지해 부자연스러운 스냅이 없게 한다.
            this.node.setWorldPosition(x, this._tuning.groundY, z);
            const heading = this.node.eulerAngles.y;
            this.node.setRotationFromEuler(this._tuning.groundRotationX, heading, 0);
        }
    }

    private _onCollected() {
        CoinEvents.emit(CoinEventName.CoinCollected, this);
        this._target = null;
        this._stack = null;
        this._pool?.despawn(this.node);
    }
}
