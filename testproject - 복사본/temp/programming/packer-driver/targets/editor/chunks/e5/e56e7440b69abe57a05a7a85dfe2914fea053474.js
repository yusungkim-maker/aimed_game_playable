System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MeshRenderer, Material, Color, CCFloat, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, StructureHitFlash;

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
      MeshRenderer = _cc.MeshRenderer;
      Material = _cc.Material;
      Color = _cc.Color;
      CCFloat = _cc.CCFloat;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "40fa4r9cZNNbJbRGqbiSalD", "StructureHitFlash", undefined);

      __checkObsolete__(['_decorator', 'Component', 'MeshRenderer', 'Material', 'Color', 'CCFloat']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * 몬스터에게 두들겨 맞는 동안 구조물(문/기지)을 StructureHit.effect 머티리얼로 갈아끼워
       * "원래 색 + 지정 단색 블렌딩 + 아웃라인"으로 표시한다.
       *
       * 색/두께는 렌더러별 머티리얼 인스턴스에만 덮어쓰므로 공유 에셋(.mtl)은 건드리지 않는다 —
       * 문마다 다른 색을 쓰고 싶으면 이 컴포넌트 값만 바꾸면 된다.
       *
       * DoorHealth.takeDamage() / GameManager.baseTakeDamage()가 피격 순간마다 flash()를 부른다.
       */
      _export("StructureHitFlash", StructureHitFlash = (_dec = ccclass('StructureHitFlash'), _dec2 = property({
        type: Material,
        displayName: '피격 머티리얼',
        tooltip: 'effects/StructureHitFlash.mtl — 아웃라인 패스 + 단색 블렌딩용 머티리얼'
      }), _dec3 = property({
        displayName: '블렌딩 색',
        tooltip: '원래 머티리얼 색에 섞을 단색'
      }), _dec4 = property({
        type: CCFloat,
        displayName: '블렌딩 강도',
        tooltip: '0 = 원래 색 그대로, 1 = 완전히 단색으로 덮음',
        range: [0, 1],
        slide: true
      }), _dec5 = property({
        displayName: '아웃라인 색',
        tooltip: '테두리(실루엣) 색'
      }), _dec6 = property({
        type: CCFloat,
        displayName: '아웃라인 두께',
        tooltip: '엔진 내장 toon 아웃라인과 같은 단위 — 실제 부풀리는 양은 이 값 × 0.001(로컬 단위)이라 10이면 0.01만큼 두꺼워진다',
        range: [0, 200],
        slide: true
      }), _dec7 = property({
        type: CCFloat,
        displayName: '유지 시간(초)',
        tooltip: '마지막으로 맞은 뒤 이 시간이 지나면 원래 머티리얼로 되돌아간다. 몬스터 공격 간격보다 살짝 길게 두면 계속 두들겨 맞는 동안 끊기지 않고 유지된다'
      }), _dec(_class = (_class2 = class StructureHitFlash extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "hitMaterial", _descriptor, this);

          _initializerDefineProperty(this, "blendColor", _descriptor2, this);

          _initializerDefineProperty(this, "mixFactor", _descriptor3, this);

          _initializerDefineProperty(this, "outlineColor", _descriptor4, this);

          _initializerDefineProperty(this, "outlineWidth", _descriptor5, this);

          _initializerDefineProperty(this, "holdDuration", _descriptor6, this);

          this._entries = [];
          this._timer = 0;
        }

        /** 데미지를 입는 순간마다 호출 — 이미 켜져 있으면 유지 시간만 갱신한다 */
        flash() {
          this._timer = this.holdDuration;
          if (this._entries.length > 0 || !this.hitMaterial) return;

          for (const r of this.node.getComponentsInChildren(MeshRenderer)) {
            // 에디터 전용 디버그 박스(VirtualWall 기즈모)처럼 꺼져 있는 렌더러는 건너뛴다
            if (!r.node.activeInHierarchy) continue;
            const shared = [];

            for (let i = 0; i < r.sharedMaterials.length; i++) {
              var _r$sharedMaterials$i;

              const orig = (_r$sharedMaterials$i = r.sharedMaterials[i]) != null ? _r$sharedMaterials$i : null;
              shared.push(orig);
              r.setMaterial(this.hitMaterial, i);
              const inst = r.getMaterialInstance(i);
              if (!inst) continue; // 원래 텍스처를 물려줘서 형태/무늬는 그대로 두고 색만 블렌딩되게 한다.
              // passIdx를 명시하면 그 패스가 해당 프로퍼티를 선언하지 않은 경우(아웃라인 패스 등)
              // null이 나오므로 생략해서 전체 패스에서 찾게 둔다. 못 찾으면 이펙트 기본
              // 텍스처로 보이는 것뿐이라 그대로 진행해도 된다.

              const tex = orig == null ? void 0 : orig.getProperty('mainTexture');
              if (tex) inst.setProperty('mainTexture', tex);
              inst.setProperty('blendColor', this.blendColor);
              inst.setProperty('mixFactor', this.mixFactor);
              inst.setProperty('outlineColor', this.outlineColor);
              inst.setProperty('lineWidth', this.outlineWidth);
            }

            this._entries.push({
              renderer: r,
              shared
            });
          }
        }

        update(dt) {
          if (this._entries.length === 0) return;
          this._timer -= dt;
          if (this._timer > 0) return;

          for (const e of this._entries) {
            if (!e.renderer.isValid) continue;

            for (let i = 0; i < e.shared.length; i++) {
              const orig = e.shared[i];
              if (orig) e.renderer.setMaterial(orig, i);
            }
          }

          this._entries = [];
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hitMaterial", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "blendColor", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(255, 0, 0, 255);
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "mixFactor", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "outlineColor", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color(255, 0, 0, 255);
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "outlineWidth", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "holdDuration", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.4;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e56e7440b69abe57a05a7a85dfe2914fea053474.js.map