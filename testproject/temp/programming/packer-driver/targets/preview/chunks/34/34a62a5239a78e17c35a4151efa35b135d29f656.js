System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Camera, UITransform, Size, view, _dec, _dec2, _class, _crd, ccclass, executionOrder, UIAutoFit;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Camera = _cc.Camera;
      UITransform = _cc.UITransform;
      Size = _cc.Size;
      view = _cc.view;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "071cfs6gXlCP6R9IjaIU38Q", "UIAutoFit", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Camera', 'UITransform', 'Size', 'view']);

      ({
        ccclass,
        executionOrder
      } = _decorator);
      /**
       * UIAutoFit - 가로/세로 화면 모두 UI가 올바르게 표시되도록 UICamera orthoHeight와
       * Canvas contentSize를 동적으로 조정합니다.
       *
       * - 세로(portrait, aspect < 1): 720 단위 폭 고정
       * - 가로(landscape, aspect >= 1): 720 단위 높이 고정
       */

      _export("UIAutoFit", UIAutoFit = (_dec = ccclass('UIAutoFit'), _dec2 = executionOrder(-200), _dec(_class = _dec2(_class = class UIAutoFit extends Component {
        constructor() {
          super(...arguments);
          this._camera = null;
          this._canvasUITransform = null;
        }

        onLoad() {
          this._camera = this.getComponent(Camera);
          var canvasNode = this.node.parent;

          if (canvasNode) {
            this._canvasUITransform = canvasNode.getComponent(UITransform);
          }

          this._updateLayout();

          view.on('canvas-resize', this._updateLayout, this);
        }

        onDestroy() {
          view.off('canvas-resize', this._updateLayout, this);
        }

        _updateLayout() {
          if (!this._camera || !this._canvasUITransform) return;
          var px = view.getVisibleSizeInPixel();
          if (px.width <= 0 || px.height <= 0) return;
          var aspect = px.width / px.height; // 세로: 너비 720 고정 → orthoH = 360 / aspect
          // 가로: 높이 720 고정 → orthoH = 360

          var orthoH = aspect < 1 ? 360 / aspect : 360;
          this._camera.orthoHeight = orthoH;
          var canvasW = orthoH * aspect * 2;
          var canvasH = orthoH * 2;
          this._canvasUITransform.contentSize = new Size(canvasW, canvasH);
        }

      }) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=34a62a5239a78e17c35a4151efa35b135d29f656.js.map