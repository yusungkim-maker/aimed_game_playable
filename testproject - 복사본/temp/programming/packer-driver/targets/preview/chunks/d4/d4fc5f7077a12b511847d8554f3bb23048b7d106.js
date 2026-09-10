System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, CCFloat, CoinEvents, CoinEventName, TriggerId, MonsterSpawner, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, PlayerMoveTrigger;

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
      Vec3 = _cc.Vec3;
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

      _cclegacy._RF.push({}, "c27bcpPcqBNsYvKwv5Gf33k", "PlayerMoveTrigger", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'CCFloat']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 플레이어가 "처음 움직이기 시작한" 순간을 딱 한 번 잡아서 러쉬를 시작시킨다.
       *
       * 왜 필요한가: 몬스터가 나오는 시점을 "첫 소켓 완성"에 물려두면, 플레이어가 아직 아무것도
       * 안 하고 있는 동안에는 화면이 비어 있고, 반대로 소켓을 채우자마자 러쉬 + 건물 + 보스가
       * 한꺼번에 몰린다. 그래서 잡몹 러쉬만 "조작을 시작한 순간"으로 떼어냈다.
       *
       * 판정은 입력 장치가 아니라 **플레이어 노드가 실제로 움직인 거리**로 한다 — 조이스틱을
       * 살짝 건드려 방향만 바뀐 것은 무시되고, 조이스틱이든 다른 경로(추종자 이동 override 등)든
       * 실제로 이동했을 때만 발화한다.
       *
       * 발화 후에는 스스로 update를 끈다(enabled = false).
       */

      _export("PlayerMoveTrigger", PlayerMoveTrigger = (_dec = ccclass('PlayerMoveTrigger'), _dec2 = property({
        type: Node,
        displayName: '플레이어 노드',
        tooltip: '움직임을 감시할 노드. 보통 메인 캐릭터 노드를 그대로 연결한다'
      }), _dec3 = property({
        type: CCFloat,
        displayName: '움직임 판정 거리(m)',
        tooltip: '시작 위치에서 이 거리 이상 벗어나면 "움직이기 시작했다"로 본다. 너무 작으면 미세한 흔들림에도 발화하고, 너무 크면 몇 걸음 걷고 나서야 시작된다'
      }), _dec4 = property({
        type: CCFloat,
        displayName: '발화 지연(초)',
        tooltip: '움직임을 감지한 뒤 이만큼 기다렸다가 러쉬를 시작한다. 0이면 즉시'
      }), _dec5 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '아래 러쉬 이름을 쓸 때만 필요. 비워두면 러쉬를 시작시키지 않는다'
      }), _dec6 = property({
        displayName: '시작할 러쉬 이름',
        tooltip: '발화와 동시에 시작할 MonsterSpawner.rushes(또는 간격 반복 사이클)의 이름. 비워두면 없음'
      }), _dec7 = property({
        displayName: '시작할 러쉬 이름 2',
        tooltip: '경로 중간에서 바로 등장시키는 1회성 인트로 러쉬처럼, 하나 더 내보낼 때 쓴다. 비워두면 없음'
      }), _dec8 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '함께 발화할 트리거 ID',
        tooltip: '이 순간에 맞춰 건물 트리거까지 발동시키고 싶을 때 지정한다(GameStartTrigger와 같은 방식으로 CoinEvents.SocketFilled를 emit). 필요 없으면 None으로 둔다 — 기본값'
      }), _dec(_class = (_class2 = class PlayerMoveTrigger extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "playerNode", _descriptor, this);

          _initializerDefineProperty(this, "moveThreshold", _descriptor2, this);

          _initializerDefineProperty(this, "startDelay", _descriptor3, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor4, this);

          _initializerDefineProperty(this, "rushName", _descriptor5, this);

          _initializerDefineProperty(this, "rushExtraName", _descriptor6, this);

          _initializerDefineProperty(this, "triggerId", _descriptor7, this);

          this._fired = false;
          this._origin = new Vec3();
          this._hasOrigin = false;
        }

        start() {
          this._captureOrigin();
        }

        _captureOrigin() {
          if (!this.playerNode) return;
          Vec3.copy(this._origin, this.playerNode.worldPosition);
          this._hasOrigin = true;
        }

        update() {
          if (this._fired || !this.playerNode) return; // start()보다 늦게 배치/이동되는 경우를 대비해 기준점이 없으면 여기서 잡는다.

          if (!this._hasOrigin) {
            this._captureOrigin();

            return;
          }

          var p = this.playerNode.worldPosition;
          var dx = p.x - this._origin.x;
          var dz = p.z - this._origin.z;
          if (dx * dx + dz * dz < this.moveThreshold * this.moveThreshold) return;
          this._fired = true;
          this.enabled = false; // 한 번만 — 이후 매 프레임 검사 비용도 없앤다

          if (this.startDelay > 0) this.scheduleOnce(() => this._fire(), this.startDelay);else this._fire();
        }

        _fire() {
          var _this$monsterSpawnerN, _this$monsterSpawnerN2;

          var spawner = (_this$monsterSpawnerN = (_this$monsterSpawnerN2 = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN2.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner)) != null ? _this$monsterSpawnerN : null;
          if (this.rushName) spawner == null || spawner.startRushByName(this.rushName);
          if (this.rushExtraName) spawner == null || spawner.startRushByName(this.rushExtraName);

          if (this.triggerId !== (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None) {
            (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
              error: Error()
            }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
              error: Error()
            }), CoinEventName) : CoinEventName).SocketFilled, this.triggerId);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "playerNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "moveThreshold", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "startDelay", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "monsterSpawnerNode", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "rushExtraName", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d4fc5f7077a12b511847d8554f3bb23048b7d106.js.map