System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, Camera, instantiate, MonsterHpBarView, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _class3, _crd, ccclass, property, StructureHealthBarManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

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
      Prefab = _cc.Prefab;
      Camera = _cc.Camera;
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      MonsterHpBarView = _unresolved_2.MonsterHpBarView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c19717qn0ZJzJJMlEwM/PXq", "StructureHealthBarManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'Camera', 'instantiate']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 기지/문 등 "몬스터가 아닌" 구조물 체력바 UI 인스턴스 풀. MonsterHealthBarManager와 완전히
       * 같은 방식(필요할 때만 꺼내 쓰고 반납)이지만 별도 풀로 분리해서, 몬스터와 다른 프리팹
       * (아군 색상 Bar_Pc_hp_our를 쓰는 StructureHPBar.prefab)을 쓸 수 있게 한다 — 구조물 수가
       * 적어(기지 1개 + 문 몇 개) 몬스터처럼 자주 생성/파괴되지는 않지만, 같은 View/풀 패턴을
       * 재사용하는 게 새 로직을 만드는 것보다 안전하다.
       */

      _export("StructureHealthBarManager", StructureHealthBarManager = (_dec = ccclass('StructureHealthBarManager'), _dec2 = property({
        type: Prefab,
        displayName: '체력바 프리팹'
      }), _dec3 = property({
        type: Camera,
        displayName: '월드 카메라(3D)'
      }), _dec(_class = (_class2 = (_class3 = class StructureHealthBarManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "barPrefab", _descriptor, this);

          _initializerDefineProperty(this, "worldCamera", _descriptor2, this);

          this._pool = [];
        }

        onLoad() {
          StructureHealthBarManager.instance = this;
        }

        onDestroy() {
          if (StructureHealthBarManager.instance === this) StructureHealthBarManager.instance = null;
        }

        acquire() {
          if (!this.barPrefab) return null;

          let node = this._pool.pop();

          if (!node) {
            node = instantiate(this.barPrefab);
            this.node.addChild(node);
          }

          node.active = true;
          const view = node.getComponent(_crd && MonsterHpBarView === void 0 ? (_reportPossibleCrUseOfMonsterHpBarView({
            error: Error()
          }), MonsterHpBarView) : MonsterHpBarView);
          if (view) view.worldCamera = this.worldCamera;
          return view;
        }

        release(view) {
          view.target = null;
          view.node.active = false;
          view.node.setScale(1, 1, 1);

          this._pool.push(view.node);
        }

      }, _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "barPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5817154e498c74632465c4b44d569e65e429695e.js.map