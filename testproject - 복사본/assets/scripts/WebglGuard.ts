import { _decorator, Component, game } from 'cc';
const { ccclass, property } = _decorator;

const OVERLAY_ID = '__webgl_fallback__';

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
@ccclass('WebglGuard')
export class WebglGuard extends Component {
    @property({ displayName: '안내 문구', tooltip: '컨텍스트가 손실됐을 때 화면에 띄울 문구' })
    message: string = '화면을 다시 불러오는 중입니다…';

    @property({ displayName: '배경 색(CSS)', tooltip: '오버레이 배경. 반투명 검정이 기본' })
    backgroundCss: string = 'rgba(0,0,0,0.85)';

    @property({ displayName: '글자 색(CSS)' })
    textCss: string = '#ffffff';

    private _canvas: HTMLCanvasElement | null = null;
    private _overlay: HTMLElement | null = null;

    private _onLost = (e: Event) => {
        // preventDefault를 해야 브라우저가 나중에 webglcontextrestored를 보내준다.
        e.preventDefault();
        this._show(true);
    };
    private _onRestored = () => this._show(false);

    onLoad() {
        if (typeof document === 'undefined') return;   // 네이티브 빌드 등

        this._canvas = (game.canvas as HTMLCanvasElement)
            ?? (document.getElementById('GameCanvas') as HTMLCanvasElement)
            ?? document.querySelector('canvas');
        if (!this._canvas) return;

        this._canvas.addEventListener('webglcontextlost', this._onLost, false);
        this._canvas.addEventListener('webglcontextrestored', this._onRestored, false);
    }

    onDestroy() {
        this._canvas?.removeEventListener('webglcontextlost', this._onLost, false);
        this._canvas?.removeEventListener('webglcontextrestored', this._onRestored, false);
        this._overlay?.remove();
        this._overlay = null;
    }

    private _show(show: boolean) {
        if (!show) { this._overlay?.remove(); this._overlay = null; return; }
        if (this._overlay) return;

        const el = document.createElement('div');
        el.id = OVERLAY_ID;
        el.style.cssText = [
            'position:fixed', 'left:0', 'top:0', 'right:0', 'bottom:0',
            'z-index:2147483647',
            `background:${this.backgroundCss}`,
            `color:${this.textCss}`,
            'display:flex', 'align-items:center', 'justify-content:center',
            'text-align:center', 'padding:24px', 'box-sizing:border-box',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
            'font-size:16px', 'line-height:1.5',
            '-webkit-user-select:none', 'user-select:none',
        ].join(';');
        el.textContent = this.message;
        document.body.appendChild(el);
        this._overlay = el;
    }
}
