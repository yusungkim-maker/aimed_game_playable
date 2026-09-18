import { _decorator, Component, Node, Vec3, Prefab, instantiate, CCInteger } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { ResourceType } from './ResourceType';
import type { Coin } from './Coin';
const { ccclass, property } = _decorator;

/**
 * 코인이 "어디로 끌려가 쌓이는지"를 나타내는 공통 인터페이스. CoinStack(캐릭터 등 뒤)과
 * CoinGroundStack(바닥 무더기)이 둘 다 구현한다 — Coin.ts/CoinPool.ts는 이 인터페이스만
 * 알면 되고, 어느 쪽 스택인지는 신경 쓰지 않는다.
 *
 * `type`은 **선택 인자다.** 자원 구분이 없던 시절에 만들어진 호출부는 넘기지 않고, 그러면
 * 받는 쪽이 ResourceType.Coin으로 취급한다 — 씬 1·2가 이 인터페이스 변경을 모르고 지나간다.
 */
export interface CoinStackTarget {
    reserveSlot(type?: ResourceType): number;
    getSlotWorldPosition(index: number, out: Vec3, type?: ResourceType): Vec3;
}

/**
 * 등 뒤 스택에서 자원 한 종류가 차지하는 "줄" 하나의 설정.
 *
 * **이 목록이 비어 있으면 예전과 똑같이 동작한다** — 모든 자원이 ResourceType.Coin으로
 * 취급되어 한 줄로, 상한 없이, CoinStack의 "스택 코인 프리팹"으로 쌓인다(절대 규칙 5).
 * 그래서 씬 1·2는 이 목록을 건드리지 않아도 된다.
 */
@ccclass('ResourceLane')
export class ResourceLane {
    @property({ type: ResourceType, displayName: '자원 종류' })
    type: ResourceType = ResourceType.Coin;

    @property({ type: Prefab, displayName: '스택 프리팹', tooltip: '이 자원이 등에 쌓일 때 보여줄 정적 비주얼. 비워두면 아래 CoinStack의 "스택 코인 프리팹"을 그대로 쓴다' })
    prefab: Prefab | null = null;

    @property({ displayName: '등에 보이기', tooltip: '끄면 개수만 세고 등에는 아무것도 안 쌓인다 — 코인처럼 "먹으면 상단 UI 숫자만 올라가는" 자원에 쓴다. 끄면 아래 두 상한은 표시에 영향을 주지 않는다(보유 상한은 그대로 적용됨)' })
    visible: boolean = true;

    @property({ displayName: '레인 로컬 오프셋(m)', tooltip: 'CoinStack의 "스택 시작 로컬 오프셋"에서 이 줄을 얼마나 옮겨 쌓을지. 자원마다 다르게 줘서 등 뒤에 나란히 세운다 — 전부 0이면 겹쳐 쌓여 한 줄처럼 보인다' })
    laneOffset: Vec3 = new Vec3();

    @property({ displayName: '회전 덮어쓰기', tooltip: '켜면 이 줄에 쌓이는 자원만 아래 "레인 회전"으로 돌린다. 끄면(기본) CoinStack의 "스택 코인 회전"을 그대로 쓴다 — 기존 씬은 이 항목이 꺼져 있으므로 동작이 변하지 않는다. 자원마다 메쉬가 세워진 축이 달라서(코인은 눕혀야 하고 통나무는 가로로 눕혀야 한다) 한 값으로는 다 맞지 않을 때 켠다' })
    overrideRotation: boolean = false;

    @property({ displayName: '레인 회전 (Euler)', tooltip: '이 줄에 쌓이는 자원의 로컬 회전(도). 위 "회전 덮어쓰기"를 켜야 쓰인다. 캐릭터 노드 기준 로컬이라 캐릭터가 돌아도 같이 돈다. 기본값은 CoinStack의 기본 회전과 같은 (-90, 0, 0)이라, 체크만 켜면 일단 예전과 같은 모습에서 시작해 거기서 조절하면 된다', visible(this: ResourceLane) { return this.overrideRotation; } })
    laneRotation: Vec3 = new Vec3(-90, 0, 0);

