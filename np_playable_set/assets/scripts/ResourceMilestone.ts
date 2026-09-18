import { _decorator, CCInteger, Component } from 'cc';
import { CoinStack } from './CoinStack';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { ResourceType } from './ResourceType';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * **"이 자원을 이만큼 처음 모으면 그때 트리거를 하나 쏜다."**
 *
 * 게임 진행이 소켓 충족이 아니라 **자원을 손에 넣은 사실**에서 갈라지는 지점을 위한 것이다.
 * 씬 3에는 그런 지점이 둘 있다 — "철을 처음 먹으면 대장간 소켓이 열린다", "코인을 처음 먹으면
 * 레일 소켓 두 개가 열린다". 둘 다 소켓이 만들어내는 신호가 아니라서 `Socket`으로는 표현할 수 없다.
 *
 * 쏘는 이벤트는 소켓이 쏘는 것과 **똑같은** `CoinEvents.SocketFilled(트리거 ID)`다. 그래서 받는
 * 쪽(`BuildingTrigger` · `SocketManager`의 등장 대기 · `ScatterField`의 사라짐 · `CoinCourier`의
 * 흡수 시작)은 이 신호가 소켓에서 왔는지 여기서 왔는지 알 필요가 없다 — 진행 신호를 한 종류로
 * 유지하는 것이 이 프로젝트가 소켓과 건물을 서로 모르게 유지해 온 방식이다.
 *
 * **한 노드에 여러 개 붙일 수 있다.** 감시할 자원마다 하나씩 붙이면 된다(배열 프로퍼티로 두지
 * 않은 이유는 배열이 MCP로 편집되지 않아 자동화가 막히기 때문이다).
 *
 * 설정되지 않으면 무동작이다 — 트리거 ID가 None이면 아무 일도 하지 않는다.
 */
@ccclass('ResourceMilestone')
export class ResourceMilestone extends Component {
    @property({ type: CoinStack, displayName: '감시할 스택', tooltip: '보통 플레이어의 CoinStack. 비워두면 이 노드에 붙어 있는 CoinStack을 자동으로 쓴다 — 플레이어 노드에 함께 붙였다면 비워둬도 된다' })
    stack: CoinStack | null = null;

    @property({ type: ResourceType, displayName: '감시할 자원', tooltip: '이 자원의 보유 개수를 지켜본다. 씬 3에서는 철(대장간 소켓 개방)과 코인(레일 소켓 개방) 두 가지를 쓴다' })
    resource: ResourceType = ResourceType.Coin;

    @property({ type: CCInteger, displayName: '발화 개수', tooltip: '보유 개수가 이 값 이상이 되는 순간 트리거를 쏜다. 1이면 "처음 하나라도 먹으면"이다. 값을 키우면 "어느 정도 모아야 다음이 열린다"가 된다 — 다만 이건 요구치를 소비하지 않는다(소켓이 아니다). 소비가 필요하면 건설 소켓을 쓴다' })
    threshold: number = 1;

    @property({ type: TriggerId, displayName: '쏠 트리거 ID', tooltip: '조건이 맞는 순간 발화할 트리거. None(기본)이면 아무 일도 하지 않는다. 씬 3에서는 철 = FirstIron(101), 코인 = FirstCoin(102)를 쓴다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ displayName: '한 번만 쏘기', tooltip: '체크(기본)하면 조건이 처음 맞을 때 딱 한 번만 쏘고 그 뒤로는 아무 일도 하지 않는다. 끄면 조건이 맞을 때마다 매번 쏜다 — 받는 쪽 대부분이 이미 "한 번만"으로 막고 있어서 보통은 켜둔 채로 둔다' })
    once: boolean = true;

    private _fired = false;

    onLoad() {
        if (!this.stack) this.stack = this.getComponent(CoinStack);
        if (this.triggerId === TriggerId.None) return;
        CoinEvents.on(CoinEventName.StackChanged, this._onStackChanged, this);
        // 시작 시점에 이미 조건을 만족하고 있을 수 있다(시작 보유 개수를 준 경우).
        // StackChanged는 그 뒤로 변화가 있어야 오므로 여기서 한 번 확인해 둔다.
        this._check();
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.StackChanged, this._onStackChanged, this);
    }

    /** StackChanged의 인자는 (총 개수, 스택, 자원 종류)다. 총 개수는 종류를 가리지 않은 합이라
     * 여기서 쓰지 않고, 스택에게 내가 보는 자원의 개수를 다시 물어본다. */
    private _onStackChanged(_total: number, stack: CoinStack, _type: ResourceType) {
        if (stack !== this.stack) return;
        this._check();
    }

    private _check() {
        if (this._fired && this.once) return;
        if (!this.stack || this.triggerId === TriggerId.None) return;
        if (this.stack.countOf(this.resource) < this.threshold) return;
        this._fired = true;
        CoinEvents.emit(CoinEventName.SocketFilled, this.triggerId);
    }
}
