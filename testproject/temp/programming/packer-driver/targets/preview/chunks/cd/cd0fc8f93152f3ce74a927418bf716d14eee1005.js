System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, SkeletalAnimation, AnimationClip, Vec3, Player, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _crd, ccclass, property, DoorAutoOpen;

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
      }), _dec(_class = (_class2 = (_class3 = class DoorAutoOpen extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "clipOpen", _descriptor, this);

          _initializerDefineProperty(this, "openDistance", _descriptor2, this);

          _initializerDefineProperty(this, "closeDistance", _descriptor3, this);

          /** BuildingTrigger가 이 문의 건설(appear) 애니메이션을 다 재생한 뒤에만 true로 켠다.
           * 그 전까지 update()가 완전히 아무 것도 하지 않는다 — 문이 아직 안 지어져 메쉬가 숨겨진
           * 동안에도 이 스크립트는 계속 살아있어서(onLoad/start는 씬 시작과 함께 돈다), 플레이어가
           * 우연히 근처에 있으면 "open" 상태를 미리 재생해버릴 수 있었다. 그 상태로 있다가
           * BuildingTrigger가 별도의 "appear" 클립을 재생하면 같은 뼈대를 두 애니메이션 상태가
           * 동시에 건드리게 되어, 문이 등장하는 순간 두 포즈가 뒤섞이며 잠깐 튀는 것처럼 보였다. */
          this.active = false;
          this._anim = null;
          this._isOpen = false;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(SkeletalAnimation)) != null ? _this$getComponent : this.getComponentInChildren(SkeletalAnimation);
        }
        /** BuildingTrigger가 appear 재생 시간만큼 지연시킨 뒤 호출 — TowerAttack.combatEnabled와
         * 동일한 패턴. 이 시점부터 비로소 open 상태를 건드리기 시작한다. */


        activate() {
          this.active = true;
        }
        /** onLoad()가 아니라 start()에서 처리한다 — SkeletalAnimation은 자신의 onLoad()에서 clips로부터
         * 애니메이션 상태(state)를 만드는데, 같은 노드라도 컴포넌트 실행 순서에 따라 DoorAutoOpen의
         * onLoad()가 그보다 먼저 돌 수 있어 getState()가 아직 null을 반환하는 경우가 있었다.
         * start()는 씬의 모든 onLoad()가 끝난 뒤에 실행되므로 이 시점엔 항상 state가 존재한다.
         *
         * wrapMode는 Loop로 둔다(반복 재생용이 아니라 자동 정지를 일부러 끄기 위해) — 엔진의
         * Normal(1회 재생) 모드는 "누적 재생 시간이 클립 길이를 넘었는가"로 정지를 판단하는데,
         * 역재생을 시작할 때 time을 클립 끝(duration)으로 강제로 옮겨두면 그 순간 이미 "한 바퀴
         * 다 돈 것"으로 계산되어 역재생이 시작되자마자 즉시 멈춰버리는 문제가 있었다(그래서 문이
         * 열린 채로 안 닫히는 것처럼 보였다). Loop는 repeatCount가 무한대라 이 오작동이 없고,
         * 정지 시점은 update()에서 직접 감시해서 처리한다. */


        start() {
          var state = this._getState();

          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Loop;
          state.sample();
        }

        update() {
          var _instance;

          if (!this.active) return;
          var player = (_instance = (_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player).instance) == null ? void 0 : _instance.node;

          if (player && player.isValid) {
            var d = Vec3.distance(this.node.worldPosition, player.worldPosition);
            var effectiveCloseDistance = Math.max(this.closeDistance, this.openDistance + DoorAutoOpen.MIN_HYSTERESIS_GAP);

            if (!this._isOpen && d <= this.openDistance) {
              this._isOpen = true;

              this._setDirection(1);
            } else if (this._isOpen && d >= effectiveCloseDistance) {
              this._isOpen = false;

              this._setDirection(-1);
            }
          } // 끝에 도달했는지 직접 감시해서 정확히 그 지점에서 멈춘다(위 start()의 설명 참고).


          if (this.clipOpen) {
            var state = this._getState();

            if (state && state.isPlaying) {
              if (state.speed > 0 && state.time >= this.clipOpen.duration) {
                state.setTime(this.clipOpen.duration);
                state.sample();
                state.stop();
              } else if (state.speed < 0 && state.time <= 0) {
                state.setTime(0);
                state.sample();
                state.stop();
              }
            }
          }
        }

        _getState() {
          if (!this._anim || !this.clipOpen) return null;
          return this._anim.getState(this.clipOpen.name);
        }
        /** dir=1(열림)/-1(닫힘)로 재생 방향을 바꾼다. 이미 재생 중이면 방향만 바꿔서 현재
         * 진행 위치에서 자연스럽게 이어지고, 멈춰있었다면(완전히 열렸거나 최초 상태) 새로
         * play()하되 — play()는 항상 time을 0(클립 시작점)으로 되돌리는 엔진 동작이라,
         * 역방향으로 새로 시작하는 경우에만 시작 위치를 클립 끝으로 보정해준다. */


        _setDirection(dir) {
          var state = this._getState();

          if (!state || !this.clipOpen) return; // 매번 확인 — Loop가 아니면(=start()가 아직 못 잡았으면) 여기서도 한 번 더 강제한다.

          if (state.wrapMode !== AnimationClip.WrapMode.Loop) state.wrapMode = AnimationClip.WrapMode.Loop;
          state.speed = dir;

          if (!state.isPlaying) {
            state.play(); // play()는 항상 time을 0으로 되돌리므로, 역방향 시작은 클립 끝으로 다시 보정해야
            // 한다 — 그 직후 sample()까지 호출해 이번 프레임 바로 정확한 포즈를 반영한다.
            // (다음 프레임의 AnimationManager 갱신을 기다리지 않고 즉시 튐 없이 이어지게 함)

            state.setTime(dir < 0 ? this.clipOpen.duration : 0);
            state.sample();
          }
        }

      }, _class3.MIN_HYSTERESIS_GAP = 0.5, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "clipOpen", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "openDistance", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "closeDistance", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3.2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cd0fc8f93152f3ce74a927418bf716d14eee1005.js.map