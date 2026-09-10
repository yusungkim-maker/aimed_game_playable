System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Color, MeshRenderer, Animation, AnimationClip, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, CLIP_NAME, SocketGuideArrow;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec3 = _cc.Vec3;
      Color = _cc.Color;
      MeshRenderer = _cc.MeshRenderer;
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a3aeblFqRtHHZHQgpB9pusl", "SocketGuideArrow", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'Color', 'MeshRenderer', 'Animation', 'AnimationClip']);

      ({
        ccclass,
        property
      } = _decorator);
      CLIP_NAME = 'appear';
      /**
       * 소켓(socket_L/socket_S)에 내장된, 이 소켓으로 들어가라고 알려주는 유도 UI(UI_arrow).
       * 제자리에서 위아래로 통통 튀는 모션 + 발광 효과를 항상 내며, 언제 나타나고 사라질지는
       * 전적으로 호출하는 쪽(Socket.ts)이 show()/hide()로 직접 제어한다 — 이 컴포넌트 스스로는
       * 아무 이벤트도 구독하지 않는다.
       */

      _export("SocketGuideArrow", SocketGuideArrow = (_dec = ccclass('SocketGuideArrow'), _dec2 = property({
        displayName: '진동 진폭(m)',
        tooltip: '제자리에서 위아래로 움직이는 폭'
      }), _dec3 = property({
        displayName: '진동 속도(Hz)',
        tooltip: '초당 왕복 횟수'
      }), _dec4 = property({
        displayName: '발광 색상'
      }), _dec5 = property({
        displayName: '발광 강도',
        tooltip: '값이 클수록 밝게 빛남'
      }), _dec(_class = (_class2 = class SocketGuideArrow extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "bobAmplitude", _descriptor, this);

          _initializerDefineProperty(this, "bobSpeed", _descriptor2, this);

          _initializerDefineProperty(this, "glowColor", _descriptor3, this);

          _initializerDefineProperty(this, "glowIntensity", _descriptor4, this);

          this._anim = null;
          this._baseLocalPos = new Vec3();
          this._bobPhase = 0;

          /** hide()가 호출되면 false — Socket.ts가 사라짐 애니메이션 직전에 이 노드를 씬 루트로
           * setParent(keepWorldTransform)하는데, 그 뒤에도 update()가 onLoad 시점(원래 소켓 밑
           * 로컬 좌표)의 _baseLocalPos로 매 프레임 위치를 되돌려버리면 새 부모 기준으로 그 값이
           * 재해석되어 화면 중앙 근처로 순간이동해버린다 — 사라지는 동안은 통통 튀는 모션을 멈춰서
           * 실제 사라진 자리에서 그대로 축소/역재생되게 한다. */
          this._bobbing = true;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          Vec3.copy(this._baseLocalPos, this.node.position);
          var mr = this.getComponentInChildren(MeshRenderer);
          var inst = mr == null ? void 0 : mr.getMaterialInstance(0);
          inst == null || inst.setProperty('emissive', this.glowColor);
          inst == null || inst.setProperty('emissiveScale', new Vec3(this.glowIntensity, this.glowIntensity, this.glowIntensity));
        }

        update(dt) {
          if (!this._bobbing) return;
          this._bobPhase += dt * this.bobSpeed * Math.PI * 2;
          var y = this._baseLocalPos.y + Math.sin(this._bobPhase) * this.bobAmplitude;
          this.node.setPosition(this._baseLocalPos.x, y, this._baseLocalPos.z);
        }
        /** appear 애니메이션을 정재생하며 나타난다 */


        show() {
          var _this$_anim;

          var state = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.getState(CLIP_NAME);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = 1;
          state.time = 0;
          state.play();
        }
        /** appear 애니메이션을 역재생하며 사라진 뒤, 다 사라지면 스스로 파괴된다(재사용하지 않음) */


        hide() {
          var _this$_anim2;

          this._bobbing = false;
          var state = (_this$_anim2 = this._anim) == null ? void 0 : _this$_anim2.getState(CLIP_NAME);

          if (!state) {
            this.node.destroy();
            return;
          }

          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = -1;
          state.time = state.duration;
          state.once(Animation.EventType.FINISHED, () => {
            this.node.destroy();
          });
          state.play();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "bobAmplitude", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "bobSpeed", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "glowColor", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 235, 120, 255);
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "glowIntensity", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=32994ac933fa0ac2ad2338730101ccb1686487ab.js.map