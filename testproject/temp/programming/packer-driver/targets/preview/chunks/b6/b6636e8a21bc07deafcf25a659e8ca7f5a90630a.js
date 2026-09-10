System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Label, CoinEvents, CoinEventName, CoinStack, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, CoinCounterUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStack(extras) {
    _reporterNs.report("CoinStack", "./CoinStack", _context.meta, extras);
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
      Label = _cc.Label;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      CoinStack = _unresolved_3.CoinStack;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0a47f5sL7FE65v+E2PYcZEw", "CoinCounterUI", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 화면 상단의 "보유 코인 개수" 표시. CoinStack.StackChanged를 구독해 등에 쌓인 코인
       * 개수를 그대로 보여준다 — 코인을 얻으면(등에 추가) 늘고, 소켓이 소비하면(등에서 제거) 준다.
       */

      _export("CoinCounterUI", CoinCounterUI = (_dec = ccclass('CoinCounterUI'), _dec2 = property(Label), _dec3 = property(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
        error: Error()
      }), CoinStack) : CoinStack), _dec(_class = (_class2 = class CoinCounterUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "countLabel", _descriptor, this);

          _initializerDefineProperty(this, "coinStack", _descriptor2, this);

          this._onStackChanged = count => this._refresh(count);
        }

        onLoad() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).StackChanged, this._onStackChanged, this);
        }

        start() {
          if (this.coinStack) this._refresh(this.coinStack.count);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).StackChanged, this._onStackChanged, this);
        }

        _refresh(count) {
          if (this.countLabel) this.countLabel.string = "" + count;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "countLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "coinStack", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b6636e8a21bc07deafcf25a659e8ca7f5a90630a.js.map