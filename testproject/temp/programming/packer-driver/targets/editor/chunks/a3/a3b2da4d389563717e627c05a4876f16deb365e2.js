System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Camera, Sprite, Vec3, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, MonsterHpBarView;

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
      Camera = _cc.Camera;
      Sprite = _cc.Sprite;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "eb621NHZHhPqZ9e39HyzIv/", "MonsterHpBarView", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Camera', 'Sprite', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 몬스터 머리 위에 뜨는 체력바 하나의 표시 로직. MonsterHealthBarManager가 풀에서 꺼내 재사용하는
       * 인스턴스에 붙어있다 — 매 프레임 target(몬스터) 위쪽의 화면 좌표를 계산해 스스로를 그 자리로
       * 옮기고, target이 카메라 뒤에 있거나 사라졌으면 자동으로 숨긴다.
       * WorldUIAnchor(플레이어 체력바용)와 달리 화면 가장자리로 clamp하지 않는다 — 몬스터가 화면
       * 밖으로 나가면 그냥 안 보이는 게 맞고, 가장자리에 들러붙어 쌓이면 오히려 지저분해지기 때문.
       */

      _export("MonsterHpBarView", MonsterHpBarView = (_dec = ccclass('MonsterHpBarView'), _dec2 = property(Camera), _dec3 = property(Sprite), _dec4 = property({
        displayName: '높이 오프셋',
        tooltip: 'target 위로 띄울 높이 (월드 단위, 몬스터 스케일 적용 전 기준)'
      }), _dec(_class = (_class2 = class MonsterHpBarView extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "worldCamera", _descriptor, this);

          _initializerDefineProperty(this, "fillSprite", _descriptor2, this);

          _initializerDefineProperty(this, "offsetY", _descriptor3, this);

          /** 따라다닐 몬스터 노드. MonsterHealthBar가 acquire 직후 설정한다 */
          this.target = null;
          this._worldPos = new Vec3();
          this._uiPos = new Vec3();
          this._camToTarget = new Vec3();
        }

        setRatio(ratio) {
          if (this.fillSprite) this.fillSprite.fillRange = Math.max(0, Math.min(1, ratio));
        }

        update() {
          if (!this.target || !this.target.isValid || !this.worldCamera || !this.node.parent) {
            this.node.active = false;
            return;
          } // 카메라 뒤쪽에 있으면(이론상 드묾 — 탑다운 카메라라도 안전하게) 표시하지 않는다.


          Vec3.subtract(this._camToTarget, this.target.worldPosition, this.worldCamera.node.worldPosition);

          if (Vec3.dot(this._camToTarget, this.worldCamera.node.forward) <= 0) {
            this.node.active = false;
            return;
          }

          this.node.active = true;
          Vec3.copy(this._worldPos, this.target.worldPosition); // offsetY는 "스케일 1 기준" 높이다 — 몬스터마다 스폰 스케일이 다르므로(기본 몬스터
          // 0.5, 보스 1.5 등) 실제 월드 오프셋도 그 스케일만큼 같이 줄어들거나 늘어나야 머리
          // 위 적당한 자리에 뜬다. 이걸 고정값으로 두면 작은 몬스터일수록 체력바가 실제 몸통보다
          // 훨씬 위로 떠서, 카메라 화각(특히 화면 비율이 좁은 데스크톱 와이드 화면)에 따라
          // 화면 밖으로 완전히 벗어나 아예 안 보이는 현상이 생긴다.

          this._worldPos.y += this.offsetY * this.target.worldScale.y;
          this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);
          this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fillSprite", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "offsetY", [_dec4], {
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
//# sourceMappingURL=a3b2da4d389563717e627c05a4876f16deb365e2.js.map