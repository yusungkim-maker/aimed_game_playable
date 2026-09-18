import { _decorator, CCFloat, Component, MeshRenderer, Node, SkinnedMeshRenderer, Vec3, tween } from 'cc';
import { CoinCourierManager } from './CoinCourierManager';
import { SocketGauge } from './SocketGauge';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * **플레이어가 서 있으면 시간이 차서 일꾼이 한 명씩 나오는 소켓.**
 *
 * 기존 `Socket`과는 **발동 조건 자체가 다르다** — 그쪽은 "자원을 N개 채우면 1회 보상"이고
 * 이쪽은 "서 있는 시간"이다. 그래서 `Socket.repeatable`에 불리언을 하나 더 얹지 않고 별도
 * 컴포넌트로 뒀다(불리언 플래그를 덧붙이면 발동 조건 분기가 두 겹으로 얽힌다).
 *
 * **일꾼을 직접 만들지 않는다.** `CoinCourierManager.spawnFor(트리거 ID)`에 요청만 한다 —
 * 일꾼의 외형·속도·등장 이펙트·운반 설정이 전부 그 매니저 한 곳에 있어서, 여기서 따로
 * 만들면 같은 설정을 두 군데서 관리하게 된다. 매니저가 false를 돌려주면(상한에 걸렸거나
 * 노선이 아직 안 열렸거나) **게이지를 가득 찬 채로 멈춰 둔다** — 0으로 되돌리면 플레이어는
 * 자기가 뭘 잘못한 줄 알지만, 가득 찬 채 멈춰 있으면 "여긴 더 못 뽑는다"로 읽힌다.
 *
 * 설정되지 않으면 무동작이다 — 매니저나 트리거 ID가 비어 있으면 아무 일도 하지 않는다.
 */
@ccclass('SpawnerSocket')
export class SpawnerSocket extends Component {
    @property({ type: CoinCourierManager, displayName: '일꾼 매니저', tooltip: '일꾼을 실제로 만들 CoinCourierManager. 비워두면 이 소켓은 아무 일도 하지 않는다. 씬의 Systems 아래에 있는 것을 연결한다' })
    courierManager: CoinCourierManager | null = null;

