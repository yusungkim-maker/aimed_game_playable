import { _decorator, Component, Node, Vec2, Vec3,
         director, AnimationClip, Mesh, Material, animation } from 'cc';
import { MonsterSpawner } from './MonsterSpawner';
import { Bullet } from './Bullet';
import { HitEffectParams } from './HitEffect';
import { JoystickUI } from './JoystickUI';
import { MapBounds } from './MapBounds';
import { VirtualWall } from './VirtualWall';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

/**
 * Camera sits at (0, 11.361, 4.405) with Y-euler = 0°.
 * "Screen up"  → world direction (0, 0, -1)
 * "Screen right"→ world direction (+1, 0, 0)
 *
 * Transform: worldX = joyX
 *            worldZ = -joyY
 */

@ccclass('Player')
export class Player extends Component {
    /** 조이스틱이 연결된(=실제 조작하는) 유일한 Player 인스턴스. 추종자도 Player 컴포넌트를
     * 재사용하지만 joystickNode가 없으므로 이 싱글턴에는 등록되지 않는다 — 문처럼 "플레이어
     * 위치"가 필요한 다른 스크립트가 인스턴스마다 참조를 따로 연결하지 않아도 되게 해준다. */
    static instance: Player | null = null;

    @property(Node) spawnerNode:  Node | null = null;
    @property(Node) joystickNode: Node | null = null;
    @property(Node) mapBoundsNode: Node | null = null;

    // AnimationGraph(PlayerAnimGraph)의 상체 공격 레이어가 재생하는 클립과 동일한 에셋.
    // 재생 자체는 그래프가 담당하고, 여기서는 duration만 읽어 attackRate에 맞춰 speed를 계산한다.
    @property(AnimationClip) clipAttack: AnimationClip | null = null;

    @property(Mesh)     arrowMesh: Mesh     | null = null;
    @property(Material) arrowMat:  Material | null = null;
    @property({ displayName: '화살 스케일', tooltip: 'arrowMesh를 화면에 얼마나 크게 표시할지 (Bullet 노드의 setScale 배율)' })
    arrowScale: number = 4;

    @property(Mesh)     fxHitMesh: Mesh     | null = null;
    @property(Material) fxHitMat:  Material | null = null;

    // ── 타격 이펙트 튜닝 (HitEffect로 전달) ─────────────────────────────
    @property fxScaleStart:      number = 0.3;   // 펀치 애니메이션 시작 스케일
    @property fxScaleMid:        number = 1.0;   // 펀치 애니메이션 중간 스케일
    @property fxScaleEnd:        number = 0.6;   // 펀치 애니메이션 종료 스케일
    @property fxSizeRandomMin:   number = 0.3;   // 전체 크기 랜덤 배율 최소값
    @property fxSizeRandomMax:   number = 0.5;   // 전체 크기 랜덤 배율 최대값
    @property fxOpacity:         number = 0.5;   // 기본 오퍼시티 (0~1)
    @property fxOpacityRandomMin: number = 0.8;  // 오퍼시티 랜덤 배율 최소값
    @property fxOpacityRandomMax: number = 1.2;  // 오퍼시티 랜덤 배율 최대값

    @property moveSpeed:    number = 5;
    @property attackRate:   number = 1.5;   // shots / second
    @property attackDamage: number = 1;
    @property attackRange:  number = 3;
    @property arrowSpeed:   number = 14;

    @property({ displayName: '화살 생성 위치 - 앞으로 이격(m)', tooltip: '캐릭터 중심에서 타겟 방향으로 이만큼 앞에 화살을 생성한다. Player 컴포넌트는 플레이어/추종자가 각자 인스턴스를 가지므로, 인스펙터에서 캐릭터별로 따로 조절할 수 있다.' })
    arrowSpawnFwd: number = 0.6;

    @property({ displayName: '화살 생성 위치 - 높이(m)', tooltip: '캐릭터 피벗 기준 이만큼 위(손/무기 높이)에 화살을 생성한다. Player 컴포넌트는 플레이어/추종자가 각자 인스턴스를 가지므로, 인스펙터에서 캐릭터별로 따로 조절할 수 있다.' })
    arrowSpawnHeight: number = 1.0;

    private _animCtrl:  animation.AnimationController | null = null;
    private _spawner:   MonsterSpawner    | null = null;
    private _joystick:  JoystickUI        | null = null;
    private _mapBounds: MapBounds         | null = null;

    private _attackTimer = 0;

    /** 상체(공격) 레이어의 인덱스. PlayerAnimGraph에서 Base=0, UpperBodyAttack=1로 구성했다. */
    private static readonly UPPER_BODY_LAYER = 1;

    /**
     * 조이스틱이 없는(=추종자) 인스턴스를 위한 외부 이동 입력 훅. null이 아니면 조이스틱
     * 대신 이 값을 이동 방향으로 사용한다 (FollowerMovement.ts가 매 프레임 갱신).
     * 좌표계는 조이스틱과 동일: worldX = x, worldZ = -y.
     */
    moveDirOverride: Vec2 | null = null;

    /**
     * 소켓 위에서 대기 중인 고스트 미리보기 추종자는 아직 "생산되지 않은" 상태이므로
     * 몬스터를 타게팅/공격/조준 회전하면 안 된다. FollowerGhostState.enterGhost()/solidify()가
     * 이 값을 false/true로 토글한다 — false인 동안 update()는 타겟을 아예 찾지 않는다.
     */
    combatEnabled = true;

    onLoad() {
        this._animCtrl = this.getComponent(animation.AnimationController)
                       ?? this.getComponentInChildren(animation.AnimationController);
    }

