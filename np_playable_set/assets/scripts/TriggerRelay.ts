import { _decorator, CCFloat, Component } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * **"이 트리거들이 모두 발화하면 저 트리거를 쏜다."**
 *
 * 진행이 한 줄로만 흐르지 않는 지점을 위한 것이다. 씬 3의 마지막이 그렇다 — 레일 해금 소켓
 * 두 개는 **순서 없이** 각각 채워지고, 둘 다 채워졌을 때 비로소 게임이 끝난다. 두 소켓 중
 * 어느 쪽에도 "끝내라"를 달 수 없다(자기 혼자로는 끝이 아니기 때문이다).
 *
 * `BuildingTrigger`가 이미 AND 조건을 갖고 있지만 그쪽은 **건물을 세우는** 컴포넌트다. 여기는
 * 아무것도 세우지 않고 **신호만 이어준다** — 받는 쪽이 건물인지, 연출인지, 종료 처리인지
 * 모르는 채로 둔다. 그래야 엔딩 처리를 나중에 무엇으로 바꾸든 이 부품을 안 고친다.
 *
 * 설정되지 않으면 무동작이다 — 쏠 트리거가 None이면 이벤트를 구독조차 하지 않는다.
 */
@ccclass('TriggerRelay')
export class TriggerRelay extends Component {
    @property({ type: TriggerId, displayName: '기다릴 트리거 A', tooltip: '이 트리거가 발화해야 한다. None이면 조건에서 빠진다 — A와 B를 모두 None으로 두면 아무 일도 일어나지 않는다' })
    waitA: TriggerId = TriggerId.None;

    @property({ type: TriggerId, displayName: '기다릴 트리거 B', tooltip: '함께 발화해야 하는 두 번째 트리거. 순서는 상관없다 — 어느 쪽이 먼저 와도 기억해두고 나머지를 기다린다. None이면 A 하나만으로 발화한다(단순 중계기가 된다)' })
    waitB: TriggerId = TriggerId.None;

    @property({ type: TriggerId, displayName: '기다릴 트리거 C', tooltip: '세 번째. 필요 없으면 None으로 둔다. 넷 이상이 필요해지면 이 컴포넌트를 여러 개 이어 붙이는 편이 낫다 — 중간 트리거 하나를 두고 A+B → X, X+C → Y 식으로 잇는다' })
    waitC: TriggerId = TriggerId.None;

    @property({ type: TriggerId, displayName: '쏠 트리거', tooltip: '조건이 전부 맞는 순간 발화할 트리거. None(기본)이면 이 컴포넌트는 아무 일도 하지 않는다. 씬 3에서는 레일 소켓 두 개(5·6)를 기다렸다가 GameClear(103)를 쏜다' })
    emitTrigger: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '발화 지연(초)', tooltip: '조건이 맞은 뒤 이만큼 기다렸다가 쏜다. 마지막 소켓이 채워지는 연출이 끝나기 전에 종료 화면이 덮어버리지 않도록 여유를 주는 값이다. 0이면 즉시' })
    delay: number = 0;

    /** 지금까지 발화한 것 중 내가 기다리는 트리거들. 순서가 정해져 있지 않으므로 기억해야 한다. */
    private _fired = new Set<TriggerId>();
    private _done = false;

    onLoad() {
        if (this.emitTrigger === TriggerId.None) return;
        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._done) return;
        this._fired.add(triggerId);

        // None인 칸은 조건에서 빠진다 — 그래야 "A 하나만" 같은 구성이 특별 취급 없이 성립한다.
        if (this.waitA !== TriggerId.None && !this._fired.has(this.waitA)) return;
        if (this.waitB !== TriggerId.None && !this._fired.has(this.waitB)) return;
        if (this.waitC !== TriggerId.None && !this._fired.has(this.waitC)) return;
        // 기다릴 것을 하나도 안 적어두면 아무 트리거에나 반응해버린다 — 그건 설정 실수이므로
        // 무동작으로 둔다(매니저는 설정된 만큼만 동작한다).
        if (this.waitA === TriggerId.None && this.waitB === TriggerId.None && this.waitC === TriggerId.None) return;

        this._done = true;
        if (this.delay > 0) this.scheduleOnce(() => this._emit(), this.delay);
        else this._emit();
    }

    private _emit() {
        CoinEvents.emit(CoinEventName.SocketFilled, this.emitTrigger);
    }
}
