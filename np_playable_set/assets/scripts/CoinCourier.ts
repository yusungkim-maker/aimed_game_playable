import { _decorator, Component, Node, Vec2, Vec3, CCFloat } from 'cc';
import { Player } from './Player';
import { CoinStack } from './CoinStack';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
import { Choppable } from './Choppable';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { MeshRenderer, SkinnedMeshRenderer, animation } from 'cc';
const { ccclass, property } = _decorator;

/** 운반자가 지금 무엇을 하고 있는지. */
enum CourierState {
    /** 출발지(무더기 또는 나무)로 가는 중 */
    ToSource,
    /** 출발지에서 등에 싣는 중 — 무더기면 퍼담고, 나무면 베어서 채운다
     *  (실을 것이 없으면 여기서 계속 대기한다) */
    Loading,
    /** 목적지 무더기로 가는 중 */
    ToDest,
    /** 목적지에 내리는 중 */
    Unloading,
    /** 짐을 진 채 내려놓을 곳이 없어 그 자리에서 들고 서 있는 중 — 창고를 짓기 전의 상태다.
     *  "내려놓기 시작 트리거"가 오면 그대로 목적지로 출발한다. */
    Holding,
    /** 광산 안에 들어가 있는 중 — 몸이 보이지 않고 체류 시간이 끝나기를 기다린다 */
    InMine,
}

/**
 * 소켓 보상으로 나오는 "코인 운반자" 추종자. 자기 섹터의 coin_ground에 쌓인 코인을 등에
 * 지고(용량만큼) 기지 앞 coin_ground로 옮기는 일을 계속 반복한다.
 *
 * 이 컴포넌트는 이동/애니메이션/전투를 직접 구현하지 않는다 — FollowerMovement와 똑같이
 * `Player.moveDirOverride`에 "지금 목표로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이고,
 * 실제 이동과 걷기/대기 애니메이션은 전부 Player.ts가 그대로 담당한다.
 *
 * **전투를 하지 않는 이유**: CoinCourierManager가 스폰 직후 `Player.combatEnabled`를 false로
 * 둔다(고스트 상태의 추종자를 비전투로 만드는 FollowerGhostState와 같은 스위치). 몬스터 쪽은
 * 기지와 문만 공격하므로(Monster.ts) 운반자가 피격되는 경로도 애초에 없다 — 즉 운반 루프가
 * 전투 때문에 끊기지 않는다.
 *
 * **코인 이동 자체도 새로 만들지 않는다** — 싣기는 CoinGroundStack.transferOneTo()로 플레이어가
 * 직접 주울 때와 완전히 같은 경로(팝 → 자석 추적 → 등 뒤 슬롯)를 타고, 내리기는 등 뒤 스택에서
 * 하나 빼서 CoinPool.spawn()으로 목적지 무더기를 향해 날린다. 그래서 손맛이 항상 같다.
 */
@ccclass('CoinCourier')
export class CoinCourier extends Component {
    @property({ displayName: '적재 용량(개)', tooltip: '한 번에 등에 싣고 갈 코인 개수. 이만큼 채우면 목적지로 출발한다. 출발 무더기의 코인이 이보다 적으면 있는 만큼만 싣고 출발한다' })
    capacity: number = 10;

    @property({ displayName: '싣는 간격(초)', tooltip: '출발 무더기에서 코인을 한 개씩 등으로 빨아들이는 주기. 작을수록 우르르 빨려온다' })
    pickupInterval: number = 0.05;

    @property({ displayName: '내리는 간격(초)', tooltip: '목적지 무더기에 코인을 한 개씩 내려놓는 주기' })
    depositInterval: number = 0.05;

