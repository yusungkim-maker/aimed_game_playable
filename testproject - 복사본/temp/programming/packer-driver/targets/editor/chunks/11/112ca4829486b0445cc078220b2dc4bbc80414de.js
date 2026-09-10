System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, Vec3, CCFloat, Material, instantiate, MeshRenderer, SkinnedMeshRenderer, CoinEvents, CoinEventName, TriggerId, CoinGroundStack, CoinPool, CoinStack, CoinCourier, Player, EndingEffect, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _class4, _class5, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _crd, ccclass, property, CourierRoute, CoinCourierManager;

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

  function _reportPossibleCrUseOfCoinGroundStack(extras) {
    _reporterNs.report("CoinGroundStack", "./CoinGroundStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinPool(extras) {
    _reporterNs.report("CoinPool", "./CoinPool", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStack(extras) {
    _reporterNs.report("CoinStack", "./CoinStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinCourier(extras) {
    _reporterNs.report("CoinCourier", "./CoinCourier", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEndingEffect(extras) {
    _reporterNs.report("EndingEffect", "./EndingEffect", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      CCFloat = _cc.CCFloat;
      Material = _cc.Material;
      instantiate = _cc.instantiate;
      MeshRenderer = _cc.MeshRenderer;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      TriggerId = _unresolved_3.TriggerId;
    }, function (_unresolved_4) {
      CoinGroundStack = _unresolved_4.CoinGroundStack;
    }, function (_unresolved_5) {
      CoinPool = _unresolved_5.CoinPool;
    }, function (_unresolved_6) {
      CoinStack = _unresolved_6.CoinStack;
    }, function (_unresolved_7) {
      CoinCourier = _unresolved_7.CoinCourier;
    }, function (_unresolved_8) {
      Player = _unresolved_8.Player;
    }, function (_unresolved_9) {
      EndingEffect = _unresolved_9.EndingEffect;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3c741Wwqu1CG4zOmKQq9Qdi", "CoinCourierManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'Vec3', 'CCFloat', 'Material', 'instantiate', 'MeshRenderer', 'SkinnedMeshRenderer']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 트리거 하나에 대응하는 운반 노선 1건 — "이 소켓을 채우면, 이 무더기에서 저 무더기로 옮기는 운반자가 나온다" */

      _export("CourierRoute", CourierRoute = (_dec = ccclass('CourierRoute'), _dec2 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '반응할 트리거 ID',
        tooltip: '소켓 목록에서 이 트리거 ID를 가진 소켓이 요구치를 채우는 순간 이 노선의 운반자가 등장한다'
      }), _dec3 = property({
        type: _crd && CoinGroundStack === void 0 ? (_reportPossibleCrUseOfCoinGroundStack({
          error: Error()
        }), CoinGroundStack) : CoinGroundStack,
        displayName: '출발 무더기',
        tooltip: '운반자가 코인을 퍼올 coin_ground — 보통 이 소켓과 같은 섹터(타워가 처치한 코인이 쌓이는 곳)'
      }), _dec4 = property({
        type: _crd && CoinGroundStack === void 0 ? (_reportPossibleCrUseOfCoinGroundStack({
          error: Error()
        }), CoinGroundStack) : CoinGroundStack,
        displayName: '도착 무더기',
        tooltip: '운반자가 코인을 내려놓을 coin_ground — 보통 기지 앞의 공용 무더기. 여러 노선이 같은 곳을 가리켜도 된다'
      }), _dec5 = property({
        displayName: '운반자 수',
        tooltip: '이 노선에 배정할 운반자 수. 늘리면 그만큼 빨리 옮기지만 같은 무더기를 나눠 퍼가는 것이므로 총량은 같다'
      }), _dec(_class = (_class2 = class CourierRoute {
        constructor() {
          _initializerDefineProperty(this, "triggerId", _descriptor, this);

          _initializerDefineProperty(this, "sourceStack", _descriptor2, this);

          _initializerDefineProperty(this, "destStack", _descriptor3, this);

          _initializerDefineProperty(this, "courierCount", _descriptor4, this);
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
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sourceStack", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "destStack", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "courierCount", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      })), _class2)) || _class));
      /**
       * 소켓 충족을 신호로 "코인 운반자" 추종자를 배치하는 컨트롤러.
       *
       * 스폰/이동/코인 이동 로직을 새로 만들지 않는다 — CoinEvents.SocketFilled(BuildingTrigger나
       * BossRushManager가 반응하는 것과 똑같은 이벤트)만 구독하고, 실제 일은 스폰한 노드에 붙인
       * CoinCourier가 한다. 어느 소켓이 어느 무더기에서 어디로 옮기는지는 전부 아래 노선 표(씬
       * 데이터)에 있으므로, 이 스크립트에는 씬별 분기가 하나도 없다.
       *
       * **운반자가 전투하지 않는 이유**: 스폰 직후 `Player.combatEnabled`를 false로 둔다(고스트
       * 상태의 추종자를 비전투로 만드는 FollowerGhostState와 같은 스위치). 몬스터 쪽은 기지와 문만
       * 공격하므로(Monster.ts) 운반자가 피격되는 경로도 없다 — 운반 루프가 전투로 끊기지 않는다.
       *
       * **등 뒤 스택 설정을 프리팹이 아니라 여기 두는 이유**: 추종자 프리팹(Follower.prefab)은
       * 다른 씬과 공유하는 자산이라, 거기에 CoinStack을 붙이면 운반자가 아닌 전투 추종자들까지
       * 전부 등에 코인을 달게 된다. 그래서 프리팹은 건드리지 않고 스폰 시점에 CoinStack을
       * 붙이면서 아래 값들을 주입한다.
       */


      _export("CoinCourierManager", CoinCourierManager = (_dec6 = ccclass('CoinCourierManager'), _dec7 = property({
        type: [CourierRoute],
        displayName: '운반 노선 목록',
        tooltip: '트리거 ID별로 "어디서 어디로" 옮길지 등록. 같은 트리거 ID로 여러 줄을 넣으면 그 트리거에서 여러 노선이 동시에 생긴다. 같은 트리거는 한 번만 발동한다'
      }), _dec8 = property({
        type: Prefab,
        displayName: '운반자 프리팹',
        tooltip: '운반자로 쓸 프리팹. 일꾼 외형(크로스보우 없음 + 평범한 걷기 그래프 + 크기 0.8)이 미리 적용된 Worker.prefab을 쓴다. 스폰 직후 전투를 꺼두므로(Player.combatEnabled=false) 전투 컴포넌트가 붙어 있어도 공격하지 않는다'
      }), _dec9 = property({
        type: _crd && CoinPool === void 0 ? (_reportPossibleCrUseOfCoinPool({
          error: Error()
        }), CoinPool) : CoinPool,
        displayName: '코인 풀',
        tooltip: '운반자가 코인을 내려놓을 때 쓰는 풀 — 씬의 CoinSystem에 있는 것과 같은 것을 연결'
      }), _dec10 = property({
        displayName: '적재 용량(개)',
        tooltip: '한 번에 등에 싣고 갈 코인 개수. 이만큼 채우면 도착 무더기로 출발한다'
      }), _dec11 = property({
        displayName: '싣는 간격(초)',
        tooltip: '출발 무더기에서 코인을 한 개씩 등으로 빨아들이는 주기'
      }), _dec12 = property({
        displayName: '내리는 간격(초)',
        tooltip: '도착 무더기에 코인을 한 개씩 내려놓는 주기'
      }), _dec13 = property({
        displayName: '도착 판정 거리(m)',
        tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다'
      }), _dec14 = property({
        displayName: '이동 속도',
        tooltip: '운반자의 걷는 속도(Player.moveSpeed를 덮어씀). 0 이하면 프리팹 값을 그대로 쓴다'
      }), _dec15 = property({
        displayName: '숨길 무기 노드 이름 접두어',
        tooltip: '운반자에게서 감출 메시 노드의 이름 접두어. 이 접두어로 시작하는 자식 노드의 렌더러를 끈다(예: crossbow → crossbow001/crossbow002). 노드를 지우지 않고 렌더러만 끄므로 뼈대/애니메이션은 그대로다. 비워두면 아무것도 감추지 않는다'
      }), _dec16 = property({
        type: Prefab,
        displayName: '등 코인 프리팹',
        tooltip: '운반자 등에 쌓일 코인 비주얼. 플레이어 CoinStack에 쓰는 것과 같은 프리팹을 넣으면 된다'
      }), _dec17 = property({
        displayName: '등 코인 간격(m)',
        tooltip: '등에 위로 쌓을 때의 간격'
      }), _dec18 = property({
        displayName: '등 스택 로컬 오프셋',
        tooltip: '운반자 노드 기준 등 뒤 로컬 위치'
      }), _dec19 = property({
        displayName: '등 코인 회전(Euler)',
        tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 등에 눕혀 쌓으려면 X를 -90으로'
      }), _dec20 = property({
        type: Prefab,
        displayName: '등장 이펙트 프리팹',
        tooltip: '일꾼이 나타나는 순간 그 발밑에 깔릴 이펙트(efffect2). 비워두면 이펙트를 만들지 않는다'
      }), _dec21 = property({
        type: Material,
        displayName: '등장 이펙트 발광 재질',
        tooltip: 'effects/GlowFx.mtl — 엔딩 이펙트(efffect1)와 같은 것을 넣으면 색·텍스처가 정확히 같아진다. 비워두면 glb가 들고 있던 머티리얼을 그대로 쓴다'
      }), _dec22 = property({
        type: CCFloat,
        displayName: '등장 이펙트 유지 시간(초)',
        tooltip: '나타난 뒤 이 시간 동안은 그대로 보여주고, 그 다음부터 사라지기 시작한다'
      }), _dec23 = property({
        type: CCFloat,
        displayName: '등장 이펙트 페이드아웃(초)',
        tooltip: '사라지는 데 걸리는 시간. 유지 시간 + 이 값이 총 노출 시간이다'
      }), _dec24 = property({
        type: CCFloat,
        displayName: '등장 이펙트 발광 세기',
        tooltip: 'GlowFx 머티리얼의 emissiveIntensity. 보이는 부분만 이 배율만큼 밝아진다',
        range: [0, 10],
        slide: true
      }), _dec25 = property({
        type: CCFloat,
        displayName: '등장 이펙트 크기',
        tooltip: '프리팹 원래 크기에 곱할 배율'
      }), _dec26 = property({
        displayName: '등장 이펙트 바닥 맞춤',
        tooltip: '메시가 노드 원점보다 아래로 뻗어 있어도 바닥면이 일꾼 발밑에 오도록 자동으로 들어올린다. efffect2의 메시는 원점 기준 Y -1 ~ -0.17에 걸쳐 있어서(원점이 위쪽 끝) 이 보정이 없으면 통째로 땅에 묻힌다. 끄면 아래 높이 값만 적용된다'
      }), _dec27 = property({
        type: CCFloat,
        displayName: '등장 이펙트 높이(m)',
        tooltip: '위의 바닥 맞춤 결과에서 추가로 위(+)/아래(-)로 얼마나 더 띄울지. 바닥과 정확히 같은 높이면 서로 파고들어 깜빡이므로 살짝 띄우는 게 안전하다'
      }), _dec6(_class4 = (_class5 = class CoinCourierManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "routes", _descriptor5, this);

          _initializerDefineProperty(this, "courierPrefab", _descriptor6, this);

          _initializerDefineProperty(this, "coinPool", _descriptor7, this);

          // ── 운반자 동작 값 (스폰 시 CoinCourier에 주입) ─────────────────────────────
          _initializerDefineProperty(this, "capacity", _descriptor8, this);

          _initializerDefineProperty(this, "pickupInterval", _descriptor9, this);

          _initializerDefineProperty(this, "depositInterval", _descriptor10, this);

          _initializerDefineProperty(this, "arriveDist", _descriptor11, this);

          _initializerDefineProperty(this, "moveSpeed", _descriptor12, this);

          // ── 일꾼 외형 (전투 추종자와 같은 프리팹을 쓰면서 무기만 빼고 걸음걸이만 바꾼다) ──
          _initializerDefineProperty(this, "weaponNodePrefix", _descriptor13, this);

          // ── 등 뒤 코인 스택 비주얼 (스폰 시 CoinStack에 주입) ───────────────────────
          _initializerDefineProperty(this, "backStackCoinPrefab", _descriptor14, this);

          _initializerDefineProperty(this, "backStackSpacing", _descriptor15, this);

          _initializerDefineProperty(this, "backStackOrigin", _descriptor16, this);

          _initializerDefineProperty(this, "backStackRotation", _descriptor17, this);

          // ── 등장 이펙트 (일꾼 발밑에서 퍼지는 원형 이펙트) ──────────────────────────
          // 페이드/발광 처리는 EndingEffect를 그대로 재사용한다 — 같은 로직을 두 벌 두지 않기 위함.
          _initializerDefineProperty(this, "spawnEffectPrefab", _descriptor18, this);

          _initializerDefineProperty(this, "spawnEffectMaterial", _descriptor19, this);

          _initializerDefineProperty(this, "spawnEffectHold", _descriptor20, this);

          _initializerDefineProperty(this, "spawnEffectFade", _descriptor21, this);

          _initializerDefineProperty(this, "spawnEffectEmissive", _descriptor22, this);

          _initializerDefineProperty(this, "spawnEffectScale", _descriptor23, this);

          _initializerDefineProperty(this, "spawnEffectAutoGround", _descriptor24, this);

          _initializerDefineProperty(this, "spawnEffectHeight", _descriptor25, this);

          /** 같은 트리거로 두 번 배치하지 않기 위한 기록 (BossRushManager와 같은 방식) */
          this._firedTriggerIds = new Set();
        }

        onLoad() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);
        }

        _onSocketFilled(triggerId) {
          if (this._firedTriggerIds.has(triggerId)) return;
          const matches = this.routes.filter(r => r.triggerId === triggerId && r.sourceStack && r.destStack);
          if (matches.length === 0) return;

          this._firedTriggerIds.add(triggerId);

          for (const route of matches) {
            for (let i = 0; i < Math.max(1, route.courierCount); i++) this._spawnCourier(route);
          }
        }

        _spawnCourier(route) {
          var _this$node$scene, _node$getComponent, _node$getComponent2;

          if (!this.courierPrefab) return;
          const node = instantiate(this.courierPrefab); // 출발 무더기 옆에서 등장시킨다 — 소켓 자리와 같은 섹터이므로 플레이어가 소켓을 채운
          // 그 자리에서 바로 나타나는 것처럼 보인다. 무더기 자신이 배치상 스케일/회전을 갖고
          // 있을 수 있으므로 자식으로 붙이지 않고 씬 루트에 붙여 월드 좌표만 맞춘다.

          const parent = (_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node.parent;
          parent.addChild(node);
          node.setWorldPosition(route.sourceStack.node.worldPosition); // 등 뒤 스택 — 프리팹에는 없으므로(다른 씬의 전투 추종자에 영향을 주지 않기 위해)
          // 여기서 붙이고 설정을 주입한다. initialCoins는 반드시 0 (빈 등으로 시작).

          const back = (_node$getComponent = node.getComponent(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
            error: Error()
          }), CoinStack) : CoinStack)) != null ? _node$getComponent : node.addComponent(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
            error: Error()
          }), CoinStack) : CoinStack);
          back.stackCoinPrefab = this.backStackCoinPrefab;
          back.stackSpacing = this.backStackSpacing;
          back.stackOrigin = this.backStackOrigin.clone();
          back.stackRotation = this.backStackRotation.clone();
          back.initialCoins = 0;
          const courier = (_node$getComponent2 = node.getComponent(_crd && CoinCourier === void 0 ? (_reportPossibleCrUseOfCoinCourier({
            error: Error()
          }), CoinCourier) : CoinCourier)) != null ? _node$getComponent2 : node.addComponent(_crd && CoinCourier === void 0 ? (_reportPossibleCrUseOfCoinCourier({
            error: Error()
          }), CoinCourier) : CoinCourier);
          courier.sourceStack = route.sourceStack;
          courier.destStack = route.destStack;
          courier.coinPool = this.coinPool;
          courier.capacity = this.capacity;
          courier.pickupInterval = this.pickupInterval;
          courier.depositInterval = this.depositInterval;
          courier.arriveDist = this.arriveDist;
          const player = node.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player);

          if (player) {
            // 운반에만 전념시킨다 — 이 스위치를 끄면 Player.update()가 타깃 탐색 자체를
            // 건너뛰므로(Player.ts 109행) 공격도, 상체 공격 애니메이션도 나오지 않는다.
            // 상체(공격) 레이어의 가중치도 항상 0으로 눌려 있게 된다(Player.ts 158행).
            player.combatEnabled = false;
            if (this.moveSpeed > 0) player.moveSpeed = this.moveSpeed;
          } // 애니메이션 그래프(걸음걸이)는 여기서 바꿀 수 없다 — 반드시 프리팹 쪽에 박아야 한다.
          // AnimationController.graph의 setter는 값만 저장하고(engine animation-controller.ts:72),
          // 실제 평가기는 __preload()에서 딱 한 번 만들어진다(:91). __preload는 컴포넌트 초기화
          // 시점에 이미 끝나 있으므로, 스폰 후 graph를 대입해도 평가기가 다시 만들어지지 않아
          // 조용히 무효다(실제로 그렇게 만들었다가 일꾼이 계속 크로스보우 자세로 걸었다).
          // → 일꾼 전용 그래프는 Worker.prefab의 AnimationController에 직접 지정해 둔다.
          // 무기 메시만 끈다(노드는 남긴다) — 노드를 지우면 그 뼈대를 참조하는 스켈레톤
          // 애니메이션이 끊어질 수 있고, 무엇보다 Follower.prefab은 다른 씬과 공유하는
          // 자산이라 프리팹 자체를 고칠 수 없다.


          if (this.weaponNodePrefix) {
            for (const r of node.getComponentsInChildren(SkinnedMeshRenderer)) {
              if (r.node.name.startsWith(this.weaponNodePrefix)) r.enabled = false;
            }
          }

          this._spawnBurst(node.worldPosition);
        }
        /** 일꾼이 나타난 자리(발밑)에 원형 이펙트를 하나 깔고, 알아서 사라지게 둔다.
         *
         * 새 컴포넌트를 만들지 않고 EndingEffect를 재사용한다 — 발광 머티리얼 교체, alphaScale
         * 페이드, 다 끝난 뒤 정리까지 이미 거기 다 있다. 다만 이건 씬에 미리 놓인 엔딩 이펙트가
         * 아니라 매번 새로 만드는 1회성이라 두 스위치를 반대로 준다:
         *  - registerToPlayAll = false : 엔딩 때 playAll()로 되살아나면 안 된다
         *  - destroyOnFinish   = true  : 끄기만 하면 노드가 계속 쌓인다
         * hideOnStart도 false여야 한다(만들자마자 보여야 하므로). */


        _spawnBurst(atWorld) {
          var _this$node$scene2;

          if (!this.spawnEffectPrefab) return;
          const parent = (_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node.parent;
          if (!parent) return;
          const fx = instantiate(this.spawnEffectPrefab);
          const k = this.spawnEffectScale;
          if (k !== 1) fx.setScale(fx.scale.x * k, fx.scale.y * k, fx.scale.z * k); // ⚠ 컴포넌트를 붙이는 건 반드시 addChild "전"이어야 한다.
          // Node.addComponent는 노드가 이미 활성 계층에 있으면 그 자리에서 onLoad를 동기 호출한다
          // (engine node.ts:1136 `if (this._activeInHierarchy) activateComp(...)`). 먼저 addChild하면
          // 아래 값들을 넣기 전에 onLoad가 돌아버려서 (a) glowMaterial이 null인 채로 지나가 발광
          // 머티리얼로 교체되지 않고(=glb의 builtin-standard 그대로 → 이 프로젝트에선 아예 안 보일
          // 수 있다), (b) hideOnStart가 true라 노드가 꺼진다. 실제로 그래서 이펙트가 안 보였다.

          const e = fx.addComponent(_crd && EndingEffect === void 0 ? (_reportPossibleCrUseOfEndingEffect({
            error: Error()
          }), EndingEffect) : EndingEffect);
          e.glowMaterial = this.spawnEffectMaterial;
          e.hideOnStart = false;
          e.registerToPlayAll = false;
          e.destroyOnFinish = true;
          e.holdDuration = this.spawnEffectHold;
          e.fadeDuration = this.spawnEffectFade;
          e.emissiveIntensity = this.spawnEffectEmissive;
          parent.addChild(fx); // 여기서 비로소 onLoad가 돈다 — 위 값들이 전부 반영된 상태로

          fx.setWorldPosition(atWorld.x, atWorld.y + this._groundLift(fx) + this.spawnEffectHeight, atWorld.z);
          e.play();
        }
        /** 메시가 노드 원점보다 아래로 뻗어 있으면 그만큼 들어올릴 양(월드 m).
         * efffect2는 메시 Y 범위가 -1 ~ -0.17이라(원점이 원기둥 위쪽 끝) 보정 없이 발밑에 놓으면
         * 전부 지면 아래로 들어가 안 보인다. 메시 자체의 로컬 AABB 최저점을 읽어 스케일까지 곱해
         * 계산하므로, 크기를 바꿔도 바닥면이 계속 발밑에 맞는다. */


        _groundLift(fx) {
          if (!this.spawnEffectAutoGround) return 0;
          let minY = Infinity;

          for (const r of fx.getComponentsInChildren(MeshRenderer)) {
            var _r$mesh;

            const mn = (_r$mesh = r.mesh) == null ? void 0 : _r$mesh.struct.minPosition;
            if (mn) minY = Math.min(minY, mn.y);
          }

          if (minY === Infinity || minY >= 0) return 0;
          return -minY * fx.worldScale.y;
        }

      }, (_descriptor5 = _applyDecoratedDescriptor(_class5.prototype, "routes", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class5.prototype, "courierPrefab", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class5.prototype, "coinPool", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class5.prototype, "capacity", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "pickupInterval", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.05;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "depositInterval", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.05;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "arriveDist", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "moveSpeed", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "weaponNodePrefix", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'crossbow';
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "backStackCoinPrefab", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "backStackSpacing", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.12;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "backStackOrigin", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(0, 1.0, -0.4);
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class5.prototype, "backStackRotation", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(-90, 0, 0);
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectPrefab", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectMaterial", [_dec21], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectHold", [_dec22], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectFade", [_dec23], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectEmissive", [_dec24], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectScale", [_dec25], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor24 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectAutoGround", [_dec26], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor25 = _applyDecoratedDescriptor(_class5.prototype, "spawnEffectHeight", [_dec27], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.03;
        }
      })), _class5)) || _class4));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=112ca4829486b0445cc078220b2dc4bbc80414de.js.map