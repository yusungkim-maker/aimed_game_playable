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
          // "순수 추적 위치(_collectPos)"는 곡선 오프셋 없이 목표를 향해 지수 감쇠로 다가가고
          // (남은 거리에 비례해서 매 프레임 좁혀지므로 처음엔 빠르고 가까워질수록 느려짐),
          // 실제로 화면에 그리는 위치에만 위로 볼록한 포물선 오프셋을 더해 곡선처럼 보이게 한다.
          this._resolveChaseTarget();
          var dist = Vec3.distance(this._collectPos, this._chaseTarget);
          if (dist <= this._tuning.collectArriveDist) {
            this._onCollected();
            return;
          }
          var ease = 1 - Math.exp(-this._tuning.collectEaseRate * dt);
          Vec3.lerp(this._collectPos, this._collectPos, this._chaseTarget, ease);
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
        /** payload: (pos: Vec3) — 몬스터 사망 지점. MonsterSpawner의 기존 onDied 콜백에서 emit (Monster.ts 원본은 미수정) */
        MonsterKilled: 'coin-economy:monster-killed',
        /** payload: (coin: Coin) — 코인 1개가 스폰되어 자석 추적을 시작함 */
        CoinSpawned: 'coin-economy:coin-spawned',
        /** payload: (coin: Coin) — 코인이 캐릭터에게 도달해 수집됨 (드롭 코인은 이 시점에 풀로 반환) */
        CoinCollected: 'coin-economy:coin-collected',
        /** payload: (count: number) — 등에 쌓인 코인 스택 개수 변경 */
        StackChanged: 'coin-economy:stack-changed',
        // ── 다음 단계(소켓 흡수/소환)에서 구현 예정 — 지금은 이름만 예약해둔 스텁.
        //    0단계 범위에서는 emit/on 어느 쪽도 구현하지 않는다.
        /** (미구현 스텁) 캐릭터가 소켓 유효 반경에 진입 */
        SocketReached: 'coin-economy:socket-reached',
        /** (미구현 스텁) 소켓이 스택에서 코인을 흡수 */
        SocketAbsorbed: 'coin-economy:socket-absorbed',
        /** (미구현 스텁) 소켓이 목표 개수를 채워 소환 이벤트 트리거 */
        SocketFilled: 'coin-economy:socket-filled'
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
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
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
        displayName: '수집 곡선 높이(m)',
        tooltip: '자석에 끌려 등 위 자리로 갈 때 위로 볼록하게 그리는 곡선의 높이. 0이면 직선 이동'
      }), _dec14 = property({
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
          _initializerDefineProperty(_this, "collectArcHeight", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "collectArriveDist", _descriptor13, _assertThisInitialized(_this));
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
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "collectArcHeight", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "collectArriveDist", [_dec14], {
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
          _this._onMonsterKilled = function (pos) {
            return _this._spawnCoin(pos);
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
        _proto._spawnCoin = function _spawnCoin(pos) {
          if (!this.coinPool || !this.playerNode || !this._player) return;
          var magnetRadius = this._player.attackRange * this.magnetRadiusRatio;
          this.coinPool.spawn(pos, this.playerNode, magnetRadius, this._stack);
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
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "dfd235dzjdFor+oBpLuh5qf", "CoinStack", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 캐릭터 등 뒤에 무제한(캡 없음)으로 쌓이는 코인 스택 비주얼. CoinCollected를 구독해
       * 코인을 하나씩 추가한다. 소켓 흡수(스택에서 코인을 빼는 동작)는 다음 단계 범위이므로
       * 여기서는 추가만 담당하고 제거는 스텁으로만 남겨둔다.
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
         * 소켓이 스택을 소비할 때 호출. 가장 최근에 쌓인(맨 위) 코인부터 count개 제거한다
         * (아래쪽 코인은 그대로라 재배치가 필요 없다). 실제로 쌓여있던 개수보다 많이 요청하면
         * 있는 만큼만 제거한다. 실제로 제거된 개수를 반환한다.
         */;
        _proto.removeCoins = function removeCoins(count) {
          var n = Math.min(count, this._stack.length);
          for (var i = 0; i < n; i++) this._stack.pop().destroy();
          if (n > 0) {
            this._reservedCount = this._stack.length; // 진행 중인 예약도 현재 스택 크기에 맞춰 재동기화
            CoinEvents.emit(CoinEventName.StackChanged, this._stack.length);
          }
          return n;
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
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FallingCoinVisual.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Vec3, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "365e0gc0kBJHJll9iGduvyC", "FallingCoinVisual", undefined);
      var ccclass = _decorator.ccclass;

      /**
       * 소켓이 코인을 소비할 때 "위에서 떨어지는" 느낌을 주기 위한 순수 장식용 1회성 비주얼.
       * 실제 스택/게임플레이 코인과는 무관하며, 도착하면 스스로 파괴된다.
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
          _this._duration = 0.4;
          return _this;
        }
        var _proto = FallingCoinVisual.prototype;
        /** 지정된 시간(duration) 동안 from → to로 가속 낙하(ease-in, 실제 중력처럼 갈수록 빨라짐)하며 떨어진다 */
        _proto.activate = function activate(from, to, duration) {
          this._from.set(from);
          this._to.set(to);
          this._duration = Math.max(0.0001, duration);
          this._timer = 0;
          this.node.setWorldPosition(from);
        };
        _proto.update = function update(dt) {
          this._timer += dt;
          var t = Math.min(1, this._timer / this._duration);
          var eased = t * t; // ease-in: 처음엔 느리게, 떨어질수록 빨라짐

          this.node.setWorldPosition(this._from.x + (this._to.x - this._from.x) * eased, this._from.y + (this._to.y - this._from.y) * eased, this._from.z + (this._to.z - this._from.z) * eased);
          if (t >= 1) this.node.destroy();
        };
        return FallingCoinVisual;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FollowerFormation.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Vec3, Component;
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
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "c60788n5b5KtpVq3wpRHtPS", "FollowerFormation", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 플레이어 등 뒤에 있다고 가정한 평면을 격자(quad grid)로 subdivide해서, 추종 캐릭터들이
       * 서로 겹치지 않고 정렬해 설 수 있는 고정된 슬롯 좌표들을 만든다.
       *
       * subdivisions=2면 1x1 평면 → 2회 분할로 4x4 칸(5x5 꼭짓점) 격자가 되고, 그 25개 꼭짓점을
       * 플레이어(로컬 원점)에 가까운 순서로 정렬해서 순서대로 나눠준다.
       */
      var FollowerFormation = exports('FollowerFormation', (_dec = ccclass('FollowerFormation'), _dec2 = property({
        displayName: '격자 전체 크기(m)',
        tooltip: '평면의 가로/세로 전체 길이 (subdivide 전 기준)'
      }), _dec3 = property({
        displayName: 'Subdivide 횟수',
        tooltip: '2면 5x5(25칸) 격자가 됨'
      }), _dec4 = property({
        displayName: '격자 원점(로컬)',
        tooltip: '캐릭터 노드 기준 등 뒤 로컬 위치. 격자의 중심이 이 위치에 온다'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FollowerFormation, _Component);
        function FollowerFormation() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "gridSize", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "subdivisions", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "origin", _descriptor3, _assertThisInitialized(_this));
          _this._slots = [];
          _this._claimed = [];
          return _this;
        }
        var _proto = FollowerFormation.prototype;
        _proto.onLoad = function onLoad() {
          this._buildGrid();
        };
        _proto._buildGrid = function _buildGrid() {
          var segments = Math.max(1, Math.pow(2, Math.max(0, this.subdivisions)));
          var verts = segments + 1;
          var half = this.gridSize / 2;
          var pts = [];
          for (var iz = 0; iz < verts; iz++) {
            for (var ix = 0; ix < verts; ix++) {
              var x = -half + this.gridSize * ix / segments;
              var z = -half + this.gridSize * iz / segments;
              pts.push(new Vec3(this.origin.x + x, this.origin.y, this.origin.z + z));
            }
          }
          // 플레이어(로컬 원점)에 가까운 순서대로 정렬
          pts.sort(function (a, b) {
            return a.length() - b.length();
          });
          this._slots = pts;
          this._claimed = new Array(pts.length).fill(false);
        }

        /** 비어있는 슬롯 중 가장 가까운 것을 하나 예약한다. 꽉 찼으면 -1 */;
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
          if (index >= 0 && index < this._claimed.length) this._claimed[index] = false;
        }

        /** 슬롯의 실시간 월드 좌표 (캐릭터가 움직이거나 돌면 같이 따라감) */;
        _proto.getSlotWorldPosition = function getSlotWorldPosition(index, out) {
          var local = this._slots[index];
          out.set(local.x, local.y, local.z);
          return Vec3.transformMat4(out, out, this.node.worldMatrix);
        };
        return FollowerFormation;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gridSize", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3.2;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "subdivisions", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "origin", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Vec3(0, 0, -1.6);
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
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Label, Sprite, Node, Component;
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
      Sprite = module.Sprite;
      Node = module.Node;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _class3;
      cclegacy._RF.push({}, "d73a4vATBpH+KUfX1MZFI7v", "GameManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameManager = exports('GameManager', (_dec = ccclass('GameManager'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Sprite), _dec5 = property(Node), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameManager, _Component);
        function GameManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "scoreLbl", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "waveLbl", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "hpBar", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "ctaPanel", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "totalWaves", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxHp", _descriptor6, _assertThisInitialized(_this));
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
          if (this.scoreLbl) this.scoreLbl.string = "Score: " + this._score;
          if (this.waveLbl) this.waveLbl.string = "Wave " + this._curWave + "/" + this.totalWaves;
          if (this.hpBar && this.hpBar.spriteFrame) {
            this.hpBar.fillRange = this._hp / this.maxHp;
          }
        };
        return GameManager;
      }(Component), _class3.instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "scoreLbl", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "waveLbl", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "ctaPanel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "totalWaves", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [property], {
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
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "17180z5sf5P2JoIksQP7JxI", "JoystickUI", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * Virtual joystick.  Place this on a 2D node with UITransform.
       * Drag a child node as 'knob'.  Read .direction (normalized Vec2) in Player.ts.
       */
      var JoystickUI = exports('JoystickUI', (_dec = ccclass('JoystickUI'), _dec2 = property(Node), _dec3 = property({
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
          _initializerDefineProperty(_this, "uiCamera", _descriptor3, _assertThisInitialized(_this));
          _this._dir = new Vec2();
          _this._active = false;
          _this._touchId = -1;
          return _this;
        }
        var _proto = JoystickUI.prototype;
        _proto.onLoad = function onLoad() {
          this._drawVisuals();
          this.node.on(Node.EventType.TOUCH_START, this._onStart, this);
          this.node.on(Node.EventType.TOUCH_MOVE, this._onMove, this);
          this.node.on(Node.EventType.TOUCH_END, this._onEnd, this);
          this.node.on(Node.EventType.TOUCH_CANCEL, this._onEnd, this);
        };
        _proto.onDestroy = function onDestroy() {
          this.node.off(Node.EventType.TOUCH_START, this._onStart, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this._onMove, this);
          this.node.off(Node.EventType.TOUCH_END, this._onEnd, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this._onEnd, this);
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
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "uiCamera", [_dec3], {
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

System.register("chunks:///_virtual/main", ['./Bullet.ts', './CameraFollow.ts', './Coin.ts', './CoinEvents.ts', './CoinPool.ts', './CoinSpawnController.ts', './CoinStack.ts', './FallingCoinVisual.ts', './FollowerFormation.ts', './FollowerMovement.ts', './GameManager.ts', './HitEffect.ts', './JoystickUI.ts', './MapBounds.ts', './Monster.ts', './MonsterSpawner.ts', './Player.ts', './RushPath.ts', './RushStartTrigger.ts', './Socket.ts', './SocketManager.ts', './UIAutoFit.ts', './WorldUIAnchor.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
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

System.register("chunks:///_virtual/Monster.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Vec3, SkeletalAnimation, SkinnedMeshRenderer, MeshRenderer, Color, Component, GameManager;
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
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
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
          _initializerDefineProperty(_this, "moveSpeed", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxHp", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackDamage", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackRange", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "attackInterval", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scoreValue", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "waypointArriveDist", _descriptor7, _assertThisInitialized(_this));
          // ── 피격 리액션 (화살에 맞았을 때) ───────────────────────────────────
          _initializerDefineProperty(_this, "knockbackDistance", _descriptor8, _assertThisInitialized(_this));
          // 넉백 이동 거리
          _initializerDefineProperty(_this, "knockbackDuration", _descriptor9, _assertThisInitialized(_this));
          // 넉백 지속 시간(초)
          _initializerDefineProperty(_this, "flashDuration", _descriptor10, _assertThisInitialized(_this));
          // 화이트 플래시 지속 시간(초)
          _initializerDefineProperty(_this, "flashIntensity", _descriptor11, _assertThisInitialized(_this));
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
          if (this._isDead) return;
          this._hp -= amt;
          this._flashWhite();
          if (hitDir) this._startKnockback(hitDir);
          if (this._hp <= 0) this._die();
        };
        _proto._startKnockback = function _startKnockback(hitDir) {
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
          var _GameManager$instance,
            _this$_onDied,
            _this$_anim,
            _this$_anim2,
            _this2 = this;
          this._isDead = true;
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
          this.node.setWorldPosition(myPos.x + dx * inv * this.moveSpeed * dt, myPos.y, myPos.z + dz * inv * this.moveSpeed * dt);
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
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "waypointArriveDist", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "flashDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.12;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "flashIntensity", [property], {
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

System.register("chunks:///_virtual/MonsterSpawner.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Monster.ts', './RushPath.ts', './CoinEvents.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Prefab, Node, instantiate, Component, Monster, RushPath, CoinEvents, CoinEventName;
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
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _dec11, _dec12, _dec13, _dec14, _class4, _class5, _descriptor10, _descriptor11, _descriptor12, _dec15, _dec16, _dec17, _class7, _class8, _descriptor13, _descriptor14;
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
      })), _class2)) || _class));

      /** 트리거로 시작되는 러쉬 하나. 여러 방향의 RushGroup을 동시에 시작시킨다 */
      var RushConfig = exports('RushConfig', (_dec11 = ccclass('RushConfig'), _dec12 = property({
        displayName: '러쉬 이름',
        tooltip: '트리거에서 startRushByName()으로 지정할 이름'
      }), _dec13 = property({
        type: [RushGroup],
        displayName: '방향별 그룹',
        tooltip: '이 러쉬가 시작될 때 동시에 스폰될 그룹들 (방향별로 하나씩)'
      }), _dec14 = property({
        displayName: '다음 러쉬',
        tooltip: '이 러쉬의 몬스터가 전부 죽으면 자동으로 시작할 러쉬 이름. 비워두면 자동 시작 없음'
      }), _dec11(_class4 = (_class5 = function RushConfig() {
        _initializerDefineProperty(this, "rushName", _descriptor10, this);
        _initializerDefineProperty(this, "groups", _descriptor11, this);
        _initializerDefineProperty(this, "nextRushName", _descriptor12, this);
      }, (_descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "rushName", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class5.prototype, "groups", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class5.prototype, "nextRushName", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      })), _class5)) || _class4));
      var MonsterSpawner = exports('MonsterSpawner', (_dec15 = ccclass('MonsterSpawner'), _dec16 = property({
        type: Node,
        displayName: '기지(집) 노드',
        tooltip: '몬스터가 최종적으로 공격할 대상. 집 에셋을 배치한 뒤 연결'
      }), _dec17 = property({
        type: [RushConfig],
        displayName: '러쉬 목록',
        tooltip: '트리거가 이름/인덱스로 시작시킬 러쉬들을 미리 등록'
      }), _dec15(_class7 = (_class8 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MonsterSpawner, _Component);
        function MonsterSpawner() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "baseNode", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "rushes", _descriptor14, _assertThisInitialized(_this));
          _this._activeMonsters = [];
          _this._running = [];
          _this._rushState = new Map();
          return _this;
        }
        var _proto = MonsterSpawner.prototype;
        _proto.update = function update(dt) {
          for (var i = this._running.length - 1; i >= 0; i--) {
            var r = this._running[i];
            r.timer += dt;
            if (r.timer >= r.group.spawnInterval) {
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

        /** 외부 트리거가 이름으로 러쉬를 시작시킬 때 호출 */;
        _proto.startRushByName = function startRushByName(name) {
          var rush = this.rushes.find(function (r) {
            return r.rushName === name;
          });
          if (rush) this.startRush(rush);else console.warn("[MonsterSpawner] rush not found: " + name);
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
          for (var _iterator = _createForOfIteratorHelperLoose(validGroups), _step; !(_step = _iterator()).done;) {
            var g = _step.value;
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
          var _this2 = this;
          if (!g.prefab || !this.baseNode || !g.path) return;
          var waypoints = g.path.waypoints.filter(function (n) {
            return n && n.isValid;
          }).map(function (n) {
            return n.worldPosition.clone();
          });
          if (waypoints.length === 0) return;
          var monster = instantiate(g.prefab);
          this.node.addChild(monster);
          monster.setScale(0.5, 0.5, 0.5);
          monster.setWorldPosition(waypoints[0]);
          var mc = monster.addComponent(Monster);
          mc.maxHp = g.hp;
          mc.moveSpeed = g.moveSpeed;
          mc.attackDamage = g.attackDamage;
          mc.attackInterval = g.attackInterval;
          mc.scoreValue = g.scoreValue;
          mc.setPath(waypoints, this.baseNode);
          this._activeMonsters.push(mc);
          var st = this._rushState.get(rush);
          if (st) st.monstersAlive++;
          mc.setOnDied(function () {
            var i = _this2._activeMonsters.indexOf(mc);
            if (i >= 0) _this2._activeMonsters.splice(i, 1);

            // 코인 경제 시스템 훅 — 원본 Monster.ts 로직은 건드리지 않고 이벤트만 emit
            CoinEvents.emit(CoinEventName.MonsterKilled, mc.node.worldPosition.clone());
            var st2 = _this2._rushState.get(rush);
            if (st2) {
              st2.monstersAlive--;
              _this2._checkRushCleared(rush, st2);
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
      }(Component), (_descriptor13 = _applyDecoratedDescriptor(_class8.prototype, "baseNode", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class8.prototype, "rushes", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      })), _class8)) || _class7));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Player.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterSpawner.ts', './Bullet.ts', './JoystickUI.ts', './MapBounds.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, cclegacy, _decorator, Node, AnimationClip, Mesh, Material, animation, Vec2, Vec3, director, Component, MonsterSpawner, Bullet, JoystickUI, MapBounds;
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
        };
        _proto.update = function update(dt) {
          var _ref, _this$moveDirOverride, _this$_joystick, _this$_animCtrl, _this$_animCtrl2;
          var dir = (_ref = (_this$moveDirOverride = this.moveDirOverride) != null ? _this$moveDirOverride : (_this$_joystick = this._joystick) == null ? void 0 : _this$_joystick.direction) != null ? _ref : Vec2.ZERO;
          var moving = dir.length() > 0.1;
          var target = this._findNearest();

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
      }(Component), _class3.UPPER_BODY_LAYER = 1, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec2], {
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

System.register("chunks:///_virtual/RushStartTrigger.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './MonsterSpawner.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Component, MonsterSpawner;
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
      MonsterSpawner = module.MonsterSpawner;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
      cclegacy._RF.push({}, "87651M+lKpPO609e+GeAGsP", "RushStartTrigger", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** 플레이어가 targetNode 근처(XZ 평면 기준)에 도달하면 러쉬를 한 번 시작시키는 트리거 */
      var RushStartTrigger = exports('RushStartTrigger', (_dec = ccclass('RushStartTrigger'), _dec2 = property(Node), _dec3 = property({
        type: Node,
        displayName: '도착 지점',
        tooltip: '플레이어가 이 노드 근처에 도달하면 트리거됨'
      }), _dec4 = property(MonsterSpawner), _dec5 = property({
        displayName: '시작할 러쉬 이름'
      }), _dec6 = property({
        displayName: '트리거 반경'
      }), _dec7 = property({
        displayName: '도착 시 타겟 비활성화'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(RushStartTrigger, _Component);
        function RushStartTrigger() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "player", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "targetNode", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spawner", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "rushName", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "triggerRadius", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "hideTargetOnTrigger", _descriptor6, _assertThisInitialized(_this));
          _this._triggered = false;
          return _this;
        }
        var _proto = RushStartTrigger.prototype;
        _proto.update = function update() {
          if (this._triggered || !this.player || !this.targetNode || !this.spawner) return;
          var p = this.player.worldPosition;
          var t = this.targetNode.worldPosition;
          var dx = p.x - t.x;
          var dz = p.z - t.z;
          if (dx * dx + dz * dz > this.triggerRadius * this.triggerRadius) return;
          this._triggered = true;
          this.spawner.startRushByName(this.rushName);
          if (this.hideTargetOnTrigger) this.targetNode.active = false;
        };
        return RushStartTrigger;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "player", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "targetNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "spawner", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "rushName", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'Rush_1';
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "triggerRadius", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "hideTargetOnTrigger", [_dec7], {
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

System.register("chunks:///_virtual/Socket.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CoinStack.ts', './Player.ts', './FollowerMovement.ts', './FallingCoinVisual.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, MeshRenderer, Color, Vec3, instantiate, Component, CoinStack, Player, FollowerMovement, FallingCoinVisual;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
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
      FallingCoinVisual = module.FallingCoinVisual;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "55591+TB29AD4xIs+FeIqzD", "Socket", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /** SocketManager가 activate() 시 넘겨주는 값 묶음 — 이 소켓 하나가 채워졌을 때 필요한 모든 것 */

      /**
       * 코인을 소비해 추종 캐릭터를 보상으로 주는 소켓 1개의 동작.
       * 물리 콜라이더 없이 플레이어와의 거리로 진입/충족을 판정한다 (이 프로젝트의 MapBounds/
       * Monster 등과 동일한 방식). 임시로 단순 Plane 비주얼을 쓰되, 소켓마다 랜덤 색을 입혀
       * 서로 구분되게 한다.
       *
       * 매 프레임 플레이어가 반경 안에 있고 등 뒤 코인 스택이 요구량 이상이면 즉시 충족 처리:
       * 스택에서 정확히 requiredCoins만큼만 소비하고(초과 소비 없음), 장식용 "코인이 위에서
       * 떨어지는" 비주얼을 재생한 뒤 추종 캐릭터를 스폰하고 스스로 파괴된다.
       */
      var Socket = exports('Socket', (_dec = ccclass('Socket'), _dec2 = property({
        displayName: '발동 반경(m)',
        tooltip: '플레이어가 이 거리 안에 들어오면 코인 충족 여부를 확인함'
      }), _dec3 = property({
        displayName: '낙하 비주얼 최대 개수',
        tooltip: '요구 코인 수가 이보다 많아도 장식용 낙하 이펙트는 이 개수까지만 생성(과도한 스폰 방지)'
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Socket, _Component);
        function Socket() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "radius", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "maxFallingVisuals", _descriptor2, _assertThisInitialized(_this));
          _this._setup = null;
          _this._fulfilled = false;
          return _this;
        }
        var _proto = Socket.prototype;
        _proto.onLoad = function onLoad() {
          // 소켓마다 랜덤한 색의 머티리얼 인스턴스를 입혀서 서로 구분되게 한다
          // (공유 머티리얼을 그대로 쓰면 전체 소켓이 동시에 같은 색이 되어버림).
          var mr = this.getComponent(MeshRenderer);
          var inst = mr == null ? void 0 : mr.getMaterialInstance(0);
          inst == null || inst.setProperty('mainColor', new Color(Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), Math.floor(80 + Math.random() * 175), 255));
        }

        /** SocketManager가 스폰 직후 호출 */;
        _proto.activate = function activate(setup) {
          this._setup = setup;
          this._fulfilled = false;
        };
        _proto.update = function update() {
          if (this._fulfilled || !this._setup) return;
          var _this$_setup = this._setup,
            playerNode = _this$_setup.playerNode,
            requiredCoins = _this$_setup.requiredCoins;
          if (!playerNode.isValid) return;
          if (Vec3.distance(this.node.worldPosition, playerNode.worldPosition) > this.radius) return;
          var stack = playerNode.getComponent(CoinStack);
          if (!stack || stack.count < requiredCoins) return;
          this._fulfill(stack);
        };
        _proto._fulfill = function _fulfill(stack) {
          if (!this._setup) return;
          this._fulfilled = true;
          var _this$_setup2 = this._setup,
            requiredCoins = _this$_setup2.requiredCoins,
            followerCount = _this$_setup2.followerCount,
            playerNode = _this$_setup2.playerNode,
            followerPrefab = _this$_setup2.followerPrefab,
            fallingCoinPrefab = _this$_setup2.fallingCoinPrefab,
            monsterSpawnerNode = _this$_setup2.monsterSpawnerNode,
            formation = _this$_setup2.formation,
            onFulfilled = _this$_setup2.onFulfilled;
          stack.removeCoins(requiredCoins);
          this._spawnFallingVisuals(Math.min(requiredCoins, this.maxFallingVisuals), fallingCoinPrefab);
          this._spawnFollowers(followerCount, playerNode, followerPrefab, monsterSpawnerNode, formation);
          onFulfilled();
          this.node.destroy();
        }

        /** 위에서 코인이 후드득 떨어지는 순수 장식용 이펙트 — 실제 스택/게임플레이와는 무관 */;
        _proto._spawnFallingVisuals = function _spawnFallingVisuals(count, prefab) {
          var _this$node$scene;
          if (!prefab || count <= 0) return;
          var parent = (_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node.parent;
          var socketPos = this.node.worldPosition;
          for (var i = 0; i < count; i++) {
            var node = instantiate(prefab);
            parent.addChild(node);
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * this.radius * 0.5;
            var from = new Vec3(socketPos.x + Math.cos(angle) * dist, socketPos.y + 2.5 + Math.random(), socketPos.z + Math.sin(angle) * dist);
            var to = new Vec3(from.x, socketPos.y + 0.05, from.z);
            node.addComponent(FallingCoinVisual).activate(from, to, 0.3 + Math.random() * 0.2);
          }
        }

        /**
         * 추종 캐릭터를 스폰한다. formation이 있으면 격자 슬롯(플레이어에 가까운 순서로 예약,
         * 서로 겹치지 않음)에 배치하고 FollowerMovement로 계속 그 자리를 따라가게 한다.
         * formation이 없으면(연결 누락 등 예외 상황) 플레이어 위치에 임시로 스폰한다.
         */;
        _proto._spawnFollowers = function _spawnFollowers(count, playerNode, followerPrefab, spawnerNode, formation) {
          var _this$node$scene2;
          var parent = (_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node.parent;
          var pos = new Vec3();
          for (var i = 0; i < count; i++) {
            var node = instantiate(followerPrefab);
            parent.addChild(node);
            var player = node.getComponent(Player);
            if (player && spawnerNode) player.spawnerNode = spawnerNode;
            if (formation) {
              var _node$getComponent;
              var move = (_node$getComponent = node.getComponent(FollowerMovement)) != null ? _node$getComponent : node.addComponent(FollowerMovement);
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
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "radius", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxFallingVisuals", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 12;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SocketManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Socket.ts', './FollowerFormation.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, _inheritsLoose, _assertThisInitialized, cclegacy, _decorator, Node, Prefab, instantiate, Component, Socket, FollowerFormation;
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
      FollowerFormation = module.FollowerFormation;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class4, _class5, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
      cclegacy._RF.push({}, "d1e531xjF9CgpTeEq8U3Ev1", "SocketManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      /**
       * 소켓 1개에 대한 설정 — 요구 코인 개수와 보상으로 나오는 추종자 수.
       * 인스펙터 배열의 +/- 버튼으로 몇 번째 소켓까지 있을지 자유롭게 추가/삭제한다.
       */
      var SocketConfig = exports('SocketConfig', (_dec = ccclass('SocketConfig'), _dec2 = property({
        displayName: '요구 코인 개수'
      }), _dec3 = property({
        displayName: '보상 추종자 수'
      }), _dec(_class = (_class2 = function SocketConfig() {
        _initializerDefineProperty(this, "requiredCoins", _descriptor, this);
        _initializerDefineProperty(this, "followerCount", _descriptor2, this);
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "requiredCoins", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "followerCount", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      })), _class2)) || _class));

      /**
       * 소켓을 순서대로 한 번에 하나씩만 스폰한다. 현재 소켓이 코인을 다 채워 보상을
       * 지급하면 스스로 사라지고(Socket.ts), 그 알림을 받아 다음 소켓(있다면)을 이어서 스폰한다.
       */
      var SocketManager = exports('SocketManager', (_dec4 = ccclass('SocketManager'), _dec5 = property({
        type: [SocketConfig],
        displayName: '소켓 목록',
        tooltip: '등장 순서대로. 1번=배열의 0번째. 배열 +/- 버튼으로 개수 자유롭게 조정'
      }), _dec6 = property({
        type: Node,
        displayName: '소켓 스폰 위치',
        tooltip: '소켓이 등장할 고정 위치(기지 앞). 씬에서 이 노드를 드래그해 정확한 위치로 조정'
      }), _dec7 = property({
        type: Prefab,
        displayName: '소켓 프리팹'
      }), _dec8 = property({
        type: Prefab,
        displayName: '추종자 프리팹'
      }), _dec9 = property({
        type: Prefab,
        displayName: '낙하 코인 비주얼 프리팹',
        tooltip: '소켓 충족 시 위에서 떨어지는 장식용 코인 (coin.glb 프리팹 재사용 가능)'
      }), _dec10 = property({
        type: Node,
        displayName: '플레이어 노드'
      }), _dec11 = property({
        type: Node,
        displayName: '몬스터 스포너 노드',
        tooltip: '보상으로 나온 추종자가 몬스터를 찾을 수 있도록 연결 (Follower 프리팹은 프리팹 특성상 이 참조를 저장할 수 없어 스폰 시점에 코드로 주입함)'
      }), _dec12 = property({
        displayName: '다음 소켓 등장 대기시간(초)',
        tooltip: '한 소켓을 채운 뒤 같은 자리에 다음 소켓이 나타나기까지의 지연 시간. 코인을 한꺼번에 많이 모아둔 상태에서 여러 소켓이 동시에 반응해버리는 것을 방지'
      }), _dec4(_class4 = (_class5 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SocketManager, _Component);
        function SocketManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "sockets", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spawnPoint", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "socketPrefab", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "followerPrefab", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "fallingCoinPrefab", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "playerNode", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "monsterSpawnerNode", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "nextSocketDelay", _descriptor10, _assertThisInitialized(_this));
          _this._index = 0;
          _this._formation = null;
          return _this;
        }
        var _proto = SocketManager.prototype;
        _proto.start = function start() {
          if (this.playerNode) this._formation = this.playerNode.getComponent(FollowerFormation);
          this._spawnCurrent();
        };
        _proto._spawnCurrent = function _spawnCurrent() {
          var _node$getComponent,
            _this2 = this;
          if (!this.socketPrefab || !this.spawnPoint || !this.playerNode || !this.followerPrefab) return;
          if (this._index >= this.sockets.length) return;
          var config = this.sockets[this._index];
          var node = instantiate(this.socketPrefab);
          this.node.addChild(node);
          node.setWorldPosition(this.spawnPoint.worldPosition);
          var socket = (_node$getComponent = node.getComponent(Socket)) != null ? _node$getComponent : node.addComponent(Socket);
          var setup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            fallingCoinPrefab: this.fallingCoinPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
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
      }(Component), (_descriptor3 = _applyDecoratedDescriptor(_class5.prototype, "sockets", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class5.prototype, "spawnPoint", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class5.prototype, "socketPrefab", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class5.prototype, "followerPrefab", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class5.prototype, "fallingCoinPrefab", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class5.prototype, "playerNode", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class5.prototype, "monsterSpawnerNode", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class5.prototype, "nextSocketDelay", [_dec12], {
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