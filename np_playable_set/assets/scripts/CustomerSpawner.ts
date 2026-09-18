import { _decorator, CCFloat, CCInteger, Component, Node, Prefab, Vec3, instantiate } from 'cc';
import { Customer, CustomerState } from './Customer';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
import { Player } from './Player';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/**
 * 상점 손님의 **줄과 판매를 통째로 관리**한다.
 *
 * 손님 개체(`Customer`)는 "여기로 걸어가라"만 듣는다. 줄 순서, 누가 맨 앞인지, 지금 파는 중인지,
 * 칼이 모자라 기다리는 중인지는 전부 여기 한 곳에만 있다 — 그래야 **"한 번에 한 명만 판매"**
 * 라는 규칙이 한 군데서 지켜지고, 개체끼리 서로를 훑지 않아 인원수의 제곱 비용이 생기지 않는다.
 *
 * **자리 계산**: 줄은 `줄 머리 지점`에서 `등장 지점` 쪽으로 뻗는다. i번째 자리 =
 * 머리 + (등장 쪽 방향) × (i × 간격). 그래서 앞사람이 빠지면 뒤 전원의 자리 번호가 하나씩
 * 줄어들며 자연스럽게 앞으로 당겨진다 — 밀어주는 코드가 따로 없다.
 *
 * **퇴장**: 온 길을 되돌아가되 **줄을 옆으로 비켜서** 나간다(같은 선으로 돌아가면 줄 서 있는
 * 손님들을 뚫고 지나간다). 비켜서는 방향은 줄 방향에 수직이고 항상 같은 쪽이라, 나가는 손님이
 * 한 줄로 흘러 보인다. 끝점(비켜선 등장 지점)에 닿으면 사라진다.
 *
 * 설정되지 않으면 무동작이다 — 프리팹·두 지점 중 하나라도 비어 있으면 아무 일도 하지 않는다.
 */
@ccclass('CustomerSpawner')
export class CustomerSpawner extends Component {
    @property({ type: Prefab, displayName: '손님 프리팹', tooltip: '줄을 설 손님. 비워두면 이 컴포넌트는 아무 일도 하지 않는다. 씬 3은 T_Customer(플레이어 캐릭터에 green_bob을 입힌 것)를 쓴다' })
    customerPrefab: Prefab | null = null;

    @property({ type: Node, displayName: '등장 지점', tooltip: '손님이 걸어 나오는 자리이자, 사고 나서 되돌아가 사라지는 자리. 씬 3은 ground_sub 공간이다. 화면 밖이 아니라 화면 안이어도 되지만, 갑자기 나타나는 티가 나므로 건물 뒤나 화면 가장자리에 두는 편이 자연스럽다' })
    spawnPoint: Node | null = null;

    @property({ type: Node, displayName: '줄 머리 지점', tooltip: '맨 앞 손님이 서는 자리 — 상점 앞. 줄은 여기서 "등장 지점" 쪽으로 뻗는다. 두 지점을 잇는 선이 곧 손님이 오고 가는 길이 된다' })
    queueHead: Node | null = null;

    @property({ type: Node, displayName: '손님이 바라볼 곳', tooltip: '줄에 서서 멈춰 있는 동안 손님이 몸을 돌려 바라볼 대상 — 보통 상점 건물. 비워두면 마지막 걸음 방향을 그대로 유지해서, 줄에 선 손님들이 제각각 다른 쪽을 보고 서 있게 된다. 걷는 동안에는 이 값과 무관하게 가는 방향을 본다' })
    lookAtNode: Node | null = null;

    @property({ type: CCInteger, displayName: '줄 최대 인원', tooltip: '동시에 줄을 설 수 있는 최대 인원. 이 수가 차면 더 나오지 않고, 맨 앞이 빠질 때마다 한 명씩 채워진다. 손님도 매 프레임 도는 개체라 이 수가 곧 프레임 비용이다' })
    maxQueue: number = 8;

