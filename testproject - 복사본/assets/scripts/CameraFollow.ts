import { _decorator, Component, Node, Vec3, Camera, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

/** 카메라와 target(플레이어) 사이의 현재 오프셋을 유지한 채로 target을 따라간다.
 * 엔딩에서는 playEndingZoom()으로 추적 대상을 기지로 바꾸고 천천히 줌아웃한다. */
@ccclass('CameraFollow')
export class CameraFollow extends Component {
    /** 엔딩 연출에서 GameManager가 찾아 쓰기 위한 참조 — 인스펙터로 연결할 필요가 없도록
     * MonsterHealthBarManager/AudioManager와 같은 싱글턴 패턴을 따른다 */
    static instance: CameraFollow | null = null;

    @property(Node) target: Node | null = null;

    @property({ displayName: '부드러운 추적', tooltip: '켜면 부드럽게 보간, 끄면 즉시 스냅' })
    smooth: boolean = true;

    @property({ type: CCFloat, displayName: '추적 속도', tooltip: 'smooth가 켜졌을 때 초당 보간 비율. 클수록 빠르게 따라붙음' })
    followSpeed: number = 8;

    private _offset = new Vec3();
    private _desired = new Vec3();

    // ── 엔딩 줌아웃 ───────────────────────────────────────────────────────
    private _cam: Camera | null = null;
    private _zooming = false;
    private _zoomTimer = 0;
    private _zoomDuration = 0;
    private _orthoFrom = 0;
    private _orthoTo = 0;
    /** 원근 카메라일 때만 쓰는 오프셋(=카메라 거리) 배율 */
    private _offsetFrom = 1;
    private _offsetTo = 1;
    private _baseOffset = new Vec3();
    /** 엔딩에서 화면 구도를 잡기 위해 추적 지점에 더하는 월드 오프셋 */
    private _endingOffset = new Vec3();

    onLoad() { CameraFollow.instance = this; }
    onDestroy() { if (CameraFollow.instance === this) CameraFollow.instance = null; }

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
        Vec3.copy(this._baseOffset, this._offset);
    }

    /** 엔딩 연출 — 추적 대상을 기지로 바꾸고 duration초에 걸쳐 zoomMult배만큼 줌아웃한다.
     *
     * 직교(Ortho) 카메라는 뒤로 물러나도 보이는 범위가 그대로라 orthoHeight를 키워야 하고,
     * 원근(Perspective) 카메라는 반대로 orthoHeight가 의미 없으니 카메라를 뒤로 뺀다 —
     * 둘 중 무엇으로 설정돼 있든 같은 결과가 나오도록 투영 방식을 보고 갈라서 처리한다.
     *
     * @param offset 기지 위치에 더해서 최종 구도를 잡는 월드 오프셋. 줌아웃하면 기지가 화면
     *               한쪽으로 치우치는데, 이 값으로 카메라를 밀어 원하는 자리에 오게 맞춘다.
     *               부드러운 추적 보간을 그대로 타므로 툭 튀지 않고 미끄러지듯 옮겨간다. */
    playEndingZoom(target: Node | null, zoomMult: number, duration: number, followSpeed: number, offset: Vec3) {
        if (target) this.target = target;
        this.followSpeed = followSpeed;
        Vec3.copy(this._endingOffset, offset);

        this._cam = this.getComponent(Camera);
        this._zoomTimer = 0;
        this._zoomDuration = Math.max(0.0001, duration);
        this._zooming = true;

        if (this._cam && this._cam.projection === Camera.ProjectionType.ORTHO) {
            this._orthoFrom = this._cam.orthoHeight;
            this._orthoTo = this._cam.orthoHeight * zoomMult;
            this._offsetFrom = this._offsetTo = 1;
        } else {
            this._orthoFrom = this._orthoTo = 0;
            this._offsetFrom = 1;
            this._offsetTo = zoomMult;
        }
    }

    lateUpdate(dt: number) {
        if (this._zooming) this._updateZoom(dt);
        if (!this.target) return;

        Vec3.add(this._desired, this.target.worldPosition, this._offset);
        Vec3.add(this._desired, this._desired, this._endingOffset);

        if (this.smooth) {
            const t = 1 - Math.exp(-this.followSpeed * dt);
            Vec3.lerp(this._desired, this.node.worldPosition, this._desired, t);
        }

        this.node.setWorldPosition(this._desired);
    }

    private _updateZoom(dt: number) {
        this._zoomTimer += dt;
        const raw = Math.min(1, this._zoomTimer / this._zoomDuration);
        // ease-out — 처음엔 빠르게 벌어지다 끝에서 부드럽게 멈춘다
        const t = 1 - (1 - raw) * (1 - raw);

        if (this._orthoTo > 0 && this._cam) {
            this._cam.orthoHeight = this._orthoFrom + (this._orthoTo - this._orthoFrom) * t;
        } else {
            const mult = this._offsetFrom + (this._offsetTo - this._offsetFrom) * t;
            Vec3.multiplyScalar(this._offset, this._baseOffset, mult);
        }

        if (raw >= 1) this._zooming = false;
    }
}
