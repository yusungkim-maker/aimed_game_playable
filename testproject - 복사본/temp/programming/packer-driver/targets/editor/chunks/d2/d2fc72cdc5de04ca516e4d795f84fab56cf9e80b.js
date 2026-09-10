System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Vec3, director, AnimationClip, Mesh, Material, animation, MonsterSpawner, Bullet, JoystickUI, MapBounds, VirtualWall, AudioManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _class3, _crd, ccclass, property, Player;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBullet(extras) {
    _reporterNs.report("Bullet", "./Bullet", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitEffectParams(extras) {
    _reporterNs.report("HitEffectParams", "./HitEffect", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickUI(extras) {
    _reporterNs.report("JoystickUI", "./JoystickUI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMapBounds(extras) {
    _reporterNs.report("MapBounds", "./MapBounds", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualWall(extras) {
    _reporterNs.report("VirtualWall", "./VirtualWall", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAudioManager(extras) {
    _reporterNs.report("AudioManager", "./AudioManager", _context.meta, extras);
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
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
      director = _cc.director;
      AnimationClip = _cc.AnimationClip;
      Mesh = _cc.Mesh;
      Material = _cc.Material;
      animation = _cc.animation;
    }, function (_unresolved_2) {
      MonsterSpawner = _unresolved_2.MonsterSpawner;
    }, function (_unresolved_3) {
      Bullet = _unresolved_3.Bullet;
    }, function (_unresolved_4) {
      JoystickUI = _unresolved_4.JoystickUI;
    }, function (_unresolved_5) {
      MapBounds = _unresolved_5.MapBounds;
    }, function (_unresolved_6) {
      VirtualWall = _unresolved_6.VirtualWall;
    }, function (_unresolved_7) {
      AudioManager = _unresolved_7.AudioManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "74a91FyOeJP3KmU2BwYCZAx", "Player", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'director', 'AnimationClip', 'Mesh', 'Material', 'animation']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Camera sits at (0, 11.361, 4.405) with Y-euler = 0°.
       * "Screen up"  → world direction (0, 0, -1)
       * "Screen right"→ world direction (+1, 0, 0)
       *
       * Transform: worldX = joyX
       *            worldZ = -joyY
       */

      _export("Player", Player = (_dec = ccclass('Player'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(AnimationClip), _dec6 = property(Mesh), _dec7 = property(Material), _dec8 = property({
        displayName: '화살 스케일',
        tooltip: 'arrowMesh를 화면에 얼마나 크게 표시할지 (Bullet 노드의 setScale 배율)'
      }), _dec9 = property(Mesh), _dec10 = property(Material), _dec11 = property({
        displayName: '화살 생성 위치 - 앞으로 이격(m)',
        tooltip: '캐릭터 중심에서 타겟 방향으로 이만큼 앞에 화살을 생성한다. Player 컴포넌트는 플레이어/추종자가 각자 인스턴스를 가지므로, 인스펙터에서 캐릭터별로 따로 조절할 수 있다.'
      }), _dec12 = property({
        displayName: '화살 생성 위치 - 높이(m)',
        tooltip: '캐릭터 피벗 기준 이만큼 위(손/무기 높이)에 화살을 생성한다. Player 컴포넌트는 플레이어/추종자가 각자 인스턴스를 가지므로, 인스펙터에서 캐릭터별로 따로 조절할 수 있다.'
      }), _dec(_class = (_class2 = (_class3 = class Player extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "spawnerNode", _descriptor, this);

          _initializerDefineProperty(this, "joystickNode", _descriptor2, this);

          _initializerDefineProperty(this, "mapBoundsNode", _descriptor3, this);

          // AnimationGraph(PlayerAnimGraph)의 상체 공격 레이어가 재생하는 클립과 동일한 에셋.
          // 재생 자체는 그래프가 담당하고, 여기서는 duration만 읽어 attackRate에 맞춰 speed를 계산한다.
          _initializerDefineProperty(this, "clipAttack", _descriptor4, this);

          _initializerDefineProperty(this, "arrowMesh", _descriptor5, this);

          _initializerDefineProperty(this, "arrowMat", _descriptor6, this);

          _initializerDefineProperty(this, "arrowScale", _descriptor7, this);

          _initializerDefineProperty(this, "fxHitMesh", _descriptor8, this);

          _initializerDefineProperty(this, "fxHitMat", _descriptor9, this);

          // ── 타격 이펙트 튜닝 (HitEffect로 전달) ─────────────────────────────
          _initializerDefineProperty(this, "fxScaleStart", _descriptor10, this);

          // 펀치 애니메이션 시작 스케일
          _initializerDefineProperty(this, "fxScaleMid", _descriptor11, this);

          // 펀치 애니메이션 중간 스케일
          _initializerDefineProperty(this, "fxScaleEnd", _descriptor12, this);

          // 펀치 애니메이션 종료 스케일
          _initializerDefineProperty(this, "fxSizeRandomMin", _descriptor13, this);

          // 전체 크기 랜덤 배율 최소값
          _initializerDefineProperty(this, "fxSizeRandomMax", _descriptor14, this);

          // 전체 크기 랜덤 배율 최대값
          _initializerDefineProperty(this, "fxOpacity", _descriptor15, this);

          // 기본 오퍼시티 (0~1)
          _initializerDefineProperty(this, "fxOpacityRandomMin", _descriptor16, this);

          // 오퍼시티 랜덤 배율 최소값
          _initializerDefineProperty(this, "fxOpacityRandomMax", _descriptor17, this);

          // 오퍼시티 랜덤 배율 최대값
          _initializerDefineProperty(this, "moveSpeed", _descriptor18, this);

          _initializerDefineProperty(this, "attackRate", _descriptor19, this);

          // shots / second
          _initializerDefineProperty(this, "attackDamage", _descriptor20, this);

          _initializerDefineProperty(this, "attackRange", _descriptor21, this);

          _initializerDefineProperty(this, "arrowSpeed", _descriptor22, this);

          _initializerDefineProperty(this, "arrowSpawnFwd", _descriptor23, this);

          _initializerDefineProperty(this, "arrowSpawnHeight", _descriptor24, this);

          this._animCtrl = null;
          this._spawner = null;
          this._joystick = null;
          this._mapBounds = null;
          this._attackTimer = 0;

          /**
           * 조이스틱이 없는(=추종자) 인스턴스를 위한 외부 이동 입력 훅. null이 아니면 조이스틱
           * 대신 이 값을 이동 방향으로 사용한다 (FollowerMovement.ts가 매 프레임 갱신).
           * 좌표계는 조이스틱과 동일: worldX = x, worldZ = -y.
           */
          this.moveDirOverride = null;

          /**
           * 소켓 위에서 대기 중인 고스트 미리보기 추종자는 아직 "생산되지 않은" 상태이므로
           * 몬스터를 타게팅/공격/조준 회전하면 안 된다. FollowerGhostState.enterGhost()/solidify()가
           * 이 값을 false/true로 토글한다 — false인 동안 update()는 타겟을 아예 찾지 않는다.
           */
          this.combatEnabled = true;
        }

        onLoad() {
          var _this$getComponent;

          this._animCtrl = (_this$getComponent = this.getComponent(animation.AnimationController)) != null ? _this$getComponent : this.getComponentInChildren(animation.AnimationController);
        }

        start() {
          if (this.spawnerNode) this._spawner = this.spawnerNode.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);
          if (this.joystickNode) this._joystick = this.joystickNode.getComponent(_crd && JoystickUI === void 0 ? (_reportPossibleCrUseOfJoystickUI({
            error: Error()
          }), JoystickUI) : JoystickUI);
          if (this.mapBoundsNode) this._mapBounds = this.mapBoundsNode.getComponent(_crd && MapBounds === void 0 ? (_reportPossibleCrUseOfMapBounds({
            error: Error()
          }), MapBounds) : MapBounds);
          if (this.joystickNode) Player.instance = this;
        }

        onDestroy() {
          if (Player.instance === this) Player.instance = null;
        }

        update(dt) {
          var _ref, _this$moveDirOverride, _this$_joystick, _this$_animCtrl, _this$_animCtrl2;

          const dir = (_ref = (_this$moveDirOverride = this.moveDirOverride) != null ? _this$moveDirOverride : (_this$_joystick = this._joystick) == null ? void 0 : _this$_joystick.direction) != null ? _ref : Vec2.ZERO;
          const moving = dir.length() > 0.1;
          const target = this.combatEnabled ? this._findNearest() : null; // ── Movement (위치만 갱신 — 회전은 아래에서 타겟 유무에 따라 별도 처리) ──

          if (moving) {
            const wx = dir.x;
            const wz = -dir.y;
            const p = this.node.worldPosition;
            let nx = p.x + wx * this.moveSpeed * dt;
            let nz = p.z + wz * this.moveSpeed * dt; // 맵 경계 밖으로 나가는 축만 취소 → 벽을 따라 미끄러지듯 이동

            if (this._mapBounds) {
              if (!this._mapBounds.contains(nx, p.z)) nx = p.x;
              if (!this._mapBounds.contains(nx, nz)) nz = p.z;
            } // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
            // 추종자(조이스틱 없는 인스턴스)는 대형을 유지하며 플레이어를 따라가야 하므로
            // 건물 충돌에서 완전히 자유롭다 — 실제 조작하는 플레이어에게만 적용한다.
            // 단, 지금 서있는 자리(p) 자체가 이미 벽 안에 갇혀있는 상태라면(건물이 트리거로
            // 생성되는 순간 하필 플레이어 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어
            // 빠져나올 수 있게 해준다 — 빠져나오는 즉시 다음 프레임부터 다시 정상 판정이 걸린다.
            // 이 "갇힘" 판정은 반드시 실제 충돌 경계와 똑같아야 한다. 조금이라도 더 넓게 잡으면
            // (경계 바깥 여유 범위까지 탈출 모드로 치면) 플레이어가 벽에 다가가는 도중 그 여유
            // 범위에 들어서는 순간부터 충돌이 통째로 꺼져서 벽을 그대로 통과해버린다.


            if (this.joystickNode && !(_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
              error: Error()
            }), VirtualWall) : VirtualWall).isBlockedForPlayer(p.x, p.z)) {
              if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
                error: Error()
              }), VirtualWall) : VirtualWall).isBlockedForPlayer(nx, p.z)) nx = p.x;
              if ((_crd && VirtualWall === void 0 ? (_reportPossibleCrUseOfVirtualWall({
                error: Error()
              }), VirtualWall) : VirtualWall).isBlockedForPlayer(nx, nz)) nz = p.z;
            }

            this.node.setWorldPosition(nx, p.y, nz);
          } // ── Facing: 타겟이 있으면 이동 여부와 상관없이 항상 타겟을 바라본다
          // (뒷걸음질 사격 중 이동방향 ↔ 타겟방향으로 번갈아 홱홱 도는 현상 방지).
          // 타겟이 없을 때만 이동 방향을 바라본다.


          if (target) {
            const p = this.node.worldPosition;
            const dx = target.worldPosition.x - p.x;
            const dz = target.worldPosition.z - p.z;
            this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
          } else if (moving) {
            this.node.setRotationFromEuler(0, Math.atan2(dir.x, -dir.y) * 180 / Math.PI, 0);
          } // ── Animation state ──────────────────────────────────────────────
          // Base 레이어: 다리(하체) — Moving 여부로 Idle/Move 전환, 항상 정상 속도.
          // UpperBodyAttack 레이어(다리 관절 마스크 제외): 타겟이 있을 때만 가중치 1로 보여서
          // 상체(크로스보우)만 공격 모션을 재생하고, 다리는 Base 레이어의 속도를 그대로 유지한다.


          (_this$_animCtrl = this._animCtrl) == null || _this$_animCtrl.setValue('Moving', moving);
          (_this$_animCtrl2 = this._animCtrl) == null || _this$_animCtrl2.setLayerWeight(Player.UPPER_BODY_LAYER, target ? 1 : 0);

          if (target && this.clipAttack && this.attackRate > 0) {
            var _this$_animCtrl3;

            // 공격 모션 한 사이클이 발사 주기(1/attackRate)와 일치하도록 재생 속도 보정
            (_this$_animCtrl3 = this._animCtrl) == null || _this$_animCtrl3.setValue('AtkSpeed', this.clipAttack.duration * this.attackRate);
          } // ── Auto-attack (발사 타이밍만 담당, 애니메이션/회전과 무관) ─────────


          this._attackTimer += dt;

          if (target && this._attackTimer >= 1 / this.attackRate) {
            this._attackTimer = 0;

            this._shoot(target);
          }
        } // ── Internal helpers ──────────────────────────────────────────────────


        _findNearest() {
          if (!this._spawner) return null;
          const myPos = this.node.worldPosition;
          let best = null;
          let minDist = this.attackRange;

          for (const m of this._spawner.activeMonsters) {
            if (m.isDead || !m.node.isValid) continue;
            const d = Vec3.distance(m.node.worldPosition, myPos);

            if (d < minDist) {
              minDist = d;
              best = m.node;
            }
          }

          return best;
        }

        _shoot(target) {
          var _instance;

          (_instance = (_crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
            error: Error()
          }), AudioManager) : AudioManager).instance) == null || _instance.playArrow();
          const myPos = this.node.worldPosition;
          const dx = target.worldPosition.x - myPos.x;
          const dz = target.worldPosition.z - myPos.z;
          const horizLen = Math.hypot(dx, dz) || 1;
          const fwdX = dx / horizLen;
          const fwdZ = dz / horizLen;
          const scene = director.getScene();
          if (!scene) return;
          const bNode = new Node('Bullet');
          scene.addChild(bNode);
          bNode.setWorldPosition(myPos.x + fwdX * this.arrowSpawnFwd, myPos.y + this.arrowSpawnHeight, myPos.z + fwdZ * this.arrowSpawnFwd);
          const fxParams = {
            scaleStart: this.fxScaleStart,
            scaleMid: this.fxScaleMid,
            scaleEnd: this.fxScaleEnd,
            sizeRandomMin: this.fxSizeRandomMin,
            sizeRandomMax: this.fxSizeRandomMax,
            opacity: this.fxOpacity,
            opacityRandomMin: this.fxOpacityRandomMin,
            opacityRandomMax: this.fxOpacityRandomMax
          };
          bNode.addComponent(_crd && Bullet === void 0 ? (_reportPossibleCrUseOfBullet({
            error: Error()
          }), Bullet) : Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this.arrowMat, this.fxHitMesh, this.fxHitMat, fxParams, null, this.arrowScale);
        }

      }, _class3.instance = null, _class3.UPPER_BODY_LAYER = 1, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "joystickNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "mapBoundsNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "clipAttack", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "arrowMesh", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "arrowMat", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "arrowScale", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 4;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMesh", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMat", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleStart", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleMid", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleEnd", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.3;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.5;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.8;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.2;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "attackRate", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.5;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 3;
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 14;
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpawnFwd", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.6;
        }
      }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpawnHeight", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d2fc72cdc5de04ca516e4d795f84fab56cf9e80b.js.map