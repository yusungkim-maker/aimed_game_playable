System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MeshRenderer, Vec3, Vec4, Color, Quat, tween, _dec, _class, _crd, ccclass, FRAME_COLS, FRAME_ROWS, LIFETIME, CAMERA_FACE_PITCH_DEG, HitEffect;

  function _randRange(min, max) {
    return min + Math.random() * (max - min);
  }

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
      Color = _cc.Color;
      Quat = _cc.Quat;
      tween = _cc.tween;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "82f2fIPw+ZI8bHl4Ofzy8pY", "HitEffect", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Mesh', 'Material', 'MeshRenderer', 'Vec3', 'Vec4', 'Color', 'Quat', 'tween']);

      ({
        ccclass
      } = _decorator);
      FRAME_COLS = 2;
      FRAME_ROWS = 2;
      LIFETIME = 0.3; // 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치.
      // 카메라 forward=(0,-0.7071,-0.7071)와 정확히 반대(dot=-1, 완전 정면)가 되도록 검증된 값.

      CAMERA_FACE_PITCH_DEG = -45;
      /** Player.ts의 인스펙터 필드로 조절되는 이펙트 파라미터 (Bullet을 거쳐 전달됨) */

      _export("HitEffect", HitEffect = (_dec = ccclass('HitEffect'), _dec(_class = class HitEffect extends Component {
        constructor() {
          super(...arguments);
          this._timer = 0;
        }

        /**
         * @param dir 화살이 타격한 순간의 이동 방향(월드, XZ 기준). fx_hit.png의 4프레임은
         *            모두 "화면 기준 우→좌" 타격을 가정하고 그려져 있어, 실제 타격 방향에
         *            맞춰 이 값으로 회전각을 계산한다.
         */
        init(mesh, mat, dir, params) {
          var mr = this.node.addComponent(MeshRenderer);
          mr.mesh = mesh;
          mr.setMaterial(mat, 0);
          var inst = mr.getMaterialInstance(0); // fx_hit.png 아틀라스(2x2, 4프레임) 중 랜덤 1칸만 샘플링

          var col = Math.floor(Math.random() * FRAME_COLS);
          var row = Math.floor(Math.random() * FRAME_ROWS);
          inst == null || inst.setProperty('tilingOffset', new Vec4(1 / FRAME_COLS, 1 / FRAME_ROWS, col / FRAME_COLS, row / FRAME_ROWS)); // 오퍼시티 = 기본값 x 랜덤 배율, 0~1로 클램프 후 0~255 alpha로 변환

          var opacityMult = _randRange(params.opacityRandomMin, params.opacityRandomMax);

          var opacity01 = Math.min(1, Math.max(0, params.opacity * opacityMult));
          inst == null || inst.setProperty('mainColor', new Color(255, 255, 255, Math.round(opacity01 * 255))); // 화면 매핑: 오른쪽=world +X, 위=world -Z (Player.ts 주석 기준).
          // 기본 그림(우→좌, 즉 screen(-1,0))을 실제 타격 방향으로 회전시키는 각.
          //
          // 주의: 이 회전은 world-Y축 "yaw"가 아니라, 메쉬가 카메라를 향하기 *이전*의
          // 로컬 Z축(메쉬 원래 normal) 기준 "roll"로 적용해야 한다. yaw(world-Y 회전) 후에
          // 고정 피치를 적용하면 방향에 따라 카메라 정면성이 깨지고(방향=180도일 때 완전히
          // 옆으로 누워 안 보이게 됨), roll을 피치보다 먼저 적용하면 어떤 방향이든 항상
          // 카메라와 정확히 수직을 유지한다 (검증: 로컬 normal(0,0,1)은 Z축 회전에 불변).

          var rollDeg = Math.atan2(-dir.z, dir.x) * 180 / Math.PI - 180;
          var qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollDeg * Math.PI / 180);
          var qPitch = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180);
          var qFinal = new Quat();
          Quat.multiply(qFinal, qPitch, qRoll); // roll을 먼저 적용한 뒤 피치(카메라 정렬)

          this.node.setRotation(qFinal); // 전체 크기 랜덤화: 0.3 -> 1 -> 0.6 곡선의 모양은 유지한 채 배율만 매 타격마다 랜덤

          var sizeMult = _randRange(params.sizeRandomMin, params.sizeRandomMax);

          var s = v => v * sizeMult;

          this.node.setScale(s(params.scaleStart), s(params.scaleStart), s(params.scaleStart));
          tween(this.node).to(0.08, {
            scale: new Vec3(s(params.scaleMid), s(params.scaleMid), s(params.scaleMid))
          }).to(LIFETIME - 0.08, {
            scale: new Vec3(s(params.scaleEnd), s(params.scaleEnd), s(params.scaleEnd))
          }).start();
        }

        update(dt) {
          this._timer += dt;
          if (this._timer >= LIFETIME) this.node.destroy();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=72568570ecf8ef3df9570326ddfb064d075d9e0c.js.map