System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Mesh, Material, CCFloat, CCInteger, MonsterDeadEffect, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _class3, _crd, ccclass, property, MonsterDeadEffectSpawner;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMonsterDeadEffect(extras) {
    _reporterNs.report("MonsterDeadEffect", "./MonsterDeadEffect", _context.meta, extras);
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
      Node = _cc.Node;
      Mesh = _cc.Mesh;
      Material = _cc.Material;
      CCFloat = _cc.CCFloat;
      CCInteger = _cc.CCInteger;
    }, function (_unresolved_2) {
      MonsterDeadEffect = _unresolved_2.MonsterDeadEffect;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "aa81bAn+YRF6K6ldzuuah/E", "MonsterDeadEffectSpawner", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Mesh', 'Material', 'Vec3', 'CCFloat', 'CCInteger']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 몬스터가 죽은 자리에 아틀라스 시퀀스 폭발 이펙트를 띄우는 단일 스포너.
       * Monster는 죽는 순간 여기에 위치만 넘기고 바로 사라진다 — 메시/머티리얼/타이밍 설정을
       * 몬스터 프리팹마다 중복해서 들고 있지 않도록, MonsterHealthBarManager와 같은
       * "씬에 하나만 두는 매니저" 패턴을 따랐다.
       */

      _export("MonsterDeadEffectSpawner", MonsterDeadEffectSpawner = (_dec = ccclass('MonsterDeadEffectSpawner'), _dec2 = property({
        type: Mesh,
        displayName: '쿼드 메시',
        tooltip: '이펙트를 그릴 평면 메시 — 히트 이펙트가 쓰는 것과 같은 것(UI_arrow.glb의 쿼드)을 그대로 쓰면 된다'
      }), _dec3 = property({
        type: Material,
        displayName: '이펙트 머티리얼',
        tooltip: 'texture/MonsterDeadFx.mtl — monster_dead_effect.png를 쓰는 unlit 반투명 머티리얼'
      }), _dec4 = property({
        type: CCInteger,
        displayName: '아틀라스 열(가로 칸수)'
      }), _dec5 = property({
        type: CCInteger,
        displayName: '아틀라스 행(세로 칸수)'
      }), _dec6 = property({
        type: CCInteger,
        displayName: '총 프레임 수',
        tooltip: '격자 칸이 남더라도 여기 적은 수만큼만 재생한다'
      }), _dec7 = property({
        type: CCFloat,
        displayName: '초당 프레임(FPS)',
        tooltip: '9프레임 기준 24면 약 0.37초 동안 재생된다'
      }), _dec8 = property({
        type: CCFloat,
        displayName: '이펙트 크기'
      }), _dec9 = property({
        type: CCFloat,
        displayName: '높이 오프셋(m)',
        tooltip: '몬스터 발밑 기준 이만큼 위에 이펙트를 띄운다'
      }), _dec10 = property({
        displayName: '아틀라스 첫 프레임이 아래쪽',
        tooltip: '재생 순서가 거꾸로(작은 파편 → 폭발)로 보이면 이 값을 켜서 행 순서를 뒤집는다'
      }), _dec(_class = (_class2 = (_class3 = class MonsterDeadEffectSpawner extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "quadMesh", _descriptor, this);

          _initializerDefineProperty(this, "fxMaterial", _descriptor2, this);

          _initializerDefineProperty(this, "cols", _descriptor3, this);

          _initializerDefineProperty(this, "rows", _descriptor4, this);

          _initializerDefineProperty(this, "frameCount", _descriptor5, this);

          _initializerDefineProperty(this, "fps", _descriptor6, this);

          _initializerDefineProperty(this, "size", _descriptor7, this);

          _initializerDefineProperty(this, "heightOffset", _descriptor8, this);

          _initializerDefineProperty(this, "rowsBottomUp", _descriptor9, this);
        }

        onLoad() {
          MonsterDeadEffectSpawner.instance = this;
        }

        onDestroy() {
          if (MonsterDeadEffectSpawner.instance === this) MonsterDeadEffectSpawner.instance = null;
        }
        /** 몬스터가 죽는 순간 그 위치에 이펙트를 하나 띄운다 */


        playAt(worldPos, scaleMult = 1) {
          if (!this.quadMesh || !this.fxMaterial) return;
          const fx = new Node('MonsterDeadFx');
          this.node.addChild(fx);
          fx.setWorldPosition(worldPos.x, worldPos.y + this.heightOffset, worldPos.z);
          fx.addComponent(_crd && MonsterDeadEffect === void 0 ? (_reportPossibleCrUseOfMonsterDeadEffect({
            error: Error()
          }), MonsterDeadEffect) : MonsterDeadEffect).init(this.quadMesh, this.fxMaterial, {
            cols: this.cols,
            rows: this.rows,
            frameCount: this.frameCount,
            fps: this.fps,
            size: this.size * scaleMult,
            rowsBottomUp: this.rowsBottomUp
          });
        }

      }, _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "quadMesh", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fxMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "cols", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rows", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "frameCount", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 9;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "fps", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 24;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "size", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "heightOffset", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.8;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "rowsBottomUp", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b9f9c5a9bdbecd95cd9203d85ad1818b5b20019a.js.map