    start() {
        if (this.spawnerNode)   this._spawner   = this.spawnerNode.getComponent(MonsterSpawner);
        if (this.joystickNode)  this._joystick  = this.joystickNode.getComponent(JoystickUI);
        if (this.mapBoundsNode) this._mapBounds = this.mapBoundsNode.getComponent(MapBounds);
        if (this.joystickNode)  Player.instance = this;
    }

    onDestroy() {
        if (Player.instance === this) Player.instance = null;
    }

    update(dt: number) {
        const dir    = this.moveDirOverride ?? this._joystick?.direction ?? Vec2.ZERO;
        const moving = dir.length() > 0.1;
        const target = this.combatEnabled ? this._findNearest() : null;

        // ── Movement (위치만 갱신 — 회전은 아래에서 타겟 유무에 따라 별도 처리) ──
        if (moving) {
            const wx = dir.x;
            const wz = -dir.y;
            const p  = this.node.worldPosition;
            let nx = p.x + wx * this.moveSpeed * dt;
            let nz = p.z + wz * this.moveSpeed * dt;

            // 맵 경계 밖으로 나가는 축만 취소 → 벽을 따라 미끄러지듯 이동
            if (this._mapBounds) {
                if (!this._mapBounds.contains(nx, p.z)) nx = p.x;
                if (!this._mapBounds.contains(nx, nz)) nz = p.z;
            }
            // 건설된 건물(벽/타워) 안으로 들어가는 축만 취소 → 벽을 따라 미끄러지듯 이동.
            // 추종자(조이스틱 없는 인스턴스)는 대형을 유지하며 플레이어를 따라가야 하므로
            // 건물 충돌에서 완전히 자유롭다 — 실제 조작하는 플레이어에게만 적용한다.
            // 단, 지금 서있는 자리(p) 자체가 이미 벽 안에 갇혀있는 상태라면(건물이 트리거로
            // 생성되는 순간 하필 플레이어 위치와 겹쳐버린 경우) 이번 프레임은 판정을 건너뛰어
            // 빠져나올 수 있게 해준다 — 빠져나오는 즉시 다음 프레임부터 다시 정상 판정이 걸린다.
            // 이 "갇힘" 판정은 반드시 실제 충돌 경계와 똑같아야 한다. 조금이라도 더 넓게 잡으면
            // (경계 바깥 여유 범위까지 탈출 모드로 치면) 플레이어가 벽에 다가가는 도중 그 여유
            // 범위에 들어서는 순간부터 충돌이 통째로 꺼져서 벽을 그대로 통과해버린다.
            if (this.joystickNode && !VirtualWall.isBlockedForPlayer(p.x, p.z)) {
                if (VirtualWall.isBlockedForPlayer(nx, p.z)) nx = p.x;
                if (VirtualWall.isBlockedForPlayer(nx, nz)) nz = p.z;
            }

            this.node.setWorldPosition(nx, p.y, nz);
        }

        // ── Facing: 타겟이 있으면 이동 여부와 상관없이 항상 타겟을 바라본다
        // (뒷걸음질 사격 중 이동방향 ↔ 타겟방향으로 번갈아 홱홱 도는 현상 방지).
        // 타겟이 없을 때만 이동 방향을 바라본다.
        if (target) {
            const p  = this.node.worldPosition;
            const dx = target.worldPosition.x - p.x;
            const dz = target.worldPosition.z - p.z;
            this.node.setRotationFromEuler(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);
        } else if (moving) {
            this.node.setRotationFromEuler(0, Math.atan2(dir.x, -dir.y) * 180 / Math.PI, 0);
        }

        // ── Animation state ──────────────────────────────────────────────
        // Base 레이어: 다리(하체) — Moving 여부로 Idle/Move 전환, 항상 정상 속도.
        // UpperBodyAttack 레이어(다리 관절 마스크 제외): 타겟이 있을 때만 가중치 1로 보여서
        // 상체(크로스보우)만 공격 모션을 재생하고, 다리는 Base 레이어의 속도를 그대로 유지한다.
        this._animCtrl?.setValue('Moving', moving);
        this._animCtrl?.setLayerWeight(Player.UPPER_BODY_LAYER, target ? 1 : 0);
        if (target && this.clipAttack && this.attackRate > 0) {
            // 공격 모션 한 사이클이 발사 주기(1/attackRate)와 일치하도록 재생 속도 보정
            this._animCtrl?.setValue('AtkSpeed', this.clipAttack.duration * this.attackRate);
        }

        // ── Auto-attack (발사 타이밍만 담당, 애니메이션/회전과 무관) ─────────
        this._attackTimer += dt;
        if (target && this._attackTimer >= 1 / this.attackRate) {
            this._attackTimer = 0;
            this._shoot(target);
        }
    }

    // ── Internal helpers ──────────────────────────────────────────────────
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
        AudioManager.instance?.playArrow();

        const myPos = this.node.worldPosition;

        const dx = target.worldPosition.x - myPos.x;
        const dz = target.worldPosition.z - myPos.z;

        const horizLen  = Math.hypot(dx, dz) || 1;
        const fwdX      = dx / horizLen;
        const fwdZ      = dz / horizLen;
        const scene = director.getScene();
        if (!scene) return;
        const bNode = new Node('Bullet');
        scene.addChild(bNode);
        bNode.setWorldPosition(
            myPos.x + fwdX * this.arrowSpawnFwd,
            myPos.y + this.arrowSpawnHeight,
            myPos.z + fwdZ * this.arrowSpawnFwd,
        );
        const fxParams: HitEffectParams = {
            scaleStart: this.fxScaleStart,
            scaleMid:   this.fxScaleMid,
            scaleEnd:   this.fxScaleEnd,
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
            null,
            this.arrowScale,
        );
    }

}
