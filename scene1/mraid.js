/* ────────────────────────────────────────────────────────────────────────────
 * 로컬 테스트 전용 MRAID 스텁 — 절대 광고 네트워크에 업로드하지 말 것!
 *
 * AppLovin/Liftoff/Unity/Moloco 빌드는 <head>에 <script src="mraid.js">가 박혀 있고,
 * 실제 광고 환경에서는 네트워크 SDK가 이 파일을 대신 넣어준다. 그래서 로컬에서 그냥 열면
 * mraid.js가 404 나고 window.mraid가 없어서 스플래시에서 멈춘 것처럼 보인다.
 * 이 스텁은 "게임이 도는지" 눈으로 보기 위한 최소 구현이다.
 *
 * 배포 시에는 이 파일을 지우거나, mraid.js가 없는 폴더에서 html만 업로드하면 된다.
 * ──────────────────────────────────────────────────────────────────────────── */
(function () {
    if (window.mraid) return;

    var listeners = {};
    var state = 'loading';
    var viewable = true;

    function emit(ev) {
        var args = Array.prototype.slice.call(arguments, 1);
        (listeners[ev] || []).forEach(function (fn) {
            try { fn.apply(null, args); } catch (e) { console.warn('[mraid stub]', e); }
        });
    }

    window.mraid = {
        getVersion: function () { return '2.0'; },
        getState: function () { return state; },
        isViewable: function () { return viewable; },
        getPlacementType: function () { return 'interstitial'; },
        getScreenSize: function () { return { width: window.innerWidth, height: window.innerHeight }; },
        getMaxSize: function () { return { width: window.innerWidth, height: window.innerHeight }; },
        getExpandProperties: function () { return { width: window.innerWidth, height: window.innerHeight, useCustomClose: false, isModal: true }; },
        addEventListener: function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
        removeEventListener: function (ev, fn) {
            if (!listeners[ev]) return;
            listeners[ev] = fn ? listeners[ev].filter(function (f) { return f !== fn; }) : [];
        },
        open: function (url) {
            console.log('[mraid stub] open() 호출됨 — 실제 광고에서는 여기서 스토어가 열린다', url || '(URL 없음)');
            alert('CTA 클릭 감지: 실제 광고에서는 스토어로 이동합니다.');
        },
        close: function () { console.log('[mraid stub] close()'); },
        expand: function () {}, resize: function () {}, useCustomClose: function () {},
        setExpandProperties: function () {}, setResizeProperties: function () {},
        supports: function (f) { return f === 'inlineVideo'; },
        playVideo: function () {},
    };

    // 실제 SDK처럼 한 틱 뒤에 ready를 쏴 준다.
    setTimeout(function () { state = 'default'; emit('ready'); }, 0);

    // 탭 전환 시 viewableChange를 흉내 낸다 — 오디오 정지/복귀 확인용.
    document.addEventListener('visibilitychange', function () {
        viewable = !document.hidden;
        emit('viewableChange', viewable);
    });
})();
