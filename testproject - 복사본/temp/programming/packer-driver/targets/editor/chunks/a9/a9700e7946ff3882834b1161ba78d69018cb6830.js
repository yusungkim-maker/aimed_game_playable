System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Mesh, Material, MeshRenderer, Vec4, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, ATLAS_WIDTH, ATLAS_HEIGHT, DIGIT_RECTS, AtlasNumber;

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
      Mesh = _cc.Mesh;
      Material = _cc.Material;
      MeshRenderer = _cc.MeshRenderer;
      Vec4 = _cc.Vec4;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ce780q0lYxHMpa047zGEZhE", "AtlasNumber", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Mesh', 'Material', 'MeshRenderer', 'Vec4']);

      ({
        ccclass,
        property
      } = _decorator);

      /** number.png 텍스처의 원본 픽셀 크기 (아틀라스가 바뀌면 함께 갱신해야 함) */
      ATLAS_WIDTH = 215;
      ATLAS_HEIGHT = 208;
      /**
       * assets/texture/number.png 아틀라스에서 실측한 각 글자의 원본 픽셀 좌표(좌상단 기준) —
       * 4열x3행(1행: 1,2,3,4 / 2행: 5,6,7,0 / 3행: 8,9,-,+)으로 그려진 손그림 숫자 아틀라스를
       * 스캔해서 얻은 값. 이미지가 바뀌면 다시 측정해야 함.
       */

      DIGIT_RECTS = {
        '1': {
          x: 3,
          y: 0,
          width: 45,
          height: 66
        },
        '2': {
          x: 54,
          y: 0,
          width: 49,
          height: 66
        },
        '3': {
          x: 108,
          y: 0,
          width: 49,
          height: 66
        },
        '4': {
          x: 162,
          y: 0,
          width: 52,
          height: 66
        },
        '5': {
          x: 0,
          y: 71,
          width: 48,
          height: 66
        },
        '6': {
          x: 55,
          y: 71,
          width: 49,
          height: 66
        },
        '7': {
          x: 110,
          y: 71,
          width: 48,
          height: 66
        },
        '0': {
          x: 164,
          y: 71,
          width: 48,
          height: 66
        },
        '8': {
          x: 1,
          y: 142,
          width: 48,
          height: 66
        },
        '9': {
          x: 54,
          y: 142,
          width: 49,
          height: 66
        },
        '-': {
          x: 110,
          y: 142,
          width: 32,
          height: 66
        },
        '+': {
          x: 146,
          y: 142,
          width: 50,
          height: 66
        }
      };
      /**
       * 킹샷류 모바일 게임처럼, cc.Label(폰트) 대신 숫자 전용 아틀라스 텍스처에서 각 글자를
       * 오려낸 3D 쿼드(MeshRenderer)를 가로로 나열해 숫자를 표시한다 — 2D UI가 아니라 실제
       * 3D 월드 오브젝트라서, 부모 노드(예: 소켓)의 자식으로 두면 그 오브젝트 바로 위에
       * 자연스럽게 붙어 다닌다(카메라 투영/스크린 좌표 변환 없이 트랜스폼만 상속).
       * setValue()를 호출할 때마다 필요한 만큼만 자식 쿼드를 재사용한다. 각 쿼드는 자기 자신의
       * MeshRenderer.getMaterialInstance()로 얻은 전용 머티리얼 인스턴스에 tilingOffset을 설정해
       * 아틀라스의 서로 다른 서브 영역을 샘플링한다 (HitEffect.ts와 동일한 방식).
       */

      _export("AtlasNumber", AtlasNumber = (_dec = ccclass('AtlasNumber'), _dec2 = property({
        type: Mesh,
        displayName: '쿼드 메쉬',
        tooltip: '평평한 2x2 쿼드 메쉬 (로컬 XY 평면, normal=+Z) — 이 프로젝트에서 재사용 중인 공용 쿼드'
      }), _dec3 = property({
        type: Material,
        displayName: '숫자 아틀라스 머티리얼',
        tooltip: 'texture/NumberAtlas.mtl (mainTexture=number.png, tilingOffset로 글자별 서브 영역을 샘플링)'
      }), _dec4 = property({
        displayName: '렌더 높이(월드 단위)',
        tooltip: '숫자 한 글자의 세로 크기. 가로는 원본 비율 그대로 자동 계산됨'
      }), _dec5 = property({
        displayName: '글자 간격(월드 단위)'
      }), _dec(_class = (_class2 = class AtlasNumber extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "quadMesh", _descriptor, this);

          _initializerDefineProperty(this, "atlasMaterial", _descriptor2, this);

          _initializerDefineProperty(this, "digitHeight", _descriptor3, this);

          _initializerDefineProperty(this, "spacing", _descriptor4, this);

          this._digitNodes = [];
          this._lastValue = null;
        }

        setValue(value) {
          const text = typeof value === 'number' ? String(Math.max(0, Math.floor(value))) : value;
          if (text === this._lastValue) return;
          this._lastValue = text;

          this._rebuild(text);
        }

        _rebuild(text) {
          if (!this.quadMesh || !this.atlasMaterial) return;

          while (this._digitNodes.length < text.length) this._digitNodes.push(this._createDigitNode());

          const widths = [];
          let totalWidth = 0;

          for (let i = 0; i < text.length; i++) {
            const r = DIGIT_RECTS[text[i]];
            const w = r ? r.width / r.height * this.digitHeight : 0;
            widths.push(w);
            totalWidth += w + (i > 0 ? this.spacing : 0);
          }

          let x = -totalWidth / 2;

          for (let i = 0; i < this._digitNodes.length; i++) {
            const node = this._digitNodes[i];

            if (i >= text.length) {
              node.active = false;
              continue;
            }

            node.active = true;
            const w = widths[i];
            const r = DIGIT_RECTS[text[i]];

            if (r) {
              const inst = node.getComponent(MeshRenderer).getMaterialInstance(0);
              inst == null || inst.setProperty('tilingOffset', new Vec4(r.width / ATLAS_WIDTH, r.height / ATLAS_HEIGHT, r.x / ATLAS_WIDTH, r.y / ATLAS_HEIGHT));
            }

            node.setPosition(x + w / 2, 0, 0);
            node.setScale(w / 2, this.digitHeight / 2, 1);
            x += w + this.spacing;
          }
        }

        _createDigitNode() {
          const node = new Node('digit');
          this.node.addChild(node);
          node.setRotationFromEuler(0, 0, 0);
          const mr = node.addComponent(MeshRenderer);
          mr.mesh = this.quadMesh;
          mr.setMaterial(this.atlasMaterial, 0);
          return node;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "quadMesh", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "atlasMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "digitHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "spacing", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.06;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a9700e7946ff3882834b1161ba78d69018cb6830.js.map