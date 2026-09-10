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
       * 건물은 서로를 직접 참조하지 않고 이 값(과 CoinEvents.SocketFilled 이벤트)으로만 연결된다.
       *
       * 이름을 일부러 의미 없는 TriggerN으로 둔다 — 이 스크립트는 여러 씬이 공유하고,
       * "몇 번이 무엇을 짓는가"는 씬마다 다른 데이터이기 때문이다. 어떤 씬에서 어느 번호가
       * 무엇을 뜻하는지는 씬 쪽 문서/인스펙터에 남긴다.
       *
       * 1~16은 소켓 충족 신호용, 100번대는 소켓과 무관하게 게임 진행 자체에서 나오는
       * "플로우 트리거"용으로 구간을 나눠 쓴다. */
      __checkObsolete__(['Enum']);

      _export("TriggerId", TriggerId = /*#__PURE__*/function (TriggerId) {
        TriggerId[TriggerId["None"] = 0] = "None";
        TriggerId[TriggerId["Trigger1"] = 1] = "Trigger1";
        TriggerId[TriggerId["Trigger2"] = 2] = "Trigger2";
        TriggerId[TriggerId["Trigger3"] = 3] = "Trigger3";
        TriggerId[TriggerId["Trigger4"] = 4] = "Trigger4";
        TriggerId[TriggerId["Trigger5"] = 5] = "Trigger5";
        TriggerId[TriggerId["Trigger6"] = 6] = "Trigger6";
        TriggerId[TriggerId["Trigger7"] = 7] = "Trigger7";
        TriggerId[TriggerId["Trigger8"] = 8] = "Trigger8";
        TriggerId[TriggerId["Trigger9"] = 9] = "Trigger9";
        TriggerId[TriggerId["Trigger10"] = 10] = "Trigger10";
        TriggerId[TriggerId["Trigger11"] = 11] = "Trigger11";
        TriggerId[TriggerId["Trigger12"] = 12] = "Trigger12";
        TriggerId[TriggerId["Trigger13"] = 13] = "Trigger13";
        TriggerId[TriggerId["Trigger14"] = 14] = "Trigger14";
        TriggerId[TriggerId["Trigger15"] = 15] = "Trigger15";
        TriggerId[TriggerId["Trigger16"] = 16] = "Trigger16";
        TriggerId[TriggerId["GameStart"] = 100] = "GameStart";
        return TriggerId;
      }({}));

      Enum(TriggerId);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e6b9ba075427513acd16447bf0e2553a866be2fa.js.map