    @property({ displayName: '도착 판정 거리(m)', tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다' })
    arriveDist: number = 0.6;

    @property({ displayName: '내릴 때 자석 반경(m)', tooltip: '내려놓는 코인이 목적지 무더기로 곧장 날아가도록 충분히 크게 둔다 (플레이어 회수와 같은 방식)' })
    depositMagnetRadius: number = 999;

    // ── 나무를 베는 일꾼(벌목 모드)에서만 쓰는 값 ─────────────────────────────
    @property({ type: CCFloat, displayName: '나무 도착 판정 거리(m)', tooltip: '벌목 모드에서 나무 앞 이 거리까지 다가가면 멈춰 선다. 나무 메시 반지름보다는 커야 나무에 파고들지 않고, Player의 "벌목 사거리"보다는 작아야 멈춘 자리에서 도끼질이 닿는다' })
    treeArriveDist: number = 1.2;

    @property({ type: CCFloat, displayName: '나무 탐색 반경(m)', tooltip: '벌목 모드에서 벨 나무를 찾는 최대 거리. 맵 전체를 뒤지게 하려면 크게 둔다' })
    treeSearchRadius: number = 999;

    // ── 스폰 시점에 CoinCourierManager가 주입하는 참조들 (프리팹은 씬 노드를 담을 수 없다) ──
    /** 코인을 퍼올 출발 무더기 (자기 섹터의 coin_ground). 벌목 모드에서는 null이어도 된다 */
    sourceStack: CoinGroundStack | null = null;
    /** true면 출발지가 무더기가 아니라 "가장 가까운 나무"다 — 타이쿤 씬의 벌목 일꾼.
     * 기본 false라 기존 씬(코인 운반 일꾼)의 동작은 그대로다. */
    harvestFromTrees: boolean = false;
    /** 코인을 내려놓을 목적지 무더기 (기지 앞 coin_ground) */
    destStack: CoinGroundStack | null = null;
    /** 내려놓을 때 코인을 날리기 위해 쓰는 풀 — 씬의 CoinPool 하나를 모두가 공유한다 */
    coinPool: CoinPool | null = null;

    // ── 타이쿤 일꾼용 스위치 (CoinCourierManager가 노선 설정에서 주입한다) ──────────
    /**
     * true(기본)면 캔 자원이 **등 뒤에 실제로 쌓인다** — 기존 씬의 코인 운반자가 그렇다.
     * false면 자원이 일꾼에게 날아와 **그대로 사라지고 개수만 센다**. 타이쿤 일꾼이 이쪽이다:
     * 등에 쌓아 올리면 10개만 돼도 캐릭터보다 짐이 커 보이고, 일꾼이 수십 명이면 그 코인
     * 노드 수만큼 비용이 곱해진다. 세는 값(`_claimed`)은 두 경우 모두 똑같이 동작한다.
     */
    carryVisually: boolean = true;

    /**
     * 이 트리거가 발화하기 전까지는 **내려놓을 곳이 없다** — 캐기는 하되 창고로 가지 않고
     * 그 자리에서 짐을 진 채 서 있는다(Holding). 창고가 서기 전의 상태를 그대로 표현한 것이다.
     * None(기본)이면 처음부터 내려놓는다(기존 씬의 동작).
     */
    absorbTriggerId: TriggerId = TriggerId.None;

    /** 짐을 지고 갈 때만 보여줄 달구지 노드의 이름. 비우면 달구지를 건드리지 않는다. */
    wagonNodeName: string = '';

    /** 달구지를 끄는 걸음으로 바꿀 때 켜는 애니메이션 그래프 변수 이름. 비우면 클립을
     * 바꾸지 않는다(메시만 켜고 끈다). 그래프에 같은 이름의 불리언 변수가 있어야 한다. */
    wagonAnimVar: string = '';

    /** 등에 안 싣는 모드에서 자원을 내려놓을 때, 일꾼 발밑보다 이만큼 위에서 출발시킨다 —
     * 바닥에서 솟아나는 것처럼 보이지 않게 하려는 값이다. */
    unloadSpawnHeight: number = 0.8;

    /**
     * 광산 입구 노드. **이것이 지정되면 이 일꾼은 나무를 베지 않고 광산을 드나든다** —
     * 입구까지 걸어가 사라졌다가, 체류 시간이 지나면 다시 나타나 창고로 간다.
     *
     * 벌목과 같은 코드로 만들지 않은 이유: 벌목은 "대상을 찾아가 때린다"라서 대상이 씬에
     * 흩어져 있고 사라지기도 하지만, 채굴은 **고정된 한 지점에 들어갔다 나온다**라 찾을 대상도
     * 때릴 대상도 없다. 같은 상태 기계에 욱여넣으면 `_targetTree`가 null인 채로 도는 분기가
     * 곳곳에 생긴다.
     */
    mineNode: Node | null = null;

    /** 광산 안에 머무는 시간(초). 이 시간이 채굴 속도를 결정한다. */
    mineDuration: number = 4;

    /** 한 번 들어갔다 나올 때 캐 오는 개수. 0 이하면 적재 용량을 그대로 쓴다. */
    mineYield: number = 0;

    private _player: Player | null = null;
    private _back: CoinStack | null = null;
    private _state = CourierState.ToSource;
    private _timer = 0;
    /** 출발 무더기에서 빼왔지만 아직 목적지에 내리지 않은 개수 — **날아오는 중인 코인까지 포함**한다.
     * 등 뒤 스택의 count는 코인이 실제로 "도착"해야 올라가므로, 그것만 보고 용량을 판단하면
     * 날아오는 중인 코인을 세지 못해 용량을 초과해 퍼오게 된다. */
    private _claimed = 0;
    /** 벌목 모드에서 지금 베러 가는(베고 있는) 나무 */
    private _targetTree: Node | null = null;
    /** 지금 캔 자원을 가져갈 수 있는 상태인지. absorbTriggerId가 None이면 처음부터 true. */
    private _absorbEnabled = true;
    /** 짐을 지고 갈 때 켤 달구지 노드와 그 렌더러들. 이름이 비어 있으면 둘 다 빈 채로 둔다. */
    private _wagonRenderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    /** 광산에 들어가 있는 동안 숨길 몸 전체의 렌더러. 광산 모드가 아니면 비어 있다. */
    private _bodyRenderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    /** 광산 안에서 흐른 시간(초). */
    private _mineTimer = 0;
    /** 창고까지 돌아갈 때 순서대로 거쳐 갈 지점들. 매니저가 노선의 "경로 노드" 자식에서
     * 읽어 넣어준다. **비어 있으면 예전처럼 목적지로 직선 이동한다**(기존 씬 무영향). */
    private _path: Node[] = [];
    /** 지금 몇 번째 경로 점까지 지났는지. 상태가 바뀔 때마다 0으로 되돌린다. */
    private _pathIdx = 0;
    /** 걸음 클립을 갈아끼우기 위한 애니메이션 컨트롤러. 없으면(그래프가 없는 프리팹) null. */
    private _anim: animation.AnimationController | null = null;

    /** 내가 벤 자원만 센다. 실제 타격은 Player가 하므로(도끼질 애니메이션까지 그쪽 경로),
     * 몇 개가 나왔는지는 이 이벤트로만 알 수 있다. 등 뒤 스택의 count를 쓰지 않는 이유는
     * 기존 _claimed와 같다 — 아직 날아오는 중인 자원을 세지 못해 용량을 넘겨 퍼오게 된다. */
    private _onDropped = (_pos: Vec3, count: number, source: Node | null) => {
        if (source !== this.node) return;
        // 창고가 아직 없어도 **일꾼이 자기가 들고 있는다**(사용자 확정 2026-09-18). 그래서
        // 여기서 걸러내지 않는다 — 못 하는 것은 "가져가기"가 아니라 "내려놓기"이고,
        // 그 판정은 상태 전환(_deliverOrHold) 한 곳에서만 한다.
        this._claimed += count;
    };

    /** 노선에 지정된 경로 점을 받아 둔다 — 스폰 직후 매니저가 한 번만 부른다.
     * 배열을 `@property`로 두지 않은 이유는 경로가 **일꾼이 아니라 노선의 성질**이기 때문이고,
     * 배열 프로퍼티는 이 프로젝트에서 MCP로 쓸 수 없어 씬 편집이 번거롭기 때문이다. */
    setPath(points: Node[]) {
        this._path = points;
        this._pathIdx = 0;
    }

    /** 캔 자원을 지금 가져갈 수 있는가. `CoinSpawnController`가 이 값을 보고 자원을 일꾼에게
     * 보낼지 바닥에 떨어뜨릴지 정한다.
     * **항상 참이다** — 창고가 없어도 일꾼은 자기가 들고 있기 때문이다. 게터를 남겨둔 이유는
     * 호출부가 여럿이고, 나중에 "이 일꾼은 못 줍는다"는 조건이 다시 생길 수 있어서다. */
    get canAbsorb(): boolean { return true; }

    /**
     * 🔴 여기서는 **인스펙터 값에 기대는 초기화를 하지 않는다.** 이 컴포넌트는 씬에 배치되는
     * 것이 아니라 `CoinCourierManager`가 프리팹을 instantiate 해서 값을 주입해 만든다. 그런데
     * 엔진은 노드가 활성 계층에 들어가는 순간(`addChild`) `onLoad`를 **그 자리에서** 부르므로,
     * 매니저가 값을 다 넣기 **전에** 이 함수가 먼저 돈다 — 즉 여기서 `absorbTriggerId`나
     * `mineNode`를 읽으면 프리팹 기본값(전부 비어 있음)을 읽는다.
     * 실제로 그 때문에 **창고를 짓기 전인데도 일꾼이 자원을 내려놓았고**(트리거가 None으로
     * 보였다), 광산 일꾼의 몸이 안 사라졌고, 달구지도 안 나왔다. 전부 같은 원인이다.
     * → 값을 읽어야 하는 초기화는 전부 `start()`로 옮겼다. 엔진이 `onLoad` → (매니저의 값 주입)
     *   → 다음 프레임 `start()` 순서를 보장하므로 그때는 값이 들어와 있다.
     */
    onLoad() {
        CoinEvents.on(CoinEventName.ResourceDropped, this._onDropped);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.ResourceDropped, this._onDropped);
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId !== this.absorbTriggerId) return;
        this._absorbEnabled = true;
    }

