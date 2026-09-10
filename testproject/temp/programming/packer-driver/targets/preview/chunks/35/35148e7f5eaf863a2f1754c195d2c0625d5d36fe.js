System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Camera, view, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, executionOrder, CameraAspectFit;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Camera = _cc.Camera;
      view = _cc.view;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6b8970921xCR7G1MWFHfLX0", "CameraAspectFit", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Camera', 'view']);

      ({
        ccclass,
        property,
        executionOrder
      } = _decorator);
      /**
       * 화면 비율에 따라 3D 월드 카메라의 orthoHeight를 조정해서,
       * 세로 화면에서도 최소한의 좌우 시야(minHalfWidth)를 항상 확보한다.
       * 가로(넓은 화면)에서는 baseOrthoHeight가 그대로 유지되도록 값을 잡아야 한다.
       */

      _export("CameraAspectFit", CameraAspectFit = (_dec = ccclass('CameraAspectFit'), _dec2 = executionOrder(-200), _dec3 = property({
        displayName: '기본 orthoHeight',
        tooltip: '가로 화면 기준 카메라 orthoHeight (기존 값 유지용)'
      }), _dec4 = property({
        displayName: '최소 좌우 시야(절반 폭)',
        tooltip: '세로 화면에서도 이만큼의 월드 절반 폭이 보이도록 보장'
      }), _dec(_class = _dec2(_class = (_class2 = class CameraAspectFit extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "baseOrthoHeight", _descriptor, this);

          _initializerDefineProperty(this, "minHalfWidth", _descriptor2, this);

          this._camera = null;

          this._updateOrthoHeight = () => {
            if (!this._camera) return;
            var px = view.getVisibleSizeInPixel();
            if (px.width <= 0 || px.height <= 0) return;
            var aspect = px.width / px.height;
            this._camera.orthoHeight = Math.max(this.baseOrthoHeight, this.minHalfWidth / aspect);
          };
        }

        onLoad() {
          this._camera = this.getComponent(Camera);

          this._updateOrthoHeight();

          view.on('canvas-resize', this._updateOrthoHeight, this);
        }

        onDestroy() {
          view.off('canvas-resize', this._updateOrthoHeight, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "baseOrthoHeight", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "minHalfWidth", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 18;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=35148e7f5eaf863a2f1754c195d2c0625d5d36fe.js.map