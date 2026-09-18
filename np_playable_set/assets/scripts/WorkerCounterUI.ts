import { _decorator, CCFloat, Component, Label, Node } from 'cc';
import { CoinCourierManager } from './CoinCourierManager';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * "일꾼 3/10" 표시. 고용소(SpawnerSocket)가 뽑아내는 일꾼이 지금 몇 명이고 몇 명까지
 * 뽑을 수 있는지를 2D UI 라벨에 그린다.
 *
 * 왜 SpawnerSocket이 직접 그리지 않는가: 소켓은 3D 월드의 오브젝트이고 이 표시는 2D UI다.
 * 소켓이 Label을 들고 있으면 UI를 쓰지 않는 씬에서도 그 참조가 따라다닌다. 그래서 화면 쪽
 * 컴포넌트가 매니저에게 숫자만 물어보는 방향으로 뒤집었다 — 다른 광고에서 UI 배치가 달라져도
 * 이 컴포넌트만 옮기면 된다.
 *
 * 폴링하는 이유: 일꾼은 뽑히기도 하고 사라지기도 하는데 그 모든 경로가 이벤트를 내지는 않는다.
 * 세는 비용은 일꾼 수에 비례하지만 이 컴포넌트는 화면에 한두 개뿐이라 개체 수만큼 곱해지는
 * 자리가 아니다. 그래도 매 프레임 세지 않도록 갱신 주기를 둔다.
 */
@ccclass('WorkerCounterUI')
export class WorkerCounterUI extends Component {
    @property({ type: Label, displayName: '표시할 라벨', tooltip: '"3/10" 형태의 글자가 들어갈 Label. 비워두면 이 컴포넌트는 아무 일도 하지 않는다' })
    countLabel: Label | null = null;

    @property({ type: CoinCourierManager, displayName: '일꾼 매니저', tooltip: '인원을 물어볼 CoinCourierManager. 씬의 Systems 아래에 있는 것을 연결한다. 비워두면 아무 일도 하지 않는다' })
    courierManager: CoinCourierManager | null = null;

    @property({ type: TriggerId, displayName: '셀 노선의 트리거 ID', tooltip: '이 트리거를 가진 노선의 일꾼만 센다 — 나무 일꾼 고용소와 철 일꾼 고용소가 각각 자기 노선을 센다. 같은 트리거를 여러 노선이 공유하면 합쳐서 보여준다' })
    routeTriggerId: TriggerId = TriggerId.None;

    @property({ type: Node, displayName: '함께 숨길 뿌리 노드', tooltip: '아래 "등장 트리거"가 오기 전까지 통째로 끌 노드. 보통 이 라벨을 감싼 카운터 묶음(배경 + 아이콘 + 글자)을 넣는다. 비워두면 이 컴포넌트가 붙은 노드를 끈다' })
    hideRoot: Node | null = null;

    @property({ type: TriggerId, displayName: '등장 트리거', tooltip: '이 트리거가 발화할 때까지 표시를 숨긴다 — 고용소가 생기기도 전에 "0/10"이 떠 있으면 안 되기 때문이다. None(기본)이면 처음부터 보인다' })
    appearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '갱신 주기(초)', tooltip: '숫자를 다시 세는 주기. 0이면 매 프레임 센다. 0.2초면 사람 눈에는 즉시로 보이고, 그 사이에 일꾼이 늘어도 다음 갱신에 반영된다' })
    refreshInterval: number = 0.2;

    private _timer = 0;
    private _hidden = false;
    private _last = '';

    onLoad() {
        if (this.appearTriggerId !== TriggerId.None) {
            this._hidden = true;
            CoinEvents.on(CoinEventName.SocketFilled, this._onAppear, this);
        }
    }

    /**
     * 🔴 **끄는 일은 `onLoad`가 아니라 여기서 한다.** `onLoad`는 엔진이 씬 트리를 활성화하는
     * 도중에 불리는데, 그때 노드를 끄면 활성화 절차가 어긋나 아직 초기화가 끝나지 않은
     * 렌더러가 나중에 터진다(2026-09-18에 실제로 당했다). `start()`는 활성화가 다 끝난 뒤다.
     * 꺼진 노드가 스스로 다시 켜질 수 있는 이유는 리스너가 엔진 생명주기가 아니라 CoinEvents에
     * 걸려 있어서다.
     */
    start() {
        if (this._hidden) this._root().active = false;
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onAppear, this);
    }

    private _root(): Node {
        return this.hideRoot ?? this.node;
    }

    private _onAppear(triggerId: TriggerId) {
        if (triggerId !== this.appearTriggerId) return;
        this._hidden = false;
        this._root().active = true;
        this._timer = this.refreshInterval;   // 켜지는 즉시 한 번 그린다
    }

    update(dt: number) {
        if (!this.countLabel || !this.courierManager) return;
        if (this.routeTriggerId === TriggerId.None) return;

        this._timer += dt;
        if (this._timer < this.refreshInterval) return;
        this._timer = 0;

        const { live, max } = this.courierManager.countFor(this.routeTriggerId);
        // 상한이 없으면 분모를 빼고 숫자만 보여준다 — "3/0"은 뜻이 통하지 않는다.
        const text = max > 0 ? `${live}/${max}` : `${live}`;
        if (text === this._last) return;
        this._last = text;
        this.countLabel.string = text;
    }
}
