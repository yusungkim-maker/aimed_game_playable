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

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Material', 'MeshRenderer', 'Quat', 'Vec3', 'utils', 'primitives']);

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

          /** 갇힌 몬스터를 밀어낼 방향 — 이 박스의 로컬 +Z 부호. 0이면 "가장 가까운 면"으로
           * 밀어낸다. 링처럼 안/밖이 분명한 배치에서는 setOutwardFrom()으로 바깥쪽을 박아둔다. */
          this.outwardSign = 0;
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
          const s = this.node.worldScale; // yaw는 **그대로** 쓴다 — 부호를 뒤집으면 안 된다. blocks()가 계산하는
          //     lx = dx·cosψ − dz·sinψ,   lz = dx·sinψ + dz·cosψ
          // 는 "월드 델타를 이 박스의 로컬 축에 내린 정사영"이다 (yaw ψ인 노드의 로컬 +X는
          // 월드 (cosψ, −sinψ), 로컬 +Z는 월드 (sinψ, cosψ) 방향을 가리킨다).
          // 여기에 −ψ를 넣으면 sin 항의 부호가 뒤집혀 **박스가 yaw −ψ로 놓인 것처럼** 판정된다.
          // yaw가 90°의 배수일 때는 박스가 대칭이라 결과가 같아서 티가 나지 않지만(씬 1의 문이
          // 어찌어찌 동작한 이유), 45° 계열에서는 박스가 90° 돌아간 채로 판정돼 실제로 막아야
          // 할 자리가 그대로 뚫린다 — 씬 2의 돌 벽 링에서 변 중앙 타워 4곳(Tower-001/002/005/008,
          // 링 기준 약 47°/136°/226°/315° 방향)에 폭 0.33m짜리 구멍 4개가 생겨 몬스터가 그리로
          // 걸어 들어왔다. 이 링은 벽 간격 0.95m에 박스 폭(+마진) 2.6m라 제대로 판정하면 넉넉히
          // 겹치는데, 90° 돌아간 박스는 진행 방향 반폭이 0.75m뿐이라 타워를 건너뛰지 못한다.

          const yaw = this._yaw(this.node.worldRotation);

          this._cachedX = p.x;
          this._cachedZ = p.z;
          this._cachedCos = Math.cos(yaw);
          this._cachedSin = Math.sin(yaw);
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
        /** 이 벽이 링의 어느 쪽을 "바깥"으로 볼지 정한다 — 갇힌 몬스터를 그쪽으로 밀어낸다.
         * activate() 뒤에 호출해야 한다(캐싱된 위치/회전을 쓴다). 호출하지 않으면 outwardSign이
         * 0으로 남아 "가장 가까운 면"으로 밀어내는 기본 동작이 된다. */


        setOutwardFrom(cx, cz) {
          const dx = this._cachedX - cx,
                dz = this._cachedZ - cz; // 로컬 +Z의 월드 방향은 (sin, cos)이다 (blocks()의 축 정의와 동일).

          this.outwardSign = dx * this._cachedSin + dz * this._cachedCos >= 0 ? 1 : -1;
        }
        /** (x,z)가 어떤 벽 안에 갇혀 있으면, 거기서 빠져나갈 방향(월드 XZ 단위벡터)을 out에
         * 담고 true를 돌려준다. 갇혀 있지 않으면 false.
         *
         * **왜 필요한가**: 벽이 생성되는 순간 하필 몬스터와 겹치면 몬스터는 영원히 갇힌다.
         * 예전에는 "갇힌 벽은 판정에서 빼준다"는 예외로 풀었는데, 돌 벽 링은 박스(폭 2.6m)가
         * 간격 0.95m로 겹겹이 놓여 있어서 밴드 안의 한 점은 보통 벽 3개 안에 동시에 들어간다 —
         * 그 3개가 전부 예외로 빠지면 그 자리에는 막는 벽이 하나도 남지 않아 **방어선을 그대로
         * 걸어서 통과했다**(실측: 밴드 바깥 끝에서 출발한 몬스터가 360방향 중 315방향에서 관통).
         * 그래서 예외를 두지 않고, 갇힌 몬스터는 아예 바깥으로 밀어내 정상 판정으로 되돌린다.
         *
         * 여러 벽에 동시에 갇혀 있으면 각 벽의 바깥 방향을 합쳐서 쓴다(링에서는 세 벽의 방향이
         * 거의 같아 그대로 바깥을 가리킨다). 서로 정확히 상쇄되면 첫 벽의 방향을 쓴다. */


        static ejectDir(x, z, out) {
          let sx = 0,
              sz = 0,
              fx = 0,
              fz = 0,
              n = 0;

          for (const w of VirtualWall.all) {
            if (!w.blocks(x, z)) continue;
            let sign = w.outwardSign;

            if (sign === 0) {
              // 지정된 바깥쪽이 없으면 지금 더 가까운 면 쪽으로.
              const dx = x - w._cachedX,
                    dz = z - w._cachedZ;
              sign = dx * w._cachedSin + dz * w._cachedCos >= 0 ? 1 : -1;
            }

            const ux = w._cachedSin * sign,
                  uz = w._cachedCos * sign;

            if (n === 0) {
              fx = ux;
              fz = uz;
            }

            sx += ux;
            sz += uz;
            n++;
          }

          if (n === 0) return false;
          let len = Math.hypot(sx, sz);

          if (len < 1e-4) {
            sx = fx;
            sz = fz;
            len = Math.hypot(sx, sz) || 1;
          }

          out.set(sx / len, 0, sz / len);
          return true;
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
//# sourceMappingURL=ac65c23bc6236222c3ca5a1b949a339b221e4e7b.js.map