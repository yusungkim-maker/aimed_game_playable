import { _decorator, Component, Prefab, Node, instantiate, Vec3 } from 'cc';
import { Coin, CoinTuning } from './Coin';
import type { CoinStackTarget } from './CoinStack';
import { ResourceType } from './ResourceType';
const { ccclass, property } = _decorator;

/**
 * "이 자원은 이 프리팩으로 떨어진다" 한 줄.
 *
 * **목록이 비어 있으면 예전과 똑같다** — 무엇이 떨어지든 아래 "코인 프리팩" 하나만 쓴다.
 * 그래서 자원이 한 종류뿐인 씬은 이 목록을 건드리지 않아도 된다(절대 규칙 5).
 */
@ccclass('ResourcePrefabEntry')
export class ResourcePrefabEntry {
    @property({ type: ResourceType, displayName: '자원 종류' })
    type: ResourceType = ResourceType.Coin;

    @property({ type: Prefab, displayName: '프리팩', tooltip: '이 자원이 바닥에 떨어져 튀어오를 때 쓸 메쉬. 비워두면 공용 "코인 프리팩"을 쓴다' })
    prefab: Prefab | null = null;
}

/**
 * 드롭 코인 오브젝트 풀. 몬스터 처치 지점마다 스폰 요청이 들어오면 재사용 가능한 코인
 * 노드를 꺼내주고, 수집이 끝나면 다시 반환받아 비활성 상태로 보관한다.
 *
 * 코인은 런타임에 addComponent(Coin)으로 붙기 때문에 Coin.ts 자체엔 씬에 저장되는
 * 인스펙터 값이 없다 — 코인의 모든 동작 수치(자전/튐/팝 연출/자석 이동)는 여기 CoinPool
 * 인스펙터에서 조정하고, spawn 시점에 Coin에게 그대로 전달한다.
 */
@ccclass('CoinPool')
export class CoinPool extends Component {
    @property({ type: Prefab, displayName: '코인 프리팹', tooltip: 'coin.glb의 자동 생성 프리팹(정적 메쉬, 애니메이션 클립 없음)' })
    coinPrefab: Prefab | null = null;

    @property({ displayName: '초기 풀 크기' })
    initialSize: number = 16;

    @property({ type: [ResourcePrefabEntry], displayName: '자원별 프리팹', tooltip: '**비워두면 모든 자원이 위 "코인 프리팹"으로 떨어진다(예전 동작).** 나무·철처럼 생김새가 다른 자원을 쓰는 씬에서만 채운다 — 풀도 자원마다 따로 관리되므로 종류를 섞어 써도 엉키지 않는다' })
    resourcePrefabs: ResourcePrefabEntry[] = [];

    // ── 팝(스폰 연출) ────────────────────────────────────────────────────
    @property({ displayName: '팝 최고 높이(m)', tooltip: '스폰 시 튀어오르는 최고 높이' })
    popHeight: number = 1.2;

    @property({ displayName: '팝 지속시간(초)', tooltip: '스폰~착지까지 걸리는 시간. 이 동안은 자석 반경의 영향을 받지 않음' })
    popDuration: number = 0.5;

    @property({ displayName: '팝 랜덤 스캐터 반경(m)', tooltip: '착지 지점이 랜덤한 수평 방향으로 퍼지는 최대 거리. 0이면 제자리에서 위로만 튐' })
    popScatterFactor: number = 0.6;

    @property({ displayName: '착지 Y 위치(m)', tooltip: '코인 두께 때문에 지면(y=0)에 파묻혀 보이지 않도록 살짝 띄운 높이' })
    groundY: number = 0.07;

    @property({ displayName: '착지 시 X 회전(도)', tooltip: '코인 메쉬가 세워진 채로 임포트되어, 바닥에 눕히려면 -90' })
    groundRotationX: number = -90;

    // ── 대기 중 비주얼 ───────────────────────────────────────────────────
    @property({ displayName: '자전 속도(deg/s)' })
    spinSpeed: number = 180;

    @property({ displayName: '대기 중 상하 진폭(m)' })
    bobHeight: number = 0.12;

    @property({ displayName: '대기 중 상하 진동 속도' })
    bobSpeed: number = 3;

    // ── 자석 수집 ────────────────────────────────────────────────────────
    @property({ displayName: '수집 속도 계수', tooltip: '남은 거리를 초당 얼마나 좁히는지에 대한 계수. 클수록 빠르게 수렴함 — 거리 비례로 움직이므로 처음엔 빠르고 도착할수록 자연히 느려짐(고정 속도가 아님)' })
    collectEaseRate: number = 6;

    @property({ displayName: '최소 수집 속도(m/s)', tooltip: '거리 비례 속도의 하한선. 캐릭터의 최대 이동 속도보다 반드시 커야 한다 — 그렇지 않으면 캐릭터가 계속 이동할 때 코인이 등 뒤 자리를 영원히 따라잡지 못하고 붕 뜬 채로 남는다' })
    collectMinSpeed: number = 8;

