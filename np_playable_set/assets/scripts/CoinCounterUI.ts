import { _decorator, Component, Label } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinStack } from './CoinStack';
import { ResourceType } from './ResourceType';
const { ccclass, property } = _decorator;

/**
 * 화면 상단의 "보유 코인 개수" 표시. CoinStack.StackChanged를 구독해 등에 쌓인 코인
 * 개수를 그대로 보여준다 — 코인을 얻으면(등에 추가) 늘고, 소켓이 소비하면(등에서 제거) 준다.
 */
@ccclass('CoinCounterUI')
export class CoinCounterUI extends Component {
    @property(Label) countLabel: Label | null = null;
    @property(CoinStack) coinStack: CoinStack | null = null;

    @property({ displayName: '자원 종류로 거르기', tooltip: '끄면 자원 종류를 가리지 않고 **전부 합친 개수**를 보여준다(예전 동작). 자원이 여러 종류인 씬에서 나무/철/코인 칸을 따로 두려면 켜고 아래에서 종류를 고른다' })
    filterByResource: boolean = false;

    @property({ type: ResourceType, displayName: '표시할 자원', visible(this: CoinCounterUI) { return this.filterByResource; } })
    resourceType: ResourceType = ResourceType.Coin;

    /** 등 뒤 스택은 플레이어만 갖는 것이 아니다 — 코인 운반자 추종자(CoinCourier)도 같은
     * CoinStack 컴포넌트를 등에 달고 다닌다. StackChanged는 전역으로 emit되므로 발신 스택이
     * 내가 표시하기로 한 그 스택인지 반드시 확인해야 한다(Coin.ts의 coin.stack 확인과 같은
     * 규약). 확인 없이 갱신하면 운반자가 코인을 싣고 내릴 때마다 화면의 플레이어 보유
     * 개수가 운반자의 개수로 튄다. coinStack이 비어있으면 예전처럼 전부 받아들인다. */
    private _onStackChanged = (count: number, stack?: CoinStack) => {
        if (this.coinStack && stack && stack !== this.coinStack) return;
        // 종류별 표시는 합계(count)가 아니라 그 종류의 개수를 다시 물어봐야 한다.
        // 이벤트는 어느 종류가 바뀌었든 날아오므로 여기서 매번 현재값을 읽는다.
        this._refresh(this._value(stack ?? this.coinStack));
    };

    /** 지금 보여줘야 하는 숫자 */
    private _value(stack: CoinStack | null | undefined): number {
        if (!stack) return 0;
        return this.filterByResource ? stack.countOf(this.resourceType) : stack.count;
    }

    onLoad() {
        CoinEvents.on(CoinEventName.StackChanged, this._onStackChanged, this);
    }

    start() {
        if (this.coinStack) this._refresh(this._value(this.coinStack));
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.StackChanged, this._onStackChanged, this);
    }

    private _refresh(count: number) {
        if (this.countLabel) this.countLabel.string = `${count}`;
    }
}
