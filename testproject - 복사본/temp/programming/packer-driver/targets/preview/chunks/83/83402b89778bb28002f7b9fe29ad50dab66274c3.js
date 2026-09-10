System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Camera, CCFloat, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _crd, ccclass, property, CameraFollow;

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
      Vec3 = _cc.Vec3;
      Camera = _cc.Camera;
      CCFloat = _cc.CCFloat;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4fd77EjZNtI1oeRfn4BooQm", "CameraFollow", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Camera', 'CCFloat']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 카메라와 target(플레이어) 사이의 현재 오프셋을 유지한 채로 target을 따라간다.
       * 엔딩에서는 playEndingZoom()으로 추적 대상을 기지로 바꾸고 천천히 줌아웃한다. */

      _export("CameraFollow", CameraFollow = (_dec = ccclass('CameraFollow'), _dec2 = property(Node), _dec3 = property({
        displayName: '부드러운 추적',
        tooltip: '켜면 부드럽게 보간, 끄면 즉시 스냅'
      }), _dec4 = property({
        type: CCFloat,
        displayName: '추적 속도',
        tooltip: 'smooth가 켜졌을 때 초당 보간 비율. 클수록 빠르게 따라붙음'
      }), _dec(_class = (_class2 = (_class3 = class CameraFollow extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "target", _descriptor, this);

          _initializerDefineProperty(this, "smooth", _descriptor2, this);

          _initializerDefineProperty(this, "followSpeed", _descriptor3, this);

          this._offset = new Vec3();
          this._desired = new Vec3();
          // ── 엔딩 줌아웃 ───────────────────────────────────────────────────────
          this._cam = null;
          this._zooming = false;
          this._zoomTimer = 0;
          this._zoomDuration = 0;
          this._orthoFrom = 0;
          this._orthoTo = 0;

          /** 원근 카메라일 때만 쓰는 오프셋(=카메라 거리) 배율 */
          this._offsetFrom = 1;
          this._offsetTo = 1;
          this._baseOffset = new Vec3();

          /** 엔딩에서 화면 구도를 잡기 위해 추적 지점에 더하는 월드 오프셋 */
          this._endingOffset = new Vec3();
        }

        onLoad() {
          CameraFollow.instance = this;
        }

        onDestroy() {
          if (CameraFollow.instance === this) CameraFollow.instance = null;
        }

        start() {
          if (!this.target) return; // 카메라가 바라보는 방향(고정, 회전 안 함)을 구해서 target이 그 시선의
          // 정중앙(=화면 중앙)에 오도록 오프셋을 계산한다. 높이차는 현재 배치된
          // 카메라 높이를 그대로 유지 — 즉 줌/구도는 그대로 두고 위치만 광선 위로 맞춘다.

          var forward = new Vec3();
          Vec3.transformQuat(forward, Vec3.FORWARD, this.node.worldRotation);
          var heightOffset = this.node.worldPosition.y - this.target.worldPosition.y;
          var k = heightOffset / -forward.y;
          Vec3.multiplyScalar(this._offset, forward, -k);
          Vec3.copy(this._baseOffset, this._offset);
        }
        /** 엔딩 연출 — 추적 대상을 기지로 바꾸고 duration초에 걸쳐 zoomMult배만큼 줌아웃한다.
         *
         * 직교(Ortho) 카메라는 뒤로 물러나도 보이는 범위가 그대로라 orthoHeight를 키워야 하고,
         * 원근(Perspective) 카메라는 반대로 orthoHeight가 의미 없으니 카메라를 뒤로 뺀다 —
         * 둘 중 무엇으로 설정돼 있든 같은 결과가 나오도록 투영 방식을 보고 갈라서 처리한다.
         *
         * @param offset 기지 위치에 더해서 최종 구도를 잡는 월드 오프셋. 줌아웃하면 기지가 화면
         *               한쪽으로 치우치는데, 이 값으로 카메라를 밀어 원하는 자리에 오게 맞춘다.
         *               부드러운 추적 보간을 그대로 타므로 툭 튀지 않고 미끄러지듯 옮겨간다. */


        playEndingZoom(target, zoomMult, duration, followSpeed, offset) {
          if (target) this.target = target;
          this.followSpeed = followSpeed;
          Vec3.copy(this._endingOffset, offset);
          this._cam = this.getComponent(Camera);
          this._zoomTimer = 0;
          this._zoomDuration = Math.max(0.0001, duration);
          this._zooming = true;

          if (this._cam && this._cam.projection === Camera.ProjectionType.ORTHO) {
            this._orthoFrom = this._cam.orthoHeight;
            this._orthoTo = this._cam.orthoHeight * zoomMult;
            this._offsetFrom = this._offsetTo = 1;
          } else {
            this._orthoFrom = this._orthoTo = 0;
            this._offsetFrom = 1;
            this._offsetTo = zoomMult;
          }
        }

        lateUpdate(dt) {
          if (this._zooming) this._updateZoom(dt);
          if (!this.target) return;
          Vec3.add(this._desired, this.target.worldPosition, this._offset);
          Vec3.add(this._desired, this._desired, this._endingOffset);

          if (this.smooth) {
            var t = 1 - Math.exp(-this.followSpeed * dt);
            Vec3.lerp(this._desired, this.node.worldPosition, this._desired, t);
          }

          this.node.setWorldPosition(this._desired);
        }

        _updateZoom(dt) {
          this._zoomTimer += dt;
          var raw = Math.min(1, this._zoomTimer / this._zoomDuration); // ease-out — 처음엔 빠르게 벌어지다 끝에서 부드럽게 멈춘다

          var t = 1 - (1 - raw) * (1 - raw);

          if (this._orthoTo > 0 && this._cam) {
            this._cam.orthoHeight = this._orthoFrom + (this._orthoTo - this._orthoFrom) * t;
          } else {
            var mult = this._offsetFrom + (this._offsetTo - this._offsetFrom) * t;
            Vec3.multiplyScalar(this._offset, this._baseOffset, mult);
          }

          if (raw >= 1) this._zooming = false;
        }

      }, _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "smooth", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followSpeed", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=83402b89778bb28002f7b9fe29ad50dab66274c3.js.map