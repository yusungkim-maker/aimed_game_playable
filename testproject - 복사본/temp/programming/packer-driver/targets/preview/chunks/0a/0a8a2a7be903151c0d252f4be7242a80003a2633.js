System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Quat, Animation, AnimationClip, Socket, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, CLIP_NAME, LIE_FLAT_PITCH_DEG, GuideCompass;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfSocket(extras) {
    _reporterNs.report("Socket", "./Socket", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
    }, function (_unresolved_2) {
      Socket = _unresolved_2.Socket;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "79596sTAJtEcp0c4qvxLMaL", "GuideCompass", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'Quat', 'Node', 'Animation', 'AnimationClip']);

      ({
        ccclass,
        property
      } = _decorator);
      CLIP_NAME = 'appear'; // 바닥에 눕혀서(노멀이 위를 향하도록) 깔아두는 고정 틸트 — 이 프로젝트의 다른 바닥-평면
      // 쿼드들(MapBounds 디버그 라인, 옛 Socket placeholder 등)과 동일한 X=-90° 관례.
      // 카메라를 향해 세워둘 필요가 없다 — 바닥에 붙어 방향만 가리키는 표식이기 때문.

      LIE_FLAT_PITCH_DEG = -90;
      /**
       * 메인 캐릭터에 붙어서, 유도 화살표 UI가 켜져 있는 소켓(Socket.activeGuideTarget) 방향을
       * 항상 가리키는 나침반형 화살표. 캐릭터(부모 노드)를 중심으로 한 궤도 위, 목표 방향 쪽 지점에
       * 위치하면서 그 방향을 가리킨다(레이더/미니맵의 오프스크린 화살표와 동일한 방식) — 캐릭터
       * 바로 밑에 붙어있지 않고 캐릭터를 공전하듯 움직인다. 바닥에 눕힌 채로 수직(Y)축 회전만으로
       * 방향을 가리키며(카메라를 향해 세울 필요 없음), 캐릭터 자신의 회전과는 무관하게
       * (= setWorldRotation/setWorldPosition으로 직접 지정) 캐릭터를 기준으로 360도 자유롭게 돈다.
       *
       * 대상이 생기면 'appear' 애니메이션 클립을 정재생해서 나타나고, 대상이 사라지면 같은
       * 클립을 역재생해서 사라진다(재생성 없이 계속 재사용 — 소켓 옆에 서던 예전 SocketGuideArrow와
       * 달리 파괴되지 않는다). node는 항상 active 상태로 유지한다 — 비활성 노드는 자기 자신의
       * update()도 더 이상 호출되지 않아서, 대상이 다시 생겨도 스스로 못 깨어나는 문제가 있었다
       * (실제 Play에서 소켓이 활성화돼도 화살표가 끝내 안 나타나던 원인).
       */

      _export("GuideCompass", GuideCompass = (_dec = ccclass('GuideCompass'), _dec2 = property({
        displayName: '화살표 기본 방향 보정(도)',
        tooltip: '화살표 메쉬의 기본 방향이 실제와 안 맞을 때 보정용 — 반대로 보이면 180, 90도 틀어져 보이면 90/-90으로 조정'
      }), _dec3 = property({
        displayName: '공전 반경(m)',
        tooltip: '캐릭터 중심에서 화살표가 떨어져서 도는 거리'
      }), _dec4 = property({
        displayName: '바닥 높이 보정(m)',
        tooltip: '땅에 딱 붙이면 다른 바닥 평면과 겹쳐 보일 수 있어 살짝 띄우는 값'
      }), _dec(_class = (_class2 = class GuideCompass extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "forwardOffsetDeg", _descriptor, this);

          _initializerDefineProperty(this, "orbitRadius", _descriptor2, this);

          _initializerDefineProperty(this, "orbitHeight", _descriptor3, this);

          this._anim = null;
          this._center = null;
          this._visible = false;
          this._dir = new Vec3();
          this._worldPos = new Vec3();
          this._qYaw = new Quat();
          this._qLieFlat = new Quat();
          this._qFinal = new Quat();
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          this._center = this.node.parent; // 이 화살표가 공전할 기준(캐릭터)
        }

        update() {
          var target = (_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket).activeGuideTarget;
          var hasTarget = !!target && target.isValid;

          if (hasTarget !== this._visible) {
            this._visible = hasTarget;
            if (hasTarget) this._playAppear(1);else this._playAppear(-1);
          }

          if (!hasTarget || !this._center) return;
          Vec3.subtract(this._dir, target.worldPosition, this._center.worldPosition);
          this._dir.y = 0;
          if (this._dir.lengthSqr() < 0.0001) return; // 대상과 거의 같은 위치면 방향 갱신을 건너뜀

          this._dir.normalize(); // 캐릭터를 중심으로, 목표 방향 쪽 궤도 위의 지점으로 이동시킨다(공전).


          Vec3.scaleAndAdd(this._worldPos, this._center.worldPosition, this._dir, this.orbitRadius);
          this._worldPos.y = this._center.worldPosition.y + this.orbitHeight;
          this.node.setWorldPosition(this._worldPos); // 바닥에 눕힌(X=-90°) 상태에서 기본 정면 방향은 world -Z. 그 상태를 world Y축으로
          // 추가로 돌려(yaw) 실제 목표 방향과 일치시킨다.

          var yawDeg = Math.atan2(-this._dir.x, -this._dir.z) * 180 / Math.PI + this.forwardOffsetDeg;
          Quat.fromAxisAngle(this._qYaw, Vec3.UNIT_Y, yawDeg * Math.PI / 180);
          Quat.fromAxisAngle(this._qLieFlat, Vec3.UNIT_X, LIE_FLAT_PITCH_DEG * Math.PI / 180);
          Quat.multiply(this._qFinal, this._qYaw, this._qLieFlat); // 먼저 눕히고, 그 다음 수직축으로 조준

          this.node.setWorldRotation(this._qFinal);
        }
        /** dir=1이면 appear를 정재생(나타남), dir=-1이면 역재생(사라짐) */


        _playAppear(dir) {
          var _this$_anim;

          var state = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.getState(CLIP_NAME);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = dir;
          state.time = dir === 1 ? 0 : state.duration;
          state.play();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "forwardOffsetDeg", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "orbitRadius", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "orbitHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0a8a2a7be903151c0d252f4be7242a80003a2633.js.map