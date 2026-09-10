System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, SkeletalAnimation, AnimationClip, Vec3, Player, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _class3, _crd, ccclass, property, DoorAutoOpen;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
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
      SkeletalAnimation = _cc.SkeletalAnimation;
      AnimationClip = _cc.AnimationClip;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      Player = _unresolved_2.Player;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d1656xccJZDdKwBeTQ7Cp2D", "DoorAutoOpen", undefined);

      __checkObsolete__(['_decorator', 'Component', 'SkeletalAnimation', 'AnimationClip', 'AnimationState', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 플레이어가 가까이 오면 클립을 정방향, 멀어지면 역방향으로 재생해서 문을 자동으로
       * 여닫는다. Door2처럼 컬리전 없이 통과 가능한 문에 사용 — 별도의 "닫힘" 클립 없이
       * 하나의 클립(예: open)을 앞/뒤로만 재생해서 열림·닫힘을 표현한다.
       *
       * closeDistance를 openDistance보다 크게 둬서(히스테리시스), 경계선에 걸쳐 서성일 때
       * 매 프레임 여닫힘이 떨리는 걸 막는다.
       */

      _export("DoorAutoOpen", DoorAutoOpen = (_dec = ccclass('DoorAutoOpen'), _dec2 = property({
        type: AnimationClip,
        displayName: '문 열림 클립',
        tooltip: '정방향 재생=열림, 역방향 재생=닫힘으로 사용할 클립 (예: open). Animation/SkeletalAnimation의 clips 목록에 이미 등록되어 있어야 한다'
      }), _dec3 = property({
        displayName: '열림 거리(m)',
        tooltip: '플레이어가 이 거리 안으로 들어오면 문이 열린다'
      }), _dec4 = property({
        displayName: '닫힘 거리(m)',
        tooltip: '플레이어가 이 거리 밖으로 나가면 문이 닫힌다 — 열림 거리와 같거나 비슷하게 둬도 된다. 실제 판정에는 최소 MIN_HYSTERESIS_GAP만큼의 여유가 항상 자동으로 더해지므로(경계선에서 매 프레임 열림/닫힘이 번갈아 떨리는 걸 막기 위해) 여기 적은 값 그대로 쓰이지 않을 수 있다'
      }), _dec5 = property({
        displayName: '정지 프레임',
        tooltip: '열림 클립에서 "완전히 열린" 상태로 멈출 프레임 번호(0=클립 맨 처음 프레임). 열릴 때는 이 프레임에서 멈추고, 닫힐 때는 여기서부터 0번 프레임까지 역재생한다'
      }), _dec6 = property({
        displayName: '클립 FPS',
        tooltip: '위 "정지 프레임"을 초 단위 재생 시간으로 환산할 때 쓰는 프레임레이트 — 이 클립을 원본에서 내보낼 때 쓴 프레임레이트와 같아야 정확한 프레임에서 멈춘다 (기본 30)'
      }), _dec(_class = (_class2 = (_class3 = class DoorAutoOpen extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "clipOpen", _descriptor, this);

          _initializerDefineProperty(this, "openDistance", _descriptor2, this);

          _initializerDefineProperty(this, "closeDistance", _descriptor3, this);

          _initializerDefineProperty(this, "stopFrame", _descriptor4, this);

          _initializerDefineProperty(this, "clipFps", _descriptor5, this);

          /** BuildingTrigger가 이 문의 건설(appear) 애니메이션을 다 재생한 뒤에만 true로 켠다.
           * 그 전까지 update()가 완전히 아무 것도 하지 않는다 — 문이 아직 안 지어져 메쉬가 숨겨진
           * 동안에도 이 스크립트는 계속 살아있어서(onLoad/start는 씬 시작과 함께 돈다), 플레이어가
           * 우연히 근처에 있으면 "open" 상태를 미리 재생해버릴 수 있었다. 그 상태로 있다가
           * BuildingTrigger가 별도의 "appear" 클립을 재생하면 같은 뼈대를 두 애니메이션 상태가
           * 동시에 건드리게 되어, 문이 등장하는 순간 두 포즈가 뒤섞이며 잠깐 튀는 것처럼 보였다. */
          this.active = false;
          this._anim = null;
          this._isOpen = false;

          /** 지금 진행 방향 — 1=열리는 중, -1=닫히는 중, 0=양 끝 중 하나에 멈춰있음 */
          this._dir = 0;

          /** 재생 시간을 엔진에 맡기지 않고 여기서 직접 관리한다(update() 주석 참고) */
          this._time = 0;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(SkeletalAnimation)) != null ? _this$getComponent : this.getComponentInChildren(SkeletalAnimation);
        }
        /** BuildingTrigger가 appear 재생 시간만큼 지연시킨 뒤 호출 — TowerAttack.combatEnabled와
         * 동일한 패턴. 이 시점부터 비로소 open 상태를 건드리기 시작한다.
         *
         * state.speed는 처음부터 끝까지 0으로 못박아둔다 — 재생 시간은 엔진이 아니라 update()가
         * 직접 굴린다(그 이유는 update() 주석 참고). play()를 한 번 불러 재생 중 상태로 만들어두는
         * 건, 이전에 "멈춰있다 새로 play()로 콜드스타트"할 때 생기던 미세한 끊김을 피하기 위함. */


        activate() {
          this.active = true;

          const state = this._getState();

          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Loop;
          if (!state.isPlaying) state.play(); // play()가 speed를 건드릴 가능성까지 배제하기 위해 play() 이후에 강제한다.

          state.speed = 0;
          this._dir = 0;
          this._time = 0;
          state.setTime(0);
          state.sample();
        }
        /** onLoad()가 아니라 start()에서 처리한다 — SkeletalAnimation은 자신의 onLoad()에서 clips로부터
         * 애니메이션 상태(state)를 만드는데, 같은 노드라도 컴포넌트 실행 순서에 따라 DoorAutoOpen의
         * onLoad()가 그보다 먼저 돌 수 있어 getState()가 아직 null을 반환하는 경우가 있었다.
         * start()는 씬의 모든 onLoad()가 끝난 뒤에 실행되므로 이 시점엔 항상 state가 존재한다.
         *
         * 여기서는 아직 play()하지 않는다 — activate()가 불리기 전(=appear 재생 중/그 전)에
         * 이 state를 건드리면 appear와 같은 뼈대를 동시에 건드려 포즈가 뒤섞이는 문제가 있었다
         * (activate()의 주석 참고). wrapMode만 미리 Loop로 맞춰두고 초기 포즈만 샘플링한다. */


        start() {
          const state = this._getState();

          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Loop;
          state.sample();
        }
        /** 재생 시간을 엔진(state.speed)에 맡기지 않고 여기서 직접 굴린다.
         *
         * 엔진에 맡기면 양쪽 끝에서 반드시 한 프레임이 튄다. Director.tick()이
         * "컴포넌트 update() → 애니메이션 시스템 update()" 순서로 돌기 때문에, 여기서 읽는
         * state.time은 항상 이전 프레임 값이다. "아직 끝에 안 닿았다"고 판단한 직후 엔진이
         * 시간을 한 번 더 전진시키고 그 오버슈트된 포즈를 그대로 렌더해버린다. 게다가
         * wrapMode가 Loop라 클립 경계를 넘는 순간 반대쪽 끝으로 감기므로(open 클립 길이가
         * 0.4333초=13프레임인데 정지 프레임도 13이라 매번 정확히 경계에 걸린다), 살짝 지나친
         * 정도가 아니라 정반대 포즈(닫힘↔열림)가 한 프레임 번쩍였다.
         *
         * speed를 0으로 못박고 시간을 직접 [0, stopTime]으로 clamp해서 넣으면 오버슈트 자체가
         * 불가능해지므로 update 순서도 wrapMode도 더 이상 영향을 주지 않는다. */


        update(dt) {
          var _instance;

          if (!this.active || !this.clipOpen) return;

          const state = this._getState();

          if (!state) return;
          const player = (_instance = (_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player).instance) == null ? void 0 : _instance.node;

          if (player && player.isValid) {
            const d = Vec3.distance(this.node.worldPosition, player.worldPosition);
            const effectiveCloseDistance = Math.max(this.closeDistance, this.openDistance + DoorAutoOpen.MIN_HYSTERESIS_GAP);

            if (!this._isOpen && d <= this.openDistance) {
              this._isOpen = true;
              this._dir = 1;
            } else if (this._isOpen && d >= effectiveCloseDistance) {
              this._isOpen = false;
              this._dir = -1;
            }
          }

          if (this._dir === 0) return;

          const stopTime = this._stopTime();

          this._time += this._dir * dt;

          if (this._time >= stopTime) {
            this._time = stopTime;
            this._dir = 0;
          } else if (this._time <= 0) {
            this._time = 0;
            this._dir = 0;
          }

          state.setTime(this._time);
          state.sample();
        }
        /** stopFrame(정지 프레임)을 clipFps 기준으로 초 단위 재생 시간으로 환산한다. 클립
         * 실제 길이보다 큰 프레임을 잘못 지정해도 무한히 못 멈추지 않도록 clipOpen.duration으로
         * 상한을 둔다. */


        _stopTime() {
          const t = this.stopFrame / Math.max(1, this.clipFps);
          return this.clipOpen ? Math.min(t, this.clipOpen.duration) : t;
        }

        _getState() {
          if (!this._anim || !this.clipOpen) return null;
          return this._anim.getState(this.clipOpen.name);
        }

      }, _class3.MIN_HYSTERESIS_GAP = 0.5, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "clipOpen", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "openDistance", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "closeDistance", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "stopFrame", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 13;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "clipFps", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 30;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f44c540d36fea3fe8efb101a90498037ed4ed272.js.map