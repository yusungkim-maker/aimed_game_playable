System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Vec3, UITransform, Graphics, Color, Camera, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, JoystickUI;

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
      Node = _cc.Node;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
      UITransform = _cc.UITransform;
      Graphics = _cc.Graphics;
      Color = _cc.Color;
      Camera = _cc.Camera;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "17180z5sf5P2JoIksQP7JxI", "JoystickUI", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'UITransform', 'EventTouch', 'Graphics', 'Color', 'Camera']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 플로팅(어디를 눌러도 그 자리에서 시작하는) 가상 조이스틱. 실제 터치 감지는 이 노드 자신이
       * 아니라 화면 전체를 덮는 별도의 touchZone 노드가 담당한다 — 터치가 시작되는 순간 이 노드
       * (베이스 링) 자체를 그 지점으로 옮겨서 보이게 하고, 그 자리를 중심으로 드래그하는 동안
       * 노브가 따라 움직인다. 손을 떼면 다시 숨는다.
       * Read .direction (normalized Vec2) in Player.ts.
       */

      _export("JoystickUI", JoystickUI = (_dec = ccclass('JoystickUI'), _dec2 = property(Node), _dec3 = property({
        type: Node,
        displayName: '터치 감지 영역',
        tooltip: '화면 전체(또는 조작 가능 영역)를 덮는 노드 — 여기서 터치가 시작된 지점에 조이스틱이 나타난다. 비워두면 기존처럼 이 노드 자신의 고정된 자리에서만 반응한다'
      }), _dec4 = property({
        type: Camera,
        displayName: 'UI 카메라',
        tooltip: '터치 좌표를 UI 로컬 좌표로 변환할 때 사용 (UICamera 연결)'
      }), _dec5 = property({
        type: Color,
        displayName: '베이스 원 채움 색',
        tooltip: '조이스틱 바깥 큰 원의 안쪽 색. 알파(A)를 낮출수록 배경이 비쳐 보인다'
      }), _dec6 = property({
        type: Color,
        displayName: '베이스 원 테두리 색',
        tooltip: '조이스틱 바깥 큰 원의 테두리 선 색'
      }), _dec7 = property({
        type: Color,
        displayName: '노브 채움 색',
        tooltip: '손가락을 따라 움직이는 안쪽 작은 원의 색'
      }), _dec8 = property({
        type: Color,
        displayName: '노브 테두리 색',
        tooltip: '안쪽 작은 원의 테두리 선 색'
      }), _dec(_class = (_class2 = class JoystickUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "knob", _descriptor, this);

          _initializerDefineProperty(this, "radius", _descriptor2, this);

          _initializerDefineProperty(this, "touchZone", _descriptor3, this);

          _initializerDefineProperty(this, "uiCamera", _descriptor4, this);

          // ── 색 ─────────────────────────────────────────────────────────────────
          // 조이스틱은 이미지가 아니라 cc.Graphics로 그때그때 그린다(에셋 없이 반경만 바꿔도
          // 모양이 따라오게 하려고). 그래서 색도 여기서 지정한다. 기본값은 예전에 코드에
          // 박혀 있던 값 그대로라, 건드리지 않으면 지금과 똑같이 보인다.
          _initializerDefineProperty(this, "baseFillColor", _descriptor5, this);

          _initializerDefineProperty(this, "baseStrokeColor", _descriptor6, this);

          _initializerDefineProperty(this, "knobFillColor", _descriptor7, this);

          _initializerDefineProperty(this, "knobStrokeColor", _descriptor8, this);

          this._dir = new Vec2();
          this._active = false;
          this._touchId = -1;
        }

        /** 방향 벡터. 크기가 0(중앙)~1(가장자리)로 스틱을 밀어낸 정도를 그대로 나타냄. Vec2.ZERO when idle */
        get direction() {
          return this._dir;
        }
        /** 조이스틱을 강제로 숨기고 입력을 완전히 무효화한다 — CTA 등 게임 종료 화면으로 넘어갈 때
         * 사용. 터치 도중(손을 안 뗀 채로) 호출돼도 안전하게 정리되고, 터치 감지 영역 자체도
         * 꺼서 그 뒤로는 새 터치가 다시 조이스틱을 띄우지 못하게 한다. */


        disable() {
          var _this$knob;

          this._active = false;
          this._touchId = -1;

          this._dir.set(0, 0);

          (_this$knob = this.knob) == null || _this$knob.setPosition(0, 0, 0);
          this.node.active = false;
          if (this.touchZone) this.touchZone.active = false;
        }

        onLoad() {
          var _this$touchZone;

          this._drawVisuals(); // 터치는 시작된 노드가 그 제스처(move/end)를 끝까지 계속 받는다(Cocos의 터치 캡처
          // 방식) — 그래서 start/move/end/cancel을 전부 같은 노드(touchZone, 지정 안 하면
          // 이 노드 자신)에 등록해야 한다. touchZone에서 시작해도 이 노드(베이스 링) 자체를
          // 눌린 지점으로 옮겨서 보여주고, 그 이후 좌표 계산은 그대로 이 노드 기준으로 한다.


          const target = (_this$touchZone = this.touchZone) != null ? _this$touchZone : this.node;
          target.on(Node.EventType.TOUCH_START, this._onStart, this);
          target.on(Node.EventType.TOUCH_MOVE, this._onMove, this);
          target.on(Node.EventType.TOUCH_END, this._onEnd, this);
          target.on(Node.EventType.TOUCH_CANCEL, this._onEnd, this); // 플로팅 조이스틱은 누르기 전엔 숨겨둔다.

          if (this.touchZone) this.node.active = false;
        }

        onDestroy() {
          var _this$touchZone2;

          const target = (_this$touchZone2 = this.touchZone) != null ? _this$touchZone2 : this.node;
          target.off(Node.EventType.TOUCH_START, this._onStart, this);
          target.off(Node.EventType.TOUCH_MOVE, this._onMove, this);
          target.off(Node.EventType.TOUCH_END, this._onEnd, this);
          target.off(Node.EventType.TOUCH_CANCEL, this._onEnd, this);
        } // ── Visuals ────────────────────────────────────────────────────────────


        _drawVisuals() {
          var _this$node$getCompone;

          // Base ring
          let g = (_this$node$getCompone = this.node.getComponent(Graphics)) != null ? _this$node$getCompone : this.node.addComponent(Graphics);
          g.clear();
          g.fillColor = this.baseFillColor;
          g.strokeColor = this.baseStrokeColor;
          g.lineWidth = 5;
          g.circle(0, 0, this.radius);
          g.fill();
          g.stroke(); // Knob dot

          if (this.knob) {
            var _this$knob$getCompone;

            let kg = (_this$knob$getCompone = this.knob.getComponent(Graphics)) != null ? _this$knob$getCompone : this.knob.addComponent(Graphics);
            kg.clear();
            kg.fillColor = this.knobFillColor;
            kg.strokeColor = this.knobStrokeColor;
            kg.lineWidth = 3;
            kg.circle(0, 0, this.radius * 0.38);
            kg.fill();
            kg.stroke();
          }
        } // ── Touch handlers ─────────────────────────────────────────────────────


        _onStart(e) {
          if (this._active) return;
          this._active = true;
          this._touchId = e.getID(); // touchZone(화면 전체)에서 시작한 경우, 눌린 지점을 이 노드의 부모 기준 좌표로
          // 바꿔서 베이스 링 자체를 그 자리로 옮기고 보이게 한다 — "어디를 눌러도 그 자리에서
          // 시작"하는 플로팅 조이스틱의 핵심 동작.

          if (this.touchZone) {
            var _this$node$parent;

            const parentUi = (_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.getComponent(UITransform);

            if (parentUi && this.uiCamera) {
              const screen = e.getLocation();
              const world = new Vec3();
              this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
              const local = parentUi.convertToNodeSpaceAR(world);
              this.node.setPosition(local.x, local.y, 0);
            }

            this.node.active = true;
          }

          this._apply(e);
        }

        _onMove(e) {
          if (e.getID() !== this._touchId) return;

          this._apply(e);
        }

        _onEnd(e) {
          var _this$knob2;

          if (e.getID() !== this._touchId) return;
          this._active = false;
          this._touchId = -1;

          this._dir.set(0, 0);

          (_this$knob2 = this.knob) == null || _this$knob2.setPosition(0, 0, 0); // 플로팅 조이스틱은 손을 떼면 다시 숨긴다 (touchZone 없이 고정 배치로 쓰는 경우는
          // 기존처럼 계속 표시).

          if (this.touchZone) this.node.active = false;
        }

        _apply(e) {
          const ui = this.node.getComponent(UITransform);
          if (!ui || !this.knob || !this.uiCamera) return; // e.getUILocation()은 cc.view의 정적 디자인 해상도 스케일을 기준으로 변환되는데,
          // UIAutoFit이 화면 비율에 맞춰 Canvas/UICamera를 매 리사이즈마다 직접 재조정하고 있어서
          // 그 값과 어긋난다 (특히 세로 화면에서 크게 벌어짐). 대신 UICamera의 실시간 투영으로
          // 직접 화면 좌표 → 월드 좌표 → 이 노드의 로컬 좌표로 변환해서 항상 실제 렌더링과 일치시킨다.

          const screen = e.getLocation();
          const world = new Vec3();
          this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
          const local = ui.convertToNodeSpaceAR(world);
          const len = Math.sqrt(local.x * local.x + local.y * local.y); // 노브는 항상 클릭/터치 지점 그대로 이동 (반경 밖이면 가장자리로 clamp)

          const clamp = Math.min(len, this.radius);
          const kx = len > 0 ? local.x / len * clamp : 0;
          const ky = len > 0 ? local.y / len * clamp : 0;
          this.knob.setPosition(kx, ky, 0); // 방향은 유지하되 크기는 0(중앙)~1(가장자리)로 스틱을 밀어낸 비율을 그대로 담음
          // → Player.ts가 이 크기만큼 이동 속도를 비례시킴

          this._dir.set(kx / this.radius, ky / this.radius);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "knob", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "radius", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 100;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "touchZone", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "uiCamera", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "baseFillColor", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(0, 0, 0, 120);
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "baseStrokeColor", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(255, 255, 255, 230);
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "knobFillColor", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(80, 160, 255, 220);
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "knobStrokeColor", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(255, 255, 255, 255);
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=caf3e34bb2f4eb50795db7f76adc9caa483ee1e8.js.map