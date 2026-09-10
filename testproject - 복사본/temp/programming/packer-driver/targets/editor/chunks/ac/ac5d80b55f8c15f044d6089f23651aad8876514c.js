System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, CoinEvents, CoinEventName, TriggerId, MonsterSpawner, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _dec4, _dec5, _dec6, _dec7, _class4, _class5, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, BossRushEntry, BossRushManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTriggerId(extras) {
    _reporterNs.report("TriggerId", "./TriggerId", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
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
      Node = _cc.Node;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      TriggerId = _unresolved_3.TriggerId;
    }, function (_unresolved_4) {
      MonsterSpawner = _unresolved_4.MonsterSpawner;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0a38d12nFVNR7NwDFxglH5T", "BossRushManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 특정 건물 트리거 ID가 발동하면 시작할 보스 러쉬 1건 */

      _export("BossRushEntry", BossRushEntry = (_dec = ccclass('BossRushEntry'), _dec2 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '반응할 건물 트리거 ID',
        tooltip: '소켓 목록에서 이 트리거 ID를 가진 건물 소켓이 요구치를 채우는 순간 아래 러쉬를 시작한다'
      }), _dec3 = property({
        displayName: '시작할 보스 러쉬 이름',
        tooltip: 'MonsterSpawner.rushes 목록에 등록된 RushConfig의 이름과 정확히 같아야 한다 (보스 프리팹/경로/스탯은 그쪽에서 구성)'
      }), _dec(_class = (_class2 = class BossRushEntry {
        constructor() {
          _initializerDefineProperty(this, "triggerId", _descriptor, this);

          _initializerDefineProperty(this, "rushName", _descriptor2, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      })), _class2)) || _class));
      /**
       * 잡몹 러쉬(UnitSocketManager가 트리거하는 Rush_1 등)와 완전히 별개로, 건물 건축 소켓이
       * 특정 트리거 ID까지 채워질 때마다 보스 러쉬를 시작시키는 전용 컨트롤러.
       *
       * 새 스폰/이동 로직을 직접 만들지 않는다 — CoinEvents.SocketFilled(BuildingTrigger.ts가
       * 반응하는 것과 같은 이벤트)를 구독하기만 하고, 실제 스폰은 기존 MonsterSpawner.startRushByName()에
       * 위임한다. 보스 프리팹/전용 러쉬 경로/스탯 등은 MonsterSpawner의 "러쉬 목록"(rushes)에
       * 이 컴포넌트가 참조하는 것과 같은 이름의 RushConfig로 직접 구성하면 된다 — 러쉬 경로는
       * 기존 RushPath(Path_1~6)를 그대로 재사용할 수 있다.
       */


      _export("BossRushManager", BossRushManager = (_dec4 = ccclass('BossRushManager'), _dec5 = property({
        type: [BossRushEntry],
        displayName: '보스 러쉬 목록',
        tooltip: '건물 트리거 ID별로 시작할 보스/몬스터 러쉬 이름을 등록. 같은 트리거 ID로 여러 개를 등록하면(예: 보스 등장 + 새 몬스터 티어 시작) 그 트리거가 발동할 때 전부 함께 시작된다. 같은 트리거는 한 번만 발동한다'
      }), _dec6 = property({
        displayName: '유닛 소켓 마일스톤 러쉬 목록',
        tooltip: 'UnitSocketManager가 CoinEvents.BuildingSocketsUnlocked를 딱 한 번 emit할 때(유닛 생산 소켓을 지정 개수만큼 완료) 함께 시작할 러쉬 이름들. 여러 개면 전부 동시에 시작된다'
      }), _dec7 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec4(_class4 = (_class5 = class BossRushManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "entries", _descriptor3, this);

          _initializerDefineProperty(this, "unitMilestoneRushNames", _descriptor4, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor5, this);

          this._spawner = null;
          this._firedTriggerIds = new Set();
          this._unitMilestoneFired = false;
        }

        onLoad() {
          var _this$monsterSpawnerN, _this$monsterSpawnerN2;

          this._spawner = (_this$monsterSpawnerN = (_this$monsterSpawnerN2 = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN2.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner)) != null ? _this$monsterSpawnerN : null;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).BuildingSocketsUnlocked, this._onUnitMilestone, this);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).BuildingSocketsUnlocked, this._onUnitMilestone, this);
        }

        _onSocketFilled(triggerId) {
          if (this._firedTriggerIds.has(triggerId)) return;
          const matches = this.entries.filter(e => e.triggerId === triggerId && e.rushName);
          if (matches.length === 0) return;

          this._firedTriggerIds.add(triggerId);

          for (const entry of matches) {
            var _this$_spawner;

            (_this$_spawner = this._spawner) == null || _this$_spawner.startRushByName(entry.rushName);
          }
        }

        _onUnitMilestone() {
          if (this._unitMilestoneFired) return;
          this._unitMilestoneFired = true;

          for (const name of this.unitMilestoneRushNames) {
            var _this$_spawner2;

            if (name) (_this$_spawner2 = this._spawner) == null || _this$_spawner2.startRushByName(name);
          }
        }

      }, (_descriptor3 = _applyDecoratedDescriptor(_class5.prototype, "entries", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class5.prototype, "unitMilestoneRushNames", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class5)) || _class4));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ac5d80b55f8c15f044d6089f23651aad8876514c.js.map