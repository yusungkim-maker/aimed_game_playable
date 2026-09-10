import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/** 카메라와 target(플레이어) 사이의 현재 오프셋을 유지한 채로 target을 따라간다 */
@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node) target: Node | null = null;

    @property({ displayName: '부드러운 추적', tooltip: '켜면 부드럽게 보간, 끄면 즉시 스냅' })
    smooth: boolean = true;

    @property({ displayName: '추적 속도', tooltip: 'smooth가 켜졌을 때 초당 보간 비율. 클수록 빠르게 따라붙음' })
    followSpeed: number = 8;

    private _offset = new Vec3();
    private _desired = new Vec3();

    start() {
        if (!this.target) return;

        // 카메라가 바라보는 방향(고정, 회전 안 함)을 구해서 target이 그 시선의
        // 정중앙(=화면 중앙)에 오도록 오프셋을 계산한다. 높이차는 현재 배치된
        // 카메라 높이를 그대로 유지 — 즉 줌/구도는 그대로 두고 위치만 광선 위로 맞춘다.
        const forward = new Vec3();
        Vec3.transformQuat(forward, Vec3.FORWARD, this.node.worldRotation);

        const heightOffset = this.node.worldPosition.y - this.target.worldPosition.y;
        const k = heightOffset / -forward.y;
        Vec3.multiplyScalar(this._offset, forward, -k);
    }

    lateUpdate(dt: number) {
        if (!this.target) return;

        Vec3.add(this._desired, this.target.worldPosition, this._offset);

        if (this.smooth) {
            const t = 1 - Math.exp(-this.followSpeed * dt);
            Vec3.lerp(this._desired, this.node.worldPosition, this._desired, t);
        }

        this.node.setWorldPosition(this._desired);
    }
}