    @property({ type: CCFloat, displayName: '줄 간격(m)', tooltip: '앞사람과의 거리. 캐릭터 폭보다 작으면 서로 파고들어 한 덩어리로 보인다' })
    spacing: number = 1;

    @property({ type: CCFloat, displayName: '등장 간격(초)', tooltip: '줄에 자리가 있을 때 다음 손님이 나오기까지의 시간. 짧으면 줄이 항상 꽉 차 보이고, 길면 띄엄띄엄 온다. 줄이 꽉 차 있으면 이 시간이 지나도 나오지 않는다' })
    spawnInterval: number = 1.5;

    @property({ type: CCFloat, displayName: '도착 판정 거리(m)', tooltip: '자기 자리 이 거리 안에 들어오면 멈춰 선다. 너무 작으면 목표 주변에서 미세하게 떨고, 너무 크면 줄 간격이 들쭉날쭉해 보인다' })
    arriveDist: number = 0.25;

    @property({ type: CCFloat, displayName: '이동 속도', tooltip: '손님의 걷는 속도(Player.이동 속도를 덮어씀). 0 이하면 프리팹 값을 그대로 쓴다. 플레이어보다 느리게 두면 "줄을 서서 기다리는" 느낌이 산다' })
    moveSpeed: number = 0;

    // ── 판매 ────────────────────────────────────────────────────────────
    @property({ type: CoinGroundStack, displayName: '칼 적재 소켓', tooltip: '플레이어가 칼을 가져다 쌓아두는 무더기. 손님은 여기서 칼을 가져간다. 비어 있으면 손님은 줄만 서고 아무것도 사지 않는다(칼이 쌓이면 다음 프레임부터 저절로 팔린다)' })
    swordStack: CoinGroundStack | null = null;

