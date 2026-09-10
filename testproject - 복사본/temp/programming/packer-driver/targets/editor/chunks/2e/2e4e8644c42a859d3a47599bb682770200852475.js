System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Sprite, Node, CCFloat, Vec3, CameraFollow, CoinSpawnController, EndingEffect, CoinEvents, CoinEventName, MonsterSpawner, JoystickUI, StructureHealthBar, StructureHitFlash, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _class3, _crd, ccclass, property, GameManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCameraFollow(extras) {
    _reporterNs.report("CameraFollow", "./CameraFollow", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinSpawnController(extras) {
    _reporterNs.report("CoinSpawnController", "./CoinSpawnController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEndingEffect(extras) {
    _reporterNs.report("EndingEffect", "./EndingEffect", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonster(extras) {
    _reporterNs.report("Monster", "./Monster", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickUI(extras) {
    _reporterNs.report("JoystickUI", "./JoystickUI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStructureHealthBar(extras) {
    _reporterNs.report("StructureHealthBar", "./StructureHealthBar", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStructureHitFlash(extras) {
    _reporterNs.report("StructureHitFlash", "./StructureHitFlash", _context.meta, extras);
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
      Sprite = _cc.Sprite;
      Node = _cc.Node;
      CCFloat = _cc.CCFloat;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      CameraFollow = _unresolved_2.CameraFollow;
    }, function (_unresolved_3) {
      CoinSpawnController = _unresolved_3.CoinSpawnController;
    }, function (_unresolved_4) {
      EndingEffect = _unresolved_4.EndingEffect;
    }, function (_unresolved_5) {
      CoinEvents = _unresolved_5.CoinEvents;
      CoinEventName = _unresolved_5.CoinEventName;
    }, function (_unresolved_6) {
      MonsterSpawner = _unresolved_6.MonsterSpawner;
    }, function (_unresolved_7) {
      JoystickUI = _unresolved_7.JoystickUI;
    }, function (_unresolved_8) {
      StructureHealthBar = _unresolved_8.StructureHealthBar;
    }, function (_unresolved_9) {
      StructureHitFlash = _unresolved_9.StructureHitFlash;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d73a4vATBpH+KUfX1MZFI7v", "GameManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Sprite', 'Node', 'CCFloat', 'Vec3']); // Monster.ts가 GameManager를 참조하므로 런타임 순환 참조가 생기지 않도록 타입으로만 가져온다


      ({
        ccclass,
        property
      } = _decorator);

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec2 = property(Sprite), _dec3 = property(Node), _dec4 = property({
        type: Node,
        displayName: '기지(base) 노드',
        tooltip: '몬스터가 처음 데미지를 줄 때 이 노드 위에 체력바(StructureHealthBar)를 노출시키기 위해 참조'
      }), _dec5 = property({
        type: Node,
        displayName: '어둡게 가릴 배경',
        tooltip: 'CTA 버튼이 뜰 때 화면 전체를 반투명 검정으로 덮는 배경. ctaPanel과 함께 켜진다'
      }), _dec6 = property({
        type: Node,
        displayName: '조이스틱(Joystick_Base) 노드',
        tooltip: 'CTA가 뜨는 순간 함께 숨기고 입력을 끈다 — JoystickUI 컴포넌트가 붙어있는 노드'
      }), _dec7 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '건물 소켓을 전부 지었을 때 최종 보스 웨이브를 시작시키고, CTA가 뜨는 순간 남은 몬스터를 정리하기 위해 참조'
      }), _dec8 = property({
        displayName: '최종 보스 웨이브 이름',
        tooltip: 'MonsterSpawner.rushes에 등록된 RushConfig 이름 — 건물 소켓을 전부 지은 순간 시작된다 (모든 path에 보스 2마리씩)'
      }), _dec9 = property({
        displayName: '최종 웨이브 후 엔딩까지 대기시간(초)',
        tooltip: '최종 보스 웨이브가 시작된 뒤 이 시간이 지나면 스폰을 멈추고 엔딩 연출(몬스터 일제 처치 → CTA)로 넘어간다'
      }), _dec10 = property({
        type: CCFloat,
        displayName: '엔딩 줌아웃 배율',
        tooltip: '마지막 소켓을 짓는 순간부터 카메라가 이 배율만큼 서서히 물러나며 완성된 기지 전체를 보여준다 (2 = 두 배 넓게)'
      }), _dec11 = property({
        type: CCFloat,
        displayName: '엔딩 줌아웃 시간(초)'
      }), _dec12 = property({
        type: CCFloat,
        displayName: '엔딩 카메라 추적 속도',
        tooltip: '엔딩에서 카메라가 기지 쪽으로 미끄러지는 속도. 평소 추적 속도보다 낮게 두면 영화처럼 천천히 옮겨간다'
      }), _dec13 = property({
        displayName: '엔딩 카메라 위치 보정',
        tooltip: '줌아웃했을 때 기지가 화면 한쪽으로 치우치는 걸 잡는 월드 오프셋. X를 키우면 카메라가 오른쪽으로(=기지가 화면 왼쪽으로), Z를 키우면 화면 아래쪽으로 구도가 옮겨간다. 카메라가 -45도로 내려다보므로 Y는 거의 만질 일이 없다'
      }), _dec14 = property({
        type: CCFloat,
        displayName: '몬스터 처치 간격(초)',
        tooltip: '엔딩에서 몬스터가 왼쪽부터 하나씩 죽는 간격. 작을수록 "쫘라라락" 빠르게 쓸려나간다'
      }), _dec15 = property({
        type: CCFloat,
        displayName: '마지막 처치 후 CTA까지(초)'
      }), _dec(_class = (_class2 = (_class3 = class GameManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "hpBar", _descriptor, this);

          _initializerDefineProperty(this, "ctaPanel", _descriptor2, this);

          _initializerDefineProperty(this, "baseNode", _descriptor3, this);

          _initializerDefineProperty(this, "dimBackground", _descriptor4, this);

          _initializerDefineProperty(this, "joystickNode", _descriptor5, this);

          _initializerDefineProperty(this, "totalWaves", _descriptor6, this);

          _initializerDefineProperty(this, "maxHp", _descriptor7, this);

          _initializerDefineProperty(this, "monsterSpawnerNode", _descriptor8, this);

          _initializerDefineProperty(this, "finalRushName", _descriptor9, this);

          _initializerDefineProperty(this, "finalWaveToEndingDelay", _descriptor10, this);

          // ── 엔딩 연출 ─────────────────────────────────────────────────────────
          _initializerDefineProperty(this, "endingZoomMult", _descriptor11, this);

          _initializerDefineProperty(this, "endingZoomDuration", _descriptor12, this);

          _initializerDefineProperty(this, "endingFollowSpeed", _descriptor13, this);

          _initializerDefineProperty(this, "endingCameraOffset", _descriptor14, this);

          _initializerDefineProperty(this, "endingKillInterval", _descriptor15, this);

          _initializerDefineProperty(this, "endingCtaDelay", _descriptor16, this);

          this._score = 0;
          this._hp = 10;
          this._curWave = 1;
          this._ended = false;
        }

        onLoad() {
          GameManager.instance = this;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).AllBuildingSocketsCompleted, this._onAllBuildingSocketsCompleted, this);
        }

        onDestroy() {
          if (GameManager.instance === this) GameManager.instance = null;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).AllBuildingSocketsCompleted, this._onAllBuildingSocketsCompleted, this);
        }

        start() {
          this._hp = this.maxHp;

          this._refreshUI();
        }

        addScore(pts) {
          this._score += pts;

          this._refreshUI();
        }
        /** 몬스터가 기지(집)를 공격했을 때 호출 */


        baseTakeDamage(dmg) {
          var _this$baseNode, _this$baseNode2;

          if (this._ended) return;
          this._hp = Math.max(0, this._hp - dmg);

          this._refreshUI();

          (_this$baseNode = this.baseNode) == null || (_this$baseNode = _this$baseNode.getComponent(_crd && StructureHealthBar === void 0 ? (_reportPossibleCrUseOfStructureHealthBar({
            error: Error()
          }), StructureHealthBar) : StructureHealthBar)) == null || _this$baseNode.onDamaged(this._hp, this.maxHp);
          (_this$baseNode2 = this.baseNode) == null || (_this$baseNode2 = _this$baseNode2.getComponent(_crd && StructureHitFlash === void 0 ? (_reportPossibleCrUseOfStructureHitFlash({
            error: Error()
          }), StructureHitFlash) : StructureHitFlash)) == null || _this$baseNode2.flash();
          if (this._hp <= 0) this._finish();
        }

        setWave(n) {
          this._curWave = n;

          this._refreshUI();
        }

        onAllWavesDone() {
          if (this._ended) return;
          this.scheduleOnce(() => this._finish(), 1.5);
        }

        _finish() {
          if (this._ended) return;
          this._ended = true;
          this.scheduleOnce(() => this._showCta(), 1.0);
        }
        /** 건물 건축 소켓(SocketManager의 "소켓 목록")을 마지막 하나까지 전부 지었을 때 —
         * 급박한 상황을 연출하기 위해 모든 path에 보스를 2마리씩 태우는 최종 웨이브를 띄우면서,
         * 동시에 카메라가 기지 쪽으로 물러나며 완성된 기지 전체를 보여주기 시작한다. */


        _onAllBuildingSocketsCompleted() {
          var _this$monsterSpawnerN, _instance;

          if (this._ended) return;
          const spawner = (_this$monsterSpawnerN = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);
          spawner == null || spawner.startRushByName(this.finalRushName);
          (_instance = (_crd && CameraFollow === void 0 ? (_reportPossibleCrUseOfCameraFollow({
            error: Error()
          }), CameraFollow) : CameraFollow).instance) == null || _instance.playEndingZoom(this.baseNode, this.endingZoomMult, this.endingZoomDuration, this.endingFollowSpeed, this.endingCameraOffset); // 씬에 배치해둔 엔딩 이펙트(efffect1~4 등)를 전부 재생 — 각자 애니메이션을 돌리고
          // 자기 설정대로 페이드아웃한 뒤 스스로 꺼진다.

          (_crd && EndingEffect === void 0 ? (_reportPossibleCrUseOfEndingEffect({
            error: Error()
          }), EndingEffect) : EndingEffect).playAll();
          this.scheduleOnce(() => this._finishVictory(), this.finalWaveToEndingDelay);
        }
        /** 최종 보스 웨이브가 시작되고 finalWaveToEndingDelay초가 지난 시점 —
         * 추가 스폰만 끊고(이미 나와있는 몬스터는 남긴다) 일제 처치 연출로 넘어간다. */


        _finishVictory() {
          var _this$monsterSpawnerN2;

          if (this._ended) return;
          this._ended = true;
          (_this$monsterSpawnerN2 = this.monsterSpawnerNode) == null || (_this$monsterSpawnerN2 = _this$monsterSpawnerN2.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner)) == null || _this$monsterSpawnerN2.stopSpawning(); // 여기서 떨어지는 코인은 연출용이라 플레이어에게 회수시키지 않고 그 자리에 남긴다.

          if ((_crd && CoinSpawnController === void 0 ? (_reportPossibleCrUseOfCoinSpawnController({
            error: Error()
          }), CoinSpawnController) : CoinSpawnController).instance) (_crd && CoinSpawnController === void 0 ? (_reportPossibleCrUseOfCoinSpawnController({
            error: Error()
          }), CoinSpawnController) : CoinSpawnController).instance.dropOnly = true;

          this._sweepMonsters();
        }
        /** 맵에 남아있는 몬스터를 기지에서 가까운 순서로 하나씩 처치한다.
         *
         * 몬스터는 스폰 지점 → 기지 방향으로 몰려오므로, 기지와의 거리 오름차순은 곧 그 진행
         * 방향의 **역순**이다. 결과적으로 기지에서 바깥으로 퍼져나가는 파도처럼 쓸려나가서,
         * 여러 갈래 path가 동시에 정리되는 게 한눈에 보인다 (화면 왼쪽부터 훑는 것보다 몬스터가
         * 실제로 흘러온 줄기를 거슬러 올라가는 그림이라 더 잘 읽힌다).
         *
         * despawnSilently()가 아니라 정상 피격 경로로 죽인다 — 사망 이펙트와 효과음, 코인 드롭이
         * 그대로 나와서 마지막에 한 번에 터지는 맛이 살기 때문. */


        _sweepMonsters() {
          var _this$monsterSpawnerN3, _this$baseNode3, _spawner$activeMonste;

          const spawner = (_this$monsterSpawnerN3 = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN3.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);
          const base = (_this$baseNode3 = this.baseNode) == null ? void 0 : _this$baseNode3.worldPosition;
          const alive = [...((_spawner$activeMonste = spawner == null ? void 0 : spawner.activeMonsters) != null ? _spawner$activeMonste : [])].filter(m => {
            var _m$node;

            return ((_m$node = m.node) == null ? void 0 : _m$node.isValid) && !m.isDead;
          }).sort((a, b) => this._sweepOrder(a, base) - this._sweepOrder(b, base));
          alive.forEach((m, i) => {
            this.scheduleOnce(() => {
              var _m$node2;

              if ((_m$node2 = m.node) != null && _m$node2.isValid && !m.isDead) m.takeDamage(GameManager.SWEEP_DAMAGE);
            }, i * this.endingKillInterval);
          });
          const sweepTime = alive.length * this.endingKillInterval;
          this.scheduleOnce(() => this._showCta(), sweepTime + this.endingCtaDelay);
        }
        /** 처치 순서 기준값 — 기지까지의 거리(제곱). 기지 노드가 없으면 예전처럼 화면 왼쪽부터. */


        _sweepOrder(m, base) {
          if (!base) return m.node.worldPosition.x;
          return Vec3.squaredDistance(m.node.worldPosition, base);
        }

        _showCta() {
          var _this$joystickNode;

          (_this$joystickNode = this.joystickNode) == null || (_this$joystickNode = _this$joystickNode.getComponent(_crd && JoystickUI === void 0 ? (_reportPossibleCrUseOfJoystickUI({
            error: Error()
          }), JoystickUI) : JoystickUI)) == null || _this$joystickNode.disable();
          if (this.dimBackground) this.dimBackground.active = true;
          if (this.ctaPanel) this.ctaPanel.active = true;
        }

        _refreshUI() {
          if (this.hpBar && this.hpBar.spriteFrame) {
            this.hpBar.fillRange = this._hp / this.maxHp;
          }
        }

      }, _class3.instance = null, _class3.SWEEP_DAMAGE = 1e9, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ctaPanel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "baseNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dimBackground", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "joystickNode", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "totalWaves", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "monsterSpawnerNode", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "finalRushName", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'Rush_Final_Boss';
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "finalWaveToEndingDelay", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "endingZoomMult", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "endingZoomDuration", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.5;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "endingFollowSpeed", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "endingCameraOffset", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(2, 0, 0);
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "endingKillInterval", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.07;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "endingCtaDelay", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2e4e8644c42a859d3a47599bb682770200852475.js.map