import { _decorator, Component, Label } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinStack } from './CoinStack';
const { ccclass, property } = _decorator;

/**
 * 화면 상단의 "보유 코인 개수" 표시. CoinStack.StackChanged를 구독해 등에 쌓인 코인
 * 개수를 그대로 보여준다 — 코인을 얻으면(등에 추가) 늘고, 소켓이 소비하면(등에서 제거) 준다.
 */
@ccclass('CoinCounterUI')
export class CoinCounterUI extends Component {
    @property(Label) countLabel: Label | null = null;
    @property(CoinStack) coinStack: CoinStack | null = null;

    /** 등 뒤 스택은 플레이어만 갖는 것이 아니다 — 코인 운반자 추종자(CoinCourier)도 같은
     * CoinStack 컴포넌트를 등에 달고 다닌다. StackChanged는 전역으로 emit되므로 발신 스택이
     * 내가 표시하기로 한 그 스택인지 반드시 확인해야 한다(Coin.ts의 coin.stack 확인과 같은
     * 규약). 확인 없이 갱신하면 운반자가 코인을 싣고 내릴 때마다 화면의 플레이어 보유
     * 개수가 운반자의 개수로 튄다. coinStack이 비어있으면 예전처럼 전부 받아들인다. */
    private _onStackChanged = (count: number, stack?: CoinStack) => {
        if (this.coinStack && stack && stack !== this.coinStack) return;
        this._refresh(count);
    };

    onLoad() {
        CoinEvents.on(CoinEventName.StackChanged, this._onStackChanged, this);
    }

    start() {
        if (this.coinStack) this._refresh(this.coinStack.count);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.StackChanged, this._onStackChanged, this);
    }

    private _refresh(count: number) {
        if (this.countLabel) this.countLabel.string = `${count}`;
    }
}
