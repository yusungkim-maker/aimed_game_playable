import { _decorator, Component, Node, Camera, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 몬스터 머리 위에 뜨는 체력바 하나의 표시 로직. MonsterHealthBarManager가 풀에서 꺼내 재사용하는
 * 인스턴스에 붙어있다 — 매 프레임 target(몬스터) 위쪽의 화면 좌표를 계산해 스스로를 그 자리로
 * 옮기고, target이 카메라 뒤에 있거나 사라졌으면 자동으로 숨긴다.
 * WorldUIAnchor(플레이어 체력바용)와 달리 화면 가장자리로 clamp하지 않는다 — 몬스터가 화면
 * 밖으로 나가면 그냥 안 보이는 게 맞고, 가장자리에 들러붙어 쌓이면 오히려 지저분해지기 때문.
 */
@ccclass('MonsterHpBarView')
export class MonsterHpBarView extends Component {
    @property(Camera) worldCamera: Camera | null = null;
    @property(Sprite) fillSprite: Sprite | null = null;

    @property({ displayName: '높이 오프셋', tooltip: 'target 위로 띄울 높이 (월드 단위, 몬스터 스케일 적용 전 기준)' })
    offsetY: number = 1.2;

    /** 따라다닐 몬스터 노드. MonsterHealthBar가 acquire 직후 설정한다 */
    target: Node | null = null;

    private _worldPos = new Vec3();
    private _uiPos = new Vec3();
    private _camToTarget = new Vec3();

    setRatio(ratio: number) {
        if (this.fillSprite) this.fillSprite.fillRange = Math.max(0, Math.min(1, ratio));
    }

    update() {
        if (!this.target || !this.target.isValid || !this.worldCamera || !this.node.parent) {
            this.node.active = false;
            return;
        }

        // 카메라 뒤쪽에 있으면(이론상 드묾 — 탑다운 카메라라도 안전하게) 표시하지 않는다.
        Vec3.subtract(this._camToTarget, this.target.worldPosition, this.worldCamera.node.worldPosition);
        if (Vec3.dot(this._camToTarget, this.worldCamera.node.forward) <= 0) {
            this.node.active = false;
            return;
        }

        this.node.active = true;
        Vec3.copy(this._worldPos, this.target.worldPosition);
        // offsetY는 "스케일 1 기준" 높이다 — 몬스터마다 스폰 스케일이 다르므로(기본 몬스터
        // 0.5, 보스 1.5 등) 실제 월드 오프셋도 그 스케일만큼 같이 줄어들거나 늘어나야 머리
        // 위 적당한 자리에 뜬다. 이걸 고정값으로 두면 작은 몬스터일수록 체력바가 실제 몸통보다
        // 훨씬 위로 떠서, 카메라 화각(특히 화면 비율이 좁은 데스크톱 와이드 화면)에 따라
        // 화면 밖으로 완전히 벗어나 아예 안 보이는 현상이 생긴다.
        this._worldPos.y += this.offsetY * this.target.worldScale.y;
        this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);
        this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
    }
}