    @property({ type: CCInteger, displayName: '최대 표시 개수', tooltip: '이 개수를 넘으면 **노드를 더 만들지 않고 숫자로만 센다.** 개수 자체는 잃지 않으므로 소켓에 넣거나 소비할 때 전부 쓸 수 있다. 등 뒤에 수백 개가 쌓이면 드로우콜이 그만큼 늘어 모바일에서 바로 렉이 된다. 0이면 무제한(권장하지 않음)' })
    maxVisible: number = 100;

    @property({ type: CCInteger, displayName: '보유 상한', tooltip: '등에 실을 수 있는 실제 최대 개수. 이 수에 도달하면 더 받지 않는다(도착한 자원은 사라진다). 0이면 무제한 — 위 "최대 표시 개수"와 다르다: 이쪽은 개수 자체의 상한이고, 저쪽은 보이는 것만의 상한이다' })
    maxCarry: number = 0;
}

/** 레인 설정이 없는 자원에 쓰는 기본값 — 예전 동작(한 줄, 상한 없음, 공용 프리팹) 그대로다 */
const LEGACY_LANE: ResourceLane = new ResourceLane();

/**
 * 캐릭터가 등에 지고 다니는 **인벤토리**. 자원 종류마다 자기 줄(레인)을 갖고, 줄마다
 * "등에 보일지 / 몇 개까지 보일지 / 몇 개까지 가질지"를 따로 정한다.
 *
 * **왜 별도의 "장부(ledger)" 클래스를 두지 않았나**: 플레이어가 가진 나무·철·칼의 개수는
 * 결국 "등에 실린 개수" 그 자체다(창고에 쌓인 나무는 창고 쪽 CoinGroundStack이 센다).
 * 개수를 세는 곳을 따로 만들면 같은 수를 두 군데서 관리하게 되어 반드시 어긋난다.
 * 코인처럼 등에 안 보이는 자원도 "보이기"만 끄면 여기서 같이 세어진다.
 *
 * 예전과의 호환: `lanes`가 비어 있으면 자원 구분 없이 한 줄로 쌓는 예전 동작 그대로다.
 */
@ccclass('CoinStack')
export class CoinStack extends Component implements CoinStackTarget {
    @property({ type: Prefab, displayName: '스택 코인 프리팹', tooltip: '등에 쌓일 때 보여줄 정적 코인 비주얼 (로직 컴포넌트 없는 순수 표시용 인스턴스). 아래 레인 목록에서 프리팹을 따로 주지 않은 자원이 이걸 쓴다' })
    stackCoinPrefab: Prefab | null = null;

    @property({ displayName: '코인 간 간격(m)', tooltip: '쌓일 때 위로 쌓는 간격' })
    stackSpacing: number = 0.08;

    @property({ displayName: '스택 시작 로컬 오프셋', tooltip: '캐릭터 노드 기준 등 뒤 로컬 위치. 레인별 오프셋은 여기에 더해진다' })
    stackOrigin: Vec3 = new Vec3(0, 1.0, -0.4);