    /** 달구지 노드는 프리팹 안에 꺼진 채로 들어 있다 — 이름으로 찾아 렌더러만 모아둔다.
     * 노드 자체를 껐다 켜지 않는 이유는 BuildingTrigger와 같다(꺼진 노드는 스스로 못 켜진다는
     * 문제는 없지만, 뼈대에 붙은 노드를 껐다 켜면 스켈레톤 바인딩이 흔들릴 수 있다). */
    private _collectWagon() {
        if (!this.wagonNodeName) return;
        const found = this._findByName(this.node, this.wagonNodeName);
        if (!found) return;
        this._wagonRenderers = [
            ...found.getComponentsInChildren(MeshRenderer),
            ...found.getComponentsInChildren(SkinnedMeshRenderer),
        ];
    }

    private _findByName(root: Node, name: string): Node | null {
        if (root.name === name) return root;
        for (const c of root.children) {
            const f = this._findByName(c, name);
            if (f) return f;
        }
        return null;
    }

    private _setWagonVisible(v: boolean) {
        for (const r of this._wagonRenderers) r.enabled = v;
    }

    /** 시작 상태를 한 번 "통과"시켜 전투(도끼질) 스위치를 상태와 맞춰 둔다. 필드 초기값으로
     * 들어간 ToSource는 _setState를 거치지 않아서, 이게 없으면 첫 왕복만 도끼질이 꺼진 채
     * 출발한다(두 번째 왕복부터는 켜져서 동작이 달라 보인다). 매니저가 주입하는
     * harvestFromTrees는 addComponent 직후에 대입되므로 start() 시점엔 이미 들어와 있다. */
    start() {
        this._player = this.getComponent(Player);
        this._back = this.getComponent(CoinStack);

        if (this.absorbTriggerId !== TriggerId.None) {
            this._absorbEnabled = false;
            CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        }
        this._anim = this.getComponent(animation.AnimationController);
        this._collectWagon();
        this._setWagonVisible(false);
        // 광산 모드일 때만 몸 렌더러를 모아둔다 — 쓰지 않을 때 목록을 들고 있으면 다른
        // 일꾼에서 실수로 몸을 끌 여지가 생긴다.
        if (this.mineNode) {
            this._bodyRenderers = [
                ...this.getComponentsInChildren(MeshRenderer),
                ...this.getComponentsInChildren(SkinnedMeshRenderer),
            ];
        }

        this._setState(this._state);
    }

