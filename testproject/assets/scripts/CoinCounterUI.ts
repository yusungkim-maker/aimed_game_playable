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

    private _onStackChanged = (count: number) => this._refresh(count);

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
