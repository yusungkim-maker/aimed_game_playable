import { _decorator, CCFloat, Component, MeshRenderer, Node, SkinnedMeshRenderer, Vec3, Prefab, instantiate, tween } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinStack, CoinStackTarget } from './CoinStack';
import { CoinPool } from './CoinPool';
import type { Coin } from './Coin';
import { ResourceType } from './ResourceType';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * 타워가 처치한 몬스터의 코인이 쌓이는 바닥 무더기 (coin_ground 계열 노드에 붙는다).
 * 캐릭터 등 뒤 CoinStack과 같은 방식(reserveSlot/getSlotWorldPosition)으로 동작하지만,
 * 한 줄이 아니라 2x2 격자로 배치된 4개 열에 번갈아 나눠 쌓는다 — CoinSpawnController가
 * 어느 타워가 죽였는지에 따라 이 컴포넌트 중 하나로 코인을 보낸다.
 *
 * 열마다 최대 높이(maxPerLane)를 둬서 전체 비주얼 오브젝트 개수를 무한히 늘리지 않는다
 * (렉 방지, 기본 4열 x 100 = 400개) — 상한을 넘어 도착하는 코인은 비주얼 없이 _overflowCount로만
 * 세어둔다(그래도 개수 자체는 잃지 않고, 플레이어가 접근하면 나머지와 함께 전부 돌려받는다).
 *
 * 플레이어가 반경 안에 들어오면 쌓여있던 코인이 다시 하나씩 등 뒤 스택(CoinStack)으로
 * 날아간다 — 새 비행 로직을 만들지 않고, 몬스터를 잡았을 때와 완전히 같은 CoinPool.spawn()
 * 경로(팝 → 자석 추적)를 재사용한다.
 */