    update(dt: number) {
        if (!this._player || !this._back || !this.destStack) return;
        if (!this.harvestFromTrees && !this.mineNode && !this.sourceStack) return;

        switch (this._state) {
            case CourierState.InMine:
                this._tickMining(dt);
                break;

            case CourierState.ToSource: {
                // 광산 일꾼은 찾을 대상이 없다 — 입구 한 곳만 보고 간다.
                if (this.mineNode) {
                    // 돌아갈 때는 같은 길을 거꾸로 — 벌목 일꾼은 갈 곳이 매번 달라 경로가 없다.
                    if (this._moveVia(true, this.mineNode, this.arriveDist)) this._setState(CourierState.InMine);
                    break;
                }
                const src = this.harvestFromTrees ? this._acquireTree() : this.sourceStack!.node;
                // 벨 나무가 하나도 없으면 제자리에서 기다린다 — 나무가 다시 자라는 순간
                // 다음 프레임부터 저절로 다시 일하러 간다(무더기가 비었을 때와 같은 태도).
                if (!src) { this._stand(); break; }
                const dist = this.harvestFromTrees ? this.treeArriveDist : this.arriveDist;
                if (this._moveTo(src, dist)) this._setState(CourierState.Loading);
                break;
            }

            case CourierState.Loading:
                this._stand();
                if (this.harvestFromTrees) this._tickHarvest();
                else this._tickLoading(dt);
                break;

            case CourierState.ToDest:
                if (this._moveVia(false, this.destStack.node, this.arriveDist)) this._setState(CourierState.Unloading);
                break;

            case CourierState.Unloading:
                this._stand();
                this._tickUnloading(dt);
                break;

            case CourierState.Holding:
                // 짐을 진 채 대기. 창고가 서는 순간(트리거) 그대로 출발한다.
                this._stand();
                if (this._absorbEnabled) this._setState(CourierState.ToDest);
                break;
        }
    }

