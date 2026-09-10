import { _decorator, Component, Node, Vec3, Quat, Animation, AnimationClip, Mesh, Material, director } from 'cc';
import { MonsterSpawner } from './MonsterSpawner';
import { Bullet } from './Bullet';
import { HitEffectParams } from './HitEffect';
import { CoinGroundStack } from './CoinGroundStack';
const { ccclass, property } = _decorator;

/**
 * 트리거로 지어진 화살탑(Tower)의 자동 공격. Player.ts와 같은 방식(가장 가까운 몬스터를
 * 찾아 화살을 쏘고 Bullet이 알아서 날아가 데미지를 준다)이지만, 탑 자체(node)는 움직이거나
 * 돌지 않고 — 크로스보우 조준부(`Root_Bow` 본)만 몬스터 쪽으로 회전한다. 발사 순간에는 탑의
 * `shot` 애니메이션 클립을 재생한다.
 *
 * `combatEnabled`는 기본 false — `BuildingTrigger`가 이 탑의 트리거 조건을 만족시키는
 * 순간(건설 완료)에만 true로 켠다. 그 전까지는 조준/발사 둘 다 하지 않는다.
 */
@ccclass('TowerAttack')
export class TowerAttack extends Component {
    @property({ type: Node, displayName: '조준 본(Root_Bow)', tooltip: '몬스터 쪽으로 회전시킬 크로스보우 조준부 노드 — 탑 전체가 아니라 이 노드만 돈다' })
    aimBone: Node | null = null;

    @property({ type: Node, displayName: '몬스터 스포너 노드' })
    spawnerNode: Node | null = null;

    @property({ type: AnimationClip, displayName: '발사 애니메이션 클립(shot)', tooltip: '발사할 때마다 재생할 클립 — 탑의 Animation 컴포넌트에 이미 들어있는 clips 중 하나를 지정' })
    clipAttack: AnimationClip | null = null;

    @property(Mesh) arrowMesh: Mesh | null = null;
    @property(Material) arrowMat: Material | null = null;
    @property(Mesh) fxHitMesh: Mesh | null = null;
    @property(Material) fxHitMat: Material | null = null;

    @property fxScaleStart: number = 0.3;
    @property fxScaleMid: number = 1.0;
    @property fxScaleEnd: number = 0.6;
    @property fxSizeRandomMin: number = 0.3;
    @property fxSizeRandomMax: number = 0.5;
    @property fxOpacity: number = 0.5;
    @property fxOpacityRandomMin: number = 0.8;
    @property fxOpacityRandomMax: number = 1.2;

    @property({ type: CoinGroundStack, displayName: '코인 무더기(coin_ground)', tooltip: '이 타워가 처치한 몬스터의 코인이 쌓일 바닥 코인 무더기. 비워두면 기존처럼 코인이 플레이어에게 날아간다 — CoinSpawnController가 발사체 출처(이 타워)를 보고 이 값을 참조한다' })
    coinGroundStack: CoinGroundStack | null = null;

    @property attackRate: number = 2;     // shots / second
    @property attackDamage: number = 1;
    @property attackRange: number = 8;
    @property arrowSpeed: number = 20;

    /** BuildingTrigger가 이 탑을 건설 완료시키기 전까지는 false — 조준도 발사도 안 한다. */
    combatEnabled = false;

    private _spawner: MonsterSpawner | null = null;
    private _anim: Animation | null = null;
    private _attackTimer = 0;
    private _dir = new Vec3();
    private _qLocal = new Quat();
    /** Root_Bow의 로컬 Z축이 곧 월드 수직(Y)축과 정확히 일치한다(본 rest pose 실측 확인).
     * 그래서 몬스터 조준은 로컬 Z 회전 하나로 처리한다 — 부모(Bone_Tower)가 어떤 각도로
     * 서있든(탑마다 배치 회전이 달라도) 항상 올바른 수평 방향을 향하게 된다. */
    private _restForwardYawDeg = 0;
    private _restCalibrated = false;
    private _hasPendingAim = false;

    onLoad() {
        this._anim = this.getComponent(Animation) ?? this.getComponentInChildren(Animation);
    }

    start() {
        if (this.spawnerNode) this._spawner = this.spawnerNode.getComponent(MonsterSpawner);
        this._calibrateRestYaw();
    }

    /** Root_Bow는 rest pose에서 로컬 회전이 항등(identity)이라, 부모(Bone_Tower)의 월드 회전이
     * 곧 Root_Bow의 rest 월드 회전이다. 이 부모는 TowerAttack이 절대 건드리지 않으므로 한 번만
     * 계산해서 캐싱해도 된다. 본의 로컬 -Y(실측 결과 +Y는 정반대로 나와서 뒤집음)를 크로스보우가
     * 바라보는 정면으로 보고, 그 방향이 rest pose에서 실제로 향하는 절대 각도(도)를 구해둔다 —
     * 이후 매 프레임 "목표 방향 각도 - 이 각도"만큼만 로컬 Z로 돌리면 정확히 목표를 향하게 된다. */
    private _calibrateRestYaw() {
        if (!this.aimBone?.parent) return;
        const fwd = Vec3.transformQuat(new Vec3(), new Vec3(0, -1, 0), this.aimBone.parent.worldRotation);
        this._restForwardYawDeg = Math.atan2(fwd.x, fwd.z) * 180 / Math.PI;
        this._restCalibrated = true;
    }

