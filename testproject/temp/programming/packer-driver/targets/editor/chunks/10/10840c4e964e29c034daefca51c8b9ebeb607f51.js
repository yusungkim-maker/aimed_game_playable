System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, BoneMeshSync;

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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ca28czXhgNFRYuHeVwKdl3/", "BoneMeshSync", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * wall.glb에는 스키닝 데이터가 없어서(Bone/Bone.001에 물린 스킨 메쉬가 아니라 별도 메쉬 노드)
       * appear 클립이 Bone을 애니메이션해도 실제 메쉬(wall.001)는 움직이지 않는다.
       * 그렇다고 wall.001을 Bone의 자식으로 옮기면 appear 클립에 베이크된 트랙 경로("wall/wall.001")가
       * 깨져 씬 활성화 시점에 "Node Wall has no path wall/wall.001" 에러가 난다(Wall 전체 인스턴스에서 확인됨).
       * 그래서 계층 구조는 원본(둘 다 wall의 자식)대로 두고, 매 프레임 이 컴포넌트가 sourceBone의
       * 로컬 트랜스폼을 wall.001에 그대로 복사해 애니메이션을 흉내낸다.
       */

      _export("BoneMeshSync", BoneMeshSync = (_dec = ccclass('BoneMeshSync'), _dec2 = property({
        type: Node,
        displayName: '따라갈 본',
        tooltip: '이 노드의 로컬 position/rotation/scale을 매 프레임 그대로 복사해온다'
      }), _dec(_class = (_class2 = class BoneMeshSync extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "sourceBone", _descriptor, this);
        }

        update() {
          if (!this.sourceBone) return;
          this.node.setPosition(this.sourceBone.position);
          this.node.setRotation(this.sourceBone.rotation);
          this.node.setScale(this.sourceBone.scale);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "sourceBone", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=10840c4e964e29c034daefca51c8b9ebeb607f51.js.map