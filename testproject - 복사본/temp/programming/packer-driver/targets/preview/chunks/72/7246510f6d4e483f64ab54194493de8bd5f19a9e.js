System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, Quat, NodeSpace, CoinEvents, CoinEventName, _dec, _class, _class2, _crd, ccclass, Coin;

  function _reportPossibleCrUseOfCoinEvents(extras) {
    _reporterNs.report("CoinEvents", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinEventName(extras) {
    _reporterNs.report("CoinEventName", "./CoinEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinPool(extras) {
    _reporterNs.report("CoinPool", "./CoinPool", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinStackTarget(extras) {
    _reporterNs.report("CoinStackTarget", "./CoinStack", _context.meta, extras);
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
      Quat = _cc.Quat;
      NodeSpace = _cc.NodeSpace;
    }, function (_unresolved_2) {
      CoinEvents = _unresolved_2.CoinEvents;
      CoinEventName = _unresolved_2.CoinEventName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b1171RFlHNFvLMAFmV1mN6p", "Coin", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat', 'NodeSpace']);

      ({
        ccclass
      } = _decorator);
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
      _export("Coin", Coin = (_dec = ccclass('Coin'), _dec(_class = (_class2 = class Coin extends Component {
        constructor() {
          super(...arguments);
          this._pool = null;
          this._target = null;
          this._stack = null;
          this._tuning = void 0;

          /** coin_ground(바닥 무더기)에서 플레이어에게 되돌아가는 코인인지. 몬스터가 떨궈 처음
           * 주워지는 코인과 구분하려고 둔다 — AudioManager가 둘에 다른 소리를 낸다. */
          this.fromGround = false;

          /** 켜면 이 코인은 영원히 그 자리에 머문다 — 자석 반경에 들어와도 수집되지 않고,
           * 대기 상한(maxWaiting)에 걸려 강제 회수되지도 않는다. 엔딩에서 몬스터를 싹쓸이할 때
           * 쏟아지는 코인이 플레이어에게 빨려가지 않고 바닥에 남게 하려고 쓴다. */
          this.stayPut = false;
          this._phase = 'idle';
          this._magnetRadiusSq = 0;
          this._baseY = 0;
          this._bobPhase = 0;
          this._spinDelta = new Quat();
          this._stackSlot = -1;
          this._chaseTarget = new Vec3();
          this._chaseDir = new Vec3();
          this._collectPos = new Vec3();
          // 곡선 오프셋을 뺀 순수 추적 위치 (렌더링용 실제 위치와 분리)
          this._collectInitialDist = 0.0001;
          // 수집 시작 시점의 거리 — 곡선 진행도 계산용
          this._popTimer = 0;
          this._popStartPos = new Vec3();
          // 스폰 시작 지점
          this._popGroundPos = new Vec3();
        }

        /** 이 코인이 collecting 단계에서 향하고 있는(또는 향했던) 스택. CoinStack/CoinGroundStack이
         * CoinCollected 수신 시 "이 코인이 정말 나를 향한 것이었는지" 구분하는 데 쓴다. */
        get stack() {
          return this._stack;
        }

        // 착지 지점 (스캐터 오프셋 적용된 XZ)

        /** CoinPool이 풀에서 꺼내 스폰할 때 호출. stack은 없어도(null) 동작하되, 그 경우 플레이어 위치로 수집된다 */
        activate(pos, target, magnetRadius, pool, tuning, stack, fromGround, stayPut) {
          if (fromGround === void 0) {
            fromGround = false;
          }

          if (stayPut === void 0) {
            stayPut = false;
          }

          this._target = target;
          this._stack = stack;
          this.fromGround = fromGround;
          this.stayPut = stayPut;
          this._stackSlot = -1;
          this._magnetRadiusSq = magnetRadius * magnetRadius;
          this._pool = pool;
          this._tuning = tuning;
          this._bobPhase = Math.random() * Math.PI * 2; // 위로만 튀지 않고 랜덤한 수평 방향/거리로도 스캐터 (popScatterFactor로 정도 조절)

          var angle = Math.random() * Math.PI * 2;
          var dist = Math.random() * tuning.popScatterFactor;

          this._popStartPos.set(pos);

          this._popGroundPos.set(pos.x + Math.cos(angle) * dist, pos.y, pos.z + Math.sin(angle) * dist);

          this.node.setWorldPosition(this._popStartPos);
          this.node.setScale(0, 0, 0);
          this.node.setRotationFromEuler(0, Math.random() * 360, 0);
          this.node.active = true;
          this._phase = 'pop';
          this._popTimer = 0; // stayPut 코인은 대기 목록에 아예 넣지 않는다 — 목록은 "언젠가 회수될 코인"의 큐라서,
          // 여기 들어가면 maxWaiting 상한에 걸리는 순간 강제로 회수돼 버린다.

          if (!this.stayPut) {
            Coin.waiting.push(this);

            this._enforceWaitingCap();
          }

          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).CoinSpawned, this);
        }
        /** maxWaiting을 넘으면 가장 오래 대기 중이던 코인부터(자석 반경에 아직 안 들어왔어도)
         * 강제로 collecting 단계로 넘겨 자리를 비운다 — 값 자체는 잃지 않고 그저 더 일찍
         * 회수(플레이어/스택 쪽으로 날아감)될 뿐이다. 화면에 동시에 존재하는 미수집 코인
         * 오브젝트 수를 상한선 아래로 유지하기 위한 최적화용. */


        _enforceWaitingCap() {
          while (Coin.waiting.length > this._tuning.maxWaiting) {
            var oldest = Coin.waiting[0];
            if (oldest === this) break; // 자기 자신만 남았는데도 초과라면(=maxWaiting이 0 이하) 무한루프 방지

            oldest._forceCollect();
          }
        }
        /** 자석 반경 진입 여부와 무관하게 즉시 collecting 단계로 전환한다 — _enforceWaitingCap()
         * 전용. pop 단계 도중이었다면(아직 튀어오르는 애니메이션 중) 스케일만 1로 마무리하고
         * 넘어간다 — collecting은 스케일을 건드리지 않으므로 그대로 두면 덜 자란 채로 날아간다. */


        _forceCollect() {
          var _this$_stack$reserveS, _this$_stack;

          if (this._phase === 'collecting') return;

          this._removeFromWaiting();

          if (this._phase === 'pop') this.node.setScale(1, 1, 1);
          this._phase = 'collecting';
          this._stackSlot = (_this$_stack$reserveS = (_this$_stack = this._stack) == null ? void 0 : _this$_stack.reserveSlot()) != null ? _this$_stack$reserveS : -1;

          this._collectPos.set(this.node.worldPosition);

          this._resolveChaseTarget();

          this._collectInitialDist = Math.max(0.0001, Vec3.distance(this._collectPos, this._chaseTarget));
        }

        _removeFromWaiting() {
          var i = Coin.waiting.indexOf(this);
          if (i >= 0) Coin.waiting.splice(i, 1);
        }

        update(dt) {
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
            if (this.stayPut) return; // 그 자리에 남는 코인 — 자석 판정 자체를 하지 않는다

            if (Vec3.squaredDistance(this.node.worldPosition, this._target.worldPosition) <= this._magnetRadiusSq) {
              var _this$_stack$reserveS2, _this$_stack2;

              this._removeFromWaiting();

              this._phase = 'collecting';
              this._stackSlot = (_this$_stack$reserveS2 = (_this$_stack2 = this._stack) == null ? void 0 : _this$_stack2.reserveSlot()) != null ? _this$_stack$reserveS2 : -1;

              this._collectPos.set(this.node.worldPosition);

              this._resolveChaseTarget();

              this._collectInitialDist = Math.max(0.0001, Vec3.distance(this._collectPos, this._chaseTarget));
            }

            return;
          } // collecting: 플레이어가 아니라 예약된 코인 탑의 다음 자리(있다면)를 향해 이동.
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
        /** 예약된 코인 탑 슬롯이 있으면 그 슬롯의 실시간 월드 좌표를, 없으면 플레이어 위치를 _chaseTarget에 채운다 */


        _resolveChaseTarget() {
          if (this._stack && this._stackSlot >= 0) {
            this._stack.getSlotWorldPosition(this._stackSlot, this._chaseTarget);
          } else {
            Vec3.copy(this._chaseTarget, this._target.worldPosition);
          }
        }

        _updatePop(dt) {
          this._popTimer += dt;
          var dur = Math.max(0.0001, this._tuning.popDuration);
          var t = Math.min(1, this._popTimer / dur); // 스케일: 0 → 1, ease-out(초반에 빠르게 팝) — t=1에서 정확히 1.0

          var s = 1 - Math.pow(1 - t, 3);
          this.node.setScale(s, s, s); // XZ: 시작점 → 착지점 선형 보간. Y: 대칭 이차 베지어(=포물선) 호로 t=0.5에서 popHeight만큼
          // 솟았다가 다시 떨어짐 — 등속이 아니라 실제 중력처럼 위에서 느려지고 아래서 빨라짐.

          var x = this._popStartPos.x + (this._popGroundPos.x - this._popStartPos.x) * t;
          var z = this._popStartPos.z + (this._popGroundPos.z - this._popStartPos.z) * t;
          var arc = 4 * this._tuning.popHeight * t * (1 - t);
          this.node.setWorldPosition(x, this._popStartPos.y + arc, z);

          if (t >= 1) {
            this._phase = 'idle';
            this._baseY = this._tuning.groundY; // 착지 순간 최종 자세 고정: 두께 보정된 groundY + 눕혀진 X 회전.
            // 자전으로 쌓여있던 Y축 헤딩(euler.y)은 그대로 유지해 부자연스러운 스냅이 없게 한다.

            this.node.setWorldPosition(x, this._tuning.groundY, z);
            var heading = this.node.eulerAngles.y;
            this.node.setRotationFromEuler(this._tuning.groundRotationX, heading, 0);
          }
        }

        _onCollected() {
          var _this$_pool;

          this._removeFromWaiting(); // 정상 경로에선 이미 빠져있지만, 안전망으로 한 번 더 확인


          (_crd && CoinEvents === void 0 ? (_reportPossibleCrUseOfCoinEvents({
            error: Error()
          }), CoinEvents) : CoinEvents).emit((_crd && CoinEventName === void 0 ? (_reportPossibleCrUseOfCoinEventName({
            error: Error()
          }), CoinEventName) : CoinEventName).CoinCollected, this);
          this._target = null;
          this._stack = null;
          (_this$_pool = this._pool) == null || _this$_pool.despawn(this.node);
        }

      }, _class2.waiting = [], _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7246510f6d4e483f64ab54194493de8bd5f19a9e.js.map