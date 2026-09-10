System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Color, MeshRenderer, instantiate, CoinStack, Player, FollowerMovement, FollowerGhostState, SocketPreviewSlots, SocketGuideArrow, FallingCoinVisual, AtlasNumber, SocketGauge, CoinEvents, CoinEventName, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _class3, _crd, ccclass, property, Socket;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCoinStack(extras) {
    _reporterNs.report("CoinStack", "./CoinStack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerFormation(extras) {
    _reporterNs.report("FollowerFormation", "./FollowerFormation", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerMovement(extras) {
    _reporterNs.report("FollowerMovement", "./FollowerMovement", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFollowerGhostState(extras) {
    _reporterNs.report("FollowerGhostState", "./FollowerGhostState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketPreviewSlots(extras) {
    _reporterNs.report("SocketPreviewSlots", "./SocketPreviewSlots", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketGuideArrow(extras) {
    _reporterNs.report("SocketGuideArrow", "./SocketGuideArrow", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFallingCoinVisual(extras) {
    _reporterNs.report("FallingCoinVisual", "./FallingCoinVisual", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinFlightTuning(extras) {
    _reporterNs.report("CoinFlightTuning", "./FallingCoinVisual", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAtlasNumber(extras) {
    _reporterNs.report("AtlasNumber", "./AtlasNumber", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketGauge(extras) {
    _reporterNs.report("SocketGauge", "./SocketGauge", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Color = _cc.Color;
      MeshRenderer = _cc.MeshRenderer;
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      CoinStack = _unresolved_2.CoinStack;
    }, function (_unresolved_3) {
      Player = _unresolved_3.Player;
    }, function (_unresolved_4) {
      FollowerMovement = _unresolved_4.FollowerMovement;
    }, function (_unresolved_5) {
      FollowerGhostState = _unresolved_5.FollowerGhostState;
    }, function (_unresolved_6) {
      SocketPreviewSlots = _unresolved_6.SocketPreviewSlots;
    }, function (_unresolved_7) {
      SocketGuideArrow = _unresolved_7.SocketGuideArrow;
    }, function (_unresolved_8) {
      FallingCoinVisual = _unresolved_8.FallingCoinVisual;
    }, function (_unresolved_9) {
      AtlasNumber = _unresolved_9.AtlasNumber;
    }, function (_unresolved_10) {
      SocketGauge = _unresolved_10.SocketGauge;
    }, function (_unresolved_11) {
      CoinEvents = _unresolved_11.CoinEvents;
      CoinEventName = _unresolved_11.CoinEventName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "55591+TB29AD4xIs+FeIqzD", "Socket", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Color', 'Prefab', 'MeshRenderer', 'instantiate']);

      ({
        ccclass,
        property
      } = _decorator);
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
      _export("Socket", Socket = (_dec = ccclass('Socket'), _dec2 = property({
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
      }), _dec(_class = (_class2 = (_class3 = class Socket extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "radius", _descriptor, this);

          _initializerDefineProperty(this, "depositInterval", _descriptor2, this);

          // ── 코인 비행 연출 (FallingCoinVisual에 전달) ──────────────────────────
          // FallingCoinVisual은 런타임에 addComponent()로 붙는 컴포넌트라 그 자체엔 씬에 저장되는
          // 인스펙터 값이 없다 — Coin/CoinPool과 동일한 패턴으로, 모든 수치는 여기 Socket(프리팹)
          // 인스펙터에서 조정하고 spawn 시점에 그대로 전달한다.
          _initializerDefineProperty(this, "flightDuration", _descriptor3, this);

          _initializerDefineProperty(this, "flightArcHeight", _descriptor4, this);

          _initializerDefineProperty(this, "popPeakScale", _descriptor5, this);

          _initializerDefineProperty(this, "popDuration", _descriptor6, this);

          _initializerDefineProperty(this, "ghostFadeDuration", _descriptor7, this);

          this._setup = null;
          this._fulfilled = false;

          /** 스택에서 아직 뽑아야 할 남은 개수 — 이게 0이 되면 더 이상 흡수 시도를 하지 않음 */
          this._toPop = 0;

          /** 아직 소켓에 "도착 완료"하지 않은 개수 — 0이 되는 순간 보상을 지급함 */
          this._remaining = 0;
          this._depositTimer = 0;
          this._label = null;
          this._gauge = null;

          /** socket_L 전용: 소켓 위에 서서 생산을 기다리는 고스트 미리보기 추종자들이 설 자리
           * (SocketPreviewSlots가 "PreviewSlot0","PreviewSlot1"... 자식 노드를 스캔해 관리 — 배치는
           * 프리팹 편집 화면에서 그 마커 노드들을 직접 드래그해 조정한다, FollowerFormation과 동일한 방식) */
          this._previewSlots = null;

          /** 현재 소켓 위에 서 있는 고스트 미리보기 추종자 인스턴스 (충족 시 이 인스턴스들을 그대로 실체화한다) */
          this._previewFollowers = [];

          /** socket_L/socket_S에 내장된 유도 화살표 UI. showGuideArrow 설정에 따라 표시 여부를 제어한다 */
          this._guideArrow = null;
        }

        onLoad() {
          var _this$_findByExactNam;

          // 소켓마다 랜덤한 색의 머티리얼 인스턴스를 입혀서 서로 구분되게 한다
          // (공유 머티리얼을 그대로 쓰면 전체 소켓이 동시에 같은 색이 되어버림).
          // 바디 메쉬 노드는 variant(socket_large/socket_mini)마다 자식 순서/중첩 깊이가 달라서
          // getComponentInChildren(MeshRenderer)로 "첫 번째"를 집으면 게이지나 코인 장식 메쉬가
          // 잘못 걸릴 수 있다 — 이름이 "socket"/"socket.001"인 노드를 정확히 찾아 그 아래에서만 찾는다.
          const bodyNode = (_this$_findByExactNam = this._findByExactName(this.node, ['socket', 'socket.001'])) != null ? _this$_findByExactNam : this.node;
          const mr = bodyNode.getComponentInChildren(MeshRenderer);
          const inst = mr == null ? void 0 : mr.getMaterialInstance(0);
          inst == null || inst.setProperty('mainColor', new Color(Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), 255)); // 요구/남은 코인 개수 라벨은 프리팹 안에 실제 3D 자식(CoinLabel)으로 붙어있다 —
          // 2D UI 오버레이가 아니라 소켓 오브젝트 위에 그대로 얹혀서 트랜스폼을 상속받는다.

          this._label = this.getComponentInChildren(_crd && AtlasNumber === void 0 ? (_reportPossibleCrUseOfAtlasNumber({
            error: Error()
          }), AtlasNumber) : AtlasNumber);
          this._gauge = this.getComponentInChildren(_crd && SocketGauge === void 0 ? (_reportPossibleCrUseOfSocketGauge({
            error: Error()
          }), SocketGauge) : SocketGauge); // socket_L에만 붙어있고 socket_S 등 다른 variant에는 없을 수 있음 — 없으면 null
          // (고스트 미리보기 없이 기존 즉시-스폰 방식으로만 동작).

          this._previewSlots = this.getComponent(_crd && SocketPreviewSlots === void 0 ? (_reportPossibleCrUseOfSocketPreviewSlots({
            error: Error()
          }), SocketPreviewSlots) : SocketPreviewSlots);
          this._guideArrow = this.getComponentInChildren(_crd && SocketGuideArrow === void 0 ? (_reportPossibleCrUseOfSocketGuideArrow({
            error: Error()
          }), SocketGuideArrow) : SocketGuideArrow);
        }
        /** root(포함)부터 자식들을 재귀로 훑어 이름이 정확히 일치하는 첫 노드를 반환 */


        _findByExactName(root, names) {
          if (names.includes(root.name)) return root;

          for (const child of root.children) {
            const found = this._findByExactName(child, names);

            if (found) return found;
          }

          return null;
        }
        /** SocketManager가 스폰 직후 호출 */


        activate(setup) {
          var _this$_guideArrow;

          this._setup = setup;
          this._fulfilled = false;
          this._toPop = setup.requiredCoins;
          this._remaining = setup.requiredCoins;
          this._depositTimer = 0;
          this.depositInterval = setup.depositInterval;

          this._refreshDisplay();

          this._spawnPreviewFollowers(); // 이 소켓 설정이 유도 화살표를 켜두지 않았으면, 등장(appear) 애니메이션 없이
          // 그냥 처음부터 안 보이게 한다 — SocketGuideArrow.show()를 호출하지 않으므로
          // 프리팹에 내장된 채로 있던 모습(비활성 전) 그대로 노출되지 않도록 즉시 꺼둔다.


          if (setup.showGuideArrow) (_this$_guideArrow = this._guideArrow) == null || _this$_guideArrow.show();else if (this._guideArrow) this._guideArrow.node.active = false;
          if (setup.showGuideArrow) Socket.activeGuideTarget = this.node;
        }

        onDestroy() {
          if (Socket.activeGuideTarget === this.node) Socket.activeGuideTarget = null;
        }
        /** 요구치를 채우기 전, 소켓 위 미리보기 슬롯에 고스트(반투명+프레넬) 상태의 추종자를 미리 세워둔다.
         * 슬롯 수보다 보상 추종자 수가 많으면 넘치는 만큼은 충족 시점에 기존 방식대로 즉시 스폰한다. */


        _spawnPreviewFollowers() {
          this._previewFollowers = [];
          if (!this._setup || !this._previewSlots) return;
          const {
            followerCount,
            followerPrefab,
            monsterSpawnerNode
          } = this._setup;
          const count = Math.min(followerCount, this._previewSlots.count);
          const pos = new Vec3();

          for (let i = 0; i < count; i++) {
            var _node$getComponent;

            const node = instantiate(followerPrefab);
            this.node.addChild(node);

            this._previewSlots.getSlotWorldPosition(i, pos);

            node.setWorldPosition(pos); // start()가 이번 프레임 안에 돌기 전에 넣어줘야 Player가 스포너를 정상적으로 캐싱한다
            // (old _spawnFollowers와 동일한 타이밍 요구사항 — Player.start()는 spawnerNode를 그때 딱 한 번만 읽는다).

            const player = node.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
              error: Error()
            }), Player) : Player);
            if (player && monsterSpawnerNode) player.spawnerNode = monsterSpawnerNode;
            (_node$getComponent = node.getComponent(_crd && FollowerGhostState === void 0 ? (_reportPossibleCrUseOfFollowerGhostState({
              error: Error()
            }), FollowerGhostState) : FollowerGhostState)) == null || _node$getComponent.enterGhost();

            this._previewFollowers.push(node);
          }
        }

        _refreshDisplay() {
          var _this$_label;

          (_this$_label = this._label) == null || _this$_label.setValue(Math.max(0, this._remaining));

          if (this._setup) {
            var _this$_gauge;

            const total = this._setup.requiredCoins;
            (_this$_gauge = this._gauge) == null || _this$_gauge.setProgress(total > 0 ? (total - this._remaining) / total : 1);
          }
        }

        update(dt) {
          if (this._fulfilled || !this._setup || this._toPop <= 0) return;
          const {
            playerNode
          } = this._setup;
          if (!playerNode.isValid) return;
          if (Vec3.distance(this.node.worldPosition, playerNode.worldPosition) > this.radius) return;
          this._depositTimer += dt;
          if (this._depositTimer < this.depositInterval) return;
          this._depositTimer = 0;
          const stack = playerNode.getComponent(_crd && CoinStack === void 0 ? (_reportPossibleCrUseOfCoinStack({
            error: Error()
          }), CoinStack) : CoinStack);
          if (!stack || stack.count <= 0) return; // 가진 코인이 없으면 대기 — 이후 더 쌓이면 다음 틱에 이어서 흡수

          this._depositOne(stack);
        }
        /** 스택 맨 위 코인 노드를 실제로 하나 뽑아 소켓까지 빠르게 날려보낸다.
         * 착지(도착) 시점에 "남은 코인 개수" 라벨을 갱신하고, 마지막 코인이면 보상을 지급한다. */


        _depositOne(stack) {
          var _this$node$scene;

          const coinNode = stack.popTop();
          if (!coinNode) return;
          this._toPop--;
          const parent = (_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node.parent;
          const from = coinNode.worldPosition.clone();
          coinNode.setParent(parent, true); // 월드 트랜스폼(위치+회전) 유지한 채 플레이어에서 분리

          const socketPos = this.node.worldPosition;
          const to = new Vec3(socketPos.x, socketPos.y + 0.05, socketPos.z);
          const tuning = {
            flightDuration: this.flightDuration + (Math.random() - 0.5) * 0.06,
            flightArcHeight: this.flightArcHeight,
            popPeakScale: this.popPeakScale,
            popDuration: this.popDuration
          };
          coinNode.addComponent(_crd && FallingCoinVisual === void 0 ? (_reportPossibleCrUseOfFallingCoinVisual({
            error: Error()
          }), FallingCoinVisual) : FallingCoinVisual).activate(from, to, tuning, () => {
            this._remaining--;

            this._refreshDisplay();

            (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
              error: Error()
            }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
              error: Error()
            }), CoinEventName) : CoinEventName).SocketAbsorbed, this);
            if (this._remaining <= 0) this._completeFulfillment();
          });
        }

        _completeFulfillment() {
          var _this$node$scene2;

          if (!this._setup) return;
          this._fulfilled = true;
          const {
            followerCount,
            playerNode,
            followerPrefab,
            monsterSpawnerNode,
            formation,
            showGuideArrow,
            isTrigger,
            triggerId,
            repeatable,
            onFulfilled
          } = this._setup;
          const parent = (_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node.parent; // 이 소켓이 건물 트리거로 설정돼 있으면, 같은 트리거 ID를 가진 BuildingTrigger가
          // 반응하도록 전역 이벤트를 쏜다 (소켓과 건물은 서로를 직접 참조하지 않는다).

          if (isTrigger) (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).SocketFilled, triggerId); // repeatable(유닛 생산 소켓)이 아닐 때만: 유도 화살표가 켜져 있었다면, 소켓이 destroy되기
          // 전에 씬으로 먼저 분리해서 역재생(사라짐) 애니메이션이 끝까지 재생될 시간을 준 뒤
          // 스스로 정리되게 한다. repeatable 소켓은 destroy되지 않으므로 화살표도 그대로 둔다.

          if (!repeatable && showGuideArrow && this._guideArrow) {
            this._guideArrow.node.setParent(parent, true);

            this._guideArrow.hide();
          } // 소켓 위에서 대기하던 고스트 미리보기를 그대로 실체화한다 — 새로 스폰하지 않고
          // 같은 인스턴스가 프레넬/반투명 factor를 0으로 낮추며(fadeTo) FollowerMovement로
          // 대형 슬롯까지 걸어가게(FollowerMovement.update가 매 프레임 처리) 만든다.


          for (const node of this._previewFollowers) {
            node.setParent(parent, true); // 월드 트랜스폼 유지한 채 소켓에서 분리 (destroy 안 되더라도 소켓 밖 대형으로 옮겨야 함)

            this._promoteFollower(node, formation);
          }

          const promotedCount = this._previewFollowers.length;
          this._previewFollowers = []; // 미리보기 슬롯이 모자라 고스트로 대기시키지 못했던 나머지는 기존처럼 즉시 스폰

          const overflow = followerCount - promotedCount;
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
         * ghostFactor를 0으로 fade한 뒤 원래 토온 머티리얼로 되돌린다(solidify). */


        _promoteFollower(node, formation) {
          if (formation) {
            var _node$getComponent2;

            const move = (_node$getComponent2 = node.getComponent(_crd && FollowerMovement === void 0 ? (_reportPossibleCrUseOfFollowerMovement({
              error: Error()
            }), FollowerMovement) : FollowerMovement)) != null ? _node$getComponent2 : node.addComponent(_crd && FollowerMovement === void 0 ? (_reportPossibleCrUseOfFollowerMovement({
              error: Error()
            }), FollowerMovement) : FollowerMovement);
            move.setup(formation);
          }

          const ghost = node.getComponent(_crd && FollowerGhostState === void 0 ? (_reportPossibleCrUseOfFollowerGhostState({
            error: Error()
          }), FollowerGhostState) : FollowerGhostState);
          if (ghost) ghost.fadeTo(0, this.ghostFadeDuration, () => ghost.solidify());
        }
        /**
         * 추종 캐릭터를 즉시 스폰한다(고스트 미리보기 없이). formation이 있으면 격자 슬롯(플레이어에
         * 가까운 순서로 예약, 서로 겹치지 않음)에 배치하고 FollowerMovement로 계속 그 자리를 따라가게
         * 한다. formation이 없으면(연결 누락 등 예외 상황) 플레이어 위치에 임시로 스폰한다.
         * 미리보기 슬롯이 보상 추종자 수보다 적었을 때의 오버플로우 대비책으로만 쓰인다.
         */


        _spawnFollowersInstant(count, playerNode, followerPrefab, spawnerNode, formation) {
          var _this$node$scene3;

          const parent = (_this$node$scene3 = this.node.scene) != null ? _this$node$scene3 : this.node.parent;
          const pos = new Vec3();

          for (let i = 0; i < count; i++) {
            const node = instantiate(followerPrefab);
            parent.addChild(node);
            const player = node.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
              error: Error()
            }), Player) : Player);
            if (player && spawnerNode) player.spawnerNode = spawnerNode;

            if (formation) {
              var _node$getComponent3;

              const move = (_node$getComponent3 = node.getComponent(_crd && FollowerMovement === void 0 ? (_reportPossibleCrUseOfFollowerMovement({
                error: Error()
              }), FollowerMovement) : FollowerMovement)) != null ? _node$getComponent3 : node.addComponent(_crd && FollowerMovement === void 0 ? (_reportPossibleCrUseOfFollowerMovement({
                error: Error()
              }), FollowerMovement) : FollowerMovement);
              move.setup(formation);

              if (move.slotIndex >= 0) {
                formation.getSlotWorldPosition(move.slotIndex, pos);
                node.setWorldPosition(pos);
                continue;
              }
            } // formation이 없거나 슬롯이 꽉 찬 경우의 대비책


            node.setWorldPosition(playerNode.worldPosition);
          }
        }

      }, _class3.activeGuideTarget = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "radius", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "depositInterval", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.05;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "flightDuration", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.2;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "flightArcHeight", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "popPeakScale", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.35;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "popDuration", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.12;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "ghostFadeDuration", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=16cecd2f5708493644b30097544327c40fe466b9.js.map