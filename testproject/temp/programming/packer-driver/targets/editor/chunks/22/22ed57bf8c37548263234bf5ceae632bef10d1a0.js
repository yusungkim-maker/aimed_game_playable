System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Sprite, Node, CoinEvents, CoinEventName, MonsterSpawner, JoystickUI, StructureHealthBar, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _class3, _crd, ccclass, property, GameManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickUI(extras) {
    _reporterNs.report("JoystickUI", "./JoystickUI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStructureHealthBar(extras) {
    _reporterNs.report("StructureHealthBar", "./StructureHealthBar", _context.meta, extras);
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
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      MonsterSpawner = _unresolved_3.MonsterSpawner;
    }, function (_unresolved_4) {
      JoystickUI = _unresolved_4.JoystickUI;
    }, function (_unresolved_5) {
      StructureHealthBar = _unresolved_5.StructureHealthBar;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d73a4vATBpH+KUfX1MZFI7v", "GameManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Sprite', 'Node']);

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
        displayName: '최종 웨이브 후 CTA까지 대기시간(초)',
        tooltip: '최종 보스 웨이브가 시작된 뒤 이 시간이 지나면 웨이브를 멈추고 화면의 몬스터를 전부 정리한 뒤 CTA를 띄운다'
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
          var _this$baseNode;

          if (this._ended) return;
          this._hp = Math.max(0, this._hp - dmg);

          this._refreshUI();

          (_this$baseNode = this.baseNode) == null || (_this$baseNode = _this$baseNode.getComponent(_crd && StructureHealthBar === void 0 ? (_reportPossibleCrUseOfStructureHealthBar({
            error: Error()
          }), StructureHealthBar) : StructureHealthBar)) == null || _this$baseNode.onDamaged(this._hp, this.maxHp);
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
         * 급박한 상황을 연출하기 위해 모든 path에 보스를 2마리씩 태우는 최종 웨이브를 띄우고,
         * 그로부터 일정 시간 뒤 게임을 종료(CTA) 시퀀스로 넘긴다. */


        _onAllBuildingSocketsCompleted() {
          var _this$monsterSpawnerN;

          if (this._ended) return;
          const spawner = (_this$monsterSpawnerN = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);
          spawner == null || spawner.startRushByName(this.finalRushName);
          this.scheduleOnce(() => this._finishVictory(), this.finalWaveToEndingDelay);
        }
        /** 최종 보스 웨이브가 시작되고 finalWaveToEndingDelay초가 지난 시점 — 웨이브를 멈추고
         * 화면에 남아있던 몬스터를 코인 드롭 없이 전부 정리한 뒤 CTA를 띄운다. */


        _finishVictory() {
          var _this$monsterSpawnerN2;

          if (this._ended) return;
          this._ended = true;
          (_this$monsterSpawnerN2 = this.monsterSpawnerNode) == null || (_this$monsterSpawnerN2 = _this$monsterSpawnerN2.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner)) == null || _this$monsterSpawnerN2.stopAndClearAll();

          this._showCta();
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

      }, _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec2], {
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
          return 5;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=22ed57bf8c37548263234bf5ceae632bef10d1a0.js.map