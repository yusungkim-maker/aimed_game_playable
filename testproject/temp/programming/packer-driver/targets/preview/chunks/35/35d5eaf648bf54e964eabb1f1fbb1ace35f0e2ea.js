System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Material, MeshRenderer, utils, primitives, EDITOR_NOT_IN_PREVIEW, _dec, _dec2, _dec3, _class, _class2, _descriptor, _crd, ccclass, property, executeInEditMode, DEBUG_CONTAINER_NAME, MARKER_SIZE, FollowerFormation;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
      Material = _cc.Material;
      MeshRenderer = _cc.MeshRenderer;
      utils = _cc.utils;
      primitives = _cc.primitives;
    }, function (_ccEnv) {
      EDITOR_NOT_IN_PREVIEW = _ccEnv.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c60788n5b5KtpVq3wpRHtPS", "FollowerFormation", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Mesh', 'Material', 'MeshRenderer', 'utils', 'primitives']);

      ({
        ccclass,
        property,
        executeInEditMode
      } = _decorator);
      DEBUG_CONTAINER_NAME = '__FollowerDebug__';
      MARKER_SIZE = 0.25; // 디버그 박스 한 변 길이(m)

      /**
       * 추종 캐릭터들이 설 수 있는 고정 슬롯들을 정의한다. MapBounds.vertices와 같은 방식으로,
       * 슬롯 하나하나가 이 노드(플레이어)의 자식 노드로 존재하고("Slot0", "Slot1", ... 이름 순서로
       * 자동 인식) 씬 뷰에서 각 자식 노드를 직접 드래그해 원하는 대형(격자든 V자든 무엇이든)을
       * 자유롭게 잡을 수 있다. 이름의 숫자 순서가 곧 배정 우선순위(추종자가 하나씩 늘어날 때
       * 먼저 채워지는 순서)다.
       *
       * 슬롯 노드 자체는 빈 노드라 씬 뷰에서 눈에 띄지 않으므로, showDebugMarkers를 켜두면
       * 각 슬롯 위치에 작은 박스를 그려 한눈에 배치를 확인하며 드래그할 수 있게 해준다
       * (MapBounds의 showDebugOutline과 동일한 원리) — Play/빌드 중에는 항상 자동으로 숨겨진다.
       */

      _export("FollowerFormation", FollowerFormation = (_dec = ccclass('FollowerFormation'), _dec2 = property({
        displayName: '슬롯 마커 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 각 슬롯 위치에 작은 박스를 그려 눈으로 바로 확인/드래그할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec3 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = class FollowerFormation extends Component {
        constructor() {
          super(...arguments);
          this._showDebugMarkers = true;

          _initializerDefineProperty(this, "debugMaterial", _descriptor, this);

          this._slots = [];
          this._claimed = [];
          this._debugContainer = null;
          this._debugMarkers = [];
          this._markerMesh = null;
        }

        get showDebugMarkers() {
          return this._showDebugMarkers;
        }

        set showDebugMarkers(v) {
          this._showDebugMarkers = v;
          this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
        }

        onLoad() {
          this._collectSlots(); // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
          // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.


          if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureContainer().active = false;
          }
        }

        update() {
          // 디버그 마커는 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다.
          if (!EDITOR_NOT_IN_PREVIEW) return;

          this._collectSlots(); // 에디터에서 슬롯 노드를 추가/삭제/이름변경해도 즉시 반영


          if (this._showDebugMarkers) this._redrawDebug();else if (this._debugContainer) this._debugContainer.active = false;
        }

        _collectSlots() {
          var found = [];

          for (var child of this.node.children) {
            if (child.name === DEBUG_CONTAINER_NAME) continue;
            var m = /^Slot(\d+)$/.exec(child.name);
            if (m) found.push({
              index: parseInt(m[1], 10),
              node: child
            });
          }

          found.sort((a, b) => a.index - b.index);
          this._slots = found.map(f => f.node);
          if (this._claimed.length !== this._slots.length) this._claimed = new Array(this._slots.length).fill(false);
        }
        /** 비어있는 슬롯 중 이름 순서상 가장 먼저인 것을 하나 예약한다. 꽉 찼으면 -1 */


        reserveSlot() {
          for (var i = 0; i < this._claimed.length; i++) {
            if (!this._claimed[i]) {
              this._claimed[i] = true;
              return i;
            }
          }

          return -1;
        }
        /** 추종자가 사라질 때 자리를 반납 */


        releaseSlot(index) {
          if (this._claimed && index >= 0 && index < this._claimed.length) this._claimed[index] = false;
        }
        /** 슬롯의 실시간 월드 좌표 (슬롯 노드를 옮기거나 캐릭터가 움직이면 즉시 반영됨) */


        getSlotWorldPosition(index, out) {
          Vec3.copy(out, this._slots[index].worldPosition);
          return out;
        }

        _ensureContainer() {
          if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
          var c = this.node.getChildByName(DEBUG_CONTAINER_NAME);

          if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
          }

          c.setPosition(0, 0, 0);
          c.setRotationFromEuler(0, 0, 0);
          c.setScale(1, 1, 1);
          this._debugContainer = c;
          this._debugMarkers = c.children.slice();
          return c;
        }

        _ensureMarkerCount(count) {
          var container = this._ensureContainer();

          if (!this._markerMesh) {
            this._markerMesh = utils.createMesh(primitives.box({
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              length: MARKER_SIZE
            }));
          }

          while (this._debugMarkers.length < count) {
            var marker = new Node("marker_" + this._debugMarkers.length);
            container.addChild(marker);
            var mr = marker.addComponent(MeshRenderer);
            mr.mesh = this._markerMesh;
            if (this.debugMaterial) mr.setMaterial(this.debugMaterial, 0);

            this._debugMarkers.push(marker);
          }

          for (var i = count; i < this._debugMarkers.length; i++) this._debugMarkers[i].active = false;

          for (var _i = 0; _i < count; _i++) this._debugMarkers[_i].active = true;
        }

        _redrawDebug() {
          if (this._slots.length === 0) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }

          this._ensureContainer().active = true;

          this._ensureMarkerCount(this._slots.length);

          for (var i = 0; i < this._slots.length; i++) {
            this._debugMarkers[i].setWorldPosition(this._slots[i].worldPosition);
          }
        }

      }, (_applyDecoratedDescriptor(_class2.prototype, "showDebugMarkers", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugMarkers"), _class2.prototype), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "debugMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=35d5eaf648bf54e964eabb1f1fbb1ace35f0e2ea.js.map