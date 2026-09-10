System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Prefab, Enum, Texture2D, instantiate, Socket, FollowerFormation, TriggerId, CoinEvents, CoinEventName, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class4, _class5, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _crd, ccclass, property, SocketVariant, SocketConfig, SocketManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfSocket(extras) {
    _reporterNs.report("Socket", "./Socket", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketSetup(extras) {
    _reporterNs.report("SocketSetup", "./Socket", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerFormation(extras) {
    _reporterNs.report("FollowerFormation", "./FollowerFormation", _context.meta, extras);
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
      Enum = _cc.Enum;
      Texture2D = _cc.Texture2D;
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      Socket = _unresolved_2.Socket;
    }, function (_unresolved_3) {
      FollowerFormation = _unresolved_3.FollowerFormation;
    }, function (_unresolved_4) {
      TriggerId = _unresolved_4.TriggerId;
    }, function (_unresolved_5) {
      CoinEvents = _unresolved_5.CoinEvents;
      CoinEventName = _unresolved_5.CoinEventName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d1e531xjF9CgpTeEq8U3Ev1", "SocketManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'Enum', 'Texture2D', 'instantiate']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 소켓 크기 변형 — 소켓마다 socket_L/socket_S 중 어느 프리팹으로 스폰할지 고른다. */

      _export("SocketVariant", SocketVariant = /*#__PURE__*/function (SocketVariant) {
        SocketVariant[SocketVariant["L"] = 0] = "L";
        SocketVariant[SocketVariant["S"] = 1] = "S";
        return SocketVariant;
      }({}));

      Enum(SocketVariant);
      /**
       * 소켓 1개에 대한 설정 — 요구 코인 개수와 보상으로 나오는 추종자 수.
       * 인스펙터 배열의 +/- 버튼으로 몇 번째 소켓까지 있을지 자유롭게 추가/삭제한다.
       */

      _export("SocketConfig", SocketConfig = (_dec = ccclass('SocketConfig'), _dec2 = property({
        type: SocketVariant,
        displayName: '소켓 크기',
        tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지 — 아래 SocketManager의 두 프리팹 슬롯 중 하나가 실제로 쓰인다'
      }), _dec3 = property({
        displayName: '요구 코인 개수'
      }), _dec4 = property({
        displayName: '보상 추종자 수'
      }), _dec5 = property({
        displayName: '코인 흡수 간격(초)',
        tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)'
      }), _dec6 = property({
        displayName: '유도 화살표 UI 표시',
        tooltip: '체크하면 이 소켓이 등장할 때 socket_L/socket_S에 내장된 유도 화살표(3D_arrow)가 함께 나타나고, 동시에 메인 캐릭터에 붙은 나침반 화살표(GuideCompass)도 이 소켓 방향을 가리키기 시작한다 — 둘 다 이 소켓이 요구치를 다 채우는 순간 사라진다'
      }), _dec7 = property({
        type: Node,
        displayName: '소켓 위치(개별)',
        tooltip: '이 소켓이 등장할 위치. 비워두면 아래 SocketManager의 공용 "소켓 스폰 위치"를 대신 사용한다 — 소켓마다 자기 자리를 씬에 마커 노드로 만들어 여기 드래그'
      }), _dec8 = property({
        displayName: '건물 트리거 여부',
        tooltip: '체크하면 이 소켓이 요구치를 다 채우는 순간 아래 "트리거 ID"로 전역 건물 건설 이벤트(CoinEvents.SocketFilled)를 발동한다 — 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 트리거 ID를 가진 것이 반응해 건설 애니메이션을 재생한다'
      }), _dec9 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '트리거 ID',
        tooltip: '"건물 트리거 여부"가 체크된 경우에만 의미 있음 — 씬에 배치할 건물의 BuildingTrigger.triggerId와 같은 값으로 맞춰야 반응한다'
      }), _dec10 = property({
        type: Texture2D,
        displayName: '아이콘 텍스처',
        tooltip: '이 소켓 몸통 위 아이콘 판(socket_S의 "icon" 메시)에 표시할 이미지 — 소켓마다 어떤 건물이 나오는지 다르게 보여줄 때 지정한다. 비워두면 아이콘 판 자체를 끈다(기존 씬처럼 보임). socket_L에는 아이콘 메시가 없어서 지정해도 표시되지 않는다'
      }), _dec(_class = (_class2 = class SocketConfig {
        constructor() {
          _initializerDefineProperty(this, "variant", _descriptor, this);

          _initializerDefineProperty(this, "requiredCoins", _descriptor2, this);

          _initializerDefineProperty(this, "followerCount", _descriptor3, this);

          _initializerDefineProperty(this, "depositInterval", _descriptor4, this);

          _initializerDefineProperty(this, "showGuideArrow", _descriptor5, this);

          _initializerDefineProperty(this, "spawnPoint", _descriptor6, this);

          _initializerDefineProperty(this, "isTrigger", _descriptor7, this);

          _initializerDefineProperty(this, "triggerId", _descriptor8, this);

          _initializerDefineProperty(this, "iconTexture", _descriptor9, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variant", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return SocketVariant.L;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "requiredCoins", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followerCount", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.05;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "showGuideArrow", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "spawnPoint", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "isTrigger", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "iconTexture", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));
      /**
       * 소켓을 순서대로 한 번에 하나씩만 스폰한다. 현재 소켓이 코인을 다 채워 보상을
       * 지급하면 스스로 사라지고(Socket.ts), 그 알림을 받아 다음 소켓(있다면)을 이어서 스폰한다.
       *
       * 씬 시작과 동시에 스폰하지 않는다 — 아래 둘 중 하나가 올 때까지 대기했다가 첫 소켓을 스폰한다.
       *  (1) CoinEvents.BuildingSocketsUnlocked — UnitSocketManager가 지정된 유닛 생산 소켓을 처음
       *      채웠을 때 emit. 유닛 소켓이 있는 씬(씬 1)의 기존 경로.
       *  (2) "소켓 스폰 시작 트리거 ID"로 지정한 트리거의 발화 — 유닛 소켓이 없는 씬에서 쓴다.
       *      GameStartTrigger가 게임 시작 시 TriggerId.GameStart를 발화하는 게 표준 조합이다.
       */


      _export("SocketManager", SocketManager = (_dec11 = ccclass('SocketManager'), _dec12 = property({
        type: [SocketConfig],
        displayName: '소켓 목록',
        tooltip: '등장 순서대로. 1번=배열의 0번째. 배열 +/- 버튼으로 개수 자유롭게 조정'
      }), _dec13 = property({
        type: Node,
        displayName: '소켓 스폰 위치',
        tooltip: '소켓이 등장할 고정 위치(기지 앞). 씬에서 이 노드를 드래그해 정확한 위치로 조정'
      }), _dec14 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (L)',
        tooltip: '소켓 목록에서 "소켓 크기"를 L로 설정한 소켓이 사용할 프리팹 (socket_L)'
      }), _dec15 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (S)',
        tooltip: '소켓 목록에서 "소켓 크기"를 S로 설정한 소켓이 사용할 프리팹 (socket_S)'
      }), _dec16 = property({
        type: Prefab,
        displayName: '추종자 프리팹'
      }), _dec17 = property({
        type: Node,
        displayName: '플레이어 노드'
      }), _dec18 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '보상으로 나온 추종자가 몬스터를 찾을 수 있도록 연결 (Follower 프리팹은 프리팹 특성상 이 참조를 저장할 수 없어 스폰 시점에 코드로 주입함)'
      }), _dec19 = property({
        displayName: '다음 소켓 등장 대기시간(초)',
        tooltip: '한 소켓을 채운 뒤 같은 자리에 다음 소켓이 나타나기까지의 지연 시간. 코인을 한꺼번에 많이 모아둔 상태에서 여러 소켓이 동시에 반응해버리는 것을 방지'
      }), _dec20 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '소켓 스폰 시작 트리거 ID',
        tooltip: '이 트리거 ID가 발화하는 순간부터 첫 소켓이 등장한다 (예: GameStart = 게임 시작과 동시에). 비워두면(None) 기존처럼 유닛 생산 소켓 마일스톤(CoinEvents.BuildingSocketsUnlocked)을 기다린다 — 유닛 소켓이 없는 씬에서는 반드시 값을 지정해야 소켓이 나온다'
      }), _dec11(_class4 = (_class5 = class SocketManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "sockets", _descriptor10, this);

          _initializerDefineProperty(this, "spawnPoint", _descriptor11, this);

          _initializerDefineProperty(this, "socketPrefab", _descriptor12, this);

          _initializerDefineProperty(this, "socketPrefabS", _descriptor13, this);

          _initializerDefineProperty(this, "followerPrefab", _descriptor14, this);

          _initializerDefineProperty(this, "playerNode", _descriptor15, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor16, this);

          _initializerDefineProperty(this, "nextSocketDelay", _descriptor17, this);

          _initializerDefineProperty(this, "unlockTriggerId", _descriptor18, this);

          this._index = 0;
          this._formation = null;
          this._unlocked = false;
        }

        start() {
          if (this.playerNode) this._formation = this.playerNode.getComponent(_crd && FollowerFormation === void 0 ? (_reportPossibleCrUseOfFollowerFormation({
            error: Error()
          }), FollowerFormation) : FollowerFormation);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).BuildingSocketsUnlocked, this._onUnlocked, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onTriggerFired, this);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).BuildingSocketsUnlocked, this._onUnlocked, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onTriggerFired, this);
        }
        /** "소켓 스폰 시작 트리거 ID"가 지정된 경우, 그 트리거가 발화하면 스폰을 시작한다.
         * 건물 트리거와 완전히 같은 이벤트(SocketFilled)를 쓰므로 트리거 발화 주체가
         * 무엇이든(게임 시작 컴포넌트든, 앞선 소켓이든) 동일하게 동작한다. */


        _onTriggerFired(triggerId) {
          if (this.unlockTriggerId === (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None) return;
          if (triggerId !== this.unlockTriggerId) return;

          this._onUnlocked();
        }

        _onUnlocked() {
          if (this._unlocked) return;
          this._unlocked = true;

          this._spawnCurrent();
        }

        _spawnCurrent() {
          var _config$spawnPoint, _node$getComponent;

          if (!this.playerNode || !this.followerPrefab) return;
          if (this._index >= this.sockets.length) return;
          const config = this.sockets[this._index];
          const prefab = config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
          if (!prefab) return; // 해당 크기의 소켓 프리팹이 연결 안 돼 있으면 스폰하지 않음

          const spawnAt = (_config$spawnPoint = config.spawnPoint) != null ? _config$spawnPoint : this.spawnPoint;
          if (!spawnAt) return; // 개별/공용 스폰 위치가 둘 다 없으면 스폰하지 않음

          const node = instantiate(prefab);
          this.node.addChild(node);
          node.setWorldPosition(spawnAt.worldPosition);
          const socket = (_node$getComponent = node.getComponent(_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket)) != null ? _node$getComponent : node.addComponent(_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket);
          const setup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: config.isTrigger,
            triggerId: config.triggerId,
            iconTexture: config.iconTexture,
            repeatable: false,
            onFulfilled: () => this._onSocketFulfilled()
          };
          socket.activate(setup);
        }

        _onSocketFulfilled() {
          this._index++;

          if (this._index >= this.sockets.length) {
            // 소켓 목록의 마지막 하나까지 다 지었음 — GameManager가 이 신호로 최종 보스 웨이브 +
            // 게임 종료(CTA) 시퀀스를 시작한다. 더 스폰할 다음 소켓이 없으므로 여기서 끝낸다.
            (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
              error: Error()
            }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
              error: Error()
            }), CoinEventName) : CoinEventName).AllBuildingSocketsCompleted);
            return;
          } // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 진입하면 다음 소켓이 같은 자리에서
          // 즉시(같은 프레임/바로 다음 프레임에) 곧바로 충족되어 버려 "동시에 터지는" 것처럼
          // 보이는 문제가 있었다 — 일정 시간 텀을 둬서 확실히 순차적으로 등장하게 한다.


          this.scheduleOnce(() => this._spawnCurrent(), this.nextSocketDelay);
        }

      }, (_descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "sockets", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "spawnPoint", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefab", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefabS", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "followerPrefab", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "playerNode", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class5.prototype, "nextSocketDelay", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class5.prototype, "unlockTriggerId", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None;
        }
      })), _class5)) || _class4));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=074eb79cf27055750076a3d7b22784ff3e71c462.js.map