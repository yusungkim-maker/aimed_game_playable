System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, instantiate, Coin, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _crd, ccclass, property, CoinPool;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoin(extras) {
    _reporterNs.report("Coin", "./Coin", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinTuning(extras) {
    _reporterNs.report("CoinTuning", "./Coin", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStackTarget(extras) {
    _reporterNs.report("CoinStackTarget", "./CoinStack", _context.meta, extras);
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
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      Coin = _unresolved_2.Coin;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "00d06B7uStLyaNlFmvTWUYj", "CoinPool", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Prefab', 'Node', 'instantiate', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 드롭 코인 오브젝트 풀. 몬스터 처치 지점마다 스폰 요청이 들어오면 재사용 가능한 코인
       * 노드를 꺼내주고, 수집이 끝나면 다시 반환받아 비활성 상태로 보관한다.
       *
       * 코인은 런타임에 addComponent(Coin)으로 붙기 때문에 Coin.ts 자체엔 씬에 저장되는
       * 인스펙터 값이 없다 — 코인의 모든 동작 수치(자전/튐/팝 연출/자석 이동)는 여기 CoinPool
       * 인스펙터에서 조정하고, spawn 시점에 Coin에게 그대로 전달한다.
       */

      _export("CoinPool", CoinPool = (_dec = ccclass('CoinPool'), _dec2 = property({
        type: Prefab,
        displayName: '코인 프리팹',
        tooltip: 'coin.glb의 자동 생성 프리팹(정적 메쉬, 애니메이션 클립 없음)'
      }), _dec3 = property({
        displayName: '초기 풀 크기'
      }), _dec4 = property({
        displayName: '팝 최고 높이(m)',
        tooltip: '스폰 시 튀어오르는 최고 높이'
      }), _dec5 = property({
        displayName: '팝 지속시간(초)',
        tooltip: '스폰~착지까지 걸리는 시간. 이 동안은 자석 반경의 영향을 받지 않음'
      }), _dec6 = property({
        displayName: '팝 랜덤 스캐터 반경(m)',
        tooltip: '착지 지점이 랜덤한 수평 방향으로 퍼지는 최대 거리. 0이면 제자리에서 위로만 튐'
      }), _dec7 = property({
        displayName: '착지 Y 위치(m)',
        tooltip: '코인 두께 때문에 지면(y=0)에 파묻혀 보이지 않도록 살짝 띄운 높이'
      }), _dec8 = property({
        displayName: '착지 시 X 회전(도)',
        tooltip: '코인 메쉬가 세워진 채로 임포트되어, 바닥에 눕히려면 -90'
      }), _dec9 = property({
        displayName: '자전 속도(deg/s)'
      }), _dec10 = property({
        displayName: '대기 중 상하 진폭(m)'
      }), _dec11 = property({
        displayName: '대기 중 상하 진동 속도'
      }), _dec12 = property({
        displayName: '수집 속도 계수',
        tooltip: '남은 거리를 초당 얼마나 좁히는지에 대한 계수. 클수록 빠르게 수렴함 — 거리 비례로 움직이므로 처음엔 빠르고 도착할수록 자연히 느려짐(고정 속도가 아님)'
      }), _dec13 = property({
        displayName: '최소 수집 속도(m/s)',
        tooltip: '거리 비례 속도의 하한선. 캐릭터의 최대 이동 속도보다 반드시 커야 한다 — 그렇지 않으면 캐릭터가 계속 이동할 때 코인이 등 뒤 자리를 영원히 따라잡지 못하고 붕 뜬 채로 남는다'
      }), _dec14 = property({
        displayName: '수집 곡선 높이(m)',
        tooltip: '자석에 끌려 등 위 자리로 갈 때 위로 볼록하게 그리는 곡선의 높이. 0이면 직선 이동'
      }), _dec15 = property({
        displayName: '수집 완료 판정 거리(m)'
      }), _dec(_class = (_class2 = class CoinPool extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "coinPrefab", _descriptor, this);

          _initializerDefineProperty(this, "initialSize", _descriptor2, this);

          // ── 팝(스폰 연출) ────────────────────────────────────────────────────
          _initializerDefineProperty(this, "popHeight", _descriptor3, this);

          _initializerDefineProperty(this, "popDuration", _descriptor4, this);

          _initializerDefineProperty(this, "popScatterFactor", _descriptor5, this);

          _initializerDefineProperty(this, "groundY", _descriptor6, this);

          _initializerDefineProperty(this, "groundRotationX", _descriptor7, this);

          // ── 대기 중 비주얼 ───────────────────────────────────────────────────
          _initializerDefineProperty(this, "spinSpeed", _descriptor8, this);

          _initializerDefineProperty(this, "bobHeight", _descriptor9, this);

          _initializerDefineProperty(this, "bobSpeed", _descriptor10, this);

          // ── 자석 수집 ────────────────────────────────────────────────────────
          _initializerDefineProperty(this, "collectEaseRate", _descriptor11, this);

          _initializerDefineProperty(this, "collectMinSpeed", _descriptor12, this);

          _initializerDefineProperty(this, "collectArcHeight", _descriptor13, this);

          _initializerDefineProperty(this, "collectArriveDist", _descriptor14, this);

          this._pool = [];
        }

        onLoad() {
          if (!this.coinPrefab) return;

          for (var i = 0; i < this.initialSize; i++) this._pool.push(this._createInstance());
        }

        _createInstance() {
          var node = instantiate(this.coinPrefab);
          node.active = false;
          this.node.addChild(node);
          if (!node.getComponent(_crd && Coin === void 0 ? (_reportPossibleCrUseOfCoin({
            error: Error()
          }), Coin) : Coin)) node.addComponent(_crd && Coin === void 0 ? (_reportPossibleCrUseOfCoin({
            error: Error()
          }), Coin) : Coin);
          return node;
        }

        _tuning() {
          return {
            spinSpeed: this.spinSpeed,
            bobHeight: this.bobHeight,
            bobSpeed: this.bobSpeed,
            collectEaseRate: this.collectEaseRate,
            collectMinSpeed: this.collectMinSpeed,
            collectArcHeight: this.collectArcHeight,
            collectArriveDist: this.collectArriveDist,
            popHeight: this.popHeight,
            popDuration: this.popDuration,
            popScatterFactor: this.popScatterFactor,
            groundY: this.groundY,
            groundRotationX: this.groundRotationX
          };
        }
        /**
         * 코인 하나를 꺼내 pos 위치에서 팝(스폰 연출) 후 target을 향한 자석 추적을 시작시킨다.
         * stack을 넘기면 자석에 걸렸을 때 캐릭터가 아니라 그 스택의 다음 빈 자리로 끌려간다.
         */


        spawn(pos, target, magnetRadius, stack) {
          var _this$_pool$pop;

          if (stack === void 0) {
            stack = null;
          }

          var node = (_this$_pool$pop = this._pool.pop()) != null ? _this$_pool$pop : this._createInstance();
          node.getComponent(_crd && Coin === void 0 ? (_reportPossibleCrUseOfCoin({
            error: Error()
          }), Coin) : Coin).activate(pos, target, magnetRadius, this, this._tuning(), stack);
          return node;
        }
        /** Coin.ts가 수집 완료 시 호출 — 풀로 반환 */


        despawn(node) {
          node.active = false;

          this._pool.push(node);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "coinPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "initialSize", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 16;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "popHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "popDuration", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "popScatterFactor", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "groundY", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.07;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "groundRotationX", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return -90;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "spinSpeed", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 180;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "bobHeight", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.12;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "bobSpeed", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "collectEaseRate", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 6;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "collectMinSpeed", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "collectArcHeight", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "collectArriveDist", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.35;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=514222908e2a0528d6d97564c94e2a6c699c16d3.js.map