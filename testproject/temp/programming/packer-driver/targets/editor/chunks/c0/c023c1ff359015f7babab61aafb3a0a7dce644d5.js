System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, CameraFollow;

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
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4fd77EjZNtI1oeRfn4BooQm", "CameraFollow", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 카메라와 target(플레이어) 사이의 현재 오프셋을 유지한 채로 target을 따라간다 */

      _export("CameraFollow", CameraFollow = (_dec = ccclass('CameraFollow'), _dec2 = property(Node), _dec3 = property({
        displayName: '부드러운 추적',
        tooltip: '켜면 부드럽게 보간, 끄면 즉시 스냅'
      }), _dec4 = property({
        displayName: '추적 속도',
        tooltip: 'smooth가 켜졌을 때 초당 보간 비율. 클수록 빠르게 따라붙음'
      }), _dec(_class = (_class2 = class CameraFollow extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "target", _descriptor, this);

          _initializerDefineProperty(this, "smooth", _descriptor2, this);

          _initializerDefineProperty(this, "followSpeed", _descriptor3, this);

          this._offset = new Vec3();
          this._desired = new Vec3();
        }

        start() {
          if (!this.target) return; // 카메라가 바라보는 방향(고정, 회전 안 함)을 구해서 target이 그 시선의
          // 정중앙(=화면 중앙)에 오도록 오프셋을 계산한다. 높이차는 현재 배치된
          // 카메라 높이를 그대로 유지 — 즉 줌/구도는 그대로 두고 위치만 광선 위로 맞춘다.

          const forward = new Vec3();
          Vec3.transformQuat(forward, Vec3.FORWARD, this.node.worldRotation);
          const heightOffset = this.node.worldPosition.y - this.target.worldPosition.y;
          const k = heightOffset / -forward.y;
          Vec3.multiplyScalar(this._offset, forward, -k);
        }

        lateUpdate(dt) {
          if (!this.target) return;
          Vec3.add(this._desired, this.target.worldPosition, this._offset);

          if (this.smooth) {
            const t = 1 - Math.exp(-this.followSpeed * dt);
            Vec3.lerp(this._desired, this.node.worldPosition, this._desired, t);
          }

          this.node.setWorldPosition(this._desired);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "smooth", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followSpeed", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 8;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c023c1ff359015f7babab61aafb3a0a7dce644d5.js.map