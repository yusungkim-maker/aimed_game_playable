import { _decorator, Component, Node, Camera, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/** 이 UI 노드를 3D 월드의 target 노드 위(offsetY)의 화면 위치에 매 프레임 고정시킨다 */
@ccclass('WorldUIAnchor')
export class WorldUIAnchor extends Component {
    @property(Node) target: Node | null = null;
    @property(Camera) worldCamera: Camera | null = null;

    @property({ displayName: '높이 오프셋', tooltip: 'target 위로 띄울 높이 (월드 단위)' })
    offsetY: number = 3;

    @property({ displayName: '화면 여백', tooltip: '화면 경계에서 이만큼 안쪽으로 clamp (px)' })
    screenMargin: number = 20;

    private _worldPos = new Vec3();
    private _uiPos = new Vec3();

    update() {
        if (!this.target || !this.worldCamera || !this.node.parent) return;

        Vec3.copy(this._worldPos, this.target.worldPosition);
        this._worldPos.y += this.offsetY;

        this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);

        const parentUI = this.node.parent.getComponent(UITransform);
        if (parentUI) {
            const halfW = parentUI.contentSize.width / 2 - this.screenMargin;
            const halfH = parentUI.contentSize.height / 2 - this.screenMargin;
            this._uiPos.x = Math.min(Math.max(this._uiPos.x, -halfW), halfW);
            this._uiPos.y = Math.min(Math.max(this._uiPos.y, -halfH), halfH);
        }

        this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
    }
}
