System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MonsterHealthBarManager, _dec, _class, _crd, ccclass, MonsterHealthBar;

  function _reportPossibleCrUseOfMonsterHealthBarManager(extras) {
    _reporterNs.report("MonsterHealthBarManager", "./MonsterHealthBarManager", _context.meta, extras);
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
      MonsterHealthBarManager = _unresolved_2.MonsterHealthBarManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2cab6/5Y8dPfbNUn8X74NMj", "MonsterHealthBar", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass
      } = _decorator);
      /**
       * 몬스터 노드에 addComponent로 붙는 얇은 컴포넌트(Monster.ts와 동일한 방식 — MonsterSpawner가
       * 스폰 시점에 붙인다). 실제 표시는 MonsterHealthBarManager 풀에서 빌린 MonsterHpBarView가
       * 담당하고, 이 컴포넌트는 그 인스턴스의 획득/반납과 데미지 시점의 등장만 책임진다.
       * 데미지를 한 번도 안 입은 몬스터는 체력바를 아예 만들지 않는다(요청사항: 무피해 상태에선 숨김).
       */

      _export("MonsterHealthBar", MonsterHealthBar = (_dec = ccclass('MonsterHealthBar'), _dec(_class = class MonsterHealthBar extends Component {
        constructor(...args) {
          super(...args);

          /** MonsterSpawner가 스폰 직후 RushGroup 설정에 따라 지정 */
          this.isBoss = false;
          this._view = null;
        }

        /** 데미지를 입을 때마다 호출 — 처음 호출되는 순간 체력바를 실체화한다 */
        onDamaged(hp, maxHp) {
          if (!this._view) {
            var _instance$acquire, _instance;

            this._view = (_instance$acquire = (_instance = (_crd && MonsterHealthBarManager === void 0 ? (_reportPossibleCrUseOfMonsterHealthBarManager({
              error: Error()
            }), MonsterHealthBarManager) : MonsterHealthBarManager).instance) == null ? void 0 : _instance.acquire()) != null ? _instance$acquire : null;
            if (!this._view) return;
            this._view.target = this.node;
            const s = this.isBoss ? 2 : 1;

            this._view.node.setScale(s, s, 1);
          }

          this._view.setRatio(maxHp > 0 ? hp / maxHp : 0);
        }

        hide() {
          var _instance2;

          if (!this._view) return;
          (_instance2 = (_crd && MonsterHealthBarManager === void 0 ? (_reportPossibleCrUseOfMonsterHealthBarManager({
            error: Error()
          }), MonsterHealthBarManager) : MonsterHealthBarManager).instance) == null || _instance2.release(this._view);
          this._view = null;
        }

        onDestroy() {
          this.hide();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c37306007c031cbac6b68b9815916f04a5fca96d.js.map