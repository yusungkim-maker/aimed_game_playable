System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, game, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, OVERLAY_ID, WebglGuard;

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
      game = _cc.game;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6451b3c07VImotXCzPIIA4+", "WebglGuard", undefined);

      __checkObsolete__(['_decorator', 'Component', 'game']);

      ({
        ccclass,
        property
      } = _decorator);
      OVERLAY_ID = '__webgl_fallback__';
      /**
       * WebGL 컨텍스트가 손실되면 화면 위에 안내 UI를 띄우고, 복구되면 치운다.
       *
       * AppLovin 플레이어블 규격의 "WebGL을 사용하는 경우 초기화 실패/컨텍스트 손실에 대비한
       * UI 폴백을 제공하라"에 대응한다. 모바일 웹뷰는 메모리 압박이나 백그라운드 전환에서
       * 컨텍스트를 실제로 잃는 일이 있고, 그때 아무 안내도 없으면 검은 화면만 남는다.
       *
       * 폴백 UI는 씬 안의 UI 노드가 아니라 **DOM 오버레이**로 만든다 — 컨텍스트를 잃은 상태에서는
       * 엔진이 아무것도 그릴 수 없으므로 씬 UI로는 보여줄 수가 없다.
       *
       * 한계: 엔진이 아예 초기화되지 못한 경우(WebGL 자체를 못 얻는 기기)에는 이 스크립트도
       * 실행되지 않는다. 그 구간까지 덮으려면 빌드 템플릿(index.html)에 인라인 스크립트를
       * 넣어야 한다.
       */

      _export("WebglGuard", WebglGuard = (_dec = ccclass('WebglGuard'), _dec2 = property({
        displayName: '안내 문구',
        tooltip: '컨텍스트가 손실됐을 때 화면에 띄울 문구'
      }), _dec3 = property({
        displayName: '배경 색(CSS)',
        tooltip: '오버레이 배경. 반투명 검정이 기본'
      }), _dec4 = property({
        displayName: '글자 색(CSS)'
      }), _dec(_class = (_class2 = class WebglGuard extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "message", _descriptor, this);

          _initializerDefineProperty(this, "backgroundCss", _descriptor2, this);

          _initializerDefineProperty(this, "textCss", _descriptor3, this);

          this._canvas = null;
          this._overlay = null;

          this._onLost = e => {
            // preventDefault를 해야 브라우저가 나중에 webglcontextrestored를 보내준다.
            e.preventDefault();

            this._show(true);
          };

          this._onRestored = () => this._show(false);
        }

        onLoad() {
          var _ref, _ref2;

          if (typeof document === 'undefined') return; // 네이티브 빌드 등

          this._canvas = (_ref = (_ref2 = game.canvas) != null ? _ref2 : document.getElementById('GameCanvas')) != null ? _ref : document.querySelector('canvas');
          if (!this._canvas) return;

          this._canvas.addEventListener('webglcontextlost', this._onLost, false);

          this._canvas.addEventListener('webglcontextrestored', this._onRestored, false);
        }

        onDestroy() {
          var _this$_canvas, _this$_canvas2, _this$_overlay;

          (_this$_canvas = this._canvas) == null || _this$_canvas.removeEventListener('webglcontextlost', this._onLost, false);
          (_this$_canvas2 = this._canvas) == null || _this$_canvas2.removeEventListener('webglcontextrestored', this._onRestored, false);
          (_this$_overlay = this._overlay) == null || _this$_overlay.remove();
          this._overlay = null;
        }

        _show(show) {
          if (!show) {
            var _this$_overlay2;

            (_this$_overlay2 = this._overlay) == null || _this$_overlay2.remove();
            this._overlay = null;
            return;
          }

          if (this._overlay) return;
          var el = document.createElement('div');
          el.id = OVERLAY_ID;
          el.style.cssText = ['position:fixed', 'left:0', 'top:0', 'right:0', 'bottom:0', 'z-index:2147483647', "background:" + this.backgroundCss, "color:" + this.textCss, 'display:flex', 'align-items:center', 'justify-content:center', 'text-align:center', 'padding:24px', 'box-sizing:border-box', 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', 'font-size:16px', 'line-height:1.5', '-webkit-user-select:none', 'user-select:none'].join(';');
          el.textContent = this.message;
          document.body.appendChild(el);
          this._overlay = el;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "message", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '화면을 다시 불러오는 중입니다…';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "backgroundCss", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'rgba(0,0,0,0.85)';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "textCss", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '#ffffff';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2733837501bd2d005ef85b42ee603b97fa68da2f.js.map