import { _decorator, Component, Node, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

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
@ccclass('CtaClick')
export class CtaClick extends Component {
    @property({ type: Node, displayName: '클릭 영역 노드', tooltip: '비워두면 이 컴포넌트가 붙은 노드 자신이 클릭 영역이 된다. 화면 아무 데나 눌러도 스토어로 보내고 싶으면 화면 전체를 덮는 노드를 연결한다' })
    clickArea: Node | null = null;

    @property({ displayName: '테스트용 대체 URL', tooltip: '광고 네트워크 API가 하나도 없을 때(=로컬에서 그냥 열어봤을 때)만 새 탭으로 열어보는 주소. 실제 광고에서는 절대 쓰이지 않는다 — AppLovin은 스토어 링크를 SDK가 붙인다. 비워두면 아무 것도 하지 않는다' })
    fallbackUrl: string = '';

    @property({ displayName: '한 번만 반응', tooltip: '연타로 스토어가 여러 번 열리는 것을 막는다' })
    onceOnly: boolean = true;

    @property({ displayName: '로그 출력', tooltip: '어떤 네트워크 경로로 나갔는지 콘솔에 찍는다. 배포 전에 꺼도 되고 켜둬도 무해하다' })
    verbose: boolean = true;

    private _fired = false;

    onEnable() {
        (this.clickArea ?? this.node).on(Node.EventType.TOUCH_END, this._onClick, this);
    }

    onDisable() {
        (this.clickArea ?? this.node).off(Node.EventType.TOUCH_END, this._onClick, this);
    }

    private _onClick(_e: EventTouch) {
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
    static openStore(fallbackUrl = ''): string {
        const w = window as any;

        // ── MRAID 계열: AppLovin / Liftoff / Unity / Moloco ──────────────────
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
            } catch (e) { console.warn('[CtaClick] mraid.open 실패', e); }
        }

        // ── Google (AdWords/AdMob 플레이어블) ────────────────────────────────
        if (w.ExitApi && typeof w.ExitApi.exit === 'function') {
            try { w.ExitApi.exit(); return 'ExitApi'; } catch (e) { console.warn(e); }
        }

        // ── Meta(Facebook) 플레이어블 ────────────────────────────────────────
        if (w.FbPlayableAd && typeof w.FbPlayableAd.onCTAClick === 'function') {
            try { w.FbPlayableAd.onCTAClick(); return 'FbPlayableAd'; } catch (e) { console.warn(e); }
        }

        // ── ironSource (dapi) ───────────────────────────────────────────────
        if (w.dapi && typeof w.dapi.openStoreUrl === 'function') {
            try { w.dapi.openStoreUrl(); return 'dapi'; } catch (e) { console.warn(e); }
        }

        // ── Mintegral ───────────────────────────────────────────────────────
        if (typeof w.install === 'function') {
            try { w.install(); return 'install()'; } catch (e) { console.warn(e); }
        }
        if (typeof w.gameEnd === 'function') {
            try { w.gameEnd(); return 'gameEnd()'; } catch (e) { console.warn(e); }
        }

        // ── 로컬 테스트 전용 ────────────────────────────────────────────────
        if (fallbackUrl) {
            w.open(fallbackUrl, '_blank');
            return 'fallbackUrl (테스트)';
        }
        console.warn('[CtaClick] 광고 네트워크 API를 찾지 못했다 — 실제 광고 환경이 아니거나 SDK가 아직 주입되지 않았다');
        return 'none';
    }
}