    /** 짐을 다 실었을 때 갈 곳. 내려놓을 데가 아직 없으면(창고 미건설) 그 자리에서 들고 선다.
     * **판정을 이 한 곳에만 두는 이유**는 출발 조건이 벌목·채굴·무더기 퍼담기 세 경로에
     * 흩어져 있어서다 — 한 군데라도 빠뜨리면 없는 창고로 걸어가 영영 못 내려놓는다. */
    private _deliverOrHold(): CourierState {
        return this._absorbEnabled ? CourierState.ToDest : CourierState.Holding;
    }

    /** 상태 전환은 반드시 여기를 거친다 — 벌목 일꾼은 상태에 따라 전투(=도끼질) 스위치를
     * 켜고 꺼야 하기 때문이다. 창고로 가는 길에도 켜져 있으면 지나가다 만나는 나무를 계속
     * 때리느라 짐을 내리러 가지 못한다. */
    private _setState(next: CourierState) {
        this._state = next;
        this._timer = 0;
        this._pathIdx = 0;   // 새 구간은 경로의 처음부터 다시 센다
        if (!this._player) return;
        this._player.combatEnabled = this.harvestFromTrees
            && (next === CourierState.ToSource || next === CourierState.Loading);
        // 달구지는 **짐을 지고 갈 때만** 보인다 — 빈 손으로 나무를 베러 갈 때까지 끌고 다니면
        // "가득 차서 옮기는 중"이라는 신호가 사라진다.
        const hauling = next === CourierState.ToDest || next === CourierState.Unloading
                     || next === CourierState.Holding;
        this._setWagonVisible(hauling);
        // 걸음 클립도 함께 바꾼다. 그래프에 변수가 없으면 엔진이 경고를 내므로 이름을
        // 지정한 경우에만 건드린다 — 달구지를 쓰지 않는 씬은 이 값이 비어 있다.
        if (this.wagonAnimVar && this._anim) this._anim.setValue(this.wagonAnimVar, hauling);
        // 광산에 들어간 동안에만 몸이 사라진다. 노드를 끄지 않고 렌더러만 끄는 이유는
        // 이 컴포넌트의 update가 계속 돌아야 체류 시간을 셀 수 있기 때문이다.
        if (this._bodyRenderers.length > 0) {
            this._setBodyVisible(next !== CourierState.InMine);
        }
        if (next === CourierState.InMine) {
            this._mineTimer = 0;
            this._stand();   // 입구에서 멈춰 선다 — 들어간 동안 걷기 애니메이션이 돌면 안 된다
        }
    }

