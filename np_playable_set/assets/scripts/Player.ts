import { _decorator, Component, Node, Vec2, Vec3, CCInteger, CCFloat,
         director, AnimationClip, Mesh, Material, animation } from 'cc';
import { MonsterSpawner } from './MonsterSpawner';
import { Bullet } from './Bullet';
import { HitEffect, HitEffectParams } from './HitEffect';
import { DustPuffFx, DustPuffParams } from './DustPuffFx';
import { JoystickUI } from './JoystickUI';
import { MapBounds } from './MapBounds';
import { VirtualWall } from './VirtualWall';
import { AudioManager } from './AudioManager';
import { Choppable } from './Choppable';
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
    /** 미끄러짐 결과를 받는 공용 임시 벡터 (프레임마다 새로 만들지 않기 위함) */
    private static _slideOut = new Vec3();

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

    @property({ displayName: '벌목 타격 이펙트 높이(m)', tooltip: '나무를 찍을 때 타격 이펙트가 나무 밑동에서 이만큼 위에 뜬다. 몬스터는 화살이 맞은 지점에 생기지만 도끼질은 맞는 지점이 따로 없어서 이 값으로 정한다 — 자원이 튀어나오는 높이(Choppable의 dropHeight)와 비슷하게 맞추면 자연스럽다. 이펙트 그림·색·크기는 위의 fxHit 항목들을 몬스터 피격과 그대로 공유한다' })
    chopFxHeight: number = 1.0;

    // ── 벌목 먼지 파티클 (DustPuffFx) ───────────────────────────────────
    // 타격 이펙트 한 장만으로는 약해 보여서, 같은 지점에서 먼지 몇 알이 함께 터져 나온다.
    // 메시는 위의 fxHitMesh(쿼드 한 장)를 그대로 재사용하고 머티리얼만 따로 받는다.
    @property({ type: Material, displayName: '먼지 머티리얼', tooltip: '먼지에 쓸 아틀라스 머티리얼(T_FxSmoke). 2x2 = 4칸이며 알마다 랜덤으로 한 칸을 고른다 — 순서대로 재생하는 시퀀스가 아니다. **비워두면 먼지가 아예 안 나온다**(타격 이펙트만 나옴)' })
    dustFxMat: Material | null = null;

    @property({ type: CCInteger, displayName: '먼지 개수(최소)', tooltip: '한 번 휘두를 때 터지는 먼지 알 수의 하한. 최대값과 같게 두면 항상 같은 개수가 나온다' })
    dustCountMin: number = 5;

    @property({ type: CCInteger, displayName: '먼지 개수(최대)', tooltip: '한 번 휘두를 때 터지는 먼지 알 수의 상한. 개수를 크게 올리면 알마다 노드+머티리얼 인스턴스가 하나씩 생기므로 타격이 잦은 구간에서 부담이 된다' })
    dustCountMax: number = 6;

    @property({ type: CCFloat, displayName: '먼지 수명(초)', tooltip: '한 알이 생겨서 사라질 때까지의 시간. 짧으면 톡 터지고 말고, 길면 천천히 내려앉는다' })
    dustLifetime: number = 0.45;

    @property({ type: CCFloat, displayName: '먼지 수평 속도(최소)', tooltip: '옆으로 흩어지는 초기 속도(m/s). 크게 주면 넓게 퍼진다' })
    dustSpeedMin: number = 0.8;

    @property({ type: CCFloat, displayName: '먼지 수평 속도(최대)' })
    dustSpeedMax: number = 1.8;

    @property({ type: CCFloat, displayName: '먼지 튀어오르는 속도(최소)', tooltip: '위로 솟는 초기 속도(m/s). 중력과 함께 포물선의 높이를 정한다' })
    dustRiseMin: number = 1.2;

    @property({ type: CCFloat, displayName: '먼지 튀어오르는 속도(최대)' })
    dustRiseMax: number = 2.2;

    @property({ type: CCFloat, displayName: '먼지 중력', tooltip: '아래로 당기는 가속도(m/s^2). 크면 금방 떨어지고, 0이면 계속 떠오른다 — 튀어오르는 속도와 짝으로 맞춘다' })
    dustGravity: number = 6;

    @property({ type: CCFloat, displayName: '먼지 퍼짐 각도(도)', tooltip: '타격 방향을 중심으로 좌우로 퍼지는 부채꼴의 폭. 360이면 사방으로 고르게 터지고, 60 정도로 줄이면 도끼가 지나간 쪽으로만 튄다' })
    dustSpreadDeg: number = 360;

    @property({ type: CCFloat, displayName: '먼지 크기(시작)', tooltip: 'pop 곡선의 시작 크기. 작게 시작해 최대까지 확 커졌다가 끝 크기로 줄어든다' })
    dustScaleStart: number = 0.25;

    @property({ type: CCFloat, displayName: '먼지 크기(최대)' })
    dustScalePeak: number = 0.75;

    @property({ type: CCFloat, displayName: '먼지 크기(끝)' })
    dustScaleEnd: number = 0.45;

    @property({ type: CCFloat, displayName: '먼지 크기 랜덤(최소)', tooltip: '알마다 전체 크기에 곱하는 랜덤 배율. 1을 사이에 두고 벌려두면 크고 작은 먼지가 섞여 자연스럽다' })
    dustSizeRandomMin: number = 0.8;

    @property({ type: CCFloat, displayName: '먼지 크기 랜덤(최대)' })
    dustSizeRandomMax: number = 1.3;

    @property({ type: CCFloat, displayName: '먼지 오퍼시티', tooltip: '먼지의 기본 투명도(0~1). 수명 후반 40% 구간에서 0으로 사라진다' })
    dustOpacity: number = 0.7;

    // ── 벌목 타격 타이밍 ────────────────────────────────────────────────
    // 몬스터는 화살을 쏘는 것이라 "언제 쏘든" 화살이 날아가 맞지만, 도끼질은 도끼가 나무에
    // 닿는 그 프레임에 자원이 나와야 한다. 그래서 나무를 칠 때만 공격 주기 타이머 대신
    // 애니메이션 진행도를 보고 정확한 프레임에서 판정한다(CharacterBob이 발 디딤을 잡는 것과
    // 같은 방식 — 재생 속도가 바뀌어도 도끼와 타격이 어긋나지 않는다).
    @property({ type: CCInteger, displayName: '벌목 타격 프레임', tooltip: '도끼가 나무에 닿는 프레임 번호. Blender 타임라인과 같은 1부터 세는 번호다(1 = 클립의 첫 프레임). 아래 "벌목 클립 총 프레임"과 함께 진행도 (프레임-1)/(총-1) 로 환산된다 — Chop 클립 기준 15/33 이면 진행도 0.4375' })
    chopHitFrame: number = 15;

    @property({ type: CCInteger, displayName: '벌목 클립 총 프레임', tooltip: '벌목 애니메이션의 전체 프레임 수. Chop 클립은 30fps 33프레임(1.0667초)이다. 클립을 교체해 길이가 달라지면 이 값도 같이 고쳐야 타격 프레임이 안 밀린다' })
    chopClipFrames: number = 33;

    @property({ type: CCFloat, displayName: '벌목 속도(회/초)', tooltip: '나무를 초당 몇 번 찍을지. 애니메이션 재생 속도와 타격 주기가 함께 이 값에 맞춰지므로, 올리면 도끼질이 그만큼 빨라진다.\n\n**0이면 아래 attackRate(몬스터 공격 속도)를 그대로 쓴다** — 기본값이 0이라 이 칸을 건드리지 않으면 지금까지와 동작이 똑같다. 벌목만 빠르게/느리게 하고 싶을 때만 값을 넣는다(예: 일꾼은 4, 플레이어는 1.6)' })
    chopRate: number = 0;

    @property moveSpeed:    number = 5;
    @property attackRate:   number = 1.5;   // shots / second
    @property attackDamage: number = 1;
    @property attackRange:  number = 3;

    @property({ displayName: '벌목 사거리(m)', tooltip: '나무(Choppable)를 때릴 수 있는 거리. 몬스터 사거리(attackRange)와 따로 둔 이유는 두 가지다 — (1) 도끼질은 근접이라 화살 사거리보다 짧아야 하고, (2) attackRange는 코인 자석 반경(CoinSpawnController의 배수 기준)까지 겸하고 있어서 그걸 줄이면 자원이 안 빨려온다. 나무가 없는 씬에서는 이 값이 아무 일도 하지 않는다' })
    chopRange:      number = 2;

    @property({ type: CCFloat, displayName: '벌목 타격 위력', tooltip: '나무를 한 번 때릴 때 깎는 양. 1(기본)이면 나무의 "타격 횟수"만큼 때리면 쓰러진다 — 지금까지의 동작이다. 0.5로 두면 두 배를 때려야 쓰러진다(타격 횟수 2인 나무를 4번). **한 그루에서 나오는 총 자원은 위력과 무관하게 같다** — 매 타격의 산출도 같은 비율로 줄어들고 소수점은 누적되기 때문이다. 플레이어보다 일꾼을 약하게 만들어 "직접 베는 게 빠르다"를 표현하는 데 쓴다' })
    chopPower: number = 1;
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

    /** 지난 프레임의 상체 레이어 진행도(0~1). -1이면 "기준 없음"이라 이번 프레임은 판정하지
     * 않는다 — 타겟을 막 잡은 순간에 엉뚱한 지점에서 한 대 맞는 것을 막는다. */
    private _prevChopProgress = -1;
    /** 매 프레임 getComponent를 피하기 위한 캐시. 타겟이 바뀔 때만 다시 찾는다 — 일꾼이
     * 늘어나면 이 비용이 인원수만큼 곱해진다. */
    private _cachedTarget: Node | null = null;
    private _cachedChoppable: Choppable | null = null;

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

    /** 실제로 쓰이는 벌목 속도. 0 이하로 두면 몬스터 공격 속도를 그대로 따라간다 —
     * 이 한 줄 덕분에 기존 씬은 값을 채우지 않아도 예전과 완전히 같이 동작한다. */
    private get _chopRate(): number {
        return this.chopRate > 0 ? this.chopRate : this.attackRate;
    }

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
        // 나무인지 몬스터인지에 따라 재생 속도와 타격 판정 방식이 갈린다. 한 번만 찾아 둔다.
        const choppable = target ? this._choppableOf(target) : null;

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
            // 막혔을 때는 **벽 면을 따라 미끄러진다.** 예전에는 월드 X축, 그다음 Z축을 따로
            // 시도해 막히는 축만 취소했는데, 그 방식은 벽이 45도로 놓이면 두 축이 동시에
            // 막혀 제자리에 완전히 멈춰 선다(씬 3의 울타리가 −45도라 그랬다). 벽 자신의
            // 축으로 푸는 쪽이 각도와 무관하게 매끄럽고, 축에 나란한 벽에서는 예전과 결과가
            // 똑같다(씬 1·2 무영향).
            if (this.joystickNode && !VirtualWall.isBlockedForPlayer(p.x, p.z)) {
                VirtualWall.slideForPlayer(p.x, p.z, nx, nz, Player._slideOut);
                nx = Player._slideOut.x;
                nz = Player._slideOut.z;
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
        if (target && this.clipAttack) {
            // 공격 모션 한 사이클이 타격 주기와 일치하도록 재생 속도 보정.
            // 나무를 칠 때는 벌목 속도를, 몬스터를 쏠 때는 공격 속도를 쓴다.
            const rate = choppable ? this._chopRate : this.attackRate;
            if (rate > 0) this._animCtrl?.setValue('AtkSpeed', this.clipAttack.duration * rate);
        }

        // ── Auto-attack (발사 타이밍만 담당, 애니메이션/회전과 무관) ─────────
        this._attackTimer += dt;
        if (!target) {
            // 다음에 타겟을 잡으면 그때부터 새로 센다 — 타겟이 없던 동안 흘러간 진행도로
            // 판정하면 나무에 다가서자마자 한 대가 먼저 들어간다.
            this._prevChopProgress = -1;
        } else if (choppable) {
            // 나무: 도끼가 닿는 프레임에서만 판정한다.
            if (this._chopHitFrameReached()) {
                this._attackTimer = 0;
                this._shoot(target);
            }
        } else if (this._attackTimer >= 1 / this.attackRate) {
            this._attackTimer = 0;
            this._shoot(target);
        }
    }

    // ── Internal helpers ──────────────────────────────────────────────────
    /** 공격 대상 1개. 몬스터가 우선이고, 없으면 사거리 안의 나무를 집는다.
     *
     * 몬스터 씬(1·2)에는 `Choppable`이 한 그루도 없어 `Choppable.all`이 비어 있고, 그러면
     * 아래 한 줄은 루프를 한 번도 돌지 않고 null을 돌려준다 — **기존 두 씬의 동작은 그대로다.**
     * 반대로 타이쿤 씬에는 MonsterSpawner가 없어 `_findNearestMonster()`가 즉시 null이다. */
    private _findNearest(): Node | null {
        return this._findNearestMonster()
            ?? Choppable.findNearestNode(this.node.worldPosition, this.chopRange);
    }

    private _findNearestMonster(): Node | null {
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

    /** 이 타겟이 나무인지. 타겟이 바뀔 때만 실제로 찾고 나머지 프레임은 캐시를 돌려준다. */
    private _choppableOf(target: Node): Choppable | null {
        if (this._cachedTarget !== target) {
            this._cachedTarget = target;
            this._cachedChoppable = target.getComponent(Choppable);
            // 타겟이 바뀌면 진행도 기준도 새로 잡는다.
            this._prevChopProgress = -1;
        }
        return this._cachedChoppable;
    }

    /** 타격 프레임의 정규화 진행도. 프레임 번호는 1부터 세므로 첫 프레임이 0, 마지막이 1이다. */
    private _chopHitProgress(): number {
        const total = Math.max(2, this.chopClipFrames);
        const hit   = Math.min(Math.max(1, this.chopHitFrame), total);
        return (hit - 1) / (total - 1);
    }

    /**
     * 이번 프레임에 상체 애니메이션이 "타격 프레임"을 지나갔는지.
     *
     * 진행도(progress)는 매 사이클 0→1을 반복하는 값이라(엔진의 normalizeProgress = 소수부),
     * 지난 프레임 값과 비교해 타격 지점을 **넘어선 순간 딱 한 번** true를 돌려준다. 프레임
     * 간격이 들쭉날쭉해도 건너뛰지 않고, 한 사이클에 두 번 터지지도 않는다.
     *
     * 애니메이션을 읽을 수 없는 구성(AnimationController가 없는 캐릭터)에서는 벌목 속도를
     * 주기로 삼아 친다 — 나무가 영영 안 베이는 것보다 낫다.
     */
    private _chopHitFrameReached(): boolean {
        const status = this._animCtrl?.getCurrentStateStatus(Player.UPPER_BODY_LAYER);
        if (!status) return this._chopRate > 0 && this._attackTimer >= 1 / this._chopRate;

        const hit  = this._chopHitProgress();
        const cur  = status.progress;
        const prev = this._prevChopProgress;
        this._prevChopProgress = cur;

        if (prev < 0) return false;                        // 기준이 없는 첫 프레임
        if (cur < prev) return prev < hit || cur >= hit;    // 한 바퀴 넘어갔다
        return prev < hit && cur >= hit;
    }

    /** 인스펙터의 fx* 값들을 HitEffect가 받는 형태로 묶는다. 몬스터 피격(화살)과 벌목이
     * 같은 이펙트를 쓰므로 두 경로가 이 한 곳을 공유한다 — 값을 한 번만 손보면 둘 다 바뀐다. */
    private _makeFxParams(): HitEffectParams {
        return {
            scaleStart: this.fxScaleStart,
            scaleMid:   this.fxScaleMid,
            scaleEnd:   this.fxScaleEnd,
            sizeRandomMin: this.fxSizeRandomMin,
            sizeRandomMax: this.fxSizeRandomMax,
            opacity: this.fxOpacity,
            opacityRandomMin: this.fxOpacityRandomMin,
            opacityRandomMax: this.fxOpacityRandomMax,
        };
    }

    private _makeDustParams(): DustPuffParams {
        return {
            lifetime: this.dustLifetime,
            speedMin: this.dustSpeedMin,
            speedMax: this.dustSpeedMax,
            riseMin:  this.dustRiseMin,
            riseMax:  this.dustRiseMax,
            gravity:  this.dustGravity,
            spreadDeg: this.dustSpreadDeg,
            scaleStart: this.dustScaleStart,
            scalePeak:  this.dustScalePeak,
            scaleEnd:   this.dustScaleEnd,
            sizeRandomMin: this.dustSizeRandomMin,
            sizeRandomMax: this.dustSizeRandomMax,
            opacity: this.dustOpacity,
        };
    }

    /**
     * 나무를 찍은 자리에 몬스터 피격과 같은 아틀라스 이펙트 + 먼지 몇 알을 띄운다.
     *
     * 화살(Bullet)은 날아가 맞은 지점에서 스스로 이펙트를 만들지만, 도끼질은 발사체가 없어서
     * 여기서 직접 만든다. 방향은 "내가 나무를 보는 방향" — HitEffect가 이 값으로 그림을
     * 회전시키고, 먼지는 이 방향을 중심으로 부채꼴로 퍼진다.
     *
     * **에셋이 비어 있으면 그만큼만 조용히 건너뛴다** — 타격 이펙트(fxHitMesh/fxHitMat)와
     * 먼지(dustFxMat)는 서로 독립이라, 먼지 머티리얼만 안 꽂으면 타격 이펙트만 나온다.
     */
    private _spawnChopFx(target: Node) {
        if (!this.fxHitMesh) return;
        const scene = director.getScene();
        if (!scene) return;

        const myPos = this.node.worldPosition;
        const tp    = target.worldPosition;
        const dx    = tp.x - myPos.x;
        const dz    = tp.z - myPos.z;
        const len   = Math.hypot(dx, dz) || 1;
        const dir   = new Vec3(dx / len, 0, dz / len);
        const y     = tp.y + this.chopFxHeight;

        if (this.fxHitMat) {
            const fxNode = new Node('ChopHitFx');
            scene.addChild(fxNode);
            fxNode.setWorldPosition(tp.x, y, tp.z);
            fxNode.addComponent(HitEffect).init(this.fxHitMesh, this.fxHitMat, dir, this._makeFxParams());
        }

        if (this.dustFxMat) {
            // 개수는 매 타격 랜덤 — 같은 수가 반복되면 찍어낸 느낌이 난다.
            const lo = Math.max(0, Math.min(this.dustCountMin, this.dustCountMax));
            const hi = Math.max(this.dustCountMin, this.dustCountMax);
            const n  = lo + Math.floor(Math.random() * (hi - lo + 1));
            const params = this._makeDustParams();
            for (let i = 0; i < n; i++) {
                const d = new Node('ChopDust');
                scene.addChild(d);
                d.setWorldPosition(tp.x, y, tp.z);
                d.addComponent(DustPuffFx).init(this.fxHitMesh, this.dustFxMat, dir, params);
            }
        }
    }

    private _shoot(target: Node) {
        // 나무는 근접으로 그 자리에서 찍는다 — 발사체를 만들면 안 된다(도끼질인데 화살이 날아간다).
        // 공격 타이밍/회전/상체 애니메이션은 위의 공용 경로를 그대로 쓰고, 여기서만 갈라진다.
        // this.node를 넘기는 것이 중요하다 — 캔 자원이 "이것을 벤 쪽"의 등으로 간다.
        // 플레이어가 베면 플레이어 등으로, 일꾼이 베면 그 일꾼 등으로 (CoinSpawnController가 분배).
        const choppable = target.getComponent(Choppable);
        if (choppable) {
            choppable.chop(this.node, this.chopPower);
            // 붉은 번쩍임은 Choppable이 자기 렌더러에 직접 넣고(맞은 나무만 물들어야 하므로),
            // 튀는 아틀라스 이펙트와 먼지는 때린 쪽이 만든다 — 이펙트 에셋을 들고 있는 것이 이쪽이다.
            this._spawnChopFx(target);
            return;
        }

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
        bNode.addComponent(Bullet).init(
            target, this.attackDamage, this.arrowSpeed,
            this.arrowMesh, this.arrowMat,
            this.fxHitMesh, this.fxHitMat,
            this._makeFxParams(),
            null,
            this.arrowScale,
        );
    }

}
