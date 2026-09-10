System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Mesh, Material, MeshRenderer, Vec3, Quat, EDITOR_NOT_IN_PREVIEW, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _class3, _crd, ccclass, property, executeInEditMode, DEBUG_CONTAINER_NAME, LINE_THICKNESS, LINE_Y_OFFSET, BuildingObstacle;

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

      _cclegacy._RF.push({}, "8a2cdWKvPZIPIYPka7Pty0L", "BuildingObstacle", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Mesh', 'Material', 'MeshRenderer', 'Vec3', 'Quat']);

      ({
        ccclass,
        property,
        executeInEditMode
      } = _decorator);
      DEBUG_CONTAINER_NAME = '__BuildingObstacleDebug__';
      LINE_THICKNESS = 0.08;
      LINE_Y_OFFSET = 0.03;
      /**
       * 건물(Wall/Tower 등)이 서 있는 자리를 캐릭터/몬스터가 통과하지 못하게 막는 "키프아웃"
       * 영역. MapBounds(맵 전체를 감싸는 "이 안에만 있어야 한다" 다각형)와 반대 개념이지만
       * 구현 원리는 동일하다 — 물리엔진 콜라이더를 쓰지 않고, Player/Monster의 이동 계산에서
       * 다음 위치가 이 영역 안이면 그 축 이동만 취소하는 방식(맵 경계를 미끄러지듯 못 나가는
       * 것과 같은 방식으로, 벽을 미끄러지듯 못 뚫고 지나간다).
       *
       * 노드의 Y축 회전(yaw)만큼 기울어진 직사각형으로 판정한다 — Wall이 45°/135° 등으로
       * 비스듬히 배치되므로 원이 아니라 회전된 사각형이어야 벽 두께에 맞게 정확히 막힌다.
       *
       * BuildingTrigger가 소켓 완료로 건물이 "등장"하는 바로 그 순간 activate()를 호출해야
       * 실제로 막기 시작한다 — 그 전(트리거 전 숨겨진 상태)에는 항상 통과 가능.
       */

      _export("BuildingObstacle", BuildingObstacle = (_dec = ccclass('BuildingObstacle'), _dec2 = property({
        displayName: '가로 폭(X, m)',
        tooltip: '프리팹 기준(스케일 1일 때) 로컬 X축 방향 폭 — 실제 판정 크기는 activate() 시점에 그 인스턴스의 실제 worldScale.x를 곱해서 계산되므로, 씬에서 개별 배치본을 다르게 스케일해도 그만큼 따라간다'
      }), _dec3 = property({
        displayName: '세로 폭(Z, m)',
        tooltip: '프리팹 기준(스케일 1일 때) 로컬 Z축 방향 폭 — 실제 판정 크기는 activate() 시점에 그 인스턴스의 실제 worldScale.z를 곱해서 계산되므로, 씬에서 개별 배치본을 다르게 스케일해도 그만큼 따라간다'
      }), _dec4 = property({
        displayName: '여유 마진(m)',
        tooltip: '캐릭터가 벽 메쉬에 파묻히지 않도록 실제 크기보다 살짝 넓게 막을 여유분(캐릭터 반경 정도)'
      }), _dec5 = property({
        displayName: '외곽선 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 판정 영역을 그려 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec6 = property(Mesh), _dec7 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = (_class3 = class BuildingObstacle extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "width", _descriptor, this);

          _initializerDefineProperty(this, "depth", _descriptor2, this);

          _initializerDefineProperty(this, "margin", _descriptor3, this);

          this._showDebugOutline = true;

          _initializerDefineProperty(this, "segmentMesh", _descriptor4, this);

          _initializerDefineProperty(this, "segmentMaterial", _descriptor5, this);

          this._debugContainer = null;
          this._segNodes = [];

          /** BuildingTrigger가 건설(등장) 시점에 true로 켜주기 전까지는 막지 않는다 */
          this._active = false;
          // ── 판정용 캐시 — 건물은 activate() 이후 절대 움직이거나 회전하지 않으므로,
          // blocks() 호출마다 매번 위치/삼각함수를 다시 구하지 않고 activate() 시점에 한 번만
          // 계산해둔다. Player+최대 40마리 몬스터가 매 프레임 모든 건물에 대해 이 함수를
          // 부르는 핫패스라, 여기서 아낀 게 그대로 체감 성능으로 이어진다. */
          this._cachedX = 0;
          this._cachedZ = 0;
          this._cachedCos = 1;
          this._cachedSin = 0;
          this._cachedHalfW = 0;
          this._cachedHalfD = 0;

          /** 바깥 경계원(half-diagonal+margin)의 제곱 — 이 밖이면 회전 변환까지 갈 것도 없이 즉시 통과 */
          this._cachedBoundRadiusSq = 0;
        }

        get showDebugOutline() {
          return this._showDebugOutline;
        }

        set showDebugOutline(v) {
          this._showDebugOutline = v;
          this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
        }

        /** 건설 완료(등장) 시점에 BuildingTrigger가 호출 — 이 순간부터 통과 불가.
         * 이 시점의 실제 worldPosition/worldRotation/worldScale을 전부 읽어서 캐싱하므로,
         * 프리팹 기본값이 아니라 "씬에 배치된 이 인스턴스가 실제로 지금 어떤 모습인지"를
         * 그대로 반영한다 — 개별 배치본을 씬에서 다르게 돌리거나 늘려도 그만큼 따라간다. */
        activate() {
          var p = this.node.worldPosition;
          var s = this.node.worldScale;
          var angle = -this._yaw(this.node.worldRotation);
          this._cachedX = p.x;
          this._cachedZ = p.z;
          this._cachedCos = Math.cos(angle);
          this._cachedSin = Math.sin(angle);
          this._cachedHalfW = this.width * Math.abs(s.x) / 2 + this.margin;
          this._cachedHalfD = this.depth * Math.abs(s.z) / 2 + this.margin;
          var r = Math.hypot(this._cachedHalfW, this._cachedHalfD);
          this._cachedBoundRadiusSq = r * r;
          this._active = true;
        }

        onEnable() {
          BuildingObstacle.all.push(this);
        }

        onDisable() {
          var i = BuildingObstacle.all.indexOf(this);
          if (i >= 0) BuildingObstacle.all.splice(i, 1);
        }
        /** 이 장애물이 월드 (x,z) 지점을 막고 있는지 (활성화 전이면 항상 통과 가능) */


        blocks(x, z) {
          if (!this._active) return false;
          var dx = x - this._cachedX,
              dz = z - this._cachedZ; // 조기 컷: 건물 중심에서 (여유분 포함) 최대 반경 밖이면 회전 변환 계산 없이 바로 통과.
          // 건물 수가 늘어나도(맵이 커져도) 대부분의 호출이 이 한 줄에서 끝나게 하기 위함.

          if (dx * dx + dz * dz > this._cachedBoundRadiusSq) return false;
          var lx = dx * this._cachedCos - dz * this._cachedSin;
          var lz = dx * this._cachedSin + dz * this._cachedCos;
          return Math.abs(lx) <= this._cachedHalfW && Math.abs(lz) <= this._cachedHalfD;
        }
        /** 등록된 장애물 중 하나라도 (x,z)를 막고 있으면 true */


        static isBlocked(x, z) {
          for (var o of BuildingObstacle.all) {
            if (o.blocks(x, z)) return true;
          }

          return false;
        }

        _yaw(q) {
          // 건물은 지면에 눕지 않는다고 가정하고 Y축 회전만 추출
          return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
        } // ── 에디터 디버그 시각화 (MapBounds와 동일한 패턴) ──────────────────────


        onLoad() {
          if (!EDITOR_NOT_IN_PREVIEW) this._ensureContainer().active = false;
        }

        update() {
          if (!EDITOR_NOT_IN_PREVIEW) return;
          if (this._showDebugOutline) this._redrawDebug();
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
          if (!this.segmentMesh || !this.segmentMaterial) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }

          this._debugContainer && (this._debugContainer.active = true);

          this._ensureSegCount(4);

          var p = this.node.worldPosition;
          var s = this.node.worldScale;

          var angle = this._yaw(this.node.worldRotation);

          var cos = Math.cos(angle),
              sin = Math.sin(angle);
          var hw = this.width * Math.abs(s.x) / 2 + this.margin;
          var hd = this.depth * Math.abs(s.z) / 2 + this.margin;
          var local = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
          var world = local.map(_ref => {
            var [lx, lz] = _ref;
            return {
              x: p.x + lx * cos - lz * sin,
              z: p.z + lx * sin + lz * cos
            };
          });

          for (var i = 0; i < 4; i++) {
            var a = world[i],
                b = world[(i + 1) % 4];

            this._placeSegment(this._segNodes[i], a.x, a.z, b.x, b.z);
          }
        }
        /** a→b 구간을 잇는 얇은 평면 하나를 배치 (MapBounds._placeSegment와 동일 원리) */


        _placeSegment(seg, ax, az, bx, bz) {
          var dx = bx - ax,
              dz = bz - az;
          var len = Math.hypot(dx, dz) || 0.0001;
          seg.setWorldPosition((ax + bx) / 2, LINE_Y_OFFSET, (az + bz) / 2);
          var rollRad = Math.atan2(-dz, dx);
          var qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollRad);
          var qTilt = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, -Math.PI / 2);
          var qFinal = new Quat();
          Quat.multiply(qFinal, qTilt, qRoll);
          seg.setRotation(qFinal);
          seg.setScale(len / 2, LINE_THICKNESS / 2, 1);
        }

      }, _class3.all = [], _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "depth", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "margin", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "showDebugOutline", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugOutline"), _class2.prototype), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "segmentMesh", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "segmentMaterial", [_dec7], {
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
//# sourceMappingURL=45d37ff12a0ff34aab3bf6f6aa2f3de2dbd9d82f.js.map