    /** 광산 안에서 체류 시간을 센다. 다 되면 정해진 만큼을 캐 온 것으로 치고 창고로 출발한다.
     * 실제 자원 노드를 만들지 않는 이유는 지상에서도 마찬가지다 — 일꾼은 개수만 세고,
     * 눈에 보이는 자원은 창고에 내려놓는 순간에 만들어진다. */
    private _tickMining(dt: number) {
        this._mineTimer += dt;
        if (this._mineTimer < this.mineDuration) return;
        this._mineTimer = 0;
        this._claimed = this.mineYield > 0 ? this.mineYield : this.capacity;
        this._setState(this._deliverOrHold());
    }

    private _setBodyVisible(v: boolean) {
        for (const r of this._bodyRenderers) r.enabled = v;
        // 달구지는 자기 규칙(짐 운반 중에만)을 따르므로 여기서 다시 켜지 않는다.
        if (!v) this._setWagonVisible(false);
    }

    /** 지금 베러 갈 나무. 들고 있던 목표가 아직 살아 있으면 그대로 쓰고, 아니면 가장 가까운
     * 것을 새로 잡는다. 한 그루도 없으면 null. */
    private _acquireTree(): Node | null {
        const t = this._targetTree;
        const c = t?.isValid ? t.getComponent(Choppable) : null;
        if (c && !c.isDying) return t;
        this._targetTree = Choppable.findNearestNode(this.node.worldPosition, this.treeSearchRadius);
        return this._targetTree;
    }

    /**
     * 나무 앞에 서서 다 벨 때까지 기다린다.
     *
     * **타격과 도끼질 애니메이션은 여기서 하지 않는다** — `_setState`가 켜 둔
     * `Player.combatEnabled` 덕분에 Player.update()가 사거리 안의 나무를 잡아
     * 회전·상체 애니메이션·공격 주기까지 평소 전투와 똑같은 경로로 처리한다. 그래서 이
     * 함수는 "언제 창고로 출발할지"만 판단한다(캔 개수는 _onDropped가 센다).
     */
    private _tickHarvest() {
        if (this._claimed >= this.capacity) { this._setState(this._deliverOrHold()); return; }

        const t = this._targetTree;
        const c = t?.isValid ? t.getComponent(Choppable) : null;
        if (c && !c.isDying) return;   // 아직 베는 중

        // 나무가 넘어갔다 — 등에 뭐라도 있으면 창고로, 아니면 다음 나무를 찾으러 간다.
        this._targetTree = null;
        // 내려놓을 곳이 아직 없으면 **가득 찰 때까지 계속 벤다** — 반쯤 실은 채로 설 이유가
        // 없다(위의 가득 참 판정이 그때 Holding으로 보낸다).
        this._setState(this._claimed > 0 && this._absorbEnabled ? CourierState.ToDest : CourierState.ToSource);
    }

    /** 출발 무더기 옆에서 등에 싣는다. 용량을 채우면 출발하고, 무더기가 비었는데 실은 것이
     * 있으면 있는 만큼만 들고 출발한다. 둘 다 아니면(무더기가 비었고 실은 것도 없으면) 아무
     * 일도 하지 않고 여기서 계속 대기한다 — 타워가 몬스터를 잡아 코인이 새로 생기는 순간
     * 다음 프레임부터 저절로 다시 싣기 시작한다. */
    private _tickLoading(dt: number) {
        if (this._claimed >= this.capacity) {
            this._setState(this._deliverOrHold());
            return;
        }

        this._timer += dt;
        if (this._timer < this.pickupInterval) return;
        this._timer = 0;

        if (this.sourceStack!.transferOneTo(this.node, this._back)) {
            this._claimed++;
            if (this._claimed >= this.capacity) this._setState(this._deliverOrHold());
            return;
        }

        // 무더기가 비었다 — 조금이라도 실었으면 그것만 들고 출발, 아니면 계속 대기.
        if (this._claimed > 0) this._setState(this._deliverOrHold());
    }