    @property({ displayName: '수집 곡선 높이(m)', tooltip: '자석에 끌려 등 위 자리로 갈 때 위로 볼록하게 그리는 곡선의 높이. 0이면 직선 이동' })
    collectArcHeight: number = 0.6;

    @property({ displayName: '수집 완료 판정 거리(m)' })
    collectArriveDist: number = 0.35;

    // ── 최적화 ───────────────────────────────────────────────────────────
    @property({ displayName: '동시 대기 코인 최대 개수', tooltip: '아직 수집되지 않고(바닥에 떨어져 튀거나 대기 중인) 동시에 존재할 수 있는 코인의 전체 상한선. 넘으면 가장 오래 대기 중이던 코인부터 자석 반경과 무관하게 즉시 수집 처리되어(=플레이어/스택으로 날아가기 시작) 개수가 줄어든다 — 코인 값 자체는 잃지 않는다.' })
    maxWaiting: number = 300;

    /** 자원 종류별 풀. 프리팹이 다르면 인스턴스를 섞어 쓸 수 없으므로 반드시 따로 담는다 */
    private _pools = new Map<ResourceType, Node[]>();
    private _prefabOf = new Map<ResourceType, Prefab>();

    onLoad() {
        for (const e of this.resourcePrefabs) {
            if (e?.prefab) this._prefabOf.set(e.type, e.prefab);
        }
        // 초기 풀은 예전처럼 기본 자원(코인) 것만 미리 만들어 둔다. 나머지 종류는 처음
        // 필요해질 때 만들어진다 — 안 쓰는 자원의 인스턴스를 미리 깔아두면 로딩만 무거워진다.
        if (!this._prefabFor(ResourceType.Coin)) return;
        const pool = this._poolOf(ResourceType.Coin);
        for (let i = 0; i < this.initialSize; i++) pool.push(this._createInstance(ResourceType.Coin));
    }

    private _prefabFor(type: ResourceType): Prefab | null {
        return this._prefabOf.get(type) ?? this.coinPrefab;
    }

    private _poolOf(type: ResourceType): Node[] {
        let arr = this._pools.get(type);
        if (!arr) { arr = []; this._pools.set(type, arr); }
        return arr;
    }

    private _createInstance(type: ResourceType): Node {
        const node = instantiate(this._prefabFor(type)!);
        node.active = false;
        this.node.addChild(node);
        if (!node.getComponent(Coin)) node.addComponent(Coin);
        return node;
    }

    private _tuning(): CoinTuning {
        return {
            spinSpeed:         this.spinSpeed,
            bobHeight:         this.bobHeight,
            bobSpeed:          this.bobSpeed,
            collectEaseRate:   this.collectEaseRate,
            collectMinSpeed:   this.collectMinSpeed,
            collectArcHeight:  this.collectArcHeight,
            collectArriveDist: this.collectArriveDist,
            popHeight:         this.popHeight,
            popDuration:       this.popDuration,
            popScatterFactor:  this.popScatterFactor,
            groundY:           this.groundY,
            groundRotationX:   this.groundRotationX,
            maxWaiting:        this.maxWaiting,
        };
    }

    /**
     * 코인 하나를 꺼내 pos 위치에서 팝(스폰 연출) 후 target을 향한 자석 추적을 시작시킨다.
     * stack을 넘기면 자석에 걸렸을 때 캐릭터가 아니라 그 스택의 다음 빈 자리로 끌려간다.
     */
    /** 이 자원이 쓰는 프리팹. 풀을 거치지 않고 **직접 인스턴스를 만들어야 하는** 쪽(레일 위를
     * 흐르는 자원 등)이 같은 모양을 쓰도록 공개한다 — 여기서 못 가져오면 프리팹 슬롯을
     * 또 하나 만들어 같은 것을 두 군데서 관리하게 된다. */
    prefabFor(type: ResourceType = ResourceType.Coin): Prefab | null {
        return this._prefabFor(type);
    }

    spawn(pos: Vec3, target: Node, magnetRadius: number, stack: CoinStackTarget | null = null, fromGround = false, stayPut = false, resourceType: ResourceType = ResourceType.Coin): Node {
        if (!this._prefabFor(resourceType)) return new Node();   // 프리팹이 없으면 무동작
        const node = this._poolOf(resourceType).pop() ?? this._createInstance(resourceType);
        node.getComponent(Coin)!.activate(pos, target, magnetRadius, this, this._tuning(), stack, fromGround, stayPut, resourceType);
        return node;
    }

    /** Coin.ts가 수집 완료 시 호출 — 풀로 반환. 자원마다 프리팹이 다르므로 **반드시 자기 종류의
     * 풀로** 돌아가야 한다. 종류는 노드에 붙은 Coin이 기억하고 있다 */
    despawn(node: Node) {
        node.active = false;
        const type = node.getComponent(Coin)?.resourceType ?? ResourceType.Coin;
        this._poolOf(type).push(node);
    }
}
