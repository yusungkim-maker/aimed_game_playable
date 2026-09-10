System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, StructureHealthBarManager, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, StructureHealthBar;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfStructureHealthBarManager(extras) {
    _reporterNs.report("StructureHealthBarManager", "./StructureHealthBarManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterHpBarView(extras) {
    _reporterNs.report("MonsterHpBarView", "./MonsterHpBarView", _context.meta, extras);
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
      StructureHealthBarManager = _unresolved_2.StructureHealthBarManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "29013q5+iFJGrcw6NYARk93", "StructureHealthBar", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 기지(base)/문(Door) 같은 구조물에 붙여서 체력바를 관리하는 얇은 컴포넌트.
       * MonsterHealthBar와 완전히 같은 패턴 — 데미지를 한 번도 안 입은 동안은 체력바를 아예
       * 만들지 않고, 처음 데미지를 입는 순간(onDamaged 첫 호출)에만 StructureHealthBarManager
       * 풀에서 인스턴스를 빌려와 노출한다.
       */

      _export("StructureHealthBar", StructureHealthBar = (_dec = ccclass('StructureHealthBar'), _dec2 = property({
        displayName: '체력바 크기 배율',
        tooltip: '이 구조물만 따로 키우고 싶을 때 조정 (기본 1). StructureHealthBarManager의 전체 배율과 곱해져서 적용됨'
      }), _dec3 = property({
        displayName: '높이 오프셋 재정의(m)',
        tooltip: '0이면 체력바 프리팹(StructureHPBar)의 기본 오프셋을 그대로 쓴다. 이 구조물 위에 딱 맞게 띄우고 싶을 때만 값을 지정'
      }), _dec(_class = (_class2 = class StructureHealthBar extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "barScale", _descriptor, this);

          _initializerDefineProperty(this, "offsetYOverride", _descriptor2, this);

          this._view = null;
        }

        /** 데미지를 입을 때마다 호출 — 처음 호출되는 순간 체력바를 실체화한다 */
        onDamaged(hp, maxHp) {
          if (!this._view) {
            var _instance$acquire, _instance, _mgr$barScale;

            this._view = (_instance$acquire = (_instance = (_crd && StructureHealthBarManager === void 0 ? (_reportPossibleCrUseOfStructureHealthBarManager({
              error: Error()
            }), StructureHealthBarManager) : StructureHealthBarManager).instance) == null ? void 0 : _instance.acquire()) != null ? _instance$acquire : null;
            if (!this._view) return;
            this._view.target = this.node;
            if (this.offsetYOverride > 0) this._view.offsetY = this.offsetYOverride;
            const mgr = (_crd && StructureHealthBarManager === void 0 ? (_reportPossibleCrUseOfStructureHealthBarManager({
              error: Error()
            }), StructureHealthBarManager) : StructureHealthBarManager).instance;
            const s = this.barScale * ((_mgr$barScale = mgr == null ? void 0 : mgr.barScale) != null ? _mgr$barScale : 1);

            this._view.node.setScale(s, s, 1);
          }

          this._view.setRatio(maxHp > 0 ? hp / maxHp : 0);
        }

        hide() {
          var _instance2;

          if (!this._view) return;
          (_instance2 = (_crd && StructureHealthBarManager === void 0 ? (_reportPossibleCrUseOfStructureHealthBarManager({
            error: Error()
          }), StructureHealthBarManager) : StructureHealthBarManager).instance) == null || _instance2.release(this._view);
          this._view = null;
        }

        onDestroy() {
          this.hide();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "barScale", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "offsetYOverride", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=59b31f181eac0cd20f624cd7227a5b33a1b216e5.js.map