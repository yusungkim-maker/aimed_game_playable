import { _decorator, Component, Vec2, Vec3 } from 'cc';
import { Player } from './Player';
import { FollowerFormation } from './FollowerFormation';
const { ccclass, property } = _decorator;

/**
 * 추종 캐릭터를 대형(FollowerFormation)의 배정된 격자 슬롯으로 계속 이동시킨다.
 * 실제 이동/애니메이션/전투는 전부 Player.ts가 그대로 담당한다 — 이 컴포넌트는
 * Player.moveDirOverride에 "지금 슬롯으로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이다.
 */
@ccclass('FollowerMovement')
export class FollowerMovement extends Component {
    @property({ displayName: '도착 판정 거리(m)' })
    arriveDist: number = 0.25;

    private _player:    Player           | null = null;
    private _formation: FollowerFormation | null = null;
    private _slotIndex = -1;
    private _slotPos = new Vec3();

    /** Socket.ts가 스폰 직후 호출 */
    setup(formation: FollowerFormation) {
        this._formation = formation;
        this._slotIndex = formation.reserveSlot();
    }

    get slotIndex(): number { return this._slotIndex; }

    onLoad() {
        this._player = this.getComponent(Player);
    }

    onDestroy() {
        this._formation?.releaseSlot(this._slotIndex);
    }

    update() {
        if (!this._player || !this._formation || this._slotIndex < 0) return;

        this._formation.getSlotWorldPosition(this._slotIndex, this._slotPos);

        const p = this.node.worldPosition;
        const dx = this._slotPos.x - p.x;
        const dz = this._slotPos.z - p.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= this.arriveDist) {
            this._player.moveDirOverride = Vec2.ZERO;
            return;
        }

        // Player.ts 좌표계로 역변환: worldX = joyX, worldZ = -joyY
        const inv = 1 / dist;
        this._player.moveDirOverride = new Vec2(dx * inv, -dz * inv);
    }
}
