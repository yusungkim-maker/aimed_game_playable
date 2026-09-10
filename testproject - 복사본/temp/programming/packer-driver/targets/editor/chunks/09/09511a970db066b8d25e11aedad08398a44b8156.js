System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, VirtualWall, StructureHealthBar, StructureHitFlash, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _class3, _crd, ccclass, property, DoorHealth;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfVirtualWall(extras) {
    _reporterNs.report("VirtualWall", "./VirtualWall", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStructureHealthBar(extras) {
    _reporterNs.report("StructureHealthBar", "./StructureHealthBar", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStructureHitFlash(extras) {
    _reporterNs.report("StructureHitFlash", "./StructureHitFlash", _context.meta, extras);
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
    }, function (_unresolved_2) {
      VirtualWall = _unresolved_2.VirtualWall;
    }, function (_unresolved_3) {
      StructureHealthBar = _unresolved_3.StructureHealthBar;
    }, function (_unresolved_4) {
      StructureHitFlash = _unresolved_4.StructureHitFlash;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1c5725F7xdFcYnc5ZOSQZUd", "DoorHealth", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 문(Door) 하나의 체력. 몬스터는 기지로 가는 길에 살아있는 문이 있으면 그 문을 먼저 부숴야
       * 지나갈 수 있다(Monster.ts가 DoorHealth.all을 순회해 앞을 막는 문을 찾아 공격한다) — 문을
       * 완전히 부수면(hp<=0) 노드 자체가 사라진다(destroy). 자식인 VirtualWall도 함께 파괴되며
       * onDisable()에서 자동으로 막힘 목록에서 빠지므로, 별도 처리 없이 그 즉시 통과 가능해진다.
       *
       * BuildingTrigger가 이 문을 "건설"하는 시점(appear 재생 완료 후)에만 activate()로 켜진다 —
       * 그 전(아직 안 지어진 상태)에는 몬스터가 공격 대상으로 보지 않는다.
       */

      _export("DoorHealth", DoorHealth = (_dec = ccclass('DoorHealth'), _dec2 = property({
        type: _crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
          error: Error()
        }), VirtualWall) : VirtualWall,
        displayName: '이 문의 가상의 벽',
        tooltip: '문이 부서지면 이 벽도 함께 사라져 더 이상 길을 막지 않는다 — 보통 이 문 프리팹 안의 VirtualWall 자식 노드'
      }), _dec3 = property({
        displayName: '최대 체력',
        tooltip: '몬스터가 이 문을 부수는 데 필요한 총 데미지량. 문마다 다르게 조정 가능'
      }), _dec(_class = (_class2 = (_class3 = class DoorHealth extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "obstacle", _descriptor, this);

          _initializerDefineProperty(this, "maxHp", _descriptor2, this);

          this._active = false;
          this._hp = 0;
        }

        get hp() {
          return this._hp;
        }

        get isActive() {
          return this._active;
        }
        /** BuildingTrigger가 건설(appear) 완료 시점에 호출 */


        activate() {
          this._hp = this.maxHp;
          this._active = true;
          DoorHealth.all.push(this);
        }

        onDestroy() {
          const i = DoorHealth.all.indexOf(this);
          if (i >= 0) DoorHealth.all.splice(i, 1);
        }

        takeDamage(amt) {
          var _this$getComponent, _this$getComponent2;

          if (!this._active) return;
          this._hp = Math.max(0, this._hp - amt); // 몬스터를 때릴 때처럼, 처음 데미지를 입는 순간에만 체력바가 노출된다.

          (_this$getComponent = this.getComponent(_crd && StructureHealthBar === void 0 ? (_reportPossibleCrUseOfStructureHealthBar({
            error: Error()
          }), StructureHealthBar) : StructureHealthBar)) == null || _this$getComponent.onDamaged(this._hp, this.maxHp);
          (_this$getComponent2 = this.getComponent(_crd && StructureHitFlash === void 0 ? (_reportPossibleCrUseOfStructureHitFlash({
            error: Error()
          }), StructureHitFlash) : StructureHitFlash)) == null || _this$getComponent2.flash();
          if (this._hp <= 0) this._die();
        }

        _die() {
          this._active = false;
          this.node.destroy();
        }

      }, _class3.all = [], _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "obstacle", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 20;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=09511a970db066b8d25e11aedad08398a44b8156.js.map