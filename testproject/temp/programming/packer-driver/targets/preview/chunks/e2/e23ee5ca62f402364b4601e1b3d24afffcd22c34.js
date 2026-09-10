System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Enum, _crd, TriggerId;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Enum = _cc.Enum;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ce66djNqgRMlJigTSPwI1dK", "TriggerId", undefined);

      /** 소켓 충족으로 발동되는 "건물 건설 트리거" 식별자. 소켓 목록에서 소켓마다 하나씩 골라
       * 두면, 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 값을 가진 것이 반응한다. 소켓과
       * 건물은 서로를 직접 참조하지 않고 이 값(과 CoinEvents.SocketFilled 이벤트)으로만 연결된다. */
      __checkObsolete__(['Enum']);

      _export("TriggerId", TriggerId = /*#__PURE__*/function (TriggerId) {
        TriggerId[TriggerId["None"] = 0] = "None";
        TriggerId[TriggerId["Trigger1"] = 1] = "Trigger1";
        TriggerId[TriggerId["Trigger2"] = 2] = "Trigger2";
        TriggerId[TriggerId["Trigger3"] = 3] = "Trigger3";
        TriggerId[TriggerId["Trigger4"] = 4] = "Trigger4";
        TriggerId[TriggerId["Trigger5"] = 5] = "Trigger5";
        TriggerId[TriggerId["Trigger6"] = 6] = "Trigger6";
        return TriggerId;
      }({}));

      Enum(TriggerId);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e23ee5ca62f402364b4601e1b3d24afffcd22c34.js.map