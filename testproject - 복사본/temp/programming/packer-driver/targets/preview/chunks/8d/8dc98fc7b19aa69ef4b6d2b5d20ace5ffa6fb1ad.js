System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Player, CoinStack, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, CourierState, CoinCourier;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStack(extras) {
    _reporterNs.report("CoinStack", "./CoinStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinGroundStack(extras) {
    _reporterNs.report("CoinGroundStack", "./CoinGroundStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinPool(extras) {
    _reporterNs.report("CoinPool", "./CoinPool", _context.meta, extras);
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
      Vec2 = _cc.Vec2;
    }, function (_unresolved_2) {
      Player = _unresolved_2.Player;
    }, function (_unresolved_3) {
      CoinStack = _unresolved_3.CoinStack;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9b910v2JpVNK6FYsU2JF/+Z", "CoinCourier", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 운반자가 지금 무엇을 하고 있는지. */

      CourierState = /*#__PURE__*/function (CourierState) {
        CourierState[CourierState["ToSource"] = 0] = "ToSource";
        CourierState[CourierState["Loading"] = 1] = "Loading";
        CourierState[CourierState["ToDest"] = 2] = "ToDest";
        CourierState[CourierState["Unloading"] = 3] = "Unloading";
        return CourierState;
      }(CourierState || {});
      /**
       * 소켓 보상으로 나오는 "코인 운반자" 추종자. 자기 섹터의 coin_ground에 쌓인 코인을 등에
       * 지고(용량만큼) 기지 앞 coin_ground로 옮기는 일을 계속 반복한다.
       *
       * 이 컴포넌트는 이동/애니메이션/전투를 직접 구현하지 않는다 — FollowerMovement와 똑같이
       * `Player.moveDirOverride`에 "지금 목표로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이고,
       * 실제 이동과 걷기/대기 애니메이션은 전부 Player.ts가 그대로 담당한다.
       *
       * **전투를 하지 않는 이유**: CoinCourierManager가 스폰 직후 `Player.combatEnabled`를 false로
       * 둔다(고스트 상태의 추종자를 비전투로 만드는 FollowerGhostState와 같은 스위치). 몬스터 쪽은
       * 기지와 문만 공격하므로(Monster.ts) 운반자가 피격되는 경로도 애초에 없다 — 즉 운반 루프가
       * 전투 때문에 끊기지 않는다.
       *
       * **코인 이동 자체도 새로 만들지 않는다** — 싣기는 CoinGroundStack.transferOneTo()로 플레이어가
       * 직접 주울 때와 완전히 같은 경로(팝 → 자석 추적 → 등 뒤 슬롯)를 타고, 내리기는 등 뒤 스택에서
       * 하나 빼서 CoinPool.spawn()으로 목적지 무더기를 향해 날린다. 그래서 손맛이 항상 같다.
       */


      _export("CoinCourier", CoinCourier = (_dec = ccclass('CoinCourier'), _dec2 = property({
        displayName: '적재 용량(개)',
        tooltip: '한 번에 등에 싣고 갈 코인 개수. 이만큼 채우면 목적지로 출발한다. 출발 무더기의 코인이 이보다 적으면 있는 만큼만 싣고 출발한다'
      }), _dec3 = property({
        displayName: '싣는 간격(초)',
        tooltip: '출발 무더기에서 코인을 한 개씩 등으로 빨아들이는 주기. 작을수록 우르르 빨려온다'
      }), _dec4 = property({
        displayName: '내리는 간격(초)',
        tooltip: '목적지 무더기에 코인을 한 개씩 내려놓는 주기'
      }), _dec5 = property({
        displayName: '도착 판정 거리(m)',
        tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다'
      }), _dec6 = property({
        displayName: '내릴 때 자석 반경(m)',
        tooltip: '내려놓는 코인이 목적지 무더기로 곧장 날아가도록 충분히 크게 둔다 (플레이어 회수와 같은 방식)'
      }), _dec(_class = (_class2 = class CoinCourier extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "capacity", _descriptor, this);

          _initializerDefineProperty(this, "pickupInterval", _descriptor2, this);

          _initializerDefineProperty(this, "depositInterval", _descriptor3, this);

          _initializerDefineProperty(this, "arriveDist", _descriptor4, this);

          _initializerDefineProperty(this, "depositMagnetRadius", _descriptor5, this);

          // ── 스폰 시점에 CoinCourierManager가 주입하는 참조들 (프리팹은 씬 노드를 담을 수 없다) ──

          /** 코인을 퍼올 출발 무더기 (자기 섹터의 coin_ground) */
          this.sourceStack = null;

          /** 코인을 내려놓을 목적지 무더기 (기지 앞 coin_ground) */
          this.destStack = null;

          /** 내려놓을 때 코인을 날리기 위해 쓰는 풀 — 씬의 CoinPool 하나를 모두가 공유한다 */
          this.coinPool = null;
          this._player = null;
          this._back = null;
          this._state = CourierState.ToSource;
          this._timer = 0;

          /** 출발 무더기에서 빼왔지만 아직 목적지에 내리지 않은 개수 — **날아오는 중인 코인까지 포함**한다.
           * 등 뒤 스택의 count는 코인이 실제로 "도착"해야 올라가므로, 그것만 보고 용량을 판단하면
           * 날아오는 중인 코인을 세지 못해 용량을 초과해 퍼오게 된다. */
          this._claimed = 0;
        }

        onLoad() {
          this._player = this.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player);
          this._back = this.getComponent(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
            error: Error()
          }), CoinStack) : CoinStack);
        }

        update(dt) {
          if (!this._player || !this._back || !this.sourceStack || !this.destStack) return;

          switch (this._state) {
            case CourierState.ToSource:
              if (this._moveTo(this.sourceStack.node)) {
                this._state = CourierState.Loading;
                this._timer = 0;
              }

              break;

            case CourierState.Loading:
              this._stand();

              this._tickLoading(dt);

              break;

            case CourierState.ToDest:
              if (this._moveTo(this.destStack.node)) {
                this._state = CourierState.Unloading;
                this._timer = 0;
              }

              break;

            case CourierState.Unloading:
              this._stand();

              this._tickUnloading(dt);

              break;
          }
        }
        /** 출발 무더기 옆에서 등에 싣는다. 용량을 채우면 출발하고, 무더기가 비었는데 실은 것이
         * 있으면 있는 만큼만 들고 출발한다. 둘 다 아니면(무더기가 비었고 실은 것도 없으면) 아무
         * 일도 하지 않고 여기서 계속 대기한다 — 타워가 몬스터를 잡아 코인이 새로 생기는 순간
         * 다음 프레임부터 저절로 다시 싣기 시작한다. */


        _tickLoading(dt) {
          if (this._claimed >= this.capacity) {
            this._state = CourierState.ToDest;
            return;
          }

          this._timer += dt;
          if (this._timer < this.pickupInterval) return;
          this._timer = 0;

          if (this.sourceStack.transferOneTo(this.node, this._back)) {
            this._claimed++;
            if (this._claimed >= this.capacity) this._state = CourierState.ToDest;
            return;
          } // 무더기가 비었다 — 조금이라도 실었으면 그것만 들고 출발, 아니면 계속 대기.


          if (this._claimed > 0) this._state = CourierState.ToDest;
        }
        /** 목적지에서 등 뒤 스택을 하나씩 비운다. 아직 날아오는 중인 코인이 있으면(_claimed가
         * 남아 있는데 등에는 아직 없는 상태) 그것이 도착할 때까지 여기서 기다린다 — 그래야 퍼온
         * 코인을 한 개도 잃지 않는다. */


        _tickUnloading(dt) {
          var _this$coinPool;

          if (this._claimed <= 0) {
            this._state = CourierState.ToSource;
            return;
          }

          this._timer += dt;
          if (this._timer < this.depositInterval) return;
          this._timer = 0;

          var coin = this._back.popTop();

          if (!coin) return; // 아직 날아오는 중 — 도착을 기다린다

          var pos = coin.worldPosition.clone();
          coin.destroy();
          this._claimed--;
          (_this$coinPool = this.coinPool) == null || _this$coinPool.spawn(pos, this.destStack.node, this.depositMagnetRadius, this.destStack, true);
          if (this._claimed <= 0) this._state = CourierState.ToSource;
        }
        /** 목표 노드 쪽으로 걷게 한다. 도착했으면 true. 좌표 변환은 FollowerMovement와 동일
         * (Player.ts 조이스틱 좌표계: worldX = joyX, worldZ = -joyY). */


        _moveTo(target) {
          var p = this.node.worldPosition;
          var t = target.worldPosition;
          var dx = t.x - p.x;
          var dz = t.z - p.z;
          var dist = Math.hypot(dx, dz);

          if (dist <= this.arriveDist) {
            this._stand();

            return true;
          }

          var inv = 1 / dist;
          this._player.moveDirOverride = new Vec2(dx * inv, -dz * inv);
          return false;
        }

        _stand() {
          this._player.moveDirOverride = Vec2.ZERO;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "capacity", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "pickupInterval", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "arriveDist", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "depositMagnetRadius", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 999;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8dc98fc7b19aa69ef4b6d2b5d20ace5ffa6fb1ad.js.map