System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, SkeletalAnimation, Vec3, Color, MeshRenderer, SkinnedMeshRenderer, GameManager, VirtualWall, DoorHealth, MonsterDeadEffectSpawner, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _class3, _crd, ccclass, property, MONSTER_EJECT_SPEED_MULT, Monster;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterHealthBar(extras) {
    _reporterNs.report("MonsterHealthBar", "./MonsterHealthBar", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualWall(extras) {
    _reporterNs.report("VirtualWall", "./VirtualWall", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDoorHealth(extras) {
    _reporterNs.report("DoorHealth", "./DoorHealth", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterDeadEffectSpawner(extras) {
    _reporterNs.report("MonsterDeadEffectSpawner", "./MonsterDeadEffectSpawner", _context.meta, extras);
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
      SkeletalAnimation = _cc.SkeletalAnimation;
      Vec3 = _cc.Vec3;
      Color = _cc.Color;
      MeshRenderer = _cc.MeshRenderer;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
    }, function (_unresolved_2) {
      GameManager = _unresolved_2.GameManager;
    }, function (_unresolved_3) {
      VirtualWall = _unresolved_3.VirtualWall;
    }, function (_unresolved_4) {
      DoorHealth = _unresolved_4.DoorHealth;
    }, function (_unresolved_5) {
      MonsterDeadEffectSpawner = _unresolved_5.MonsterDeadEffectSpawner;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bf306r0zDVAcrdslf20EdYD", "Monster", undefined);

      __checkObsolete__(['_decorator', 'Component', 'SkeletalAnimation', 'Node', 'Vec3', 'Color', 'MeshRenderer', 'SkinnedMeshRenderer', 'Material']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 벽에 갇힌 몬스터를 밀어내는 속도 배율 — 평소 이동 속도의 몇 배로 빠져나올지.
       * 돌 벽 밴드 두께가 1.5m라 1배면 최대 1초쯤 벽에 박혀 보인다. */

      MONSTER_EJECT_SPEED_MULT = 3;

      _export("Monster", Monster = (_dec = ccclass('Monster'), _dec(_class = (_class2 = (_class3 = class Monster extends Component {
        constructor(...args) {
          super(...args);

          /** MonsterSpawner가 addComponent 직후 연결(있으면). 데미지/사망 시점에 갱신/숨김을 위임한다 */
          this.healthBar = null;

          /** MonsterSpawner가 RushGroup.isBoss에 따라 설정. true면 화살에 맞아도 넉백되지 않는다 */
          this.isBoss = false;

          _initializerDefineProperty(this, "moveSpeed", _descriptor, this);

          _initializerDefineProperty(this, "maxHp", _descriptor2, this);

          _initializerDefineProperty(this, "attackDamage", _descriptor3, this);

          _initializerDefineProperty(this, "attackRange", _descriptor4, this);

          _initializerDefineProperty(this, "attackInterval", _descriptor5, this);

          _initializerDefineProperty(this, "scoreValue", _descriptor6, this);

          _initializerDefineProperty(this, "coinDrop", _descriptor7, this);

          _initializerDefineProperty(this, "waypointArriveDist", _descriptor8, this);

          // ── 피격 리액션 (화살에 맞았을 때) ───────────────────────────────────
          _initializerDefineProperty(this, "knockbackDistance", _descriptor9, this);

          // 넉백 이동 거리
          _initializerDefineProperty(this, "knockbackDuration", _descriptor10, this);

          // 넉백 지속 시간(초)
          _initializerDefineProperty(this, "flashDuration", _descriptor11, this);

          // 화이트 플래시 지속 시간(초)
          _initializerDefineProperty(this, "flashIntensity", _descriptor12, this);

          // 플래시 밝기 배율 (emissiveScale)
          this._hp = 0;
          this._isDead = false;
          this._target = null;
          this._waypoints = [];
          this._wpIndex = 0;
          this._anim = null;
          this._curAnim = '';
          this._attackTimer = 0;
          this._onDied = null;

          /** 이 몬스터를 마지막으로 때린(=사망 시점 기준으로는 처치한) 발사체의 출처 노드.
           * TowerAttack이 화살을 쏠 때 자기 노드를 넘겨준다(Player가 쏜 화살은 넘기지 않아 null) —
           * MonsterSpawner가 죽었을 때 이 값을 CoinEvents.MonsterKilled에 실어보내
           * CoinSpawnController가 "어느 타워가 죽였는지"에 따라 코인을 다른 곳(coin_ground)으로
           * 보낼 수 있게 한다. */
          this._lastHitSource = null;
          this._renderers = [];
          this._knockbackDir = new Vec3();
          this._knockbackTimer = 0;
          this._flashMaterials = [];

          this._restoreFlashBound = () => this._restoreFlash();
        }

        get lastHitSource() {
          return this._lastHitSource;
        }

        /** Public read-only flag used by MonsterSpawner and Player */
        get isDead() {
          return this._isDead;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(SkeletalAnimation)) != null ? _this$getComponent : this.getComponentInChildren(SkeletalAnimation);
          this._renderers = [...this.getComponentsInChildren(SkinnedMeshRenderer), ...this.getComponentsInChildren(MeshRenderer)];
        }

        start() {
          this._hp = this.maxHp;
          if (!this._target) this._play('idle');
        }
        /** 러쉬 경로(웨이포인트)를 따라 이동한 뒤, 마지막 지점부터는 target(기지)을 공격.
         *
         * @param lane      -1~1. 경로 중심선에서 좌우 어느 쪽으로 비켜 걸을지. 몬스터마다 다른
         *                  값을 주면 한 줄로 겹쳐 걷지 않고 폭이 있는 "도로"처럼 퍼져서 이동한다.
         * @param laneWidth lane 1.0이 실제 몇 미터인지
         * @param laneTaper 마지막 웨이포인트에서의 오프셋 배율. 문처럼 좁은 통로가 경로 끝에 있으면
         *                  넓게 벌어진 채로 들어가다 벽에 걸리므로, 끝으로 갈수록 다시 좁혀준다.
         *
         * 오프셋은 여기서 한 번만 계산해 **몬스터 전용 사본**으로 들고 간다 — 원본 배열은
         * RushPath가 모든 몬스터와 공유하므로 절대 건드리면 안 되고, 매 프레임 오프셋을 더하는
         * 방식은 이동 루프에 연산을 얹으므로 피한다(스폰 때 1회 = 실행 중 추가 비용 0). */


        setPath(waypoints, target, lane = 0, laneWidth = 0, laneTaper = 1) {
          this._waypoints = lane !== 0 && laneWidth > 0 ? Monster._offsetPath(waypoints, lane * laneWidth, laneTaper) : waypoints;
          this._wpIndex = 0;
          this._target = target;

          this._play('move');
        }
        /** 경로를 진행 방향의 수직으로 offset만큼 밀어낸 새 배열을 만든다(원본 불변).
         * 끝으로 갈수록 taper 배율까지 선형으로 좁아진다. */


        static _offsetPath(src, offset, taper) {
          const n = src.length;
          if (n < 2) return src;
          const out = [];

          for (let i = 0; i < n; i++) {
            // 이 지점에서의 진행 방향 — 마지막 점은 직전 구간의 방향을 그대로 쓴다
            const a = src[i === n - 1 ? i - 1 : i];
            const b = src[i === n - 1 ? i : i + 1];
            const dx = b.x - a.x;
            const dz = b.z - a.z;
            const len = Math.hypot(dx, dz);

            if (len < 0.0001) {
              out.push(src[i].clone());
              continue;
            } // XZ 평면에서 진행 방향의 수직 벡터


            const px = dz / len;
            const pz = -dx / len;
            const k = offset * (1 + (taper - 1) * (i / (n - 1)));
            out.push(new Vec3(src[i].x + px * k, src[i].y, src[i].z + pz * k));
          }

          return out;
        }

        setOnDied(cb) {
          this._onDied = cb;
        }
        /** 코인 드롭이나 처치 콜백(_onDied) 없이 즉시 사라진다 — 정상 처치(_die)와 구분되는 강제
         * 소멸. 모든 건물 소켓을 지어 최종 보스 웨이브 후 CTA가 뜨는 순간처럼, 화면에 남은 몬스터를
         * 일괄 정리할 때 쓴다(MonsterSpawner.stopAndClearAll). */


        despawnSilently() {
          var _this$healthBar;

          if (this._isDead) return;
          this._isDead = true;
          (_this$healthBar = this.healthBar) == null || _this$healthBar.hide();
          this.node.destroy();
        }
        /** @param hitDir 화살이 날아온(진행 중이던) 방향. 지정하면 그 방향으로 넉백된다
         *  @param source 이 피해를 준 발사체의 출처 노드(예: 화살을 쏜 타워). 플레이어가 쏜
         *  화살은 null — 매번 갱신되므로 "마지막으로 맞은" 공격의 출처가 곧 사망 원인이 된다. */


        takeDamage(amt, hitDir, source = null) {
          var _this$healthBar2;

          if (this._isDead) return;
          this._hp -= amt;
          this._lastHitSource = source;
          (_this$healthBar2 = this.healthBar) == null || _this$healthBar2.onDamaged(this._hp, this.maxHp);

          this._flashWhite();

          if (hitDir) this._startKnockback(hitDir);
          if (this._hp <= 0) this._die();
        }

        _startKnockback(hitDir) {
          if (this.isBoss) return; // 보스는 화살에 맞아도 밀려나지 않는다

          const len = Math.hypot(hitDir.x, hitDir.z);
          if (len < 0.0001) return;

          this._knockbackDir.set(hitDir.x / len, 0, hitDir.z / len);

          this._knockbackTimer = this.knockbackDuration;
        }

        _flashWhite() {
          this._flashMaterials = [];

          for (const r of this._renderers) {
            const count = r.sharedMaterials.length;

            for (let i = 0; i < count; i++) {
              const inst = r.getMaterialInstance(i);
              if (!inst) continue;

              this._flashMaterials.push(inst);

              inst.setProperty('emissive', new Color(255, 255, 255, 255));
              inst.setProperty('emissiveScale', new Vec3(this.flashIntensity, this.flashIntensity, this.flashIntensity));
            }
          } // getProperty로 원래 값을 읽어 되돌리는 방식은 linear color 변환 등으로 복원이
          // 누락되는 문제가 있어, 셰이더가 정의한 기본값(emissive=검정, scale=1)으로 직접 복원한다.
          // 연속 피격 시 이전 예약을 취소하고 다시 예약해 깜빡임 없이 최신 타이밍으로 갱신.


          this.unschedule(this._restoreFlashBound);
          this.scheduleOnce(this._restoreFlashBound, this.flashDuration);
        }

        _restoreFlash() {
          for (const mat of this._flashMaterials) {
            mat.setProperty('emissive', new Color(0, 0, 0, 255));
            mat.setProperty('emissiveScale', new Vec3(1, 1, 1));
          }

          this._flashMaterials = [];
        }

        _play(name) {
          if (this._curAnim === name || !this._anim) return;
          this._curAnim = name;

          this._anim.play(name);
        }

        _die() {
          var _this$healthBar3, _instance, _this$_onDied, _instance2, _this$_anim, _this$_anim2;

          this._isDead = true;
          (_this$healthBar3 = this.healthBar) == null || _this$healthBar3.hide();
          (_instance = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance) == null || _instance.addScore(this.scoreValue);
          (_this$_onDied = this._onDied) == null || _this$_onDied.call(this); // 죽는 순간 그 자리에서 폭발 이펙트가 터진다.
          // 이펙트 크기는 몬스터 스케일(일반 0.5, 보스 1.5 등)을 따라간다.

          (_instance2 = (_crd && MonsterDeadEffectSpawner === void 0 ? (_reportPossibleCrUseOfMonsterDeadEffectSpawner({
            error: Error()
          }), MonsterDeadEffectSpawner) : MonsterDeadEffectSpawner).instance) == null || _instance2.playAt(this.node.worldPosition, this.node.worldScale.y); // 몬스터 본체는 dead 애니메이션을 끝까지 재생한 뒤에 사라진다.

          this._curAnim = 'dead';
          (_this$_anim = this._anim) == null || _this$_anim.play('dead');
          const state = (_this$_anim2 = this._anim) == null ? void 0 : _this$_anim2.getState('dead');
          const duration = state && state.duration > 0 ? state.duration : 1.5;
          this.scheduleOnce(() => this.node.destroy(), duration);
        }

        update(dt) {
          var _this$_target;

          if (this._isDead || !((_this$_target = this._target) != null && _this$_target.isValid)) return;

          if (this._knockbackTimer > 0) {
            const step = this.knockbackDistance / this.knockbackDuration * dt;
            this._knockbackTimer = Math.max(0, this._knockbackTimer - dt);
            const p = this.node.worldPosition;
            this.node.setWorldPosition(p.x + this._knockbackDir.x * step, p.y, p.z + this._knockbackDir.z * step);
            return; // 넉백 중엔 이동/공격 로직 정지
          } // 가는 길(다음 웨이포인트 또는 기지 방향)에 살아있는 문이 있으면 최우선으로 그 문을
          // 부순다 — 몬스터의 최종 목적은 기지를 부수는 것이지만, 경로 위에 문이 서있으면
          // 문을 먼저 부수지 않고는 지나갈 수 없다는 원칙.


          const dest = this._wpIndex < this._waypoints.length ? this._waypoints[this._wpIndex] : this._target.worldPosition;

          const blockingDoor = this._findBlockingDoor(dest, dt);

          if (blockingDoor) {
            this._attackDoor(blockingDoor, dt);

            return;
          } // 러쉬 경로를 따라가는 중이면 웨이포인트를 순서대로 통과


          if (this._wpIndex < this._waypoints.length) {
            const arrived = this._moveToward(this._waypoints[this._wpIndex], dt);

            if (arrived) this._wpIndex++;
            return;
          } // 경로를 다 통과했으면 기지에 접근해서 공격


          const myPos = this.node.worldPosition;
          const tPos = this._target.worldPosition;
          const dx = tPos.x - myPos.x;
          const dz = tPos.z - myPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist <= this.attackRange) {
            this._play('attack');

            this._attackTimer += dt;

            if (this._attackTimer >= this.attackInterval) {
              var _instance3;

              this._attackTimer = 0;
              (_instance3 = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
                error: Error()
              }), GameManager) : GameManager).instance) == null || _instance3.baseTakeDamage(this.attackDamage);
            }
          } else {
            this._attackTimer = 0;

            this._moveToward(tPos, dt);
          }
        }
        /** dest 방향으로 이번 프레임에 실제로 내딛을 만큼(+약간의 여유)만 앞을 살펴, 그 지점을
         * 막고 있는 활성 문이 있으면 반환한다. attackRange 등 별도 수치에 기대지 않고 "지금 이
         * 문 때문에 한 걸음도 더 못 나간다"는 사실 자체로 판정하므로, 문 크기나 몬스터별
         * attackRange 튜닝과 무관하게 항상 정확히 막혀선 순간에 감지된다. */


        _findBlockingDoor(dest, dt) {
          const myPos = this.node.worldPosition;
          const dx = dest.x - myPos.x;
          const dz = dest.z - myPos.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.0001) return null;
          const lookahead = Math.min(dist, Math.max(this.moveSpeed * dt, 0.05) + 0.05);
          const nx = myPos.x + dx / dist * lookahead;
          const nz = myPos.z + dz / dist * lookahead;

          for (const door of (_crd && DoorHealth === void 0 ? (_reportPossibleCrUseOfDoorHealth({
            error: Error()
          }), DoorHealth) : DoorHealth).all) {
            if (!door.isActive || !door.obstacle) continue;
            if (door.obstacle.blocks(nx, nz)) return door;
          }

          return null;
        }
        /** 문을 바라보고 서서 attackInterval마다 attackDamage만큼 데미지를 준다 — 기지 공격과
         * 완전히 같은 스탯을 재사용한다. 문이 부서지면(DoorHealth.all에서 스스로 빠짐) 다음
         * 프레임부터 _findBlockingDoor가 더 이상 이 문을 찾지 못해 자연히 원래 경로로 돌아간다. */


        _attackDoor(door, dt) {
          this._play('attack');

          const myPos = this.node.worldPosition;
          const dPos = door.node.worldPosition;
          this.node.setRotationFromEuler(0, Math.atan2(dPos.x - myPos.x, dPos.z - myPos.z) * 180 / Math.PI, 0);
          this._attackTimer += dt;

          if (this._attackTimer >= this.attackInterval) {
            this._attackTimer = 0;
            door.takeDamage(this.attackDamage);
          }
        }
        /** dest를 향해 한 스텝 이동. waypointArriveDist 이내면 이동하지 않고 true(도착)를 반환 */


        _moveToward(dest, dt) {
          const myPos = this.node.worldPosition;
          const dx = dest.x - myPos.x;
          const dz = dest.z - myPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.waypointArriveDist) return true;

          this._play('move');

          const inv = 1 / dist;
          let nx = myPos.x + dx * inv * this.moveSpeed * dt;
          let nz = myPos.z + dz * inv * this.moveSpeed * dt; // 벽이 하필 몬스터 위에 생겨 갇혔다면, 평소 이동 대신 그 벽의 바깥쪽으로 밀려난다.
          // 빠져나오는 즉시 아래의 평범한 판정으로 돌아간다.
          //
          // 예전에는 "갇힌 벽만 판정에서 빼주기"로 풀었는데, 돌 벽 링은 박스가 겹겹이 놓여
          // 있어 한 점이 보통 벽 3개 안에 동시에 들어간다 — 그 3개가 전부 빠지면 그 자리에
          // 막는 벽이 하나도 남지 않아 방어선을 그대로 걸어서 통과했다. 자세한 근거는
          // VirtualWall.ejectDir()의 주석 참고.

          if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall).ejectDir(myPos.x, myPos.z, Monster._ejectDir)) {
            const es = this.moveSpeed * MONSTER_EJECT_SPEED_MULT * dt;
            this.node.setWorldPosition(myPos.x + Monster._ejectDir.x * es, myPos.y, myPos.z + Monster._ejectDir.z * es);
            this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
            return false;
          } // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.


          if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall).isBlocked(nx, myPos.z)) nx = myPos.x;
          if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall).isBlocked(nx, nz)) nz = myPos.z;
          this.node.setWorldPosition(nx, myPos.y, nz);
          this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
          return false;
        }

      }, _class3._ejectDir = new Vec3(), _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2.5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxHp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.8;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "attackInterval", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.5;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "scoreValue", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "coinDrop", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "waypointArriveDist", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "knockbackDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.15;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "flashDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.12;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "flashIntensity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 4;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6d1751ce06d3331fbd177e3ec13ee87dff5f258b.js.map