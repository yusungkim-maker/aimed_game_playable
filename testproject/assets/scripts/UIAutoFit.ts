import { _decorator, Component, Camera, UITransform, Size, view } from 'cc';
const { ccclass, executionOrder } = _decorator;

/**
 * UIAutoFit - 가로/세로 화면 모두 UI가 올바르게 표시되도록 UICamera orthoHeight와
 * Canvas contentSize를 동적으로 조정합니다.
 *
 * - 세로(portrait, aspect < 1): 720 단위 폭 고정
 * - 가로(landscape, aspect >= 1): 720 단위 높이 고정
 */
@ccclass('UIAutoFit')
@executionOrder(-200)
export class UIAutoFit extends Component {
    private _camera: Camera | null = null;
    private _canvasUITransform: UITransform | null = null;

    onLoad() {
        this._camera = this.getComponent(Camera);
        const canvasNode = this.node.parent;
        if (canvasNode) {
            this._canvasUITransform = canvasNode.getComponent(UITransform);
        }
        this._updateLayout();
        view.on('canvas-resize', this._updateLayout, this);
    }

    onDestroy() {
        view.off('canvas-resize', this._updateLayout, this);
    }

    private _updateLayout() {
        if (!this._camera || !this._canvasUITransform) return;

        const px = view.getVisibleSizeInPixel();
        if (px.width <= 0 || px.height <= 0) return;

        const aspect = px.width / px.height;

        // 세로: 너비 720 고정 → orthoH = 360 / aspect
        // 가로: 높이 720 고정 → orthoH = 360
        const orthoH = aspect < 1 ? 360 / aspect : 360;
        this._camera.orthoHeight = orthoH;

        const canvasW = orthoH * aspect * 2;
        const canvasH = orthoH * 2;
        this._canvasUITransform.contentSize = new Size(canvasW, canvasH);
    }
}
