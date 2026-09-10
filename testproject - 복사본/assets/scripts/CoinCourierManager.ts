import { _decorator, Component, Node, Prefab, Vec3, CCFloat, Material, instantiate, MeshRenderer, SkinnedMeshRenderer } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
import { CoinStack } from './CoinStack';
import { CoinCourier } from './CoinCourier';
import { Player } from './Player';
import { EndingEffect } from './EndingEffect';
const { ccclass, property } = _decorator;

/** 트리거 하나에 대응하는 운반 노선 1건 — "이 소켓을 채우면, 이 무더기에서 저 무더기로 옮기는 운반자가 나온다" */
@ccclass('CourierRoute')
export class CourierRoute {
    @property({ type: TriggerId, displayName: '반응할 트리거 ID', tooltip: '소켓 목록에서 이 트리거 ID를 가진 소켓이 요구치를 채우는 순간 이 노선의 운반자가 등장한다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ type: CoinGroundStack, displayName: '출발 무더기', tooltip: '운반자가 코인을 퍼올 coin_ground — 보통 이 소켓과 같은 섹터(타워가 처치한 코인이 쌓이는 곳)' })
    sourceStack: CoinGroundStack | null = null;

    @property({ type: CoinGroundStack, displayName: '도착 무더기', tooltip: '운반자가 코인을 내려놓을 coin_ground — 보통 기지 앞의 공용 무더기. 여러 노선이 같은 곳을 가리켜도 된다' })
    destStack: CoinGroundStack | null = null;

    @property({ displayName: '운반자 수', tooltip: '이 노선에 배정할 운반자 수. 늘리면 그만큼 빨리 옮기지만 같은 무더기를 나눠 퍼가는 것이므로 총량은 같다' })
    courierCount: number = 1;
}

/**
 * 소켓 충족을 신호로 "코인 운반자" 추종자를 배치하는 컨트롤러.
 *
 * 스폰/이동/코인 이동 로직을 새로 만들지 않는다 — CoinEvents.SocketFilled(BuildingTrigger나
 * BossRushManager가 반응하는 것과 똑같은 이벤트)만 구독하고, 실제 일은 스폰한 노드에 붙인
 * CoinCourier가 한다. 어느 소켓이 어느 무더기에서 어디로 옮기는지는 전부 아래 노선 표(씬
 * 데이터)에 있으므로, 이 스크립트에는 씬별 분기가 하나도 없다.
 *
 * **운반자가 전투하지 않는 이유**: 스폰 직후 `Player.combatEnabled`를 false로 둔다(고스트
 * 상태의 추종자를 비전투로 만드는 FollowerGhostState와 같은 스위치). 몬스터 쪽은 기지와 문만
 * 공격하므로(Monster.ts) 운반자가 피격되는 경로도 없다 — 운반 루프가 전투로 끊기지 않는다.
 *
 * **등 뒤 스택 설정을 프리팹이 아니라 여기 두는 이유**: 추종자 프리팹(Follower.prefab)은
 * 다른 씬과 공유하는 자산이라, 거기에 CoinStack을 붙이면 운반자가 아닌 전투 추종자들까지
 * 전부 등에 코인을 달게 된다. 그래서 프리팹은 건드리지 않고 스폰 시점에 CoinStack을
 * 붙이면서 아래 값들을 주입한다.
 */
@ccclass('CoinCourierManager')
export class CoinCourierManager extends Component {
    @property({ type: [CourierRoute], displayName: '운반 노선 목록', tooltip: '트리거 ID별로 "어디서 어디로" 옮길지 등록. 같은 트리거 ID로 여러 줄을 넣으면 그 트리거에서 여러 노선이 동시에 생긴다. 같은 트리거는 한 번만 발동한다' })
    routes: CourierRoute[] = [];

    @property({ type: Prefab, displayName: '운반자 프리팹', tooltip: '운반자로 쓸 프리팹. 일꾼 외형(크로스보우 없음 + 평범한 걷기 그래프 + 크기 0.8)이 미리 적용된 Worker.prefab을 쓴다. 스폰 직후 전투를 꺼두므로(Player.combatEnabled=false) 전투 컴포넌트가 붙어 있어도 공격하지 않는다' })
    courierPrefab: Prefab | null = null;

    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '운반자가 코인을 내려놓을 때 쓰는 풀 — 씬의 CoinSystem에 있는 것과 같은 것을 연결' })
    coinPool: CoinPool | null = null;

