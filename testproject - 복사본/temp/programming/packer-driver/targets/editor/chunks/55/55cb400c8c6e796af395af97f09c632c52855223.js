System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, CCFloat, CoinEvents, CoinEventName, TriggerId, MonsterSpawner, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, GameStartTrigger;

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
      CCFloat = _cc.CCFloat;
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

      _cclegacy._RF.push({}, "57fb0GnjjJAxYhFd0hgGxWt", "GameStartTrigger", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'CCFloat']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 게임이 시작될 때 트리거 하나를 발화시키는 것만 담당하는 컴포넌트.
       *
       * 이게 필요한 이유: 원래 "다음 단계 해금" 신호(CoinEvents.BuildingSocketsUnlocked)를 발화하는
       * 곳이 UnitSocketManager 단 하나였다. 그래서 유닛 생산 소켓이 없는 씬에서는 건물 소켓이
       * 영원히 등장하지 않았다. 진행 시작 책임을 유닛 소켓 시스템 밖으로 떼어내서, 어떤 씬이든
       * "무엇으로 시작하는지"를 이 컴포넌트 하나로 정할 수 있게 한다.
       *
       * 발화 방식은 소켓이 충족될 때와 완전히 동일하다(CoinEvents.SocketFilled에 트리거 ID를 실어
       * 보냄) — 그래서 이 트리거에 반응하는 쪽도 똑같다:
       *  - SocketManager.unlockTriggerId 를 같은 값으로 두면 그때부터 소켓이 등장하기 시작한다
       *  - BuildingTrigger.triggerId 를 같은 값으로 두면 게임 시작과 동시에 지어지는 건물이 된다
       *  - BossRushManager의 보스 러쉬 목록에 같은 값을 등록하면 시작과 동시에 러쉬가 나간다
       */

      _export("GameStartTrigger", GameStartTrigger = (_dec = ccclass('GameStartTrigger'), _dec2 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '발화할 트리거 ID',
        tooltip: '게임 시작 시 딱 한 번 발화시킬 트리거. 소켓이 쓰는 번호(1~12)와 겹치지 않게 GameStart(100)를 쓰는 것이 기본이다'
      }), _dec3 = property({
        type: CCFloat,
        displayName: '발화 지연(초)',
        tooltip: '씬이 시작된 뒤 이만큼 기다렸다가 발화한다. 0이어도 모든 컴포넌트의 start()가 끝난 다음 프레임에 발화하므로 신호를 놓치지 않는다'
      }), _dec4 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '아래 러쉬 이름을 쓸 때만 필요. 비워두면 러쉬를 시작시키지 않는다'
      }), _dec5 = property({
        displayName: '함께 시작할 러쉬 이름',
        tooltip: '발화와 동시에 시작할 MonsterSpawner.rushes(또는 간격 반복 사이클)의 이름. 비워두면 없음'
      }), _dec6 = property({
        displayName: '함께 시작할 러쉬 이름 2',
        tooltip: '경로 중간에서 바로 등장시키는 1회성 인트로 러쉬처럼, 시작과 동시에 하나 더 내보낼 때 쓴다. 비워두면 없음'
      }), _dec(_class = (_class2 = class GameStartTrigger extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "triggerId", _descriptor, this);

          _initializerDefineProperty(this, "startDelay", _descriptor2, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor3, this);

          _initializerDefineProperty(this, "rushName", _descriptor4, this);

          _initializerDefineProperty(this, "rushExtraName", _descriptor5, this);

          this._fired = false;
        }

        start() {
          // 지연이 0이어도 반드시 한 프레임 미룬다 — 컴포넌트 start() 실행 순서는 보장되지
          // 않으므로, 같은 프레임에 발화하면 SocketManager.start()가 아직 이벤트를 구독하지
          // 않은 상태일 수 있고 그러면 신호가 조용히 사라진다.
          this.scheduleOnce(() => this._fire(), Math.max(0, this.startDelay));
        }

        _fire() {
          var _this$monsterSpawnerN;

          if (this._fired) return;
          if (this.triggerId === (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None) return;
          this._fired = true;
          const spawner = (_this$monsterSpawnerN = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);
          if (this.rushName) spawner == null || spawner.startRushByName(this.rushName);
          if (this.rushExtraName) spawner == null || spawner.startRushByName(this.rushExtraName);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this.triggerId);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).GameStart;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "startDelay", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "monsterSpawnerNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "rushExtraName", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=55cb400c8c6e796af395af97f09c632c52855223.js.map