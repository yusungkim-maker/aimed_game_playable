System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, find, Socket, _dec, _class, _crd, ccclass, _TempGuideTest;

  function _reportPossibleCrUseOfSocket(extras) {
    _reporterNs.report("Socket", "./Socket", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      find = _cc.find;
    }, function (_unresolved_2) {
      Socket = _unresolved_2.Socket;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7a865KK7ctKrLbI1J3zqIRT", "_TempGuideTest", undefined);

      __checkObsolete__(['_decorator', 'Component', 'find']);

      ({
        ccclass
      } = _decorator);

      _export("_TempGuideTest", _TempGuideTest = (_dec = ccclass('_TempGuideTest'), _dec(_class = class _TempGuideTest extends Component {
        setTarget() {
          const t = find('GuideTestTarget');
          if (t) (_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket).activeGuideTarget = t;
        }

        clearTarget() {
          (_crd && Socket === void 0 ? (_reportPossibleCrUseOfSocket({
            error: Error()
          }), Socket) : Socket).activeGuideTarget = null;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4ee4e5db65010706bb093f7d7ed11e3f2dbb1156.js.map