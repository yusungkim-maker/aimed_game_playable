System.register("chunks:///_virtual/AtlasNumber.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Mesh, Material, MeshRenderer, Vec4, Node, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Mesh = module.Mesh;
      Material = module.Material;
      MeshRenderer = module.MeshRenderer;
      Vec4 = module.Vec4;
      Node = module.Node;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "ce780q0lYxHMpa047zGEZhE", "AtlasNumber", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      /** number.png 텍스처의 원본 픽셀 크기 (아틀라스가 바뀌면 함께 갱신해야 함) */
      var ATLAS_WIDTH = 215;
      var ATLAS_HEIGHT = 208;

      /**
       * assets/texture/number.png 아틀라스에서 실측한 각 글자의 원본 픽셀 좌표(좌상단 기준) —
       * 4열x3행(1행: 1,2,3,4 / 2행: 5,6,7,0 / 3행: 8,9,-,+)으로 그려진 손그림 숫자 아틀라스를
       * 스캔해서 얻은 값. 이미지가 바뀌면 다시 측정해야 함.
       */
      var DIGIT_RECTS = {
        '1': {
          x: 3,
          y: 0,
          width: 45,
          height: 66
        },
        '2': {
          x: 54,
          y: 0,
          width: 49,
          height: 66
        },
        '3': {
          x: 108,
          y: 0,
          width: 49,
          height: 66
        },
        '4': {
          x: 162,
          y: 0,
          width: 52,
          height: 66
        },
        '5': {
          x: 0,
          y: 71,
          width: 48,
          height: 66
        },
        '6': {
          x: 55,
          y: 71,
          width: 49,
          height: 66
        },
        '7': {
          x: 110,
          y: 71,
          width: 48,
          height: 66
        },
        '0': {
          x: 164,
          y: 71,
          width: 48,
          height: 66
        },
        '8': {
          x: 1,
          y: 142,
          width: 48,
          height: 66
        },
        '9': {
          x: 54,
          y: 142,
          width: 49,
          height: 66
        },
        '-': {
          x: 110,
          y: 142,
          width: 32,
          height: 66
        },
        '+': {
          x: 146,
          y: 142,
          width: 50,
          height: 66
        }
      };

      /**
       * 킹샷류 모바일 게임처럼, cc.Label(폰트) 대신 숫자 전용 아틀라스 텍스처에서 각 글자를
       * 오려낸 3D 쿼드(MeshRenderer)를 가로로 나열해 숫자를 표시한다 — 2D UI가 아니라 실제
       * 3D 월드 오브젝트라서, 부모 노드(예: 소켓)의 자식으로 두면 그 오브젝트 바로 위에
       * 자연스럽게 붙어 다닌다(카메라 투영/스크린 좌표 변환 없이 트랜스폼만 상속).
       * setValue()를 호출할 때마다 필요한 만큼만 자식 쿼드를 재사용한다. 각 쿼드는 자기 자신의
       * MeshRenderer.getMaterialInstance()로 얻은 전용 머티리얼 인스턴스에 tilingOffset을 설정해
       * 아틀라스의 서로 다른 서브 영역을 샘플링한다 (HitEffect.ts와 동일한 방식).
       */
      var AtlasNumber = exports('AtlasNumber', (_dec = ccclass('AtlasNumber'), _dec2 = property({
        type: Mesh,
        displayName: '쿼드 메쉬',
        tooltip: '평평한 2x2 쿼드 메쉬 (로컬 XY 평면, normal=+Z) — 이 프로젝트에서 재사용 중인 공용 쿼드'
      }), _dec3 = property({
        type: Material,
        displayName: '숫자 아틀라스 머티리얼',
        tooltip: 'texture/NumberAtlas.mtl (mainTexture=number.png, tilingOffset로 글자별 서브 영역을 샘플링)'
      }), _dec4 = property({
        displayName: '렌더 높이(월드 단위)',
        tooltip: '숫자 한 글자의 세로 크기. 가로는 원본 비율 그대로 자동 계산됨'
      }), _dec5 = property({
        displayName: '글자 간격(월드 단위)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(AtlasNumber, _Component);
        function AtlasNumber() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "quadMesh", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "atlasMaterial", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "digitHeight", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spacing", _descriptor4, _assertThisInitialized(_this));
          _this._digitNodes = [];
          _this._lastValue = null;
          return _this;
        }
        var _proto = AtlasNumber.prototype;
        _proto.setValue = function setValue(value) {
          var text = typeof value === 'number' ? String(Math.max(0, Math.floor(value))) : value;
          if (text === this._lastValue) return;
          this._lastValue = text;
          this._rebuild(text);
        };
        _proto._rebuild = function _rebuild(text) {
          if (!this.quadMesh || !this.atlasMaterial) return;
          while (this._digitNodes.length < text.length) this._digitNodes.push(this._createDigitNode());
          var widths = [];
          var totalWidth = 0;
          for (var i = 0; i < text.length; i++) {
            var r = DIGIT_RECTS[text[i]];
            var w = r ? r.width / r.height * this.digitHeight : 0;
            widths.push(w);
            totalWidth += w + (i > 0 ? this.spacing : 0);
          }
          var x = -totalWidth / 2;
          for (var _i = 0; _i < this._digitNodes.length; _i++) {
            var node = this._digitNodes[_i];
            if (_i >= text.length) {
              node.active = false;
              continue;
            }
            node.active = true;
            var _w = widths[_i];
            var _r = DIGIT_RECTS[text[_i]];
            if (_r) {
              var inst = node.getComponent(MeshRenderer).getMaterialInstance(0);
              inst == null || inst.setProperty('tilingOffset', new Vec4(_r.width / ATLAS_WIDTH, _r.height / ATLAS_HEIGHT, _r.x / ATLAS_WIDTH, _r.y / ATLAS_HEIGHT));
            }
            node.setPosition(x + _w / 2, 0, 0);
            node.setScale(_w / 2, this.digitHeight / 2, 1);
            x += _w + this.spacing;
          }
        };
        _proto._createDigitNode = function _createDigitNode() {
          var node = new Node('digit');
          this.node.addChild(node);
          node.setRotationFromEuler(0, 0, 0);
          var mr = node.addComponent(MeshRenderer);
          mr.mesh = this.quadMesh;
          mr.setMaterial(this.atlasMaterial, 0);
          return node;
        };
        return AtlasNumber;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "quadMesh", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "atlasMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "digitHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "spacing", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.06;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BossRushManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts', './TriggerId.ts', './MonsterSpawner.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, Node, Component, CoinEvents, CoinEventName, TriggerId, MonsterSpawner;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
      _inheritsLoose = module.inheritsLoose;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }, function (module) {
      TriggerId = module.TriggerId;
    }, function (module) {
      MonsterSpawner = module.MonsterSpawner;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _dec4, _dec5, _dec6, _dec7, _class4, _class5, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "0a38d12nFVNR7NwDFxglH5T", "BossRushManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 특정 건물 트리거 ID가 발동하면 시작할 보스 러쉬 1건 */
      var BossRushEntry = exports('BossRushEntry', (_dec = ccclass('BossRushEntry'), _dec2 = property({
        type: TriggerId,
        displayName: '반응할 건물 트리거 ID',
        tooltip: '소켓 목록에서 이 트리거 ID를 가진 건물 소켓이 요구치를 채우는 순간 아래 러쉬를 시작한다'
      }), _dec3 = property({
        displayName: '시작할 보스 러쉬 이름',
        tooltip: 'MonsterSpawner.rushes 목록에 등록된 RushConfig의 이름과 정확히 같아야 한다 (보스 프리팹/경로/스탯은 그쪽에서 구성)'
      }), _dec(_class = (_class2 = function BossRushEntry() {
        _initializerDefineProperty(this, "triggerId", _descriptor, this);
        _initializerDefineProperty(this, "rushName", _descriptor2, this);
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return TriggerId.None;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      })), _class2)) || _class));

      /**
       * 잡몹 러쉬(UnitSocketManager가 트리거하는 Rush_1 등)와 완전히 별개로, 건물 건축 소켓이
       * 특정 트리거 ID까지 채워질 때마다 보스 러쉬를 시작시키는 전용 컨트롤러.
       *
       * 새 스폰/이동 로직을 직접 만들지 않는다 — CoinEvents.SocketFilled(BuildingTrigger.ts가
       * 반응하는 것과 같은 이벤트)를 구독하기만 하고, 실제 스폰은 기존 MonsterSpawner.startRushByName()에
       * 위임한다. 보스 프리팹/전용 러쉬 경로/스탯 등은 MonsterSpawner의 "러쉬 목록"(rushes)에
       * 이 컴포넌트가 참조하는 것과 같은 이름의 RushConfig로 직접 구성하면 된다 — 러쉬 경로는
       * 기존 RushPath(Path_1~6)를 그대로 재사용할 수 있다.
       */
      var BossRushManager = exports('BossRushManager', (_dec4 = ccclass('BossRushManager'), _dec5 = property({
        type: [BossRushEntry],
        displayName: '보스 러쉬 목록',
        tooltip: '건물 트리거 ID별로 시작할 보스/몬스터 러쉬 이름을 등록. 같은 트리거 ID로 여러 개를 등록하면(예: 보스 등장 + 새 몬스터 티어 시작) 그 트리거가 발동할 때 전부 함께 시작된다. 같은 트리거는 한 번만 발동한다'
      }), _dec6 = property({
        displayName: '유닛 소켓 마일스톤 러쉬 목록',
        tooltip: 'UnitSocketManager가 CoinEvents.BuildingSocketsUnlocked를 딱 한 번 emit할 때(유닛 생산 소켓을 지정 개수만큼 완료) 함께 시작할 러쉬 이름들. 여러 개면 전부 동시에 시작된다'
      }), _dec7 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec4(_class4 = (_class5 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BossRushManager, _Component);
        function BossRushManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "entries", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "unitMilestoneRushNames", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "monsterSpawnerNode", _descriptor5, _assertThisInitialized(_this));
          _this._spawner = null;
          _this._firedTriggerIds = new Set();
          _this._unitMilestoneFired = false;
          return _this;
        }
        var _proto = BossRushManager.prototype;
        _proto.onLoad = function onLoad() {
          var _this$monsterSpawnerN, _this$monsterSpawnerN2;
          this._spawner = (_this$monsterSpawnerN = (_this$monsterSpawnerN2 = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN2.getComponent(MonsterSpawner)) != null ? _this$monsterSpawnerN : null;
          CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
          CoinEvents.on(CoinEventName.BuildingSocketsUnlocked, this._onUnitMilestone, this);
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
          CoinEvents.off(CoinEventName.BuildingSocketsUnlocked, this._onUnitMilestone, this);
        };
        _proto._onSocketFilled = function _onSocketFilled(triggerId) {
          if (this._firedTriggerIds.has(triggerId)) return;
          var matches = this.entries.filter(function (e) {
            return e.triggerId === triggerId && e.rushName;
          });
          if (matches.length === 0) return;
          this._firedTriggerIds.add(triggerId);
          for (var _iterator = _createForOfIteratorHelperLoose(matches), _step; !(_step = _iterator()).done;) {
            var _this$_spawner;
            var entry = _step.value;
            (_this$_spawner = this._spawner) == null || _this$_spawner.startRushByName(entry.rushName);
          }
        };
        _proto._onUnitMilestone = function _onUnitMilestone() {
          if (this._unitMilestoneFired) return;
          this._unitMilestoneFired = true;
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.unitMilestoneRushNames), _step2; !(_step2 = _iterator2()).done;) {
            var _this$_spawner2;
            var name = _step2.value;
            if (name) (_this$_spawner2 = this._spawner) == null || _this$_spawner2.startRushByName(name);
          }
        };
        return BossRushManager;
      }(Component), (_descriptor3 = _applyDecoratedDescriptor(_class5.prototype, "entries", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class5.prototype, "unitMilestoneRushNames", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class5)) || _class4));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BuildingTrigger.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts', './TriggerId.ts', './TowerAttack.ts', './DoorAutoOpen.ts', './VirtualWall.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, Animation, MeshRenderer, SkinnedMeshRenderer, AnimationClip, Component, CoinEvents, CoinEventName, TriggerId, TowerAttack, DoorAutoOpen, VirtualWall;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Animation = module.Animation;
      MeshRenderer = module.MeshRenderer;
      SkinnedMeshRenderer = module.SkinnedMeshRenderer;
      AnimationClip = module.AnimationClip;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }, function (module) {
      TriggerId = module.TriggerId;
    }, function (module) {
      TowerAttack = module.TowerAttack;
    }, function (module) {
      DoorAutoOpen = module.DoorAutoOpen;
    }, function (module) {
      VirtualWall = module.VirtualWall;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "238aah/EfhF0ZmWf1m+6JG7", "BuildingTrigger", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * door1/door2/tower/wall 같은 건물 프리팹에 붙여서, 소켓 목록에서 같은 트리거 ID로 설정한
       * 소켓이 요구치를 채우는 순간 이 건물이 "건설"되게(등장 애니메이션 재생) 만드는 컴포넌트.
       * 소켓 쪽(Socket.ts)과는 CoinEvents.SocketFilled 이벤트로만 느슨하게 연결되어 있다 —
       * 서로의 존재를 직접 참조하지 않으므로 건물을 씬 어디에 몇 개 배치하든 상관없다.
       *
       * 각 건물의 Animation/SkeletalAnimation이 가진 등장 클립 이름은 에셋마다 다르지만
       * (tower/wall/door1/door2 전부 "appear") 클립 이름을 하드코딩하지 않고 항상 defaultClip을
       * 재생한다. 각 프리팹의 defaultClip이 실제 등장 클립으로 지정되어 있어야 한다
       * (Tower/Wall/Door1/Door2 프리팹 준비 시 이미 그렇게 맞춰둠).
       *
       * door2는 별도로 "open" 클립을 DoorAutoOpen이 여닫힘 연출에 쓴다 — appear(건설 등장)와
       * open(플레이어 접근 시 여닫힘)은 서로 다른 클립이므로, appear가 다 재생되기 전까지는
       * DoorAutoOpen을 비활성 상태로 둬 두 애니메이션이 같은 뼈대를 동시에 건드리지 않게 한다.
       */
      var BuildingTrigger = exports('BuildingTrigger', (_dec = ccclass('BuildingTrigger'), _dec2 = property({
        type: TriggerId,
        displayName: '반응할 트리거 ID',
        tooltip: '소켓 목록에서 같은 트리거 ID로 설정된 소켓이 요구치를 채우면 이 건물이 반응해 건설 애니메이션을 재생한다'
      }), _dec3 = property({
        displayName: '트리거 전까지 숨기기',
        tooltip: '체크하면 씬 시작 시 이 건물의 메쉬를 즉시 숨겨두고, 트리거가 발동하는 순간 다시 보이게 하면서 등장 애니메이션을 재생한다 (node.active는 건드리지 않는다 — 비활성 노드는 스스로 다시 켜질 수 없기 때문)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BuildingTrigger, _Component);
        function BuildingTrigger() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "triggerId", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "hideUntilTriggered", _descriptor2, _assertThisInitialized(_this));
          _this._anim = null;
          _this._renderers = [];
          _this._obstacle = null;
          _this._built = false;
          return _this;
        }
        var _proto = BuildingTrigger.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          this._renderers = [].concat(this.getComponentsInChildren(MeshRenderer), this.getComponentsInChildren(SkinnedMeshRenderer));
          // 가상의 벽(VirtualWall)은 건물 프리팹 안에 별도 자식 노드로 들어있다 — 실제
          // 렌더링되는 메쉬와 완전히 분리된 노드라, 건물 자체와 위치/회전/스케일이 다를 수 있다.
          this._obstacle = this.getComponentInChildren(VirtualWall);
          if (this.hideUntilTriggered && this.triggerId !== TriggerId.None) {
            this._setVisible(false);
          }
          CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
        };
        _proto._onSocketFilled = function _onSocketFilled(triggerId) {
          var _this$_obstacle;
          if (this._built) return;
          if (this.triggerId === TriggerId.None || triggerId !== this.triggerId) return;
          this._built = true;
          this._setVisible(true);
          (_this$_obstacle = this._obstacle) == null || _this$_obstacle.activate();
          var duration = this._playOnce();
          // 화살탑처럼 TowerAttack이 붙어있는 건물이면, 건설 완료 순간부터 자동 공격을 켠다
          // (그 전까지는 TowerAttack.combatEnabled가 false라 조준/발사 둘 다 하지 않는다).
          // appear 클립이 Root_Bow 회전까지 애니메이션하는 경우가 있어서, appear가 끝나기 전에
          // combatEnabled를 켜면 TowerAttack.update()가 매 프레임 aimBone 회전을 덮어써서
          // appear 애니메이션이 재생되는 게 안 보이는 문제가 있었다 — 재생 시간만큼 지연시킨다.
          var tower = this.getComponent(TowerAttack);
          if (tower) {
            if (duration > 0) this.scheduleOnce(function () {
              tower.combatEnabled = true;
            }, duration);else tower.combatEnabled = true;
          }

          // Door2처럼 DoorAutoOpen이 붙어있는 건물이면, appear(건설) 애니메이션이 끝난 뒤에야
          // open 상태를 건드리기 시작하게 한다 — 그 전까지 DoorAutoOpen이 이미 open 상태를
          // 재생 중이었다면 appear와 open 두 애니메이션이 같은 뼈대를 동시에 건드려 문이
          // 등장하는 순간 포즈가 뒤섞이며 튀는 문제가 있었다.
          var door = this.getComponent(DoorAutoOpen);
          if (door) {
            if (duration > 0) this.scheduleOnce(function () {
              door.activate();
            }, duration);else door.activate();
          }
        }

        /** defaultClip을 정확히 한 번만 재생한다 — 임포트된 클립 자체의 wrapMode가 Loop로
         * 잡혀 있어도(에셋 쪽 기본값) 여기서 매번 Normal로 강제해 반복 재생을 막는다.
         * 반환값은 클립 재생 시간(초) — 0이면 재생하지 못했다는 뜻. */;
        _proto._playOnce = function _playOnce() {
          var _this$_anim;
          var clip = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.defaultClip;
          if (!this._anim || !clip) return 0;
          var state = this._anim.getState(clip.name);
          if (!state) return 0;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = 1;
          state.time = 0;
          state.play();
          return clip.duration;
        };
        _proto._setVisible = function _setVisible(visible) {
          for (var _iterator = _createForOfIteratorHelperLoose(this._renderers), _step; !(_step = _iterator()).done;) {
            var r = _step.value;
            r.enabled = visible;
          }
        };
        return BuildingTrigger;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return TriggerId.None;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hideUntilTriggered", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Bullet.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Monster.ts', './HitEffect.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Vec3, MeshRenderer, director, Node, Component, Monster, HitEffect;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      MeshRenderer = module.MeshRenderer;
      director = module.director;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      Monster = module.Monster;
    }, function (module) {
      HitEffect = module.HitEffect;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "03a0csFoEdHnrYFM7A+iWpO", "Bullet", undefined);
      var ccclass = _decorator.ccclass;
      var Bullet = exports('Bullet', (_dec = ccclass('Bullet'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Bullet, _Component);
        function Bullet() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._target = null;
          _this._dmg = 1;
          _this._speed = 14;
          _this._dir = new Vec3();
          _this._tmp = new Vec3();
          _this._timer = 0;
          _this._fxMesh = null;
          _this._fxMat = null;
          _this._fxParams = null;
          return _this;
        }
        var _proto = Bullet.prototype;
        _proto.init = function init(target, damage, speed, mesh, mat, fxMesh, fxMat, fxParams) {
          if (speed === void 0) {
            speed = 14;
          }
          if (mesh === void 0) {
            mesh = null;
          }
          if (mat === void 0) {
            mat = null;
          }
          if (fxMesh === void 0) {
            fxMesh = null;
          }
          if (fxMat === void 0) {
            fxMat = null;
          }
          if (fxParams === void 0) {
            fxParams = null;
          }
          this._target = target;
          this._dmg = damage;
          this._speed = speed;
          this._fxMesh = fxMesh;
          this._fxMat = fxMat;
          this._fxParams = fxParams;
          Vec3.subtract(this._dir, target.worldPosition, this.node.worldPosition);
          this._dir.normalize();
          this.node.setScale(4, 4, 4);
          this._updateRotation();
          if (mesh && mat) {
            var mr = this.node.addComponent(MeshRenderer);
            mr.mesh = mesh;
            mr.setMaterial(mat, 0);
          }
        };
        _proto._spawnHitEffect = function _spawnHitEffect(pos, dir) {
          if (!this._fxMesh || !this._fxMat || !this._fxParams) return;
          var scene = director.getScene();
          if (!scene) return;
          var fxNode = new Node('HitEffect');
          scene.addChild(fxNode);
          fxNode.setWorldPosition(pos);
          fxNode.addComponent(HitEffect).init(this._fxMesh, this._fxMat, dir, this._fxParams);
        };
        _proto._updateRotation = function _updateRotation() {
          if (this._dir.lengthSqr() > 0.001) {
            // arrow 메쉬의 로컬 forward가 화살촉 반대(깃털) 방향이라 180도 보정
            var horizLen = Math.sqrt(this._dir.x * this._dir.x + this._dir.z * this._dir.z);
            var yaw = Math.atan2(this._dir.x, this._dir.z) * 180 / Math.PI + 180;
            var pitch = Math.atan2(this._dir.y, horizLen) * 180 / Math.PI;
            this.node.setRotationFromEuler(pitch, yaw, 0);
          }
        };
        _proto._destroySelf = function _destroySelf() {
          this.node.destroy();
        };
        _proto.update = function update(dt) {
          var _this$_target;
          this._timer += dt;
          if (this._timer > 4) {
            this._destroySelf();
            return;
          }
          if ((_this$_target = this._target) != null && _this$_target.isValid) {
            Vec3.subtract(this._tmp, this._target.worldPosition, this.node.worldPosition);
            var dist = this._tmp.length();
            if (dist < 0.6) {
              var _this$_target$getComp;
              (_this$_target$getComp = this._target.getComponent(Monster)) == null || _this$_target$getComp.takeDamage(this._dmg, this._dir);
              this._spawnHitEffect(this.node.worldPosition, this._dir);
              this._destroySelf();
              return;
            }
            this._tmp.normalize();
            this._dir.set(this._tmp);
          }
          var p = this.node.worldPosition;
          this.node.setWorldPosition(p.x + this._dir.x * this._speed * dt, p.y + this._dir.y * this._speed * dt, p.z + this._dir.z * this._speed * dt);
          this._updateRotation();
        };
        return Bullet;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CameraFollow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Vec3, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "4fd77EjZNtI1oeRfn4BooQm", "CameraFollow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 카메라와 target(플레이어) 사이의 현재 오프셋을 유지한 채로 target을 따라간다 */
      var CameraFollow = exports('CameraFollow', (_dec = ccclass('CameraFollow'), _dec2 = property(Node), _dec3 = property({
        displayName: '부드러운 추적',
        tooltip: '켜면 부드럽게 보간, 끄면 즉시 스냅'
      }), _dec4 = property({
        displayName: '추적 속도',
        tooltip: 'smooth가 켜졌을 때 초당 보간 비율. 클수록 빠르게 따라붙음'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CameraFollow, _Component);
        function CameraFollow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "target", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "smooth", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "followSpeed", _descriptor3, _assertThisInitialized(_this));
          _this._offset = new Vec3();
          _this._desired = new Vec3();
          return _this;
        }
        var _proto = CameraFollow.prototype;
        _proto.start = function start() {
          if (!this.target) return;

          // 카메라가 바라보는 방향(고정, 회전 안 함)을 구해서 target이 그 시선의
          // 정중앙(=화면 중앙)에 오도록 오프셋을 계산한다. 높이차는 현재 배치된
          // 카메라 높이를 그대로 유지 — 즉 줌/구도는 그대로 두고 위치만 광선 위로 맞춘다.
          var forward = new Vec3();
          Vec3.transformQuat(forward, Vec3.FORWARD, this.node.worldRotation);
          var heightOffset = this.node.worldPosition.y - this.target.worldPosition.y;
          var k = heightOffset / -forward.y;
          Vec3.multiplyScalar(this._offset, forward, -k);
        };
        _proto.lateUpdate = function lateUpdate(dt) {
          if (!this.target) return;
          Vec3.add(this._desired, this.target.worldPosition, this._offset);
          if (this.smooth) {
            var t = 1 - Math.exp(-this.followSpeed * dt);
            Vec3.lerp(this._desired, this.node.worldPosition, this._desired, t);
          }
          this.node.setWorldPosition(this._desired);
        };
        return CameraFollow;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "smooth", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followSpeed", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Coin.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Quat, Vec3, NodeSpace, Component, CoinEvents, CoinEventName;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Quat = module.Quat;
      Vec3 = module.Vec3;
      NodeSpace = module.NodeSpace;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "b1171RFlHNFvLMAFmV1mN6p", "Coin", undefined);
      var ccclass = _decorator.ccclass;

      /**
       * CoinPool이 activate() 시 넘겨주는 동작 튜닝 값 묶음. 코인은 런타임에 addComponent()로
       * 붙기 때문에 이 컴포넌트 자체엔 인스펙터에 남는 프로퍼티가 없다 — 실제 조정은 항상
       * CoinPool 쪽 인스펙터에서 한다.
       */

      /**
       * 드롭된 코인 하나의 동작. 애니메이션 클립 없이 update()에서 코드로만 처리한다.
       *
       * 1. pop: 스폰 지점에서 scale 0 → 1로 커지며, 랜덤한 수평 방향으로 살짝 스캐터된 착지
       *    지점까지 포물선(이차 베지어 호 — 실제 중력처럼 위로 솟았다가 떨어짐)을 그리며 낙하한다.
       *    이 동안은 자석 반경의 영향을 받지 않는다. 착지 순간 groundY/groundRotationX로 자세를 고정한다.
       * 2. idle: 착지 후 제자리 통통 튐. 플레이어와의 자석 반경 진입을 감시한다.
       * 3. collecting: 진입 즉시 CoinStack에 다음 빈 슬롯을 예약해두고, 캐릭터가 아니라 그 슬롯의
       *    (매 프레임 갱신되는) 월드 좌표를 향해 끌려간다. 직선이 아니라 남은 거리에 비례해서
       *    매 프레임 조금씩 다가가는 지수 감쇠 방식으로 이동해 "처음엔 빠르고 도착할수록 느려지는"
       *    느낌을 내고, 그 위에 위로 볼록한 곡선(포물선) 오프셋을 더해 곡선 궤적을 그린다.
       *    도달하면 CoinCollected를 emit하고 풀로 반환된다 — CoinStack이 그 이벤트를 받아
       *    같은 자리에 실제 스택 비주얼을 세운다.
       */
      var Coin = exports('Coin', (_dec = ccclass('Coin'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Coin, _Component);
        function Coin() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._pool = null;
          _this._target = null;
          _this._stack = null;
          _this._tuning = void 0;
          _this._phase = 'idle';
          _this._magnetRadiusSq = 0;
          _this._baseY = 0;
          _this._bobPhase = 0;
          _this._spinDelta = new Quat();
          _this._stackSlot = -1;
          _this._chaseTarget = new Vec3();
          _this._chaseDir = new Vec3();
          _this._collectPos = new Vec3();
          // 곡선 오프셋을 뺀 순수 추적 위치 (렌더링용 실제 위치와 분리)
          _this._collectInitialDist = 0.0001;
          // 수집 시작 시점의 거리 — 곡선 진행도 계산용
          _this._popTimer = 0;
          _this._popStartPos = new Vec3();
          // 스폰 시작 지점
          _this._popGroundPos = new Vec3();
          return _this;
        }
        var _proto = Coin.prototype;
        // 착지 지점 (스캐터 오프셋 적용된 XZ)
        /** CoinPool이 풀에서 꺼내 스폰할 때 호출. stack은 없어도(null) 동작하되, 그 경우 플레이어 위치로 수집된다 */
        _proto.activate = function activate(pos, target, magnetRadius, pool, tuning, stack) {
          this._target = target;
          this._stack = stack;
          this._stackSlot = -1;
          this._magnetRadiusSq = magnetRadius * magnetRadius;
          this._pool = pool;
          this._tuning = tuning;
          this._bobPhase = Math.random() * Math.PI * 2;

          // 위로만 튀지 않고 랜덤한 수평 방향/거리로도 스캐터 (popScatterFactor로 정도 조절)
          var angle = Math.random() * Math.PI * 2;
          var dist = Math.random() * tuning.popScatterFactor;
          this._popStartPos.set(pos);
          this._popGroundPos.set(pos.x + Math.cos(angle) * dist, pos.y, pos.z + Math.sin(angle) * dist);
          this.node.setWorldPosition(this._popStartPos);
          this.node.setScale(0, 0, 0);
          this.node.setRotationFromEuler(0, Math.random() * 360, 0);
          this.node.active = true;
          this._phase = 'pop';
          this._popTimer = 0;
          CoinEvents.emit(CoinEventName.CoinSpawned, this);
        };
        _proto.update = function update(dt) {
          // 자전은 모든 단계에서 항상 재생. WORLD 공간 기준으로 돌려야 착지 후 눕혀진(X=-90)
          // 상태에서도 로컬축이 뒤틀리지 않고 계속 수직축(월드 Y) 기준으로 자연스럽게 회전한다.
          Quat.fromAxisAngle(this._spinDelta, Vec3.UP, this._tuning.spinSpeed * dt * Math.PI / 180);
          this.node.rotate(this._spinDelta, NodeSpace.WORLD);
          if (this._phase === 'pop') {
            this._updatePop(dt);
            return;
          }
          if (!this._target || !this._target.isValid) return;
          if (this._phase === 'idle') {
            // 대기: 통통 튐 + 자석 반경 진입 체크 (착지 전에는 이 분기 자체를 안 탐)
            this._bobPhase += dt * this._tuning.bobSpeed;
            var p = this.node.worldPosition;
            this.node.setWorldPosition(p.x, this._baseY + Math.sin(this._bobPhase) * this._tuning.bobHeight, p.z);
            if (Vec3.squaredDistance(this.node.worldPosition, this._target.worldPosition) <= this._magnetRadiusSq) {
              var _this$_stack$reserveS, _this$_stack;
              this._phase = 'collecting';
              this._stackSlot = (_this$_stack$reserveS = (_this$_stack = this._stack) == null ? void 0 : _this$_stack.reserveSlot()) != null ? _this$_stack$reserveS : -1;
              this._collectPos.set(this.node.worldPosition);
              this._resolveChaseTarget();
              this._collectInitialDist = Math.max(0.0001, Vec3.distance(this._collectPos, this._chaseTarget));
            }
            return;
          }

          // collecting: 플레이어가 아니라 예약된 코인 탑의 다음 자리(있다면)를 향해 이동.
          // "순수 추적 위치(_collectPos)"는 곡선 오프셋 없이 목표를 향해 다가가고(남은 거리에
          // 비례하는 속도 + 최소 속도 하한 중 큰 쪽을 사용 — 비례 속도만 쓰면 목표 자체가 계속
          // 움직일 때 결코 따라잡지 못하고 일정 거리 뒤에서 붕 뜬 채로 남는 문제가 있었다),
          // 실제로 화면에 그리는 위치에만 위로 볼록한 포물선 오프셋을 더해 곡선처럼 보이게 한다.
          this._resolveChaseTarget();
          var dist = Vec3.distance(this._collectPos, this._chaseTarget);
          if (dist <= this._tuning.collectArriveDist) {
            this._onCollected();
            return;
          }
          var speed = Math.max(dist * this._tuning.collectEaseRate, this._tuning.collectMinSpeed);
          var step = Math.min(dist, speed * dt); // 목표를 지나치지 않도록 남은 거리로 클램프
          Vec3.subtract(this._chaseDir, this._chaseTarget, this._collectPos);
          Vec3.normalize(this._chaseDir, this._chaseDir);
          Vec3.scaleAndAdd(this._collectPos, this._collectPos, this._chaseDir, step);
          var progress = 1 - Math.min(1, dist / this._collectInitialDist);
          var arc = 4 * this._tuning.collectArcHeight * progress * (1 - progress);
          this.node.setWorldPosition(this._collectPos.x, this._collectPos.y + arc, this._collectPos.z);
        }

        /** 예약된 코인 탑 슬롯이 있으면 그 슬롯의 실시간 월드 좌표를, 없으면 플레이어 위치를 _chaseTarget에 채운다 */;
        _proto._resolveChaseTarget = function _resolveChaseTarget() {
          if (this._stack && this._stackSlot >= 0) {
            this._stack.getSlotWorldPosition(this._stackSlot, this._chaseTarget);
          } else {
            Vec3.copy(this._chaseTarget, this._target.worldPosition);
          }
        };
        _proto._updatePop = function _updatePop(dt) {
          this._popTimer += dt;
          var dur = Math.max(0.0001, this._tuning.popDuration);
          var t = Math.min(1, this._popTimer / dur);

          // 스케일: 0 → 1, ease-out(초반에 빠르게 팝) — t=1에서 정확히 1.0
          var s = 1 - Math.pow(1 - t, 3);
          this.node.setScale(s, s, s);

          // XZ: 시작점 → 착지점 선형 보간. Y: 대칭 이차 베지어(=포물선) 호로 t=0.5에서 popHeight만큼
          // 솟았다가 다시 떨어짐 — 등속이 아니라 실제 중력처럼 위에서 느려지고 아래서 빨라짐.
          var x = this._popStartPos.x + (this._popGroundPos.x - this._popStartPos.x) * t;
          var z = this._popStartPos.z + (this._popGroundPos.z - this._popStartPos.z) * t;
          var arc = 4 * this._tuning.popHeight * t * (1 - t);
          this.node.setWorldPosition(x, this._popStartPos.y + arc, z);
          if (t >= 1) {
            this._phase = 'idle';
            this._baseY = this._tuning.groundY;
            // 착지 순간 최종 자세 고정: 두께 보정된 groundY + 눕혀진 X 회전.
            // 자전으로 쌓여있던 Y축 헤딩(euler.y)은 그대로 유지해 부자연스러운 스냅이 없게 한다.
            this.node.setWorldPosition(x, this._tuning.groundY, z);
            var heading = this.node.eulerAngles.y;
            this.node.setRotationFromEuler(this._tuning.groundRotationX, heading, 0);
          }
        };
        _proto._onCollected = function _onCollected() {
          var _this$_pool;
          CoinEvents.emit(CoinEventName.CoinCollected, this);
          this._target = null;
          this._stack = null;
          (_this$_pool = this._pool) == null || _this$_pool.despawn(this.node);
        };
        return Coin;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinCounterUI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts', './CoinStack.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Label, Component, CoinEvents, CoinEventName, CoinStack;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }, function (module) {
      CoinStack = module.CoinStack;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "0a47f5sL7FE65v+E2PYcZEw", "CoinCounterUI", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 화면 상단의 "보유 코인 개수" 표시. CoinStack.StackChanged를 구독해 등에 쌓인 코인
       * 개수를 그대로 보여준다 — 코인을 얻으면(등에 추가) 늘고, 소켓이 소비하면(등에서 제거) 준다.
       */
      var CoinCounterUI = exports('CoinCounterUI', (_dec = ccclass('CoinCounterUI'), _dec2 = property(Label), _dec3 = property(CoinStack), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CoinCounterUI, _Component);
        function CoinCounterUI() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "countLabel", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinStack", _descriptor2, _assertThisInitialized(_this));
          _this._onStackChanged = function (count) {
            return _this._refresh(count);
          };
          return _this;
        }
        var _proto = CoinCounterUI.prototype;
        _proto.onLoad = function onLoad() {
          CoinEvents.on(CoinEventName.StackChanged, this._onStackChanged, this);
        };
        _proto.start = function start() {
          if (this.coinStack) this._refresh(this.coinStack.count);
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.StackChanged, this._onStackChanged, this);
        };
        _proto._refresh = function _refresh(count) {
          if (this.countLabel) this.countLabel.string = "" + count;
        };
        return CoinCounterUI;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "countLabel", [_dec2], {
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
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinEvents.ts", ['cc'], function (exports) {
  var cclegacy, EventTarget;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      EventTarget = module.EventTarget;
    }],
    execute: function () {
      cclegacy._RF.push({}, "7536d0unptJ2YAtRI7jlre0", "CoinEvents", undefined);

      /**
       * 코인 경제 시스템 전역 이벤트 버스. 몬스터 처치 → 코인 스폰 → 수집 → 스택의 각 단계를
       * 이 버스로만 느슨하게 연결한다 (단계별 컴포넌트가 서로를 직접 참조하지 않는다).
       */
      var CoinEvents = exports('CoinEvents', new EventTarget());

      /** 이벤트 이름 상수. 페이로드는 각 항목의 주석 참고. */
      var CoinEventName = exports('CoinEventName', {
        /** payload: (pos: Vec3, coinDrop: number) — 몬스터 사망 지점과 드롭할 코인 개수(Monster.coinDrop,
         * RushGroup에서 몬스터별로 설정 — 보스는 여러 개, 잡몹은 기본 1개). MonsterSpawner의 기존
         * onDied 콜백에서 emit (Monster.ts 원본은 미수정) */
        MonsterKilled: 'coin-economy:monster-killed',
        /** payload: (coin: Coin) — 코인 1개가 스폰되어 자석 추적을 시작함 */
        CoinSpawned: 'coin-economy:coin-spawned',
        /** payload: (coin: Coin) — 코인이 캐릭터에게 도달해 수집됨 (드롭 코인은 이 시점에 풀로 반환) */
        CoinCollected: 'coin-economy:coin-collected',
        /** payload: (count: number) — 등에 쌓인 코인 스택 개수 변경 */
        StackChanged: 'coin-economy:stack-changed',
        // ── 미구현 스텁. 0단계 범위에서는 emit/on 어느 쪽도 구현하지 않는다.
        /** (미구현 스텁) 캐릭터가 소켓 유효 반경에 진입 */
        SocketReached: 'coin-economy:socket-reached',
        /** payload: (socket: Socket) — 소켓이 코인 한 개를 스택에서 흡수(도착 완료)함. Socket.ts가 매 코인 착지 시 emit */
        SocketAbsorbed: 'coin-economy:socket-absorbed',
        /** payload: (triggerId: TriggerId) — 소켓 목록에서 "건물 트리거"로 표시된 소켓이 요구치를
         * 다 채웠음. Socket.ts의 _completeFulfillment()에서 emit. BuildingTrigger.ts가 같은
         * triggerId를 가진 건물에서 이 이벤트를 구독해 건설 애니메이션을 재생한다. */
        SocketFilled: 'coin-economy:socket-filled',
        /** payload 없음 — UnitSocketManager의 유닛 생산 소켓이 지정된 개수만큼(기본 3개, 0~2번)
         * 순서대로 완료됐음. UnitSocketManager.ts가 딱 한 번만 emit한다. SocketManager.ts가 이
         * 이벤트를 구독해서 그때부터 건물 건축 소켓을 스폰하기 시작하고, BossRushManager.ts도
         * 구독해서 이 시점에 등록된 러쉬(추가 웨이브 단계 + 보스)를 시작시킨다. */
        BuildingSocketsUnlocked: 'coin-economy:building-sockets-unlocked'
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinPool.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Coin.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Prefab, instantiate, Component, Coin;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      Coin = module.Coin;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
      cclegacy._RF.push({}, "00d06B7uStLyaNlFmvTWUYj", "CoinPool", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 드롭 코인 오브젝트 풀. 몬스터 처치 지점마다 스폰 요청이 들어오면 재사용 가능한 코인
       * 노드를 꺼내주고, 수집이 끝나면 다시 반환받아 비활성 상태로 보관한다.
       *
       * 코인은 런타임에 addComponent(Coin)으로 붙기 때문에 Coin.ts 자체엔 씬에 저장되는
       * 인스펙터 값이 없다 — 코인의 모든 동작 수치(자전/튐/팝 연출/자석 이동)는 여기 CoinPool
       * 인스펙터에서 조정하고, spawn 시점에 Coin에게 그대로 전달한다.
       */
      var CoinPool = exports('CoinPool', (_dec = ccclass('CoinPool'), _dec2 = property({
        type: Prefab,
        displayName: '코인 프리팹',
        tooltip: 'coin.glb의 자동 생성 프리팹(정적 메쉬, 애니메이션 클립 없음)'
      }), _dec3 = property({
        displayName: '초기 풀 크기'
      }), _dec4 = property({
        displayName: '팝 최고 높이(m)',
        tooltip: '스폰 시 튀어오르는 최고 높이'
      }), _dec5 = property({
        displayName: '팝 지속시간(초)',
        tooltip: '스폰~착지까지 걸리는 시간. 이 동안은 자석 반경의 영향을 받지 않음'
      }), _dec6 = property({
        displayName: '팝 랜덤 스캐터 반경(m)',
        tooltip: '착지 지점이 랜덤한 수평 방향으로 퍼지는 최대 거리. 0이면 제자리에서 위로만 튐'
      }), _dec7 = property({
        displayName: '착지 Y 위치(m)',
        tooltip: '코인 두께 때문에 지면(y=0)에 파묻혀 보이지 않도록 살짝 띄운 높이'
      }), _dec8 = property({
        displayName: '착지 시 X 회전(도)',
        tooltip: '코인 메쉬가 세워진 채로 임포트되어, 바닥에 눕히려면 -90'
      }), _dec9 = property({
        displayName: '자전 속도(deg/s)'
      }), _dec10 = property({
        displayName: '대기 중 상하 진폭(m)'
      }), _dec11 = property({
        displayName: '대기 중 상하 진동 속도'
      }), _dec12 = property({
        displayName: '수집 속도 계수',
        tooltip: '남은 거리를 초당 얼마나 좁히는지에 대한 계수. 클수록 빠르게 수렴함 — 거리 비례로 움직이므로 처음엔 빠르고 도착할수록 자연히 느려짐(고정 속도가 아님)'
      }), _dec13 = property({
        displayName: '최소 수집 속도(m/s)',
        tooltip: '거리 비례 속도의 하한선. 캐릭터의 최대 이동 속도보다 반드시 커야 한다 — 그렇지 않으면 캐릭터가 계속 이동할 때 코인이 등 뒤 자리를 영원히 따라잡지 못하고 붕 뜬 채로 남는다'
      }), _dec14 = property({
        displayName: '수집 곡선 높이(m)',
        tooltip: '자석에 끌려 등 위 자리로 갈 때 위로 볼록하게 그리는 곡선의 높이. 0이면 직선 이동'
      }), _dec15 = property({
        displayName: '수집 완료 판정 거리(m)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CoinPool, _Component);
        function CoinPool() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "coinPrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "initialSize", _descriptor2, _assertThisInitialized(_this));
          // ── 팝(스폰 연출) ────────────────────────────────────────────────────
          _initializerDefineProperty(_this, "popHeight", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "popDuration", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "popScatterFactor", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "groundY", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "groundRotationX", _descriptor7, _assertThisInitialized(_this));
          // ── 대기 중 비주얼 ───────────────────────────────────────────────────
          _initializerDefineProperty(_this, "spinSpeed", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "bobHeight", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "bobSpeed", _descriptor10, _assertThisInitialized(_this));
          // ── 자석 수집 ────────────────────────────────────────────────────────
          _initializerDefineProperty(_this, "collectEaseRate", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "collectMinSpeed", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "collectArcHeight", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "collectArriveDist", _descriptor14, _assertThisInitialized(_this));
          _this._pool = [];
          return _this;
        }
        var _proto = CoinPool.prototype;
        _proto.onLoad = function onLoad() {
          if (!this.coinPrefab) return;
          for (var i = 0; i < this.initialSize; i++) this._pool.push(this._createInstance());
        };
        _proto._createInstance = function _createInstance() {
          var node = instantiate(this.coinPrefab);
          node.active = false;
          this.node.addChild(node);
          if (!node.getComponent(Coin)) node.addComponent(Coin);
          return node;
        };
        _proto._tuning = function _tuning() {
          return {
            spinSpeed: this.spinSpeed,
            bobHeight: this.bobHeight,
            bobSpeed: this.bobSpeed,
            collectEaseRate: this.collectEaseRate,
            collectMinSpeed: this.collectMinSpeed,
            collectArcHeight: this.collectArcHeight,
            collectArriveDist: this.collectArriveDist,
            popHeight: this.popHeight,
            popDuration: this.popDuration,
            popScatterFactor: this.popScatterFactor,
            groundY: this.groundY,
            groundRotationX: this.groundRotationX
          };
        }

        /**
         * 코인 하나를 꺼내 pos 위치에서 팝(스폰 연출) 후 target을 향한 자석 추적을 시작시킨다.
         * stack을 넘기면 자석에 걸렸을 때 캐릭터가 아니라 그 스택의 다음 빈 자리로 끌려간다.
         */;
        _proto.spawn = function spawn(pos, target, magnetRadius, stack) {
          var _this$_pool$pop;
          if (stack === void 0) {
            stack = null;
          }
          var node = (_this$_pool$pop = this._pool.pop()) != null ? _this$_pool$pop : this._createInstance();
          node.getComponent(Coin).activate(pos, target, magnetRadius, this, this._tuning(), stack);
          return node;
        }

        /** Coin.ts가 수집 완료 시 호출 — 풀로 반환 */;
        _proto.despawn = function despawn(node) {
          node.active = false;
          this._pool.push(node);
        };
        return CoinPool;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "coinPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "initialSize", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 16;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "popHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "popDuration", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "popScatterFactor", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "groundY", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.07;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "groundRotationX", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return -90;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "spinSpeed", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 180;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "bobHeight", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.12;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "bobSpeed", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "collectEaseRate", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 6;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "collectMinSpeed", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "collectArcHeight", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "collectArriveDist", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.35;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinSpawnController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts', './CoinPool.ts', './CoinStack.ts', './Player.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Component, CoinEvents, CoinEventName, CoinPool, CoinStack, Player;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }, function (module) {
      CoinPool = module.CoinPool;
    }, function (module) {
      CoinStack = module.CoinStack;
    }, function (module) {
      Player = module.Player;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "b22334SNkpByIKCPgjv8Z9Z", "CoinSpawnController", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * MonsterKilled 이벤트를 구독해 코인 1개를 드롭시킨다. 자석 반경은 플레이어의 실제
       * attackRange 값을 참조해 "공격 사거리보다 살짝 짧게" 계산한다 (0단계 컨텍스트 문서 규칙).
       * 정확한 계수는 아직 미확정이라 인스펙터에서 바로 튜닝할 수 있게 노출해둔다.
       */
      var CoinSpawnController = exports('CoinSpawnController', (_dec = ccclass('CoinSpawnController'), _dec2 = property({
        type: CoinPool,
        displayName: '코인 풀'
      }), _dec3 = property({
        type: Node,
        displayName: '플레이어 노드',
        tooltip: '자석 이동 대상 + attackRange 참조용'
      }), _dec4 = property({
        displayName: '자석 반경 계수',
        tooltip: 'magnetRadius = player.attackRange * 이 값 (1보다 작으면 공격 사거리보다 짧음)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CoinSpawnController, _Component);
        function CoinSpawnController() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "coinPool", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "playerNode", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "magnetRadiusRatio", _descriptor3, _assertThisInitialized(_this));
          _this._player = null;
          _this._stack = null;
          _this._onMonsterKilled = function (pos, count) {
            if (count === void 0) {
              count = 1;
            }
            return _this._spawnCoin(pos, count);
          };
          return _this;
        }
        var _proto = CoinSpawnController.prototype;
        _proto.onLoad = function onLoad() {
          if (this.playerNode) {
            this._player = this.playerNode.getComponent(Player);
            this._stack = this.playerNode.getComponent(CoinStack);
          }
          CoinEvents.on(CoinEventName.MonsterKilled, this._onMonsterKilled);
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.MonsterKilled, this._onMonsterKilled);
        };
        _proto._spawnCoin = function _spawnCoin(pos, count) {
          if (!this.coinPool || !this.playerNode || !this._player) return;
          var magnetRadius = this._player.attackRange * this.magnetRadiusRatio;
          for (var i = 0; i < count; i++) {
            this.coinPool.spawn(pos, this.playerNode, magnetRadius, this._stack);
          }
        };
        return CoinSpawnController;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "coinPool", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "magnetRadiusRatio", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinStack.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinEvents.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, Prefab, Vec3, instantiate, Component, CoinEvents, CoinEventName;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "dfd235dzjdFor+oBpLuh5qf", "CoinStack", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 캐릭터 등 뒤에 무제한(캡 없음)으로 쌓이는 코인 스택 비주얼. CoinCollected를 구독해
       * 코인을 하나씩 추가하고, 소켓이 popTop()으로 맨 위 코인부터 하나씩 빼갈 수 있다.
       */
      var CoinStack = exports('CoinStack', (_dec = ccclass('CoinStack'), _dec2 = property({
        type: Prefab,
        displayName: '스택 코인 프리팹',
        tooltip: '등에 쌓일 때 보여줄 정적 코인 비주얼 (로직 컴포넌트 없는 순수 표시용 인스턴스)'
      }), _dec3 = property({
        displayName: '코인 간 간격(m)',
        tooltip: '쌓일 때 위로 쌓는 간격'
      }), _dec4 = property({
        displayName: '스택 시작 로컬 오프셋',
        tooltip: '캐릭터 노드 기준 등 뒤 로컬 위치'
      }), _dec5 = property({
        displayName: '스택 코인 회전(Euler)',
        tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 등에 눕혀 쌓으려면 X를 -90으로 돌려야 함'
      }), _dec6 = property({
        displayName: '시작 보유 코인 개수',
        tooltip: '게임 시작 시 몬스터를 잡지 않아도 이미 등에 쌓여있는 코인 개수 (소켓 트리거 부트스트랩용)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CoinStack, _Component);
        function CoinStack() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "stackCoinPrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "stackSpacing", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "stackOrigin", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "stackRotation", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "initialCoins", _descriptor5, _assertThisInitialized(_this));
          _this._stack = [];
          _this._reservedCount = 0;
          _this._onCoinCollected = function () {
            return _this._addOne();
          };
          return _this;
        }
        var _proto = CoinStack.prototype;
        _proto.onLoad = function onLoad() {
          CoinEvents.on(CoinEventName.CoinCollected, this._onCoinCollected);
        };
        _proto.start = function start() {
          for (var i = 0; i < this.initialCoins; i++) this._addOne();
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.CoinCollected, this._onCoinCollected);
        }

        /** 현재 쌓인 코인 개수. 다음 단계(소켓 흡수)에서 이 스택을 앞에서부터 소비할 예정 */;
        /**
         * 자석에 걸린 코인이 수집을 시작할 때 호출 — 아직 비어있는 다음 슬롯 하나를 예약해서
         * 인덱스를 돌려준다. 동시에 여러 코인이 날아오는 중에도 서로 다른 슬롯을 향하게 하기 위해
         * 실제로 쌓이는 시점(_addOne)이 아니라 예약 시점에 즉시 증가시킨다.
         */
        _proto.reserveSlot = function reserveSlot() {
          return this._reservedCount++;
        }

        /** 예약된 슬롯의 현재 월드 좌표를 계산한다 (캐릭터가 이동해도 매 프레임 다시 불러 추적) */;
        _proto.getSlotWorldPosition = function getSlotWorldPosition(index, out) {
          out.set(this.stackOrigin.x, this.stackOrigin.y + index * this.stackSpacing, this.stackOrigin.z);
          return Vec3.transformMat4(out, out, this.node.worldMatrix);
        };
        _proto._addOne = function _addOne() {
          if (!this.stackCoinPrefab) return;
          var node = instantiate(this.stackCoinPrefab);
          this.node.addChild(node);
          node.setPosition(this.stackOrigin.x, this.stackOrigin.y + this._stack.length * this.stackSpacing, this.stackOrigin.z);
          node.setRotationFromEuler(this.stackRotation.x, this.stackRotation.y, this.stackRotation.z);
          this._stack.push(node);
          CoinEvents.emit(CoinEventName.StackChanged, this._stack.length);
        }

        /**
         * 소켓이 코인을 하나씩 순차적으로 흡수할 때 호출. 가장 최근에 쌓인(맨 위) 코인 노드를
         * 스택에서 분리해 그대로 반환한다(destroy하지 않음 — 호출측이 소켓으로 날아가는
         * 연출에 그 실제 코인 노드를 재사용함). 스택이 비어있으면 null.
         */;
        _proto.popTop = function popTop() {
          var _this$_stack$pop;
          var node = (_this$_stack$pop = this._stack.pop()) != null ? _this$_stack$pop : null;
          if (node) {
            this._reservedCount = this._stack.length; // 진행 중인 예약도 현재 스택 크기에 맞춰 재동기화
            CoinEvents.emit(CoinEventName.StackChanged, this._stack.length);
          }
          return node;
        };
        _createClass(CoinStack, [{
          key: "count",
          get: function get() {
            return this._stack.length;
          }
        }]);
        return CoinStack;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "stackCoinPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "stackSpacing", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.08;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "stackOrigin", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Vec3(0, 1.0, -0.4);
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "stackRotation", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Vec3(-90, 0, 0);
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "initialCoins", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 6;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DoorAutoOpen.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Player.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, AnimationClip, SkeletalAnimation, Vec3, Component, Player;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      AnimationClip = module.AnimationClip;
      SkeletalAnimation = module.SkeletalAnimation;
      Vec3 = module.Vec3;
      Component = module.Component;
    }, function (module) {
      Player = module.Player;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _class3;
      cclegacy._RF.push({}, "d1656xccJZDdKwBeTQ7Cp2D", "DoorAutoOpen", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 플레이어가 가까이 오면 클립을 정방향, 멀어지면 역방향으로 재생해서 문을 자동으로
       * 여닫는다. Door2처럼 컬리전 없이 통과 가능한 문에 사용 — 별도의 "닫힘" 클립 없이
       * 하나의 클립(예: open)을 앞/뒤로만 재생해서 열림·닫힘을 표현한다.
       *
       * closeDistance를 openDistance보다 크게 둬서(히스테리시스), 경계선에 걸쳐 서성일 때
       * 매 프레임 여닫힘이 떨리는 걸 막는다.
       */
      var DoorAutoOpen = exports('DoorAutoOpen', (_dec = ccclass('DoorAutoOpen'), _dec2 = property({
        type: AnimationClip,
        displayName: '문 열림 클립',
        tooltip: '정방향 재생=열림, 역방향 재생=닫힘으로 사용할 클립 (예: open). Animation/SkeletalAnimation의 clips 목록에 이미 등록되어 있어야 한다'
      }), _dec3 = property({
        displayName: '열림 거리(m)',
        tooltip: '플레이어가 이 거리 안으로 들어오면 문이 열린다'
      }), _dec4 = property({
        displayName: '닫힘 거리(m)',
        tooltip: '플레이어가 이 거리 밖으로 나가면 문이 닫힌다 — 열림 거리와 같거나 비슷하게 둬도 된다. 실제 판정에는 최소 MIN_HYSTERESIS_GAP만큼의 여유가 항상 자동으로 더해지므로(경계선에서 매 프레임 열림/닫힘이 번갈아 떨리는 걸 막기 위해) 여기 적은 값 그대로 쓰이지 않을 수 있다'
      }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DoorAutoOpen, _Component);
        function DoorAutoOpen() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "clipOpen", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "openDistance", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "closeDistance", _descriptor3, _assertThisInitialized(_this));
          /** BuildingTrigger가 이 문의 건설(appear) 애니메이션을 다 재생한 뒤에만 true로 켠다.
           * 그 전까지 update()가 완전히 아무 것도 하지 않는다 — 문이 아직 안 지어져 메쉬가 숨겨진
           * 동안에도 이 스크립트는 계속 살아있어서(onLoad/start는 씬 시작과 함께 돈다), 플레이어가
           * 우연히 근처에 있으면 "open" 상태를 미리 재생해버릴 수 있었다. 그 상태로 있다가
           * BuildingTrigger가 별도의 "appear" 클립을 재생하면 같은 뼈대를 두 애니메이션 상태가
           * 동시에 건드리게 되어, 문이 등장하는 순간 두 포즈가 뒤섞이며 잠깐 튀는 것처럼 보였다. */
          _this.active = false;
          _this._anim = null;
          _this._isOpen = false;
          return _this;
        }
        var _proto = DoorAutoOpen.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(SkeletalAnimation)) != null ? _this$getComponent : this.getComponentInChildren(SkeletalAnimation);
        }

        /** BuildingTrigger가 appear 재생 시간만큼 지연시킨 뒤 호출 — TowerAttack.combatEnabled와
         * 동일한 패턴. 이 시점부터 비로소 open 상태를 건드리기 시작한다. */;
        _proto.activate = function activate() {
          this.active = true;
        }

        /** onLoad()가 아니라 start()에서 처리한다 — SkeletalAnimation은 자신의 onLoad()에서 clips로부터
         * 애니메이션 상태(state)를 만드는데, 같은 노드라도 컴포넌트 실행 순서에 따라 DoorAutoOpen의
         * onLoad()가 그보다 먼저 돌 수 있어 getState()가 아직 null을 반환하는 경우가 있었다.
         * start()는 씬의 모든 onLoad()가 끝난 뒤에 실행되므로 이 시점엔 항상 state가 존재한다.
         *
         * wrapMode는 Loop로 둔다(반복 재생용이 아니라 자동 정지를 일부러 끄기 위해) — 엔진의
         * Normal(1회 재생) 모드는 "누적 재생 시간이 클립 길이를 넘었는가"로 정지를 판단하는데,
         * 역재생을 시작할 때 time을 클립 끝(duration)으로 강제로 옮겨두면 그 순간 이미 "한 바퀴
         * 다 돈 것"으로 계산되어 역재생이 시작되자마자 즉시 멈춰버리는 문제가 있었다(그래서 문이
         * 열린 채로 안 닫히는 것처럼 보였다). Loop는 repeatCount가 무한대라 이 오작동이 없고,
         * 정지 시점은 update()에서 직접 감시해서 처리한다. */;
        _proto.start = function start() {
          var state = this._getState();
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Loop;
          state.sample();
        };
        _proto.update = function update() {
          var _Player$instance;
          if (!this.active) return;
          var player = (_Player$instance = Player.instance) == null ? void 0 : _Player$instance.node;
          if (player && player.isValid) {
            var d = Vec3.distance(this.node.worldPosition, player.worldPosition);
            var effectiveCloseDistance = Math.max(this.closeDistance, this.openDistance + DoorAutoOpen.MIN_HYSTERESIS_GAP);
            if (!this._isOpen && d <= this.openDistance) {
              this._isOpen = true;
              this._setDirection(1);
            } else if (this._isOpen && d >= effectiveCloseDistance) {
              this._isOpen = false;
              this._setDirection(-1);
            }
          }

          // 끝에 도달했는지 직접 감시해서 정확히 그 지점에서 멈춘다(위 start()의 설명 참고).
          if (this.clipOpen) {
            var state = this._getState();
            if (state && state.isPlaying) {
              if (state.speed > 0 && state.time >= this.clipOpen.duration) {
                state.setTime(this.clipOpen.duration);
                state.sample();
                state.stop();
              } else if (state.speed < 0 && state.time <= 0) {
                state.setTime(0);
                state.sample();
                state.stop();
              }
            }
          }
        };
        _proto._getState = function _getState() {
          if (!this._anim || !this.clipOpen) return null;
          return this._anim.getState(this.clipOpen.name);
        }

        /** dir=1(열림)/-1(닫힘)로 재생 방향을 바꾼다. 이미 재생 중이면 방향만 바꿔서 현재
         * 진행 위치에서 자연스럽게 이어지고, 멈춰있었다면(완전히 열렸거나 최초 상태) 새로
         * play()하되 — play()는 항상 time을 0(클립 시작점)으로 되돌리는 엔진 동작이라,
         * 역방향으로 새로 시작하는 경우에만 시작 위치를 클립 끝으로 보정해준다. */;
        _proto._setDirection = function _setDirection(dir) {
          var state = this._getState();
          if (!state || !this.clipOpen) return;
          // 매번 확인 — Loop가 아니면(=start()가 아직 못 잡았으면) 여기서도 한 번 더 강제한다.
          if (state.wrapMode !== AnimationClip.WrapMode.Loop) state.wrapMode = AnimationClip.WrapMode.Loop;
          state.speed = dir;
          if (!state.isPlaying) {
            state.play();
            // play()는 항상 time을 0으로 되돌리므로, 역방향 시작은 클립 끝으로 다시 보정해야
            // 한다 — 그 직후 sample()까지 호출해 이번 프레임 바로 정확한 포즈를 반영한다.
            // (다음 프레임의 AnimationManager 갱신을 기다리지 않고 즉시 튐 없이 이어지게 함)
            state.setTime(dir < 0 ? this.clipOpen.duration : 0);
            state.sample();
          }
        };
        return DoorAutoOpen;
      }(Component), _class3.MIN_HYSTERESIS_GAP = 0.5, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "clipOpen", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "openDistance", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "closeDistance", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3.2;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FallingCoinVisual.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Quat, Vec3, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Quat = module.Quat;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "365e0gc0kBJHJll9iGduvyC", "FallingCoinVisual", undefined);
      var ccclass = _decorator.ccclass;

      /**
       * Socket이 activate() 시 넘겨주는 비행 연출 튜닝 값 묶음. 코인은 런타임에 addComponent()로
       * 붙기 때문에 이 컴포넌트 자체엔 인스펙터에 남는 프로퍼티가 없다 — 실제 조정은 항상
       * Socket 쪽 인스펙터(Socket.prefab)에서 한다.
       */

      /**
       * 소켓으로 코인 하나가 빨려들어가는 1회성 비주얼. 실제 스택에서 뽑힌 진짜 코인 노드에
       * 붙어서 재생되며, 소켓 도착 후 스스로 파괴된다.
       *
       * 1. flying: from → to로 가속 낙하(ease-in)하며, 동시에 몬스터 처치 시 코인이 튀어오르는
       *    것과 같은 포물선(위로 볼록)으로 살짝 튀어올랐다가 들어가고, 자신의 로컬 X축 기준
       *    한 바퀴(360도) 회전한다.
       * 2. pop: 도착 즉시 짧게 확대(peak)됐다가 0으로 줄어들며 소멸 — 흡수되는 손맛을 위한 펀치 스케일.
       */
      var FallingCoinVisual = exports('FallingCoinVisual', (_dec = ccclass('FallingCoinVisual'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FallingCoinVisual, _Component);
        function FallingCoinVisual() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._from = new Vec3();
          _this._to = new Vec3();
          _this._timer = 0;
          _this._tuning = void 0;
          _this._onLanded = null;
          _this._baseRot = new Quat();
          _this._curRot = new Quat();
          _this._baseScale = new Vec3(1, 1, 1);
          _this._phase = 'flying';
          _this._popTimer = 0;
          return _this;
        }
        var _proto = FallingCoinVisual.prototype;
        /** from → to로 tuning.flightDuration 동안 가속 낙하(ease-in)하며 포물선으로 튀어올랐다가
         * 들어가고, 로컬 X축 기준 한 바퀴 회전한다. onLanded는 도착(펀치 팝 시작) 시점에
         * 호출된다 — 예: 소켓의 "남은 코인 개수" 라벨 갱신용 */
        _proto.activate = function activate(from, to, tuning, onLanded) {
          this._from.set(from);
          this._to.set(to);
          this._tuning = tuning;
          this._timer = 0;
          this._onLanded = onLanded != null ? onLanded : null;
          this._phase = 'flying';
          this._popTimer = 0;
          this.node.setWorldPosition(from);
          this.node.getWorldRotation(this._baseRot);
          this._baseScale.set(this.node.scale);
        };
        _proto.update = function update(dt) {
          if (this._phase === 'pop') {
            this._updatePop(dt);
            return;
          }
          this._timer += dt;
          var dur = Math.max(0.0001, this._tuning.flightDuration);
          var t = Math.min(1, this._timer / dur);
          var eased = t * t; // ease-in: 처음엔 느리게, 도착할수록 빨라짐

          // 몬스터 처치 시 코인 팝과 같은 포물선(위로 볼록, t=0.5에서 최고점) — 실제 이동(eased)과는 별도로 얹는다
          var arc = 4 * this._tuning.flightArcHeight * t * (1 - t);
          this.node.setWorldPosition(this._from.x + (this._to.x - this._from.x) * eased, this._from.y + (this._to.y - this._from.y) * eased + arc, this._from.z + (this._to.z - this._from.z) * eased);

          // 로컬 X축 기준 한 바퀴(0~360도) 회전 — 위치와 달리 일정한 속도로 자연스럽게 돈다
          Quat.rotateAroundLocal(this._curRot, this._baseRot, Vec3.RIGHT, t * Math.PI * 2);
          this.node.setWorldRotation(this._curRot);
          if (t >= 1) {
            var _this$_onLanded;
            (_this$_onLanded = this._onLanded) == null || _this$_onLanded.call(this);
            this._phase = 'pop';
            this._popTimer = 0;
          }
        }

        /** 도착 순간 짧게 펀치 스케일: 0~50%는 원래 크기 → popPeakScale(ease-out),
         * 50~100%는 popPeakScale → 0(ease-in)으로 줄어들며 사라진다 */;
        _proto._updatePop = function _updatePop(dt) {
          this._popTimer += dt;
          var dur = Math.max(0.0001, this._tuning.popDuration);
          var t = Math.min(1, this._popTimer / dur);
          var factor;
          if (t < 0.5) {
            var k = t / 0.5;
            factor = 1 + (this._tuning.popPeakScale - 1) * (1 - (1 - k) * (1 - k));
          } else {
            var _k = (t - 0.5) / 0.5;
            factor = this._tuning.popPeakScale * (1 - _k * _k);
          }
          this.node.setScale(this._baseScale.x * factor, this._baseScale.y * factor, this._baseScale.z * factor);
          if (t >= 1) this.node.destroy();
        };
        return FallingCoinVisual;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FollowerFormation.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './env'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Material, Vec3, Node, utils, primitives, MeshRenderer, Component, EDITOR_NOT_IN_PREVIEW;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Material = module.Material;
      Vec3 = module.Vec3;
      Node = module.Node;
      utils = module.utils;
      primitives = module.primitives;
      MeshRenderer = module.MeshRenderer;
      Component = module.Component;
    }, function (module) {
      EDITOR_NOT_IN_PREVIEW = module.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "c60788n5b5KtpVq3wpRHtPS", "FollowerFormation", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property,
        executeInEditMode = _decorator.executeInEditMode;
      var DEBUG_CONTAINER_NAME = '__FollowerDebug__';
      var MARKER_SIZE = 0.25; // 디버그 박스 한 변 길이(m)

      /**
       * 추종 캐릭터들이 설 수 있는 고정 슬롯들을 정의한다. MapBounds.vertices와 같은 방식으로,
       * 슬롯 하나하나가 이 노드(플레이어)의 자식 노드로 존재하고("Slot0", "Slot1", ... 이름 순서로
       * 자동 인식) 씬 뷰에서 각 자식 노드를 직접 드래그해 원하는 대형(격자든 V자든 무엇이든)을
       * 자유롭게 잡을 수 있다. 이름의 숫자 순서가 곧 배정 우선순위(추종자가 하나씩 늘어날 때
       * 먼저 채워지는 순서)다.
       *
       * 슬롯 노드 자체는 빈 노드라 씬 뷰에서 눈에 띄지 않으므로, showDebugMarkers를 켜두면
       * 각 슬롯 위치에 작은 박스를 그려 한눈에 배치를 확인하며 드래그할 수 있게 해준다
       * (MapBounds의 showDebugOutline과 동일한 원리) — Play/빌드 중에는 항상 자동으로 숨겨진다.
       */
      var FollowerFormation = exports('FollowerFormation', (_dec = ccclass('FollowerFormation'), _dec2 = property({
        displayName: '슬롯 마커 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 각 슬롯 위치에 작은 박스를 그려 눈으로 바로 확인/드래그할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec3 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FollowerFormation, _Component);
        function FollowerFormation() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._showDebugMarkers = true;
          _initializerDefineProperty(_this, "debugMaterial", _descriptor, _assertThisInitialized(_this));
          _this._slots = [];
          _this._claimed = [];
          _this._debugContainer = null;
          _this._debugMarkers = [];
          _this._markerMesh = null;
          return _this;
        }
        var _proto = FollowerFormation.prototype;
        _proto.onLoad = function onLoad() {
          this._collectSlots();
          // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
          // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
          {
            this._ensureContainer().active = false;
          }
        };
        _proto.update = function update() {
          // 디버그 마커는 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다.
          return;
        };
        _proto._collectSlots = function _collectSlots() {
          var found = [];
          for (var _iterator = _createForOfIteratorHelperLoose(this.node.children), _step; !(_step = _iterator()).done;) {
            var child = _step.value;
            if (child.name === DEBUG_CONTAINER_NAME) continue;
            var m = /^Slot(\d+)$/.exec(child.name);
            if (m) found.push({
              index: parseInt(m[1], 10),
              node: child
            });
          }
          found.sort(function (a, b) {
            return a.index - b.index;
          });
          this._slots = found.map(function (f) {
            return f.node;
          });
          if (this._claimed.length !== this._slots.length) this._claimed = new Array(this._slots.length).fill(false);
        }

        /** 비어있는 슬롯 중 이름 순서상 가장 먼저인 것을 하나 예약한다. 꽉 찼으면 -1 */;
        _proto.reserveSlot = function reserveSlot() {
          for (var i = 0; i < this._claimed.length; i++) {
            if (!this._claimed[i]) {
              this._claimed[i] = true;
              return i;
            }
          }
          return -1;
        }

        /** 추종자가 사라질 때 자리를 반납 */;
        _proto.releaseSlot = function releaseSlot(index) {
          if (this._claimed && index >= 0 && index < this._claimed.length) this._claimed[index] = false;
        }

        /** 슬롯의 실시간 월드 좌표 (슬롯 노드를 옮기거나 캐릭터가 움직이면 즉시 반영됨) */;
        _proto.getSlotWorldPosition = function getSlotWorldPosition(index, out) {
          Vec3.copy(out, this._slots[index].worldPosition);
          return out;
        };
        _proto._ensureContainer = function _ensureContainer() {
          if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
          var c = this.node.getChildByName(DEBUG_CONTAINER_NAME);
          if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
          }
          c.setPosition(0, 0, 0);
          c.setRotationFromEuler(0, 0, 0);
          c.setScale(1, 1, 1);
          this._debugContainer = c;
          this._debugMarkers = c.children.slice();
          return c;
        };
        _proto._ensureMarkerCount = function _ensureMarkerCount(count) {
          var container = this._ensureContainer();
          if (!this._markerMesh) {
            this._markerMesh = utils.createMesh(primitives.box({
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              length: MARKER_SIZE
            }));
          }
          while (this._debugMarkers.length < count) {
            var marker = new Node("marker_" + this._debugMarkers.length);
            container.addChild(marker);
            var mr = marker.addComponent(MeshRenderer);
            mr.mesh = this._markerMesh;
            if (this.debugMaterial) mr.setMaterial(this.debugMaterial, 0);
            this._debugMarkers.push(marker);
          }
          for (var i = count; i < this._debugMarkers.length; i++) this._debugMarkers[i].active = false;
          for (var _i = 0; _i < count; _i++) this._debugMarkers[_i].active = true;
        };
        _proto._redrawDebug = function _redrawDebug() {
          if (this._slots.length === 0) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }
          this._ensureContainer().active = true;
          this._ensureMarkerCount(this._slots.length);
          for (var i = 0; i < this._slots.length; i++) {
            this._debugMarkers[i].setWorldPosition(this._slots[i].worldPosition);
          }
        };
        _createClass(FollowerFormation, [{
          key: "showDebugMarkers",
          get: function get() {
            return this._showDebugMarkers;
          },
          set: function set(v) {
            this._showDebugMarkers = v;
            this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
          }
        }]);
        return FollowerFormation;
      }(Component), (_applyDecoratedDescriptor(_class2.prototype, "showDebugMarkers", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugMarkers"), _class2.prototype), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "debugMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FollowerGhostState.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Player.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Material, SkinnedMeshRenderer, Component, Player;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Material = module.Material;
      SkinnedMeshRenderer = module.SkinnedMeshRenderer;
      Component = module.Component;
    }, function (module) {
      Player = module.Player;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "6da1fN8TAxBWbxuFZlZUtVn", "FollowerGhostState", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      /**
       * 생산 대기 중인 추종자(소켓 위 미리보기)의 고스트 상태를 관리한다.
       * enterGhost()로 실제 토온 머티리얼을 백업하고 FollowerGhost.effect 기반 머티리얼로
       * 교체한 뒤, fadeTo()로 ghostFactor(프레넬+반투명 factor)를 서서히 낮춘다. factor가
       * 0에 도달하면 solidify()가 원래 토온 머티리얼로 되돌려 다른 추종자들과 동일하게 보이게 한다.
       */
      var FollowerGhostState = exports('FollowerGhostState', (_dec = ccclass('FollowerGhostState'), _dec2 = property(Material), _dec3 = property(Material), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FollowerGhostState, _Component);
        function FollowerGhostState() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "ghostBodyMaterial", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "ghostWeaponMaterial", _descriptor2, _assertThisInitialized(_this));
          _this._entries = [];
          _this._ghostFactor = 0;
          _this._fadeFrom = 0;
          _this._fadeTo = 0;
          _this._fadeTimer = 0;
          _this._fadeDuration = 0;
          _this._fadeActive = false;
          _this._onFadeDone = null;
          return _this;
        }
        var _proto = FollowerGhostState.prototype;
        /** 고스트(생산 대기) 상태로 진입 — 원래 머티리얼을 백업하고 고스트 머티리얼로 교체.
         * 아직 "생산되지 않은" 상태이므로 몬스터 타게팅/공격도 함께 꺼둔다. */
        _proto.enterGhost = function enterGhost() {
          var player = this.getComponent(Player);
          if (player) player.combatEnabled = false;
          this._entries = [];
          var renderers = this.node.getComponentsInChildren(SkinnedMeshRenderer);
          for (var _iterator = _createForOfIteratorHelperLoose(renderers), _step; !(_step = _iterator()).done;) {
            var _r$sharedMaterials$;
            var r = _step.value;
            var isBody = r.node.name === 'NPC_Summon_001';
            var isWeapon = r.node.name.startsWith('crossbow');
            var ghostAsset = isBody ? this.ghostBodyMaterial : isWeapon ? this.ghostWeaponMaterial : null;
            if (!ghostAsset) continue;

            // setMaterial()에 다시 넣어 되돌리려면 인스턴스(getMaterialInstance)가 아니라
            // 공유 머티리얼 자체를 들고 있어야 한다 — 인스턴스를 넣으면 엔진이
            // "Can't set a material instance to a sharedMaterial slot" 에러를 낸다.
            var realMaterial = (_r$sharedMaterials$ = r.sharedMaterials[0]) != null ? _r$sharedMaterials$ : null;
            r.setMaterial(ghostAsset, 0);
            this._entries.push({
              renderer: r,
              realMaterial: realMaterial
            });
          }
          this.setGhostFactor(1);
        };
        _proto.setGhostFactor = function setGhostFactor(v) {
          this._ghostFactor = v;
          for (var _iterator2 = _createForOfIteratorHelperLoose(this._entries), _step2; !(_step2 = _iterator2()).done;) {
            var _e$renderer$getMateri;
            var e = _step2.value;
            (_e$renderer$getMateri = e.renderer.getMaterialInstance(0)) == null || _e$renderer$getMateri.setProperty('ghostFactor', v);
          }
        }

        /** ghostFactor를 duration에 걸쳐 target까지 선형 보간. 도달 시 onComplete 호출 */;
        _proto.fadeTo = function fadeTo(target, duration, onComplete) {
          this._fadeFrom = this._ghostFactor;
          this._fadeTo = target;
          this._fadeDuration = Math.max(0.0001, duration);
          this._fadeTimer = 0;
          this._fadeActive = true;
          this._onFadeDone = onComplete != null ? onComplete : null;
        }

        /** 고스트 → 실체화: 원래 토온 머티리얼로 되돌리고 고스트 상태를 해제한다.
         * 이 시점부터 진짜 추종자로 취급해 몬스터 타게팅/공격을 다시 켠다. */;
        _proto.solidify = function solidify() {
          this._fadeActive = false;
          for (var _iterator3 = _createForOfIteratorHelperLoose(this._entries), _step3; !(_step3 = _iterator3()).done;) {
            var e = _step3.value;
            if (e.realMaterial) e.renderer.setMaterial(e.realMaterial, 0);
          }
          this._entries = [];
          this._ghostFactor = 0;
          var player = this.getComponent(Player);
          if (player) player.combatEnabled = true;
        };
        _proto.update = function update(dt) {
          if (!this._fadeActive) return;
          this._fadeTimer += dt;
          var t = Math.min(1, this._fadeTimer / this._fadeDuration);
          this.setGhostFactor(this._fadeFrom + (this._fadeTo - this._fadeFrom) * t);
          if (t >= 1) {
            this._fadeActive = false;
            var cb = this._onFadeDone;
            this._onFadeDone = null;
            cb == null || cb();
          }
        };
        _createClass(FollowerGhostState, [{
          key: "ghostFactor",
          get: function get() {
            return this._ghostFactor;
          }
        }, {
          key: "isGhost",
          get: function get() {
            return this._entries.length > 0;
          }
        }]);
        return FollowerGhostState;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ghostBodyMaterial", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ghostWeaponMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FollowerMovement.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Player.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, Vec3, Vec2, Component, Player;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      Vec2 = module.Vec2;
      Component = module.Component;
    }, function (module) {
      Player = module.Player;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "887a1wG40lB2bqQHLYW01+y", "FollowerMovement", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 추종 캐릭터를 대형(FollowerFormation)의 배정된 격자 슬롯으로 계속 이동시킨다.
       * 실제 이동/애니메이션/전투는 전부 Player.ts가 그대로 담당한다 — 이 컴포넌트는
       * Player.moveDirOverride에 "지금 슬롯으로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이다.
       */
      var FollowerMovement = exports('FollowerMovement', (_dec = ccclass('FollowerMovement'), _dec2 = property({
        displayName: '도착 판정 거리(m)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FollowerMovement, _Component);
        function FollowerMovement() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "arriveDist", _descriptor, _assertThisInitialized(_this));
          _this._player = null;
          _this._formation = null;
          _this._slotIndex = -1;
          _this._slotPos = new Vec3();
          return _this;
        }
        var _proto = FollowerMovement.prototype;
        /** Socket.ts가 스폰 직후 호출 */
        _proto.setup = function setup(formation) {
          this._formation = formation;
          this._slotIndex = formation.reserveSlot();
        };
        _proto.onLoad = function onLoad() {
          this._player = this.getComponent(Player);
        };
        _proto.onDestroy = function onDestroy() {
          var _this$_formation;
          (_this$_formation = this._formation) == null || _this$_formation.releaseSlot(this._slotIndex);
        };
        _proto.update = function update() {
          if (!this._player || !this._formation || this._slotIndex < 0) return;
          this._formation.getSlotWorldPosition(this._slotIndex, this._slotPos);
          var p = this.node.worldPosition;
          var dx = this._slotPos.x - p.x;
          var dz = this._slotPos.z - p.z;
          var dist = Math.hypot(dx, dz);
          if (dist <= this.arriveDist) {
            this._player.moveDirOverride = Vec2.ZERO;
            return;
          }

          // Player.ts 좌표계로 역변환: worldX = joyX, worldZ = -joyY
          var inv = 1 / dist;
          this._player.moveDirOverride = new Vec2(dx * inv, -dz * inv);
        };
        _createClass(FollowerMovement, [{
          key: "slotIndex",
          get: function get() {
            return this._slotIndex;
          }
        }]);
        return FollowerMovement;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "arriveDist", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.25;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Sprite, Node, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Sprite = module.Sprite;
      Node = module.Node;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3;
      cclegacy._RF.push({}, "d73a4vATBpH+KUfX1MZFI7v", "GameManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameManager = exports('GameManager', (_dec = ccclass('GameManager'), _dec2 = property(Sprite), _dec3 = property(Node), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameManager, _Component);
        function GameManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "hpBar", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "ctaPanel", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "totalWaves", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxHp", _descriptor4, _assertThisInitialized(_this));
          _this._score = 0;
          _this._hp = 10;
          _this._curWave = 1;
          _this._ended = false;
          return _this;
        }
        var _proto = GameManager.prototype;
        _proto.onLoad = function onLoad() {
          GameManager.instance = this;
        };
        _proto.onDestroy = function onDestroy() {
          if (GameManager.instance === this) GameManager.instance = null;
        };
        _proto.start = function start() {
          this._hp = this.maxHp;
          this._refreshUI();
        };
        _proto.addScore = function addScore(pts) {
          this._score += pts;
          this._refreshUI();
        }

        /** 몬스터가 기지(집)를 공격했을 때 호출 */;
        _proto.baseTakeDamage = function baseTakeDamage(dmg) {
          if (this._ended) return;
          this._hp = Math.max(0, this._hp - dmg);
          this._refreshUI();
          if (this._hp <= 0) this._finish();
        };
        _proto.setWave = function setWave(n) {
          this._curWave = n;
          this._refreshUI();
        };
        _proto.onAllWavesDone = function onAllWavesDone() {
          var _this2 = this;
          if (this._ended) return;
          this.scheduleOnce(function () {
            return _this2._finish();
          }, 1.5);
        };
        _proto._finish = function _finish() {
          var _this3 = this;
          if (this._ended) return;
          this._ended = true;
          this.scheduleOnce(function () {
            if (_this3.ctaPanel) _this3.ctaPanel.active = true;
          }, 1.0);
        };
        _proto._refreshUI = function _refreshUI() {
          if (this.hpBar && this.hpBar.spriteFrame) {
            this.hpBar.fillRange = this._hp / this.maxHp;
          }
        };
        return GameManager;
      }(Component), _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ctaPanel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "totalWaves", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GuideCompass.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Socket.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Vec3, Quat, Animation, AnimationClip, Component, Socket;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      Quat = module.Quat;
      Animation = module.Animation;
      AnimationClip = module.AnimationClip;
      Component = module.Component;
    }, function (module) {
      Socket = module.Socket;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "79596sTAJtEcp0c4qvxLMaL", "GuideCompass", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CLIP_NAME = 'appear';

      // 바닥에 눕혀서(노멀이 위를 향하도록) 깔아두는 고정 틸트 — 이 프로젝트의 다른 바닥-평면
      // 쿼드들(MapBounds 디버그 라인, 옛 Socket placeholder 등)과 동일한 X=-90° 관례.
      // 카메라를 향해 세워둘 필요가 없다 — 바닥에 붙어 방향만 가리키는 표식이기 때문.
      var LIE_FLAT_PITCH_DEG = -90;

      /**
       * 메인 캐릭터에 붙어서, 유도 화살표 UI가 켜져 있는 소켓(Socket.activeGuideTarget) 방향을
       * 항상 가리키는 나침반형 화살표. 캐릭터(부모 노드)를 중심으로 한 궤도 위, 목표 방향 쪽 지점에
       * 위치하면서 그 방향을 가리킨다(레이더/미니맵의 오프스크린 화살표와 동일한 방식) — 캐릭터
       * 바로 밑에 붙어있지 않고 캐릭터를 공전하듯 움직인다. 바닥에 눕힌 채로 수직(Y)축 회전만으로
       * 방향을 가리키며(카메라를 향해 세울 필요 없음), 캐릭터 자신의 회전과는 무관하게
       * (= setWorldRotation/setWorldPosition으로 직접 지정) 캐릭터를 기준으로 360도 자유롭게 돈다.
       *
       * 대상이 생기면 'appear' 애니메이션 클립을 정재생해서 나타나고, 대상이 사라지면 같은
       * 클립을 역재생해서 사라진다(재생성 없이 계속 재사용 — 소켓 옆에 서던 예전 SocketGuideArrow와
       * 달리 파괴되지 않는다). node는 항상 active 상태로 유지한다 — 비활성 노드는 자기 자신의
       * update()도 더 이상 호출되지 않아서, 대상이 다시 생겨도 스스로 못 깨어나는 문제가 있었다
       * (실제 Play에서 소켓이 활성화돼도 화살표가 끝내 안 나타나던 원인).
       */
      var GuideCompass = exports('GuideCompass', (_dec = ccclass('GuideCompass'), _dec2 = property({
        displayName: '화살표 기본 방향 보정(도)',
        tooltip: '화살표 메쉬의 기본 방향이 실제와 안 맞을 때 보정용 — 반대로 보이면 180, 90도 틀어져 보이면 90/-90으로 조정'
      }), _dec3 = property({
        displayName: '공전 반경(m)',
        tooltip: '캐릭터 중심에서 화살표가 떨어져서 도는 거리'
      }), _dec4 = property({
        displayName: '바닥 높이 보정(m)',
        tooltip: '땅에 딱 붙이면 다른 바닥 평면과 겹쳐 보일 수 있어 살짝 띄우는 값'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GuideCompass, _Component);
        function GuideCompass() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "forwardOffsetDeg", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "orbitRadius", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "orbitHeight", _descriptor3, _assertThisInitialized(_this));
          _this._anim = null;
          _this._center = null;
          _this._visible = false;
          _this._dir = new Vec3();
          _this._worldPos = new Vec3();
          _this._qYaw = new Quat();
          _this._qLieFlat = new Quat();
          _this._qFinal = new Quat();
          return _this;
        }
        var _proto = GuideCompass.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          this._center = this.node.parent; // 이 화살표가 공전할 기준(캐릭터)
        };

        _proto.update = function update() {
          var target = Socket.activeGuideTarget;
          var hasTarget = !!target && target.isValid;
          if (hasTarget !== this._visible) {
            this._visible = hasTarget;
            if (hasTarget) this._playAppear(1);else this._playAppear(-1);
          }
          if (!hasTarget || !this._center) return;
          Vec3.subtract(this._dir, target.worldPosition, this._center.worldPosition);
          this._dir.y = 0;
          if (this._dir.lengthSqr() < 0.0001) return; // 대상과 거의 같은 위치면 방향 갱신을 건너뜀
          this._dir.normalize();

          // 캐릭터를 중심으로, 목표 방향 쪽 궤도 위의 지점으로 이동시킨다(공전).
          Vec3.scaleAndAdd(this._worldPos, this._center.worldPosition, this._dir, this.orbitRadius);
          this._worldPos.y = this._center.worldPosition.y + this.orbitHeight;
          this.node.setWorldPosition(this._worldPos);

          // 바닥에 눕힌(X=-90°) 상태에서 기본 정면 방향은 world -Z. 그 상태를 world Y축으로
          // 추가로 돌려(yaw) 실제 목표 방향과 일치시킨다.
          var yawDeg = Math.atan2(-this._dir.x, -this._dir.z) * 180 / Math.PI + this.forwardOffsetDeg;
          Quat.fromAxisAngle(this._qYaw, Vec3.UNIT_Y, yawDeg * Math.PI / 180);
          Quat.fromAxisAngle(this._qLieFlat, Vec3.UNIT_X, LIE_FLAT_PITCH_DEG * Math.PI / 180);
          Quat.multiply(this._qFinal, this._qYaw, this._qLieFlat); // 먼저 눕히고, 그 다음 수직축으로 조준
          this.node.setWorldRotation(this._qFinal);
        }

        /** dir=1이면 appear를 정재생(나타남), dir=-1이면 역재생(사라짐) */;
        _proto._playAppear = function _playAppear(dir) {
          var _this$_anim;
          var state = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.getState(CLIP_NAME);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = dir;
          state.time = dir === 1 ? 0 : state.duration;
          state.play();
        };
        return GuideCompass;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "forwardOffsetDeg", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "orbitRadius", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "orbitHeight", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HitEffect.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, MeshRenderer, Vec4, Color, Quat, Vec3, tween, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      MeshRenderer = module.MeshRenderer;
      Vec4 = module.Vec4;
      Color = module.Color;
      Quat = module.Quat;
      Vec3 = module.Vec3;
      tween = module.tween;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "82f2fIPw+ZI8bHl4Ofzy8pY", "HitEffect", undefined);
      var ccclass = _decorator.ccclass;
      var FRAME_COLS = 2;
      var FRAME_ROWS = 2;
      var LIFETIME = 0.3;

      // 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치.
      // 카메라 forward=(0,-0.7071,-0.7071)와 정확히 반대(dot=-1, 완전 정면)가 되도록 검증된 값.
      var CAMERA_FACE_PITCH_DEG = -45;

      /** Player.ts의 인스펙터 필드로 조절되는 이펙트 파라미터 (Bullet을 거쳐 전달됨) */

      var HitEffect = exports('HitEffect', (_dec = ccclass('HitEffect'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(HitEffect, _Component);
        function HitEffect() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._timer = 0;
          return _this;
        }
        var _proto = HitEffect.prototype;
        /**
         * @param dir 화살이 타격한 순간의 이동 방향(월드, XZ 기준). fx_hit.png의 4프레임은
         *            모두 "화면 기준 우→좌" 타격을 가정하고 그려져 있어, 실제 타격 방향에
         *            맞춰 이 값으로 회전각을 계산한다.
         */
        _proto.init = function init(mesh, mat, dir, params) {
          var mr = this.node.addComponent(MeshRenderer);
          mr.mesh = mesh;
          mr.setMaterial(mat, 0);
          var inst = mr.getMaterialInstance(0);

          // fx_hit.png 아틀라스(2x2, 4프레임) 중 랜덤 1칸만 샘플링
          var col = Math.floor(Math.random() * FRAME_COLS);
          var row = Math.floor(Math.random() * FRAME_ROWS);
          inst == null || inst.setProperty('tilingOffset', new Vec4(1 / FRAME_COLS, 1 / FRAME_ROWS, col / FRAME_COLS, row / FRAME_ROWS));

          // 오퍼시티 = 기본값 x 랜덤 배율, 0~1로 클램프 후 0~255 alpha로 변환
          var opacityMult = _randRange(params.opacityRandomMin, params.opacityRandomMax);
          var opacity01 = Math.min(1, Math.max(0, params.opacity * opacityMult));
          inst == null || inst.setProperty('mainColor', new Color(255, 255, 255, Math.round(opacity01 * 255)));

          // 화면 매핑: 오른쪽=world +X, 위=world -Z (Player.ts 주석 기준).
          // 기본 그림(우→좌, 즉 screen(-1,0))을 실제 타격 방향으로 회전시키는 각.
          //
          // 주의: 이 회전은 world-Y축 "yaw"가 아니라, 메쉬가 카메라를 향하기 *이전*의
          // 로컬 Z축(메쉬 원래 normal) 기준 "roll"로 적용해야 한다. yaw(world-Y 회전) 후에
          // 고정 피치를 적용하면 방향에 따라 카메라 정면성이 깨지고(방향=180도일 때 완전히
          // 옆으로 누워 안 보이게 됨), roll을 피치보다 먼저 적용하면 어떤 방향이든 항상
          // 카메라와 정확히 수직을 유지한다 (검증: 로컬 normal(0,0,1)은 Z축 회전에 불변).
          var rollDeg = Math.atan2(-dir.z, dir.x) * 180 / Math.PI - 180;
          var qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollDeg * Math.PI / 180);
          var qPitch = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180);
          var qFinal = new Quat();
          Quat.multiply(qFinal, qPitch, qRoll); // roll을 먼저 적용한 뒤 피치(카메라 정렬)
          this.node.setRotation(qFinal);

          // 전체 크기 랜덤화: 0.3 -> 1 -> 0.6 곡선의 모양은 유지한 채 배율만 매 타격마다 랜덤
          var sizeMult = _randRange(params.sizeRandomMin, params.sizeRandomMax);
          var s = function s(v) {
            return v * sizeMult;
          };
          this.node.setScale(s(params.scaleStart), s(params.scaleStart), s(params.scaleStart));
          tween(this.node).to(0.08, {
            scale: new Vec3(s(params.scaleMid), s(params.scaleMid), s(params.scaleMid))
          }).to(LIFETIME - 0.08, {
            scale: new Vec3(s(params.scaleEnd), s(params.scaleEnd), s(params.scaleEnd))
          }).start();
        };
        _proto.update = function update(dt) {
          this._timer += dt;
          if (this._timer >= LIFETIME) this.node.destroy();
        };
        return HitEffect;
      }(Component)) || _class));
      function _randRange(min, max) {
        return min + Math.random() * (max - min);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/JoystickUI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, Node, Camera, Vec2, Graphics, Color, UITransform, Vec3, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Camera = module.Camera;
      Vec2 = module.Vec2;
      Graphics = module.Graphics;
      Color = module.Color;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "17180z5sf5P2JoIksQP7JxI", "JoystickUI", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 플로팅(어디를 눌러도 그 자리에서 시작하는) 가상 조이스틱. 실제 터치 감지는 이 노드 자신이
       * 아니라 화면 전체를 덮는 별도의 touchZone 노드가 담당한다 — 터치가 시작되는 순간 이 노드
       * (베이스 링) 자체를 그 지점으로 옮겨서 보이게 하고, 그 자리를 중심으로 드래그하는 동안
       * 노브가 따라 움직인다. 손을 떼면 다시 숨는다.
       * Read .direction (normalized Vec2) in Player.ts.
       */
      var JoystickUI = exports('JoystickUI', (_dec = ccclass('JoystickUI'), _dec2 = property(Node), _dec3 = property({
        type: Node,
        displayName: '터치 감지 영역',
        tooltip: '화면 전체(또는 조작 가능 영역)를 덮는 노드 — 여기서 터치가 시작된 지점에 조이스틱이 나타난다. 비워두면 기존처럼 이 노드 자신의 고정된 자리에서만 반응한다'
      }), _dec4 = property({
        type: Camera,
        displayName: 'UI 카메라',
        tooltip: '터치 좌표를 UI 로컬 좌표로 변환할 때 사용 (UICamera 연결)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(JoystickUI, _Component);
        function JoystickUI() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "knob", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "radius", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "touchZone", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "uiCamera", _descriptor4, _assertThisInitialized(_this));
          _this._dir = new Vec2();
          _this._active = false;
          _this._touchId = -1;
          return _this;
        }
        var _proto = JoystickUI.prototype;
        _proto.onLoad = function onLoad() {
          var _this$touchZone;
          this._drawVisuals();

          // 터치는 시작된 노드가 그 제스처(move/end)를 끝까지 계속 받는다(Cocos의 터치 캡처
          // 방식) — 그래서 start/move/end/cancel을 전부 같은 노드(touchZone, 지정 안 하면
          // 이 노드 자신)에 등록해야 한다. touchZone에서 시작해도 이 노드(베이스 링) 자체를
          // 눌린 지점으로 옮겨서 보여주고, 그 이후 좌표 계산은 그대로 이 노드 기준으로 한다.
          var target = (_this$touchZone = this.touchZone) != null ? _this$touchZone : this.node;
          target.on(Node.EventType.TOUCH_START, this._onStart, this);
          target.on(Node.EventType.TOUCH_MOVE, this._onMove, this);
          target.on(Node.EventType.TOUCH_END, this._onEnd, this);
          target.on(Node.EventType.TOUCH_CANCEL, this._onEnd, this);

          // 플로팅 조이스틱은 누르기 전엔 숨겨둔다.
          if (this.touchZone) this.node.active = false;
        };
        _proto.onDestroy = function onDestroy() {
          var _this$touchZone2;
          var target = (_this$touchZone2 = this.touchZone) != null ? _this$touchZone2 : this.node;
          target.off(Node.EventType.TOUCH_START, this._onStart, this);
          target.off(Node.EventType.TOUCH_MOVE, this._onMove, this);
          target.off(Node.EventType.TOUCH_END, this._onEnd, this);
          target.off(Node.EventType.TOUCH_CANCEL, this._onEnd, this);
        }

        // ── Visuals ────────────────────────────────────────────────────────────
        ;

        _proto._drawVisuals = function _drawVisuals() {
          var _this$node$getCompone;
          // Base ring
          var g = (_this$node$getCompone = this.node.getComponent(Graphics)) != null ? _this$node$getCompone : this.node.addComponent(Graphics);
          g.clear();
          g.fillColor = new Color(0, 0, 0, 120);
          g.strokeColor = new Color(255, 255, 255, 230);
          g.lineWidth = 5;
          g.circle(0, 0, this.radius);
          g.fill();
          g.stroke();

          // Knob dot
          if (this.knob) {
            var _this$knob$getCompone;
            var kg = (_this$knob$getCompone = this.knob.getComponent(Graphics)) != null ? _this$knob$getCompone : this.knob.addComponent(Graphics);
            kg.clear();
            kg.fillColor = new Color(80, 160, 255, 220);
            kg.strokeColor = new Color(255, 255, 255, 255);
            kg.lineWidth = 3;
            kg.circle(0, 0, this.radius * 0.38);
            kg.fill();
            kg.stroke();
          }
        }

        // ── Touch handlers ─────────────────────────────────────────────────────
        ;

        _proto._onStart = function _onStart(e) {
          if (this._active) return;
          this._active = true;
          this._touchId = e.getID();

          // touchZone(화면 전체)에서 시작한 경우, 눌린 지점을 이 노드의 부모 기준 좌표로
          // 바꿔서 베이스 링 자체를 그 자리로 옮기고 보이게 한다 — "어디를 눌러도 그 자리에서
          // 시작"하는 플로팅 조이스틱의 핵심 동작.
          if (this.touchZone) {
            var _this$node$parent;
            var parentUi = (_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.getComponent(UITransform);
            if (parentUi && this.uiCamera) {
              var screen = e.getLocation();
              var world = new Vec3();
              this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
              var local = parentUi.convertToNodeSpaceAR(world);
              this.node.setPosition(local.x, local.y, 0);
            }
            this.node.active = true;
          }
          this._apply(e);
        };
        _proto._onMove = function _onMove(e) {
          if (e.getID() !== this._touchId) return;
          this._apply(e);
        };
        _proto._onEnd = function _onEnd(e) {
          var _this$knob;
          if (e.getID() !== this._touchId) return;
          this._active = false;
          this._touchId = -1;
          this._dir.set(0, 0);
          (_this$knob = this.knob) == null || _this$knob.setPosition(0, 0, 0);
          // 플로팅 조이스틱은 손을 떼면 다시 숨긴다 (touchZone 없이 고정 배치로 쓰는 경우는
          // 기존처럼 계속 표시).
          if (this.touchZone) this.node.active = false;
        };
        _proto._apply = function _apply(e) {
          var ui = this.node.getComponent(UITransform);
          if (!ui || !this.knob || !this.uiCamera) return;

          // e.getUILocation()은 cc.view의 정적 디자인 해상도 스케일을 기준으로 변환되는데,
          // UIAutoFit이 화면 비율에 맞춰 Canvas/UICamera를 매 리사이즈마다 직접 재조정하고 있어서
          // 그 값과 어긋난다 (특히 세로 화면에서 크게 벌어짐). 대신 UICamera의 실시간 투영으로
          // 직접 화면 좌표 → 월드 좌표 → 이 노드의 로컬 좌표로 변환해서 항상 실제 렌더링과 일치시킨다.
          var screen = e.getLocation();
          var world = new Vec3();
          this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
          var local = ui.convertToNodeSpaceAR(world);
          var len = Math.sqrt(local.x * local.x + local.y * local.y);

          // 노브는 항상 클릭/터치 지점 그대로 이동 (반경 밖이면 가장자리로 clamp)
          var clamp = Math.min(len, this.radius);
          var kx = len > 0 ? local.x / len * clamp : 0;
          var ky = len > 0 ? local.y / len * clamp : 0;
          this.knob.setPosition(kx, ky, 0);

          // 방향은 유지하되 크기는 0(중앙)~1(가장자리)로 스틱을 밀어낸 비율을 그대로 담음
          // → Player.ts가 이 크기만큼 이동 속도를 비례시킴
          this._dir.set(kx / this.radius, ky / this.radius);
        };
        _createClass(JoystickUI, [{
          key: "direction",
          get: /** 방향 벡터. 크기가 0(중앙)~1(가장자리)로 스틱을 밀어낸 정도를 그대로 나타냄. Vec2.ZERO when idle */
          function get() {
            return this._dir;
          }
        }]);
        return JoystickUI;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "knob", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "radius", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 100;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "touchZone", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "uiCamera", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./AtlasNumber.ts', './BossRushManager.ts', './BuildingTrigger.ts', './Bullet.ts', './CameraFollow.ts', './Coin.ts', './CoinCounterUI.ts', './CoinEvents.ts', './CoinPool.ts', './CoinSpawnController.ts', './CoinStack.ts', './DoorAutoOpen.ts', './FallingCoinVisual.ts', './FollowerFormation.ts', './FollowerGhostState.ts', './FollowerMovement.ts', './GameManager.ts', './GuideCompass.ts', './HitEffect.ts', './JoystickUI.ts', './MapBounds.ts', './Monster.ts', './MonsterHealthBar.ts', './MonsterHealthBarManager.ts', './MonsterHpBarView.ts', './MonsterSpawner.ts', './Player.ts', './RushPath.ts', './Socket.ts', './SocketGauge.ts', './SocketGuideArrow.ts', './SocketManager.ts', './SocketPreviewSlots.ts', './TowerAttack.ts', './TriggerId.ts', './UIAutoFit.ts', './UnitSocketManager.ts', './VirtualWall.ts', './WorldUIAnchor.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/MapBounds.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './env'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Node, Mesh, Material, MeshRenderer, Quat, Vec3, Component, EDITOR_NOT_IN_PREVIEW;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Mesh = module.Mesh;
      Material = module.Material;
      MeshRenderer = module.MeshRenderer;
      Quat = module.Quat;
      Vec3 = module.Vec3;
      Component = module.Component;
    }, function (module) {
      EDITOR_NOT_IN_PREVIEW = module.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "49fbbRpJ+NFGIZMWezb1n6a", "MapBounds", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property,
        executeInEditMode = _decorator.executeInEditMode;
      var DEBUG_CONTAINER_NAME = '__MapBoundsDebug__';
      var LINE_THICKNESS = 0.15; // 외곽선 두께(월드 유닛)
      var LINE_Y_OFFSET = 0.03; // 바닥과 겹쳐 z-fighting 나지 않도록 살짝 띄움

      /**
       * 맵의 이동 가능 범위를 다각형으로 정의한다.
       * 꼭짓점은 이 노드의 자식으로 배치하고 vertices 배열에 순서대로(시계/반시계 상관없이,
       * 다각형 둘레 순서대로) 연결한다. 씬 뷰에서 각 꼭짓점 노드를 기본 이동 기즈모로
       * 드래그하면 그대로 범위가 바뀐다. 다각형은 항상 월드 X-Z 평면(수평면) 기준으로
       * 계산되며 꼭짓점의 Y 좌표는 무시한다 (다각형은 항상 위를 바라보는 것으로 취급).
       *
       * showDebugOutline을 켜두면 각 변을 얇은 평면으로 이어 그려서, 에디터에서 Play를
       * 하지 않아도(@executeInEditMode) 다각형의 실제 형태를 바로 확인할 수 있다.
       */
      var MapBounds = exports('MapBounds', (_dec = ccclass('MapBounds'), _dec2 = property({
        type: [Node],
        displayName: '꼭짓점',
        tooltip: '맵 경계를 이루는 꼭짓점 노드들. 다각형 둘레 순서대로 등록 (3개 이상)'
      }), _dec3 = property({
        displayName: '외곽선 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 다각형 외곽선을 그려 형태를 바로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec4 = property(Mesh), _dec5 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MapBounds, _Component);
        function MapBounds() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "vertices", _descriptor, _assertThisInitialized(_this));
          _this._showDebugOutline = true;
          _initializerDefineProperty(_this, "segmentMesh", _descriptor2, _assertThisInitialized(_this));
          // 외곽선 한 변에 쓸 평면 메쉬 (예: UI_arrow가 쓰는 2x2 쿼드)
          _initializerDefineProperty(_this, "segmentMaterial", _descriptor3, _assertThisInitialized(_this));
          // 외곽선 머티리얼
          _this._debugContainer = null;
          _this._segNodes = [];
          return _this;
        }
        var _proto = MapBounds.prototype;
        /** 다각형 내부(경계 포함)인지 판정 (월드 X,Z 기준). 꼭짓점이 3개 미만이면 제한 없음(true) */
        _proto.contains = function contains(x, z) {
          var pts = this._livePoints();
          if (pts.length < 3) return true;
          var inside = false;
          for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            var pi = pts[i],
              pj = pts[j];
            var intersect = pi.z > z !== pj.z > z && x < (pj.x - pi.x) * (z - pi.z) / (pj.z - pi.z) + pi.x;
            if (intersect) inside = !inside;
          }
          return inside;
        };
        _proto.onLoad = function onLoad() {
          // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
          // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
          {
            this._ensureContainer().active = false;
          }
        };
        _proto.update = function update() {
          // 외곽선은 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다 — 실제 게임 화면에는 노출되면 안 된다.
          return;
        }

        /** 매번 자식 노드의 현재 월드 위치를 그대로 읽는다 (에디터에서 꼭짓점을 옮기면 즉시 반영) */;
        _proto._livePoints = function _livePoints() {
          var pts = [];
          for (var _iterator = _createForOfIteratorHelperLoose(this.vertices), _step; !(_step = _iterator()).done;) {
            var n = _step.value;
            if (!n || !n.isValid) continue;
            var p = n.worldPosition;
            pts.push({
              x: p.x,
              z: p.z
            });
          }
          return pts;
        };
        _proto._ensureContainer = function _ensureContainer() {
          if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
          var c = this.node.getChildByName(DEBUG_CONTAINER_NAME);
          if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
          }
          c.setPosition(0, 0, 0);
          c.setRotationFromEuler(0, 0, 0);
          c.setScale(1, 1, 1);
          this._debugContainer = c;
          this._segNodes = c.children.slice();
          return c;
        };
        _proto._ensureSegCount = function _ensureSegCount(count) {
          var container = this._ensureContainer();
          while (this._segNodes.length < count) {
            var seg = new Node("seg_" + this._segNodes.length);
            container.addChild(seg);
            var mr = seg.addComponent(MeshRenderer);
            if (this.segmentMesh) mr.mesh = this.segmentMesh;
            if (this.segmentMaterial) mr.setMaterial(this.segmentMaterial, 0);
            this._segNodes.push(seg);
          }
          for (var i = count; i < this._segNodes.length; i++) this._segNodes[i].active = false;
          for (var _i = 0; _i < count; _i++) this._segNodes[_i].active = true;
        };
        _proto._redrawDebug = function _redrawDebug() {
          var pts = this._livePoints();
          if (pts.length < 2 || !this.segmentMesh || !this.segmentMaterial) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }
          this._debugContainer && (this._debugContainer.active = true);
          this._ensureSegCount(pts.length);
          for (var i = 0; i < pts.length; i++) {
            var a = pts[i];
            var b = pts[(i + 1) % pts.length];
            this._placeSegment(this._segNodes[i], a.x, a.z, b.x, b.z);
          }
        }

        /** a→b 구간을 잇는 얇은 평면 하나를 배치한다. 메쉬는 로컬 XY 평면의 2x2 쿼드(normal=+Z)를 가정 */;
        _proto._placeSegment = function _placeSegment(seg, ax, az, bx, bz) {
          var dx = bx - ax,
            dz = bz - az;
          var len = Math.hypot(dx, dz) || 0.0001;
          seg.setWorldPosition((ax + bx) / 2, LINE_Y_OFFSET, (az + bz) / 2);

          // 평면을 바닥에 눕히는 고정 -90도 X회전(피치) + 구간 방향을 향하게 하는 Z축 roll.
          // roll을 피치보다 먼저 적용해야(로컬 normal은 자기 축 회전에 불변) 항상 정확히
          // 위를 바라보는 상태(수평)를 유지한다. (HitEffect에서 검증한 것과 동일한 원리)
          var rollRad = Math.atan2(-dz, dx);
          var qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollRad);
          var qTilt = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, -Math.PI / 2);
          var qFinal = new Quat();
          Quat.multiply(qFinal, qTilt, qRoll);
          seg.setRotation(qFinal);

          // 메쉬 로컬 X:[-1,1] → 길이 축, 로컬 Y:[-1,1] → 두께 축
          seg.setScale(len / 2, LINE_THICKNESS / 2, 1);
        };
        _createClass(MapBounds, [{
          key: "showDebugOutline",
          get: function get() {
            return this._showDebugOutline;
          },
          set: function set(v) {
            this._showDebugOutline = v;
            this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
          }
        }]);
        return MapBounds;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "vertices", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "showDebugOutline", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugOutline"), _class2.prototype), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "segmentMesh", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "segmentMaterial", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Monster.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameManager.ts', './VirtualWall.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Vec3, SkeletalAnimation, SkinnedMeshRenderer, MeshRenderer, Color, Component, GameManager, VirtualWall;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      SkeletalAnimation = module.SkeletalAnimation;
      SkinnedMeshRenderer = module.SkinnedMeshRenderer;
      MeshRenderer = module.MeshRenderer;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      GameManager = module.GameManager;
    }, function (module) {
      VirtualWall = module.VirtualWall;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
      cclegacy._RF.push({}, "bf306r0zDVAcrdslf20EdYD", "Monster", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Monster = exports('Monster', (_dec = ccclass('Monster'), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Monster, _Component);
        function Monster() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          /** MonsterSpawner가 addComponent 직후 연결(있으면). 데미지/사망 시점에 갱신/숨김을 위임한다 */
          _this.healthBar = null;
          /** MonsterSpawner가 RushGroup.isBoss에 따라 설정. true면 화살에 맞아도 넉백되지 않는다 */
          _this.isBoss = false;
          _initializerDefineProperty(_this, "moveSpeed", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxHp", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackDamage", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRange", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackInterval", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scoreValue", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinDrop", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "waypointArriveDist", _descriptor8, _assertThisInitialized(_this));
          // ── 피격 리액션 (화살에 맞았을 때) ───────────────────────────────────
          _initializerDefineProperty(_this, "knockbackDistance", _descriptor9, _assertThisInitialized(_this));
          // 넉백 이동 거리
          _initializerDefineProperty(_this, "knockbackDuration", _descriptor10, _assertThisInitialized(_this));
          // 넉백 지속 시간(초)
          _initializerDefineProperty(_this, "flashDuration", _descriptor11, _assertThisInitialized(_this));
          // 화이트 플래시 지속 시간(초)
          _initializerDefineProperty(_this, "flashIntensity", _descriptor12, _assertThisInitialized(_this));
          // 플래시 밝기 배율 (emissiveScale)
          _this._hp = 0;
          _this._isDead = false;
          _this._target = null;
          _this._waypoints = [];
          _this._wpIndex = 0;
          _this._anim = null;
          _this._curAnim = '';
          _this._attackTimer = 0;
          _this._onDied = null;
          _this._renderers = [];
          _this._knockbackDir = new Vec3();
          _this._knockbackTimer = 0;
          _this._flashMaterials = [];
          _this._restoreFlashBound = function () {
            return _this._restoreFlash();
          };
          return _this;
        }
        var _proto = Monster.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(SkeletalAnimation)) != null ? _this$getComponent : this.getComponentInChildren(SkeletalAnimation);
          this._renderers = [].concat(this.getComponentsInChildren(SkinnedMeshRenderer), this.getComponentsInChildren(MeshRenderer));
        };
        _proto.start = function start() {
          this._hp = this.maxHp;
          if (!this._target) this._play('idle');
        }

        /** 러쉬 경로(웨이포인트)를 따라 이동한 뒤, 마지막 지점부터는 target(기지)을 공격 */;
        _proto.setPath = function setPath(waypoints, target) {
          this._waypoints = waypoints;
          this._wpIndex = 0;
          this._target = target;
          this._play('move');
        };
        _proto.setOnDied = function setOnDied(cb) {
          this._onDied = cb;
        }

        /** @param hitDir 화살이 날아온(진행 중이던) 방향. 지정하면 그 방향으로 넉백된다 */;
        _proto.takeDamage = function takeDamage(amt, hitDir) {
          var _this$healthBar;
          if (this._isDead) return;
          this._hp -= amt;
          (_this$healthBar = this.healthBar) == null || _this$healthBar.onDamaged(this._hp, this.maxHp);
          this._flashWhite();
          if (hitDir) this._startKnockback(hitDir);
          if (this._hp <= 0) this._die();
        };
        _proto._startKnockback = function _startKnockback(hitDir) {
          if (this.isBoss) return; // 보스는 화살에 맞아도 밀려나지 않는다
          var len = Math.hypot(hitDir.x, hitDir.z);
          if (len < 0.0001) return;
          this._knockbackDir.set(hitDir.x / len, 0, hitDir.z / len);
          this._knockbackTimer = this.knockbackDuration;
        };
        _proto._flashWhite = function _flashWhite() {
          this._flashMaterials = [];
          for (var _iterator = _createForOfIteratorHelperLoose(this._renderers), _step; !(_step = _iterator()).done;) {
            var r = _step.value;
            var count = r.sharedMaterials.length;
            for (var i = 0; i < count; i++) {
              var inst = r.getMaterialInstance(i);
              if (!inst) continue;
              this._flashMaterials.push(inst);
              inst.setProperty('emissive', new Color(255, 255, 255, 255));
              inst.setProperty('emissiveScale', new Vec3(this.flashIntensity, this.flashIntensity, this.flashIntensity));
            }
          }
          // getProperty로 원래 값을 읽어 되돌리는 방식은 linear color 변환 등으로 복원이
          // 누락되는 문제가 있어, 셰이더가 정의한 기본값(emissive=검정, scale=1)으로 직접 복원한다.
          // 연속 피격 시 이전 예약을 취소하고 다시 예약해 깜빡임 없이 최신 타이밍으로 갱신.
          this.unschedule(this._restoreFlashBound);
          this.scheduleOnce(this._restoreFlashBound, this.flashDuration);
        };
        _proto._restoreFlash = function _restoreFlash() {
          for (var _iterator2 = _createForOfIteratorHelperLoose(this._flashMaterials), _step2; !(_step2 = _iterator2()).done;) {
            var mat = _step2.value;
            mat.setProperty('emissive', new Color(0, 0, 0, 255));
            mat.setProperty('emissiveScale', new Vec3(1, 1, 1));
          }
          this._flashMaterials = [];
        };
        _proto._play = function _play(name) {
          if (this._curAnim === name || !this._anim) return;
          this._curAnim = name;
          this._anim.play(name);
        };
        _proto._die = function _die() {
          var _this$healthBar2,
            _GameManager$instance,
            _this$_onDied,
            _this$_anim,
            _this$_anim2,
            _this2 = this;
          this._isDead = true;
          (_this$healthBar2 = this.healthBar) == null || _this$healthBar2.hide();
          (_GameManager$instance = GameManager.instance) == null || _GameManager$instance.addScore(this.scoreValue);
          (_this$_onDied = this._onDied) == null || _this$_onDied.call(this);
          this._curAnim = 'dead';
          (_this$_anim = this._anim) == null || _this$_anim.play('dead');
          var state = (_this$_anim2 = this._anim) == null ? void 0 : _this$_anim2.getState('dead');
          var duration = state && state.duration > 0 ? state.duration : 1.5;
          this.scheduleOnce(function () {
            return _this2.node.destroy();
          }, duration);
        };
        _proto.update = function update(dt) {
          var _this$_target;
          if (this._isDead || !((_this$_target = this._target) != null && _this$_target.isValid)) return;
          if (this._knockbackTimer > 0) {
            var step = this.knockbackDistance / this.knockbackDuration * dt;
            this._knockbackTimer = Math.max(0, this._knockbackTimer - dt);
            var p = this.node.worldPosition;
            this.node.setWorldPosition(p.x + this._knockbackDir.x * step, p.y, p.z + this._knockbackDir.z * step);
            return; // 넉백 중엔 이동/공격 로직 정지
          }

          // 러쉬 경로를 따라가는 중이면 웨이포인트를 순서대로 통과
          if (this._wpIndex < this._waypoints.length) {
            var arrived = this._moveToward(this._waypoints[this._wpIndex], dt);
            if (arrived) this._wpIndex++;
            return;
          }

          // 경로를 다 통과했으면 기지에 접근해서 공격
          var myPos = this.node.worldPosition;
          var tPos = this._target.worldPosition;
          var dx = tPos.x - myPos.x;
          var dz = tPos.z - myPos.z;
          var dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.attackRange) {
            this._play('attack');
            this._attackTimer += dt;
            if (this._attackTimer >= this.attackInterval) {
              var _GameManager$instance2;
              this._attackTimer = 0;
              (_GameManager$instance2 = GameManager.instance) == null || _GameManager$instance2.baseTakeDamage(this.attackDamage);
            }
          } else {
            this._attackTimer = 0;
            this._moveToward(tPos, dt);
          }
        }

        /** dest를 향해 한 스텝 이동. waypointArriveDist 이내면 이동하지 않고 true(도착)를 반환 */;
        _proto._moveToward = function _moveToward(dest, dt) {
          var myPos = this.node.worldPosition;
          var dx = dest.x - myPos.x;
          var dz = dest.z - myPos.z;
          var dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.waypointArriveDist) return true;
          this._play('move');
          var inv = 1 / dist;
          var nx = myPos.x + dx * inv * this.moveSpeed * dt;
          var nz = myPos.z + dz * inv * this.moveSpeed * dt;

          // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
          // 단, 지금 서있는 자리 자체가 이미 어떤 벽에 갇혀있는 상태라면(건물이 트리거로 생성되는
          // 순간 하필 몬스터 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어 빠져나올 수
          // 있게 해준다 — 빠져나오는 즉시 다음 프레임부터 자동으로 다시 정상 판정이 걸린다.
          if (!VirtualWall.isBlocked(myPos.x, myPos.z)) {
            if (VirtualWall.isBlocked(nx, myPos.z)) nx = myPos.x;
            if (VirtualWall.isBlocked(nx, nz)) nz = myPos.z;
          }
          this.node.setWorldPosition(nx, myPos.y, nz);
          this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
          return false;
        };
        _createClass(Monster, [{
          key: "isDead",
          get: /** Public read-only flag used by MonsterSpawner and Player */
          function get() {
            return this._isDead;
          }
        }]);
        return Monster;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.8;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "attackInterval", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "scoreValue", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "coinDrop", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "waypointArriveDist", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "flashDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.12;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "flashIntensity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 4;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MonsterHealthBar.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterHealthBarManager.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Component, MonsterHealthBarManager;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }, function (module) {
      MonsterHealthBarManager = module.MonsterHealthBarManager;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "2cab6/5Y8dPfbNUn8X74NMj", "MonsterHealthBar", undefined);
      var ccclass = _decorator.ccclass;

      /**
       * 몬스터 노드에 addComponent로 붙는 얇은 컴포넌트(Monster.ts와 동일한 방식 — MonsterSpawner가
       * 스폰 시점에 붙인다). 실제 표시는 MonsterHealthBarManager 풀에서 빌린 MonsterHpBarView가
       * 담당하고, 이 컴포넌트는 그 인스턴스의 획득/반납과 데미지 시점의 등장만 책임진다.
       * 데미지를 한 번도 안 입은 몬스터는 체력바를 아예 만들지 않는다(요청사항: 무피해 상태에선 숨김).
       */
      var MonsterHealthBar = exports('MonsterHealthBar', (_dec = ccclass('MonsterHealthBar'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MonsterHealthBar, _Component);
        function MonsterHealthBar() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          /** MonsterSpawner가 스폰 직후 RushGroup 설정에 따라 지정 */
          _this.isBoss = false;
          _this._view = null;
          return _this;
        }
        var _proto = MonsterHealthBar.prototype;
        /** 데미지를 입을 때마다 호출 — 처음 호출되는 순간 체력바를 실체화한다 */
        _proto.onDamaged = function onDamaged(hp, maxHp) {
          if (!this._view) {
            var _MonsterHealthBarMana, _MonsterHealthBarMana2;
            this._view = (_MonsterHealthBarMana = (_MonsterHealthBarMana2 = MonsterHealthBarManager.instance) == null ? void 0 : _MonsterHealthBarMana2.acquire()) != null ? _MonsterHealthBarMana : null;
            if (!this._view) return;
            this._view.target = this.node;
            var s = this.isBoss ? 2 : 1;
            this._view.node.setScale(s, s, 1);
          }
          this._view.setRatio(maxHp > 0 ? hp / maxHp : 0);
        };
        _proto.hide = function hide() {
          var _MonsterHealthBarMana3;
          if (!this._view) return;
          (_MonsterHealthBarMana3 = MonsterHealthBarManager.instance) == null || _MonsterHealthBarMana3.release(this._view);
          this._view = null;
        };
        _proto.onDestroy = function onDestroy() {
          this.hide();
        };
        return MonsterHealthBar;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MonsterHealthBarManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterHpBarView.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Prefab, Camera, instantiate, Component, MonsterHpBarView;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Camera = module.Camera;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      MonsterHpBarView = module.MonsterHpBarView;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _class3;
      cclegacy._RF.push({}, "970e8WqOXxDBKoCIuwQjpQ0", "MonsterHealthBarManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 몬스터 체력바 UI 인스턴스 풀. 모든 몬스터가 공유하는 단일 Canvas 아래 컨테이너 하나만 두고,
       * 필요할 때(데미지를 처음 입는 순간)만 풀에서 하나 꺼내 쓰고 몬스터가 죽거나 다시 풀피가 되면
       * 반납한다 — 몬스터 수만큼 매번 새 UI 노드를 만들고 부수는 대신 재사용해서
       * 스폰/사망이 잦은 러쉬 디펜스 특성상 생기는 GC/인스턴스화 비용을 줄인다.
       */
      var MonsterHealthBarManager = exports('MonsterHealthBarManager', (_dec = ccclass('MonsterHealthBarManager'), _dec2 = property({
        type: Prefab,
        displayName: '체력바 프리팹'
      }), _dec3 = property({
        type: Camera,
        displayName: '월드 카메라(3D)'
      }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MonsterHealthBarManager, _Component);
        function MonsterHealthBarManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "barPrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "worldCamera", _descriptor2, _assertThisInitialized(_this));
          _this._pool = [];
          return _this;
        }
        var _proto = MonsterHealthBarManager.prototype;
        _proto.onLoad = function onLoad() {
          MonsterHealthBarManager.instance = this;
        };
        _proto.onDestroy = function onDestroy() {
          if (MonsterHealthBarManager.instance === this) MonsterHealthBarManager.instance = null;
        };
        _proto.acquire = function acquire() {
          if (!this.barPrefab) return null;
          var node = this._pool.pop();
          if (!node) {
            node = instantiate(this.barPrefab);
            this.node.addChild(node);
          }
          node.active = true;
          var view = node.getComponent(MonsterHpBarView);
          if (view) view.worldCamera = this.worldCamera;
          return view;
        };
        _proto.release = function release(view) {
          view.target = null;
          view.node.active = false;
          view.node.setScale(1, 1, 1);
          this._pool.push(view.node);
        };
        return MonsterHealthBarManager;
      }(Component), _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "barPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MonsterHpBarView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Camera, Sprite, Vec3, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Camera = module.Camera;
      Sprite = module.Sprite;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "eb621NHZHhPqZ9e39HyzIv/", "MonsterHpBarView", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 몬스터 머리 위에 뜨는 체력바 하나의 표시 로직. MonsterHealthBarManager가 풀에서 꺼내 재사용하는
       * 인스턴스에 붙어있다 — 매 프레임 target(몬스터) 위쪽의 화면 좌표를 계산해 스스로를 그 자리로
       * 옮기고, target이 카메라 뒤에 있거나 사라졌으면 자동으로 숨긴다.
       * WorldUIAnchor(플레이어 체력바용)와 달리 화면 가장자리로 clamp하지 않는다 — 몬스터가 화면
       * 밖으로 나가면 그냥 안 보이는 게 맞고, 가장자리에 들러붙어 쌓이면 오히려 지저분해지기 때문.
       */
      var MonsterHpBarView = exports('MonsterHpBarView', (_dec = ccclass('MonsterHpBarView'), _dec2 = property(Camera), _dec3 = property(Sprite), _dec4 = property({
        displayName: '높이 오프셋',
        tooltip: 'target 위로 띄울 높이 (월드 단위, 몬스터 스케일 적용 전 기준)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MonsterHpBarView, _Component);
        function MonsterHpBarView() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "worldCamera", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fillSprite", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "offsetY", _descriptor3, _assertThisInitialized(_this));
          /** 따라다닐 몬스터 노드. MonsterHealthBar가 acquire 직후 설정한다 */
          _this.target = null;
          _this._worldPos = new Vec3();
          _this._uiPos = new Vec3();
          _this._camToTarget = new Vec3();
          return _this;
        }
        var _proto = MonsterHpBarView.prototype;
        _proto.setRatio = function setRatio(ratio) {
          if (this.fillSprite) this.fillSprite.fillRange = Math.max(0, Math.min(1, ratio));
        };
        _proto.update = function update() {
          if (!this.target || !this.target.isValid || !this.worldCamera || !this.node.parent) {
            this.node.active = false;
            return;
          }

          // 카메라 뒤쪽에 있으면(이론상 드묾 — 탑다운 카메라라도 안전하게) 표시하지 않는다.
          Vec3.subtract(this._camToTarget, this.target.worldPosition, this.worldCamera.node.worldPosition);
          if (Vec3.dot(this._camToTarget, this.worldCamera.node.forward) <= 0) {
            this.node.active = false;
            return;
          }
          this.node.active = true;
          Vec3.copy(this._worldPos, this.target.worldPosition);
          // offsetY는 "스케일 1 기준" 높이다 — 몬스터마다 스폰 스케일이 다르므로(기본 몬스터
          // 0.5, 보스 1.5 등) 실제 월드 오프셋도 그 스케일만큼 같이 줄어들거나 늘어나야 머리
          // 위 적당한 자리에 뜬다. 이걸 고정값으로 두면 작은 몬스터일수록 체력바가 실제 몸통보다
          // 훨씬 위로 떠서, 카메라 화각(특히 화면 비율이 좁은 데스크톱 와이드 화면)에 따라
          // 화면 밖으로 완전히 벗어나 아예 안 보이는 현상이 생긴다.
          this._worldPos.y += this.offsetY * this.target.worldScale.y;
          this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);
          this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
        };
        return MonsterHpBarView;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fillSprite", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "offsetY", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MonsterSpawner.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Monster.ts', './RushPath.ts', './CoinEvents.ts', './MonsterHealthBar.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Prefab, Node, instantiate, Component, Monster, RushPath, CoinEvents, CoinEventName, MonsterHealthBar;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
      _inheritsLoose = module.inheritsLoose;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Node = module.Node;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      Monster = module.Monster;
    }, function (module) {
      RushPath = module.RushPath;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }, function (module) {
      MonsterHealthBar = module.MonsterHealthBar;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _dec15, _dec16, _dec17, _dec18, _class4, _class5, _descriptor14, _descriptor15, _descriptor16, _dec19, _dec20, _dec21, _dec22, _class7, _class8, _descriptor17, _descriptor18, _descriptor19, _dec23, _dec24, _dec25, _dec26, _dec27, _class10, _class11, _descriptor20, _descriptor21, _descriptor22, _descriptor23;
      cclegacy._RF.push({}, "f4d82adR6RG9LX3kbYw2FpW", "MonsterSpawner", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 한 방향에서 오는 몬스터 그룹 하나의 스폰 설정 */
      var RushGroup = exports('RushGroup', (_dec = ccclass('RushGroup'), _dec2 = property({
        type: Prefab,
        displayName: '프리팹',
        tooltip: '스폰할 몬스터 프리팹'
      }), _dec3 = property({
        type: RushPath,
        displayName: '러쉬 경로',
        tooltip: '이 그룹이 따라갈 방향별 웨이포인트 경로'
      }), _dec4 = property({
        displayName: '몬스터 수',
        tooltip: '이 그룹에서 스폰할 총 마리수'
      }), _dec5 = property({
        displayName: '스폰 간격(초)',
        tooltip: '몬스터 한 마리씩 나오는 간격'
      }), _dec6 = property({
        displayName: 'HP',
        tooltip: '몬스터 최대 체력'
      }), _dec7 = property({
        displayName: '이동 속도',
        tooltip: '몬스터 이동 속도'
      }), _dec8 = property({
        displayName: '공격력',
        tooltip: '기지에 주는 데미지'
      }), _dec9 = property({
        displayName: '공격 간격(초)',
        tooltip: '공격 쿨타임'
      }), _dec10 = property({
        displayName: '처치 점수',
        tooltip: '처치 시 획득 점수'
      }), _dec11 = property({
        displayName: '드롭 코인 수',
        tooltip: '처치 시 드롭할 코인 개수 (일반 몬스터 1, 보스는 크게)'
      }), _dec12 = property({
        displayName: '크기 배율',
        tooltip: '스폰 시 몬스터 노드에 적용할 스케일 (기존 일반 몬스터는 0.5로 스폰되던 걸 그대로 필드로 뺀 것 — 보스처럼 더 크게 만들고 싶을 때 조정)'
      }), _dec13 = property({
        displayName: '보스',
        tooltip: '체크하면 이 그룹의 몬스터는 체력바가 3배 크기로 표시된다'
      }), _dec14 = property({
        displayName: '시작 웨이포인트 인덱스',
        tooltip: '보통은 0(경로의 첫 지점=스폰 지점)에서 시작하지만, 이미 진행 중인 지점부터 시작시키고 싶을 때(예: 게임 시작 직후 첫 러쉬가 도착하기까지의 텀을 줄이는 1회성 그룹) 인덱스를 지정한다 — 예: 2 = WP2 지점부터 시작'
      }), _dec(_class = (_class2 = function RushGroup() {
        _initializerDefineProperty(this, "prefab", _descriptor, this);
        _initializerDefineProperty(this, "path", _descriptor2, this);
        _initializerDefineProperty(this, "count", _descriptor3, this);
        _initializerDefineProperty(this, "spawnInterval", _descriptor4, this);
        _initializerDefineProperty(this, "hp", _descriptor5, this);
        _initializerDefineProperty(this, "moveSpeed", _descriptor6, this);
        _initializerDefineProperty(this, "attackDamage", _descriptor7, this);
        _initializerDefineProperty(this, "attackInterval", _descriptor8, this);
        _initializerDefineProperty(this, "scoreValue", _descriptor9, this);
        _initializerDefineProperty(this, "coinDrop", _descriptor10, this);
        _initializerDefineProperty(this, "scale", _descriptor11, this);
        _initializerDefineProperty(this, "isBoss", _descriptor12, this);
        _initializerDefineProperty(this, "startWaypointIndex", _descriptor13, this);
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "prefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "path", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "count", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "spawnInterval", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "hp", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "attackInterval", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "scoreValue", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "coinDrop", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "scale", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "isBoss", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "startWaypointIndex", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      })), _class2)) || _class));

      /** 트리거로 시작되는 러쉬 하나. 여러 방향의 RushGroup을 동시에 시작시킨다 */
      var RushConfig = exports('RushConfig', (_dec15 = ccclass('RushConfig'), _dec16 = property({
        displayName: '러쉬 이름',
        tooltip: '트리거에서 startRushByName()으로 지정할 이름'
      }), _dec17 = property({
        type: [RushGroup],
        displayName: '방향별 그룹',
        tooltip: '이 러쉬가 시작될 때 동시에 스폰될 그룹들 (방향별로 하나씩)'
      }), _dec18 = property({
        displayName: '다음 러쉬',
        tooltip: '이 러쉬의 몬스터가 전부 죽으면 자동으로 시작할 러쉬 이름. 비워두면 자동 시작 없음. RushCycle에 속한 러쉬는 이 필드를 쓰지 않는다(간격 타이머가 대신 진행을 맡음)'
      }), _dec15(_class4 = (_class5 = function RushConfig() {
        _initializerDefineProperty(this, "rushName", _descriptor14, this);
        _initializerDefineProperty(this, "groups", _descriptor15, this);
        _initializerDefineProperty(this, "nextRushName", _descriptor16, this);
      }, (_descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "rushName", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "groups", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "nextRushName", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      })), _class5)) || _class4));

      /** 여러 RushConfig를 몬스터가 죽기를 기다리지 않고 고정 간격으로 라운드로빈 순서로 계속 시작시키는 반복 사이클.
       * firstRushName/unitMilestoneRushNames/BossRushEntry 등 기존의 "이름으로 러쉬 시작" 지점에서 이 cycleName을
       * 그대로 지정하면 된다 — startRushByName()이 rushCycles를 먼저 찾아보고, 있으면 사이클로 시작한다. */
      var RushCycle = exports('RushCycle', (_dec19 = ccclass('RushCycle'), _dec20 = property({
        displayName: '사이클 이름',
        tooltip: '외부에서 startRushByName()으로 이 이름을 호출하면 사이클이 시작된다'
      }), _dec21 = property({
        type: [String],
        displayName: '번갈아 나올 러쉬 이름들',
        tooltip: '러쉬 목록(rushes)에 등록된 RushConfig 이름들. 이 순서대로 라운드로빈으로 반복 시작된다 (각 러쉬 자신의 nextRushName은 무시됨)'
      }), _dec22 = property({
        displayName: '시작 간격(초)',
        tooltip: '한 러쉬를 시작한 뒤 다음 러쉬를 시작하기까지의 간격. 이전 러쉬의 몬스터가 아직 살아있어도 상관없이 이 간격마다 계속 새 러쉬를 시작한다. 사이클 시작 즉시 첫 러쉬가 나가고, 그 뒤로 이 간격마다 다음 러쉬가 나간다'
      }), _dec19(_class7 = (_class8 = function RushCycle() {
        _initializerDefineProperty(this, "cycleName", _descriptor17, this);
        _initializerDefineProperty(this, "rushNames", _descriptor18, this);
        _initializerDefineProperty(this, "interval", _descriptor19, this);
      }, (_descriptor17 = _applyDecoratedDescriptor(_class8.prototype, "cycleName", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class8.prototype, "rushNames", [_dec21], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class8.prototype, "interval", [_dec22], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      })), _class8)) || _class7));
      var MonsterSpawner = exports('MonsterSpawner', (_dec23 = ccclass('MonsterSpawner'), _dec24 = property({
        type: Node,
        displayName: '기지(집) 노드',
        tooltip: '몬스터가 최종적으로 공격할 대상. 집 에셋을 배치한 뒤 연결'
      }), _dec25 = property({
        type: [RushConfig],
        displayName: '러쉬 목록',
        tooltip: '트리거가 이름/인덱스로 시작시킬 러쉬들을 미리 등록'
      }), _dec26 = property({
        type: [RushCycle],
        displayName: '간격 반복 사이클 목록',
        tooltip: '몬스터가 다 죽기를 기다리지 않고 고정 간격으로 번갈아 나오는 러쉬 묶음들'
      }), _dec27 = property({
        displayName: '동시 최대 몬스터 수',
        tooltip: '살아있는 몬스터가 이 수를 넘으면 새 스폰을 잠깐 멈춘다(자리가 나면 바로 이어서 스폰) — 여러 러쉬/서지가 동시에 겹쳐도 화면의 몬스터 수가 일정 수준 이상으로 폭증하지 않게 막아주는 안전장치'
      }), _dec23(_class10 = (_class11 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MonsterSpawner, _Component);
        function MonsterSpawner() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "baseNode", _descriptor20, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "rushes", _descriptor21, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "rushCycles", _descriptor22, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxActiveMonsters", _descriptor23, _assertThisInitialized(_this));
          _this._activeMonsters = [];
          _this._running = [];
          _this._rushState = new Map();
          _this._activeCycles = [];
          return _this;
        }
        var _proto = MonsterSpawner.prototype;
        _proto.update = function update(dt) {
          var _this2 = this;
          var _loop = function _loop() {
            var c = _step.value;
            c.timer -= dt;
            if (c.timer <= 0) {
              c.timer += c.cycle.interval;
              var name = c.cycle.rushNames[c.idx];
              c.idx = (c.idx + 1) % c.cycle.rushNames.length;
              var rush = _this2.rushes.find(function (r) {
                return r.rushName === name;
              });
              if (rush) _this2.startRush(rush);else console.warn("[MonsterSpawner] cycle rush not found: " + name);
            }
          };
          for (var _iterator = _createForOfIteratorHelperLoose(this._activeCycles), _step; !(_step = _iterator()).done;) {
            _loop();
          }
          for (var i = this._running.length - 1; i >= 0; i--) {
            var r = this._running[i];
            r.timer += dt;
            if (r.timer >= r.group.spawnInterval) {
              // 동시 생존 몬스터 수가 상한을 넘으면 이번 틱은 스폰을 건너뛴다 — 타이머는 그대로 넘친 채
              // 쌓여있으니 자리가 나는 즉시(다음 프레임) 바로 이어서 스폰된다. 여러 러쉬/서지가 겹쳐
              // 한꺼번에 수백 마리가 몰려서 렉이 나는 걸 막는 안전장치.
              if (this._activeMonsters.length >= this.maxActiveMonsters) continue;
              r.timer = 0;
              this._spawnMonster(r.group, r.rush);
              r.spawned++;
              if (r.spawned >= r.group.count) {
                this._running.splice(i, 1);
                this._onGroupSpawnDone(r.rush);
              }
            }
          }
        }

        /** 외부 트리거가 이름으로 러쉬(또는 간격 반복 사이클)를 시작시킬 때 호출 */;
        _proto.startRushByName = function startRushByName(name) {
          var cycle = this.rushCycles.find(function (c) {
            return c.cycleName === name;
          });
          if (cycle) {
            this._startCycle(cycle);
            return;
          }
          var rush = this.rushes.find(function (r) {
            return r.rushName === name;
          });
          if (rush) this.startRush(rush);else console.warn("[MonsterSpawner] rush not found: " + name);
        };
        _proto._startCycle = function _startCycle(cycle) {
          if (cycle.rushNames.length === 0) return;
          if (this._activeCycles.some(function (c) {
            return c.cycle === cycle;
          })) return;
          this._activeCycles.push({
            cycle: cycle,
            idx: 0,
            timer: 0
          });
        }

        /** 외부 트리거가 인덱스로 러쉬를 시작시킬 때 호출 */;
        _proto.startRushByIndex = function startRushByIndex(idx) {
          if (idx >= 0 && idx < this.rushes.length) this.startRush(this.rushes[idx]);
        };
        _proto.startRush = function startRush(rush) {
          var validGroups = rush.groups.filter(function (g) {
            return g.prefab && g.path && g.path.waypoints.length > 0;
          });
          if (validGroups.length === 0) return;
          this._rushState.set(rush, {
            groupsRemaining: validGroups.length,
            monstersAlive: 0
          });
          for (var _iterator2 = _createForOfIteratorHelperLoose(validGroups), _step2; !(_step2 = _iterator2()).done;) {
            var g = _step2.value;
            this._running.push({
              rush: rush,
              group: g,
              spawned: 0,
              timer: g.spawnInterval
            });
          }
        };
        _proto._onGroupSpawnDone = function _onGroupSpawnDone(rush) {
          var st = this._rushState.get(rush);
          if (!st) return;
          st.groupsRemaining--;
          this._checkRushCleared(rush, st);
        };
        _proto._checkRushCleared = function _checkRushCleared(rush, st) {
          if (st.groupsRemaining > 0 || st.monstersAlive > 0) return;
          this._rushState["delete"](rush);
          if (rush.nextRushName) this.startRushByName(rush.nextRushName);
        };
        _proto._spawnMonster = function _spawnMonster(g, rush) {
          var _this3 = this;
          if (!g.prefab || !this.baseNode || !g.path) return;
          var allWaypoints = g.path.waypoints.filter(function (n) {
            return n && n.isValid;
          }).map(function (n) {
            return n.worldPosition.clone();
          });
          if (allWaypoints.length === 0) return;
          var startIdx = Math.min(Math.max(g.startWaypointIndex, 0), allWaypoints.length - 1);
          var waypoints = allWaypoints.slice(startIdx);
          var monster = instantiate(g.prefab);
          this.node.addChild(monster);
          monster.setScale(g.scale, g.scale, g.scale);
          monster.setWorldPosition(waypoints[0]);
          var mc = monster.addComponent(Monster);
          mc.maxHp = g.hp;
          mc.moveSpeed = g.moveSpeed;
          mc.attackDamage = g.attackDamage;
          mc.attackInterval = g.attackInterval;
          mc.scoreValue = g.scoreValue;
          mc.coinDrop = g.coinDrop;
          mc.isBoss = g.isBoss;
          var hb = monster.addComponent(MonsterHealthBar);
          hb.isBoss = g.isBoss;
          mc.healthBar = hb;
          mc.setPath(waypoints, this.baseNode);
          this._activeMonsters.push(mc);
          var st = this._rushState.get(rush);
          if (st) st.monstersAlive++;
          mc.setOnDied(function () {
            var i = _this3._activeMonsters.indexOf(mc);
            if (i >= 0) _this3._activeMonsters.splice(i, 1);

            // 코인 경제 시스템 훅 — 원본 Monster.ts 로직은 건드리지 않고 이벤트만 emit
            CoinEvents.emit(CoinEventName.MonsterKilled, mc.node.worldPosition.clone(), mc.coinDrop);
            var st2 = _this3._rushState.get(rush);
            if (st2) {
              st2.monstersAlive--;
              _this3._checkRushCleared(rush, st2);
            }
          });
        };
        _createClass(MonsterSpawner, [{
          key: "activeMonsters",
          get: function get() {
            return this._activeMonsters;
          }
          /** 아직 스폰 중인(진행 중인) 러쉬 그룹이 남아있는지 */
        }, {
          key: "isSpawning",
          get: function get() {
            return this._running.length > 0;
          }
        }]);
        return MonsterSpawner;
      }(Component), (_descriptor20 = _applyDecoratedDescriptor(_class11.prototype, "baseNode", [_dec24], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class11.prototype, "rushes", [_dec25], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class11.prototype, "rushCycles", [_dec26], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class11.prototype, "maxActiveMonsters", [_dec27], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 40;
        }
      })), _class11)) || _class10));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Player.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterSpawner.ts', './Bullet.ts', './JoystickUI.ts', './MapBounds.ts', './VirtualWall.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, Node, AnimationClip, Mesh, Material, animation, Vec2, Vec3, director, Component, MonsterSpawner, Bullet, JoystickUI, MapBounds, VirtualWall;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      AnimationClip = module.AnimationClip;
      Mesh = module.Mesh;
      Material = module.Material;
      animation = module.animation;
      Vec2 = module.Vec2;
      Vec3 = module.Vec3;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      MonsterSpawner = module.MonsterSpawner;
    }, function (module) {
      Bullet = module.Bullet;
    }, function (module) {
      JoystickUI = module.JoystickUI;
    }, function (module) {
      MapBounds = module.MapBounds;
    }, function (module) {
      VirtualWall = module.VirtualWall;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _class3;
      cclegacy._RF.push({}, "74a91FyOeJP3KmU2BwYCZAx", "Player", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * Camera sits at (0, 11.361, 4.405) with Y-euler = 0°.
       * "Screen up"  → world direction (0, 0, -1)
       * "Screen right"→ world direction (+1, 0, 0)
       *
       * Transform: worldX = joyX
       *            worldZ = -joyY
       */

      var Player = exports('Player', (_dec = ccclass('Player'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(AnimationClip), _dec6 = property(Mesh), _dec7 = property(Material), _dec8 = property(Mesh), _dec9 = property(Material), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Player, _Component);
        function Player() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "spawnerNode", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "joystickNode", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "mapBoundsNode", _descriptor3, _assertThisInitialized(_this));
          // AnimationGraph(PlayerAnimGraph)의 상체 공격 레이어가 재생하는 클립과 동일한 에셋.
          // 재생 자체는 그래프가 담당하고, 여기서는 duration만 읽어 attackRate에 맞춰 speed를 계산한다.
          _initializerDefineProperty(_this, "clipAttack", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowMesh", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowMat", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxHitMesh", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxHitMat", _descriptor8, _assertThisInitialized(_this));
          // ── 타격 이펙트 튜닝 (HitEffect로 전달) ─────────────────────────────
          _initializerDefineProperty(_this, "fxScaleStart", _descriptor9, _assertThisInitialized(_this));
          // 펀치 애니메이션 시작 스케일
          _initializerDefineProperty(_this, "fxScaleMid", _descriptor10, _assertThisInitialized(_this));
          // 펀치 애니메이션 중간 스케일
          _initializerDefineProperty(_this, "fxScaleEnd", _descriptor11, _assertThisInitialized(_this));
          // 펀치 애니메이션 종료 스케일
          _initializerDefineProperty(_this, "fxSizeRandomMin", _descriptor12, _assertThisInitialized(_this));
          // 전체 크기 랜덤 배율 최소값
          _initializerDefineProperty(_this, "fxSizeRandomMax", _descriptor13, _assertThisInitialized(_this));
          // 전체 크기 랜덤 배율 최대값
          _initializerDefineProperty(_this, "fxOpacity", _descriptor14, _assertThisInitialized(_this));
          // 기본 오퍼시티 (0~1)
          _initializerDefineProperty(_this, "fxOpacityRandomMin", _descriptor15, _assertThisInitialized(_this));
          // 오퍼시티 랜덤 배율 최소값
          _initializerDefineProperty(_this, "fxOpacityRandomMax", _descriptor16, _assertThisInitialized(_this));
          // 오퍼시티 랜덤 배율 최대값
          _initializerDefineProperty(_this, "moveSpeed", _descriptor17, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRate", _descriptor18, _assertThisInitialized(_this));
          // shots / second
          _initializerDefineProperty(_this, "attackDamage", _descriptor19, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRange", _descriptor20, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowSpeed", _descriptor21, _assertThisInitialized(_this));
          _this._animCtrl = null;
          _this._spawner = null;
          _this._joystick = null;
          _this._mapBounds = null;
          _this._attackTimer = 0;
          /**
           * 조이스틱이 없는(=추종자) 인스턴스를 위한 외부 이동 입력 훅. null이 아니면 조이스틱
           * 대신 이 값을 이동 방향으로 사용한다 (FollowerMovement.ts가 매 프레임 갱신).
           * 좌표계는 조이스틱과 동일: worldX = x, worldZ = -y.
           */
          _this.moveDirOverride = null;
          /**
           * 소켓 위에서 대기 중인 고스트 미리보기 추종자는 아직 "생산되지 않은" 상태이므로
           * 몬스터를 타게팅/공격/조준 회전하면 안 된다. FollowerGhostState.enterGhost()/solidify()가
           * 이 값을 false/true로 토글한다 — false인 동안 update()는 타겟을 아예 찾지 않는다.
           */
          _this.combatEnabled = true;
          return _this;
        }
        var _proto = Player.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._animCtrl = (_this$getComponent = this.getComponent(animation.AnimationController)) != null ? _this$getComponent : this.getComponentInChildren(animation.AnimationController);
        };
        _proto.start = function start() {
          if (this.spawnerNode) this._spawner = this.spawnerNode.getComponent(MonsterSpawner);
          if (this.joystickNode) this._joystick = this.joystickNode.getComponent(JoystickUI);
          if (this.mapBoundsNode) this._mapBounds = this.mapBoundsNode.getComponent(MapBounds);
          if (this.joystickNode) Player.instance = this;
        };
        _proto.onDestroy = function onDestroy() {
          if (Player.instance === this) Player.instance = null;
        };
        _proto.update = function update(dt) {
          var _ref, _this$moveDirOverride, _this$_joystick, _this$_animCtrl, _this$_animCtrl2;
          var dir = (_ref = (_this$moveDirOverride = this.moveDirOverride) != null ? _this$moveDirOverride : (_this$_joystick = this._joystick) == null ? void 0 : _this$_joystick.direction) != null ? _ref : Vec2.ZERO;
          var moving = dir.length() > 0.1;
          var target = this.combatEnabled ? this._findNearest() : null;

          // ── Movement (위치만 갱신 — 회전은 아래에서 타겟 유무에 따라 별도 처리) ──
          if (moving) {
            var wx = dir.x;
            var wz = -dir.y;
            var p = this.node.worldPosition;
            var nx = p.x + wx * this.moveSpeed * dt;
            var nz = p.z + wz * this.moveSpeed * dt;

            // 맵 경계 밖으로 나가는 축만 취소 → 벽을 따라 미끄러지듯 이동
            if (this._mapBounds) {
              if (!this._mapBounds.contains(nx, p.z)) nx = p.x;
              if (!this._mapBounds.contains(nx, nz)) nz = p.z;
            }
            // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
            // 추종자(조이스틱 없는 인스턴스)는 대형을 유지하며 플레이어를 따라가야 하므로
            // 건물 충돌에서 완전히 자유롭다 — 실제 조작하는 플레이어에게만 적용한다.
            // 단, 지금 서있는 자리(p) 자체가 이미 어떤 벽에 갇혀있는 상태라면(건물이 트리거로
            // 생성되는 순간 하필 플레이어 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어
            // 빠져나올 수 있게 해준다 — 빠져나와서 p가 더 이상 갇힌 위치가 아니게 되는 순간부터
            // 다음 프레임에 자동으로 다시 정상 판정이 걸린다.
            if (this.joystickNode && !VirtualWall.isBlocked(p.x, p.z)) {
              if (VirtualWall.isBlocked(nx, p.z)) nx = p.x;
              if (VirtualWall.isBlocked(nx, nz)) nz = p.z;
            }
            this.node.setWorldPosition(nx, p.y, nz);
          }

          // ── Facing: 타겟이 있으면 이동 여부와 상관없이 항상 타겟을 바라본다
          // (뒷걸음질 사격 중 이동방향 ↔ 타겟방향으로 번갈아 홱홱 도는 현상 방지).
          // 타겟이 없을 때만 이동 방향을 바라본다.
          if (target) {
            var _p = this.node.worldPosition;
            var dx = target.worldPosition.x - _p.x;
            var dz = target.worldPosition.z - _p.z;
            this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
          } else if (moving) {
            this.node.setRotationFromEuler(0, Math.atan2(dir.x, -dir.y) * 180 / Math.PI, 0);
          }

          // ── Animation state ──────────────────────────────────────────────
          // Base 레이어: 다리(하체) — Moving 여부로 Idle/Move 전환, 항상 정상 속도.
          // UpperBodyAttack 레이어(다리 관절 마스크 제외): 타겟이 있을 때만 가중치 1로 보여서
          // 상체(크로스보우)만 공격 모션을 재생하고, 다리는 Base 레이어의 속도를 그대로 유지한다.
          (_this$_animCtrl = this._animCtrl) == null || _this$_animCtrl.setValue('Moving', moving);
          (_this$_animCtrl2 = this._animCtrl) == null || _this$_animCtrl2.setLayerWeight(Player.UPPER_BODY_LAYER, target ? 1 : 0);
          if (target && this.clipAttack && this.attackRate > 0) {
            var _this$_animCtrl3;
            // 공격 모션 한 사이클이 발사 주기(1/attackRate)와 일치하도록 재생 속도 보정
            (_this$_animCtrl3 = this._animCtrl) == null || _this$_animCtrl3.setValue('AtkSpeed', this.clipAttack.duration * this.attackRate);
          }

          // ── Auto-attack (발사 타이밍만 담당, 애니메이션/회전과 무관) ─────────
          this._attackTimer += dt;
          if (target && this._attackTimer >= 1 / this.attackRate) {
            this._attackTimer = 0;
            this._shoot(target);
          }
        }

        // ── Internal helpers ──────────────────────────────────────────────────
        ;

        _proto._findNearest = function _findNearest() {
          if (!this._spawner) return null;
          var myPos = this.node.worldPosition;
          var best = null;
          var minDist = this.attackRange;
          for (var _iterator = _createForOfIteratorHelperLoose(this._spawner.activeMonsters), _step; !(_step = _iterator()).done;) {
            var m = _step.value;
            if (m.isDead || !m.node.isValid) continue;
            var d = Vec3.distance(m.node.worldPosition, myPos);
            if (d < minDist) {
              minDist = d;
              best = m.node;
            }
          }
          return best;
        };
        _proto._shoot = function _shoot(target) {
          var myPos = this.node.worldPosition;
          var dx = target.worldPosition.x - myPos.x;
          var dz = target.worldPosition.z - myPos.z;
          var horizLen = Math.hypot(dx, dz) || 1;
          var fwdX = dx / horizLen;
          var fwdZ = dz / horizLen;
          var spawnFwd = 0.6; // 캐릭터 앞쪽으로 이격
          var spawnHeight = 1.0; // 손/무기 높이 (머리보다 낮게)

          var scene = director.getScene();
          if (!scene) return;
          var bNode = new Node('Bullet');
          scene.addChild(bNode);
          bNode.setWorldPosition(myPos.x + fwdX * spawnFwd, myPos.y + spawnHeight, myPos.z + fwdZ * spawnFwd);
          var fxParams = {
            scaleStart: this.fxScaleStart,
            scaleMid: this.fxScaleMid,
            scaleEnd: this.fxScaleEnd,
            sizeRandomMin: this.fxSizeRandomMin,
            sizeRandomMax: this.fxSizeRandomMax,
            opacity: this.fxOpacity,
            opacityRandomMin: this.fxOpacityRandomMin,
            opacityRandomMax: this.fxOpacityRandomMax
          };
          bNode.addComponent(Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this.arrowMat, this.fxHitMesh, this.fxHitMat, fxParams);
        };
        return Player;
      }(Component), _class3.instance = null, _class3.UPPER_BODY_LAYER = 1, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "joystickNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "mapBoundsNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "clipAttack", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "arrowMesh", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "arrowMat", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMesh", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMat", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleStart", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleMid", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleEnd", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "attackRate", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 14;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RushPath.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "2b9efP95DBJBJFC4GT+HRR7", "RushPath", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 몬스터 러쉬 경로. 스폰 지점(0번 웨이포인트)부터 기지 근처까지
       * 순서대로 씬의 빈 노드를 등록해서 경로를 지정한다.
       */
      var RushPath = exports('RushPath', (_dec = ccclass('RushPath'), _dec2 = property({
        displayName: '경로 이름',
        tooltip: '예: North / South / East / West'
      }), _dec3 = property({
        type: [Node],
        displayName: '웨이포인트',
        tooltip: '0번 = 스폰 지점, 마지막 = 기지 근처. 씬 뷰에서 위치를 드래그로 조정 가능'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(RushPath, _Component);
        function RushPath() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "pathName", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "waypoints", _descriptor2, _assertThisInitialized(_this));
          return _this;
        }
        return RushPath;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "pathName", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "waypoints", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Socket.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinStack.ts', './Player.ts', './FollowerMovement.ts', './FollowerGhostState.ts', './SocketPreviewSlots.ts', './SocketGuideArrow.ts', './FallingCoinVisual.ts', './AtlasNumber.ts', './SocketGauge.ts', './CoinEvents.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, MeshRenderer, Color, Vec3, instantiate, Component, CoinStack, Player, FollowerMovement, FollowerGhostState, SocketPreviewSlots, SocketGuideArrow, FallingCoinVisual, AtlasNumber, SocketGauge, CoinEvents, CoinEventName;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      MeshRenderer = module.MeshRenderer;
      Color = module.Color;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      CoinStack = module.CoinStack;
    }, function (module) {
      Player = module.Player;
    }, function (module) {
      FollowerMovement = module.FollowerMovement;
    }, function (module) {
      FollowerGhostState = module.FollowerGhostState;
    }, function (module) {
      SocketPreviewSlots = module.SocketPreviewSlots;
    }, function (module) {
      SocketGuideArrow = module.SocketGuideArrow;
    }, function (module) {
      FallingCoinVisual = module.FallingCoinVisual;
    }, function (module) {
      AtlasNumber = module.AtlasNumber;
    }, function (module) {
      SocketGauge = module.SocketGauge;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _class3;
      cclegacy._RF.push({}, "55591+TB29AD4xIs+FeIqzD", "Socket", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** SocketManager가 activate() 시 넘겨주는 값 묶음 — 이 소켓 하나가 채워졌을 때 필요한 모든 것 */

      /**
       * 코인을 소비해 추종 캐릭터를 보상으로 주는 소켓 1개의 동작.
       * 물리 콜라이더 없이 플레이어와의 거리로 진입을 판정한다 (이 프로젝트의 MapBounds/Monster
       * 등과 동일한 방식). 임시로 단순 Plane 비주얼을 쓰되, 소켓마다 랜덤 색을 입혀 서로 구분되게 한다.
       *
       * 플레이어가 반경 안에 머무는 동안, 등 뒤 코인 스택의 맨 위 코인을 depositInterval마다
       * 하나씩 실제로 뽑아(CoinStack.popTop) 소켓으로 빠르게 날려보낸다 — 장식용 코인을 새로
       * 만드는 게 아니라 캐릭터 등에 쌓여있던 그 코인 노드를 그대로 재사용한다. 가진 코인이
       * 부족하면 그만큼만 우선 흡수하고 대기하다가, 이후 코인이 더 쌓이면 이어서 자동으로
       * 마저 흡수한다(중간에 멈추지 않고 차근차근 채워짐). 요구량을 모두 흡수하면(코인이
       * 실제로 소켓에 도착 완료) 추종 캐릭터를 스폰하고 스스로 파괴된다.
       */
      var Socket = exports('Socket', (_dec = ccclass('Socket'), _dec2 = property({
        displayName: '발동 반경(m)',
        tooltip: '플레이어가 이 거리 안에 있는 동안 코인을 순차적으로 흡수함'
      }), _dec3 = property({
        displayName: '코인 흡수 간격(초)',
        tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감'
      }), _dec4 = property({
        displayName: '코인 비행 시간(초)',
        tooltip: '코인 한 개가 스택 위치에서 소켓까지 날아가는 데 걸리는 시간'
      }), _dec5 = property({
        displayName: '코인 비행 중 튀어오르는 높이(m)',
        tooltip: '몬스터 처치 시 코인이 튀어오르는 것과 같은 연출 — 소켓으로 들어가는 동안 살짝 위로 볼록하게 튀었다가 들어감'
      }), _dec6 = property({
        displayName: '착지 팝 최고 배율',
        tooltip: '소켓 도착 순간 원래 크기 대비 얼마나 커졌다가 사라지는지'
      }), _dec7 = property({
        displayName: '착지 팝 지속시간(초)',
        tooltip: '도착 후 확대→축소(소멸)까지 걸리는 시간'
      }), _dec8 = property({
        displayName: '고스트→실체화 전환 시간(초)',
        tooltip: '소켓을 다 채운 순간, 소켓 위에 서있던 미리보기 추종자의 프레넬/반투명 factor가 0으로 내려가며 실체화되는 데 걸리는 시간'
      }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Socket, _Component);
        function Socket() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "radius", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "depositInterval", _descriptor2, _assertThisInitialized(_this));
          // ── 코인 비행 연출 (FallingCoinVisual에 전달) ──────────────────────────
          // FallingCoinVisual은 런타임에 addComponent()로 붙는 컴포넌트라 그 자체엔 씬에 저장되는
          // 인스펙터 값이 없다 — Coin/CoinPool과 동일한 패턴으로, 모든 수치는 여기 Socket(프리팹)
          // 인스펙터에서 조정하고 spawn 시점에 그대로 전달한다.
          _initializerDefineProperty(_this, "flightDuration", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "flightArcHeight", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "popPeakScale", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "popDuration", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "ghostFadeDuration", _descriptor7, _assertThisInitialized(_this));
          _this._setup = null;
          _this._fulfilled = false;
          /** 스택에서 아직 뽑아야 할 남은 개수 — 이게 0이 되면 더 이상 흡수 시도를 하지 않음 */
          _this._toPop = 0;
          /** 아직 소켓에 "도착 완료"하지 않은 개수 — 0이 되는 순간 보상을 지급함 */
          _this._remaining = 0;
          _this._depositTimer = 0;
          _this._label = null;
          _this._gauge = null;
          /** socket_L 전용: 소켓 위에 서서 생산을 기다리는 고스트 미리보기 추종자들이 설 자리
           * (SocketPreviewSlots가 "PreviewSlot0","PreviewSlot1"... 자식 노드를 스캔해 관리 — 배치는
           * 프리팹 편집 화면에서 그 마커 노드들을 직접 드래그해 조정한다, FollowerFormation과 동일한 방식) */
          _this._previewSlots = null;
          /** 현재 소켓 위에 서 있는 고스트 미리보기 추종자 인스턴스 (충족 시 이 인스턴스들을 그대로 실체화한다) */
          _this._previewFollowers = [];
          /** socket_L/socket_S에 내장된 유도 화살표 UI. showGuideArrow 설정에 따라 표시 여부를 제어한다 */
          _this._guideArrow = null;
          return _this;
        }
        var _proto = Socket.prototype;
        _proto.onLoad = function onLoad() {
          var _this$_findByExactNam;
          // 소켓마다 랜덤한 색의 머티리얼 인스턴스를 입혀서 서로 구분되게 한다
          // (공유 머티리얼을 그대로 쓰면 전체 소켓이 동시에 같은 색이 되어버림).
          // 바디 메쉬 노드는 variant(socket_large/socket_mini)마다 자식 순서/중첩 깊이가 달라서
          // getComponentInChildren(MeshRenderer)로 "첫 번째"를 집으면 게이지나 코인 장식 메쉬가
          // 잘못 걸릴 수 있다 — 이름이 "socket"/"socket.001"인 노드를 정확히 찾아 그 아래에서만 찾는다.
          var bodyNode = (_this$_findByExactNam = this._findByExactName(this.node, ['socket', 'socket.001'])) != null ? _this$_findByExactNam : this.node;
          var mr = bodyNode.getComponentInChildren(MeshRenderer);
          var inst = mr == null ? void 0 : mr.getMaterialInstance(0);
          inst == null || inst.setProperty('mainColor', new Color(Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), 255));

          // 요구/남은 코인 개수 라벨은 프리팹 안에 실제 3D 자식(CoinLabel)으로 붙어있다 —
          // 2D UI 오버레이가 아니라 소켓 오브젝트 위에 그대로 얹혀서 트랜스폼을 상속받는다.
          this._label = this.getComponentInChildren(AtlasNumber);
          this._gauge = this.getComponentInChildren(SocketGauge);
          // socket_L에만 붙어있고 socket_S 등 다른 variant에는 없을 수 있음 — 없으면 null
          // (고스트 미리보기 없이 기존 즉시-스폰 방식으로만 동작).
          this._previewSlots = this.getComponent(SocketPreviewSlots);
          this._guideArrow = this.getComponentInChildren(SocketGuideArrow);
        }

        /** root(포함)부터 자식들을 재귀로 훑어 이름이 정확히 일치하는 첫 노드를 반환 */;
        _proto._findByExactName = function _findByExactName(root, names) {
          if (names.includes(root.name)) return root;
          for (var _iterator = _createForOfIteratorHelperLoose(root.children), _step; !(_step = _iterator()).done;) {
            var child = _step.value;
            var found = this._findByExactName(child, names);
            if (found) return found;
          }
          return null;
        }

        /** SocketManager가 스폰 직후 호출 */;
        _proto.activate = function activate(setup) {
          var _this$_guideArrow;
          this._setup = setup;
          this._fulfilled = false;
          this._toPop = setup.requiredCoins;
          this._remaining = setup.requiredCoins;
          this._depositTimer = 0;
          this.depositInterval = setup.depositInterval;
          this._refreshDisplay();
          this._spawnPreviewFollowers();

          // 이 소켓 설정이 유도 화살표를 켜두지 않았으면, 등장(appear) 애니메이션 없이
          // 그냥 처음부터 안 보이게 한다 — SocketGuideArrow.show()를 호출하지 않으므로
          // 프리팹에 내장된 채로 있던 모습(비활성 전) 그대로 노출되지 않도록 즉시 꺼둔다.
          if (setup.showGuideArrow) (_this$_guideArrow = this._guideArrow) == null || _this$_guideArrow.show();else if (this._guideArrow) this._guideArrow.node.active = false;
          if (setup.showGuideArrow) Socket.activeGuideTarget = this.node;
        };
        _proto.onDestroy = function onDestroy() {
          if (Socket.activeGuideTarget === this.node) Socket.activeGuideTarget = null;
        }

        /** 요구치를 채우기 전, 소켓 위 미리보기 슬롯에 고스트(반투명+프레넬) 상태의 추종자를 미리 세워둔다.
         * 슬롯 수보다 보상 추종자 수가 많으면 넘치는 만큼은 충족 시점에 기존 방식대로 즉시 스폰한다. */;
        _proto._spawnPreviewFollowers = function _spawnPreviewFollowers() {
          this._previewFollowers = [];
          if (!this._setup || !this._previewSlots) return;
          var _this$_setup = this._setup,
            followerCount = _this$_setup.followerCount,
            followerPrefab = _this$_setup.followerPrefab,
            monsterSpawnerNode = _this$_setup.monsterSpawnerNode;
          var count = Math.min(followerCount, this._previewSlots.count);
          var pos = new Vec3();
          for (var i = 0; i < count; i++) {
            var _node$getComponent;
            var node = instantiate(followerPrefab);
            this.node.addChild(node);
            this._previewSlots.getSlotWorldPosition(i, pos);
            node.setWorldPosition(pos);

            // start()가 이번 프레임 안에 돌기 전에 넣어줘야 Player가 스포너를 정상적으로 캐싱한다
            // (old _spawnFollowers와 동일한 타이밍 요구사항 — Player.start()는 spawnerNode를 그때 딱 한 번만 읽는다).
            var player = node.getComponent(Player);
            if (player && monsterSpawnerNode) player.spawnerNode = monsterSpawnerNode;
            (_node$getComponent = node.getComponent(FollowerGhostState)) == null || _node$getComponent.enterGhost();
            this._previewFollowers.push(node);
          }
        };
        _proto._refreshDisplay = function _refreshDisplay() {
          var _this$_label;
          (_this$_label = this._label) == null || _this$_label.setValue(Math.max(0, this._remaining));
          if (this._setup) {
            var _this$_gauge;
            var total = this._setup.requiredCoins;
            (_this$_gauge = this._gauge) == null || _this$_gauge.setProgress(total > 0 ? (total - this._remaining) / total : 1);
          }
        };
        _proto.update = function update(dt) {
          if (this._fulfilled || !this._setup || this._toPop <= 0) return;
          var playerNode = this._setup.playerNode;
          if (!playerNode.isValid) return;
          if (Vec3.distance(this.node.worldPosition, playerNode.worldPosition) > this.radius) return;
          this._depositTimer += dt;
          if (this._depositTimer < this.depositInterval) return;
          this._depositTimer = 0;
          var stack = playerNode.getComponent(CoinStack);
          if (!stack || stack.count <= 0) return; // 가진 코인이 없으면 대기 — 이후 더 쌓이면 다음 틱에 이어서 흡수

          this._depositOne(stack);
        }

        /** 스택 맨 위 코인 노드를 실제로 하나 뽑아 소켓까지 빠르게 날려보낸다.
         * 착지(도착) 시점에 "남은 코인 개수" 라벨을 갱신하고, 마지막 코인이면 보상을 지급한다. */;
        _proto._depositOne = function _depositOne(stack) {
          var _this$node$scene,
            _this2 = this;
          var coinNode = stack.popTop();
          if (!coinNode) return;
          this._toPop--;
          var parent = (_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node.parent;
          var from = coinNode.worldPosition.clone();
          coinNode.setParent(parent, true); // 월드 트랜스폼(위치+회전) 유지한 채 플레이어에서 분리

          var socketPos = this.node.worldPosition;
          var to = new Vec3(socketPos.x, socketPos.y + 0.05, socketPos.z);
          var tuning = {
            flightDuration: this.flightDuration + (Math.random() - 0.5) * 0.06,
            flightArcHeight: this.flightArcHeight,
            popPeakScale: this.popPeakScale,
            popDuration: this.popDuration
          };
          coinNode.addComponent(FallingCoinVisual).activate(from, to, tuning, function () {
            _this2._remaining--;
            _this2._refreshDisplay();
            CoinEvents.emit(CoinEventName.SocketAbsorbed, _this2);
            if (_this2._remaining <= 0) _this2._completeFulfillment();
          });
        };
        _proto._completeFulfillment = function _completeFulfillment() {
          var _this$node$scene2;
          if (!this._setup) return;
          this._fulfilled = true;
          var _this$_setup2 = this._setup,
            followerCount = _this$_setup2.followerCount,
            playerNode = _this$_setup2.playerNode,
            followerPrefab = _this$_setup2.followerPrefab,
            monsterSpawnerNode = _this$_setup2.monsterSpawnerNode,
            formation = _this$_setup2.formation,
            showGuideArrow = _this$_setup2.showGuideArrow,
            isTrigger = _this$_setup2.isTrigger,
            triggerId = _this$_setup2.triggerId,
            repeatable = _this$_setup2.repeatable,
            onFulfilled = _this$_setup2.onFulfilled;
          var parent = (_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node.parent;

          // 이 소켓이 건물 트리거로 설정돼 있으면, 같은 트리거 ID를 가진 BuildingTrigger가
          // 반응하도록 전역 이벤트를 쏜다 (소켓과 건물은 서로를 직접 참조하지 않는다).
          if (isTrigger) CoinEvents.emit(CoinEventName.SocketFilled, triggerId);

          // repeatable(유닛 생산 소켓)이 아닐 때만: 유도 화살표가 켜져 있었다면, 소켓이 destroy되기
          // 전에 씬으로 먼저 분리해서 역재생(사라짐) 애니메이션이 끝까지 재생될 시간을 준 뒤
          // 스스로 정리되게 한다. repeatable 소켓은 destroy되지 않으므로 화살표도 그대로 둔다.
          if (!repeatable && showGuideArrow && this._guideArrow) {
            this._guideArrow.node.setParent(parent, true);
            this._guideArrow.hide();
          }

          // 소켓 위에서 대기하던 고스트 미리보기를 그대로 실체화한다 — 새로 스폰하지 않고
          // 같은 인스턴스가 프레넬/반투명 factor를 0으로 낮추며(fadeTo) FollowerMovement로
          // 대형 슬롯까지 걸어가게(FollowerMovement.update가 매 프레임 처리) 만든다.
          for (var _iterator2 = _createForOfIteratorHelperLoose(this._previewFollowers), _step2; !(_step2 = _iterator2()).done;) {
            var node = _step2.value;
            node.setParent(parent, true); // 월드 트랜스폼 유지한 채 소켓에서 분리 (destroy 안 되더라도 소켓 밖 대형으로 옮겨야 함)
            this._promoteFollower(node, formation);
          }
          var promotedCount = this._previewFollowers.length;
          this._previewFollowers = [];

          // 미리보기 슬롯이 모자라 고스트로 대기시키지 못했던 나머지는 기존처럼 즉시 스폰
          var overflow = followerCount - promotedCount;
          if (overflow > 0) this._spawnFollowersInstant(overflow, playerNode, followerPrefab, monsterSpawnerNode, formation);
          onFulfilled();
          if (repeatable) {
            // 파괴하지 않고 스스로 리셋 — 요구치를 다시 채우면 또 유닛을 생산한다.
            this._fulfilled = false;
            this._toPop = this._setup.requiredCoins;
            this._remaining = this._setup.requiredCoins;
            this._depositTimer = 0;
            this._refreshDisplay();
            this._spawnPreviewFollowers();
          } else {
            this.node.destroy();
          }
        }

        /** 고스트 미리보기 1개를 실체화 상태로 전환: 대형 슬롯을 예약해 걸어가게 하고, 동시에
         * ghostFactor를 0으로 fade한 뒤 원래 토온 머티리얼로 되돌린다(solidify). */;
        _proto._promoteFollower = function _promoteFollower(node, formation) {
          if (formation) {
            var _node$getComponent2;
            var move = (_node$getComponent2 = node.getComponent(FollowerMovement)) != null ? _node$getComponent2 : node.addComponent(FollowerMovement);
            move.setup(formation);
          }
          var ghost = node.getComponent(FollowerGhostState);
          if (ghost) ghost.fadeTo(0, this.ghostFadeDuration, function () {
            return ghost.solidify();
          });
        }

        /**
         * 추종 캐릭터를 즉시 스폰한다(고스트 미리보기 없이). formation이 있으면 격자 슬롯(플레이어에
         * 가까운 순서로 예약, 서로 겹치지 않음)에 배치하고 FollowerMovement로 계속 그 자리를 따라가게
         * 한다. formation이 없으면(연결 누락 등 예외 상황) 플레이어 위치에 임시로 스폰한다.
         * 미리보기 슬롯이 보상 추종자 수보다 적었을 때의 오버플로우 대비책으로만 쓰인다.
         */;
        _proto._spawnFollowersInstant = function _spawnFollowersInstant(count, playerNode, followerPrefab, spawnerNode, formation) {
          var _this$node$scene3;
          var parent = (_this$node$scene3 = this.node.scene) != null ? _this$node$scene3 : this.node.parent;
          var pos = new Vec3();
          for (var i = 0; i < count; i++) {
            var node = instantiate(followerPrefab);
            parent.addChild(node);
            var player = node.getComponent(Player);
            if (player && spawnerNode) player.spawnerNode = spawnerNode;
            if (formation) {
              var _node$getComponent3;
              var move = (_node$getComponent3 = node.getComponent(FollowerMovement)) != null ? _node$getComponent3 : node.addComponent(FollowerMovement);
              move.setup(formation);
              if (move.slotIndex >= 0) {
                formation.getSlotWorldPosition(move.slotIndex, pos);
                node.setWorldPosition(pos);
                continue;
              }
            }
            // formation이 없거나 슬롯이 꽉 찬 경우의 대비책
            node.setWorldPosition(playerNode.worldPosition);
          }
        };
        return Socket;
      }(Component), _class3.activeGuideTarget = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "radius", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "flightDuration", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "flightArcHeight", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "popPeakScale", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.35;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "popDuration", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.12;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "ghostFadeDuration", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SocketGauge.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "8d7e8Kxd1FEKIEMBc59BXfm", "SocketGauge", undefined);
      var ccclass = _decorator.ccclass;

      /**
       * 소켓 내부를 채우는 게이지. guage/guage.001 메쉬는 바닥에 눕혀진 평평한 판(Y축 두께=0)이고,
       * 블렌더에서 원점을 한쪽 끝에 맞춰둔 축은 로컬 Z축이다(glTF 익스포트 시 블렌더의 깊이 축이
       * Z로 매핑됨 — 실측 확인: Plane.009/Plane.011의 POSITION min/max가 X는 대칭, Y는 항상 0,
       * Z만 [-h, 0]으로 한쪽 끝에 원점). 그래서 onLoad() 시점의 로컬 scale.z를 "가득 찬(progress=1)"
       * 기준으로 캡처해두고, setProgress(0~1)로 scale.z만 그 비율로 줄인다.
       */
      var SocketGauge = exports('SocketGauge', (_dec = ccclass('SocketGauge'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SocketGauge, _Component);
        function SocketGauge() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._fullScaleZ = 1;
          return _this;
        }
        var _proto = SocketGauge.prototype;
        _proto.onLoad = function onLoad() {
          this._fullScaleZ = this.node.scale.z;
        };
        _proto.setProgress = function setProgress(value) {
          var p = Math.max(0, Math.min(1, value));
          var s = this.node.scale;
          this.node.setScale(s.x, s.y, this._fullScaleZ * p);
        };
        return SocketGauge;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SocketGuideArrow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Vec3, Animation, MeshRenderer, AnimationClip, Component, Color;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      Animation = module.Animation;
      MeshRenderer = module.MeshRenderer;
      AnimationClip = module.AnimationClip;
      Component = module.Component;
      Color = module.Color;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "a3aeblFqRtHHZHQgpB9pusl", "SocketGuideArrow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CLIP_NAME = 'appear';

      /**
       * 소켓(socket_L/socket_S)에 내장된, 이 소켓으로 들어가라고 알려주는 유도 UI(UI_arrow).
       * 제자리에서 위아래로 통통 튀는 모션 + 발광 효과를 항상 내며, 언제 나타나고 사라질지는
       * 전적으로 호출하는 쪽(Socket.ts)이 show()/hide()로 직접 제어한다 — 이 컴포넌트 스스로는
       * 아무 이벤트도 구독하지 않는다.
       */
      var SocketGuideArrow = exports('SocketGuideArrow', (_dec = ccclass('SocketGuideArrow'), _dec2 = property({
        displayName: '진동 진폭(m)',
        tooltip: '제자리에서 위아래로 움직이는 폭'
      }), _dec3 = property({
        displayName: '진동 속도(Hz)',
        tooltip: '초당 왕복 횟수'
      }), _dec4 = property({
        displayName: '발광 색상'
      }), _dec5 = property({
        displayName: '발광 강도',
        tooltip: '값이 클수록 밝게 빛남'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SocketGuideArrow, _Component);
        function SocketGuideArrow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "bobAmplitude", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "bobSpeed", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "glowColor", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "glowIntensity", _descriptor4, _assertThisInitialized(_this));
          _this._anim = null;
          _this._baseLocalPos = new Vec3();
          _this._bobPhase = 0;
          /** hide()가 호출되면 false — Socket.ts가 사라짐 애니메이션 직전에 이 노드를 씬 루트로
           * setParent(keepWorldTransform)하는데, 그 뒤에도 update()가 onLoad 시점(원래 소켓 밑
           * 로컬 좌표)의 _baseLocalPos로 매 프레임 위치를 되돌려버리면 새 부모 기준으로 그 값이
           * 재해석되어 화면 중앙 근처로 순간이동해버린다 — 사라지는 동안은 통통 튀는 모션을 멈춰서
           * 실제 사라진 자리에서 그대로 축소/역재생되게 한다. */
          _this._bobbing = true;
          return _this;
        }
        var _proto = SocketGuideArrow.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
          Vec3.copy(this._baseLocalPos, this.node.position);
          var mr = this.getComponentInChildren(MeshRenderer);
          var inst = mr == null ? void 0 : mr.getMaterialInstance(0);
          inst == null || inst.setProperty('emissive', this.glowColor);
          inst == null || inst.setProperty('emissiveScale', new Vec3(this.glowIntensity, this.glowIntensity, this.glowIntensity));
        };
        _proto.update = function update(dt) {
          if (!this._bobbing) return;
          this._bobPhase += dt * this.bobSpeed * Math.PI * 2;
          var y = this._baseLocalPos.y + Math.sin(this._bobPhase) * this.bobAmplitude;
          this.node.setPosition(this._baseLocalPos.x, y, this._baseLocalPos.z);
        }

        /** appear 애니메이션을 정재생하며 나타난다 */;
        _proto.show = function show() {
          var _this$_anim;
          var state = (_this$_anim = this._anim) == null ? void 0 : _this$_anim.getState(CLIP_NAME);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = 1;
          state.time = 0;
          state.play();
        }

        /** appear 애니메이션을 역재생하며 사라진 뒤, 다 사라지면 스스로 파괴된다(재사용하지 않음) */;
        _proto.hide = function hide() {
          var _this$_anim2,
            _this2 = this;
          this._bobbing = false;
          var state = (_this$_anim2 = this._anim) == null ? void 0 : _this$_anim2.getState(CLIP_NAME);
          if (!state) {
            this.node.destroy();
            return;
          }
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = -1;
          state.time = state.duration;
          state.once(Animation.EventType.FINISHED, function () {
            _this2.node.destroy();
          });
          state.play();
        };
        return SocketGuideArrow;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "bobAmplitude", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "bobSpeed", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "glowColor", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 235, 120, 255);
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "glowIntensity", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2.0;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SocketManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Socket.ts', './FollowerFormation.ts', './TriggerId.ts', './CoinEvents.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, cclegacy, _decorator, Enum, Node, Prefab, instantiate, Component, Socket, FollowerFormation, TriggerId, CoinEvents, CoinEventName;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
      _inheritsLoose = module.inheritsLoose;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Enum = module.Enum;
      Node = module.Node;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      Socket = module.Socket;
    }, function (module) {
      FollowerFormation = module.FollowerFormation;
    }, function (module) {
      TriggerId = module.TriggerId;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class4, _class5, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
      cclegacy._RF.push({}, "d1e531xjF9CgpTeEq8U3Ev1", "SocketManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 소켓 크기 변형 — 소켓마다 socket_L/socket_S 중 어느 프리팹으로 스폰할지 고른다. */
      var SocketVariant = exports('SocketVariant', /*#__PURE__*/function (SocketVariant) {
        SocketVariant[SocketVariant["L"] = 0] = "L";
        SocketVariant[SocketVariant["S"] = 1] = "S";
        return SocketVariant;
      }({}));
      Enum(SocketVariant);

      /**
       * 소켓 1개에 대한 설정 — 요구 코인 개수와 보상으로 나오는 추종자 수.
       * 인스펙터 배열의 +/- 버튼으로 몇 번째 소켓까지 있을지 자유롭게 추가/삭제한다.
       */
      var SocketConfig = exports('SocketConfig', (_dec = ccclass('SocketConfig'), _dec2 = property({
        type: SocketVariant,
        displayName: '소켓 크기',
        tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지 — 아래 SocketManager의 두 프리팹 슬롯 중 하나가 실제로 쓰인다'
      }), _dec3 = property({
        displayName: '요구 코인 개수'
      }), _dec4 = property({
        displayName: '보상 추종자 수'
      }), _dec5 = property({
        displayName: '코인 흡수 간격(초)',
        tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)'
      }), _dec6 = property({
        displayName: '유도 화살표 UI 표시',
        tooltip: '체크하면 이 소켓이 등장할 때 socket_L/socket_S에 내장된 유도 화살표(3D_arrow)가 함께 나타나고, 동시에 메인 캐릭터에 붙은 나침반 화살표(GuideCompass)도 이 소켓 방향을 가리키기 시작한다 — 둘 다 이 소켓이 요구치를 다 채우는 순간 사라진다'
      }), _dec7 = property({
        type: Node,
        displayName: '소켓 위치(개별)',
        tooltip: '이 소켓이 등장할 위치. 비워두면 아래 SocketManager의 공용 "소켓 스폰 위치"를 대신 사용한다 — 소켓마다 자기 자리를 씬에 마커 노드로 만들어 여기 드래그'
      }), _dec8 = property({
        displayName: '건물 트리거 여부',
        tooltip: '체크하면 이 소켓이 요구치를 다 채우는 순간 아래 "트리거 ID"로 전역 건물 건설 이벤트(CoinEvents.SocketFilled)를 발동한다 — 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 트리거 ID를 가진 것이 반응해 건설 애니메이션을 재생한다'
      }), _dec9 = property({
        type: TriggerId,
        displayName: '트리거 ID',
        tooltip: '"건물 트리거 여부"가 체크된 경우에만 의미 있음 — 씬에 배치할 건물의 BuildingTrigger.triggerId와 같은 값으로 맞춰야 반응한다'
      }), _dec(_class = (_class2 = function SocketConfig() {
        _initializerDefineProperty(this, "variant", _descriptor, this);
        _initializerDefineProperty(this, "requiredCoins", _descriptor2, this);
        _initializerDefineProperty(this, "followerCount", _descriptor3, this);
        _initializerDefineProperty(this, "depositInterval", _descriptor4, this);
        _initializerDefineProperty(this, "showGuideArrow", _descriptor5, this);
        _initializerDefineProperty(this, "spawnPoint", _descriptor6, this);
        _initializerDefineProperty(this, "isTrigger", _descriptor7, this);
        _initializerDefineProperty(this, "triggerId", _descriptor8, this);
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variant", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return SocketVariant.L;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "requiredCoins", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followerCount", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "showGuideArrow", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "spawnPoint", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "isTrigger", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "triggerId", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return TriggerId.None;
        }
      })), _class2)) || _class));

      /**
       * 소켓을 순서대로 한 번에 하나씩만 스폰한다. 현재 소켓이 코인을 다 채워 보상을
       * 지급하면 스스로 사라지고(Socket.ts), 그 알림을 받아 다음 소켓(있다면)을 이어서 스폰한다.
       *
       * 씬 시작과 동시에 스폰하지 않는다 — UnitSocketManager가 지정된 유닛 생산 소켓을 처음
       * 채워 CoinEvents.BuildingSocketsUnlocked를 emit할 때까지 대기했다가 그때 첫 소켓을 스폰한다.
       */
      var SocketManager = exports('SocketManager', (_dec10 = ccclass('SocketManager'), _dec11 = property({
        type: [SocketConfig],
        displayName: '소켓 목록',
        tooltip: '등장 순서대로. 1번=배열의 0번째. 배열 +/- 버튼으로 개수 자유롭게 조정'
      }), _dec12 = property({
        type: Node,
        displayName: '소켓 스폰 위치',
        tooltip: '소켓이 등장할 고정 위치(기지 앞). 씬에서 이 노드를 드래그해 정확한 위치로 조정'
      }), _dec13 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (L)',
        tooltip: '소켓 목록에서 "소켓 크기"를 L로 설정한 소켓이 사용할 프리팹 (socket_L)'
      }), _dec14 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (S)',
        tooltip: '소켓 목록에서 "소켓 크기"를 S로 설정한 소켓이 사용할 프리팹 (socket_S)'
      }), _dec15 = property({
        type: Prefab,
        displayName: '추종자 프리팹'
      }), _dec16 = property({
        type: Node,
        displayName: '플레이어 노드'
      }), _dec17 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '보상으로 나온 추종자가 몬스터를 찾을 수 있도록 연결 (Follower 프리팹은 프리팹 특성상 이 참조를 저장할 수 없어 스폰 시점에 코드로 주입함)'
      }), _dec18 = property({
        displayName: '다음 소켓 등장 대기시간(초)',
        tooltip: '한 소켓을 채운 뒤 같은 자리에 다음 소켓이 나타나기까지의 지연 시간. 코인을 한꺼번에 많이 모아둔 상태에서 여러 소켓이 동시에 반응해버리는 것을 방지'
      }), _dec10(_class4 = (_class5 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SocketManager, _Component);
        function SocketManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "sockets", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spawnPoint", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "socketPrefab", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "socketPrefabS", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "followerPrefab", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "playerNode", _descriptor14, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "monsterSpawnerNode", _descriptor15, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "nextSocketDelay", _descriptor16, _assertThisInitialized(_this));
          _this._index = 0;
          _this._formation = null;
          _this._unlocked = false;
          return _this;
        }
        var _proto = SocketManager.prototype;
        _proto.start = function start() {
          if (this.playerNode) this._formation = this.playerNode.getComponent(FollowerFormation);
          CoinEvents.on(CoinEventName.BuildingSocketsUnlocked, this._onUnlocked, this);
        };
        _proto.onDestroy = function onDestroy() {
          CoinEvents.off(CoinEventName.BuildingSocketsUnlocked, this._onUnlocked, this);
        };
        _proto._onUnlocked = function _onUnlocked() {
          if (this._unlocked) return;
          this._unlocked = true;
          this._spawnCurrent();
        };
        _proto._spawnCurrent = function _spawnCurrent() {
          var _config$spawnPoint,
            _node$getComponent,
            _this2 = this;
          if (!this.playerNode || !this.followerPrefab) return;
          if (this._index >= this.sockets.length) return;
          var config = this.sockets[this._index];
          var prefab = config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
          if (!prefab) return; // 해당 크기의 소켓 프리팹이 연결 안 돼 있으면 스폰하지 않음

          var spawnAt = (_config$spawnPoint = config.spawnPoint) != null ? _config$spawnPoint : this.spawnPoint;
          if (!spawnAt) return; // 개별/공용 스폰 위치가 둘 다 없으면 스폰하지 않음

          var node = instantiate(prefab);
          this.node.addChild(node);
          node.setWorldPosition(spawnAt.worldPosition);
          var socket = (_node$getComponent = node.getComponent(Socket)) != null ? _node$getComponent : node.addComponent(Socket);
          var setup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: config.isTrigger,
            triggerId: config.triggerId,
            repeatable: false,
            onFulfilled: function onFulfilled() {
              return _this2._onSocketFulfilled();
            }
          };
          socket.activate(setup);
        };
        _proto._onSocketFulfilled = function _onSocketFulfilled() {
          var _this3 = this;
          this._index++;
          // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 진입하면 다음 소켓이 같은 자리에서
          // 즉시(같은 프레임/바로 다음 프레임에) 곧바로 충족되어 버려 "동시에 터지는" 것처럼
          // 보이는 문제가 있었다 — 일정 시간 텀을 둬서 확실히 순차적으로 등장하게 한다.
          this.scheduleOnce(function () {
            return _this3._spawnCurrent();
          }, this.nextSocketDelay);
        };
        return SocketManager;
      }(Component), (_descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "sockets", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "spawnPoint", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefab", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefabS", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "followerPrefab", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "playerNode", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "nextSocketDelay", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      })), _class5)) || _class4));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SocketPreviewSlots.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './env'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Material, Vec3, Node, utils, primitives, MeshRenderer, Component, EDITOR_NOT_IN_PREVIEW;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Material = module.Material;
      Vec3 = module.Vec3;
      Node = module.Node;
      utils = module.utils;
      primitives = module.primitives;
      MeshRenderer = module.MeshRenderer;
      Component = module.Component;
    }, function (module) {
      EDITOR_NOT_IN_PREVIEW = module.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "700dcTVnttHdKoJjDkDR01u", "SocketPreviewSlots", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property,
        executeInEditMode = _decorator.executeInEditMode;
      var DEBUG_CONTAINER_NAME = '__PreviewSlotDebug__';
      var MARKER_SIZE = 0.2; // 디버그 박스 한 변 길이(m)

      /**
       * 소켓(socket_L) 위에서 생산 대기 중인 고스트 미리보기 추종자들이 설 자리를 정의한다.
       * FollowerFormation.ts와 완전히 동일한 방식: 슬롯 하나하나가 이 노드(소켓)의 자식 노드로
       * 존재하고("PreviewSlot0", "PreviewSlot1", ... 이름 순서로 자동 인식) 씬 뷰/프리팹 편집
       * 화면에서 각 자식 노드를 직접 드래그해 원하는 배치(격자든 한 줄이든 무엇이든)를 자유롭게
       * 잡을 수 있다. 이름의 숫자 순서가 곧 배정 순서(Socket.ts가 요구 추종자 수만큼 앞에서부터
       * 채워 세운다).
       *
       * 슬롯 노드 자체는 빈 노드라 눈에 띄지 않으므로, showDebugMarkers를 켜두면 각 슬롯 위치에
       * 작은 박스를 그려 한눈에 배치를 확인하며 드래그할 수 있게 해준다 — Play/빌드 중에는
       * 항상 자동으로 숨겨진다.
       */
      var SocketPreviewSlots = exports('SocketPreviewSlots', (_dec = ccclass('SocketPreviewSlots'), _dec2 = property({
        displayName: '슬롯 마커 표시',
        tooltip: '체크하면 씬/프리팹 편집 중에만 각 슬롯 위치에 작은 박스를 그려 눈으로 바로 확인/드래그할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec3 = property(Material), _dec(_class = executeInEditMode(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SocketPreviewSlots, _Component);
        function SocketPreviewSlots() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._showDebugMarkers = true;
          _initializerDefineProperty(_this, "debugMaterial", _descriptor, _assertThisInitialized(_this));
          _this._slots = [];
          _this._debugContainer = null;
          _this._debugMarkers = [];
          _this._markerMesh = null;
          return _this;
        }
        var _proto = SocketPreviewSlots.prototype;
        _proto.onLoad = function onLoad() {
          this._collectSlots();
          // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
          // 첫 프레임에서만 검사하면 프리팹 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
          {
            this._ensureContainer().active = false;
          }
        };
        _proto.update = function update() {
          // 디버그 마커는 씬/프리팹 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다.
          return;
        }

        /** 현재 인식된 슬롯 개수 */;
        /** index번째 슬롯의 실시간 월드 좌표 (슬롯 노드를 옮기면 즉시 반영됨) */
        _proto.getSlotWorldPosition = function getSlotWorldPosition(index, out) {
          Vec3.copy(out, this._slots[index].worldPosition);
          return out;
        };
        _proto._collectSlots = function _collectSlots() {
          var found = [];
          for (var _iterator = _createForOfIteratorHelperLoose(this.node.children), _step; !(_step = _iterator()).done;) {
            var child = _step.value;
            if (child.name === DEBUG_CONTAINER_NAME) continue;
            var m = /^PreviewSlot(\d+)$/.exec(child.name);
            if (m) found.push({
              index: parseInt(m[1], 10),
              node: child
            });
          }
          found.sort(function (a, b) {
            return a.index - b.index;
          });
          this._slots = found.map(function (f) {
            return f.node;
          });
        };
        _proto._ensureContainer = function _ensureContainer() {
          if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
          var c = this.node.getChildByName(DEBUG_CONTAINER_NAME);
          if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
          }
          c.setPosition(0, 0, 0);
          c.setRotationFromEuler(0, 0, 0);
          c.setScale(1, 1, 1);
          this._debugContainer = c;
          this._debugMarkers = c.children.slice();
          return c;
        };
        _proto._ensureMarkerCount = function _ensureMarkerCount(count) {
          var container = this._ensureContainer();
          if (!this._markerMesh) {
            this._markerMesh = utils.createMesh(primitives.box({
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              length: MARKER_SIZE
            }));
          }
          while (this._debugMarkers.length < count) {
            var marker = new Node("marker_" + this._debugMarkers.length);
            container.addChild(marker);
            var mr = marker.addComponent(MeshRenderer);
            mr.mesh = this._markerMesh;
            if (this.debugMaterial) mr.setMaterial(this.debugMaterial, 0);
            this._debugMarkers.push(marker);
          }
          for (var i = count; i < this._debugMarkers.length; i++) this._debugMarkers[i].active = false;
          for (var _i = 0; _i < count; _i++) this._debugMarkers[_i].active = true;
        };
        _proto._redrawDebug = function _redrawDebug() {
          if (this._slots.length === 0) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
          }
          this._ensureContainer().active = true;
          this._ensureMarkerCount(this._slots.length);
          for (var i = 0; i < this._slots.length; i++) {
            this._debugMarkers[i].setWorldPosition(this._slots[i].worldPosition);
          }
        };
        _createClass(SocketPreviewSlots, [{
          key: "showDebugMarkers",
          get: function get() {
            return this._showDebugMarkers;
          },
          set: function set(v) {
            this._showDebugMarkers = v;
            this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
          }
        }, {
          key: "count",
          get: function get() {
            return this._slots.length;
          }
        }]);
        return SocketPreviewSlots;
      }(Component), (_applyDecoratedDescriptor(_class2.prototype, "showDebugMarkers", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugMarkers"), _class2.prototype), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "debugMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TowerAttack.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterSpawner.ts', './Bullet.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, Node, AnimationClip, Mesh, Material, Vec3, Quat, Animation, director, Component, MonsterSpawner, Bullet;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      AnimationClip = module.AnimationClip;
      Mesh = module.Mesh;
      Material = module.Material;
      Vec3 = module.Vec3;
      Quat = module.Quat;
      Animation = module.Animation;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      MonsterSpawner = module.MonsterSpawner;
    }, function (module) {
      Bullet = module.Bullet;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19;
      cclegacy._RF.push({}, "5a5eeqE6UxNXqeAFX+hu7gq", "TowerAttack", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 트리거로 지어진 화살탑(Tower)의 자동 공격. Player.ts와 같은 방식(가장 가까운 몬스터를
       * 찾아 화살을 쏘고 Bullet이 알아서 날아가 데미지를 준다)이지만, 탑 자체(node)는 움직이거나
       * 돌지 않고 — 크로스보우 조준부(`Root_Bow` 본)만 몬스터 쪽으로 회전한다. 발사 순간에는 탑의
       * `shot` 애니메이션 클립을 재생한다.
       *
       * `combatEnabled`는 기본 false — `BuildingTrigger`가 이 탑의 트리거 조건을 만족시키는
       * 순간(건설 완료)에만 true로 켠다. 그 전까지는 조준/발사 둘 다 하지 않는다.
       */
      var TowerAttack = exports('TowerAttack', (_dec = ccclass('TowerAttack'), _dec2 = property({
        type: Node,
        displayName: '조준 본(Root_Bow)',
        tooltip: '몬스터 쪽으로 회전시킬 크로스보우 조준부 노드 — 탑 전체가 아니라 이 노드만 돈다'
      }), _dec3 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec4 = property({
        type: AnimationClip,
        displayName: '발사 애니메이션 클립(shot)',
        tooltip: '발사할 때마다 재생할 클립 — 탑의 Animation 컴포넌트에 이미 들어있는 clips 중 하나를 지정'
      }), _dec5 = property(Mesh), _dec6 = property(Material), _dec7 = property(Mesh), _dec8 = property(Material), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TowerAttack, _Component);
        function TowerAttack() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "aimBone", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spawnerNode", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "clipAttack", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowMesh", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowMat", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxHitMesh", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxHitMat", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxScaleStart", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxScaleMid", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxScaleEnd", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxSizeRandomMin", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxSizeRandomMax", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxOpacity", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxOpacityRandomMin", _descriptor14, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fxOpacityRandomMax", _descriptor15, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRate", _descriptor16, _assertThisInitialized(_this));
          // shots / second
          _initializerDefineProperty(_this, "attackDamage", _descriptor17, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRange", _descriptor18, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "arrowSpeed", _descriptor19, _assertThisInitialized(_this));
          /** BuildingTrigger가 이 탑을 건설 완료시키기 전까지는 false — 조준도 발사도 안 한다. */
          _this.combatEnabled = false;
          _this._spawner = null;
          _this._anim = null;
          _this._attackTimer = 0;
          _this._dir = new Vec3();
          _this._qLocal = new Quat();
          /** Root_Bow의 로컬 Z축이 곧 월드 수직(Y)축과 정확히 일치한다(본 rest pose 실측 확인).
           * 그래서 몬스터 조준은 로컬 Z 회전 하나로 처리한다 — 부모(Bone_Tower)가 어떤 각도로
           * 서있든(탑마다 배치 회전이 달라도) 항상 올바른 수평 방향을 향하게 된다. */
          _this._restForwardYawDeg = 0;
          _this._restCalibrated = false;
          _this._hasPendingAim = false;
          return _this;
        }
        var _proto = TowerAttack.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent;
          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
        };
        _proto.start = function start() {
          if (this.spawnerNode) this._spawner = this.spawnerNode.getComponent(MonsterSpawner);
          this._calibrateRestYaw();
        }

        /** Root_Bow는 rest pose에서 로컬 회전이 항등(identity)이라, 부모(Bone_Tower)의 월드 회전이
         * 곧 Root_Bow의 rest 월드 회전이다. 이 부모는 TowerAttack이 절대 건드리지 않으므로 한 번만
         * 계산해서 캐싱해도 된다. 본의 로컬 -Y(실측 결과 +Y는 정반대로 나와서 뒤집음)를 크로스보우가
         * 바라보는 정면으로 보고, 그 방향이 rest pose에서 실제로 향하는 절대 각도(도)를 구해둔다 —
         * 이후 매 프레임 "목표 방향 각도 - 이 각도"만큼만 로컬 Z로 돌리면 정확히 목표를 향하게 된다. */;
        _proto._calibrateRestYaw = function _calibrateRestYaw() {
          var _this$aimBone;
          if (!((_this$aimBone = this.aimBone) != null && _this$aimBone.parent)) return;
          var fwd = Vec3.transformQuat(new Vec3(), new Vec3(0, -1, 0), this.aimBone.parent.worldRotation);
          this._restForwardYawDeg = Math.atan2(fwd.x, fwd.z) * 180 / Math.PI;
          this._restCalibrated = true;
        };
        _proto.update = function update(dt) {
          if (!this.combatEnabled || !this.aimBone) {
            this._hasPendingAim = false;
            return;
          }
          if (!this._restCalibrated) this._calibrateRestYaw();
          var target = this._findNearest();
          if (!target) {
            this._hasPendingAim = false;
            return;
          }

          // 조준부만 몬스터 쪽으로 회전 (탑 본체는 고정). Root_Bow의 로컬 Z축 = 월드 수직축이므로,
          // "목표를 향하는 절대 각도"에서 "rest pose가 향하는 절대 각도"를 뺀 만큼만 로컬 Z로
          // 돌리면 부모의 배치 회전과 무관하게 항상 정확히 목표를 향한다.
          // 실제로 노드에 적용하는 건 lateUpdate()에서 한다 — SkeletalAnimation의 매 프레임 샘플링이
          // 일반 update() "이후"에 일어나서, 여기서 바로 적용하면 shot 클립이 계속 재생 중일 때
          // 그 샘플링 결과가 뒤늦게 덮어써서 회전이 안 먹히는 문제가 있었다.
          var bonePos = this.aimBone.worldPosition;
          Vec3.subtract(this._dir, target.worldPosition, bonePos);
          this._dir.y = 0;
          if (this._dir.lengthSqr() > 0.0001) {
            var targetYawDeg = Math.atan2(this._dir.x, this._dir.z) * 180 / Math.PI;
            var localZDeg = targetYawDeg - this._restForwardYawDeg;
            Quat.fromAxisAngle(this._qLocal, Vec3.UNIT_Z, localZDeg * Math.PI / 180);
            this._hasPendingAim = true;
          }
          this._attackTimer += dt;
          if (this._attackTimer >= 1 / this.attackRate) {
            this._attackTimer = 0;
            this._shoot(target);
          }
        };
        _proto.lateUpdate = function lateUpdate() {
          if (this._hasPendingAim && this.aimBone) this.aimBone.setRotation(this._qLocal);
        };
        _proto._findNearest = function _findNearest() {
          if (!this._spawner) return null;
          var myPos = this.node.worldPosition;
          var best = null;
          var minDist = this.attackRange;
          for (var _iterator = _createForOfIteratorHelperLoose(this._spawner.activeMonsters), _step; !(_step = _iterator()).done;) {
            var m = _step.value;
            if (m.isDead || !m.node.isValid) continue;
            var d = Vec3.distance(m.node.worldPosition, myPos);
            if (d < minDist) {
              minDist = d;
              best = m.node;
            }
          }
          return best;
        };
        _proto._shoot = function _shoot(target) {
          this._playAttackClip();
          var from = this.aimBone.worldPosition;
          var dx = target.worldPosition.x - from.x;
          var dz = target.worldPosition.z - from.z;
          var horizLen = Math.hypot(dx, dz) || 1;
          var fwdX = dx / horizLen;
          var fwdZ = dz / horizLen;
          var spawnFwd = 0.6;
          var spawnHeight = 0.5;
          var scene = director.getScene();
          if (!scene) return;
          var bNode = new Node('Bullet');
          scene.addChild(bNode);
          bNode.setWorldPosition(from.x + fwdX * spawnFwd, from.y + spawnHeight, from.z + fwdZ * spawnFwd);
          var fxParams = {
            scaleStart: this.fxScaleStart,
            scaleMid: this.fxScaleMid,
            scaleEnd: this.fxScaleEnd,
            sizeRandomMin: this.fxSizeRandomMin,
            sizeRandomMax: this.fxSizeRandomMax,
            opacity: this.fxOpacity,
            opacityRandomMin: this.fxOpacityRandomMin,
            opacityRandomMax: this.fxOpacityRandomMax
          };
          bNode.addComponent(Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this.arrowMat, this.fxHitMesh, this.fxHitMat, fxParams);
        }

        /** shot 클립을 매번 처음부터 한 번만 재생 (defaultClip인 appear와 같은 Animation 컴포넌트를
         * 공유하므로, 발사 순간 appear가 아직 재생 중이었다면 그 자리에서 끊기고 shot으로 넘어간다).
         * Player.ts의 AtkSpeed와 같은 방식으로, 클립 한 사이클이 발사 주기(1/attackRate)와
         * 일치하도록 재생 속도를 보정한다 — 공격속도가 빨라지면 애니메이션도 그만큼 빨리 재생된다.
         * 이 클립도 Root_Bow 회전 커브를 갖고 있지만, TowerAttack.update()가 매 프레임 그 뒤에
         * 다시 조준 회전으로 덮어쓰므로(같은 프레임에서 스크립트가 항상 나중에 실행됨) 실제로는
         * 조준 추적이 우선한다 — 크로스보우가 항상 몬스터를 보며 쏘는 것을 더 중요하게 봤다. */;
        _proto._playAttackClip = function _playAttackClip() {
          if (!this._anim || !this.clipAttack || this.attackRate <= 0) return;
          var state = this._anim.getState(this.clipAttack.name);
          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = this.clipAttack.duration * this.attackRate;
          state.time = 0;
          state.play();
        };
        return TowerAttack;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "aimBone", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "clipAttack", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "arrowMesh", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "arrowMat", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMesh", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMat", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleStart", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleMid", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleEnd", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "attackRate", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 20;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TriggerId.ts", ['cc'], function (exports) {
  var cclegacy, Enum;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Enum = module.Enum;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ce66djNqgRMlJigTSPwI1dK", "TriggerId", undefined);

      /** 소켓 충족으로 발동되는 "건물 건설 트리거" 식별자. 소켓 목록에서 소켓마다 하나씩 골라
       * 두면, 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 값을 가진 것이 반응한다. 소켓과
       * 건물은 서로를 직접 참조하지 않고 이 값(과 CoinEvents.SocketFilled 이벤트)으로만 연결된다. */
      var TriggerId = exports('TriggerId', /*#__PURE__*/function (TriggerId) {
        TriggerId[TriggerId["None"] = 0] = "None";
        TriggerId[TriggerId["Trigger1"] = 1] = "Trigger1";
        TriggerId[TriggerId["Trigger2"] = 2] = "Trigger2";
        TriggerId[TriggerId["Trigger3"] = 3] = "Trigger3";
        TriggerId[TriggerId["Trigger4"] = 4] = "Trigger4";
        TriggerId[TriggerId["Trigger5"] = 5] = "Trigger5";
        TriggerId[TriggerId["Trigger6"] = 6] = "Trigger6";
        return TriggerId;
      }({}));
      Enum(TriggerId);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UIAutoFit.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Camera, UITransform, view, Size, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Camera = module.Camera;
      UITransform = module.UITransform;
      view = module.view;
      Size = module.Size;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _class;
      cclegacy._RF.push({}, "071cfs6gXlCP6R9IjaIU38Q", "UIAutoFit", undefined);
      var ccclass = _decorator.ccclass,
        executionOrder = _decorator.executionOrder;

      /**
       * UIAutoFit - 가로/세로 화면 모두 UI가 올바르게 표시되도록 UICamera orthoHeight와
       * Canvas contentSize를 동적으로 조정합니다.
       *
       * - 세로(portrait, aspect < 1): 720 단위 폭 고정
       * - 가로(landscape, aspect >= 1): 720 단위 높이 고정
       */
      var UIAutoFit = exports('UIAutoFit', (_dec = ccclass('UIAutoFit'), _dec2 = executionOrder(-200), _dec(_class = _dec2(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(UIAutoFit, _Component);
        function UIAutoFit() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._camera = null;
          _this._canvasUITransform = null;
          return _this;
        }
        var _proto = UIAutoFit.prototype;
        _proto.onLoad = function onLoad() {
          this._camera = this.getComponent(Camera);
          var canvasNode = this.node.parent;
          if (canvasNode) {
            this._canvasUITransform = canvasNode.getComponent(UITransform);
          }
          this._updateLayout();
          view.on('canvas-resize', this._updateLayout, this);
        };
        _proto.onDestroy = function onDestroy() {
          view.off('canvas-resize', this._updateLayout, this);
        };
        _proto._updateLayout = function _updateLayout() {
          if (!this._camera || !this._canvasUITransform) return;
          var px = view.getVisibleSizeInPixel();
          if (px.width <= 0 || px.height <= 0) return;
          var aspect = px.width / px.height;

          // 세로: 너비 720 고정 → orthoH = 360 / aspect
          // 가로: 높이 720 고정 → orthoH = 360
          var orthoH = aspect < 1 ? 360 / aspect : 360;
          this._camera.orthoHeight = orthoH;
          var canvasW = orthoH * aspect * 2;
          var canvasH = orthoH * 2;
          this._canvasUITransform.contentSize = new Size(canvasW, canvasH);
        };
        return UIAutoFit;
      }(Component)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UnitSocketManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Socket.ts', './SocketManager.ts', './FollowerFormation.ts', './MonsterSpawner.ts', './TriggerId.ts', './CoinEvents.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, cclegacy, _decorator, Node, Prefab, instantiate, Component, Socket, SocketVariant, FollowerFormation, MonsterSpawner, TriggerId, CoinEvents, CoinEventName;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
      _inheritsLoose = module.inheritsLoose;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      Socket = module.Socket;
    }, function (module) {
      SocketVariant = module.SocketVariant;
    }, function (module) {
      FollowerFormation = module.FollowerFormation;
    }, function (module) {
      MonsterSpawner = module.MonsterSpawner;
    }, function (module) {
      TriggerId = module.TriggerId;
    }, function (module) {
      CoinEvents = module.CoinEvents;
      CoinEventName = module.CoinEventName;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class4, _class5, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
      cclegacy._RF.push({}, "2e97c6TG35CIIvYgyfHL1Ht", "UnitSocketManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 유닛 생산 소켓 1개에 대한 설정. 건물 트리거 소켓(SocketManager)과 마찬가지로 목록 순서대로
       * 하나씩만 등장하고 1회성이다(요구치를 채우면 사라짐) — 다른 점은 각 소켓마다 자기만의 고정
       * 위치가 있다는 것뿐이다(공용 위치 없음, spawnPoint 필수).
       */
      var UnitSocketConfig = exports('UnitSocketConfig', (_dec = ccclass('UnitSocketConfig'), _dec2 = property({
        type: SocketVariant,
        displayName: '소켓 크기',
        tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지'
      }), _dec3 = property({
        displayName: '요구 코인 개수'
      }), _dec4 = property({
        displayName: '생산 유닛 수',
        tooltip: '요구치를 채우는 순간(1회) 생산되는 유닛 수'
      }), _dec5 = property({
        displayName: '코인 흡수 간격(초)',
        tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)'
      }), _dec6 = property({
        type: Node,
        displayName: '소켓 위치(필수)',
        tooltip: '이 소켓이 등장할 자리 — 목록의 각 소켓마다 자기 자리가 다르므로 반드시 지정해야 한다'
      }), _dec7 = property({
        displayName: '유도 화살표 UI 표시'
      }), _dec(_class = (_class2 = function UnitSocketConfig() {
        _initializerDefineProperty(this, "variant", _descriptor, this);
        _initializerDefineProperty(this, "requiredCoins", _descriptor2, this);
        _initializerDefineProperty(this, "followerCount", _descriptor3, this);
        _initializerDefineProperty(this, "depositInterval", _descriptor4, this);
        _initializerDefineProperty(this, "spawnPoint", _descriptor5, this);
        _initializerDefineProperty(this, "showGuideArrow", _descriptor6, this);
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variant", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return SocketVariant.L;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "requiredCoins", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "followerCount", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "spawnPoint", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showGuideArrow", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      })), _class2)) || _class));

      /**
       * 유닛 생산 소켓 전용 매니저. 건물 건축 소켓(SocketManager)과 동일하게 목록 순서대로 하나씩만
       * 등장시키고, 요구치를 채우면 사라지고(1회성) 대기시간 후 다음 소켓이 등장한다 — 다른 점은
       * 각 소켓마다 자기만의 고정 위치를 쓴다는 것뿐이다(공용 스폰 위치 없음).
       *
       * 지정된 개수(기본 3개, 즉 목록의 0~2번)만큼 소켓을 완료하면 건물 건축 소켓(SocketManager)이
       * 그때부터 등장하기 시작한다 — CoinEvents.BuildingSocketsUnlocked로 느슨하게 연결됨.
       */
      var UnitSocketManager = exports('UnitSocketManager', (_dec8 = ccclass('UnitSocketManager'), _dec9 = property({
        type: [UnitSocketConfig],
        displayName: '유닛 생산 소켓 목록',
        tooltip: '등장 순서대로. 1번=배열의 0번째. 한 번에 하나만 등장하며, 요구치를 채우면 사라지고 대기시간 후 다음 소켓이 등장한다'
      }), _dec10 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (L)'
      }), _dec11 = property({
        type: Prefab,
        displayName: '소켓 프리팹 (S)'
      }), _dec12 = property({
        type: Prefab,
        displayName: '유닛(추종자) 프리팹'
      }), _dec13 = property({
        type: Node,
        displayName: '플레이어 노드'
      }), _dec14 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec15 = property({
        displayName: '다음 소켓 등장 대기시간(초)',
        tooltip: '한 소켓이 요구치를 채우고 사라진 뒤 다음 소켓이 나타나기까지의 지연 시간'
      }), _dec16 = property({
        displayName: '첫 생산 완료 시 시작할 러쉬 이름',
        tooltip: '1번째 소켓이 요구치를 채우는 순간 이 이름의 러쉬를 시작한다'
      }), _dec17 = property({
        displayName: '첫 생산 완료 시 추가로 1회만 시작할 러쉬 이름',
        tooltip: '게임 시작 직후 소켓에 코인을 넣고 첫 러쉬가 도착하기까지의 텀을 줄이기 위한 1회성 추가 러쉬 (예: 경로 중간 지점에서 바로 등장). 비워두면 추가 러쉬 없음. firstRushName과 마찬가지로 딱 한 번만 시작된다'
      }), _dec18 = property({
        displayName: '건물 소켓 해금까지 필요한 완료 소켓 개수',
        tooltip: '유닛 생산 소켓을 이 개수만큼 순서대로 완료하면(기본 3 = 0,1,2번) 건물 건축 소켓(SocketManager)이 그때부터 등장하기 시작한다'
      }), _dec8(_class4 = (_class5 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(UnitSocketManager, _Component);
        function UnitSocketManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "sockets", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "socketPrefab", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "socketPrefabS", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "followerPrefab", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "playerNode", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "monsterSpawnerNode", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "nextSocketDelay", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "firstRushName", _descriptor14, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "firstRushExtraName", _descriptor15, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "unlockBuildingSocketsAfterCount", _descriptor16, _assertThisInitialized(_this));
          _this._index = 0;
          _this._formation = null;
          _this._rushStarted = false;
          _this._buildingSocketsUnlocked = false;
          return _this;
        }
        var _proto = UnitSocketManager.prototype;
        _proto.start = function start() {
          if (this.playerNode) this._formation = this.playerNode.getComponent(FollowerFormation);
          this._spawnCurrent();
        };
        _proto._spawnCurrent = function _spawnCurrent() {
          var _node$getComponent,
            _this2 = this;
          if (!this.playerNode || !this.followerPrefab) return;
          if (this._index >= this.sockets.length) return;
          var config = this.sockets[this._index];
          if (!config.spawnPoint) return; // 이 소켓의 고정 위치가 지정 안 돼 있으면 스폰하지 않음
          var prefab = config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
          if (!prefab) return;
          var node = instantiate(prefab);
          this.node.addChild(node);
          node.setWorldPosition(config.spawnPoint.worldPosition);
          var socket = (_node$getComponent = node.getComponent(Socket)) != null ? _node$getComponent : node.addComponent(Socket);
          var setup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: false,
            triggerId: TriggerId.None,
            repeatable: false,
            onFulfilled: function onFulfilled() {
              return _this2._onSocketFulfilled();
            }
          };
          socket.activate(setup);
        };
        _proto._onSocketFulfilled = function _onSocketFulfilled() {
          var _this3 = this;
          // 1번째 소켓이 요구치를 채우는 순간 러쉬를 시작한다 (한 번만).
          if (!this._rushStarted && this._index === 0) {
            var _this$monsterSpawnerN;
            this._rushStarted = true;
            var spawner = (_this$monsterSpawnerN = this.monsterSpawnerNode) == null ? void 0 : _this$monsterSpawnerN.getComponent(MonsterSpawner);
            spawner == null || spawner.startRushByName(this.firstRushName);
            if (this.firstRushExtraName) spawner == null || spawner.startRushByName(this.firstRushExtraName);
          }
          this._index++;

          // 지정된 개수만큼(기본 3개, 0~2번) 완료되는 순간 건물 건축 소켓 스폰을 풀어준다.
          // SocketManager.ts가 이 이벤트를 구독해서 그전까지는 건물 소켓을 하나도 스폰하지 않는다.
          if (!this._buildingSocketsUnlocked && this._index >= this.unlockBuildingSocketsAfterCount) {
            this._buildingSocketsUnlocked = true;
            CoinEvents.emit(CoinEventName.BuildingSocketsUnlocked);
          }

          // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 다음 소켓이 같은 자리에서 즉시 충족되어
          // 버리는 것을 방지 — SocketManager와 동일한 이유의 지연.
          this.scheduleOnce(function () {
            return _this3._spawnCurrent();
          }, this.nextSocketDelay);
        };
        return UnitSocketManager;
      }(Component), (_descriptor7 = _applyDecoratedDescriptor(_class5.prototype, "sockets", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefab", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefabS", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "followerPrefab", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "playerNode", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class5.prototype, "nextSocketDelay", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class5.prototype, "firstRushName", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1';
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class5.prototype, "firstRushExtraName", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1_Intro';
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class5.prototype, "unlockBuildingSocketsAfterCount", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      })), _class5)) || _class4));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/VirtualWall.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './env'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Material, Node, MeshRenderer, utils, primitives, Component, EDITOR_NOT_IN_PREVIEW;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Material = module.Material;
      Node = module.Node;
      MeshRenderer = module.MeshRenderer;
      utils = module.utils;
      primitives = module.primitives;
      Component = module.Component;
    }, function (module) {
      EDITOR_NOT_IN_PREVIEW = module.EDITOR_NOT_IN_PREVIEW;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _class3;
      cclegacy._RF.push({}, "c9879872fNG67QieNgJQ/cD", "VirtualWall", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property,
        executeInEditMode = _decorator.executeInEditMode;
      var GIZMO_NODE_NAME = '__VirtualWallGizmo__';

      /**
       * 건물이 서 있는 자리를 캐릭터/몬스터가 통과하지 못하게 막는 "가상의 벽".
       * 실제로 렌더링되는 건물 메쉬와는 완전히 별개의 노드다 — 이 노드 자신의 위치/회전/스케일이
       * 곧 막을 영역 그 자체이므로(스케일 1 = 가로세로 1m 정육면체 기준), 씬/프리팹 편집 화면에서
       * 평소에 오브젝트를 옮기고 늘리는 것과 똑같은 방식으로 드래그해서 크기를 맞추면 된다 —
       * "프리팹 기준 스케일 1일 때의 폭" 같은 별도 숫자 계산이 필요 없다.
       *
       * 건물(Tower/Wall/Door1 등) 프리팹 안에 자식 노드로 넣어두면, 그 건물이 씬에서 어떤
       * 스케일로 배치되든 부모-자식 변환 합성 덕분에 이 벽도 자동으로 같은 비율로 늘어난다.
       *
       * BuildingTrigger가 소켓 완료로 건물이 "등장"하는 바로 그 순간 activate()를 호출해야
       * 실제로 막기 시작한다 — 그 전(트리거 전 숨겨진 상태)에는 항상 통과 가능.
       */
      var VirtualWall = exports('VirtualWall', (_dec = ccclass('VirtualWall'), _dec2 = property({
        displayName: '여유 마진(m)',
        tooltip: '캐릭터가 벽에 파묻히지 않도록 이 노드의 실제 크기보다 살짝 넓게 막을 여유분(캐릭터 반경 정도) — 스케일과 무관하게 항상 실제 미터 단위'
      }), _dec3 = property({
        displayName: '외곽선 표시',
        tooltip: '체크하면 씬 뷰(편집 중)에서만 이 노드의 실제 위치/회전/스케일 그대로 반투명 박스를 그려서 막힐 영역을 눈으로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.'
      }), _dec4 = property({
        type: Material,
        displayName: '외곽선 재질',
        tooltip: '반투명 박스에 쓸 재질 — VirtualWall.prefab에 미리 지정해두었으므로 보통은 건드릴 필요 없다'
      }), _dec(_class = executeInEditMode(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(VirtualWall, _Component);
        function VirtualWall() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "margin", _descriptor, _assertThisInitialized(_this));
          _this._showDebugOutline = true;
          _initializerDefineProperty(_this, "gizmoMaterial", _descriptor2, _assertThisInitialized(_this));
          _this._gizmo = null;
          /** BuildingTrigger가 건설(등장) 시점에 true로 켜주기 전까지는 막지 않는다 */
          _this._active = false;
          // ── 판정용 캐시 — 건물은 activate() 이후 절대 움직이거나 회전하지 않으므로,
          // blocks() 호출마다 매번 위치/삼각함수를 다시 구하지 않고 activate() 시점에 한 번만
          // 계산해둔다. Player+최대 40마리 몬스터가 매 프레임 모든 벽에 대해 이 함수를 부르는
          // 핫패스라, 여기서 아낀 게 그대로 체감 성능으로 이어진다.
          _this._cachedX = 0;
          _this._cachedZ = 0;
          _this._cachedCos = 1;
          _this._cachedSin = 0;
          _this._cachedHalfW = 0;
          _this._cachedHalfD = 0;
          /** 바깥 경계원(half-diagonal+margin)의 제곱 — 이 밖이면 회전 변환까지 갈 것도 없이 즉시 통과 */
          _this._cachedBoundRadiusSq = 0;
          return _this;
        }
        var _proto = VirtualWall.prototype;
        /** 건설 완료(등장) 시점에 BuildingTrigger가 호출 — 이 순간부터 통과 불가.
         * 이 시점의 실제 worldPosition/worldRotation/worldScale을 그대로 읽어서 캐싱하므로,
         * 이 노드를 어떤 부모 아래 어떤 스케일로 배치했든 "지금 실제로 보이는 그 크기"가 그대로
         * 판정 크기가 된다. */
        _proto.activate = function activate() {
          var p = this.node.worldPosition;
          var s = this.node.worldScale;
          var angle = -this._yaw(this.node.worldRotation);
          this._cachedX = p.x;
          this._cachedZ = p.z;
          this._cachedCos = Math.cos(angle);
          this._cachedSin = Math.sin(angle);
          this._cachedHalfW = Math.abs(s.x) / 2 + this.margin;
          this._cachedHalfD = Math.abs(s.z) / 2 + this.margin;
          var r = Math.hypot(this._cachedHalfW, this._cachedHalfD);
          this._cachedBoundRadiusSq = r * r;
          this._active = true;
        };
        _proto.onEnable = function onEnable() {
          VirtualWall.all.push(this);
        };
        _proto.onDisable = function onDisable() {
          var i = VirtualWall.all.indexOf(this);
          if (i >= 0) VirtualWall.all.splice(i, 1);
        }

        /** 이 벽이 월드 (x,z) 지점을 막고 있는지 (활성화 전이면 항상 통과 가능) */;
        _proto.blocks = function blocks(x, z) {
          if (!this._active) return false;
          var dx = x - this._cachedX,
            dz = z - this._cachedZ;

          // 조기 컷: 벽 중심에서 (여유분 포함) 최대 반경 밖이면 회전 변환 계산 없이 바로 통과.
          if (dx * dx + dz * dz > this._cachedBoundRadiusSq) return false;
          var lx = dx * this._cachedCos - dz * this._cachedSin;
          var lz = dx * this._cachedSin + dz * this._cachedCos;
          return Math.abs(lx) <= this._cachedHalfW && Math.abs(lz) <= this._cachedHalfD;
        }

        /** 등록된 벽 중 하나라도 (x,z)를 막고 있으면 true */;
        VirtualWall.isBlocked = function isBlocked(x, z) {
          for (var _iterator = _createForOfIteratorHelperLoose(VirtualWall.all), _step; !(_step = _iterator()).done;) {
            var w = _step.value;
            if (w.blocks(x, z)) return true;
          }
          return false;
        };
        _proto._yaw = function _yaw(q) {
          // 건물은 지면에 눕지 않는다고 가정하고 Y축 회전만 추출
          return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
        }

        // ── 에디터 디버그 시각화 ──────────────────────────────────────────────
        // 이 노드 자신의 로컬 변환은 절대 건드리지 않고, 로컬 트랜스폼이 항등(identity)인
        // 자식 노드 하나에 1x1x1 큐브 메쉬를 얹어둔다 — 부모(이 노드)의 실제 위치/회전/스케일이
        // 그대로 상속되므로 "지금 이 노드가 어떤 모양으로 막고 있는지"를 별도 계산 없이 그대로
        // 보여준다.
        ;

        _proto.onLoad = function onLoad() {
          {
            this._ensureGizmo().active = false;
            return;
          }
        };
        _proto._ensureGizmo = function _ensureGizmo() {
          var _this$_gizmo$getCompo;
          if (!this._gizmo || !this._gizmo.isValid) {
            var g = this.node.getChildByName(GIZMO_NODE_NAME);
            if (!g) {
              g = new Node(GIZMO_NODE_NAME);
              this.node.addChild(g);
              g.setPosition(0, 0, 0);
              g.setRotationFromEuler(0, 0, 0);
              g.setScale(1, 1, 1);
            }
            this._gizmo = g;
          }
          // 큐브 메쉬는 utils.createMesh()로 그때그때 만드는 런타임 전용 리소스라 에셋 UUID가
          // 없다 — 프리팹/씬을 저장했다가 다시 열면(자식 노드 자체는 남아있어도) mesh 참조가
          // 되살아나지 않는다. 그래서 "노드가 이미 있으니 끝" 하고 넘기지 않고, 매번 mesh가
          // 비어있는지 검사해서 없으면 다시 만들어 채워준다.
          var mr = (_this$_gizmo$getCompo = this._gizmo.getComponent(MeshRenderer)) != null ? _this$_gizmo$getCompo : this._gizmo.addComponent(MeshRenderer);
          if (!mr.mesh) mr.mesh = utils.createMesh(primitives.box({
            width: 1,
            height: 1,
            length: 1
          }));
          if (this.gizmoMaterial && mr.sharedMaterial !== this.gizmoMaterial) mr.setMaterial(this.gizmoMaterial, 0);
          return this._gizmo;
        };
        _createClass(VirtualWall, [{
          key: "showDebugOutline",
          get: function get() {
            return this._showDebugOutline;
          },
          set: function set(v) {
            this._showDebugOutline = v;
            this._gizmo && (this._gizmo.active = v && EDITOR_NOT_IN_PREVIEW);
          }
        }]);
        return VirtualWall;
      }(Component), _class3.all = [], _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "margin", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "showDebugOutline", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "showDebugOutline"), _class2.prototype), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "gizmoMaterial", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WorldUIAnchor.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Camera, Vec3, UITransform, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Camera = module.Camera;
      Vec3 = module.Vec3;
      UITransform = module.UITransform;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "baac7lU9VhKybNJEve7mKg4", "WorldUIAnchor", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 이 UI 노드를 3D 월드의 target 노드 위(offsetY)의 화면 위치에 매 프레임 고정시킨다 */
      var WorldUIAnchor = exports('WorldUIAnchor', (_dec = ccclass('WorldUIAnchor'), _dec2 = property(Node), _dec3 = property(Camera), _dec4 = property({
        displayName: '높이 오프셋',
        tooltip: 'target 위로 띄울 높이 (월드 단위)'
      }), _dec5 = property({
        displayName: '화면 여백',
        tooltip: '화면 경계에서 이만큼 안쪽으로 clamp (px)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WorldUIAnchor, _Component);
        function WorldUIAnchor() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "target", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "worldCamera", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "offsetY", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "screenMargin", _descriptor4, _assertThisInitialized(_this));
          _this._worldPos = new Vec3();
          _this._uiPos = new Vec3();
          return _this;
        }
        var _proto = WorldUIAnchor.prototype;
        _proto.update = function update() {
          if (!this.target || !this.worldCamera || !this.node.parent) return;
          Vec3.copy(this._worldPos, this.target.worldPosition);
          this._worldPos.y += this.offsetY;
          this.worldCamera.convertToUINode(this._worldPos, this.node.parent, this._uiPos);
          var parentUI = this.node.parent.getComponent(UITransform);
          if (parentUI) {
            var halfW = parentUI.contentSize.width / 2 - this.screenMargin;
            var halfH = parentUI.contentSize.height / 2 - this.screenMargin;
            this._uiPos.x = Math.min(Math.max(this._uiPos.x, -halfW), halfW);
            this._uiPos.y = Math.min(Math.max(this._uiPos.y, -halfH), halfH);
          }
          this.node.setPosition(this._uiPos.x, this._uiPos.y, 0);
        };
        return WorldUIAnchor;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "worldCamera", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "offsetY", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "screenMargin", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 20;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});