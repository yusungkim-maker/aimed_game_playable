System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Prefab, instantiate, Socket, SocketVariant, FollowerFormation, MonsterSpawner, TriggerId, CoinEvents, CoinEventName, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class4, _class5, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _crd, ccclass, property, UnitSocketConfig, UnitSocketManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfSocket(extras) {
    _reporterNs.report("Socket", "./Socket", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketSetup(extras) {
    _reporterNs.report("SocketSetup", "./Socket", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketVariant(extras) {
    _reporterNs.report("SocketVariant", "./SocketManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerFormation(extras) {
    _reporterNs.report("FollowerFormation", "./FollowerFormation", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTriggerId(extras) {
    _reporterNs.report("TriggerId", "./TriggerId", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
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
      Prefab = _cc.Prefab;
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      Socket = _unresolved_2.Socket;
    }, function (_unresolved_3) {
      SocketVariant = _unresolved_3.SocketVariant;
    }, function (_unresolved_4) {
      FollowerFormation = _unresolved_4.FollowerFormation;
    }, function (_unresolved_5) {
      MonsterSpawner = _unresolved_5.MonsterSpawner;
    }, function (_unresolved_6) {
      TriggerId = _unresolved_6.TriggerId;
    }, function (_unresolved_7) {
      CoinEvents = _unresolved_7.CoinEvents;
      CoinEventName = _unresolved_7.CoinEventName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2e97c6TG35CIIvYgyfHL1Ht", "UnitSocketManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'instantiate']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 유닛 생산 소켓 1개에 대한 설정. 건물 트리거 소켓(SocketManager)과 마찬가지로 목록 순서대로
       * 하나씩만 등장하고 1회성이다(요구치를 채우면 사라짐) — 다른 점은 각 소켓마다 자기만의 고정
       * 위치가 있다는 것뿐이다(공용 위치 없음, spawnPoint 필수).
       */

      _export("UnitSocketConfig", UnitSocketConfig = (_dec = ccclass('UnitSocketConfig'), _dec2 = property({
        type: _crd && SocketVariant === void 0 ? (_reportPossibleCrUseOfSocketVariant({
          error: Error()
        }), SocketVariant) : SocketVariant,
        displayName: '소켓 크기',
        tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지'
      }), _dec3 = property({
        displayName: '요구 코인 개수'
      }), _dec4 = property({
        displayName: '생산 유닛 수',
        tooltip: '요구치를 채우는 순간(1회) 생산되는 유닛 수'
      }), _dec5 = property({
        displayName: '코인 흡수 간격(초)',
        tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)'
      }), _dec6 = property({
        type: Node,
        displayName: '소켓 위치(필수)',
        tooltip: '이 소켓이 등장할 자리 — 목록의 각 소켓마다 자기 자리가 다르므로 반드시 지정해야 한다'
      }), _dec7 = property({
        displayName: '유도 화살표 UI 표시'
      }), _dec(_class = (_class2 = class UnitSocketConfig {
        constructor() {
          _initializerDefineProperty(this, "variant", _descriptor, this);

          _initializerDefineProperty(this, "requiredCoins", _descriptor2, this);

          _initializerDefineProperty(this, "followerCount", _descriptor3, this);

          _initializerDefineProperty(this, "depositInterval", _descriptor4, this);

          _initializerDefineProperty(this, "spawnPoint", _descriptor5, this);

          _initializerDefineProperty(this, "showGuideArrow", _descriptor6, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variant", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return (_crd && SocketVariant === void 0 ? (_reportPossibleCrUseOfSocketVariant({
            error: Error()
          }), SocketVariant) : SocketVariant).L;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "requiredCoins", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followerCount", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "spawnPoint", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showGuideArrow", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      })), _class2)) || _class));
      /**
       * 유닛 생산 소켓 전용 매니저. 건물 건축 소켓(SocketManager)과 동일하게 목록 순서대로 하나씩만
       * 등장시키고, 요구치를 채우면 사라지고(1회성) 대기시간 후 다음 소켓이 등장한다 — 다른 점은
       * 각 소켓마다 자기만의 고정 위치를 쓴다는 것뿐이다(공용 스폰 위치 없음).
       *
       * 지정된 개수(기본 3개, 즉 목록의 0~2번)만큼 소켓을 완료하면 건물 건축 소켓(SocketManager)이
       * 그때부터 등장하기 시작한다 — CoinEvents.BuildingSocketsUnlocked로 느슨하게 연결됨.
       */


      _export("UnitSocketManager", UnitSocketManager = (_dec8 = ccclass('UnitSocketManager'), _dec9 = property({
        type: [UnitSocketConfig],
        displayName: '유닛 생산 소켓 목록',
        tooltip: '등장 순서대로. 1번=배열의 0번째. 한 번에 하나만 등장하며, 요구치를 채우면 사라지고 대기시간 후 다음 소켓이 등장한다'
      }), _dec10 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (L)'
      }), _dec11 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (S)'
      }), _dec12 = property({
        type: Prefab,
        displayName: '유닛(추종자) 프리팹'
      }), _dec13 = property({
        type: Node,
        displayName: '플레이어 노드'
      }), _dec14 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec15 = property({
        displayName: '다음 소켓 등장 대기시간(초)',
        tooltip: '한 소켓이 요구치를 채우고 사라진 뒤 다음 소켓이 나타나기까지의 지연 시간'
      }), _dec16 = property({
        displayName: '첫 생산 완료 시 시작할 러쉬 이름',
        tooltip: '1번째 소켓이 요구치를 채우는 순간 이 이름의 러쉬를 시작한다'
      }), _dec17 = property({
        displayName: '첫 생산 완료 시 추가로 1회만 시작할 러쉬 이름',
        tooltip: '게임 시작 직후 소켓에 코인을 넣고 첫 러쉬가 도착하기까지의 텀을 줄이기 위한 1회성 추가 러쉬 (예: 경로 중간 지점에서 바로 등장). 비워두면 추가 러쉬 없음. firstRushName과 마찬가지로 딱 한 번만 시작된다'
      }), _dec18 = property({
        displayName: '건물 소켓 해금까지 필요한 완료 소켓 개수',
        tooltip: '유닛 생산 소켓을 이 개수만큼 순서대로 완료하면(기본 3 = 0,1,2번) 건물 건축 소켓(SocketManager)이 그때부터 등장하기 시작한다'
      }), _dec8(_class4 = (_class5 = class UnitSocketManager extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "sockets", _descriptor7, this);

          _initializerDefineProperty(this, "socketPrefab", _descriptor8, this);

          _initializerDefineProperty(this, "socketPrefabS", _descriptor9, this);

          _initializerDefineProperty(this, "followerPrefab", _descriptor10, this);

          _initializerDefineProperty(this, "playerNode", _descriptor11, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor12, this);

          _initializerDefineProperty(this, "nextSocketDelay", _descriptor13, this);

          _initializerDefineProperty(this, "firstRushName", _descriptor14, this);

          _initializerDefineProperty(this, "firstRushExtraName", _descriptor15, this);

          _initializerDefineProperty(this, "unlockBuildingSocketsAfterCount", _descriptor16, this);

          this._index = 0;
          this._formation = null;
          this._rushStarted = false;
          this._buildingSocketsUnlocked = false;
        }

        start() {
          if (this.playerNode) this._formation = this.playerNode.getComponent(_crd && FollowerFormation === void 0 ? (_reportPossibleCrUseOfFollowerFormation({
            error: Error()
          }), FollowerFormation) : FollowerFormation);

          this._spawnCurrent();
        }

        _spawnCurrent() {
          var _node$getComponent;

          if (!this.playerNode || !this.followerPrefab) return;
          if (this._index >= this.sockets.length) return;
          var config = this.sockets[this._index];
          if (!config.spawnPoint) return; // 이 소켓의 고정 위치가 지정 안 돼 있으면 스폰하지 않음

          var prefab = config.variant === (_crd && SocketVariant === void 0 ? (_reportPossibleCrUseOfSocketVariant({
            error: Error()
          }), SocketVariant) : SocketVariant).S ? this.socketPrefabS : this.socketPrefab;
          if (!prefab) return;
          var node = instantiate(prefab);
          this.node.addChild(node);
          node.setWorldPosition(config.spawnPoint.worldPosition);
          var socket = (_node$getComponent = node.getComponent(_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket)) != null ? _node$getComponent : node.addComponent(_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket);
          var setup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: false,
            triggerId: (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
              error: Error()
            }), TriggerId) : TriggerId).None,
            repeatable: false,
            onFulfilled: () => this._onSocketFulfilled()
          };
          socket.activate(setup);
        }

        _onSocketFulfilled() {
          // 1번째 소켓이 요구치를 채우는 순간 러쉬를 시작한다 (한 번만).
          if (!this._rushStarted && this._index === 0) {
            var _this$monsterSpawnerN;

            this._rushStarted = true;
            var spawner = (_this$monsterSpawnerN = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
              error: Error()
            }), MonsterSpawner) : MonsterSpawner);
            spawner == null || spawner.startRushByName(this.firstRushName);
            if (this.firstRushExtraName) spawner == null || spawner.startRushByName(this.firstRushExtraName);
          }

          this._index++; // 지정된 개수만큼(기본 3개, 0~2번) 완료되는 순간 건물 건축 소켓 스폰을 풀어준다.
          // SocketManager.ts가 이 이벤트를 구독해서 그전까지는 건물 소켓을 하나도 스폰하지 않는다.

          if (!this._buildingSocketsUnlocked && this._index >= this.unlockBuildingSocketsAfterCount) {
            this._buildingSocketsUnlocked = true;
            (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
              error: Error()
            }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
              error: Error()
            }), CoinEventName) : CoinEventName).BuildingSocketsUnlocked);
          } // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 다음 소켓이 같은 자리에서 즉시 충족되어
          // 버리는 것을 방지 — SocketManager와 동일한 이유의 지연.


          this.scheduleOnce(() => this._spawnCurrent(), this.nextSocketDelay);
        }

      }, (_descriptor7 = _applyDecoratedDescriptor(_class5.prototype, "sockets", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefab", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefabS", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "followerPrefab", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "playerNode", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "nextSocketDelay", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "firstRushName", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1';
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "firstRushExtraName", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1_Intro';
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "unlockBuildingSocketsAfterCount", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      })), _class5)) || _class4));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0f535765eb4456c19e6c09d10d1e1863d7007743.js.map