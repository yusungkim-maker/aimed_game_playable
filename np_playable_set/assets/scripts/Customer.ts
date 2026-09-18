import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { Player } from './Player';
const { ccclass } = _decorator;

/** 손님이 지금 무엇을 하고 있는지. */
export enum CustomerState {
    /** 줄에서 자기 자리로 걸어가는 중 (앞사람이 빠지면 자리가 앞으로 당겨진다) */
    ToSlot,
    /** 줄 맨 앞에 서서 판매를 기다리는 중 */
    AtFront,
    /** 사고 나서 온 길을 되돌아 나가는 중 — 끝점에 닿으면 사라진다 */
    Leaving,
}

/**
 * 상점에 줄을 서서 칼을 사 가는 손님 한 명.
 *
 * **줄 관리와 판매 판정은 여기서 하지 않는다** — `CustomerSpawner`가 줄 전체를 들고 있고 매
 * 프레임 "너는 지금 여기로 가라"만 알려준다. 손님 개체가 스스로 줄을 살피게 만들면 개체마다
 * 다른 개체를 훑어야 해서 인원수의 제곱이 되고(O(n²)), "한 번에 한 명만 판매"라는 규칙도 개체
 * 쪽에서는 지킬 수가 없다.
 *
 * 이동·회전·걷기 애니메이션도 직접 구현하지 않는다 — `CoinCourier`와 똑같이
 * `Player.moveDirOverride`에 방향만 넣고 나머지는 `Player.ts`가 처리한다. 그래서 손님의 걸음이
 * 플레이어·일꾼과 완전히 같은 코드로 나온다.
 */
@ccclass('Customer')
export class Customer extends Component {
    /** 지금 향해야 하는 월드 위치. 스포너가 매 프레임 갱신한다. */
    target = new Vec3();
    /** 이 거리 안에 들어오면 도착으로 본다. 스포너가 스폰 시 넣어준다. */
    arriveDist = 0.25;
    state = CustomerState.ToSlot;
    /** 스포너가 "너는 줄의 몇 번째"를 넣어둔다 — 0이 맨 앞. 디버깅과 정렬에만 쓴다. */
    slot = -1;
    /** 멈춰 서 있을 때 바라볼 대상(상점). 스포너가 넣어준다. null이면 마지막 걸음 방향을 유지한다. */
    lookAt: Node | null = null;

    private _player: Player | null = null;
    /** 이번 프레임에 걸었는지 — 걷는 중에는 Player가 회전을 맡으므로 바라보기를 건너뛴다. */
    private _moving = false;

    /** 이번 프레임에 목표에 닿았는지. 스포너가 이 값으로 상태를 넘긴다. */
    get arrived(): boolean {
        const p = this.node.worldPosition;
        const dx = this.target.x - p.x;
        const dz = this.target.z - p.z;
        return Math.hypot(dx, dz) <= this.arriveDist;
    }

    onLoad() {
        this._player = this.getComponent(Player);
        // 손님은 전투를 하지 않는다. 이 스위치를 끄면 Player.update가 타깃 탐색 자체를
        // 건너뛰므로 지나가다 나무를 때리거나 공격 자세를 잡는 일이 없다.
        if (this._player) this._player.combatEnabled = false;
    }

    update() {
        if (!this._player) return;
        this._moving = false;

        const p = this.node.worldPosition;
        const dx = this.target.x - p.x;
        const dz = this.target.z - p.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= this.arriveDist) {
            this._player.moveDirOverride = Vec2.ZERO;
            return;
        }
        this._moving = true;
        // Player.ts의 조이스틱 좌표계: worldX = joyX, worldZ = -joyY (CoinCourier와 같은 변환)
        const inv = 1 / dist;
        this._player.moveDirOverride = new Vec2(dx * inv, -dz * inv);
    }

    /**
     * 멈춰 있을 때만 상점 쪽으로 몸을 돌린다.
     *
     * **`lateUpdate`인 이유**: 걷는 동안의 회전은 `Player.update`가 이동 방향으로 매 프레임
     * 덮어쓴다. `update`에서 돌리면 같은 프레임에 지워진다(CharacterBob이 루트 본에서 겪은
     * 것과 같은 순서 문제다). 멈춘 프레임에는 Player가 회전을 건드리지 않으므로 여기서 준
     * 값이 그대로 남는다.
     */
    lateUpdate() {
        if (this._moving || !this.lookAt || !this.lookAt.isValid) return;
        const p = this.node.worldPosition;
        const t = this.lookAt.worldPosition;
        const dx = t.x - p.x;
        const dz = t.z - p.z;
        if (dx * dx + dz * dz < 0.0001) return;
        // Player가 쓰는 것과 같은 규약: +Z가 앞이라 atan2(x, z)로 yaw를 낸다.
        this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
    }
}
