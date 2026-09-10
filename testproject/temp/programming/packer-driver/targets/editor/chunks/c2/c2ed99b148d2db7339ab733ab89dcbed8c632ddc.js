System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, SkeletalAnimation, Vec3, Color, MeshRenderer, SkinnedMeshRenderer, GameManager, VirtualWall, DoorHealth, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _crd, ccclass, property, Monster;

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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bf306r0zDVAcrdslf20EdYD", "Monster", undefined);

      __checkObsolete__(['_decorator', 'Component', 'SkeletalAnimation', 'Node', 'Vec3', 'Color', 'MeshRenderer', 'SkinnedMeshRenderer', 'Material']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Monster", Monster = (_dec = ccclass('Monster'), _dec(_class = (_class2 = class Monster extends Component {
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
        /** 러쉬 경로(웨이포인트)를 따라 이동한 뒤, 마지막 지점부터는 target(기지)을 공격 */


        setPath(waypoints, target) {
          this._waypoints = waypoints;
          this._wpIndex = 0;
          this._target = target;

          this._play('move');
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
          var _this$healthBar3, _instance, _this$_onDied, _this$_anim, _this$_anim2;

          this._isDead = true;
          (_this$healthBar3 = this.healthBar) == null || _this$healthBar3.hide();
          (_instance = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance) == null || _instance.addScore(this.scoreValue);
          (_this$_onDied = this._onDied) == null || _this$_onDied.call(this);
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
              var _instance2;

              this._attackTimer = 0;
              (_instance2 = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
                error: Error()
              }), GameManager) : GameManager).instance) == null || _instance2.baseTakeDamage(this.attackDamage);
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
          let nz = myPos.z + dz * inv * this.moveSpeed * dt; // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
          // 단, 지금 서있는 자리 자체가 이미 어떤 벽에 갇혀있는 상태라면(건물이 트리거로 생성되는
          // 순간 하필 몬스터 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어 빠져나올 수
          // 있게 해준다 — 빠져나오는 즉시 다음 프레임부터 자동으로 다시 정상 판정이 걸린다.

          if (!(_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
            error: Error()
          }), VirtualWall) : VirtualWall).isBlocked(myPos.x, myPos.z)) {
            if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
              error: Error()
            }), VirtualWall) : VirtualWall).isBlocked(nx, myPos.z)) nx = myPos.x;
            if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
              error: Error()
            }), VirtualWall) : VirtualWall).isBlocked(nx, nz)) nz = myPos.z;
          }

          this.node.setWorldPosition(nx, myPos.y, nz);
          this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
          return false;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
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
//# sourceMappingURL=c2ed99b148d2db7339ab733ab89dcbed8c632ddc.js.map