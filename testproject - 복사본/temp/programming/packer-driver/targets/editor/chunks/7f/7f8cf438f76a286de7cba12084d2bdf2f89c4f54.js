System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MeshRenderer, Vec3, Vec4, Color, Quat, tween, _dec, _class, _crd, ccclass, FRAME_COLS, FRAME_ROWS, DEFAULT_LIFETIME, PUNCH_IN_RATIO, CAMERA_FACE_PITCH_DEG, HitEffect;

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
      DEFAULT_LIFETIME = 0.3;
      /** 커졌다가 작아지는 '펀치' 곡선에서 커지는 구간이 차지하는 비율 */

      PUNCH_IN_RATIO = 0.08 / 0.3; // 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치.
      // 카메라 forward=(0,-0.7071,-0.7071)와 정확히 반대(dot=-1, 완전 정면)가 되도록 검증된 값.

      CAMERA_FACE_PITCH_DEG = -45;
      /** Player.ts의 인스펙터 필드로 조절되는 이펙트 파라미터 (Bullet을 거쳐 전달됨) */

      _export("HitEffect", HitEffect = (_dec = ccclass('HitEffect'), _dec(_class = class HitEffect extends Component {
        constructor(...args) {
          super(...args);
          this._timer = 0;
          this._life = DEFAULT_LIFETIME;
        }

        /**
         * @param dir 이펙트가 향할 방향(월드, XZ 기준) — 피격이면 화살의 진행 방향, 타워
         *            발사면 발사 방향. 아틀라스의 4칸은 모두 "화면 기준 우→좌"를 가정하고
         *            그려져 있어, 실제 방향에 맞춰 이 값으로 회전각을 계산한다.
         */
        init(mesh, mat, dir, params) {
          this._life = params.lifetime && params.lifetime > 0 ? params.lifetime : DEFAULT_LIFETIME;
          const mr = this.node.addComponent(MeshRenderer);
          mr.mesh = mesh;
          mr.setMaterial(mat, 0);
          const inst = mr.getMaterialInstance(0); // 아틀라스(2x2, 4칸) 중 랜덤 1칸만 샘플링. 어떤 그림인지는 넘겨받은 머티리얼이
          // 결정한다 — 피격은 FxHit.mtl(FX_T_Hit2.png), 타워 발사는 FxMuzzle.mtl(fx_hit.png).

          const col = Math.floor(Math.random() * FRAME_COLS);
          const row = Math.floor(Math.random() * FRAME_ROWS);
          inst == null || inst.setProperty('tilingOffset', new Vec4(1 / FRAME_COLS, 1 / FRAME_ROWS, col / FRAME_COLS, row / FRAME_ROWS)); // 오퍼시티 = 기본값 x 랜덤 배율, 0~1로 클램프 후 0~255 alpha로 변환

          const opacityMult = _randRange(params.opacityRandomMin, params.opacityRandomMax);

          const opacity01 = Math.min(1, Math.max(0, params.opacity * opacityMult)); // mainColor는 unlit 머티리얼이라 그림 색에 그대로 곱해진다 — 색을 주면 그 색으로
          // 물들고, 알파가 세기(오퍼시티)가 된다.

          const tint = params.color;
          inst == null || inst.setProperty('mainColor', new Color(tint ? tint.r : 255, tint ? tint.g : 255, tint ? tint.b : 255, Math.round(opacity01 * 255))); // 화면 매핑: 오른쪽=world +X, 위=world -Z (Player.ts 주석 기준).
          // 기본 그림(우→좌, 즉 screen(-1,0))을 실제 타격 방향으로 회전시키는 각.
          //
          // 주의: 이 회전은 world-Y축 "yaw"가 아니라, 메쉬가 카메라를 향하기 *이전*의
          // 로컬 Z축(메쉬 원래 normal) 기준 "roll"로 적용해야 한다. yaw(world-Y 회전) 후에
          // 고정 피치를 적용하면 방향에 따라 카메라 정면성이 깨지고(방향=180도일 때 완전히
          // 옆으로 누워 안 보이게 됨), roll을 피치보다 먼저 적용하면 어떤 방향이든 항상
          // 카메라와 정확히 수직을 유지한다 (검증: 로컬 normal(0,0,1)은 Z축 회전에 불변).

          const rollDeg = Math.atan2(-dir.z, dir.x) * 180 / Math.PI - 180;
          const qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollDeg * Math.PI / 180);
          const qPitch = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180);
          const qFinal = new Quat();
          Quat.multiply(qFinal, qPitch, qRoll); // roll을 먼저 적용한 뒤 피치(카메라 정렬)

          this.node.setRotation(qFinal); // 전체 크기 랜덤화: 0.3 -> 1 -> 0.6 곡선의 모양은 유지한 채 배율만 매 타격마다 랜덤

          const sizeMult = _randRange(params.sizeRandomMin, params.sizeRandomMax);

          const s = v => v * sizeMult;

          const punchIn = this._life * PUNCH_IN_RATIO;
          this.node.setScale(s(params.scaleStart), s(params.scaleStart), s(params.scaleStart));
          tween(this.node).to(punchIn, {
            scale: new Vec3(s(params.scaleMid), s(params.scaleMid), s(params.scaleMid))
          }).to(this._life - punchIn, {
            scale: new Vec3(s(params.scaleEnd), s(params.scaleEnd), s(params.scaleEnd))
          }).start();
        }

        update(dt) {
          this._timer += dt;
          if (this._timer >= this._life) this.node.destroy();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7f8cf438f76a286de7cba12084d2bdf2f89c4f54.js.map