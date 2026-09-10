System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Prefab, Vec3, Quat, CCFloat, Texture2D, MeshRenderer, SkinnedMeshRenderer, instantiate, tween, Animation, AnimationClip, warn, CoinEvents, CoinEventName, TriggerId, VirtualWall, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _crd, ccclass, property, StructureUpgradeManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTriggerId(extras) {
    _reporterNs.report("TriggerId", "./TriggerId", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualWall(extras) {
    _reporterNs.report("VirtualWall", "./VirtualWall", _context.meta, extras);
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
      Prefab = _cc.Prefab;
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
      CCFloat = _cc.CCFloat;
      Texture2D = _cc.Texture2D;
      MeshRenderer = _cc.MeshRenderer;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
      instantiate = _cc.instantiate;
      tween = _cc.tween;
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
      warn = _cc.warn;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }, function (_unresolved_3) {
      TriggerId = _unresolved_3.TriggerId;
    }, function (_unresolved_4) {
      VirtualWall = _unresolved_4.VirtualWall;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "59c043TztpJQ4ofN5m5T9Vy", "StructureUpgradeManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'Vec3', 'Quat', 'CCFloat', 'Texture2D', 'MeshRenderer', 'SkinnedMeshRenderer', 'instantiate', 'tween', 'Animation', 'AnimationClip', 'warn']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 마지막 건물 소켓을 채우는 순간(= 엔딩 이펙트가 터지는 그 순간) 방어선 전체를 상위 등급
       * 구조물로 한 번에 갈아치운다 — 나무 벽/문/타워를 치우고, 타워와 타워 사이를 돌 벽으로
       * 균등하게 채워서 기지가 빈틈 없이 둘러싸인 그림을 만든다.
       *
       * **왜 CoinEvents.AllBuildingSocketsCompleted를 쓰나**: 요구 타이밍이 "마지막 소켓 달성 =
       * 이펙트와 동시"이고, GameManager의 엔딩 연출(카메라 줌 + EndingEffect.playAll())도 정확히
       * 이 이벤트로 시작한다. 특정 트리거 ID를 박아두면 소켓을 늘렸을 때 "마지막"이 바뀌어 조용히
       * 어긋나므로(실제로 소켓이 16개 → 17개로 늘어난 적이 있다), 개수와 무관하게 항상 맞는 이
       * 신호를 구독한다.
       *
       * **왜 기존 벽 위치를 재사용하지 않나**: 원래는 나무 벽이 있던 자리에 돌 벽을 그대로 놓고
       * 문이 있던 빈칸만 메웠는데, 나무 벽 자체가 손으로 배치되어 간격이 고르지 않았고(중심 간
       * 1.129m와 문 옆 1.44m가 섞여 있었다) 그 불균일이 돌 벽에 그대로 옮겨졌다. 그래서 지금은
       * 원본 위치를 전부 버리고 **타워와 타워 사이를 (개수+1)등분해서** 새로 놓는다 — 타워~벽,
       * 벽~벽 간격이 한 구간 안에서 완전히 같아진다.
       */

      /** 시계방향 쓸기의 한 단계. key = 쓸기 시작점에서 진행 방향으로 잰 각도(0~360),
       * place = 돌 구조물 설치(true) / 나무 구조물 철거(false) — 같은 각도에서 철거를 먼저
       * 실행해 나무와 돌이 한 프레임 겹쳐 보이지 않게 하는 데만 쓴다. */

      _export("StructureUpgradeManager", StructureUpgradeManager = (_dec = ccclass('StructureUpgradeManager'), _dec2 = property({
        type: Node,
        displayName: '탐색 기준 노드',
        tooltip: '교체 대상을 찾을 범위. 비워두면 씬 루트 전체를 훑는다. 구조물을 컨테이너 노드 밑으로 정리했다면 그 컨테이너를 지정'
      }), _dec3 = property({
        type: Prefab,
        displayName: '교체할 벽 프리팹',
        tooltip: '타워 사이를 채울 상위 등급 벽 (예: wall2)'
      }), _dec4 = property({
        type: Prefab,
        displayName: '교체할 타워 프리팹',
        tooltip: '나무 타워를 대신할 상위 등급 타워 (예: tower2). 위치·회전·크기는 원본 타워를 그대로 물려받는다'
      }), _dec5 = property({
        displayName: '타워 사이 벽 개수',
        tooltip: '인접한 두 타워 사이에 넣을 벽 개수. 두 타워를 잇는 선을 (이 개수 + 1)등분한 지점마다 하나씩 놓으므로, 타워~벽/벽~벽 간격이 모두 같아진다'
      }), _dec6 = property({
        displayName: '벽 노드 이름 접두어',
        tooltip: '이 접두어로 시작하는 노드를 나무 벽으로 보고 치운다 (예: Wall)'
      }), _dec7 = property({
        displayName: '타워 노드 이름 접두어',
        tooltip: '이 접두어로 시작하는 노드를 타워로 보고 교체한다. 이 타워들의 위치가 곧 돌 벽을 채울 구간의 양 끝이 된다 (예: Tower)'
      }), _dec8 = property({
        displayName: '문 노드 이름 접두어',
        tooltip: '이 접두어로 시작하는 노드를 문으로 보고 치운다. 문이 있던 자리도 위의 균등 배치가 함께 덮으므로 따로 메울 필요가 없다 (예: Door)'
      }), _dec9 = property({
        displayName: '함께 등장시킬 노드 이름 접두어',
        tooltip: '이 접두어로 시작하는 노드는 게임 시작부터 숨겨두고, 아래 "등장 트리거"가 발화하는 순간 나타난다 (예: ground_dirt — 완성된 기지의 바닥). 비워두면 아무것도 숨기지 않는다'
      }), _dec10 = property({
        type: _crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
          error: Error()
        }), TriggerId) : TriggerId,
        displayName: '함께 등장시킬 노드의 등장 트리거',
        tooltip: '위 접두어 노드가 나타날 시점을 소켓 트리거 ID로 지정한다. 나무 방어선은 "이웃한 두 타워가 다 서면 그 사이 벽/문이 생긴다"는 AND 조건이라, 링이 완전히 닫히는 건 마지막 구간의 두 트리거가 모두 발화한 뒤다 — 씬 2 기준으로는 트리거 8이 그 시점이다(트리거 7까지는 8이 필요한 두 구간이 아직 비어 있다). None으로 두면 구조물이 돌로 교체되는 순간까지 미뤄진다(옛 동작)'
      }), _dec11 = property({
        displayName: '등장 애니메이션 클립 이름',
        tooltip: '새로 놓이는 돌 벽/돌 타워가 생겨나는 순간 재생할 클립 이름 (wall2/tower2 둘 다 "appear"를 갖고 있다). 이름이 없거나 해당 클립이 없으면 프리팹의 기본 클립(defaultClip)으로 대체하고, 그것도 없으면 애니메이션 없이 그냥 나타난다. 비워두면 재생하지 않는다'
      }), _dec12 = property({
        type: CCFloat,
        displayName: '함께 등장 노드 확대 시간(초)',
        tooltip: '"함께 등장시킬 노드"(ground_dirt 등)가 나타날 때 스케일 0에서 원래 크기까지 커지는 데 걸리는 시간. 0이면 예전처럼 즉시 원래 크기로 나타난다'
      }), _dec13 = property({
        displayName: '함께 등장 노드 확대 이징',
        tooltip: 'cc.tween의 easing 이름. backOut = 원래 크기를 살짝 지나쳤다 돌아오는 탄력 있는 등장(기본), 그 밖에 quadOut / cubicOut / elasticOut / linear 등을 쓸 수 있다. 잘못된 이름을 넣으면 엔진이 경고를 내고 linear로 동작한다'
      }), _dec14 = property({
        type: Texture2D,
        displayName: '돌 교체 시 바닥 텍스처',
        tooltip: '마지막 소켓을 달성해 돌 구조물이 서기 시작하는 순간 "함께 등장시킬 노드"(ground_dirt)의 머티리얼 텍스처를 이것으로 갈아끼운다 (예: ground_rock). 비워두면 텍스처를 바꾸지 않는다. 머티리얼 에셋 자체는 건드리지 않고 이 노드만의 인스턴스에 적용하므로 다른 곳에 영향이 없다'
      }), _dec15 = property({
        type: CCFloat,
        displayName: '바닥 교체 연출 시간(초)',
        tooltip: '바닥 텍스처가 흙에서 돌로 바뀔 때, 스케일이 0까지 줄었다가 원래 크기로 돌아오면서 그 사이에 텍스처가 갈린다. 여기 넣은 시간이 줄기+커지기를 합친 총 시간이다(절반씩 나눠 쓴다). 0이면 연출 없이 텍스처만 즉시 갈린다. 교체는 돌 구조물이 서기 시작하는 순간과 동시에 시작한다'
      }), _dec16 = property({
        displayName: '돌벽 충돌 박스 크기(m)',
        tooltip: '돌 벽 하나가 막을 영역의 실제 크기. X=벽을 따라가는 폭, Z=두께 (Y는 판정에 쓰이지 않는다 — VirtualWall은 X/Z 평면 판정이다). wall2 메시 실측 폭 2.001 / 두께 0.888에 맞춘 값이 기본이다'
      }), _dec17 = property({
        displayName: '돌벽 충돌 여유 마진(m)',
        tooltip: '캐릭터가 벽에 파묻히지 않도록 실제 크기보다 넓게 막을 여유분(캐릭터 반경 정도). 벽 프리팹들이 쓰는 기본값과 같은 0.3'
      }), _dec18 = property({
        type: Node,
        displayName: '기지 노드',
        tooltip: '교체할 기지 노드(Map/Base/base). 이 노드 자체는 절대 지우지 않고 메시만 갈아끼운다 — 아래 주석 참고'
      }), _dec19 = property({
        type: Prefab,
        displayName: '교체할 기지 프리팹',
        tooltip: '상위 등급 기지 (예: base2). 기지 노드의 자식으로 붙여 원래 위치/회전을 그대로 물려받는다'
      }), _dec20 = property({
        displayName: '기지 크기 보정 배율',
        tooltip: '새 기지가 원래 기지와 비슷한 크기로 보이도록 원래 스케일에 곱할 배율. 실측 기준값 0.963 = base 메시 높이 4.075 / base2 높이 4.2325 (base2가 3.9% 더 높다). 1이면 보정 없음'
      }), _dec21 = property({
        type: CCFloat,
        displayName: '기지 등장 확대 시간(초)',
        tooltip: '새 기지가 스케일 0에서 원래 크기까지 커지는 데 걸리는 시간. base2에서 스켈레톤/애니메이션을 걷어내 appear 클립이 없어졌기 때문에, 등장 연출을 이 스케일 트윈이 대신한다. 0이면 즉시 원래 크기로 나타난다'
      }), _dec22 = property({
        displayName: '기지 등장 이징',
        tooltip: 'cc.tween의 easing 이름. backOut = 원래 크기를 살짝 지나쳤다 돌아오는 탄력 있는 등장(기본). quadOut / cubicOut / elasticOut / linear 등도 쓸 수 있다'
      }), _dec23 = property({
        displayName: '교체 구조물 그림자 켜기',
        tooltip: '새로 놓이는 돌 타워/돌 벽/새 기지가 그림자를 드리우게 한다. 이 프리팹들은 glb에서 자동 생성된 것이라 그림자 끄기가 기본값이고 에디터에서 고칠 수 없어서, 배치하는 순간 코드로 켠다. 끄면 교체되는 순간 방어선의 그림자가 사라진다(나무 타워/벽은 프리팹 자체에 켜져 있다)'
      }), _dec24 = property({
        type: CCFloat,
        displayName: '교체 진행 시간(초)',
        tooltip: '방어선 전체가 돌로 바뀌는 데 걸리는 총 시간. 한 바퀴(360도)를 이 시간에 걸쳐 도는 속도로 각 구조물이 차례대로 교체된다. 0으로 두면 예전처럼 전부 한 프레임에 동시에 바뀐다'
      }), _dec25 = property({
        displayName: '시계방향으로 교체',
        tooltip: '체크하면 화면 기준 시계방향으로 돌아가며 교체한다. 반대로 돌면(카메라 각도를 바꿨다면) 체크를 끄면 반시계방향이 된다'
      }), _dec26 = property({
        type: CCFloat,
        displayName: '교체 시작 각도(도)',
        tooltip: '쓸기가 시작되는 지점을 링 중심에서 본 방위각으로 지정한다. 0 = +Z 방향(카메라 기준 화면 아래쪽), 90 = +X(오른쪽). 시작 지점을 특정 타워에 맞추고 싶을 때 조정'
      }), _dec27 = property({
        type: CCFloat,
        displayName: '기지 교체 추가 지연(초)',
        tooltip: '기지(base -> base2)는 링 중심이라 회전 순서에 낄 자리가 없어서, 방어선이 한 바퀴 다 바뀐 "뒤"에 마지막으로 교체하며 등장 애니메이션을 재생한다. 그 시점에서 더 뜸을 들이고 싶으면 여기에 초를 넣는다. 실제 교체 시각 = 교체 진행 시간 + 이 값'
      }), _dec(_class = (_class2 = class StructureUpgradeManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "searchRoot", _descriptor, this);

          _initializerDefineProperty(this, "wallPrefab", _descriptor2, this);

          _initializerDefineProperty(this, "towerPrefab", _descriptor3, this);

          _initializerDefineProperty(this, "wallsPerSegment", _descriptor4, this);

          _initializerDefineProperty(this, "wallNamePrefix", _descriptor5, this);

          _initializerDefineProperty(this, "towerNamePrefix", _descriptor6, this);

          _initializerDefineProperty(this, "doorNamePrefix", _descriptor7, this);

          _initializerDefineProperty(this, "revealNamePrefix", _descriptor8, this);

          _initializerDefineProperty(this, "revealTriggerId", _descriptor9, this);

          _initializerDefineProperty(this, "appearClipName", _descriptor10, this);

          _initializerDefineProperty(this, "revealScaleDuration", _descriptor11, this);

          _initializerDefineProperty(this, "revealScaleEasing", _descriptor12, this);

          _initializerDefineProperty(this, "groundRockTexture", _descriptor13, this);

          _initializerDefineProperty(this, "groundSwapDuration", _descriptor14, this);

          // ── 돌 벽의 충돌(가상의 벽) ─────────────────────────────────────────────────
          _initializerDefineProperty(this, "wallBlockSize", _descriptor15, this);

          _initializerDefineProperty(this, "wallBlockMargin", _descriptor16, this);

          // ── 기지 교체 ──────────────────────────────────────────────────────────────
          _initializerDefineProperty(this, "baseNode", _descriptor17, this);

          _initializerDefineProperty(this, "basePrefab", _descriptor18, this);

          _initializerDefineProperty(this, "baseSizeMatchRatio", _descriptor19, this);

          _initializerDefineProperty(this, "baseAppearDuration", _descriptor20, this);

          _initializerDefineProperty(this, "baseAppearEasing", _descriptor21, this);

          _initializerDefineProperty(this, "castShadow", _descriptor22, this);

          // ── 교체 연출(시계방향 쓸기) ───────────────────────
          _initializerDefineProperty(this, "upgradeSweepDuration", _descriptor23, this);

          _initializerDefineProperty(this, "upgradeClockwise", _descriptor24, this);

          _initializerDefineProperty(this, "upgradeStartAngleDeg", _descriptor25, this);

          _initializerDefineProperty(this, "baseUpgradeDelay", _descriptor26, this);

          this._done = false;
          this._hidden = [];

          /** "함께 등장" 노드와 그 원래 스케일 — 숨길 때 0으로 줄여두고 등장할 때 되돌린다. */
          this._revealScales = [];
        }

        onLoad() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).AllBuildingSocketsCompleted, this._onAllCompleted, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).on((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);

          this._hideRevealTargets();
        }

        onDestroy() {
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).AllBuildingSocketsCompleted, this._onAllCompleted, this);
          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).off((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, this._onSocketFilled, this);
        }
        /** 나무 방어선이 닫히는 시점(revealTriggerId)에 "함께 등장" 대상을 드러낸다.
         * BuildingTrigger와 완전히 같은 이벤트를 쓰므로, 벽/문이 서는 그 프레임에 같이 나타난다. */


        _onSocketFilled(triggerId) {
          if (this.revealTriggerId === (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).None) return;
          if (triggerId !== this.revealTriggerId) return;

          this._revealTargets();
        }
        /** "함께 등장" 대상을 시작부터 감춘다. node.active는 건드리지 않고 렌더러만 끈다 —
         * 비활성 노드는 스스로 다시 켜질 수 없고, 자식에 다른 로직이 있을 수도 있어서다
         * (BuildingTrigger가 건물을 숨기는 방식과 같다). */


        _hideRevealTargets() {
          var _this$searchRoot;

          if (!this.revealNamePrefix) return;
          const root = (_this$searchRoot = this.searchRoot) != null ? _this$searchRoot : this.node.scene;
          if (!root) return;

          for (const child of root.children) {
            if (!child.name.startsWith(this.revealNamePrefix)) continue;

            for (const r of child.getComponentsInChildren(MeshRenderer)) {
              r.enabled = false;

              this._hidden.push(r);
            }

            for (const r of child.getComponentsInChildren(SkinnedMeshRenderer)) {
              r.enabled = false;

              this._hidden.push(r);
            } // 렌더러를 끄는 것만으로도 안 보이지만, 등장할 때 0에서 커지는 연출을 하려면
            // 원래 크기를 기억해 두고 미리 0으로 줄여둬야 한다(등장 첫 프레임에 원래
            // 크기로 한 번 번쩍이는 것을 막는다).


            this._revealScales.push({
              node: child,
              scale: child.scale.clone()
            });

            if (this.revealScaleDuration > 0) child.setScale(0, 0, 0);
          }
        }

        _onAllCompleted() {
          var _this$searchRoot2;

          if (this._done) return;
          this._done = true;
          const root = (_this$searchRoot2 = this.searchRoot) != null ? _this$searchRoot2 : this.node.scene;
          if (!root) return; // 먼저 대상을 전부 수집한다 — 순회 중에 노드를 추가/삭제하면 자식 배열이 바뀌어
          // 일부를 건너뛴다.

          const walls = [];
          const towers = [];
          const doors = [];

          for (const child of root.children) {
            const n = child.name;
            if (this.wallNamePrefix && n.startsWith(this.wallNamePrefix)) walls.push(child);else if (this.towerNamePrefix && n.startsWith(this.towerNamePrefix)) towers.push(child);else if (this.doorNamePrefix && n.startsWith(this.doorNamePrefix)) doors.push(child);
          } // 타워 자리를 먼저 기억해둔다(교체하면서 원본이 사라지므로).


          const spots = towers.map(t => ({
            pos: t.worldPosition.clone(),
            rot: t.worldRotation.clone(),
            scale: t.worldScale.clone()
          })); // 링의 중심 = 타워 자리들의 무게중심. 쓸기 각도와 돌 벽 배치가 같은 중심을 쓴다.

          const center = new Vec3();

          if (spots.length > 0) {
            for (const sp of spots) center.add(sp.pos);

            center.multiplyScalar(1 / spots.length);
          } // 모든 교체를 "각도가 붙은 할 일" 하나로 모아둔 뒤 한 번에 예약한다. 나무 조각
          // 철거와 돌 조각 설치가 같은 목록에 섞여 있어야 쓸고 지나가는 자리마다 나무가
          // 사라지고 돌이 서는 그림이 된다(따로 처리하면 한쪽이 먼저 통째로 사라진다).


          const steps = [];

          for (const t of towers) {
            var _t$parent;

            const parent = (_t$parent = t.parent) != null ? _t$parent : root;
            const pos = t.worldPosition.clone();
            const rot = t.worldRotation.clone();
            const scale = t.worldScale.clone();
            steps.push({
              key: this._sweepKey(pos.x, pos.z, center),
              place: true,
              run: () => {
                if (this.towerPrefab) {
                  const node = instantiate(this.towerPrefab);
                  parent.addChild(node);
                  node.setWorldPosition(pos);
                  node.setWorldRotation(rot);
                  node.setWorldScale(scale);

                  this._enableShadow(node);

                  this._playAppear(node);
                }

                if (t.isValid) t.destroy();
              }
            });
          }

          for (const old of walls.concat(doors)) {
            const p = old.worldPosition;
            steps.push({
              key: this._sweepKey(p.x, p.z, center),
              place: false,
              run: () => {
                if (old.isValid) old.destroy();
              }
            });
          }

          this._collectWallRing(root, spots, center, steps);

          this._runSweep(steps); // 바닥은 쓸기가 "시작될 때" 함께 갈린다 — 벽이 다 선 뒤로 미뤘더니 템포가 늘어졌다.
          // 줄었다 커지는 연출(groundSwapDuration)이 첫 벽들이 서는 동안 같이 돌아간다.


          this._swapGroundTexture(); // 기지는 링 중심이라 회전 순서에 낄 자리가 없다 — 쓸기가 한 바퀴를 다 돈 "뒤"에
          // 마지막으로 교체해서, base2의 등장 애니메이션이 벽에 묻히지 않고 눈에 띄게 한다.


          const baseDelay = Math.max(0, this.upgradeSweepDuration) + Math.max(0, this.baseUpgradeDelay);
          if (baseDelay <= 0) this._upgradeBase();else this.scheduleOnce(() => this._upgradeBase(), baseDelay); // 안전망 — revealTriggerId가 None이거나 어떤 이유로 그 트리거가 발화하지 않았다면
          // 여기서라도 드러낸다(옛 동작과 같은 타이밍). 이미 드러났으면 아무 일도 하지 않는다.

          this._revealTargets();
        }
        /** 링 중심에서 본 방위각을 "쓸기 시작점부터 진행 방향으로 얼마나 갔는가"(0~360도)로 바꾼다.
         *
         * `atan2(x, z)`는 +Z에서 +X로 가는 각도인데, 이 게임의 카메라는 X축으로만 -45도 기울어
         * 있어서(yaw 0) 화면 좌우가 곧 월드 +X, 화면 아래쪽이 월드 +Z다. 그 배치에서 +Z(화면
         * 아래) → +X(화면 오른쪽)는 화면상 **반시계** 방향이므로, 시계방향으로 돌리려면
         * 부호를 뒤집어야 한다. (카메라를 돌려서 방향이 반대로 보이면 인스펙터 체크만 끄면 된다.) */


        _sweepKey(x, z, center) {
          const worldDeg = Math.atan2(x - center.x, z - center.z) * 180 / Math.PI;
          let d = worldDeg - this.upgradeStartAngleDeg;
          if (this.upgradeClockwise) d = -d;
          d %= 360;
          if (d < 0) d += 360;
          return d;
        }
        /** 모아둔 할 일을 각도순으로 정렬해 총 시간에 걸쳐 예약한다. 한 바퀴가 곧 총 시간이므로
         * 각 항목의 지연은 (각도 / 360) * 총 시간 — 각속도가 일정한 진짜 "회전하는 시계바늘"이
         * 된다(항목 개수로 균등 분할하면 나무 벽처럼 간격이 불규칙한 것들이 뭉쳐 보인다).
         *
         * 같은 각도에서는 철거를 먼저 예약해 나무와 돌이 한 프레임 겹쳐 보이지 않게 한다.
         * 총 시간이 0 이하면 예전처럼 전부 즉시 실행한다. */


        _runSweep(steps) {
          steps.sort((a, b) => a.key - b.key || Number(a.place) - Number(b.place));
          const total = this.upgradeSweepDuration;

          for (const st of steps) {
            const delay = total > 0 ? total * (st.key / 360) : 0; // scheduleOnce(_, 0)은 다음 프레임으로 밀리므로 시작점 항목은 그냥 즉시 실행한다.

            if (delay <= 0) st.run();else this.scheduleOnce(st.run, delay);
          }
        }

        _revealTargets() {
          for (const r of this._hidden) if (r.isValid) r.enabled = true;

          this._hidden.length = 0;

          for (const it of this._revealScales) {
            if (!it.node.isValid) continue;

            if (this.revealScaleDuration > 0) {
              it.node.setScale(0, 0, 0);
              tween(it.node).to(this.revealScaleDuration, {
                scale: it.scale
              }, {
                easing: this.revealScaleEasing
              }).start();
            } else {
              it.node.setScale(it.scale);
            }
          }

          this._revealScales.length = 0;
        }
        /** 돌 구조물이 서기 시작할 때 "함께 등장" 노드(ground_dirt)의 바닥 텍스처를 돌 바닥으로 바꾼다.
         *
         * 공유 머티리얼 에셋을 고치면 같은 머티리얼을 쓰는 다른 곳까지 바뀌므로, 렌더러마다
         * `getMaterialInstance()`로 이 노드 전용 인스턴스를 만들어 거기에만 적용한다.
         * (그 인스턴스를 `setMaterial()`에 되돌려 넣으면 안 된다 — 엔진이 거부한다.)
         *
         * `_revealScales`는 등장 시점에 비워지므로 여기서 이름으로 다시 찾는다. */


        _swapGroundTexture() {
          var _this$searchRoot3;

          const tex = this.groundRockTexture;
          if (!tex || !this.revealNamePrefix) return;
          const root = (_this$searchRoot3 = this.searchRoot) != null ? _this$searchRoot3 : this.node.scene;
          if (!root) return;

          for (const child of root.children) {
            if (!child.name.startsWith(this.revealNamePrefix)) continue;

            const apply = () => {
              for (const r of child.getComponentsInChildren(MeshRenderer)) {
                const count = r.sharedMaterials.length || 1;

                for (let i = 0; i < count; i++) {
                  var _r$getMaterialInstanc;

                  // 이 프로퍼티 이름은 ground_dirt가 쓰는 builtin-standard가 선언한
                  // 것이다 (USE_ALBEDO_MAP이 이미 켜져 있어 define은 건드릴 필요 없다).
                  (_r$getMaterialInstanc = r.getMaterialInstance(i)) == null || _r$getMaterialInstanc.setProperty('mainTexture', tex);
                }
              }
            };

            const dur = this.groundSwapDuration;

            if (dur <= 0) {
              apply();
              continue;
            } // 스케일 0까지 줄였다가(전반) 텍스처를 갈고, 다시 원래 크기로 돌아온다(후반).
            // 텍스처 교체를 가장 작을 때 해서 바뀌는 순간이 눈에 안 띄게 한다.
            // 등장 때와 달리 여기서는 현재 스케일을 그 자리에서 읽는다 — 등장 확대가 이미
            // 끝나 원래 크기로 돌아와 있는 시점이다.


            const back = child.scale.clone();
            const half = dur / 2;
            tween(child).to(half, {
              scale: new Vec3(0, 0, 0)
            }, {
              easing: 'quadIn'
            }).call(apply).to(half, {
              scale: back
            }, {
              easing: this.revealScaleEasing
            }).start();
          }
        }
        /** 새로 놓인 돌 구조물의 "생겨나는" 애니메이션을 정확히 한 번 재생한다.
         *
         * wall2/tower2는 glb가 자동 생성한 프리팹이라 루트에 cc.SkeletalAnimation이 이미 붙어
         * 있고 클립도 들어있다(wall2: appear / tower2: shot + appear). 다만 tower2의
         * defaultClip은 appear가 아니라 **shot**이므로 BuildingTrigger처럼 defaultClip을
         * 재생하면 엉뚱한 클립이 나간다 — 그래서 클립 이름으로 찾고, 없을 때만 defaultClip으로
         * 물러난다. wrapMode는 클립 에셋 값에 기대지 않고 항상 Normal로 강제해서(임포터 기본값이
         * Loop로 잡히는 경우가 있다) 마지막 프레임 포즈, 즉 다 지어진 모습에서 멈추게 한다. */


        _playAppear(node) {
          var _node$getComponent, _anim$clips$find;

          if (!this.appearClipName) return;
          const anim = (_node$getComponent = node.getComponent(Animation)) != null ? _node$getComponent : node.getComponentInChildren(Animation);
          if (!anim) return;
          let clip = (_anim$clips$find = anim.clips.find(c => !!c && c.name === this.appearClipName)) != null ? _anim$clips$find : null;

          if (!clip) {
            warn(`[StructureUpgradeManager] '${node.name}'에 '${this.appearClipName}' 클립이 없어 defaultClip으로 대체합니다`);
            clip = anim.defaultClip;
          }

          if (!clip) return;
          const state = anim.getState(clip.name);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = 1;
          state.time = 0;
          state.play();
        }
        /** 돌 벽에 "가상의 벽"을 붙여 몬스터가 통과하지 못하게 한다.
         *
         * 나무 벽에는 원래 충돌이 없었다(Wall.prefab에 VirtualWall이 아예 없다) — 몬스터는 벽을
         * 자유롭게 지나갈 수 없는 대신 러쉬 경로를 따라 문으로만 들어왔고, 막는 역할은 문
         * (Door2.prefab의 VirtualWall)이 혼자 했다. 그래서 교체 후 문이 사라지면 방어선에 실제
         * 장애물이 하나도 남지 않아 몬스터가 그대로 걸어 들어왔다.
         *
         * VirtualWall은 "그 노드 자신의 월드 위치/회전/스케일"이 곧 막는 박스이므로(스케일 1 =
         * 1m), 부모(돌 벽)의 스케일로 나눠서 월드 크기가 정확히 wallBlockSize가 되게 맞춘다. */


        _attachBlocker(wall, center) {
          const ws = wall.worldScale;
          const block = new Node('VirtualWall');
          wall.addChild(block);
          block.setScale(this.wallBlockSize.x / (ws.x || 1), this.wallBlockSize.y / (ws.y || 1), this.wallBlockSize.z / (ws.z || 1));
          const vw = block.addComponent(_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall);
          vw.margin = this.wallBlockMargin; // 몬스터만 막는다 — 링이 닫히는 순간 플레이어가 바깥에 있었더라도 갇히지 않게.
          // (몬스터가 쓰는 isBlocked()는 playerCanPass와 무관하게 항상 막는다)

          vw.playerCanPass = true;
          vw.activate(); // 링의 바깥쪽을 알려준다 — 벽이 생기는 순간 겹쳐버린 몬스터를 반드시 "바깥"으로
          // 밀어내기 위함. 이게 없으면 가장 가까운 면으로 밀려나서, 밴드 안쪽 절반에 있던
          // 몬스터는 그대로 안으로 들어가버린다.

          vw.setOutwardFrom(center.x, center.z);
        }
        /** 기지의 메시만 상위 등급으로 갈아끼운다.
         *
         * **기지 노드 자체는 절대 지우지 않는다** — GameManager.baseNode(엔딩 카메라 추적 대상),
         * MonsterSpawner.baseNode(몬스터의 최종 공격 대상), 그리고 이 노드에 붙어있는
         * StructureHealthBar / StructureHitFlash가 모두 이 노드를 참조한다. 지우면 엔딩 카메라와
         * 몬스터 타게팅이 한꺼번에 깨진다. 그래서 원본 렌더러만 끄고 새 기지를 자식으로 붙인다. */


        _upgradeBase() {
          if (!this.baseNode || !this.basePrefab) return; // 새 기지를 붙이기 "전에" 원본 렌더러를 꺼야 한다 — 나중에 끄면 새 기지까지 함께
          // 꺼진다(getComponentsInChildren은 자식을 포함하므로).

          for (const r of this.baseNode.getComponentsInChildren(MeshRenderer)) r.enabled = false;

          for (const r of this.baseNode.getComponentsInChildren(SkinnedMeshRenderer)) r.enabled = false;

          const node = instantiate(this.basePrefab);
          this.baseNode.addChild(node);
          node.setPosition(0, 0, 0);
          node.setRotationFromEuler(0, 0, 0);
          const k = this.baseSizeMatchRatio;

          this._enableShadow(node); // base2는 용량을 줄이려고 스켈레톤/애니메이션을 걷어낸 순수 메시라 appear 클립이 없다.
          // 그래서 등장 연출을 스케일 트윈으로 대신한다 — 돌 벽/타워는 여전히 자기 appear
          // 클립을 재생하므로 _playAppear는 그쪽에만 쓴다.


          if (this.baseAppearDuration > 0) {
            node.setScale(0, 0, 0);
            tween(node).to(this.baseAppearDuration, {
              scale: new Vec3(k, k, k)
            }, {
              easing: this.baseAppearEasing
            }).start();
          } else {
            node.setScale(k, k, k);
          }
        }
        /** glb 자동 생성 프리팹은 그림자 투사가 꺼진 채로 들어온다(에디터에서 고칠 수 없다).
         * SkinnedMeshRenderer는 MeshRenderer를 상속하므로 이 한 번의 탐색으로 둘 다 잡힌다.
         * 그림자 "받기"는 기본값이 이미 켜져 있어 건드리지 않는다. */


        _enableShadow(node) {
          if (!this.castShadow) return;

          for (const r of node.getComponentsInChildren(MeshRenderer)) {
            r.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
          }
        }
        /** 타워 자리들을 중심 기준 각도순으로 정렬한 뒤, 인접한 두 자리 사이를
         * (wallsPerSegment + 1)등분한 지점마다 놓을 돌 벽을 "할 일"로 모아 steps에 넣는다.
         * 실제 생성은 _runSweep이 각도 순서대로 시간차를 두고 실행한다 — 그래서 위치/회전을
         * 공용 임시 Vec3/Quat에 담아 넘기면 안 되고(실행 시점엔 이미 다른 값으로 덮여 있다)
         * 항목마다 새로 만들어 둬야 한다. */


        _collectWallRing(root, spots, center, steps) {
          const prefab = this.wallPrefab;
          if (!prefab || spots.length < 2 || this.wallsPerSegment <= 0) return; // 이 중심에서 본 각도로 정렬하면 인접 순서가 곧 링을 한 바퀴 도는 순서가 된다
          // (노드 이름 순서에 의존하지 않는다).

          const ring = spots.slice().sort((a, b) => Math.atan2(a.pos.x - center.x, a.pos.z - center.z) - Math.atan2(b.pos.x - center.x, b.pos.z - center.z));
          const n = ring.length;
          const div = this.wallsPerSegment + 1;

          for (let i = 0; i < n; i++) {
            const a = ring[i].pos;
            const b = ring[(i + 1) % n].pos; // 벽은 로컬 +X축이 방어선을 따라 뻗는다(씬 실측: 인접 조각을 잇는 방향각과 노드
            // yaw의 차이가 항상 -90도). 그래서 진행 방향각에서 90도를 빼면 올바른 yaw가 된다.

            const yaw = Math.atan2(b.x - a.x, b.z - a.z) * 180 / Math.PI - 90;
            const rot = Quat.fromEuler(new Quat(), 0, yaw, 0);

            for (let k = 1; k <= this.wallsPerSegment; k++) {
              const pos = Vec3.lerp(new Vec3(), a, b, k / div);
              steps.push({
                key: this._sweepKey(pos.x, pos.z, center),
                place: true,
                run: () => {
                  const node = instantiate(prefab);
                  root.addChild(node);
                  node.setWorldPosition(pos);
                  node.setWorldRotation(rot); // 크기는 양 끝 타워의 것을 쓰지 않는다 — 타워와 벽은 원본 스케일이
                  // 다르다. 프리팹 자신의 스케일을 그대로 살린다.
                  // 그림자는 _attachBlocker보다 "먼저" 켠다 — 뒤에 붙는 VirtualWall
                  // 자식까지 훑어서 판정용 박스에 그림자가 생기는 일이 없도록.

                  this._enableShadow(node);

                  this._playAppear(node);

                  this._attachBlocker(node, center);
                }
              });
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "searchRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "wallPrefab", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "towerPrefab", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "wallsPerSegment", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 6;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "wallNamePrefix", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'Wall';
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "towerNamePrefix", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'Tower';
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "doorNamePrefix", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'Door';
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "revealNamePrefix", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'ground_dirt';
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "revealTriggerId", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TriggerId === void 0 ? (_reportPossibleCrUseOfTriggerId({
            error: Error()
          }), TriggerId) : TriggerId).Trigger8;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "appearClipName", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'appear';
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "revealScaleDuration", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.45;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "revealScaleEasing", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'backOut';
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "groundRockTexture", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "groundSwapDuration", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "wallBlockSize", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(2.0, 1, 0.9);
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "wallBlockMargin", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "baseNode", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "basePrefab", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "baseSizeMatchRatio", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.963;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "baseAppearDuration", [_dec21], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "baseAppearEasing", [_dec22], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'backOut';
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "castShadow", [_dec23], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "upgradeSweepDuration", [_dec24], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.5;
        }
      }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "upgradeClockwise", [_dec25], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "upgradeStartAngleDeg", [_dec26], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "baseUpgradeDelay", [_dec27], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=98879bd212af01071b93bff17d889365eaa69496.js.map