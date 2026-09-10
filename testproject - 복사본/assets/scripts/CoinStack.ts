import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import type { Coin } from './Coin';
const { ccclass, property } = _decorator;

/**
 * 코인이 "어디로 끌려가 쌓이는지"를 나타내는 공통 인터페이스. CoinStack(캐릭터 등 뒤)과
 * CoinGroundStack(타워가 처치한 몬스터의 코인이 쌓이는 바닥 무더기)이 둘 다 구현한다 —
 * Coin.ts/CoinPool.ts는 이 인터페이스만 알면 되고, 어느 쪽 스택인지는 신경 쓰지 않는다.
 */
export interface CoinStackTarget {
    reserveSlot(): number;
    getSlotWorldPosition(index: number, out: Vec3): Vec3;
}

/**
 * 캐릭터 등 뒤에 무제한(캡 없음)으로 쌓이는 코인 스택 비주얼. CoinCollected를 구독해
 * 코인을 하나씩 추가하고, 소켓이 popTop()으로 맨 위 코인부터 하나씩 빼갈 수 있다.
 */
@ccclass('CoinStack')
export class CoinStack extends Component implements CoinStackTarget {
    @property({ type: Prefab, displayName: '스택 코인 프리팹', tooltip: '등에 쌓일 때 보여줄 정적 코인 비주얼 (로직 컴포넌트 없는 순수 표시용 인스턴스)' })
    stackCoinPrefab: Prefab | null = null;

    @property({ displayName: '코인 간 간격(m)', tooltip: '쌓일 때 위로 쌓는 간격' })
    stackSpacing: number = 0.08;

    @property({ displayName: '스택 시작 로컬 오프셋', tooltip: '캐릭터 노드 기준 등 뒤 로컬 위치' })
    stackOrigin: Vec3 = new Vec3(0, 1.0, -0.4);

    @property({ displayName: '스택 코인 회전(Euler)', tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 등에 눕혀 쌓으려면 X를 -90으로 돌려야 함' })
    stackRotation: Vec3 = new Vec3(-90, 0, 0);

    @property({ displayName: '시작 보유 코인 개수', tooltip: '게임 시작 시 몬스터를 잡지 않아도 이미 등에 쌓여있는 코인 개수 (소켓 트리거 부트스트랩용)' })
    initialCoins: number = 6;

    private _stack: Node[] = [];
    private _reservedCount = 0;
    // CoinCollected는 코인이 어느 스택으로 향했든 상관없이 전역으로 emit되므로(Coin.ts는
    // 여러 종류의 CoinStackTarget 중 하나를 향해 갈 수 있음 — CoinGroundStack 등), 이 코인이
    // 실제로 "나"를 향해 가던 것이었는지 coin.stack으로 반드시 확인하고 넘어가야 한다.
    // 확인 없이 무조건 _addOne()하면 다른 스택(예: 타워 킬 코인의 coin_ground)으로 향하던
    // 코인까지 여기 등 뒤 스택에 잘못 추가돼버린다.
    private _onCoinCollected = (coin: Coin) => { if (coin.stack === this) this._addOne(); };

    onLoad() {
        CoinEvents.on(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    start() {
        for (let i = 0; i < this.initialCoins; i++) this._addOne();
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    /** 현재 쌓인 코인 개수. 다음 단계(소켓 흡수)에서 이 스택을 앞에서부터 소비할 예정 */
    get count(): number { return this._stack.length; }

    /**
     * 자석에 걸린 코인이 수집을 시작할 때 호출 — 아직 비어있는 다음 슬롯 하나를 예약해서
     * 인덱스를 돌려준다. 동시에 여러 코인이 날아오는 중에도 서로 다른 슬롯을 향하게 하기 위해
     * 실제로 쌓이는 시점(_addOne)이 아니라 예약 시점에 즉시 증가시킨다.
     */
    reserveSlot(): number {
        return this._reservedCount++;
    }

    /** 예약된 슬롯의 현재 월드 좌표를 계산한다 (캐릭터가 이동해도 매 프레임 다시 불러 추적) */
    getSlotWorldPosition(index: number, out: Vec3): Vec3 {
        out.set(
            this.stackOrigin.x,
            this.stackOrigin.y + index * this.stackSpacing,
            this.stackOrigin.z,
        );
        return Vec3.transformMat4(out, out, this.node.worldMatrix);
    }

    private _addOne() {
        if (!this.stackCoinPrefab) return;
        const node = instantiate(this.stackCoinPrefab);
        this.node.addChild(node);
        node.setPosition(
            this.stackOrigin.x,
            this.stackOrigin.y + this._stack.length * this.stackSpacing,
            this.stackOrigin.z,
        );
        node.setRotationFromEuler(this.stackRotation.x, this.stackRotation.y, this.stackRotation.z);
        this._stack.push(node);
        CoinEvents.emit(CoinEventName.StackChanged, this._stack.length, this);
    }

    /**
     * 소켓이 코인을 하나씩 순차적으로 흡수할 때 호출. 가장 최근에 쌓인(맨 위) 코인 노드를
     * 스택에서 분리해 그대로 반환한다(destroy하지 않음 — 호출측이 소켓으로 날아가는
     * 연출에 그 실제 코인 노드를 재사용함). 스택이 비어있으면 null.
     */
    popTop(): Node | null {
        const node = this._stack.pop() ?? null;
        if (node) {
            this._reservedCount = this._stack.length; // 진행 중인 예약도 현재 스택 크기에 맞춰 재동기화
            CoinEvents.emit(CoinEventName.StackChanged, this._stack.length, this);
        }
        return node;
    }
}
