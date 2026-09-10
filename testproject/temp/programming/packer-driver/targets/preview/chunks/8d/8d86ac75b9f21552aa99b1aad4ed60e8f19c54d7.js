System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Quat, Animation, AnimationClip, Mesh, Material, director, MonsterSpawner, Bullet, CoinGroundStack, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _crd, ccclass, property, TowerAttack;

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

  function _reportPossibleCrUseOfCoinGroundStack(extras) {
    _reporterNs.report("CoinGroundStack", "./CoinGroundStack", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
      Mesh = _cc.Mesh;
      Material = _cc.Material;
      director = _cc.director;
    }, function (_unresolved_2) {
      MonsterSpawner = _unresolved_2.MonsterSpawner;
    }, function (_unresolved_3) {
      Bullet = _unresolved_3.Bullet;
    }, function (_unresolved_4) {
      CoinGroundStack = _unresolved_4.CoinGroundStack;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5a5eeqE6UxNXqeAFX+hu7gq", "TowerAttack", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat', 'Animation', 'AnimationClip', 'Mesh', 'Material', 'director']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 트리거로 지어진 화살탑(Tower)의 자동 공격. Player.ts와 같은 방식(가장 가까운 몬스터를
       * 찾아 화살을 쏘고 Bullet이 알아서 날아가 데미지를 준다)이지만, 탑 자체(node)는 움직이거나
       * 돌지 않고 — 크로스보우 조준부(`Root_Bow` 본)만 몬스터 쪽으로 회전한다. 발사 순간에는 탑의
       * `shot` 애니메이션 클립을 재생한다.
       *
       * `combatEnabled`는 기본 false — `BuildingTrigger`가 이 탑의 트리거 조건을 만족시키는
       * 순간(건설 완료)에만 true로 켠다. 그 전까지는 조준/발사 둘 다 하지 않는다.
       */

      _export("TowerAttack", TowerAttack = (_dec = ccclass('TowerAttack'), _dec2 = property({
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
      }), _dec5 = property(Mesh), _dec6 = property(Material), _dec7 = property(Mesh), _dec8 = property(Material), _dec9 = property({
        type: _crd && CoinGroundStack === void 0 ? (_reportPossibleCrUseOfCoinGroundStack({
          error: Error()
        }), CoinGroundStack) : CoinGroundStack,
        displayName: '코인 무더기(coin_ground)',
        tooltip: '이 타워가 처치한 몬스터의 코인이 쌓일 바닥 코인 무더기. 비워두면 기존처럼 코인이 플레이어에게 날아간다 — CoinSpawnController가 발사체 출처(이 타워)를 보고 이 값을 참조한다'
      }), _dec(_class = (_class2 = class TowerAttack extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "aimBone", _descriptor, this);

          _initializerDefineProperty(this, "spawnerNode", _descriptor2, this);

          _initializerDefineProperty(this, "clipAttack", _descriptor3, this);

          _initializerDefineProperty(this, "arrowMesh", _descriptor4, this);

          _initializerDefineProperty(this, "arrowMat", _descriptor5, this);

          _initializerDefineProperty(this, "fxHitMesh", _descriptor6, this);

          _initializerDefineProperty(this, "fxHitMat", _descriptor7, this);

          _initializerDefineProperty(this, "fxScaleStart", _descriptor8, this);

          _initializerDefineProperty(this, "fxScaleMid", _descriptor9, this);

          _initializerDefineProperty(this, "fxScaleEnd", _descriptor10, this);

          _initializerDefineProperty(this, "fxSizeRandomMin", _descriptor11, this);

          _initializerDefineProperty(this, "fxSizeRandomMax", _descriptor12, this);

          _initializerDefineProperty(this, "fxOpacity", _descriptor13, this);

          _initializerDefineProperty(this, "fxOpacityRandomMin", _descriptor14, this);

          _initializerDefineProperty(this, "fxOpacityRandomMax", _descriptor15, this);

          _initializerDefineProperty(this, "coinGroundStack", _descriptor16, this);

          _initializerDefineProperty(this, "attackRate", _descriptor17, this);

          // shots / second
          _initializerDefineProperty(this, "attackDamage", _descriptor18, this);

          _initializerDefineProperty(this, "attackRange", _descriptor19, this);

          _initializerDefineProperty(this, "arrowSpeed", _descriptor20, this);

          /** BuildingTrigger가 이 탑을 건설 완료시키기 전까지는 false — 조준도 발사도 안 한다. */
          this.combatEnabled = false;
          this._spawner = null;
          this._anim = null;
          this._attackTimer = 0;
          this._dir = new Vec3();
          this._qLocal = new Quat();

          /** Root_Bow의 로컬 Z축이 곧 월드 수직(Y)축과 정확히 일치한다(본 rest pose 실측 확인).
           * 그래서 몬스터 조준은 로컬 Z 회전 하나로 처리한다 — 부모(Bone_Tower)가 어떤 각도로
           * 서있든(탑마다 배치 회전이 달라도) 항상 올바른 수평 방향을 향하게 된다. */
          this._restForwardYawDeg = 0;
          this._restCalibrated = false;
          this._hasPendingAim = false;
        }

        onLoad() {
          var _this$getComponent;

          this._anim = (_this$getComponent = this.getComponent(Animation)) != null ? _this$getComponent : this.getComponentInChildren(Animation);
        }

        start() {
          if (this.spawnerNode) this._spawner = this.spawnerNode.getComponent(_crd && MonsterSpawner === void 0 ? (_reportPossibleCrUseOfMonsterSpawner({
            error: Error()
          }), MonsterSpawner) : MonsterSpawner);

          this._calibrateRestYaw();
        }
        /** Root_Bow는 rest pose에서 로컬 회전이 항등(identity)이라, 부모(Bone_Tower)의 월드 회전이
         * 곧 Root_Bow의 rest 월드 회전이다. 이 부모는 TowerAttack이 절대 건드리지 않으므로 한 번만
         * 계산해서 캐싱해도 된다. 본의 로컬 -Y(실측 결과 +Y는 정반대로 나와서 뒤집음)를 크로스보우가
         * 바라보는 정면으로 보고, 그 방향이 rest pose에서 실제로 향하는 절대 각도(도)를 구해둔다 —
         * 이후 매 프레임 "목표 방향 각도 - 이 각도"만큼만 로컬 Z로 돌리면 정확히 목표를 향하게 된다. */


        _calibrateRestYaw() {
          var _this$aimBone;

          if (!((_this$aimBone = this.aimBone) != null && _this$aimBone.parent)) return;
          var fwd = Vec3.transformQuat(new Vec3(), new Vec3(0, -1, 0), this.aimBone.parent.worldRotation);
          this._restForwardYawDeg = Math.atan2(fwd.x, fwd.z) * 180 / Math.PI;
          this._restCalibrated = true;
        }

        update(dt) {
          if (!this.combatEnabled || !this.aimBone) {
            this._hasPendingAim = false;
            return;
          }

          if (!this._restCalibrated) this._calibrateRestYaw();

          var target = this._findNearest();

          if (!target) {
            this._hasPendingAim = false;
            return;
          } // 조준부만 몬스터 쪽으로 회전 (탑 본체는 고정). Root_Bow의 로컬 Z축 = 월드 수직축이므로,
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
        }

        lateUpdate() {
          if (this._hasPendingAim && this.aimBone) this.aimBone.setRotation(this._qLocal);
        }

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
          bNode.addComponent(_crd && Bullet === void 0 ? (_reportPossibleCrUseOfBullet({
            error: Error()
          }), Bullet) : Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this.arrowMat, this.fxHitMesh, this.fxHitMat, fxParams, this.node);
        }
        /** shot 클립을 매번 처음부터 한 번만 재생 (defaultClip인 appear와 같은 Animation 컴포넌트를
         * 공유하므로, 발사 순간 appear가 아직 재생 중이었다면 그 자리에서 끊기고 shot으로 넘어간다).
         * Player.ts의 AtkSpeed와 같은 방식으로, 클립 한 사이클이 발사 주기(1/attackRate)와
         * 일치하도록 재생 속도를 보정한다 — 공격속도가 빨라지면 애니메이션도 그만큼 빨리 재생된다.
         * 이 클립도 Root_Bow 회전 커브를 갖고 있지만, TowerAttack.update()가 매 프레임 그 뒤에
         * 다시 조준 회전으로 덮어쓰므로(같은 프레임에서 스크립트가 항상 나중에 실행됨) 실제로는
         * 조준 추적이 우선한다 — 크로스보우가 항상 몬스터를 보며 쏘는 것을 더 중요하게 봤다. */


        _playAttackClip() {
          if (!this._anim || !this.clipAttack || this.attackRate <= 0) return;

          var state = this._anim.getState(this.clipAttack.name);

          if (!state) return;
          state.wrapMode = AnimationClip.WrapMode.Normal;
          state.speed = this.clipAttack.duration * this.attackRate;
          state.time = 0;
          state.play();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "aimBone", [_dec2], {
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
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "coinGroundStack", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "attackRate", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 20;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8d86ac75b9f21552aa99b1aad4ed60e8f19c54d7.js.map