    @property({ type: TriggerId, displayName: '늘릴 노선의 트리거 ID', tooltip: 'CoinCourierManager의 "운반 노선 목록"에서 같은 트리거 ID를 가진 노선에 일꾼을 한 명씩 더한다. 그 노선의 "생산 소켓으로만 늘리기"를 켜두면 트리거 순간에는 아무도 안 나오고 여기서만 늘어난다. 노선의 "동시 상한"이 이 소켓의 최대 인원이 된다 — 상한을 여기가 아니라 노선에 둔 이유는 같은 노선을 여러 소켓이 공유해도 한 상한을 함께 쓰게 하기 위해서다' })
    routeTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '배출 주기(초)', tooltip: '플레이어가 서 있을 때 일꾼 한 명이 나오기까지 걸리는 시간. 짧을수록 빨리 늘지만 일꾼은 매 프레임 돌아가는 개체라 수가 곧 프레임 비용이 된다 — 상한(노선 쪽)과 함께 조절한다' })
    spawnInterval: number = 3;

    @property({ type: CCFloat, displayName: '발동 반경(m)', tooltip: '플레이어가 이 거리 안에 있는 동안 게이지가 찬다. 너무 크면 지나가기만 해도 일꾼이 나와서 "서 있어야 한다"는 규칙이 흐려진다' })
    radius: number = 1.5;

    @property({ displayName: '자리를 비우면 진행도 유지', tooltip: '체크(기본)하면 플레이어가 떠나도 차오른 만큼이 남아 있어, 다시 와서 이어서 채울 수 있다. 끄면 떠나는 순간 0으로 돌아가 한 번에 끝까지 서 있어야 한다 — 더 빡빡하지만 플레이어가 이유를 모른 채 손해 보기 쉽다' })
    keepProgressOnLeave: boolean = true;

    @property({ type: TriggerId, displayName: '등장 트리거', tooltip: '이 트리거가 발화할 때까지 이 소켓을 숨겨두고 아무 동작도 하지 않는다. None(기본)이면 처음부터 서 있다. 씬 3에서 나무 일꾼 소켓은 WorkerLodge 건설(1), 철 일꾼 소켓은 광산 가동(3) 트리거를 쓴다' })
    appearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '등장 확대 시간(초)', tooltip: '숨어 있던 소켓이 나타날 때 스케일 0에서 원래 크기까지 커지는 시간. 0이면 즉시 나타난다' })
    appearScaleDuration: number = 0.3;

    @property({ type: Node, displayName: '플레이어 노드', tooltip: '서 있는지 판정할 대상. 비워두면 이 소켓은 동작하지 않는다 — 물리 엔진을 쓰지 않으므로 거리로 직접 판정한다' })
    playerNode: Node | null = null;

    /** 차오른 시간(초). 게이지는 이 값 / 배출 주기다. */
    private _timer = 0;
    /** 상한에 걸려 더 못 뽑는 상태 — 게이지를 가득 찬 채로 멈춰 두기 위한 표시. */
    private _blocked = false;
    private _gauge: SocketGauge | null = null;
    private _renderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    /** 등장 트리거를 기다리는 중인지. 기다리는 동안에는 update가 즉시 빠져나간다. */
    private _hidden = false;
    private _baseScale = new Vec3(1, 1, 1);

    onLoad() {
        this._gauge = this.getComponentInChildren(SocketGauge);
        this._renderers = [
            ...this.getComponentsInChildren(MeshRenderer),
            ...this.getComponentsInChildren(SkinnedMeshRenderer),
        ];
        this._baseScale = this.node.scale.clone();

        if (this.appearTriggerId !== TriggerId.None) {
            this._hidden = true;
            // node.active를 끄지 않는 이유는 BuildingTrigger와 같다 — 꺼진 노드는 스스로
            // 다시 켜질 수 없어서 이벤트를 받을 컴포넌트가 돌지 않는다. 렌더러만 끈다.
            this._setVisible(false);
            CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        }
        this._refreshGauge();
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (!this._hidden) return;
        if (triggerId !== this.appearTriggerId) return;
        this._hidden = false;
        this._setVisible(true);
        if (this.appearScaleDuration > 0) {
            this.node.setScale(0, 0, 0);
            tween(this.node).to(this.appearScaleDuration, { scale: this._baseScale.clone() }).start();
        }
    }

    private _setVisible(v: boolean) {
        for (const r of this._renderers) r.enabled = v;
    }

    update(dt: number) {
        if (this._hidden) return;
        if (!this.courierManager || this.routeTriggerId === TriggerId.None) return;
        if (!this.playerNode || !this.playerNode.isValid) return;
        if (this.spawnInterval <= 0) return;

        const near = Vec3.distance(this.node.worldPosition, this.playerNode.worldPosition) <= this.radius;
        if (!near) {
            if (!this.keepProgressOnLeave && this._timer !== 0) {
                this._timer = 0;
                this._blocked = false;
                this._refreshGauge();
            }
            return;
        }

        // 상한에 걸린 뒤에도 매 프레임 매니저에 물어본다 — 일꾼이 사라져 자리가 나면
        // 플레이어가 다시 서지 않아도 바로 이어서 뽑히는 것이 자연스럽다.
        if (this._blocked) {
            if (this.courierManager.spawnFor(this.routeTriggerId)) {
                this._blocked = false;
                this._timer = 0;
                this._refreshGauge();
            }
            return;
        }

        this._timer += dt;
        if (this._timer < this.spawnInterval) { this._refreshGauge(); return; }

        if (this.courierManager.spawnFor(this.routeTriggerId)) {
            // 주기를 빼기만 한다(0으로 잘라내지 않는다) — 프레임이 튀어 한 번에 두 주기가
            // 지나갔을 때 그 몫이 사라지지 않게 하려는 것이다.
            this._timer -= this.spawnInterval;
        } else {
            // 못 뽑았다 = 상한이거나 노선이 아직 안 열렸다. 게이지를 가득 찬 채로 멈춘다.
            this._timer = this.spawnInterval;
            this._blocked = true;
        }
        this._refreshGauge();
    }

    private _refreshGauge() {
        this._gauge?.setProgress(this.spawnInterval > 0 ? this._timer / this.spawnInterval : 0);
    }
}
