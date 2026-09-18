import { _decorator, Component, Texture2D } from 'cc';
import { TextureCard } from './TextureCard';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * **트리거가 오면 2D 카드의 그림을 갈아끼운다.** 건물이 "상태가 바뀌는" 것을 표현하는 가장
 * 싼 방법이다 — 씬 3의 광산이 가동 전/후로 그림만 달라지는 경우가 이것이다.
 *
 * 건물을 **하나 더 두고 하나를 끄는** 방식을 쓰지 않은 이유: 카드는 텍스처만 다르고 메시·
 * 위치·크기가 완전히 같다. 노드를 둘로 두면 위치를 고칠 때마다 두 군데를 맞춰야 하고, 둘 다
 * 빌드에 들어가며, `ScatterExclude` 같은 딸린 설정도 두 벌이 된다.
 *
 * `TextureCard`의 `그림자`/`오브젝트` 두 슬롯을 각각 갈아끼울 수 있다 — 상태가 바뀌면 보통
 * 그림자 모양도 함께 바뀌기 때문이다. 한쪽만 지정하면 그쪽만 바뀐다.
 *
 * 설정되지 않으면 무동작이다 — 트리거가 None이거나 바꿀 텍스처가 둘 다 비어 있으면 아무 일도
 * 하지 않는다.
 */
@ccclass('CardTextureSwap')
export class CardTextureSwap extends Component {
    @property({ type: TextureCard, displayName: '대상 카드', tooltip: '그림을 갈아끼울 TextureCard. 비워두면 이 노드와 그 자식에서 자동으로 찾는다 — 건물 노드에 붙였다면 비워둬도 된다' })
    card: TextureCard | null = null;

    @property({ type: TriggerId, displayName: '교체 트리거', tooltip: '이 트리거가 발화하는 순간 그림이 바뀐다. None(기본)이면 아무 일도 하지 않는다. 씬 3의 광산은 가동 트리거(3)를 쓴다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ type: Texture2D, displayName: '바꿀 그림자', tooltip: 'TextureCard의 첫 번째 슬롯(바닥에 깔리는 그림자 판)에 넣을 새 이미지. 비워두면 그림자는 그대로 둔다' })
    newShadow: Texture2D | null = null;

    @property({ type: Texture2D, displayName: '바꿀 오브젝트', tooltip: 'TextureCard의 두 번째 슬롯(세워진 건물 그림)에 넣을 새 이미지. 비워두면 오브젝트는 그대로 둔다' })
    newBody: Texture2D | null = null;

    private _done = false;

    onLoad() {
        if (!this.card) this.card = this.getComponent(TextureCard) ?? this.getComponentInChildren(TextureCard);
        if (this.triggerId === TriggerId.None) return;
        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._done) return;
        if (triggerId !== this.triggerId) return;
        if (!this.card) return;
        this._done = true;
        // 세터를 거쳐야 머티리얼 인스턴스에 실제로 꽂히고 크기 계산도 다시 돈다.
        // 필드(_texture)에 직접 넣으면 값만 바뀌고 화면은 그대로다.
        if (this.newShadow) this.card.texture = this.newShadow;
        if (this.newBody) this.card.texture2 = this.newBody;
    }
}
