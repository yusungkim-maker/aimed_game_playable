System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Animation, AnimationClip, MeshRenderer, SkinnedMeshRenderer, CoinEvents, CoinEventName, TriggerId, TowerAttack, DoorAutoOpen, DoorHealth, VirtualWall, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, BuildingTrigger;

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

  function _reportPossibleCrUseOfTowerAttack(extras) {
    _reporterNs.report("TowerAttack", "./TowerAttack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDoorAutoOpen(extras) {
    _reporterNs.report("DoorAutoOpen", "./DoorAutoOpen", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDoorHealth(extras) {
    _reporterNs.report("DoorHealth", "./DoorHealth", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualWall(extras) {
    _reporterNs.report("VirtualWall", "./VirtualWall", _context.meta, extras);
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
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
      MeshRenderer = _cc.MeshRenderer;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      TriggerId = _unresolved_3.TriggerId;
    }, function (_unresolved_4) {
      TowerAttack = _unresolved_4.TowerAttack;
    }, function (_unresolved_5) {
      DoorAutoOpen = _unresolved_5.DoorAutoOpen;
    }, function (_unresolved_6) {
      DoorHealth = _unresolved_6.DoorHealth;
    }, function (_unresolved_7) {
      VirtualWall = _unresolved_7.VirtualWall;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "238aah/EfhF0ZmWf1m+6JG7", "BuildingTrigger", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Animation', 'AnimationClip', 'MeshRenderer', 'SkinnedMeshRenderer']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * door1/door2/tower/wall 같은 건물 프리팹에 붙여서, 소켓 목록에서 같은 트리거 ID로 설정한
       * 소켓이 요구치를 채우는 순간 이 건물이 "건설"되게(등장 애니메이션 재생) 만드는 컴포넌트.
       * 소켓 쪽(Socket.ts)과는 CoinEvents.SocketFilled 이벤트로만 느슨하게 연결되어 있다 —
       * 서로의 존재를 직접 참조하지 않으므로 건물을 씬 어디에 몇 개 배치하든 상관없다.
       *
       * 각 건물의 Animation/SkeletalAnimation이 가진 등장 클립 이름은 에셋마다 다르지만
       * (tower/wall/door1/door2 전부 "appear") 클립 이름을 하드코딩하지 않고 항상 defaultClip을
       * 재생한다. 각 프리팹의 defaultClip이 실제 등장 클립으로 지정되어 있어야 한다
       * (Tower/Wall/Door1/Door2 프리팹 준비 시 이미 그렇게 맞춰둠).
       *
       * door2는 별도로 "open" 클립을 DoorAutoOpen이 여닫힘 연출에 쓴다 — appear(건설 등장)와
       * open(플레이어 접근 시 여닫힘)은 서로 다른 클립이므로, appear가 다 재생되기 전까지는
       * DoorAutoOpen을 비활성 상태로 둬 두 애니메이션이 같은 뼈대를 동시에 건드리지 않게 한다.
       */

      _export("BuildingTrigger", BuildingTrigger = (_dec = ccclass('BuildingTrigger'), _dec2 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '반응할 트리거 ID',
        tooltip: '소켓 목록에서 같은 트리거 ID로 설정된 소켓이 요구치를 채우면 이 건물이 반응해 건설 애니메이션을 재생한다'
      }), _dec3 = property({
        displayName: '트리거 전까지 숨기기',
        tooltip: '체크하면 씬 시작 시 이 건물의 메쉬를 즉시 숨겨두고, 트리거가 발동하는 순간 다시 보이게 하면서 등장 애니메이션을 재생한다 (node.active는 건드리지 않는다 — 비활성 노드는 스스로 다시 켜질 수 없기 때문)'
      }), _dec(_class = (_class2 = class BuildingTrigger extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "triggerId", _descriptor, this);

          _initializerDefineProperty(this, "hideUntilTriggered", _descriptor2, this);

          this._anim = null;
          this._renderers = [];
          this._obstacle = null;
          this._built = false;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          this._renderers = [...this.getComponentsInChildren(MeshRenderer), ...this.getComponentsInChildren(SkinnedMeshRenderer)]; // 가상의 벽(VirtualWall)은 건물 프리팹 안에 별도 자식 노드로 들어있다 — 실제
          // 렌더링되는 메쉬와 완전히 분리된 노드라, 건물 자체와 위치/회전/스케일이 다를 수 있다.

          this._obstacle = this.getComponentInChildren(_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall);

          if (this.hideUntilTriggered && this.triggerId !== (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None) {
            this._setVisible(false);
          }

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
          var _this$_obstacle, _this$getComponent2;

          if (this._built) return;
          if (this.triggerId === (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None || triggerId !== this.triggerId) return;
          this._built = true;

          this._setVisible(true);

          (_this$_obstacle = this._obstacle) == null || _this$_obstacle.activate(); // Door2처럼 DoorHealth가 붙어있는 건물이면, 건설 완료(등장) 즉시 체력을 켜서
          // 몬스터의 공격 대상 목록(DoorHealth.all)에 들어가게 한다 — 이때부터 이 문을 부수지
          // 않으면 몬스터가 기지 방향으로 더 나아갈 수 없다.

          (_this$getComponent2 = this.getComponent(_crd && DoorHealth === void 0 ? (_reportPossibleCrUseOfDoorHealth({
            error: Error()
          }), DoorHealth) : DoorHealth)) == null || _this$getComponent2.activate();

          const duration = this._playOnce(); // 화살탑처럼 TowerAttack이 붙어있는 건물이면, 건설 완료 순간부터 자동 공격을 켠다
          // (그 전까지는 TowerAttack.combatEnabled가 false라 조준/발사 둘 다 하지 않는다).
          // appear 클립이 Root_Bow 회전까지 애니메이션하는 경우가 있어서, appear가 끝나기 전에
          // combatEnabled를 켜면 TowerAttack.update()가 매 프레임 aimBone 회전을 덮어써서
          // appear 애니메이션이 재생되는 게 안 보이는 문제가 있었다 — 재생 시간만큼 지연시킨다.


          const tower = this.getComponent(_crd && TowerAttack === void 0 ? (_reportPossibleCrUseOfTowerAttack({
            error: Error()
          }), TowerAttack) : TowerAttack);

          if (tower) {
            if (duration > 0) this.scheduleOnce(() => {
              tower.combatEnabled = true;
            }, duration);else tower.combatEnabled = true;
          } // Door2처럼 DoorAutoOpen이 붙어있는 건물이면, appear(건설) 애니메이션이 끝난 뒤에야
          // open 상태를 건드리기 시작하게 한다 — 그 전까지 DoorAutoOpen이 이미 open 상태를
          // 재생 중이었다면 appear와 open 두 애니메이션이 같은 뼈대를 동시에 건드려 문이
          // 등장하는 순간 포즈가 뒤섞이며 튀는 문제가 있었다.


          const door = this.getComponent(_crd && DoorAutoOpen === void 0 ? (_reportPossibleCrUseOfDoorAutoOpen({
            error: Error()
          }), DoorAutoOpen) : DoorAutoOpen);

          if (door) {
            if (duration > 0) this.scheduleOnce(() => {
              door.activate();
            }, duration);else door.activate();
          }
        }
        /** defaultClip을 정확히 한 번만 재생한다 — 임포트된 클립 자체의 wrapMode가 Loop로
         * 잡혀 있어도(에셋 쪽 기본값) 여기서 매번 Normal로 강제해 반복 재생을 막는다.
         * 반환값은 클립 재생 시간(초) — 0이면 재생하지 못했다는 뜻. */


        _playOnce() {
          var _this$_anim;

          const clip = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.defaultClip;
          if (!this._anim || !clip) return 0;

          const state = this._anim.getState(clip.name);

          if (!state) return 0;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = 1;
          state.time = 0;
          state.play();
          return clip.duration;
        }

        _setVisible(visible) {
          for (const r of this._renderers) r.enabled = visible;
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
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hideUntilTriggered", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4c9ebf4bc3060a719f854251e1d98811615ed726.js.map