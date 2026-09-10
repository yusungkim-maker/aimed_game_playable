/*
 * 로컬 테스트 전용 MRAID 스텁 — 실제 제출용 파일이 아님.
 * AppLovin/Unity/Liftoff 등 MRAID 기반 플레이어블 광고는 <script src="mraid.js">를
 * 참조하지만, 그 파일은 원래 광고 네트워크(AppLovin 대시보드/SDK)가 실제 서빙 시점에
 * 주입해주는 것이라 프로젝트에는 존재하지 않는다 — 그래서 exported html을 로컬에서
 * 그냥 열면 그 스크립트가 끝내 로드되지 않아(404/pending) 스플래시에서 멈춘 것처럼 보인다.
 * 이 파일을 해당 html과 같은 폴더에 두면 최소한의 mraid API를 흉내내어 로컬에서
 * 진행 상황을 확인할 수 있다. 실제 AppLovin 심사/배포에는 이 파일을 포함하지 않는다.
 */
(function (global) {
    var state = 'loading';
    var listeners = {};

    function emit(evt) {
        (listeners[evt] || []).forEach(function (fn) {
            try { fn(); } catch (e) { console.error(e); }
        });
    }

    global.mraid = {
        getState: function () { return state; },
        isViewable: function () { return true; },
        getVersion: function () { return '3.0'; },
        getPlacementType: function () { return 'interstitial'; },
        supports: function () { return false; },
        addEventListener: function (evt, fn) {
            (listeners[evt] = listeners[evt] || []).push(fn);
        },
        removeEventListener: function (evt, fn) {
            if (!listeners[evt]) return;
            listeners[evt] = listeners[evt].filter(function (f) { return f !== fn; });
        },
        open: function (url) { global.open(url, '_blank'); },
        close: function () {},
        expand: function () {},
        useCustomClose: function () {},
    };

    setTimeout(function () {
        state = 'default';
        emit('ready');
    }, 0);
})(window);
