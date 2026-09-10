System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Vec3, Player, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, FollowerMovement;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerFormation(extras) {
    _reporterNs.report("FollowerFormation", "./FollowerFormation", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      Player = _unresolved_2.Player;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "887a1wG40lB2bqQHLYW01+y", "FollowerMovement", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec2', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 추종 캐릭터를 대형(FollowerFormation)의 배정된 격자 슬롯으로 계속 이동시킨다.
       * 실제 이동/애니메이션/전투는 전부 Player.ts가 그대로 담당한다 — 이 컴포넌트는
       * Player.moveDirOverride에 "지금 슬롯으로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이다.
       */

      _export("FollowerMovement", FollowerMovement = (_dec = ccclass('FollowerMovement'), _dec2 = property({
        displayName: '도착 판정 거리(m)'
      }), _dec(_class = (_class2 = class FollowerMovement extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "arriveDist", _descriptor, this);

          this._player = null;
          this._formation = null;
          this._slotIndex = -1;
          this._slotPos = new Vec3();
        }

        /** Socket.ts가 스폰 직후 호출 */
        setup(formation) {
          this._formation = formation;
          this._slotIndex = formation.reserveSlot();
        }

        get slotIndex() {
          return this._slotIndex;
        }

        onLoad() {
          this._player = this.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player);
        }

        onDestroy() {
          var _this$_formation;

          (_this$_formation = this._formation) == null || _this$_formation.releaseSlot(this._slotIndex);
        }

        update() {
          if (!this._player || !this._formation || this._slotIndex < 0) return;

          this._formation.getSlotWorldPosition(this._slotIndex, this._slotPos);

          const p = this.node.worldPosition;
          const dx = this._slotPos.x - p.x;
          const dz = this._slotPos.z - p.z;
          const dist = Math.hypot(dx, dz);

          if (dist <= this.arriveDist) {
            this._player.moveDirOverride = Vec2.ZERO;
            return;
          } // Player.ts 좌표계로 역변환: worldX = joyX, worldZ = -joyY


          const inv = 1 / dist;
          this._player.moveDirOverride = new Vec2(dx * inv, -dz * inv);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "arriveDist", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.25;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=edb08dc2045c74d5e495dccf80ddcd5900d9c2ef.js.map