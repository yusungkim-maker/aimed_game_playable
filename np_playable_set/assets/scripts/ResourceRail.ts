import { _decorator, CCFloat, Component, Node, Vec3, instantiate } from 'cc';
import { RushPath } from './RushPath';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/** 레일 위를 흐르고 있는 자원 하나. */
interface RailItem {
    node: Node;
    /** 지금 향하고 있는 경로 점의 번호. */
    leg: number;
    /** 그 구간에서 지나온 거리(m). */
    travelled: number;
}

/**
 * **한 무더기에서 다른 무더기로 자원을 저절로 옮기는 레일.**
 *
 * 경로는 새로 만들지 않고 **몬스터 러쉬 경로와 같은 `RushPath`를 그대로 쓴다.** 그래서 레일
 * 모양을 잡는 방법이 몬스터 경로를 잡는 방법과 완전히 같다 — 자식으로 `Anchor0`, `Anchor1`…
 * 노드를 두고 씬 뷰에서 끌면 되고, 곡선 미리보기도 그대로 나온다. 경로 편집기를 하나 더
 * 만들었다면 사용자가 두 가지 방식을 외워야 했을 것이다.
 *
 * **한 컴포넌트는 한 종류만 옮긴다.** 창고 → 대장간처럼 두 자원을 같은 길로 보내야 하면
 * **같은 노드에 이 컴포넌트를 두 개 붙이고** 둘 다 같은 경로를 가리키면 된다(나무용 하나,
 * 철용 하나). 목록 프로퍼티로 만들지 않은 이유는 배열이 MCP로 편집되지 않아 자동화가 막히고,
 * 자원마다 주기를 다르게 주고 싶어질 때 목록 쪽이 오히려 더 복잡해지기 때문이다.
 *
 * 옮기는 자원의 **종류는 도착 무더기가 정한다** — 그 무더기가 받는 것을 보내는 것이 맞고,
 * 종류를 따로 적게 하면 두 군데가 어긋난다.
 *
 * 설정되지 않으면 무동작이다 — 경로·출발·도착 중 하나라도 비어 있으면 아무 일도 하지 않는다.
 */
@ccclass('ResourceRail')
export class ResourceRail extends Component {
    @property({ type: RushPath, displayName: '경로', tooltip: '자원이 따라갈 길. 몬스터 러쉬 경로와 같은 RushPath다 — 자식에 Anchor0, Anchor1… 노드를 두고 씬 뷰에서 끌어 모양을 잡는다. 첫 앵커가 출발, 마지막 앵커가 도착 쪽이다. 비워두면 이 노드에 붙은 것을 자동으로 찾는다' })
    path: RushPath | null = null;

    @property({ type: CoinGroundStack, displayName: '출발 무더기', tooltip: '자원을 꺼내올 곳. 여기가 비면 레일도 멈춰 선다(에러가 아니라 대기다 — 다시 쌓이면 저절로 재개된다)' })
    source: CoinGroundStack | null = null;