    @property({ type: CoinGroundStack, displayName: '코인 적재 소켓', tooltip: '손님이 낸 돈이 쌓이는 무더기 — 상점 옆. 플레이어가 여기 와서 직접 줍는다(손님이 플레이어에게 직접 주지 않는다). 비워두면 돈이 생기지 않는다' })
    coinStack: CoinGroundStack | null = null;

    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '낸 돈을 날려보낼 때 쓰는 풀 — 씬의 CoinSystem에 있는 것과 같은 것을 연결한다' })
    coinPool: CoinPool | null = null;

    @property({ type: CCInteger, displayName: '1인당 구매 칼 개수', tooltip: '손님 한 명이 한 번에 사 가는 칼 개수. 칼이 이 수보다 적으면 맨 앞 손님이 그대로 기다린다 — 모자란 만큼만 팔지 않는다(거스름돈 개념이 없어서 반쪽 거래가 되면 값이 어긋난다)' })
    buyCount: number = 3;

    @property({ type: CCInteger, displayName: '1인당 지불 코인 개수', tooltip: '위 개수를 사 가면서 내는 돈. 이 값이 게임의 수익률을 정한다 — 칼 한 자루의 재료비(나무1+철1)와 비교해 정한다' })
    payCount: number = 5;

    @property({ type: CCFloat, displayName: '칼 넘겨주는 간격(초)', tooltip: '칼을 한 개씩 손님에게 날려보내는 주기. 작으면 우르르 넘어가고, 크면 하나씩 세어 주는 것처럼 보인다' })
    handoverInterval: number = 0.12;

    @property({ type: CCFloat, displayName: '퇴장 비켜서기(m)', tooltip: '사고 나서 나갈 때 줄에서 옆으로 이만큼 비켜선 뒤 되돌아간다. **0이면 줄과 같은 선으로 돌아가 뒤에 서 있는 손님들을 뚫고 지나간다.** 캐릭터 폭보다 크게 준다' })
    exitOffset: number = 0.9;

    @property({ type: TriggerId, displayName: '시작 트리거', tooltip: '이 트리거가 발화할 때까지 아무 손님도 나오지 않는다. None(기본)이면 처음부터 나온다. 씬 3에서는 상점이 건설되는 트리거(4)를 넣는다 — 상점이 없는데 손님이 줄을 서면 안 된다' })
    startTriggerId: TriggerId = TriggerId.None;

    @property({ displayName: '칼이 있어야 등장', tooltip: '체크(기본)하면 칼 적재 소켓이 비어 있는 동안에는 손님이 나오지 않는다 — 명세의 "칼을 쌓게 되면 손님이 온다"가 이것이다. 끄면 칼이 없어도 줄을 서서 기다린다(줄이 길게 늘어선 채 아무 일도 안 일어나 보일 수 있다)' })
    requireSwords: boolean = true;

    /** 줄. 0번이 맨 앞이다. 사라진 손님은 매 프레임 걸러낸다. */
    private _queue: Customer[] = [];
    private _spawnTimer = 0;
    /** 지금 나가는 중인 손님들 — 줄에서는 빠졌지만 끝점까지 걸어가야 한다. */
    private _leaving: Customer[] = [];
    /** 판매가 진행 중인지. **한 번에 한 명만** 판다는 규칙이 이 하나로 지켜진다. */
    private _selling = false;
    private _soldSoFar = 0;
    private _handTimer = 0;
    private _started = false;

    private _dir = new Vec3();     // 머리 → 등장 지점 방향(줄이 뻗는 쪽)
    private _perp = new Vec3();    // 그 수직 방향(퇴장할 때 비켜서는 쪽)
    private _tmp = new Vec3();

    onLoad() {
        this._started = this.startTriggerId === TriggerId.None;
        if (!this._started) CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId === this.startTriggerId) this._started = true;
    }

    update(dt: number) {
        if (!this._started) return;
        if (!this.customerPrefab || !this.spawnPoint || !this.queueHead) return;

        this._updateAxes();
        this._prune();
        this._trySpawn(dt);
        this._driveQueue();
        this._tickSale(dt);
        this._driveLeaving();
    }

    /** 줄 방향과 그 수직 방향을 갱신한다. 두 마커를 에디터에서 옮기면 즉시 반영되도록
     * 캐시하지 않고 매 프레임 다시 구한다 — 뺄셈 두 번이라 비용이 없다. */
    private _updateAxes() {
        const h = this.queueHead!.worldPosition;
        const s = this.spawnPoint!.worldPosition;
        this._dir.set(s.x - h.x, 0, s.z - h.z);
        const len = Math.hypot(this._dir.x, this._dir.z);
        if (len > 0.0001) this._dir.multiplyScalar(1 / len);
        else this._dir.set(0, 0, 1);
        // XZ 평면에서의 수직: (x, z) -> (-z, x). 항상 같은 쪽이라 나가는 손님이 한 줄로 흐른다.
        this._perp.set(-this._dir.z, 0, this._dir.x);
    }

    private _prune() {
        for (let i = this._queue.length - 1; i >= 0; i--) {
            const c = this._queue[i];
            if (!c || !c.isValid || !c.node.isValid) this._queue.splice(i, 1);
        }
        for (let i = this._leaving.length - 1; i >= 0; i--) {
            const c = this._leaving[i];
            if (!c || !c.isValid || !c.node.isValid) this._leaving.splice(i, 1);
        }
    }

    private _trySpawn(dt: number) {
        if (this._queue.length >= this.maxQueue) return;
        // 칼이 한 자루도 없으면 부르지 않는다 — 줄만 길어지고 아무 일도 안 일어나는 그림을 막는다.
        if (this.requireSwords && (this.swordStack?.storedCount ?? 0) <= 0) return;

        this._spawnTimer += dt;
        if (this._spawnTimer < this.spawnInterval) return;
        this._spawnTimer = 0;

        const node = instantiate(this.customerPrefab!);
        const parent = this.node.scene ?? this.node.parent!;
        // 값을 다 넣은 "뒤"에 붙인다 — 활성 계층에 들어가는 순간 onLoad가 그 자리에서 돈다.
        const c = node.getComponent(Customer) ?? node.addComponent(Customer);
        c.arriveDist = this.arriveDist;
        c.state = CustomerState.ToSlot;
        c.lookAt = this.lookAtNode;
        const player = node.getComponent(Player);
        if (player) {
            player.combatEnabled = false;
            if (this.moveSpeed > 0) player.moveSpeed = this.moveSpeed;
        }
        parent.addChild(node);
        node.setWorldPosition(this.spawnPoint!.worldPosition);
        this._queue.push(c);
    }

    /** 줄에 선 사람들에게 각자의 자리를 알려준다. 자리 번호는 배열 순서가 곧 그것이라,
     * 맨 앞이 빠지면 뒤 전원이 저절로 한 칸 당겨진다. */
    private _driveQueue() {
        const h = this.queueHead!.worldPosition;
        for (let i = 0; i < this._queue.length; i++) {
            const c = this._queue[i];
            c.slot = i;
            this._tmp.set(this._dir).multiplyScalar(i * this.spacing);
            c.target.set(h.x + this._tmp.x, h.y, h.z + this._tmp.z);
            if (i === 0 && c.state === CustomerState.ToSlot && c.arrived) {
                c.state = CustomerState.AtFront;
            }
        }
    }

    /** 맨 앞 손님에게 칼을 한 개씩 넘기고, 다 넘기면 돈을 받고 내보낸다. */
    private _tickSale(dt: number) {
        const front = this._queue[0];
        if (!front || front.state !== CustomerState.AtFront) { this._selling = false; return; }
        if (!this.swordStack) return;

        if (!this._selling) {
            // 칼이 모자라면 시작하지 않는다 — 반쪽 거래를 허용하면 지불액과 맞지 않게 된다.
            if (this.swordStack.storedCount < this.buyCount) return;
            this._selling = true;
            this._soldSoFar = 0;
            this._handTimer = 0;
        }

        this._handTimer += dt;
        if (this._handTimer < this.handoverInterval) return;
        this._handTimer = 0;

        // 스택을 null로 주면 칼이 손님에게 날아간 뒤 그대로 사라진다 — 손님 등에 쌓이지 않는다.
        if (this.swordStack.transferOneTo(front.node, null)) this._soldSoFar++;
        if (this._soldSoFar < this.buyCount) return;

        this._pay();
        this._selling = false;
        front.state = CustomerState.Leaving;
        // 끝점 = 등장 지점을 옆으로 비켜선 자리. 줄과 다른 선을 타야 뒷사람을 뚫지 않는다.
        const s = this.spawnPoint!.worldPosition;
        front.target.set(
            s.x + this._perp.x * this.exitOffset, s.y,
            s.z + this._perp.z * this.exitOffset,
        );
        this._queue.shift();
        this._leaving.push(front);
    }

    /** 손님이 낸 돈을 코인 무더기로 날려보낸다. 운반자가 창고에 내려놓는 것과 같은 경로다. */
    private _pay() {
        if (!this.coinStack || !this.coinPool) return;
        const from = this._queue[0]?.node.worldPosition ?? this.queueHead!.worldPosition;
        const pos = new Vec3(from.x, from.y + 0.8, from.z);
        for (let i = 0; i < this.payCount; i++) {
            this.coinPool.spawn(pos, this.coinStack.node, 999, this.coinStack, false, false, this.coinStack.acceptedType);
        }
    }

    /** 나가는 중인 손님은 목표에 닿으면 사라진다. 줄에서 이미 빠졌으므로 자리 계산에 끼지 않는다. */
    private _driveLeaving() {
        for (let i = this._leaving.length - 1; i >= 0; i--) {
            const c = this._leaving[i];
            if (!c.arrived) continue;
            this._leaving.splice(i, 1);
            c.node.destroy();
        }
    }
}