    @property({ displayName: '스택 코인 회전(Euler)', tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 등에 눕혀 쌓으려면 X를 -90으로 돌려야 함' })
    stackRotation: Vec3 = new Vec3(-90, 0, 0);

    @property({ displayName: '시작 보유 코인 개수', tooltip: '게임 시작 시 이미 등에 쌓여있는 코인 개수 (소켓 트리거 부트스트랩용). 자원 종류는 항상 코인이다' })
    initialCoins: number = 6;

    @property({ type: [ResourceLane], displayName: '자원 레인 목록', tooltip: '**비워두면 예전처럼 자원 구분 없이 한 줄로 무제한 쌓는다.** 자원을 여러 종류 지고 다녀야 하는 씬에서만 채운다 — 목록에 없는 자원은 기본 설정(한 줄, 표시 100개, 보유 무제한)으로 처리된다' })
    lanes: ResourceLane[] = [];

    /** 자원별 설정. lanes를 매번 훑지 않도록 onLoad에서 한 번만 표로 만든다 */
    private _laneOf = new Map<ResourceType, ResourceLane>();
    /** 자원별 **실제로 만들어진 노드**. 항상 min(총개수, 최대 표시 개수)만큼만 들어 있다 */
    private _nodes = new Map<ResourceType, Node[]>();
    /** 자원별 **총 개수**(표시 상한을 넘어 눈에 안 보이는 것까지 포함) */
    private _counts = new Map<ResourceType, number>();
    /** 자원별 예약 슬롯 수 — 날아오는 중인 자원이 서로 다른 자리를 향하게 한다 */
    private _reserved = new Map<ResourceType, number>();

    // CoinCollected는 코인이 어느 스택으로 향했든 상관없이 전역으로 emit되므로(Coin.ts는
    // 여러 종류의 CoinStackTarget 중 하나를 향해 갈 수 있음 — CoinGroundStack 등), 이 코인이
    // 실제로 "나"를 향해 가던 것이었는지 coin.stack으로 반드시 확인하고 넘어가야 한다.
    // 확인 없이 무조건 _addOne()하면 다른 스택(예: 타워 킬 코인의 coin_ground)으로 향하던
    // 코인까지 여기 등 뒤 스택에 잘못 추가돼버린다.
    private _onCoinCollected = (coin: Coin) => {
        if (coin.stack === this) this._addOne(coin.resourceType);
    };

    onLoad() {
        for (const lane of this.lanes) {
            if (lane) this._laneOf.set(lane.type, lane);
        }
        CoinEvents.on(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    start() {
        for (let i = 0; i < this.initialCoins; i++) this._addOne(ResourceType.Coin);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    /** 자원 종류를 가리지 않은 총 보유 개수. 자원이 한 종류뿐인 씬에서는 예전 `count`와 같다 */
    get count(): number {
        let total = 0;
        this._counts.forEach((n) => { total += n; });
        return total;
    }

    /** 이 자원을 몇 개 지고 있는가 (표시 상한을 넘어 눈에 안 보이는 것까지 포함) */
    countOf(type: ResourceType): number {
        return this._counts.get(type) ?? 0;
    }

    /** 이 자원을 한 개 더 실을 수 있는가 (보유 상한 판정). 상한이 0이면 항상 true */
    canAccept(type: ResourceType): boolean {
        const max = this._lane(type).maxCarry;
        return max <= 0 || this.countOf(type) < max;
    }

    /**
     * 자석에 걸린 자원이 수집을 시작할 때 호출 — 아직 비어있는 다음 슬롯 하나를 예약해서
     * 인덱스를 돌려준다. 동시에 여러 개가 날아오는 중에도 서로 다른 슬롯을 향하게 하기 위해
     * 실제로 쌓이는 시점(_addOne)이 아니라 예약 시점에 즉시 증가시킨다.
     */
    reserveSlot(type: ResourceType = ResourceType.Coin): number {
        const n = this._reserved.get(type) ?? 0;
        this._reserved.set(type, n + 1);
        // 등에 보이지 않는 자원은 **자리를 주지 않는다.** 자리를 주면 노드는 만들지 않으면서
        // 목표 높이만 개수에 비례해 올라가서, 먹을수록 코인이 머리 위 허공으로 날아가는
        // 그림이 된다(실제로 그렇게 보였다). -1을 돌려주면 Coin이 캐릭터 자신에게 날아와
        // 그대로 사라진다 — "그냥 흡수"가 이것이다.
        if (!this._lane(type).visible) return -1;
        return n;
    }

    /** 예약된 슬롯의 현재 월드 좌표를 계산한다 (캐릭터가 이동해도 매 프레임 다시 불러 추적) */
    getSlotWorldPosition(index: number, out: Vec3, type: ResourceType = ResourceType.Coin): Vec3 {
        const lane = this._lane(type);
        // 표시 상한을 넘어선 자원은 "보이지 않는 자리"로 날아가면 허공에서 사라지는 것처럼
        // 보인다. 그래서 목적지를 항상 보이는 맨 위 칸으로 잡아준다 — 개수는 그대로 늘어난다.
        const slot = lane.maxVisible > 0 ? Math.min(index, lane.maxVisible - 1) : index;
        out.set(
            this.stackOrigin.x + lane.laneOffset.x,
            this.stackOrigin.y + lane.laneOffset.y + slot * this.stackSpacing,
            this.stackOrigin.z + lane.laneOffset.z,
        );
        return Vec3.transformMat4(out, out, this.node.worldMatrix);
    }

    /**
     * 소켓이 자원을 하나씩 순차적으로 흡수할 때 호출. 가장 최근에 쌓인(맨 위) 노드를
     * 스택에서 분리해 그대로 반환한다(destroy하지 않음 — 호출측이 소켓으로 날아가는
     * 연출에 그 실제 노드를 재사용함). 그 자원이 하나도 없으면 null.
     *
     * 표시 상한을 넘겨 쌓여 있었다면, 맨 위를 하나 빼준 뒤 **가려져 있던 것 하나를 새로
     * 만들어 채운다** — 그래야 등 뒤 높이가 실제 보유량을 계속 반영한다.
     */
    popTop(type: ResourceType = ResourceType.Coin): Node | null {
        const count = this.countOf(type);
        if (count <= 0) return null;

        const nodes = this._nodesOf(type);
        const node = nodes.pop() ?? null;
        this._counts.set(type, count - 1);
        // 진행 중인 예약도 현재 크기에 맞춰 재동기화
        this._reserved.set(type, this._visibleTarget(type));
        this._refill(type);
        CoinEvents.emit(CoinEventName.StackChanged, this.count, this, type);
        return node;
    }

    // ── 내부 ────────────────────────────────────────────────────────────

    private _lane(type: ResourceType): ResourceLane {
        return this._laneOf.get(type) ?? LEGACY_LANE;
    }

    private _nodesOf(type: ResourceType): Node[] {
        let arr = this._nodes.get(type);
        if (!arr) { arr = []; this._nodes.set(type, arr); }
        return arr;
    }

    /** 지금 보여야 하는 노드 개수 = min(총 개수, 표시 상한) */
    private _visibleTarget(type: ResourceType): number {
        const lane = this._lane(type);
        const count = this.countOf(type);
        if (!lane.visible) return 0;
        return lane.maxVisible > 0 ? Math.min(count, lane.maxVisible) : count;
    }

    private _addOne(type: ResourceType) {
        if (!this.canAccept(type)) return;   // 보유 상한 — 더 못 싣는다
        this._counts.set(type, this.countOf(type) + 1);
        this._refill(type);
        CoinEvents.emit(CoinEventName.StackChanged, this.count, this, type);
    }

    /** 노드 개수를 _visibleTarget에 맞춘다. 모자라면 만들고, 남으면 지운다 */
    private _refill(type: ResourceType) {
        const nodes = this._nodesOf(type);
        const want = this._visibleTarget(type);
        while (nodes.length > want) {
            const n = nodes.pop();
            n?.removeFromParent();
            n?.destroy();
        }
        while (nodes.length < want) {
            const node = this._createVisual(type, nodes.length);
            if (!node) return;   // 프리팹이 없으면 더 시도해봐야 소용없다
            nodes.push(node);
        }
    }

    private _createVisual(type: ResourceType, slot: number): Node | null {
        const lane = this._lane(type);
        const prefab = lane.prefab ?? this.stackCoinPrefab;
        if (!prefab) return null;
        const node = instantiate(prefab);
        this.node.addChild(node);
        node.setPosition(
            this.stackOrigin.x + lane.laneOffset.x,
            this.stackOrigin.y + lane.laneOffset.y + slot * this.stackSpacing,
            this.stackOrigin.z + lane.laneOffset.z,
        );
        // 줄마다 따로 돌릴 수 있다 — 자원별로 메쉬가 세워진 축이 달라서 한 값으로는 안 맞는다.
        // 덮어쓰기를 안 켜면 예전처럼 CoinStack 전체 회전을 그대로 쓴다.
        const rot = lane.overrideRotation ? lane.laneRotation : this.stackRotation;
        node.setRotationFromEuler(rot.x, rot.y, rot.z);
        return node;
    }
}