@ccclass('CoinGroundStack')
export class CoinGroundStack extends Component implements CoinStackTarget {
    @property({ type: TriggerId, displayName: '등장 트리거 (건물)', tooltip: '이 트리거가 발화할 때까지 이 무더기를 **통째로 끈다** — 보이지도 않고 받지도 돌려주지도 않는다. 아직 지어지지 않은 건물 앞에 적재 자리만 먼저 떠 있으면 안 되기 때문이다. None(기본)이면 처음부터 서 있다(기존 씬은 이 항목이 비어 있으므로 영향 없음). 창고의 나무·철 칸, 상점의 칼·코인 칸, 대장간의 재료·완성품 칸에 각각 그 건물의 건설 트리거를 넣는다' })
    appearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '등장 확대 시간(초)', tooltip: '꺼져 있던 무더기가 켜질 때 스케일 0에서 원래 크기까지 커지는 시간. 0이면 즉시 나타난다. "등장 트리거"가 None이면 쓰이지 않는다' })
    appearScaleDuration: number = 0.25;

    @property({ type: ResourceType, displayName: '받는 자원', tooltip: '이 무더기가 담는 자원의 종류. 창고의 나무 칸/철 칸, 대장간의 재료 칸, 상점의 돈 칸을 이 값으로 구분한다. 플레이어에게 돌려보낼 때도 이 종류로 돌아간다 — 기본값이 코인이라 자원이 한 종류뿐인 씬은 예전과 똑같이 동작한다' })
    acceptedType: ResourceType = ResourceType.Coin;

    @property({ type: Prefab, displayName: '스택 코인 프리팹', tooltip: '쌓일 때 보여줄 정적 코인 비주얼 (CoinStack과 동일한 프리팹을 써도 됨)' })
    stackCoinPrefab: Prefab | null = null;

    @property({ displayName: '격자 간격(m)', tooltip: '2x2로 배치되는 네 열 사이의 가로/세로 간격' })
    laneSpacing: number = 0.4;

    @property({ displayName: '코인 간 간격(m)', tooltip: '한 열 안에서 위로 쌓는 간격' })
    stackSpacing: number = 0.08;

    @property({ displayName: '열당 최대 코인 수', tooltip: '**화면에 보여줄 개수의 상한**이다 — 4개 열이 있으므로 실제로 보이는 최대 개수는 이 값의 4배(기본 100 x 4 = 400). 이 수를 넘겨 도착한 자원은 노드를 만들지 않고 **숫자로만 세어 보관**하므로 개수는 하나도 잃지 않는다(플레이어나 운반자가 가져갈 때 전부 돌아온다). 상한을 두는 이유는 무더기가 커질수록 드로우콜이 그만큼 늘어 모바일에서 바로 렉이 되기 때문이다' })
    maxPerLane: number = 100;

    @property({ displayName: '착지 Y(m)', tooltip: '코인 두께 때문에 바닥(y=0)에 파묻히지 않도록 살짝 띄운 높이 — 첫 번째 층 기준' })
    baseY: number = 0.07;

    @property({ displayName: '스택 코인 회전(Euler)', tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 눕혀 쌓으려면 X를 -90으로' })
    stackRotation: Vec3 = new Vec3(-90, 0, 0);

    // ── 플레이어에게 되돌려주기 ──────────────────────────────────────────
    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '플레이어에게 돌려보낼 때 사용 — CoinSpawnController가 쓰는 것과 같은 CoinPool을 연결' })
    coinPool: CoinPool | null = null;

    @property({ type: Node, displayName: '플레이어 노드', tooltip: '이 노드가 흡수 반경 안에 들어오면 쌓여있던 코인이 하나씩 등 뒤로 돌아가기 시작한다' })
    playerNode: Node | null = null;

    @property({ displayName: '흡수 반경(m)' })
    radius: number = 2;

    @property({ displayName: '플레이어에게 돌려주기', tooltip: '체크(기본)하면 플레이어가 흡수 반경 안에 들어오면 쌓여 있던 것이 하나씩 등 뒤로 돌아간다 — 지금까지의 동작이다. **끄면 플레이어가 가져갈 수 없다**: 플레이어가 "가져다 놓는" 자리(상점의 칼 무더기)는 꺼야 한다. 켜둔 채로 두면 놓는 순간 다시 빨려 들어가 아무것도 쌓이지 않는다' })
    giveToPlayer: boolean = true;

    @property({ displayName: '플레이어에게서 받기', tooltip: '켜면 플레이어가 흡수 반경 안에 있는 동안 등에 진 자원(위 "받는 자원"과 같은 종류만)을 하나씩 이 무더기에 내려놓는다. 끄면(기본) 플레이어는 여기에 놓을 수 없고 일꾼이나 다른 시스템만 채운다 — 창고처럼 "일꾼이 채우고 플레이어가 가져가는" 무더기는 꺼둔다. 위 "돌려주기"와 **둘 다 켜면 놓자마자 되가져오는 무한 왕복**이 되므로 보통 한쪽만 켠다' })
    acceptFromPlayer: boolean = false;

    @property({ displayName: '코인 반환 간격(초)', tooltip: '플레이어가 반경 안에 있는 동안 코인을 한 개씩 등 뒤로 돌려보내는 주기' })
    transferInterval: number = 0.05;

    @property({ displayName: '반환 시 자석 반경(m)', tooltip: '플레이어에게 돌아가는 코인은 팝 애니메이션이 끝나는 즉시 이 반경 안에 있는 것으로 간주해 곧장 등 뒤로 날아간다 — 사실상 항상 즉시 흡수되도록 충분히 크게 둔다' })
    transferMagnetRadius: number = 999;

    private _stack: Node[] = [];
    private _reservedCount = 0;
    private _overflowCount = 0; // 비주얼 상한을 넘어 도착해 노드로 표현되지 못한 개수 — 그래도 반환 시 함께 돌려받는다
    /** 등장 트리거를 쓸 때, 꺼두기 전의 원래 크기 — 확대 연출의 도착점이다. */
    private _baseScale = new Vec3(1, 1, 1);
    /** 등장 트리거를 기다리는 중인지. 기다리는 동안에는 보이지도, 주고받지도 않는다. */
    private _hidden = false;
    private _renderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];

    private _laneOffsets: Vec3[] = [];
    private _playerStack: CoinStack | null = null;
    private _transferTimer = 0;
    /** "플레이어에게서 받기"의 주기 타이머 — 돌려주기와 서로 간섭하지 않게 따로 둔다. */
    private _depositTimer = 0;
    /** 지금 수거 중인지 — 수거 시작 알림(GroundStackCollectStarted)을 한 번만 보내기 위한 상태 */
    private _collecting = false;
    private _onCoinCollected = (coin: Coin) => { if (coin.stack === this) this._addOne(); };

    onLoad() {
        const d = this.laneSpacing / 2;
        this._laneOffsets = [
            new Vec3(-d, 0, -d),
            new Vec3(d, 0, -d),
            new Vec3(-d, 0, d),
            new Vec3(d, 0, d),
        ];
        if (this.playerNode) this._playerStack = this.playerNode.getComponent(CoinStack);
        CoinEvents.on(CoinEventName.CoinCollected, this._onCoinCollected);

        if (this.appearTriggerId !== TriggerId.None) {
            this._hidden = true;
            CoinEvents.on(CoinEventName.SocketFilled, this._onAppearTrigger, this);
        }
    }

    /**
     * 🔴 **숨기는 일을 `onLoad`가 아니라 여기서 한다.**
     * `onLoad`는 엔진이 씬 트리를 걸어 내려가며 각 노드를 활성화하는 **도중**에 불린다. 그때
     * 노드나 렌더러를 끄면 그 활성화 절차가 중간에 어긋나, 아직 초기화가 끝나지 않은
     * `MeshRenderer`가 나중에 켜질 때 `_materials`가 null인 채로 `onLoad`를 타서
     * `Cannot read properties of null (reading 'length')`로 터진다(2026-09-18에 실제로 당했다 —
     * 대장간 건설 순간과 씬을 여는 순간 양쪽에서 났다). `start()`는 씬의 모든 활성화가 끝난
     * 뒤에 불리므로 안전하다.
     */
    start() {
        if (!this._hidden) return;
        this._baseScale = this.node.scale.clone();
        this._renderers = [
            ...this.getComponentsInChildren(MeshRenderer),
            ...this.getComponentsInChildren(SkinnedMeshRenderer),
        ];
        this._setVisible(false);
    }

    /** 숨어 있는 동안에는 **받지도 돌려주지도 않는다** — 아직 지어지지 않은 건물 앞의 적재
     *  자리가 동작하면 안 되기 때문이다. `node.active`를 끄지 않으므로 이 플래그가 그 역할을 한다. */
    get isHidden(): boolean { return this._hidden; }

    private _setVisible(v: boolean) {
        for (const r of this._renderers) if (r && r.isValid) r.enabled = v;
    }

    private _onAppearTrigger(triggerId: TriggerId) {
        if (triggerId !== this.appearTriggerId) return;
        if (!this._hidden) return;
        this._hidden = false;
        this._setVisible(true);
        if (this.appearScaleDuration > 0) {
            this.node.setScale(0, 0, 0);
            tween(this.node).to(this.appearScaleDuration, { scale: this._baseScale.clone() }).start();
        }
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.CoinCollected, this._onCoinCollected);
        CoinEvents.off(CoinEventName.SocketFilled, this._onAppearTrigger, this);
    }

    update(dt: number) {
        if (this._hidden) return;
        if (!this.playerNode || !this.coinPool) return;

        const near = Vec3.distance(this.node.worldPosition, this.playerNode.worldPosition) <= this.radius;

        // 플레이어가 "가져다 놓는" 무더기 — 등에 진 것을 하나씩 내려놓는다. 돌려주기와 달리
        // 무더기가 비어 있어도 동작해야 하므로(첫 개를 놓는 순간이 그렇다) 아래 조기 return보다
        // 먼저 처리한다.
        if (this.acceptFromPlayer && near) {
            this._depositTimer += dt;
            if (this._depositTimer >= this.transferInterval) {
                this._depositTimer = 0;
                this._takeOneFromPlayer();
            }
        }

        if (!this.giveToPlayer) return;
        if (this._stack.length === 0 && this._overflowCount === 0) { this._collecting = false; return; }
        if (!near) {
            this._collecting = false;
            return;
        }

        // 수거가 "시작되는" 순간에만 한 번 알린다 — 코인이 하나씩 날아가는 내내 매 프레임
        // 울리면 안 되므로, 반경을 벗어났다 다시 들어올 때까지 다시 emit하지 않는다.
        if (!this._collecting) {
            this._collecting = true;
            CoinEvents.emit(
                CoinEventName.GroundStackCollectStarted,
                this._stack.length + this._overflowCount,
            );
        }

        this._transferTimer += dt;
        if (this._transferTimer < this.transferInterval) return;
        this._transferTimer = 0;
        // 플레이어 회수도 운반자 회수와 완전히 같은 경로를 쓴다 — 배출 구현이 하나만 존재하도록.
        this.transferOneTo(this.playerNode, this._playerStack);
    }

    /** 지금 이 무더기가 들고 있는 코인 개수(비주얼 상한을 넘겨 숫자로만 세어둔 초과분 포함).
     * 운반자(CoinCourier)가 "가져갈 것이 남았는지" 판단하는 데 쓴다. */
    get storedCount(): number {
        return this._stack.length + this._overflowCount;
    }

    /** 자석에 걸린 코인이 collecting을 시작할 때 호출 — 다음 빈 슬롯 인덱스를 예약해 돌려준다.
     * 인덱스 % 4가 열, 인덱스 / 4가 그 열에서의 층(높이)이 된다. */
    reserveSlot(): number {
        if (this._hidden) return -1;   // 아직 안 지어진 적재 자리는 아무것도 받지 않는다
        return this._reservedCount++;
    }

    /** 예약된 슬롯의 현재 월드 좌표. 열당 최대 층수를 넘는 인덱스는 마지막 층 자리로 클램프된다
     * (그 코인은 그 자리로 날아와 도착만 하고, 비주얼은 추가되지 않음 — _addOne 참고). */
    getSlotWorldPosition(index: number, out: Vec3): Vec3 {
        const lane = index % 4;
        const height = Math.min(Math.floor(index / 4), this.maxPerLane - 1);
        const off = this._laneOffsets[lane];
        out.set(off.x, this.baseY + height * this.stackSpacing, off.z);
        return Vec3.transformMat4(out, out, this.node.worldMatrix);
    }

    private _addOne() {
        const index = this._stack.length;
        if (Math.floor(index / 4) >= this.maxPerLane) {
            this._overflowCount++; // 화면에는 안 보이지만 개수 자체는 잃지 않는다
            return;
        }
        if (!this.stackCoinPrefab) return;

        const node = instantiate(this.stackCoinPrefab);
        // coin_ground 자신이 레벨 배치상 스케일/회전이 걸려있을 수 있어(예: 0.5배 축소, 45도
        // 회전), 이 노드의 자식으로 붙이면 코인이 그 변형을 그대로 물려받아 작아지거나
        // 비뚤어져 보인다 — 씬 루트에 붙이고 월드 좌표/스케일을 직접 지정해 원본 크기 그대로
        // 눕혀 쌓는다 (getSlotWorldPosition과 동일한 계산을 그대로 재사용).
        const parent = this.node.scene ?? this.node.parent!;
        parent.addChild(node);
        const pos = new Vec3();
        this.getSlotWorldPosition(index, pos);
        node.setWorldPosition(pos);
        node.setWorldScale(1, 1, 1);
        node.setRotationFromEuler(this.stackRotation.x, this.stackRotation.y, this.stackRotation.z);
        this._stack.push(node);
    }

    /** 쌓여있던 코인(또는 비주얼 상한을 넘겨 세어만 두었던 초과분) 하나를 지정한 대상에게
     * 보낸다. 몬스터를 잡았을 때와 완전히 같은 CoinPool.spawn() 경로(팝 → 자석 추적)를
     * 그대로 타므로, 새 애니메이션 코드 없이 항상 같은 손맛으로 날아간다.
     *
     * 대상을 인자로 받는 이유: 이 무더기에서 코인을 빼가는 주체가 플레이어 하나가 아니게
     * 되었다(운반자 추종자도 같은 무더기에서 퍼간다). 대상만 다르고 나머지 동작은 완전히
     * 같으므로 구현을 둘로 나누지 않고 여기 하나만 둔다.
     *
     * @returns 실제로 하나 보냈으면 true, 남은 코인이 없거나 대상이 없어 못 보냈으면 false.
     */
    /**
     * 쌓여 있던 것 하나를 **실제로 덜어내고** 그것이 있던 월드 좌표를 돌려준다.
     * 어디로 보낼지는 부르는 쪽이 정한다 — 등 뒤로 날릴 수도(`transferOneTo`), 레일에 실어
     * 보낼 수도 있다. 비어 있으면 null.
     *
     * 화면에 보이던 노드가 없어도(표시 상한을 넘겨 숫자로만 세어둔 초과분) **개수는 줄인다** —
     * 그래야 보이는 것과 실제 보유량이 어긋나지 않는다.
     */
    takeOne(): Vec3 | null {
        if (this._hidden) return null;
        const node = this._stack.pop();
        if (node) {
            const pos = node.worldPosition.clone();
            node.destroy();
            return pos;
        }
        if (this._overflowCount > 0) {
            this._overflowCount--;
            return this.node.worldPosition.clone();
        }
        return null;
    }

    transferOneTo(target: Node | null, stack: CoinStackTarget | null): boolean {
        if (!target || !this.coinPool) return false;

        const pos = this.takeOne();
        if (!pos) return false;
        // fromGround=true — 몬스터가 떨군 코인을 처음 줍는 것과 구분된다(수거음이 따로 있어서
        // 개별 코인 획득음은 내지 않는다).
        this.coinPool.spawn(pos, target, this.transferMagnetRadius, stack, true, false, this.acceptedType);
        return true;
    }

    /** 플레이어 등에서 내가 받는 종류를 하나 빼서 이 무더기로 날려보낸다.
     *
     * 소켓(`Socket`)이 요구치를 채울 때 쓰는 것과 **같은 방식**이다 — 등 뒤 스택에서 실제 노드를
     * 뽑아(`popTop`) 그 노드를 그대로 날린다. 새로 만들어 날리면 등에 있던 것이 사라지지 않아
     * 개수가 두 배로 보인다. */
    private _takeOneFromPlayer(): boolean {
        if (!this.playerNode || !this.coinPool) return false;
        const back = this._playerStack;
        if (!back || back.countOf(this.acceptedType) <= 0) return false;

        const node = back.popTop(this.acceptedType);
        if (!node) return false;
        const pos = node.worldPosition.clone();
        node.destroy();
        // 목적지를 이 무더기로 주고 stack도 나로 주면 CoinCollected가 돌아와 _addOne이 불린다
        // (운반자가 창고에 내려놓는 경로와 완전히 같다).
        this.coinPool.spawn(pos, this.node, this.transferMagnetRadius, this, false, false, this.acceptedType);
        return true;
    }
}
