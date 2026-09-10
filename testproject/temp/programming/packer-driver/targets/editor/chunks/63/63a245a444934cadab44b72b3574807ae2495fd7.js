System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, CoinEvents, CoinEventName, CoinPool, CoinStack, Player, TowerAttack, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, CoinSpawnController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinPool(extras) {
    _reporterNs.report("CoinPool", "./CoinPool", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStack(extras) {
    _reporterNs.report("CoinStack", "./CoinStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTowerAttack(extras) {
    _reporterNs.report("TowerAttack", "./TowerAttack", _context.meta, extras);
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
      CoinPool = _unresolved_3.CoinPool;
    }, function (_unresolved_4) {
      CoinStack = _unresolved_4.CoinStack;
    }, function (_unresolved_5) {
      Player = _unresolved_5.Player;
    }, function (_unresolved_6) {
      TowerAttack = _unresolved_6.TowerAttack;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b22334SNkpByIKCPgjv8Z9Z", "CoinSpawnController", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * MonsterKilled 이벤트를 구독해 코인 1개를 드롭시킨다. 자석 반경은 플레이어의 실제
       * attackRange 값을 참조해 "공격 사거리보다 살짝 짧게" 계산한다 (0단계 컨텍스트 문서 규칙).
       * 정확한 계수는 아직 미확정이라 인스펙터에서 바로 튜닝할 수 있게 노출해둔다.
       *
       * 타워가 죽인 몬스터는 예외 — 그 타워(TowerAttack)의 coinGroundStack이 지정돼 있으면
       * 코인이 플레이어 대신 그 coin_ground(CoinGroundStack)로 날아가 쌓인다. 어느 coin_ground로
       * 보낼지는 각 타워 프리팹 인스펙터에서 직접 지정한다(여러 타워가 같은 coin_ground를
       * 가리켜도 된다). 지정 안 된 타워, 또는 플레이어가 직접 죽인 몬스터는 기존처럼
       * 플레이어에게 날아간다.
       */

      _export("CoinSpawnController", CoinSpawnController = (_dec = ccclass('CoinSpawnController'), _dec2 = property({
        type: _crd && CoinPool === void 0 ? (_reportPossibleCrUseOfCoinPool({
          error: Error()
        }), CoinPool) : CoinPool,
        displayName: '코인 풀'
      }), _dec3 = property({
        type: Node,
        displayName: '플레이어 노드',
        tooltip: '자석 이동 대상 + attackRange 참조용'
      }), _dec4 = property({
        displayName: '자석 반경 계수',
        tooltip: 'magnetRadius = player.attackRange * 이 값 (1보다 작으면 공격 사거리보다 짧음)'
      }), _dec5 = property({
        displayName: '코인 무더기로 향할 때의 자석 반경(m)',
        tooltip: '타워가 처치해 코인 무더기로 향하는 코인은 착지 즉시 이 반경 안에 있는 것으로 간주해 곧바로 쌓이러 날아간다 — 사실상 항상 즉시 흡수되도록 충분히 크게 둔다'
      }), _dec(_class = (_class2 = class CoinSpawnController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "coinPool", _descriptor, this);

          _initializerDefineProperty(this, "playerNode", _descriptor2, this);

          _initializerDefineProperty(this, "magnetRadiusRatio", _descriptor3, this);

          _initializerDefineProperty(this, "groundMagnetRadius", _descriptor4, this);

          this._player = null;
          this._stack = null;

          this._onMonsterKilled = (pos, count = 1, source = null) => this._spawnCoin(pos, count, source);
        }

        onLoad() {
          if (this.playerNode) {
            this._player = this.playerNode.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
              error: Error()
            }), Player) : Player);
            this._stack = this.playerNode.getComponent(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
              error: Error()
            }), CoinStack) : CoinStack);
          }

          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).MonsterKilled, this._onMonsterKilled);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).MonsterKilled, this._onMonsterKilled);
        }

        _spawnCoin(pos, count, source) {
          var _source$getComponent$, _source$getComponent;

          if (!this.coinPool) return;
          const groundStack = (_source$getComponent$ = source == null || (_source$getComponent = source.getComponent(_crd && TowerAttack === void 0 ? (_reportPossibleCrUseOfTowerAttack({
            error: Error()
          }), TowerAttack) : TowerAttack)) == null ? void 0 : _source$getComponent.coinGroundStack) != null ? _source$getComponent$ : null;

          if (groundStack) {
            for (let i = 0; i < count; i++) {
              this.coinPool.spawn(pos, groundStack.node, this.groundMagnetRadius, groundStack);
            }

            return;
          }

          if (!this.playerNode || !this._player) return;
          const magnetRadius = this._player.attackRange * this.magnetRadiusRatio;

          for (let i = 0; i < count; i++) {
            this.coinPool.spawn(pos, this.playerNode, magnetRadius, this._stack);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "coinPool", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "magnetRadiusRatio", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.8;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "groundMagnetRadius", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 999;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=63a245a444934cadab44b72b3574807ae2495fd7.js.map