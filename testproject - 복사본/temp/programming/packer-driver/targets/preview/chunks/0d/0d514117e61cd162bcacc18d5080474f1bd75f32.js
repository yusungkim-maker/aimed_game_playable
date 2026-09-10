System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MeshRenderer, Vec3, Vec4, Quat, _dec, _class, _crd, ccclass, CAMERA_FACE_PITCH_DEG, MonsterDeadEffect;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      MeshRenderer = _cc.MeshRenderer;
      Vec3 = _cc.Vec3;
      Vec4 = _cc.Vec4;
      Quat = _cc.Quat;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ef5880+VzFNoKYvx8pV/LA/", "MonsterDeadEffect", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Mesh', 'Material', 'MeshRenderer', 'MaterialInstance', 'Vec3', 'Vec4', 'Quat']);

      ({
        ccclass
      } = _decorator);
      /** 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치 — HitEffect와 동일한 값.
       * 카메라 forward=(0,-0.7071,-0.7071)와 정확히 반대(dot=-1)가 되는 검증된 각도다. */

      CAMERA_FACE_PITCH_DEG = -45;

      /**
       * monster_dead_effect.png 같은 격자 아틀라스를 한 장씩 넘겨 재생하는 1회성 폭발 이펙트.
       * 쿼드 하나에 unlit 머티리얼을 얹고 tilingOffset(스케일 xy + 오프셋 zw)으로 샘플링할 칸만
       * 옮겨서 스프라이트 시트를 돌린다 — HitEffect가 랜덤 1칸을 뽑아 쓰는 것과 같은 방식이되,
       * 이쪽은 프레임을 순서대로 넘긴다. 마지막 프레임이 끝나면 스스로 사라진다.
       */
      _export("MonsterDeadEffect", MonsterDeadEffect = (_dec = ccclass('MonsterDeadEffect'), _dec(_class = class MonsterDeadEffect extends Component {
        constructor() {
          super(...arguments);
          this._inst = null;
          this._params = null;
          this._timer = 0;
          this._frame = -1;
        }

        init(mesh, mat, params) {
          this._params = params;
          var mr = this.node.addComponent(MeshRenderer);
          mr.mesh = mesh;
          mr.setMaterial(mat, 0);
          this._inst = mr.getMaterialInstance(0);
          this.node.setRotation(Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180));
          this.node.setScale(params.size, params.size, params.size);

          this._applyFrame(0);
        }

        update(dt) {
          var p = this._params;
          if (!p) return;
          this._timer += dt;
          var idx = Math.floor(this._timer * p.fps);

          if (idx >= p.frameCount) {
            this.node.destroy();
            return;
          }

          if (idx !== this._frame) this._applyFrame(idx);
        }

        _applyFrame(i) {
          var p = this._params;
          if (!p || !this._inst) return;
          this._frame = i;
          var col = i % p.cols;
          var rowFromTop = Math.floor(i / p.cols); // 텍스처 v좌표는 아래가 0이라, 이미지 위쪽 행부터 재생하려면 행 번호를 뒤집어야 한다.

          var row = p.rowsBottomUp ? rowFromTop : p.rows - 1 - rowFromTop;

          this._inst.setProperty('tilingOffset', new Vec4(1 / p.cols, 1 / p.rows, col / p.cols, row / p.rows));
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0d514117e61cd162bcacc18d5080474f1bd75f32.js.map