    update(dt: number) {
        if (!this.combatEnabled || !this.aimBone) { this._hasPendingAim = false; return; }
        if (!this._restCalibrated) this._calibrateRestYaw();
        const target = this._findNearest();
        if (!target) { this._hasPendingAim = false; return; }

        // 조준부만 몬스터 쪽으로 회전 (탑 본체는 고정). Root_Bow의 로컬 Z축 = 월드 수직축이므로,
        // "목표를 향하는 절대 각도"에서 "rest pose가 향하는 절대 각도"를 뺀 만큼만 로컬 Z로
        // 돌리면 부모의 배치 회전과 무관하게 항상 정확히 목표를 향한다.
        // 실제로 노드에 적용하는 건 lateUpdate()에서 한다 — SkeletalAnimation의 매 프레임 샘플링이
        // 일반 update() "이후"에 일어나서, 여기서 바로 적용하면 shot 클립이 계속 재생 중일 때
        // 그 샘플링 결과가 뒤늦게 덮어써서 회전이 안 먹히는 문제가 있었다.
        const bonePos = this.aimBone.worldPosition;
        Vec3.subtract(this._dir, target.worldPosition, bonePos);
        this._dir.y = 0;
        if (this._dir.lengthSqr() > 0.0001) {
            const targetYawDeg = Math.atan2(this._dir.x, this._dir.z) * 180 / Math.PI;
            const localZDeg = targetYawDeg - this._restForwardYawDeg;
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

    private _findNearest(): Node | null {
        if (!this._spawner) return null;
        const myPos = this.node.worldPosition;
        let best: Node | null = null;
        let minDist = this.attackRange;

        for (const m of this._spawner.activeMonsters) {
            if (m.isDead || !m.node.isValid) continue;
            const d = Vec3.distance(m.node.worldPosition, myPos);
            if (d < minDist) { minDist = d; best = m.node; }
        }
        return best;
    }

    private _shoot(target: Node) {
        this._playAttackClip();

        const from = this.aimBone!.worldPosition;
        const dx = target.worldPosition.x - from.x;
        const dz = target.worldPosition.z - from.z;
        const horizLen = Math.hypot(dx, dz) || 1;
        const fwdX = dx / horizLen;
        const fwdZ = dz / horizLen;
        const spawnFwd = 0.6;
        const spawnHeight = 0.5;

        const scene = director.getScene();
        if (!scene) return;
        const bNode = new Node('Bullet');
        scene.addChild(bNode);
        bNode.setWorldPosition(
            from.x + fwdX * spawnFwd,
            from.y + spawnHeight,
            from.z + fwdZ * spawnFwd,
        );
        const fxParams: HitEffectParams = {
            scaleStart: this.fxScaleStart,
            scaleMid: this.fxScaleMid,
            scaleEnd: this.fxScaleEnd,
            sizeRandomMin: this.fxSizeRandomMin,
            sizeRandomMax: this.fxSizeRandomMax,
            opacity: this.fxOpacity,
            opacityRandomMin: this.fxOpacityRandomMin,
            opacityRandomMax: this.fxOpacityRandomMax,
        };
        bNode.addComponent(Bullet).init(
            target, this.attackDamage, this.arrowSpeed,
            this.arrowMesh, this.arrowMat,
            this.fxHitMesh, this.fxHitMat,
            fxParams,
            this.node,
        );
    }

    /** shot 클립을 매번 처음부터 한 번만 재생 (defaultClip인 appear와 같은 Animation 컴포넌트를
     * 공유하므로, 발사 순간 appear가 아직 재생 중이었다면 그 자리에서 끊기고 shot으로 넘어간다).
     * Player.ts의 AtkSpeed와 같은 방식으로, 클립 한 사이클이 발사 주기(1/attackRate)와
     * 일치하도록 재생 속도를 보정한다 — 공격속도가 빨라지면 애니메이션도 그만큼 빨리 재생된다.
     * 이 클립도 Root_Bow 회전 커브를 갖고 있지만, TowerAttack.update()가 매 프레임 그 뒤에
     * 다시 조준 회전으로 덮어쓰므로(같은 프레임에서 스크립트가 항상 나중에 실행됨) 실제로는
     * 조준 추적이 우선한다 — 크로스보우가 항상 몬스터를 보며 쏘는 것을 더 중요하게 봤다. */
    private _playAttackClip() {
        if (!this._anim || !this.clipAttack || this.attackRate <= 0) return;
        const state = this._anim.getState(this.clipAttack.name);
        if (!state) return;
        state.wrapMode = AnimationClip.WrapMode.Normal;
        state.speed = this.clipAttack.duration * this.attackRate;
        state.time = 0;
        state.play();
    }
}
