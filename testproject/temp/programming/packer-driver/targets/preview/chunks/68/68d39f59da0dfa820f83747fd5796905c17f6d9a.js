System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MonsterSpawner, CoinEvents, CoinEventName, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, RushStartTrigger;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
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
    }, function (_unresolved_2) {
      MonsterSpawner = _unresolved_2.MonsterSpawner;
    }, function (_unresolved_3) {
      CoinEvents = _unresolved_3.CoinEvents;
      CoinEventName = _unresolved_3.CoinEventName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "87651M+lKpPO609e+GeAGsP", "RushStartTrigger", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 소켓에 코인이 한 개라도 흡수되는 순간(SocketAbsorbed) 러쉬를 한 번 시작시키는 트리거 */

      _export("RushStartTrigger", RushStartTrigger = (_dec = ccclass('RushStartTrigger'), _dec2 = property(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
        error: Error()
      }), MonsterSpawner) : MonsterSpawner), _dec3 = property({
        displayName: '시작할 러쉬 이름'
      }), _dec(_class = (_class2 = class RushStartTrigger extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "spawner", _descriptor, this);

          _initializerDefineProperty(this, "rushName", _descriptor2, this);

          this._triggered = false;

          this._onSocketAbsorbed = () => this._trigger();
        }

        onLoad() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketAbsorbed, this._onSocketAbsorbed);
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketAbsorbed, this._onSocketAbsorbed);
        }

        _trigger() {
          if (this._triggered || !this.spawner) return;
          this._triggered = true;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketAbsorbed, this._onSocketAbsorbed);
          this.spawner.startRushByName(this.rushName);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "spawner", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=68d39f59da0dfa820f83747fd5796905c17f6d9a.js.map