System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Mesh, Material, MeshRenderer, Vec3, Quat, EDITOR_NOT_IN_PREVIEW, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, executeInEditMode, DEBUG_CONTAINER_NAME, LINE_THICKNESS, LINE_Y_OFFSET, MapBounds;

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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
    }, function (_ccEnv) {
      EDITOR_NOT_IN_PREVIEW = _ccEnv.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "49fbbRpJ+NFGIZMWezb1n6a", "MapBounds", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Mesh', 'Material', 'MeshRenderer', 'Vec3', 'Quat']);

      ({
        ccclass,
        property,
        executeInEditMode
      } = _decorator);
      DEBUG_CONTAINER_NAME = '__MapBoundsDebug__';
      LINE_THICKNESS = 0.15; // 외곽선 두께(월드 유닛)

      LINE_Y_OFFSET = 0.03; // 바닥과 겹쳐 z-fighting 나지 않도록 살짝 띄움

      /**
       * 맵의 이동 가능 범위를 다각형으로 정의한다.
       * 꼭짓점은 이 노드의 자식으로 배치하고 vertices 배열에 순서대로(시계/반시계 상관없이,
       * 다각형 둘레 순서대로) 연결한다. 씬 뷰에서 각 꼭짓점 노드를 기본 이동 기즈모로
       * 드래그하면 그대로 범위가 바뀐다. 다각형은 항상 월드 X-Z 평면(수평면) 기준으로
       * 계산되며 꼭짓점의 Y 좌표는 무시한다 (다각형은 항상 위를 바라보는 것으로 취급).
       *
       * showDebugOutline을 켜두면 각 변을 얇은 평면으로 이어 그려서, 에디터에서 Play를
       * 하지 않아도(@executeInEditMode) 다각형의 실제 형태를 바로 확인할 수 있다.
       */

      _export("MapBounds", MapBounds = (_dec = ccclass('MapBounds'), _dec2 = property({
        type: [Node],
        displayName: '꼭짓점',
        tooltip: '맵 경계를 이루는 꼭짓점 노드들. 다각형 둘레 순서대로 등록 (3개 이상)'
      }), _dec3 = property({
        displayName: '외곽선 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 다각형 외곽선을 그려 형태를 바로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec4 = property(Mesh), _dec5 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = class MapBounds extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "vertices", _descriptor, this);

          this._showDebugOutline = true;

          _initializerDefineProperty(this, "segmentMesh", _descriptor2, this);

          // 외곽선 한 변에 쓸 평면 메쉬 (예: UI_arrow가 쓰는 2x2 쿼드)
          _initializerDefineProperty(this, "segmentMaterial", _descriptor3, this);

          // 외곽선 머티리얼
          this._debugContainer = null;
          this._segNodes = [];
        }

        get showDebugOutline() {
          return this._showDebugOutline;
        }

        set showDebugOutline(v) {
          this._showDebugOutline = v;
          this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
        }

        /** 다각형 내부(경계 포함)인지 판정 (월드 X,Z 기준). 꼭짓점이 3개 미만이면 제한 없음(true) */
        contains(x, z) {
          var pts = this._livePoints();

          if (pts.length < 3) return true;
          var inside = false;

          for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            var pi = pts[i],
                pj = pts[j];
            var intersect = pi.z > z !== pj.z > z && x < (pj.x - pi.x) * (z - pi.z) / (pj.z - pi.z) + pi.x;
            if (intersect) inside = !inside;
          }

          return inside;
        }

        onLoad() {
          // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
          // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
          if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureContainer().active = false;
          }
        }

        update() {
          // 외곽선은 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다 — 실제 게임 화면에는 노출되면 안 된다.
          if (!EDITOR_NOT_IN_PREVIEW) return;
          if (this._showDebugOutline) this._redrawDebug();
        }
        /** 매번 자식 노드의 현재 월드 위치를 그대로 읽는다 (에디터에서 꼭짓점을 옮기면 즉시 반영) */


        _livePoints() {
          var pts = [];

          for (var n of this.vertices) {
            if (!n || !n.isValid) continue;
            var p = n.worldPosition;
            pts.push({
              x: p.x,
              z: p.z
            });
          }

          return pts;
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
          this._segNodes = c.children.slice();
          return c;
        }

        _ensureSegCount(count) {
          var container = this._ensureContainer();

          while (this._segNodes.length < count) {
            var seg = new Node("seg_" + this._segNodes.length);
            container.addChild(seg);
            var mr = seg.addComponent(MeshRenderer);
            if (this.segmentMesh) mr.mesh = this.segmentMesh;
            if (this.segmentMaterial) mr.setMaterial(this.segmentMaterial, 0);

            this._segNodes.push(seg);
          }

          for (var i = count; i < this._segNodes.length; i++) this._segNodes[i].active = false;

          for (var _i = 0; _i < count; _i++) this._segNodes[_i].active = true;
        }

        _redrawDebug() {
          var pts = this._livePoints();

          if (pts.length < 2 || !this.segmentMesh || !this.segmentMaterial) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }

          this._debugContainer && (this._debugContainer.active = true);

          this._ensureSegCount(pts.length);

          for (var i = 0; i < pts.length; i++) {
            var a = pts[i];
            var b = pts[(i + 1) % pts.length];

            this._placeSegment(this._segNodes[i], a.x, a.z, b.x, b.z);
          }
        }
        /** a→b 구간을 잇는 얇은 평면 하나를 배치한다. 메쉬는 로컬 XY 평면의 2x2 쿼드(normal=+Z)를 가정 */


        _placeSegment(seg, ax, az, bx, bz) {
          var dx = bx - ax,
              dz = bz - az;
          var len = Math.hypot(dx, dz) || 0.0001;
          seg.setWorldPosition((ax + bx) / 2, LINE_Y_OFFSET, (az + bz) / 2); // 평면을 바닥에 눕히는 고정 -90도 X회전(피치) + 구간 방향을 향하게 하는 Z축 roll.
          // roll을 피치보다 먼저 적용해야(로컬 normal은 자기 축 회전에 불변) 항상 정확히
          // 위를 바라보는 상태(수평)를 유지한다. (HitEffect에서 검증한 것과 동일한 원리)

          var rollRad = Math.atan2(-dz, dx);
          var qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollRad);
          var qTilt = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, -Math.PI / 2);
          var qFinal = new Quat();
          Quat.multiply(qFinal, qTilt, qRoll);
          seg.setRotation(qFinal); // 메쉬 로컬 X:[-1,1] → 길이 축, 로컬 Y:[-1,1] → 두께 축

          seg.setScale(len / 2, LINE_THICKNESS / 2, 1);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "vertices", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "showDebugOutline", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugOutline"), _class2.prototype), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "segmentMesh", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "segmentMaterial", [_dec5], {
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
//# sourceMappingURL=574f6cf008f5930e61f132364fd857db8971be6f.js.map