    // ── 운반자 동작 값 (스폰 시 CoinCourier에 주입) ─────────────────────────────
    @property({ displayName: '적재 용량(개)', tooltip: '한 번에 등에 싣고 갈 코인 개수. 이만큼 채우면 도착 무더기로 출발한다' })
    capacity: number = 10;

    @property({ displayName: '싣는 간격(초)', tooltip: '출발 무더기에서 코인을 한 개씩 등으로 빨아들이는 주기' })
    pickupInterval: number = 0.05;

    @property({ displayName: '내리는 간격(초)', tooltip: '도착 무더기에 코인을 한 개씩 내려놓는 주기' })
    depositInterval: number = 0.05;

    @property({ displayName: '도착 판정 거리(m)', tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다' })
    arriveDist: number = 0.6;

    @property({ displayName: '이동 속도', tooltip: '운반자의 걷는 속도(Player.moveSpeed를 덮어씀). 0 이하면 프리팹 값을 그대로 쓴다' })
    moveSpeed: number = 3;

    // ── 일꾼 외형 (전투 추종자와 같은 프리팹을 쓰면서 무기만 빼고 걸음걸이만 바꾼다) ──

    @property({ displayName: '숨길 무기 노드 이름 접두어', tooltip: '운반자에게서 감출 메시 노드의 이름 접두어. 이 접두어로 시작하는 자식 노드의 렌더러를 끈다(예: crossbow → crossbow001/crossbow002). 노드를 지우지 않고 렌더러만 끄므로 뼈대/애니메이션은 그대로다. 비워두면 아무것도 감추지 않는다' })
    weaponNodePrefix: string = 'crossbow';

    // ── 등 뒤 코인 스택 비주얼 (스폰 시 CoinStack에 주입) ───────────────────────
    @property({ type: Prefab, displayName: '등 코인 프리팹', tooltip: '운반자 등에 쌓일 코인 비주얼. 플레이어 CoinStack에 쓰는 것과 같은 프리팹을 넣으면 된다' })
    backStackCoinPrefab: Prefab | null = null;

    @property({ displayName: '등 코인 간격(m)', tooltip: '등에 위로 쌓을 때의 간격' })
    backStackSpacing: number = 0.12;

    @property({ displayName: '등 스택 로컬 오프셋', tooltip: '운반자 노드 기준 등 뒤 로컬 위치' })
    backStackOrigin: Vec3 = new Vec3(0, 1.0, -0.4);

    @property({ displayName: '등 코인 회전(Euler)', tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 등에 눕혀 쌓으려면 X를 -90으로' })
    backStackRotation: Vec3 = new Vec3(-90, 0, 0);

    // ── 등장 이펙트 (일꾼 발밑에서 퍼지는 원형 이펙트) ──────────────────────────
    // 페이드/발광 처리는 EndingEffect를 그대로 재사용한다 — 같은 로직을 두 벌 두지 않기 위함.
    @property({ type: Prefab, displayName: '등장 이펙트 프리팹', tooltip: '일꾼이 나타나는 순간 그 발밑에 깔릴 이펙트(efffect2). 비워두면 이펙트를 만들지 않는다' })
    spawnEffectPrefab: Prefab | null = null;

    @property({ type: Material, displayName: '등장 이펙트 발광 재질', tooltip: 'effects/GlowFx.mtl — 엔딩 이펙트(efffect1)와 같은 것을 넣으면 색·텍스처가 정확히 같아진다. 비워두면 glb가 들고 있던 머티리얼을 그대로 쓴다' })
    spawnEffectMaterial: Material | null = null;

    @property({ type: CCFloat, displayName: '등장 이펙트 유지 시간(초)', tooltip: '나타난 뒤 이 시간 동안은 그대로 보여주고, 그 다음부터 사라지기 시작한다' })
    spawnEffectHold: number = 0;

    @property({ type: CCFloat, displayName: '등장 이펙트 페이드아웃(초)', tooltip: '사라지는 데 걸리는 시간. 유지 시간 + 이 값이 총 노출 시간이다' })
    spawnEffectFade: number = 0.6;

    @property({ type: CCFloat, displayName: '등장 이펙트 발광 세기', tooltip: 'GlowFx 머티리얼의 emissiveIntensity. 보이는 부분만 이 배율만큼 밝아진다', range: [0, 10], slide: true })
    spawnEffectEmissive: number = 2;

    @property({ type: CCFloat, displayName: '등장 이펙트 크기', tooltip: '프리팹 원래 크기에 곱할 배율' })
    spawnEffectScale: number = 1;

    @property({ displayName: '등장 이펙트 바닥 맞춤', tooltip: '메시가 노드 원점보다 아래로 뻗어 있어도 바닥면이 일꾼 발밑에 오도록 자동으로 들어올린다. efffect2의 메시는 원점 기준 Y -1 ~ -0.17에 걸쳐 있어서(원점이 위쪽 끝) 이 보정이 없으면 통째로 땅에 묻힌다. 끄면 아래 높이 값만 적용된다' })
    spawnEffectAutoGround: boolean = true;

    @property({ type: CCFloat, displayName: '등장 이펙트 높이(m)', tooltip: '위의 바닥 맞춤 결과에서 추가로 위(+)/아래(-)로 얼마나 더 띄울지. 바닥과 정확히 같은 높이면 서로 파고들어 깜빡이므로 살짝 띄우는 게 안전하다' })
    spawnEffectHeight: number = 0.03;

    /** 같은 트리거로 두 번 배치하지 않기 위한 기록 (BossRushManager와 같은 방식) */
    private _firedTriggerIds = new Set<TriggerId>();

    onLoad() {
        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._firedTriggerIds.has(triggerId)) return;
        const matches = this.routes.filter(
            r => r.triggerId === triggerId && r.sourceStack && r.destStack,
        );
        if (matches.length === 0) return;
        this._firedTriggerIds.add(triggerId);

        for (const route of matches) {
            for (let i = 0; i < Math.max(1, route.courierCount); i++) this._spawnCourier(route);
        }
    }

    private _spawnCourier(route: CourierRoute) {
        if (!this.courierPrefab) return;

        const node = instantiate(this.courierPrefab);
        // 출발 무더기 옆에서 등장시킨다 — 소켓 자리와 같은 섹터이므로 플레이어가 소켓을 채운
        // 그 자리에서 바로 나타나는 것처럼 보인다. 무더기 자신이 배치상 스케일/회전을 갖고
        // 있을 수 있으므로 자식으로 붙이지 않고 씬 루트에 붙여 월드 좌표만 맞춘다.
        const parent = this.node.scene ?? this.node.parent!;
        parent.addChild(node);
        node.setWorldPosition(route.sourceStack!.node.worldPosition);

        // 등 뒤 스택 — 프리팹에는 없으므로(다른 씬의 전투 추종자에 영향을 주지 않기 위해)
        // 여기서 붙이고 설정을 주입한다. initialCoins는 반드시 0 (빈 등으로 시작).
        const back = node.getComponent(CoinStack) ?? node.addComponent(CoinStack);
        back.stackCoinPrefab = this.backStackCoinPrefab;
        back.stackSpacing = this.backStackSpacing;
        back.stackOrigin = this.backStackOrigin.clone();
        back.stackRotation = this.backStackRotation.clone();
        back.initialCoins = 0;

        const courier = node.getComponent(CoinCourier) ?? node.addComponent(CoinCourier);
        courier.sourceStack = route.sourceStack;
        courier.destStack = route.destStack;
        courier.coinPool = this.coinPool;
        courier.capacity = this.capacity;
        courier.pickupInterval = this.pickupInterval;
        courier.depositInterval = this.depositInterval;
        courier.arriveDist = this.arriveDist;

        const player = node.getComponent(Player);
        if (player) {
            // 운반에만 전념시킨다 — 이 스위치를 끄면 Player.update()가 타깃 탐색 자체를
            // 건너뛰므로(Player.ts 109행) 공격도, 상체 공격 애니메이션도 나오지 않는다.
            // 상체(공격) 레이어의 가중치도 항상 0으로 눌려 있게 된다(Player.ts 158행).
            player.combatEnabled = false;
            if (this.moveSpeed > 0) player.moveSpeed = this.moveSpeed;
        }

        // 애니메이션 그래프(걸음걸이)는 여기서 바꿀 수 없다 — 반드시 프리팹 쪽에 박아야 한다.
        // AnimationController.graph의 setter는 값만 저장하고(engine animation-controller.ts:72),
        // 실제 평가기는 __preload()에서 딱 한 번 만들어진다(:91). __preload는 컴포넌트 초기화
        // 시점에 이미 끝나 있으므로, 스폰 후 graph를 대입해도 평가기가 다시 만들어지지 않아
        // 조용히 무효다(실제로 그렇게 만들었다가 일꾼이 계속 크로스보우 자세로 걸었다).
        // → 일꾼 전용 그래프는 Worker.prefab의 AnimationController에 직접 지정해 둔다.

        // 무기 메시만 끈다(노드는 남긴다) — 노드를 지우면 그 뼈대를 참조하는 스켈레톤
        // 애니메이션이 끊어질 수 있고, 무엇보다 Follower.prefab은 다른 씬과 공유하는
        // 자산이라 프리팹 자체를 고칠 수 없다.
        if (this.weaponNodePrefix) {
            for (const r of node.getComponentsInChildren(SkinnedMeshRenderer)) {
                if (r.node.name.startsWith(this.weaponNodePrefix)) r.enabled = false;
            }
        }

        this._spawnBurst(node.worldPosition);
    }

    /** 일꾼이 나타난 자리(발밑)에 원형 이펙트를 하나 깔고, 알아서 사라지게 둔다.
     *
     * 새 컴포넌트를 만들지 않고 EndingEffect를 재사용한다 — 발광 머티리얼 교체, alphaScale
     * 페이드, 다 끝난 뒤 정리까지 이미 거기 다 있다. 다만 이건 씬에 미리 놓인 엔딩 이펙트가
     * 아니라 매번 새로 만드는 1회성이라 두 스위치를 반대로 준다:
     *  - registerToPlayAll = false : 엔딩 때 playAll()로 되살아나면 안 된다
     *  - destroyOnFinish   = true  : 끄기만 하면 노드가 계속 쌓인다
     * hideOnStart도 false여야 한다(만들자마자 보여야 하므로). */
    private _spawnBurst(atWorld: Readonly<Vec3>) {
        if (!this.spawnEffectPrefab) return;
        const parent = this.node.scene ?? this.node.parent;
        if (!parent) return;

        const fx = instantiate(this.spawnEffectPrefab);
        const k = this.spawnEffectScale;
        if (k !== 1) fx.setScale(fx.scale.x * k, fx.scale.y * k, fx.scale.z * k);

        // ⚠ 컴포넌트를 붙이는 건 반드시 addChild "전"이어야 한다.
        // Node.addComponent는 노드가 이미 활성 계층에 있으면 그 자리에서 onLoad를 동기 호출한다
        // (engine node.ts:1136 `if (this._activeInHierarchy) activateComp(...)`). 먼저 addChild하면
        // 아래 값들을 넣기 전에 onLoad가 돌아버려서 (a) glowMaterial이 null인 채로 지나가 발광
        // 머티리얼로 교체되지 않고(=glb의 builtin-standard 그대로 → 이 프로젝트에선 아예 안 보일
        // 수 있다), (b) hideOnStart가 true라 노드가 꺼진다. 실제로 그래서 이펙트가 안 보였다.
        const e = fx.addComponent(EndingEffect);
        e.glowMaterial = this.spawnEffectMaterial;
        e.hideOnStart = false;
        e.registerToPlayAll = false;
        e.destroyOnFinish = true;
        e.holdDuration = this.spawnEffectHold;
        e.fadeDuration = this.spawnEffectFade;
        e.emissiveIntensity = this.spawnEffectEmissive;

        parent.addChild(fx);   // 여기서 비로소 onLoad가 돈다 — 위 값들이 전부 반영된 상태로
        fx.setWorldPosition(atWorld.x, atWorld.y + this._groundLift(fx) + this.spawnEffectHeight, atWorld.z);
        e.play();
    }

    /** 메시가 노드 원점보다 아래로 뻗어 있으면 그만큼 들어올릴 양(월드 m).
     * efffect2는 메시 Y 범위가 -1 ~ -0.17이라(원점이 원기둥 위쪽 끝) 보정 없이 발밑에 놓으면
     * 전부 지면 아래로 들어가 안 보인다. 메시 자체의 로컬 AABB 최저점을 읽어 스케일까지 곱해
     * 계산하므로, 크기를 바꿔도 바닥면이 계속 발밑에 맞는다. */
    private _groundLift(fx: Node): number {
        if (!this.spawnEffectAutoGround) return 0;
        let minY = Infinity;
        for (const r of fx.getComponentsInChildren(MeshRenderer)) {
            const mn = r.mesh?.struct.minPosition;
            if (mn) minY = Math.min(minY, mn.y);
        }
        if (minY === Infinity || minY >= 0) return 0;
        return -minY * fx.worldScale.y;
    }
}
