import { _decorator, Component, Node, Prefab, Vec3, CCFloat, CCInteger, Material, instantiate, MeshRenderer, SkinnedMeshRenderer } from 'cc';
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

    @property({ displayName: '나무를 베는 일꾼', tooltip: '체크하면 출발지가 "무더기"가 아니라 "가장 가까운 나무"가 된다 — 일꾼이 스스로 나무를 찾아가 베고, 등이 차면 아래 도착 무더기(창고)에 부어넣고 다시 나간다. 체크하면 아래 "출발 무더기"는 비워둬도 된다(등장 위치만 지정). 체크 해제가 기본이라 기존 코인 운반 노선은 그대로다' })
    harvestFromTrees: boolean = false;

    @property({ type: Node, displayName: '등장 위치', tooltip: '일꾼이 튀어나올 자리 — 보통 일꾼을 고용하는 건물 앞. 비워두면 "출발 무더기" 자리에서 나온다(기존 동작)' })
    spawnPoint: Node | null = null;

    @property({ type: CoinGroundStack, displayName: '출발 무더기', tooltip: '운반자가 코인을 퍼올 coin_ground — 보통 이 소켓과 같은 섹터(타워가 처치한 코인이 쌓이는 곳). "나무를 베는 일꾼"을 체크했다면 비워둔다' })
    sourceStack: CoinGroundStack | null = null;

    @property({ type: CoinGroundStack, displayName: '도착 무더기', tooltip: '운반자가 자원을 내려놓을 coin_ground — 코인 운반이면 기지 앞 공용 무더기, 벌목이면 대형 창고. 여러 노선이 같은 곳을 가리켜도 된다' })
    destStack: CoinGroundStack | null = null;

    @property({ displayName: '운반자 수', tooltip: '이 노선에 배정할 운반자 수. 늘리면 그만큼 빨리 옮기지만 같은 무더기를 나눠 퍼가는 것이므로 총량은 같다' })
    courierCount: number = 1;

    @property({ displayName: '등에 보이게 싣기', tooltip: '체크(기본)하면 캔 자원이 일꾼 등 뒤에 실제로 쌓인다 — 기존 코인 운반자가 그렇다. 끄면 자원이 일꾼에게 날아와 사라지고 **개수만 센다**. 타이쿤 일꾼은 꺼두는 것이 맞다: 10개만 쌓여도 짐이 캐릭터보다 커 보이고, 일꾼 수만큼 코인 노드 비용이 곱해진다. 운반량과 창고 적재는 두 경우 모두 똑같이 동작한다' })
    carryVisually: boolean = true;

    @property({ displayName: '생산 소켓으로만 늘리기', tooltip: '체크하면 트리거가 발화해도 일꾼을 즉시 만들지 않고 **노선만 열어둔다** — 이후 SpawnerSocket(플레이어가 서 있으면 일꾼이 나오는 소켓)이 한 명씩 늘린다. 체크를 풀면 예전처럼 트리거 순간 "운반자 수"만큼 한꺼번에 나온다(기본). 타이쿤처럼 플레이어가 직접 일꾼을 뽑는 구성에서만 켠다' })
    spawnOnDemandOnly: boolean = false;

    @property({ type: Node, displayName: '광산 입구 노드', tooltip: '지정하면 이 노선의 일꾼은 **나무를 베지 않고 광산을 드나든다** — 이 노드까지 걸어가 사라졌다가, 아래 체류 시간이 지나면 다시 나타나 창고로 간다. 위치는 광산 메시의 입구에 맞춰 씬에 마커 노드를 만들어 지정한다. 비워두면 광산 모드가 아니다(기본) — "나무를 베는 일꾼" 쪽 설정이 그대로 쓰인다' })
    mineNode: Node | null = null;

    @property({ type: Node, displayName: '경로 노드', tooltip: '지정하면 이 노선의 일꾼이 **목적지까지 직선으로 가지 않고 이 노드의 자식들을 순서대로 거쳐 간다.** 자식 이름은 반드시 `Point0` `Point1` `Point2`… 로, 0부터 끊김 없이 붙인다(중간이 비면 거기서 끊긴 것으로 본다). 씬에서 그 점들을 끌어다 놓으면 길이 그대로 바뀐다 — 몬스터 러쉬 경로를 잡는 방식과 같다. 돌아올 때는 같은 점들을 **역순으로** 지난다. 비워두면 예전처럼 직선으로 간다(기본). 나무를 베는 일꾼은 갈 곳이 매번 달라 경로가 의미가 없으므로 **광산 노선에만 쓴다**' })
    pathRoot: Node | null = null;

    @property({ type: CCFloat, displayName: '광산 체류 시간(초)', tooltip: '일꾼이 광산 안에 머무는 시간. 이 값이 곧 채굴 속도다 — 짧으면 철이 빨리 쌓이고, 길면 일꾼을 더 뽑아야 한다는 압력이 된다. 광산 입구 노드를 지정한 노선에서만 쓴다' })
    mineDuration: number = 4;

    @property({ type: CCInteger, displayName: '1회 채굴량(0=적재 용량)', tooltip: '한 번 들어갔다 나올 때 캐 오는 개수. 0(기본)이면 위 "적재 용량"을 그대로 쓴다 — 즉 한 번 들어가면 가득 채워 나온다. 적재 용량보다 작게 주면 여러 번 왕복해야 가득 차는 대신 창고에 조금씩 더 자주 쌓인다' })
    mineYield: number = 0;

    @property({ type: TriggerId, displayName: '내려놓기 시작 트리거', tooltip: '이 트리거가 발화하기 전까지 이 노선의 일꾼은 **내려놓을 곳이 없다** — 캐기는 하되 창고로 가지 않고 **자기가 짐을 진 채 그 자리에 서 있는다.** 가득 차면 거기서 멈추고, 트리거가 오는 순간 곧바로 창고로 출발한다. 창고가 서기 전의 상태를 그대로 표현한 값이다(씬 3에서는 창고 건설 트리거를 넣는다). None(기본)이면 처음부터 내려놓는다 — 기존 노선은 이 항목이 비어 있으므로 영향이 없다'  })
    absorbTriggerId: TriggerId = TriggerId.None;

    @property({ displayName: '동시 상한(0=무제한)', tooltip: '이 노선에 동시에 존재할 수 있는 일꾼 수의 상한. 0(기본)이면 제한하지 않는다 — 기존 노선은 트리거 때 정해진 수만 나오므로 영향이 없다. 생산 소켓으로 계속 뽑는 구성에서는 반드시 값을 줘야 한다: 일꾼은 매 프레임 돌아가는 개체라 수가 곧 프레임 비용이다' })
    maxCouriers: number = 0;
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

    @property({ type: CCFloat, displayName: '나무 도착 판정 거리(m)', tooltip: '벌목 노선에서만 쓴다 — 나무 앞 이 거리까지 다가가면 멈춰 선다. 일꾼 Player의 "벌목 사거리"보다 작아야 멈춘 자리에서 도끼질이 닿는다' })
    treeArriveDist: number = 1.2;

    @property({ displayName: '도착 판정 거리(m)', tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다' })
    arriveDist: number = 0.6;

    @property({ displayName: '이동 속도', tooltip: '운반자의 걷는 속도(Player.moveSpeed를 덮어씀). 0 이하면 프리팹 값을 그대로 쓴다' })
    moveSpeed: number = 3;

    // ── 일꾼 외형 (전투 추종자와 같은 프리팹을 쓰면서 무기만 빼고 걸음걸이만 바꾼다) ──

    @property({ displayName: '숨길 무기 노드 이름 접두어', tooltip: '운반자에게서 감출 메시 노드의 이름 접두어. 이 접두어로 시작하는 자식 노드의 렌더러를 끈다(예: crossbow → crossbow001/crossbow002). 노드를 지우지 않고 렌더러만 끄므로 뼈대/애니메이션은 그대로다. 비워두면 아무것도 감추지 않는다' })
    weaponNodePrefix: string = 'crossbow';

    // ── 등 뒤 코인 스택 비주얼 (스폰 시 CoinStack에 주입) ───────────────────────
    @property({ type: CCFloat, displayName: '일꾼 벌목 속도(회/초)', tooltip: '일꾼이 나무를 초당 몇 번 찍을지(Player.벌목 속도를 덮어씀). **0이면 프리팹 값을 그대로 쓴다**(기본) — 이 칸을 건드리지 않으면 지금까지와 동작이 같다. 플레이어와 같은 값을 넣으면 손맛이 같아지고, 낮추면 일꾼이 굼떠 보인다' })
    workerChopRate: number = 0;

    @property({ type: CCFloat, displayName: '일꾼 벌목 타격 위력', tooltip: '일꾼이 한 번 때릴 때 나무를 깎는 양(Player.벌목 타격 위력을 덮어씀). 1이면 플레이어와 똑같이 몇 대에 쓰러뜨린다. **0.5면 두 배를 때려야 쓰러진다** — 플레이어가 2대면 일꾼은 4대다. 한 그루에서 나오는 총 자원은 위력과 무관하게 같으므로, 이 값은 "속도"만 바꾸고 "총량"은 바꾸지 않는다. 0 이하면 프리팹 값을 그대로 쓴다' })
    workerChopPower: number = 0;

    @property({ displayName: '달구지 노드 이름', tooltip: '일꾼이 **짐을 지고 창고로 갈 때만** 보여줄 노드의 이름(T_Worker 프리팹의 Wagon). 비워두면 달구지를 건드리지 않는다 — 노드가 프리팹에 꺼진 채로 들어 있어야 하고, 여기 이름을 넣으면 운반 구간에서만 켜진다. 걷기 클립 교체(@Wagon_*)는 애니메이션 그래프 쪽 일이라 여기서 하지 않는다' })
    wagonNodeName: string = '';

    @property({ displayName: '달구지 애니메이션 변수', tooltip: '일꾼이 짐을 지고 갈 때 켜는 애니메이션 그래프의 불리언 변수 이름(씬 3은 Wagon). 그래프에 같은 이름의 변수와 달구지 걷기 상태가 있어야 한다. **비워두면 걸음 클립은 그대로 두고 달구지 메시만 켜고 끈다** — 클립이 아직 준비되지 않은 씬에서도 안전하다' })
    wagonAnimVar: string = '';

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
    /** 트리거가 발화해 "열린" 노선들. 생산 소켓은 열리지 않은 노선에 일꾼을 넣을 수 없다 —
     * 건물이 서기 전에 일꾼이 나오면 안 되기 때문이다. */
    private _opened = new Set<CourierRoute>();
    /** 노선별로 지금 살아 있는 일꾼 노드. destroy된 것은 셀 때 걸러낸다 — 별도 정리 타이밍을
     * 두면 "죽은 일꾼이 자리를 차지해 더 못 뽑는" 버그가 생기기 쉽다. */
    private _spawned = new Map<CourierRoute, Node[]>();

    /** 이 트리거 ID로 열린 노선에 지금 살아 있는 일꾼 수. 상한 표시·판정에 쓴다. */
    countFor(triggerId: TriggerId): number {
        let n = 0;
        for (const route of this.routes) {
            if (route.triggerId !== triggerId) continue;
            n += this._liveList(route).length;
        }
        return n;
    }

    /** 이 트리거 ID로 열린 노선에 일꾼을 **한 명** 더 만든다. 만들었으면 true.
     *
     * 실패하는 경우(전부 false를 돌려준다): 노선이 아직 안 열렸다 / 동시 상한에 걸렸다 /
     * 노선 설정이 모자라다. 부르는 쪽(SpawnerSocket)은 false면 게이지를 되돌린다. */
    spawnFor(triggerId: TriggerId): boolean {
        for (const route of this.routes) {
            if (route.triggerId !== triggerId) continue;
            if (!this._opened.has(route)) continue;
            if (route.maxCouriers > 0 && this._liveList(route).length >= route.maxCouriers) continue;
            const node = this._spawnCourier(route);
            if (!node) continue;
            this._liveList(route).push(node);
            return true;
        }
        return false;
    }

    /**
     * 노선의 `경로 노드` 아래에서 `Point0`, `Point1`, … 을 순서대로 모은다.
     * **0부터 끊김 없이** 읽는다 — 중간이 비면 거기서 멈춘다. 배열 프로퍼티 대신 이 규칙을
     * 쓰는 이유는 이 프로젝트에서 배열을 MCP로 쓸 수 없고, 씬 뷰에서 점을 직접 끌어 옮기는
     * 편이 좌표를 숫자로 적는 것보다 훨씬 빠르기 때문이다(러쉬 경로와 같은 규칙).
     */
    private _pathPoints(route: CourierRoute): Node[] {
        const out: Node[] = [];
        const root = route.pathRoot;
        if (!root) return out;
        for (let i = 0; ; i++) {
            const n = root.getChildByName('Point' + i);
            if (!n) break;
            out.push(n);
        }
        return out;
    }

    /**
     * 이 트리거의 노선에 **지금 몇 명이 있고 최대 몇 명까지인지**. UI가 "3/10"을 그리려고
     * 쓴다. 같은 트리거를 여러 노선이 공유하면 전부 합쳐서 돌려준다 — 화면에는 "그 고용소로
     * 뽑히는 일꾼 수"가 하나로 보이는 것이 맞기 때문이다.
     * 상한이 0(무제한)인 노선이 하나라도 섞여 있으면 `max`는 0으로 돌려준다(= 표시할 상한 없음).
     * 노선이 아직 안 열렸어도 인원은 0으로 세어 정상적으로 "0/10"이 보인다.
     */
    countFor(triggerId: TriggerId): { live: number; max: number } {
        let live = 0, max = 0, unlimited = false;
        for (const route of this.routes) {
            if (route.triggerId !== triggerId) continue;
            live += this._liveList(route).length;
            if (route.maxCouriers > 0) max += route.maxCouriers; else unlimited = true;
        }
        return { live, max: unlimited ? 0 : max };
    }

    /** 노선의 살아 있는 일꾼 목록 — 무효 노드를 제자리에서 걸러낸 뒤 돌려준다. */
    private _liveList(route: CourierRoute): Node[] {
        let list = this._spawned.get(route);
        if (!list) { list = []; this._spawned.set(route, list); }
        for (let i = list.length - 1; i >= 0; i--) {
            if (!list[i] || !list[i].isValid) list.splice(i, 1);
        }
        return list;
    }

    onLoad() {
        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._firedTriggerIds.has(triggerId)) return;
        // 벌목 노선은 출발 무더기가 없다 — 출발지가 "가장 가까운 나무"라서 씬에 고정된
        // 출처를 가리키지 않는다. 그래서 출발 무더기 유무는 코인 운반 노선에만 요구한다.
        const matches = this.routes.filter(
            r => r.triggerId === triggerId && (r.harvestFromTrees || r.mineNode || r.sourceStack) && r.destStack,
        );
        if (matches.length === 0) return;
        this._firedTriggerIds.add(triggerId);

        for (const route of matches) {
            // 노선이 열린 것은 기록해둔다 — 생산 소켓은 "열린 노선"에만 일꾼을 더할 수 있다.
            this._opened.add(route);
            if (route.spawnOnDemandOnly) continue;  // 즉시 생성 없음 — 생산 소켓이 뽑는다
            for (let i = 0; i < Math.max(1, route.courierCount); i++) this._spawnCourier(route);
        }
    }

    /** 일꾼 하나를 만들어 돌려준다. 설정이 모자라 못 만들면 null — 부르는 쪽이 그것으로
     * "이번엔 못 뽑았다"를 판단한다(생산 소켓이 게이지를 되돌린다). */
    private _spawnCourier(route: CourierRoute): Node | null {
        if (!this.courierPrefab) return null;

        // 벌목 노선은 고용 건물 앞(등장 위치)에서, 코인 운반 노선은 예전처럼 출발 무더기에서 나온다.
        const spawnAt = route.spawnPoint?.worldPosition ?? route.sourceStack?.node.worldPosition;
        if (!spawnAt) return null;

        const node = instantiate(this.courierPrefab);
        // 출발 무더기 옆에서 등장시킨다 — 소켓 자리와 같은 섹터이므로 플레이어가 소켓을 채운
        // 그 자리에서 바로 나타나는 것처럼 보인다. 무더기 자신이 배치상 스케일/회전을 갖고
        // 있을 수 있으므로 자식으로 붙이지 않고 씬 루트에 붙여 월드 좌표만 맞춘다.
        const parent = this.node.scene ?? this.node.parent!;
        parent.addChild(node);
        node.setWorldPosition(spawnAt);

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
        courier.harvestFromTrees = route.harvestFromTrees;
        courier.destStack = route.destStack;
        courier.coinPool = this.coinPool;
        courier.capacity = this.capacity;
        courier.pickupInterval = this.pickupInterval;
        courier.depositInterval = this.depositInterval;
        courier.arriveDist = this.arriveDist;
        courier.treeArriveDist = this.treeArriveDist;
        courier.carryVisually = route.carryVisually;
        courier.absorbTriggerId = route.absorbTriggerId;
        courier.wagonNodeName = this.wagonNodeName;
        courier.wagonAnimVar = this.wagonAnimVar;
        courier.mineNode = route.mineNode;
        courier.mineDuration = route.mineDuration;
        courier.mineYield = route.mineYield;
        courier.setPath(this._pathPoints(route));

        const player = node.getComponent(Player);
        if (player) {
            // 운반에만 전념시킨다 — 이 스위치를 끄면 Player.update()가 타깃 탐색 자체를
            // 건너뛰므로 공격도, 상체 공격 애니메이션도 나오지 않는다. 상체(공격) 레이어의
            // 가중치도 항상 0으로 눌려 있게 된다.
            // **벌목 노선은 예외다** — 나무를 때리는 것도 도끼질 애니메이션도 이 경로를 타야
            // 하므로, CoinCourier가 상태에 따라(나무로 갈 때/벨 때만) 스스로 켜고 끈다.
            player.combatEnabled = false;
            if (this.moveSpeed > 0) player.moveSpeed = this.moveSpeed;
            if (this.workerChopRate > 0) player.chopRate = this.workerChopRate;
            if (this.workerChopPower > 0) player.chopPower = this.workerChopPower;
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
        return node;
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
