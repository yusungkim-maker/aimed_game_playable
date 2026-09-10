System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Camera, UITransform, Vec3, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, WorldUIAnchor;

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
      Camera = _cc.Camera;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "baac7lU9VhKybNJEve7mKg4", "WorldUIAnchor", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Camera', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 이 UI 노드를 3D 월드의 target 노드 위(offsetY)의 화면 위치에 매 프레임 고정시킨다 */

      _export("WorldUIAnchor", WorldUIAnchor = (_dec = ccclass('WorldUIAnchor'), _dec2 = property(Node), _dec3 = property(Camera), _dec4 = property({
        displayName: '높이 오프셋',
        tooltip: 'target 위로 띄울 높이 (월드 단위)'
      }), _dec5 = property({
        displayName: '화면 여백',
        tooltip: '화면 경계에서 이만큼 안쪽으로 clamp (px)'
      }), _dec(_class = (_class2 = class WorldUIAnchor extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "target", _descriptor, this);

          _initializerDefineProperty(this, "worldCamera", _descriptor2, this);

          _initializerDefineProperty(this, "offsetY", _descriptor3, this);

          _initializerDefineProperty(this, "screenMargin", _descriptor4, this);

          this._worldPos = new Vec3();
          this._uiPos = new Vec3();
        }

        update() {
          if (!this.target || !this.worldCamera || !this.node.parent) return;
          Vec3.copy(this._worldPos, this.target.worldPosition);
          this._worldPos.y += this.offsetY;
          this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);
          const parentUI = this.node.parent.getComponent(UITransform);

          if (parentUI) {
            const halfW = parentUI.contentSize.width / 2 - this.screenMargin;
            const halfH = parentUI.contentSize.height / 2 - this.screenMargin;
            this._uiPos.x = Math.min(Math.max(this._uiPos.x, -halfW), halfW);
            this._uiPos.y = Math.min(Math.max(this._uiPos.y, -halfH), halfH);
          }

          this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec3], {
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
          return 3;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "screenMargin", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 20;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f4390ff36f129c7076777e420c48ff33ab7ef6b4.js.map