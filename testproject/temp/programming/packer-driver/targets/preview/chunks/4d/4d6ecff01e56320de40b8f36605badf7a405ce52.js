System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec2, Vec3, director, AnimationClip, Mesh, Material, animation, MonsterSpawner, Bullet, JoystickUI, MapBounds, VirtualWall, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _class3, _crd, ccclass, property, Player;

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

      _export("Player", Player = (_dec = ccclass('Player'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(AnimationClip), _dec6 = property(Mesh), _dec7 = property(Material), _dec8 = property(Mesh), _dec9 = property(Material), _dec(_class = (_class2 = (_class3 = class Player extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "spawnerNode", _descriptor, this);

          _initializerDefineProperty(this, "joystickNode", _descriptor2, this);

          _initializerDefineProperty(this, "mapBoundsNode", _descriptor3, this);

          // AnimationGraph(PlayerAnimGraph)의 상체 공격 레이어가 재생하는 클립과 동일한 에셋.
          // 재생 자체는 그래프가 담당하고, 여기서는 duration만 읽어 attackRate에 맞춰 speed를 계산한다.
          _initializerDefineProperty(this, "clipAttack", _descriptor4, this);

          _initializerDefineProperty(this, "arrowMesh", _descriptor5, this);

          _initializerDefineProperty(this, "arrowMat", _descriptor6, this);

          _initializerDefineProperty(this, "fxHitMesh", _descriptor7, this);

          _initializerDefineProperty(this, "fxHitMat", _descriptor8, this);

          // ── 타격 이펙트 튜닝 (HitEffect로 전달) ─────────────────────────────
          _initializerDefineProperty(this, "fxScaleStart", _descriptor9, this);

          // 펀치 애니메이션 시작 스케일
          _initializerDefineProperty(this, "fxScaleMid", _descriptor10, this);

          // 펀치 애니메이션 중간 스케일
          _initializerDefineProperty(this, "fxScaleEnd", _descriptor11, this);

          // 펀치 애니메이션 종료 스케일
          _initializerDefineProperty(this, "fxSizeRandomMin", _descriptor12, this);

          // 전체 크기 랜덤 배율 최소값
          _initializerDefineProperty(this, "fxSizeRandomMax", _descriptor13, this);

          // 전체 크기 랜덤 배율 최대값
          _initializerDefineProperty(this, "fxOpacity", _descriptor14, this);

          // 기본 오퍼시티 (0~1)
          _initializerDefineProperty(this, "fxOpacityRandomMin", _descriptor15, this);

          // 오퍼시티 랜덤 배율 최소값
          _initializerDefineProperty(this, "fxOpacityRandomMax", _descriptor16, this);

          // 오퍼시티 랜덤 배율 최대값
          _initializerDefineProperty(this, "moveSpeed", _descriptor17, this);

          _initializerDefineProperty(this, "attackRate", _descriptor18, this);

          // shots / second
          _initializerDefineProperty(this, "attackDamage", _descriptor19, this);

          _initializerDefineProperty(this, "attackRange", _descriptor20, this);

          _initializerDefineProperty(this, "arrowSpeed", _descriptor21, this);

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

          var dir = (_ref = (_this$moveDirOverride = this.moveDirOverride) != null ? _this$moveDirOverride : (_this$_joystick = this._joystick) == null ? void 0 : _this$_joystick.direction) != null ? _ref : Vec2.ZERO;
          var moving = dir.length() > 0.1;
          var target = this.combatEnabled ? this._findNearest() : null; // ── Movement (위치만 갱신 — 회전은 아래에서 타겟 유무에 따라 별도 처리) ──

          if (moving) {
            var wx = dir.x;
            var wz = -dir.y;
            var p = this.node.worldPosition;
            var nx = p.x + wx * this.moveSpeed * dt;
            var nz = p.z + wz * this.moveSpeed * dt; // 맵 경계 밖으로 나가는 축만 취소 → 벽을 따라 미끄러지듯 이동

            if (this._mapBounds) {
              if (!this._mapBounds.contains(nx, p.z)) nx = p.x;
              if (!this._mapBounds.contains(nx, nz)) nz = p.z;
            } // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
            // 추종자(조이스틱 없는 인스턴스)는 대형을 유지하며 플레이어를 따라가야 하므로
            // 건물 충돌에서 완전히 자유롭다 — 실제 조작하는 플레이어에게만 적용한다.
            // 단, 지금 서있는 자리(p) 자체가 이미 어떤 벽에 갇혀있는 상태라면(건물이 트리거로
            // 생성되는 순간 하필 플레이어 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어
            // 빠져나올 수 있게 해준다 — 빠져나와서 p가 더 이상 갇힌 위치가 아니게 되는 순간부터
            // 다음 프레임에 자동으로 다시 정상 판정이 걸린다.


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
            var _p = this.node.worldPosition;
            var dx = target.worldPosition.x - _p.x;
            var dz = target.worldPosition.z - _p.z;
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
          var myPos = this.node.worldPosition;
          var best = null;
          var minDist = this.attackRange;

          for (var m of this._spawner.activeMonsters) {
            if (m.isDead || !m.node.isValid) continue;
            var d = Vec3.distance(m.node.worldPosition, myPos);

            if (d < minDist) {
              minDist = d;
              best = m.node;
            }
          }

          return best;
        }

        _shoot(target) {
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
          bNode.addComponent(_crd && Bullet === void 0 ? (_reportPossibleCrUseOfBullet({
            error: Error()
          }), Bullet) : Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this.arrowMat, this.fxHitMesh, this.fxHitMat, fxParams);
        }

      }, _class3.instance = null, _class3.UPPER_BODY_LAYER = 1, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec2], {
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

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4d6ecff01e56320de40b8f36605badf7a405ce52.js.map