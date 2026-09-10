System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, CtaClick;

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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4d35aj2BKtNrr1g+m6i0e3e", "CtaClick", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'EventTouch']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * CTA(설치 유도) 클릭 처리 — 광고 네트워크마다 다른 "스토어 열기" 호출을 한곳에 모아둔다.
       *
       * **중요: 스토어 URL을 여기에 박지 않는다.** AppLovin 같은 MRAID 계열 네트워크는 캠페인/국가/
       * OS에 맞는 스토어 링크를 SDK가 알아서 붙여준다. 크리에이티브가 직접 URL을 열면 클릭 집계와
       * 어트리뷰션이 어긋나고 심사에서 반려될 수 있다. 아래 `fallbackUrl`은 **로컬 테스트 전용**이며
       * 네트워크 API가 하나도 없을 때만 쓰인다.
       *
       * 이 프로젝트의 `extensions/playable-ads-adapter`는 채널별 SDK 스크립트만 주입한다
       * (AppLovin/Liftoff/Unity/Moloco → `<script src="mraid.js">`). **스토어를 여는 호출 자체는
       * 넣어주지 않으므로 게임 코드가 직접 해야 한다** — 그게 이 컴포넌트다.
       */

      _export("CtaClick", CtaClick = (_dec = ccclass('CtaClick'), _dec2 = property({
        type: Node,
        displayName: '클릭 영역 노드',
        tooltip: '비워두면 이 컴포넌트가 붙은 노드 자신이 클릭 영역이 된다. 화면 아무 데나 눌러도 스토어로 보내고 싶으면 화면 전체를 덮는 노드를 연결한다'
      }), _dec3 = property({
        displayName: '테스트용 대체 URL',
        tooltip: '광고 네트워크 API가 하나도 없을 때(=로컬에서 그냥 열어봤을 때)만 새 탭으로 열어보는 주소. 실제 광고에서는 절대 쓰이지 않는다 — AppLovin은 스토어 링크를 SDK가 붙인다. 비워두면 아무 것도 하지 않는다'
      }), _dec4 = property({
        displayName: '한 번만 반응',
        tooltip: '연타로 스토어가 여러 번 열리는 것을 막는다'
      }), _dec5 = property({
        displayName: '로그 출력',
        tooltip: '어떤 네트워크 경로로 나갔는지 콘솔에 찍는다. 배포 전에 꺼도 되고 켜둬도 무해하다'
      }), _dec(_class = (_class2 = class CtaClick extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "clickArea", _descriptor, this);

          _initializerDefineProperty(this, "fallbackUrl", _descriptor2, this);

          _initializerDefineProperty(this, "onceOnly", _descriptor3, this);

          _initializerDefineProperty(this, "verbose", _descriptor4, this);

          this._fired = false;
        }

        onEnable() {
          var _this$clickArea;

          ((_this$clickArea = this.clickArea) != null ? _this$clickArea : this.node).on(Node.EventType.TOUCH_END, this._onClick, this);
        }

        onDisable() {
          var _this$clickArea2;

          ((_this$clickArea2 = this.clickArea) != null ? _this$clickArea2 : this.node).off(Node.EventType.TOUCH_END, this._onClick, this);
        }

        _onClick(_e) {
          if (this.onceOnly && this._fired) return;
          this._fired = true;
          const via = CtaClick.openStore(this.fallbackUrl);
          if (this.verbose) console.log(`[CtaClick] store open via: ${via}`);
        }
        /**
         * 지금 실행 중인 환경이 제공하는 네트워크 API를 찾아 스토어를 연다.
         * 어떤 경로로 나갔는지 문자열로 돌려준다(로그/디버그용).
         *
         * 순서는 "이 프로젝트의 어댑터가 지원하는 채널" 기준이다. 각 네트워크가 주입하는 전역이
         * 서로 겹치지 않으므로, 있는 것을 찾아 쓰면 한 벌의 빌드로 여러 채널을 커버할 수 있다.
         */


        static openStore(fallbackUrl = '') {
          const w = window; // ── MRAID 계열: AppLovin / Liftoff / Unity / Moloco ──────────────────
          // 인자 없는 mraid.open()이 캠페인에 설정된 스토어로 보낸다. URL을 직접 넘기지 않는다.
          // mraid는 SDK가 'ready'가 된 뒤에만 동작하는데, 클릭 시점에는 이미 준비가 끝나 있다
          // (그 전에는 CTA 패널 자체가 꺼져 있다). 그래도 안전하게 상태를 확인한다.

          if (w.mraid && typeof w.mraid.open === 'function') {
            try {
              if (typeof w.mraid.getState === 'function' && w.mraid.getState() === 'loading') {
                w.mraid.addEventListener('ready', () => w.mraid.open());
                return 'mraid (ready 대기)';
              }

              w.mraid.open();
              return 'mraid';
            } catch (e) {
              console.warn('[CtaClick] mraid.open 실패', e);
            }
          } // ── Google (AdWords/AdMob 플레이어블) ────────────────────────────────


          if (w.ExitApi && typeof w.ExitApi.exit === 'function') {
            try {
              w.ExitApi.exit();
              return 'ExitApi';
            } catch (e) {
              console.warn(e);
            }
          } // ── Meta(Facebook) 플레이어블 ────────────────────────────────────────


          if (w.FbPlayableAd && typeof w.FbPlayableAd.onCTAClick === 'function') {
            try {
              w.FbPlayableAd.onCTAClick();
              return 'FbPlayableAd';
            } catch (e) {
              console.warn(e);
            }
          } // ── ironSource (dapi) ───────────────────────────────────────────────


          if (w.dapi && typeof w.dapi.openStoreUrl === 'function') {
            try {
              w.dapi.openStoreUrl();
              return 'dapi';
            } catch (e) {
              console.warn(e);
            }
          } // ── Mintegral ───────────────────────────────────────────────────────


          if (typeof w.install === 'function') {
            try {
              w.install();
              return 'install()';
            } catch (e) {
              console.warn(e);
            }
          }

          if (typeof w.gameEnd === 'function') {
            try {
              w.gameEnd();
              return 'gameEnd()';
            } catch (e) {
              console.warn(e);
            }
          } // ── 로컬 테스트 전용 ────────────────────────────────────────────────


          if (fallbackUrl) {
            w.open(fallbackUrl, '_blank');
            return 'fallbackUrl (테스트)';
          }

          console.warn('[CtaClick] 광고 네트워크 API를 찾지 못했다 — 실제 광고 환경이 아니거나 SDK가 아직 주입되지 않았다');
          return 'none';
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "clickArea", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallbackUrl", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "onceOnly", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "verbose", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6a680188df85d4b838c407eb87b67a636c263ecc.js.map