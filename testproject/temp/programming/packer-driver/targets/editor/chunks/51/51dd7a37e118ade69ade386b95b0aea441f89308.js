System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Material, MeshRenderer, utils, primitives, EDITOR_NOT_IN_PREVIEW, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _crd, ccclass, property, executeInEditMode, GIZMO_NODE_NAME, VirtualWall;

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
      Material = _cc.Material;
      MeshRenderer = _cc.MeshRenderer;
      utils = _cc.utils;
      primitives = _cc.primitives;
    }, function (_ccEnv) {
      EDITOR_NOT_IN_PREVIEW = _ccEnv.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c9879872fNG67QieNgJQ/cD", "VirtualWall", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Material', 'MeshRenderer', 'Quat', 'utils', 'primitives']);

      ({
        ccclass,
        property,
        executeInEditMode
      } = _decorator);
      GIZMO_NODE_NAME = '__VirtualWallGizmo__';
      /**
       * 건물이 서 있는 자리를 캐릭터/몬스터가 통과하지 못하게 막는 "가상의 벽".
       * 실제로 렌더링되는 건물 메쉬와는 완전히 별개의 노드다 — 이 노드 자신의 위치/회전/스케일이
       * 곧 막을 영역 그 자체이므로(스케일 1 = 가로세로 1m 정육면체 기준), 씬/프리팹 편집 화면에서
       * 평소에 오브젝트를 옮기고 늘리는 것과 똑같은 방식으로 드래그해서 크기를 맞추면 된다 —
       * "프리팹 기준 스케일 1일 때의 폭" 같은 별도 숫자 계산이 필요 없다.
       *
       * 건물(Tower/Wall/Door1 등) 프리팹 안에 자식 노드로 넣어두면, 그 건물이 씬에서 어떤
       * 스케일로 배치되든 부모-자식 변환 합성 덕분에 이 벽도 자동으로 같은 비율로 늘어난다.
       *
       * BuildingTrigger가 소켓 완료로 건물이 "등장"하는 바로 그 순간 activate()를 호출해야
       * 실제로 막기 시작한다 — 그 전(트리거 전 숨겨진 상태)에는 항상 통과 가능.
       */

      _export("VirtualWall", VirtualWall = (_dec = ccclass('VirtualWall'), _dec2 = property({
        displayName: '여유 마진(m)',
        tooltip: '캐릭터가 벽에 파묻히지 않도록 이 노드의 실제 크기보다 살짝 넓게 막을 여유분(캐릭터 반경 정도) — 스케일과 무관하게 항상 실제 미터 단위'
      }), _dec3 = property({
        displayName: '플레이어는 통과 가능',
        tooltip: '체크하면 이 벽은 몬스터만 막고 플레이어(및 추종자)는 그냥 지나다닐 수 있다 — 문(Door)처럼 몬스터는 반드시 부숴야 하지만 플레이어의 이동은 방해하면 안 되는 경우에 사용. isBlockedForPlayer()에서만 제외되고, 몬스터가 쓰는 isBlocked()는 그대로 막는다'
      }), _dec4 = property({
        displayName: '외곽선 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 이 노드의 실제 위치/회전/스케일 그대로 반투명 박스를 그려서 막힐 영역을 눈으로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec5 = property({
        type: Material,
        displayName: '외곽선 재질',
        tooltip: '반투명 박스에 쓸 재질 — VirtualWall.prefab에 미리 지정해두었으므로 보통은 건드릴 필요 없다'
      }), _dec(_class = executeInEditMode(_class = (_class2 = (_class3 = class VirtualWall extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "margin", _descriptor, this);

          _initializerDefineProperty(this, "playerCanPass", _descriptor2, this);

          this._showDebugOutline = true;

          _initializerDefineProperty(this, "gizmoMaterial", _descriptor3, this);

          this._gizmo = null;

          /** BuildingTrigger가 건설(등장) 시점에 true로 켜주기 전까지는 막지 않는다 */
          this._active = false;
          // ── 판정용 캐시 — 건물은 activate() 이후 절대 움직이거나 회전하지 않으므로,
          // blocks() 호출마다 매번 위치/삼각함수를 다시 구하지 않고 activate() 시점에 한 번만
          // 계산해둔다. Player+최대 40마리 몬스터가 매 프레임 모든 벽에 대해 이 함수를 부르는
          // 핫패스라, 여기서 아낀 게 그대로 체감 성능으로 이어진다.
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
          this._gizmo && (this._gizmo.active = v && EDITOR_NOT_IN_PREVIEW);
        }

        /** 건설 완료(등장) 시점에 BuildingTrigger가 호출 — 이 순간부터 통과 불가.
         * 이 시점의 실제 worldPosition/worldRotation/worldScale을 그대로 읽어서 캐싱하므로,
         * 이 노드를 어떤 부모 아래 어떤 스케일로 배치했든 "지금 실제로 보이는 그 크기"가 그대로
         * 판정 크기가 된다. */
        activate() {
          const p = this.node.worldPosition;
          const s = this.node.worldScale;
          const angle = -this._yaw(this.node.worldRotation);
          this._cachedX = p.x;
          this._cachedZ = p.z;
          this._cachedCos = Math.cos(angle);
          this._cachedSin = Math.sin(angle);
          this._cachedHalfW = Math.abs(s.x) / 2 + this.margin;
          this._cachedHalfD = Math.abs(s.z) / 2 + this.margin;
          const r = Math.hypot(this._cachedHalfW, this._cachedHalfD);
          this._cachedBoundRadiusSq = r * r;
          this._active = true;
        }

        onEnable() {
          VirtualWall.all.push(this);
        }

        onDisable() {
          const i = VirtualWall.all.indexOf(this);
          if (i >= 0) VirtualWall.all.splice(i, 1);
        }
        /** 이 벽이 월드 (x,z) 지점을 막고 있는지 (활성화 전이면 항상 통과 가능) */


        blocks(x, z) {
          if (!this._active) return false;
          const dx = x - this._cachedX,
                dz = z - this._cachedZ; // 조기 컷: 벽 중심에서 (여유분 포함) 최대 반경 밖이면 회전 변환 계산 없이 바로 통과.

          if (dx * dx + dz * dz > this._cachedBoundRadiusSq) return false;
          const lx = dx * this._cachedCos - dz * this._cachedSin;
          const lz = dx * this._cachedSin + dz * this._cachedCos;
          return Math.abs(lx) <= this._cachedHalfW && Math.abs(lz) <= this._cachedHalfD;
        }
        /** 등록된 벽 중 하나라도 (x,z)를 막고 있으면 true — 몬스터가 사용 (playerCanPass 여부와
         * 무관하게 전부 막는다, 문도 부수기 전까지는 몬스터를 막아야 하므로) */


        static isBlocked(x, z) {
          for (const w of VirtualWall.all) {
            if (w.blocks(x, z)) return true;
          }

          return false;
        }
        /** 플레이어(및 추종자) 전용 판정 — playerCanPass가 체크된 벽(예: 문)은 건너뛰고,
         * 그 외 일반 벽/타워만 막는다. */


        static isBlockedForPlayer(x, z) {
          for (const w of VirtualWall.all) {
            if (w.playerCanPass) continue;
            if (w.blocks(x, z)) return true;
          }

          return false;
        }

        _yaw(q) {
          // 건물은 지면에 눕지 않는다고 가정하고 Y축 회전만 추출
          return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
        } // ── 에디터 디버그 시각화 ──────────────────────────────────────────────
        // 이 노드 자신의 로컬 변환은 절대 건드리지 않고, 로컬 트랜스폼이 항등(identity)인
        // 자식 노드 하나에 1x1x1 큐브 메쉬를 얹어둔다 — 부모(이 노드)의 실제 위치/회전/스케일이
        // 그대로 상속되므로 "지금 이 노드가 어떤 모양으로 막고 있는지"를 별도 계산 없이 그대로
        // 보여준다.


        onLoad() {
          if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureGizmo().active = false;
            return;
          }

          this._ensureGizmo().active = this._showDebugOutline;
        }

        _ensureGizmo() {
          var _this$_gizmo$getCompo;

          if (!this._gizmo || !this._gizmo.isValid) {
            let g = this.node.getChildByName(GIZMO_NODE_NAME);

            if (!g) {
              g = new Node(GIZMO_NODE_NAME);
              this.node.addChild(g);
              g.setPosition(0, 0, 0);
              g.setRotationFromEuler(0, 0, 0);
              g.setScale(1, 1, 1);
            }

            this._gizmo = g;
          } // 큐브 메쉬는 utils.createMesh()로 그때그때 만드는 런타임 전용 리소스라 에셋 UUID가
          // 없다 — 프리팹/씬을 저장했다가 다시 열면(자식 노드 자체는 남아있어도) mesh 참조가
          // 되살아나지 않는다. 그래서 "노드가 이미 있으니 끝" 하고 넘기지 않고, 매번 mesh가
          // 비어있는지 검사해서 없으면 다시 만들어 채워준다.


          const mr = (_this$_gizmo$getCompo = this._gizmo.getComponent(MeshRenderer)) != null ? _this$_gizmo$getCompo : this._gizmo.addComponent(MeshRenderer);
          if (!mr.mesh) mr.mesh = utils.createMesh(primitives.box({
            width: 1,
            height: 1,
            length: 1
          }));
          if (this.gizmoMaterial && mr.sharedMaterial !== this.gizmoMaterial) mr.setMaterial(this.gizmoMaterial, 0);
          return this._gizmo;
        }

      }, _class3.all = [], _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "margin", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerCanPass", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return false;
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "showDebugOutline", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugOutline"), _class2.prototype), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "gizmoMaterial", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=51dd7a37e118ade69ade386b95b0aea441f89308.js.map