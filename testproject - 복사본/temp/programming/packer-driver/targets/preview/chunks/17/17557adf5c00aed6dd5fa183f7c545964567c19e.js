System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, CCFloat, tween, Tween, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, PulseScale;

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
      Vec3 = _cc.Vec3;
      CCFloat = _cc.CCFloat;
      tween = _cc.tween;
      Tween = _cc.Tween;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7ecfdRju6FBeIK40XZ+IZac", "PulseScale", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'CCFloat', 'tween', 'Tween']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 노드를 커졌다 작아졌다 계속 반복시키는 강조 모션. CTA 버튼처럼 "여기를 눌러라"를
       * 알려야 하는 UI에 붙인다.
       *
       * 기준 크기는 인스펙터에 박아둔 숫자가 아니라 **노드가 원래 갖고 있던 스케일**이다 —
       * 버튼 크기를 나중에 바꿔도 배율만 곱해지므로 모션을 다시 손볼 필요가 없다.
       *
       * onEnable에서 시작하고 onDisable에서 멈춘다. CTA 패널처럼 평소엔 꺼져 있다가 켜지는
       * 노드에 붙이면, 켜지는 순간부터 알아서 뛰기 시작한다.
       */

      _export("PulseScale", PulseScale = (_dec = ccclass('PulseScale'), _dec2 = property({
        type: CCFloat,
        displayName: '최소 배율',
        tooltip: '가장 작을 때의 크기 배율. 1이면 원래 크기'
      }), _dec3 = property({
        type: CCFloat,
        displayName: '최대 배율',
        tooltip: '가장 클 때의 크기 배율. 1.05~1.15 정도가 과하지 않게 눈에 띈다'
      }), _dec4 = property({
        type: CCFloat,
        displayName: '한 주기(초)',
        tooltip: '커졌다 다시 작아지기까지 걸리는 시간. 짧을수록 조급해 보이고, 길수록 은은하다'
      }), _dec5 = property({
        displayName: '이징',
        tooltip: 'cc.tween의 easing 이름. sineInOut = 숨쉬듯 부드럽게(기본), quadOut / backOut 등도 쓸 수 있다. 잘못된 이름을 넣으면 엔진이 경고하고 linear로 동작한다'
      }), _dec(_class = (_class2 = class PulseScale extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "minScale", _descriptor, this);

          _initializerDefineProperty(this, "maxScale", _descriptor2, this);

          _initializerDefineProperty(this, "period", _descriptor3, this);

          _initializerDefineProperty(this, "easing", _descriptor4, this);

          /** 노드가 원래 갖고 있던 스케일 — 여기에 배율을 곱한다 */
          this._base = new Vec3(1, 1, 1);
          this._captured = false;
        }

        onEnable() {
          // 기준 스케일은 최초 1회만 잡는다. onDisable에서 원래 크기로 되돌려 놓으므로
          // 다시 켜졌을 때 또 잡아도 값은 같지만, 혹시 트윈 도중에 꺼졌다면 그때의
          // 어중간한 크기를 기준으로 삼게 되므로 한 번만 잡는 편이 안전하다.
          if (!this._captured) {
            Vec3.copy(this._base, this.node.scale);
            this._captured = true;
          }

          this._start();
        }

        onDisable() {
          Tween.stopAllByTarget(this.node);
          this.node.setScale(this._base);
        }

        _start() {
          Tween.stopAllByTarget(this.node);
          var b = this._base;
          var lo = new Vec3(b.x * this.minScale, b.y * this.minScale, b.z * this.minScale);
          var hi = new Vec3(b.x * this.maxScale, b.y * this.maxScale, b.z * this.maxScale);
          var half = Math.max(0.01, this.period) / 2;
          this.node.setScale(lo);
          tween(this.node).to(half, {
            scale: hi
          }, {
            easing: this.easing
          }).to(half, {
            scale: lo
          }, {
            easing: this.easing
          }).union().repeatForever().start();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "minScale", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxScale", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.08;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "period", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.7;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "easing", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'sineInOut';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=17557adf5c00aed6dd5fa183f7c545964567c19e.js.map