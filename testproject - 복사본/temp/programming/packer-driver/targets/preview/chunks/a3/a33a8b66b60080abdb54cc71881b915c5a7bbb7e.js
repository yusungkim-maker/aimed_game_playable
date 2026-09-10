System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Quat, Animation, AnimationClip, Mesh, Material, director, CCFloat, Color, HitEffect, MonsterSpawner, Bullet, CoinGroundStack, AudioManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40, _crd, ccclass, property, TowerAttack;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfHitEffect(extras) {
    _reporterNs.report("HitEffect", "./HitEffect", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitEffectParams(extras) {
    _reporterNs.report("HitEffectParams", "./HitEffect", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterSpawner(extras) {
    _reporterNs.report("MonsterSpawner", "./MonsterSpawner", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBullet(extras) {
    _reporterNs.report("Bullet", "./Bullet", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCoinGroundStack(extras) {
    _reporterNs.report("CoinGroundStack", "./CoinGroundStack", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Quat = _cc.Quat;
      Animation = _cc.Animation;
      AnimationClip = _cc.AnimationClip;
      Mesh = _cc.Mesh;
      Material = _cc.Material;
      director = _cc.director;
      CCFloat = _cc.CCFloat;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      HitEffect = _unresolved_2.HitEffect;
    }, function (_unresolved_3) {
      MonsterSpawner = _unresolved_3.MonsterSpawner;
    }, function (_unresolved_4) {
      Bullet = _unresolved_4.Bullet;
    }, function (_unresolved_5) {
      CoinGroundStack = _unresolved_5.CoinGroundStack;
    }, function (_unresolved_6) {
      AudioManager = _unresolved_6.AudioManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5a5eeqE6UxNXqeAFX+hu7gq", "TowerAttack", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Quat', 'Animation', 'AnimationClip', 'Mesh', 'Material', 'director', 'CCFloat', 'Color']);

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
        type: CCFloat,
        displayName: '조준 본 X 기울기(도)',
        tooltip: '조준할 때 Root_Bow에 적용할 X축 회전. 조준 방향(Z축 회전)은 매 프레임 계산해서 덮어쓰므로, 프리팹에서 본에 직접 넣은 회전값은 남지 않는다 — 대신 이 값이 조준 회전에 함께 합성되어 인스펙터의 본 rotation X로 그대로 나타난다. 타워마다 다르게 두고 싶으면 이 값만 바꾸면 된다'
      }), _dec4 = property({
        type: Node,
        displayName: '몬스터 스포너 노드'
      }), _dec5 = property({
        type: AnimationClip,
        displayName: '발사 애니메이션 클립(shot)',
        tooltip: '발사할 때마다 재생할 클립 — 탑의 Animation 컴포넌트에 이미 들어있는 clips 중 하나를 지정'
      }), _dec6 = property(Mesh), _dec7 = property(Material), _dec8 = property({
        displayName: '화살 스케일',
        tooltip: 'arrowMesh를 화면에 얼마나 크게 표시할지 (Bullet 노드의 setScale 배율)'
      }), _dec9 = property({
        type: CCFloat,
        displayName: '화살 발사 높이(위/아래)',
        tooltip: '화살이 튀어나오는 지점을 조준 본(Root_Bow) 위치에서 위(+)/아래(-)로 얼마나 옮길지(m). 좌우/앞뒤는 조준 방향을 따라가야 해서 건드리지 않고, 이 값만 월드 Y축으로 더한다. 크로스보우 그림보다 화살이 높거나 낮게 나올 때 이걸로 맞춘다'
      }), _dec10 = property({
        displayName: '화살 색 직접 지정',
        tooltip: '체크하면 아래 색으로 이 타워의 화살만 다르게 칠한다. 끄면 arrowMat 머티리얼 에셋(Arrow01)의 색을 그대로 쓴다 — 머티리얼 에셋 자체는 어떤 경우에도 건드리지 않으므로, 다른 타워나 플레이어 화살에는 영향이 없다'
      }), _dec11 = property({
        type: Color,
        displayName: '화살 본체 색',

        visible() {
          return this.overrideArrowColor;
        },

        tooltip: '화살 텍스처에 곱해지는 색(머티리얼의 Albedo/mainColor). 흰색이면 텍스처 원본 색 그대로. 기본값은 Arrow01 머티리얼의 현재 값과 같아서, 체크만 하고 아무것도 안 바꾸면 지금과 똑같이 보인다'
      }), _dec12 = property({
        type: Color,
        displayName: '화살 발광 색',

        visible() {
          return this.overrideArrowColor;
        },

        tooltip: '화살이 스스로 내는 빛의 색(머티리얼의 emissive). 이 화살은 발광이 세서 실제로 보이는 색은 대부분 이 값이 결정한다 — 색을 확실히 바꾸고 싶으면 본체 색보다 이쪽을 먼저 바꿀 것. 기본값(255,184,0)은 Arrow01의 현재 주황색'
      }), _dec13 = property({
        type: CCFloat,
        displayName: '화살 발광 세기',

        visible() {
          return this.overrideArrowColor;
        },

        tooltip: '발광 색에 곱해지는 배율(머티리얼의 emissiveScale, 세 축 동일값). 0이면 발광이 꺼져 본체 색만 보이고, 키울수록 하얗게 타오른다. 기본값 2는 Arrow01의 현재 값'
      }), _dec14 = property(Mesh), _dec15 = property(Material), _dec16 = property({
        type: Mesh,
        displayName: '발사 이펙트 메쉬',
        tooltip: '비워두면 위의 피격 이펙트 메쉬(fxHitMesh)를 그대로 쓴다 — 보통은 비워두면 된다'
      }), _dec17 = property({
        type: Material,
        displayName: '발사 이펙트 재질',
        tooltip: '비워두면 위의 피격 이펙트 재질(fxHitMat)을 그대로 쓴다. 같은 아틀라스(2x2, 4칸)를 쓰며 매 발사마다 4칸 중 하나를 무작위로 고른다'
      }), _dec18 = property({
        displayName: '발사 이펙트 켜기',
        tooltip: '끄면 발사 순간 번쩍이는 연출을 하지 않는다'
      }), _dec19 = property({
        type: CCFloat,
        displayName: '발사 이펙트 앞뒤 위치(m)',
        tooltip: '번쩍임이 나타나는 지점을 화살이 나가는 자리에서 발사 방향으로 얼마나 밀지. 0이면 화살과 정확히 같은 자리, 양수면 앞(몬스터 쪽), 음수면 뒤(타워 쪽). 좌우/높이는 조절 대상이 아니다 — 높이는 위의 "화살 발사 높이"를 화살과 함께 쓴다'
      }), _dec20 = property({
        type: CCFloat,
        displayName: '발사 이펙트 지속(초)',
        tooltip: '번쩍임이 나타났다 사라지기까지의 시간. 짧을수록 톡 터지는 느낌'
      }), _dec21 = property({
        type: CCFloat,
        displayName: '발사 이펙트 시작 크기',
        tooltip: '나타나는 순간의 스케일'
      }), _dec22 = property({
        type: CCFloat,
        displayName: '발사 이펙트 최대 크기',
        tooltip: '가장 커졌을 때의 스케일 — 시작 크기에서 여기까지 순간적으로 커진다'
      }), _dec23 = property({
        type: CCFloat,
        displayName: '발사 이펙트 끝 크기',
        tooltip: '사라질 때의 스케일 — 최대 크기에서 여기까지 줄어든다'
      }), _dec24 = property({
        type: CCFloat,
        displayName: '발사 이펙트 크기 랜덤 최소',
        tooltip: '위 세 크기 전체에 곱해지는 랜덤 배율의 최소값 — 매 발사마다 조금씩 다른 크기로 터진다'
      }), _dec25 = property({
        type: CCFloat,
        displayName: '발사 이펙트 크기 랜덤 최대',
        tooltip: '위 세 크기 전체에 곱해지는 랜덤 배율의 최대값'
      }), _dec26 = property({
        type: CCFloat,
        displayName: '발사 이펙트 투명도',
        tooltip: '0~1. 색의 알파로 들어가 번쩍임의 세기가 된다'
      }), _dec27 = property({
        type: CCFloat,
        displayName: '발사 이펙트 투명도 랜덤 최소',
        tooltip: '투명도에 곱해지는 랜덤 배율의 최소값'
      }), _dec28 = property({
        type: CCFloat,
        displayName: '발사 이펙트 투명도 랜덤 최대',
        tooltip: '투명도에 곱해지는 랜덤 배율의 최대값'
      }), _dec29 = property({
        type: _crd && CoinGroundStack === void 0 ? (_reportPossibleCrUseOfCoinGroundStack({
          error: Error()
        }), CoinGroundStack) : CoinGroundStack,
        displayName: '코인 무더기(coin_ground)',
        tooltip: '이 타워가 처치한 몬스터의 코인이 쌓일 바닥 코인 무더기. 비워두면 기존처럼 코인이 플레이어에게 날아간다 — CoinSpawnController가 발사체 출처(이 타워)를 보고 이 값을 참조한다'
      }), _dec(_class = (_class2 = class TowerAttack extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "aimBone", _descriptor, this);

          _initializerDefineProperty(this, "aimPitchDeg", _descriptor2, this);

          _initializerDefineProperty(this, "spawnerNode", _descriptor3, this);

          _initializerDefineProperty(this, "clipAttack", _descriptor4, this);

          _initializerDefineProperty(this, "arrowMesh", _descriptor5, this);

          _initializerDefineProperty(this, "arrowMat", _descriptor6, this);

          _initializerDefineProperty(this, "arrowScale", _descriptor7, this);

          _initializerDefineProperty(this, "arrowSpawnHeight", _descriptor8, this);

          _initializerDefineProperty(this, "overrideArrowColor", _descriptor9, this);

          _initializerDefineProperty(this, "arrowColor", _descriptor10, this);

          _initializerDefineProperty(this, "arrowEmissive", _descriptor11, this);

          _initializerDefineProperty(this, "arrowEmissiveScale", _descriptor12, this);

          _initializerDefineProperty(this, "fxHitMesh", _descriptor13, this);

          _initializerDefineProperty(this, "fxHitMat", _descriptor14, this);

          _initializerDefineProperty(this, "fxScaleStart", _descriptor15, this);

          _initializerDefineProperty(this, "fxScaleMid", _descriptor16, this);

          _initializerDefineProperty(this, "fxScaleEnd", _descriptor17, this);

          _initializerDefineProperty(this, "fxSizeRandomMin", _descriptor18, this);

          _initializerDefineProperty(this, "fxSizeRandomMax", _descriptor19, this);

          _initializerDefineProperty(this, "fxOpacity", _descriptor20, this);

          _initializerDefineProperty(this, "fxOpacityRandomMin", _descriptor21, this);

          _initializerDefineProperty(this, "fxOpacityRandomMax", _descriptor22, this);

          // ── 발사(머즐) 이펙트 — 화살이 나가는 지점에서 번쩍이는 연출 ────────────────
          // 피격 이펙트와 같은 구조(같은 아틀라스 4칸 중 랜덤 1칸, 커졌다 작아지는 펀치 곡선)를
          // 그대로 쓰고, 색만 화살의 발광 색을 따라간다.
          _initializerDefineProperty(this, "muzzleMesh", _descriptor23, this);

          _initializerDefineProperty(this, "muzzleMat", _descriptor24, this);

          _initializerDefineProperty(this, "muzzleEnabled", _descriptor25, this);

          _initializerDefineProperty(this, "muzzleForwardOffset", _descriptor26, this);

          _initializerDefineProperty(this, "muzzleLifetime", _descriptor27, this);

          _initializerDefineProperty(this, "muzzleScaleStart", _descriptor28, this);

          _initializerDefineProperty(this, "muzzleScaleMid", _descriptor29, this);

          _initializerDefineProperty(this, "muzzleScaleEnd", _descriptor30, this);

          _initializerDefineProperty(this, "muzzleSizeRandomMin", _descriptor31, this);

          _initializerDefineProperty(this, "muzzleSizeRandomMax", _descriptor32, this);

          _initializerDefineProperty(this, "muzzleOpacity", _descriptor33, this);

          _initializerDefineProperty(this, "muzzleOpacityRandomMin", _descriptor34, this);

          _initializerDefineProperty(this, "muzzleOpacityRandomMax", _descriptor35, this);

          _initializerDefineProperty(this, "coinGroundStack", _descriptor36, this);

          _initializerDefineProperty(this, "attackRate", _descriptor37, this);

          // shots / second
          _initializerDefineProperty(this, "attackDamage", _descriptor38, this);

          _initializerDefineProperty(this, "attackRange", _descriptor39, this);

          _initializerDefineProperty(this, "arrowSpeed", _descriptor40, this);

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

          /** 화살 색을 덮어쓸 때 쓰는 이 타워 전용 머티리얼 복제본 — 첫 발사 때 한 번만 만들어
           * 이 타워의 모든 화살이 공유한다. MaterialInstance가 아니라 새 Material이어야 한다:
           * MeshRenderer.setMaterial()은 MaterialInstance를 받으면 에러(12012)를 낸다. */
          this._arrowMatTinted = null;

          /** 발사 이펙트에 넘길 방향 벡터 — 발사마다 새로 만들지 않기 위한 공용 임시값 */
          this._muzzleDir = new Vec3();
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
            var localZDeg = targetYawDeg - this._restForwardYawDeg; // 조준 방향(Z)과 기울기(X)를 인스펙터의 Euler 표기와 같은 순서로 합성한다 —
            // 결과가 본 rotation (aimPitchDeg, 0, localZDeg)로 그대로 보이게 하기 위함.

            Quat.fromEuler(this._qLocal, this.aimPitchDeg, 0, localZDeg);
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
          var _instance;

          this._playAttackClip();

          (_instance = (_crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
            error: Error()
          }), AudioManager) : AudioManager).instance) == null || _instance.playArrow();
          var from = this.aimBone.worldPosition;
          var dx = target.worldPosition.x - from.x;
          var dz = target.worldPosition.z - from.z;
          var horizLen = Math.hypot(dx, dz) || 1;
          var fwdX = dx / horizLen;
          var fwdZ = dz / horizLen;
          var spawnFwd = 0.6;
          var spawnHeight = this.arrowSpawnHeight;
          var scene = director.getScene();
          if (!scene) return;
          var bNode = new Node('Bullet');
          scene.addChild(bNode);
          bNode.setWorldPosition(from.x + fwdX * spawnFwd, from.y + spawnHeight, from.z + fwdZ * spawnFwd); // 번쩍임은 화살과 같은 자리에서 발사 방향으로만 앞뒤로 밀 수 있다.

          var muzzleFwd = spawnFwd + this.muzzleForwardOffset;

          this._spawnMuzzleFx(from.x + fwdX * muzzleFwd, from.y + spawnHeight, from.z + fwdZ * muzzleFwd, fwdX, fwdZ);

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
          }), Bullet) : Bullet).init(target, this.attackDamage, this.arrowSpeed, this.arrowMesh, this._resolveArrowMaterial(), this.fxHitMesh, this.fxHitMat, fxParams, this.node, this.arrowScale);
        }
        /** 화살이 나가는 바로 그 지점에 번쩍임을 하나 띄운다.
         *
         * 새 컴포넌트를 만들지 않고 피격 이펙트와 같은 HitEffect를 그대로 쓴다 — 아틀라스
         * 4칸 중 랜덤 1칸을 고르는 것, 커졌다 작아지는 펀치 곡선, 카메라를 정면으로 보게
         * 맞추는 회전 계산이 이미 거기 다 들어있다. 색만 화살의 발광 색을 실어 보낸다.
         *
         * 메쉬/재질을 비워두면 피격 이펙트 것을 그대로 쓴다(같은 아틀라스라 그대로 맞는다). */


        _spawnMuzzleFx(x, y, z, fwdX, fwdZ) {
          var _this$muzzleMesh, _this$muzzleMat;

          if (!this.muzzleEnabled) return;
          var mesh = (_this$muzzleMesh = this.muzzleMesh) != null ? _this$muzzleMesh : this.fxHitMesh;
          var mat = (_this$muzzleMat = this.muzzleMat) != null ? _this$muzzleMat : this.fxHitMat;
          if (!mesh || !mat) return;
          var scene = director.getScene();
          if (!scene) return;
          var node = new Node('MuzzleFx');
          scene.addChild(node);
          node.setWorldPosition(x, y, z);
          node.addComponent(_crd && HitEffect === void 0 ? (_reportPossibleCrUseOfHitEffect({
            error: Error()
          }), HitEffect) : HitEffect).init(mesh, mat, this._muzzleDir.set(fwdX, 0, fwdZ), {
            scaleStart: this.muzzleScaleStart,
            scaleMid: this.muzzleScaleMid,
            scaleEnd: this.muzzleScaleEnd,
            sizeRandomMin: this.muzzleSizeRandomMin,
            sizeRandomMax: this.muzzleSizeRandomMax,
            opacity: this.muzzleOpacity,
            opacityRandomMin: this.muzzleOpacityRandomMin,
            opacityRandomMax: this.muzzleOpacityRandomMax,
            // 화살의 발광 색을 그대로 따라간다 — "화살 색 직접 지정"을 꺼두었더라도 이 값의
            // 기본값이 Arrow01 머티리얼의 실제 emissive(255,184,0)와 같아서 어긋나지 않는다.
            color: this.arrowEmissive,
            lifetime: this.muzzleLifetime
          });
        }
        /** 이 타워의 화살에 쓸 머티리얼. 색 덮어쓰기가 꺼져 있으면 공유 에셋(arrowMat)을 그대로
         * 돌려주고, 켜져 있으면 그 에셋을 복제해 색만 바꾼 이 타워 전용 사본을 돌려준다.
         * `Material.copy()`는 effect/technique/defines/states/props를 전부 복사하므로(텍스처 포함)
         * 색 외에는 원본과 완전히 같다. 사본은 한 번만 만들어 캐싱한다 — 화살 하나마다 만들면
         * 발사할 때마다 머티리얼과 PSO가 새로 생긴다. */


        _resolveArrowMaterial() {
          if (!this.overrideArrowColor || !this.arrowMat) return this.arrowMat;

          if (!this._arrowMatTinted) {
            var m = new Material();
            m.copy(this.arrowMat); // 프로퍼티 이름은 builtin-standard 이펙트가 선언한 것 그대로다
            // (mainColor = Albedo, emissive, emissiveScale = Vec3).

            m.setProperty('mainColor', this.arrowColor);
            m.setProperty('emissive', this.arrowEmissive);
            var s = this.arrowEmissiveScale;
            m.setProperty('emissiveScale', new Vec3(s, s, s));
            this._arrowMatTinted = m;
          }

          return this._arrowMatTinted;
        }

        onDestroy() {
          var _this$_arrowMatTinted;

          // 런타임에 만든 사본이라 참조가 끊겨도 자동 해제되지 않는다 — 직접 파괴한다.
          (_this$_arrowMatTinted = this._arrowMatTinted) == null || _this$_arrowMatTinted.destroy();
          this._arrowMatTinted = null;
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
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "aimPitchDeg", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 20;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "spawnerNode", [_dec4], {
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
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "arrowScale", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 4;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpawnHeight", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "overrideArrowColor", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "arrowColor", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 255, 255, 255);
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "arrowEmissive", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color(255, 184, 0, 255);
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "arrowEmissiveScale", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMesh", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "fxHitMat", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleStart", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleMid", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "fxScaleEnd", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.6;
        }
      }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.3;
        }
      }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "fxSizeRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.5;
        }
      }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "fxOpacityRandomMax", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "muzzleMesh", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "muzzleMat", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "muzzleEnabled", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "muzzleForwardOffset", [_dec19], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "muzzleLifetime", [_dec20], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.18;
        }
      }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "muzzleScaleStart", [_dec21], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.15;
        }
      }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "muzzleScaleMid", [_dec22], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "muzzleScaleEnd", [_dec23], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.1;
        }
      }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "muzzleSizeRandomMin", [_dec24], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.8;
        }
      }), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "muzzleSizeRandomMax", [_dec25], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.2;
        }
      }), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "muzzleOpacity", [_dec26], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.9;
        }
      }), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "muzzleOpacityRandomMin", [_dec27], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.9;
        }
      }), _descriptor35 = _applyDecoratedDescriptor(_class2.prototype, "muzzleOpacityRandomMax", [_dec28], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.1;
        }
      }), _descriptor36 = _applyDecoratedDescriptor(_class2.prototype, "coinGroundStack", [_dec29], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor37 = _applyDecoratedDescriptor(_class2.prototype, "attackRate", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      }), _descriptor38 = _applyDecoratedDescriptor(_class2.prototype, "attackDamage", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor39 = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 8;
        }
      }), _descriptor40 = _applyDecoratedDescriptor(_class2.prototype, "arrowSpeed", [property], {
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
//# sourceMappingURL=a33a8b66b60080abdb54cc71881b915c5a7bbb7e.js.map