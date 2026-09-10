System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, _dec, _class, _crd, ccclass, SocketGauge;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8d7e8Kxd1FEKIEMBc59BXfm", "SocketGauge", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass
      } = _decorator);
      /**
       * 소켓 내부를 채우는 게이지. guage/guage.001 메쉬는 바닥에 눕혀진 평평한 판(Y축 두께=0)이고,
       * 블렌더에서 원점을 한쪽 끝에 맞춰둔 축은 로컬 Z축이다(glTF 익스포트 시 블렌더의 깊이 축이
       * Z로 매핑됨 — 실측 확인: Plane.009/Plane.011의 POSITION min/max가 X는 대칭, Y는 항상 0,
       * Z만 [-h, 0]으로 한쪽 끝에 원점). 그래서 onLoad() 시점의 로컬 scale.z를 "가득 찬(progress=1)"
       * 기준으로 캡처해두고, setProgress(0~1)로 scale.z만 그 비율로 줄인다.
       */

      _export("SocketGauge", SocketGauge = (_dec = ccclass('SocketGauge'), _dec(_class = class SocketGauge extends Component {
        constructor(...args) {
          super(...args);
          this._fullScaleZ = 1;
        }

        onLoad() {
          this._fullScaleZ = this.node.scale.z;
        }

        setProgress(value) {
          const p = Math.max(0, Math.min(1, value));
          const s = this.node.scale;
          this.node.setScale(s.x, s.y, this._fullScaleZ * p);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=18e5df11ef0ff41f895ca00264c1a081b3ebb297.js.map