    /** 목적지에서 등 뒤 스택을 하나씩 비운다. 아직 날아오는 중인 코인이 있으면(_claimed가
     * 남아 있는데 등에는 아직 없는 상태) 그것이 도착할 때까지 여기서 기다린다 — 그래야 퍼온
     * 코인을 한 개도 잃지 않는다. */
    private _tickUnloading(dt: number) {
        if (this._claimed <= 0) {
            this._setState(CourierState.ToSource);
            return;
        }

        this._timer += dt;
        if (this._timer < this.depositInterval) return;
        this._timer = 0;

        const pos = new Vec3();
        if (this.carryVisually) {
            const coin = this._back!.popTop();
            if (!coin) return; // 아직 날아오는 중 — 도착을 기다린다
            Vec3.copy(pos, coin.worldPosition);
            coin.destroy();
        } else {
            // 등에 실제로 쌓인 것이 없으므로 뺄 노드도 없다 — 일꾼 몸에서 바로 꺼내는 것처럼
            // 발밑보다 살짝 위에서 출발시킨다. 여기서 `_back`을 보면 영원히 기다리게 된다.
            const w = this.node.worldPosition;
            pos.set(w.x, w.y + this.unloadSpawnHeight, w.z);
        }
        this._claimed--;

        // **자원 종류를 반드시 넘긴다.** 안 넘기면 기본값(코인)으로 떨어져서, 나무를 캐 온
        // 일꾼이 창고에 코인을 쌓는다(개수는 맞지만 종류와 메시가 코인이 된다). 목적지가
        // 받는 종류를 그대로 쓰는 것이 맞다 — 일꾼은 "그 무더기가 받는 것"을 옮기는 것이다.
        this.coinPool?.spawn(pos, this.destStack!.node, this.depositMagnetRadius, this.destStack, true,
                             false, this.destStack!.acceptedType);

        if (this._claimed <= 0) this._setState(CourierState.ToSource);
    }

    /** 목표 노드 쪽으로 걷게 한다. 도착했으면 true. 좌표 변환은 FollowerMovement와 동일
     * (Player.ts 조이스틱 좌표계: worldX = joyX, worldZ = -joyY). */
    /**
     * 경로 점을 순서대로 지난 뒤 목적지에 닿았는지. `reverse`면 역순으로 지난다 —
     * 창고→광산은 광산→창고의 정확한 반대 길이어야 일꾼이 같은 길로 오간다.
     * **경로가 비어 있으면 그냥 목적지로 직선 이동한다.**
     * 지점 통과 판정에 목적지와 같은 `도착 판정 거리`를 쓰는 이유는, 별도 값을 두면 둘 중
     * 하나만 조절해 "지점은 지났는데 목적지 앞에서 맴도는" 상태가 생기기 때문이다.
     */
    private _moveVia(reverse: boolean, target: Node, arriveDist: number): boolean {
        while (this._pathIdx < this._path.length) {
            const idx = reverse ? this._path.length - 1 - this._pathIdx : this._pathIdx;
            const p = this._path[idx];
            // 사라졌거나 꺼진 지점은 건너뛴다 — 경로 점 하나를 지웠다고 일꾼이 멈추면 안 된다.
            if (!p || !p.isValid || !p.activeInHierarchy) { this._pathIdx++; continue; }
            if (!this._moveTo(p, arriveDist)) return false;
            this._pathIdx++;
        }
        return this._moveTo(target, arriveDist);
    }

    private _moveTo(target: Node, arriveDist: number): boolean {
        const p = this.node.worldPosition;
        const t = target.worldPosition;
        const dx = t.x - p.x;
        const dz = t.z - p.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= arriveDist) {
            this._stand();
            return true;
        }

        const inv = 1 / dist;
        this._player!.moveDirOverride = new Vec2(dx * inv, -dz * inv);
        return false;
    }

    private _stand() {
        this._player!.moveDirOverride = Vec2.ZERO;
    }
}
