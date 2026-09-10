System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, AudioClip, AudioSource, CCFloat, CCInteger, input, Input, CoinEvents, CoinEventName, CoinGroundStack, TriggerId, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class4, _class5, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _class6, _crd, ccclass, property, SfxId, ARROW_IDS, COIN_GROUND_IDS, MONSTER_HIT_IDS, SfxSegment, AudioManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function seg(name, usedFor, start, duration, priority, speed = 1) {
    const s = new SfxSegment();
    s.name = name;
    s.usedFor = usedFor;
    s.start = start;
    s.duration = duration;
    s.speed = speed;
    s.priority = priority;
    return s;
  } // sfx_sprite.mp3 실측: 전체 6.696초, 효과음 합계 5.527초, 사이 간격 균등 0.1461초 x 8.
  // (길이는 스프라이트 빌드 리포트의 "결과" 값, 시작점은 거기서 누적 계산 —
  //  마지막 종료가 파일 길이와 오차 0.000으로 맞아떨어지는 것으로 검증됨)


  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinGroundStack(extras) {
    _reporterNs.report("CoinGroundStack", "./CoinGroundStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoin(extras) {
    _reporterNs.report("Coin", "./Coin", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTriggerId(extras) {
    _reporterNs.report("TriggerId", "./TriggerId", _context.meta, extras);
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
      Node = _cc.Node;
      AudioClip = _cc.AudioClip;
      AudioSource = _cc.AudioSource;
      CCFloat = _cc.CCFloat;
      CCInteger = _cc.CCInteger;
      input = _cc.input;
      Input = _cc.Input;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      CoinGroundStack = _unresolved_3.CoinGroundStack;
    }, function (_unresolved_4) {
      TriggerId = _unresolved_4.TriggerId;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "59ab1pr41FFyrU1GSEQ9uiW", "AudioManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'AudioClip', 'AudioSource', 'CCFloat', 'CCInteger', 'input', 'Input']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * ─────────────────────────────────────────────────────────────────────────────
       *  사운드 대응표 — 어떤 소리가 어디서 나는지는 전부 여기서 확인/수정한다
       * ─────────────────────────────────────────────────────────────────────────────
       *  #  이름          우선  발생 위치                                   방식
       *  0  arrow1      ┐  0
       *  1  arrow2      ├  0  화살/석궁 발사    Player._shoot()            셋 중 랜덤 1개
       *  2  arrow3      ┘  0                    TowerAttack._shoot()       (2배속 = 길이 절반)
       *  3  building       3  건물 완성         CoinEvents.SocketFilled     단발
       *  4  coin          1 ┌ 바닥 코인 획득    CoinEvents.CoinCollected    단발
       *                     │ (타워가 coin_ground로 보내는 코인은 소리 없음)
       *                     └ 소켓에 코인 투입  CoinEvents.SocketAbsorbed   단발
       *  5  coin_ground1 ┐  2  coin_ground 수거 CoinEvents                  코인 수에 비례해
       *  6  coin_ground2 ┘  2                   .GroundStackCollectStarted  1~5겹 동시 재생
       *  7  monster_hit1 ┐  0  몬스터 사망      CoinEvents.MonsterKilled    둘 중 랜덤 1개
       *  8  monster_hit2 ┘  0
       *
       *  우선순위: 건물 완성(3) > coin_ground 수거(2) > 바닥 코인(1) > 화살·몬스터 사망(0).
       *  채널이 모자라면 낮은 쪽부터 밀어내고, 자기보다 높은 소리들만 재생 중이면 그 소리는
       *  아예 재생하지 않는다 — 화살이 쏟아지고 몬스터가 우수수 죽는 와중에도 건물 완성음이
       *  묻히지 않게 하기 위한 규칙이다.
       *
       *  BGM은 씬 시작과 함께 루프 재생된다.
       * ─────────────────────────────────────────────────────────────────────────────
       *
       * 효과음은 개별 파일이 아니라 하나의 스프라이트(sfx_sprite.mp3)에 이어붙어 있어서,
       * "몇 초 지점부터 몇 초 동안" 재생할지로 각 소리를 구분한다(아래 segments). 동시에 여러
       * 소리가 나야 하므로 AudioSource를 voiceCount개 만들어 돌려 쓴다.
       */

      /** segments 배열의 인덱스 — 스프라이트에 담긴 순서와 반드시 일치해야 한다 */

      _export("SfxId", SfxId = /*#__PURE__*/function (SfxId) {
        SfxId[SfxId["Arrow1"] = 0] = "Arrow1";
        SfxId[SfxId["Arrow2"] = 1] = "Arrow2";
        SfxId[SfxId["Arrow3"] = 2] = "Arrow3";
        SfxId[SfxId["Building"] = 3] = "Building";
        SfxId[SfxId["Coin"] = 4] = "Coin";
        SfxId[SfxId["CoinGround1"] = 5] = "CoinGround1";
        SfxId[SfxId["CoinGround2"] = 6] = "CoinGround2";
        SfxId[SfxId["MonsterHit1"] = 7] = "MonsterHit1";
        SfxId[SfxId["MonsterHit2"] = 8] = "MonsterHit2";
        return SfxId;
      }({}));

      ARROW_IDS = [SfxId.Arrow1, SfxId.Arrow2, SfxId.Arrow3];
      COIN_GROUND_IDS = [SfxId.CoinGround1, SfxId.CoinGround2];
      MONSTER_HIT_IDS = [SfxId.MonsterHit1, SfxId.MonsterHit2];
      /** 스프라이트 안의 소리 하나 */

      _export("SfxSegment", SfxSegment = (_dec = ccclass('SfxSegment'), _dec2 = property({
        displayName: '이름'
      }), _dec3 = property({
        displayName: '발생 위치',
        tooltip: '이 소리가 어디서 나는지 메모 — 코드 동작에는 영향 없음'
      }), _dec4 = property({
        type: CCFloat,
        displayName: '시작(초)'
      }), _dec5 = property({
        type: CCFloat,
        displayName: '길이(초)'
      }), _dec6 = property({
        type: CCFloat,
        displayName: '볼륨',
        range: [0, 1],
        slide: true
      }), _dec7 = property({
        type: CCFloat,
        displayName: '속도',
        tooltip: '재생 속도 배율. 2면 길이가 절반으로 압축된다(자르는 게 아니라 빨리 감기라 뒷부분이 잘리지 않는 대신 음정이 그만큼 올라간다). 1이면 원본 그대로'
      }), _dec8 = property({
        type: CCInteger,
        displayName: '우선순위',
        tooltip: '숫자가 클수록 중요한 소리. 채널이 모자라면 낮은 쪽을 밀어내고 자리를 차지하고, 반대로 자기보다 높은 소리들만 재생 중이면 이번 소리는 포기한다(중요한 소리를 덮지 않기 위해)'
      }), _dec(_class = (_class2 = class SfxSegment {
        constructor() {
          _initializerDefineProperty(this, "name", _descriptor, this);

          _initializerDefineProperty(this, "usedFor", _descriptor2, this);

          _initializerDefineProperty(this, "start", _descriptor3, this);

          _initializerDefineProperty(this, "duration", _descriptor4, this);

          _initializerDefineProperty(this, "volume", _descriptor5, this);

          _initializerDefineProperty(this, "speed", _descriptor6, this);

          _initializerDefineProperty(this, "priority", _descriptor7, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "usedFor", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "start", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "duration", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "volume", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "speed", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "priority", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      })), _class2)) || _class));

      _export("AudioManager", AudioManager = (_dec9 = ccclass('AudioManager'), _dec10 = property({
        type: AudioClip,
        displayName: 'BGM 클립',
        tooltip: 'audio/bgm/bgm.mp3 — 씬 시작과 함께 루프 재생된다'
      }), _dec11 = property({
        type: CCFloat,
        displayName: 'BGM 볼륨',
        range: [0, 1],
        slide: true
      }), _dec12 = property({
        type: AudioClip,
        displayName: 'SFX 스프라이트 클립',
        tooltip: 'audio/sfx/sfx_sprite.mp3 — 9개 효과음이 이어붙어 있는 한 파일'
      }), _dec13 = property({
        type: CCFloat,
        displayName: 'SFX 전체 볼륨',
        range: [0, 1],
        slide: true
      }), _dec14 = property({
        type: [SfxSegment],
        displayName: '효과음 목록',
        tooltip: '스프라이트에 담긴 순서 그대로 9개. 각 소리의 시작/길이를 여기서 조정한다'
      }), _dec15 = property({
        type: CCFloat,
        displayName: '구간 여유(초)',
        tooltip: '각 구간의 앞뒤로 이만큼 더 넓게 잡아 재생한다. 소리 사이 간격이 0.146초라 이 값이 그 절반(0.073)을 넘지 않으면 옆 소리가 섞이지 않는다 — 소리 앞이 잘린 느낌이면 올리고, 옆 소리가 들리면 내린다'
      }), _dec16 = property({
        type: CCInteger,
        displayName: '동시 재생 채널 수',
        tooltip: '이 개수만큼 AudioSource를 만들어 돌려 쓴다. 모자라면 우선순위가 낮은 소리부터 밀려난다'
      }), _dec17 = property({
        type: CCInteger,
        displayName: 'coin_ground 최대 레이어',
        tooltip: '코인이 아무리 많아도 이 개수를 넘겨 겹쳐 재생하지 않는다'
      }), _dec18 = property({
        type: CCInteger,
        displayName: 'coin_ground 레이어당 코인 수',
        tooltip: '코인 이 개수마다 레이어가 하나씩 늘어난다 (기본 4 → 1~4개:1겹, 5~8개:2겹 … 17개 이상:5겹)'
      }), _dec19 = property({
        type: CCFloat,
        displayName: 'coin_ground 레이어 간격(초)',
        tooltip: '겹쳐 재생할 때 레이어마다 살짝 어긋나게 띄우는 시간 — 0이면 완전히 동시에'
      }), _dec9(_class4 = (_class5 = (_class6 = class AudioManager extends Component {
        constructor(...args) {
          super(...args);

          // ── BGM ──────────────────────────────────────────────────────────────
          _initializerDefineProperty(this, "bgmClip", _descriptor8, this);

          _initializerDefineProperty(this, "bgmVolume", _descriptor9, this);

          // ── SFX ──────────────────────────────────────────────────────────────
          _initializerDefineProperty(this, "sfxClip", _descriptor10, this);

          _initializerDefineProperty(this, "sfxVolume", _descriptor11, this);

          _initializerDefineProperty(this, "segments", _descriptor12, this);

          _initializerDefineProperty(this, "edgePad", _descriptor13, this);

          _initializerDefineProperty(this, "voiceCount", _descriptor14, this);

          // ── coin_ground 다중 레이어 ───────────────────────────────────────────
          _initializerDefineProperty(this, "coinGroundMaxLayers", _descriptor15, this);

          _initializerDefineProperty(this, "coinGroundCoinsPerLayer", _descriptor16, this);

          _initializerDefineProperty(this, "coinGroundLayerDelay", _descriptor17, this);

          this._voices = [];
          this._voiceTokens = [];

          /** 채널별로 지금 재생 중인 소리의 우선순위 */
          this._voicePriority = [];

          /** 채널별 재생 종료 예정 시각(_now 기준) — 이 시각이 지나면 빈 채널로 본다 */
          this._voiceEnd = [];

          /** 채널별 재생 시작 순번 — 같은 우선순위끼리는 먼저 시작한 쪽을 먼저 밀어낸다 */
          this._voiceSeq = [];
          this._tokenSeq = 0;
          this._now = 0;
          this._bgm = null;

          this._onSocketFilled = triggerId => {
            // TriggerId 100번대는 소켓 충족이 아니라 게임 진행 자체에서 나오는 "플로우 트리거"다
            // (GameStartTrigger가 씬 시작 직후 GameStart(100)를 emit해 소켓 스폰을 여는 용도).
            // 건물이 지어진 게 아니므로 건설음을 내면 안 된다 — 씬 2에서 시작하자마자 건설음이
            // 나던 원인이 바로 이것이었다(씬 1은 이 트리거가 None이라 증상이 없었다).
            if (triggerId >= (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
              error: Error()
            }), TriggerId) : TriggerId).GameStart) return;
            this.playSfx(SfxId.Building);
          };

          this._onMonsterKilled = () => this.playRandom(MONSTER_HIT_IDS);

          this._onCoinCollected = coin => {
            // coin_ground(타워가 잡은 코인이 쌓이는 무더기)로 날아간 코인은 소리를 내지 않는다.
            if (coin.stack instanceof (_crd && CoinGroundStack === void 0 ? (_reportPossibleCrUseOfCoinGroundStack({
              error: Error()
            }), CoinGroundStack) : CoinGroundStack)) return; // coin_ground에서 플레이어에게 되돌아오는 코인도 여기(플레이어 스택 도착)로 들어오지만,
            // 그건 수거 시작 시점에 coin_ground 소리를 이미 한 번 냈으므로 개별 소리는 생략한다.

            if (coin.fromGround) return;
            this.playSfx(SfxId.Coin);
          };

          this._onGroundCollect = coinCount => this.playCoinGround(coinCount);

          /** 등 뒤 스택의 코인이 소켓으로 한 개 빨려들어갈 때마다 — 획득음과 같은 소리를 쓴다 */
          this._onSocketAbsorbed = () => this.playSfx(SfxId.Coin);

          // ── 광고가 가려지거나 닫힐 때 오디오 정지 ──────────────────────────────
          // AppLovin 규격: "광고가 닫히거나 숨겨질 때 오디오가 중지되거나 음소거되어야 한다".
          // 신호는 두 군데서 온다 —
          //  (1) MRAID의 viewableChange : 광고 컨테이너가 실제로 보이는지 (네트워크가 알려준다)
          //  (2) document.visibilitychange : 브라우저/앱 자체가 백그라운드로 갔을 때
          // 둘 중 하나라도 "안 보임"이면 끈다. MRAID API는 규격대로 ready 이후에만 만진다.
          this._hidden = false;
          this._userInteracted = false;

          this._onVisibility = () => this._setHidden(document.hidden === true);

          this._onViewable = viewable => this._setHidden(!viewable);
        }

        onLoad() {
          AudioManager.instance = this;

          for (let i = 0; i < this.voiceCount; i++) {
            const n = new Node(`SfxVoice${i}`);
            this.node.addChild(n);
            const src = n.addComponent(AudioSource);
            src.playOnAwake = false;
            src.loop = false;

            this._voices.push(src);

            this._voiceTokens.push(0);

            this._voicePriority.push(-Infinity);

            this._voiceEnd.push(0);

            this._voiceSeq.push(0);
          }

          const bgmNode = new Node('Bgm');
          this.node.addChild(bgmNode);
          this._bgm = bgmNode.addComponent(AudioSource);
          this._bgm.playOnAwake = false;
          this._bgm.loop = true;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).MonsterKilled, this._onMonsterKilled);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).CoinCollected, this._onCoinCollected);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).GroundStackCollectStarted, this._onGroundCollect);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketAbsorbed, this._onSocketAbsorbed);
        }

        onDestroy() {
          if (AudioManager.instance === this) AudioManager.instance = null;
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).MonsterKilled, this._onMonsterKilled);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).CoinCollected, this._onCoinCollected);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).GroundStackCollectStarted, this._onGroundCollect);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketAbsorbed, this._onSocketAbsorbed);
          input.off(Input.EventType.TOUCH_START, this._onFirstInput, this);
          input.off(Input.EventType.MOUSE_DOWN, this._onFirstInput, this);

          this._unbindVisibility();
        }

        start() {
          // ⚠ 여기서 절대 바로 재생하지 않는다.
          // AppLovin 플레이어블 규격: "오디오는 첫 번째 사용자 상호작용 전까지 음소거 상태를
          // 유지해야 한다". 예전에는 start()에서 곧바로 _startBgm()을 부르고 브라우저의 자동재생
          // 차단에 기대고 있었는데, 그건 "재생을 시도했지만 막힌 것"이지 규격이 요구하는 "음소거
          // 보장"이 아니다. 자동재생이 허용된 WebView에서는 그대로 소리가 난다.
          // → 첫 터치/클릭이 올 때 비로소 시작한다.
          input.on(Input.EventType.TOUCH_START, this._onFirstInput, this);
          input.on(Input.EventType.MOUSE_DOWN, this._onFirstInput, this);

          this._bindVisibility();
        } // ── 공개 API ──────────────────────────────────────────────────────────

        /** 화살/석궁 발사음 — arrow1~3 중 랜덤 */


        playArrow() {
          this.playRandom(ARROW_IDS);
        }
        /** 목록 중 하나를 랜덤으로 재생 */


        playRandom(ids, volumeScale = 1) {
          this.playSfx(ids[Math.floor(Math.random() * ids.length)], volumeScale);
        }
        /** coin_ground 수거 — 코인이 많을수록 여러 겹으로 겹쳐 재생한다 */


        playCoinGround(coinCount) {
          const per = Math.max(1, this.coinGroundCoinsPerLayer);
          const layers = Math.min(this.coinGroundMaxLayers, Math.max(1, Math.ceil(coinCount / per)));

          for (let i = 0; i < layers; i++) {
            const id = COIN_GROUND_IDS[Math.floor(Math.random() * COIN_GROUND_IDS.length)];
            this.playSfx(id, 1, i * this.coinGroundLayerDelay);
          }
        }
        /** 스프라이트에서 해당 구간만 잘라 재생한다 */


        playSfx(id, volumeScale = 1, delay = 0) {
          // 첫 사용자 조작 전이거나 광고가 가려진 동안에는 효과음도 내지 않는다.
          // AppLovin 규격의 "오디오는 첫 상호작용 전까지 음소거"는 BGM만이 아니라 모든 소리에
          // 적용된다 — BGM만 막아두면 시작 연출에서 나는 효과음 하나로 규격이 깨진다.
          if (!this._userInteracted || this._hidden) return;

          if (delay > 0) {
            this.scheduleOnce(() => this.playSfx(id, volumeScale, 0), delay);
            return;
          }

          const s = this.segments[id];
          if (!this.sfxClip || !s || s.duration <= 0) return; // 시작점이 아주 조금만 늦어도 소리의 앞부분(어택)이 잘려 들리므로 앞뒤로 여유를 준다.
          // 구간 바깥은 무음 간격이라 여유분을 더해도 옆 소리가 섞이지 않는다.

          const startTime = Math.max(0, s.start - this.edgePad);
          const playDuration = s.duration + this.edgePad * 2;

          const i = this._acquireVoice(s.priority);

          if (i < 0) return; // 자기보다 중요한 소리들로 채널이 꽉 참 — 이번 소리는 포기한다

          const src = this._voices[i];
          src.stop();
          src.clip = this.sfxClip;
          src.volume = this.sfxVolume * s.volume * volumeScale; // 재생 전후로 모두 지정한다 — play()가 재생 위치를 처음으로 되돌리는 구현이 있어서,
          // 한쪽만 하면 스프라이트의 엉뚱한 구간이 한순간 들릴 수 있다.

          src.currentTime = startTime;
          src.play();
          src.currentTime = startTime;
          const speed = s.speed > 0 ? s.speed : 1;

          this._applyRate(src, speed); // 구간 길이만큼만 재생하고 멈춘다(배속이면 그만큼 빨리 끝난다). 이 채널이 그 사이
          // 다른 소리에 재사용됐다면(토큰이 바뀌었으면) 새 소리를 자르지 않도록 그냥 넘어간다.


          const token = ++this._tokenSeq;
          this._voiceTokens[i] = token;
          this._voicePriority[i] = s.priority;
          this._voiceSeq[i] = token;
          this._voiceEnd[i] = this._now + playDuration / speed;
          this.scheduleOnce(() => {
            if (this._voiceTokens[i] === token) src.stop();
          }, playDuration / speed);
        }

        update(dt) {
          this._now += dt;
        }
        /** 이 우선순위의 소리를 재생할 채널을 고른다. 없으면 -1(재생 포기).
         *
         * 1) 비어있는 채널이 있으면 그걸 쓴다.
         * 2) 전부 재생 중이면 "가장 낮은 우선순위 → 그중 가장 먼저 시작한" 채널을 밀어낸다.
         * 3) 단, 밀어낼 후보가 나보다 높은 우선순위면 아무것도 건드리지 않고 포기한다 —
         *    화살이 쏟아지는 중에도 건물 완성음이 잘려나가지 않게 하는 게 이 규칙의 목적이다. */


        _acquireVoice(priority) {
          for (let i = 0; i < this._voices.length; i++) {
            if (this._now >= this._voiceEnd[i]) return i;
          }

          let best = 0;

          for (let i = 1; i < this._voices.length; i++) {
            if (this._voicePriority[i] < this._voicePriority[best] || this._voicePriority[i] === this._voicePriority[best] && this._voiceSeq[i] < this._voiceSeq[best]) {
              best = i;
            }
          }

          return this._voicePriority[best] > priority ? -1 : best;
        }
        /** 재생 속도를 건다 — AudioSource에는 속도 API가 없어서 내부 웹 오디오 노드를 직접 만진다.
         * Web Audio면 AudioBufferSourceNode.playbackRate, DOM 오디오면 HTMLAudioElement.playbackRate.
         * play()가 오디오 컨텍스트 준비를 기다리며 지연 실행되는 경우가 있어 몇 프레임 재시도한다.
         * 끝내 못 잡으면 원래 속도로 재생될 뿐이라 소리가 사라지지는 않는다. */


        _applyRate(src, rate, retries = 4) {
          if (rate === 1) return;
          const player = src._player;
          const webNode = player == null ? void 0 : player._sourceNode;

          if (webNode != null && webNode.playbackRate) {
            webNode.playbackRate.value = rate;
            return;
          }

          const domAudio = player == null ? void 0 : player._domAudio;

          if (domAudio) {
            domAudio.playbackRate = rate;
            return;
          }

          if (retries > 0) this.scheduleOnce(() => this._applyRate(src, rate, retries - 1), 0);
        }
        /** 첫 입력 처리 — "조작했다"는 사실을 먼저 못 박고 나서 BGM을 시도한다.
         * 플래그를 _startBgm() 안에 두면 BGM 클립이 비어 있거나 이미 재생 중일 때 조기 return에
         * 걸려 플래그가 영영 안 켜지고, 그러면 효과음까지 전부 막혀버린다. */


        _onFirstInput() {
          this._userInteracted = true;

          this._startBgm();
        }

        _startBgm() {
          if (this._hidden) return; // 숨겨진 동안에는 첫 입력이 와도 켜지 않는다

          if (!this._bgm || !this.bgmClip || this._bgm.playing) return;
          this._bgm.clip = this.bgmClip;
          this._bgm.volume = this.bgmVolume;
          this._bgm.loop = true;

          this._bgm.play();
        }

        _bindVisibility() {
          if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('visibilitychange', this._onVisibility);
          }

          const mraid = globalThis.mraid;
          if (!mraid || typeof mraid.addEventListener !== 'function') return;

          const hook = () => {
            mraid.addEventListener('viewableChange', this._onViewable); // 지금 이미 안 보이는 상태로 시작했을 수도 있다.

            if (typeof mraid.isViewable === 'function') this._setHidden(!mraid.isViewable());
          };

          if (typeof mraid.getState === 'function' && mraid.getState() === 'loading') {
            mraid.addEventListener('ready', hook);
          } else {
            hook();
          }
        }

        _unbindVisibility() {
          if (typeof document !== 'undefined' && document.removeEventListener) {
            document.removeEventListener('visibilitychange', this._onVisibility);
          }

          const mraid = globalThis.mraid;

          if (mraid && typeof mraid.removeEventListener === 'function') {
            mraid.removeEventListener('viewableChange', this._onViewable);
          }
        }

        _setHidden(hidden) {
          if (this._hidden === hidden) return;
          this._hidden = hidden;

          if (hidden) {
            var _this$_bgm;

            (_this$_bgm = this._bgm) == null || _this$_bgm.pause();

            for (const v of this._voices) if (v.playing) v.stop();
          } else if (this._userInteracted) {
            var _this$_bgm2;

            // 사용자가 이미 한 번 조작한 뒤라면 돌아왔을 때 BGM을 이어서 재생한다.
            // 아직 조작 전이었다면 계속 무음으로 둔다(규격 유지).
            (_this$_bgm2 = this._bgm) == null || _this$_bgm2.play();
          }
        }

      }, _class6.instance = null, _class6), (_descriptor8 = _applyDecoratedDescriptor(_class5.prototype, "bgmClip", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "bgmVolume", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.4;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "sfxClip", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "sfxVolume", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "segments", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [seg('arrow1', '화살/석궁 발사 (랜덤 3종)', 0.000, 0.746, 0, 2), seg('arrow2', '화살/석궁 발사 (랜덤 3종)', 0.892, 0.895, 0, 2), seg('arrow3', '화살/석궁 발사 (랜덤 3종)', 1.933, 0.775, 0, 2), seg('building', '건물 완성', 2.854, 0.959, 3), seg('coin', '바닥 코인 획득', 3.960, 0.253, 1), seg('coin_ground1', 'coin_ground 수거 (랜덤 2종, 다중 레이어)', 4.359, 0.470, 2), seg('coin_ground2', 'coin_ground 수거 (랜덤 2종, 다중 레이어)', 4.975, 0.777, 2), seg('monster_hit1', '몬스터 사망 (랜덤 2종)', 5.898, 0.275, 0), seg('monster_hit2', '몬스터 사망 (랜덤 2종)', 6.319, 0.377, 0)];
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "edgePad", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.02;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "voiceCount", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "coinGroundMaxLayers", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "coinGroundCoinsPerLayer", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 4;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class5.prototype, "coinGroundLayerDelay", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.04;
        }
      })), _class5)) || _class4));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8de2d340d8fe48e578656398eefb88af2fe579e6.js.map