    @property({ type: CoinGroundStack, displayName: '도착 무더기', tooltip: '자원을 내려놓을 곳. **이 무더기가 받는 자원이 곧 이 레일이 옮기는 종류다** — 출발 무더기가 다른 종류를 담고 있으면 아무것도 옮기지 않는다' })
    dest: CoinGroundStack | null = null;

    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '레일 위에 띄울 자원의 모양을 가져오고, 도착 시 무더기에 넣을 때 쓴다 — 씬의 CoinSystem에 있는 것과 같은 것을 연결한다' })
    coinPool: CoinPool | null = null;

    @property({ type: CCFloat, displayName: '출발 간격(초)', tooltip: '자원 하나가 레일에 올라가는 주기. 짧을수록 촘촘히 흐르지만 동시에 떠 있는 개수가 늘어 그만큼 비용이 된다. 아래 "동시 최대 개수"와 함께 조절한다' })
    departInterval: number = 0.8;

    @property({ type: CCFloat, displayName: '이동 속도(m/s)', tooltip: '레일 위를 흐르는 속도. 경로 길이를 이 값으로 나눈 만큼이 한 개가 건너가는 시간이다' })
    speed: number = 3;

    @property({ type: CCFloat, displayName: '띄우는 높이(m)', tooltip: '자원이 바닥에서 이만큼 떠서 흐른다. 0이면 땅에 끌리는 것처럼 보이고, 너무 높으면 공중을 나는 것처럼 보인다' })
    height: number = 0.45;

    @property({ type: CCFloat, displayName: '자전 속도(도/초)', tooltip: '흐르는 동안 자원이 제자리에서 도는 속도. 0이면 돌지 않는다 — 통나무처럼 긴 물건은 0에 가깝게 두는 편이 자연스럽다' })
    spinSpeed: number = 90;

    @property({ type: CCFloat, displayName: '동시 최대 개수', tooltip: '레일 위에 동시에 떠 있을 수 있는 개수의 상한. 도착 쪽이 느려 밀릴 때 무한정 쌓이는 것을 막는다. 0이면 무제한(권장하지 않음)' })
    maxInFlight: number = 12;

    @property({ type: TriggerId, displayName: '해금 트리거', tooltip: '이 트리거가 발화할 때까지 레일이 돌지 않는다. None(기본)이면 처음부터 돈다. 씬 3에서는 레일 해금 소켓의 트리거(창고→대장간 5, 대장간→상점 6)를 넣는다' })
    unlockTriggerId: TriggerId = TriggerId.None;

    private _unlocked = false;
    private _timer = 0;
    private _items: RailItem[] = [];
    /** 경로 점 목록. 앵커를 옮기면 바로 반영되도록 매번 새로 받지 않고, 출발시킬 때만 갱신한다
     * — 흐르는 중에 길이 바뀌면 이미 떠 있는 것들이 순간이동하기 때문이다. */
    private _pts: Vec3[] = [];

    onLoad() {
        if (!this.path) this.path = this.getComponent(RushPath);
        this._unlocked = this.unlockTriggerId === TriggerId.None;
        if (!this._unlocked) CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
        for (const it of this._items) if (it.node?.isValid) it.node.destroy();
        this._items.length = 0;
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId === this.unlockTriggerId) this._unlocked = true;
    }

    update(dt: number) {
        if (!this._unlocked) return;
        if (!this.path || !this.source || !this.dest || !this.coinPool) return;

        this._moveItems(dt);
        this._tryDepart(dt);
    }

    private _tryDepart(dt: number) {
        this._timer += dt;
        if (this._timer < this.departInterval) return;
        if (this.maxInFlight > 0 && this._items.length >= this.maxInFlight) return;

        // 경로가 아직 안 잡혔으면(앵커 0~1개) 아무것도 보내지 않는다.
        const pts = this.path!.waypoints;
        if (pts.length < 2) return;

        // 출발 무더기에서 실제로 하나 덜어낸다. 비었으면 타이머를 그대로 두고 기다린다 —
        // 여기서 리셋하면 자원이 생긴 뒤에도 한 주기를 더 기다리게 된다.
        const from = this.source!.takeOne();
        if (!from) return;
        this._timer = 0;
        this._pts = pts;

        const type = this.dest!.acceptedType;
        const prefab = this.coinPool!.prefabFor(type);
        if (!prefab) return;   // 이 자원의 모양이 없으면 옮기지 않는다(무동작 원칙)

        const node = instantiate(prefab);
        const parent = this.node.scene ?? this.node.parent!;
        parent.addChild(node);
        node.setWorldPosition(pts[0].x, pts[0].y + this.height, pts[0].z);
        this._items.push({ node, leg: 1, travelled: 0 });
    }

    /** 떠 있는 것들을 경로를 따라 전진시킨다. 마지막 점에 닿으면 도착 무더기로 넘긴다. */
    private _moveItems(dt: number) {
        if (this._pts.length < 2) return;
        const step = this.speed * dt;
        const spin = this.spinSpeed * dt;

        for (let i = this._items.length - 1; i >= 0; i--) {
            const it = this._items[i];
            if (!it.node || !it.node.isValid) { this._items.splice(i, 1); continue; }
            if (spin !== 0) {
                const e = it.node.eulerAngles;
                it.node.setRotationFromEuler(e.x, e.y + spin, e.z);
            }

            let remain = step;
            while (remain > 0 && it.leg < this._pts.length) {
                const a = this._pts[it.leg - 1];
                const b = this._pts[it.leg];
                const segLen = Math.hypot(b.x - a.x, b.z - a.z);
                const left = segLen - it.travelled;
                if (remain < left) { it.travelled += remain; remain = 0; break; }
                // 이 구간을 다 지났다 — 남은 거리를 들고 다음 구간으로 넘어간다.
                remain -= left;
                it.travelled = 0;
                it.leg++;
            }

            if (it.leg >= this._pts.length) { this._arrive(it); this._items.splice(i, 1); continue; }

            const a = this._pts[it.leg - 1];
            const b = this._pts[it.leg];
            const segLen = Math.max(0.0001, Math.hypot(b.x - a.x, b.z - a.z));
            const t = it.travelled / segLen;
            it.node.setWorldPosition(
                a.x + (b.x - a.x) * t,
                a.y + (b.y - a.y) * t + this.height,
                a.z + (b.z - a.z) * t,
            );
        }
    }

    /** 끝점 도착 — 흐르던 노드를 지우고, 무더기에 쌓이는 것은 평소의 스폰 경로로 넘긴다.
     * 그래야 쌓이는 모습이 일꾼이 내려놓을 때와 완전히 같다. */
    private _arrive(it: RailItem) {
        const pos = it.node.worldPosition.clone();
        it.node.destroy();
        this.coinPool!.spawn(pos, this.dest!.node, 999, this.dest!, false, false, this.dest!.acceptedType);
    }
}
