System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Camera, UITransform, Size, view, ResolutionPolicy, _dec, _dec2, _class, _crd, ccclass, executionOrder, UIAutoFit;

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
      ResolutionPolicy = _cc.ResolutionPolicy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "071cfs6gXlCP6R9IjaIU38Q", "UIAutoFit", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Camera', 'UITransform', 'Size', 'view', 'ResolutionPolicy']);

      ({
        ccclass,
        executionOrder
      } = _decorator);
      /**
       * UIAutoFit - 가로/세로 화면 모두 UI가 올바르게 표시되도록 화면 관련 값을 한 곳에서 관리한다.
       *
       * - 세로(portrait, aspect < 1): 720 단위 폭 고정
       * - 가로(landscape, aspect >= 1): 720 단위 높이 고정
       *
       * Canvas의 alignCanvasWithScreen은 반드시 꺼둬야 한다 — 켜두면 내장 로직이 다른 공식으로
       * 같은 값을 매 리사이즈마다 덮어써서 레이아웃이 널뛴다.
       */

      _export("UIAutoFit", UIAutoFit = (_dec = ccclass('UIAutoFit'), _dec2 = executionOrder(-200), _dec(_class = _dec2(_class = class UIAutoFit extends Component {
        constructor() {
          super(...arguments);
          this._camera = null;
          this._canvasNode = null;
          this._canvasUITransform = null;
          this._applying = false;
        }

        onLoad() {
          this._camera = this.getComponent(Camera);
          this._canvasNode = this.node.parent;

          if (this._canvasNode) {
            this._canvasUITransform = this._canvasNode.getComponent(UITransform);
          }

          this._updateLayout();

          view.on('canvas-resize', this._updateLayout, this);
        }

        onDestroy() {
          view.off('canvas-resize', this._updateLayout, this);
        }

        _updateLayout() {
          if (!this._camera || !this._canvasNode || !this._canvasUITransform) return;
          if (this._applying) return;
          var px = view.getVisibleSizeInPixel();
          if (px.width <= 0 || px.height <= 0) return;
          var aspect = px.width / px.height; // 세로: 너비 720 고정 → orthoH = 360 / aspect
          // 가로: 높이 720 고정 → orthoH = 360

          var orthoH = aspect < 1 ? 360 / aspect : 360;
          var canvasW = orthoH * aspect * 2;
          var canvasH = orthoH * 2;
          this._applying = true;

          try {
            this._camera.orthoHeight = orthoH; // Camera.convertToUINode()는 Canvas의 contentSize가 아니라 view.getVisibleSize()를
            // 기준으로 월드→UI 좌표를 계산한다. 엔진 디자인 해상도를 Canvas와 같은 값으로
            // 맞춰두지 않으면 체력바처럼 3D 위치를 따라다니는 UI가 화면비에 비례해 어긋난다.
            // canvasW:canvasH는 실제 화면비와 같으므로 레터박스는 생기지 않는다.

            view.setDesignResolutionSize(canvasW, canvasH, ResolutionPolicy.SHOW_ALL);
            this._canvasUITransform.contentSize = new Size(canvasW, canvasH); // convertToUINode의 결과는 "좌하단이 원점인 UI 월드공간" 좌표라서,
            // Canvas가 그 공간의 중심에 있어야 자식의 로컬 좌표로 올바르게 역변환된다.
            // (내장 alignCanvasWithScreen이 하던 일 — 끄면 아무도 안 해준다)

            var anchor = this._canvasUITransform.anchorPoint;

            this._canvasNode.setPosition(canvasW * anchor.x, canvasH * anchor.y, 0);
          } finally {
            this._applying = false;
          }
        }

      }) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9cf4bf9d996ac41f9cff796e0fb7ebfdc5a6462a.js.map