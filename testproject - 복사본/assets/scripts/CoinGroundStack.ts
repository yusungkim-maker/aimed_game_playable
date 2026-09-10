import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinStack, CoinStackTarget } from './CoinStack';
import { CoinPool } from './CoinPool';
import type { Coin } from './Coin';
const { ccclass, property } = _decorator;

/**
 * 타워가 처치한 몬스터의 코인이 쌓이는 바닥 무더기 (coin_ground 계열 노드에 붙는다).
 * 캐릭터 등 뒤 CoinStack과 같은 방식(reserveSlot/getSlotWorldPosition)으로 동작하지만,
 * 한 줄이 아니라 2x2 격자로 배치된 4개 열에 번갈아 나눠 쌓는다 — CoinSpawnController가
 * 어느 타워가 죽였는지에 따라 이 컴포넌트 중 하나로 코인을 보낸다.
 *
 * 열마다 최대 높이(maxPerLane)를 둬서 전체 비주얼 오브젝트 개수를 무한히 늘리지 않는다
 * (렉 방지, 기본 4열 x 100 = 400개) — 상한을 넘어 도착하는 코인은 비주얼 없이 _overflowCount로만
 * 세어둔다(그래도 개수 자체는 잃지 않고, 플레이어가 접근하면 나머지와 함께 전부 돌려받는다).
 *
 * 플레이어가 반경 안에 들어오면 쌓여있던 코인이 다시 하나씩 등 뒤 스택(CoinStack)으로
 * 날아간다 — 새 비행 로직을 만들지 않고, 몬스터를 잡았을 때와 완전히 같은 CoinPool.spawn()
 * 경로(팝 → 자석 추적)를 재사용한다.
 */
@ccclass('CoinGroundStack')
export class CoinGroundStack extends Component implements CoinStackTarget {
    @property({ type: Prefab, displayName: '스택 코인 프리팹', tooltip: '쌓일 때 보여줄 정적 코인 비주얼 (CoinStack과 동일한 프리팹을 써도 됨)' })
    stackCoinPrefab: Prefab | null = null;

    @property({ displayName: '격자 간격(m)', tooltip: '2x2로 배치되는 네 열 사이의 가로/세로 간격' })
    laneSpacing: number = 0.4;

    @property({ displayName: '코인 간 간격(m)', tooltip: '한 열 안에서 위로 쌓는 간격' })
    stackSpacing: number = 0.08;

    @property({ displayName: '열당 최대 코인 수', tooltip: '이 개수를 넘으면 더 쌓지 않는다(오브젝트 무한 증식/렉 방지) — 4개 열이 있으므로 실제 최대 비주얼 개수는 이 값의 4배(기본 100 x 4 = 400)' })
    maxPerLane: number = 100;

    @property({ displayName: '착지 Y(m)', tooltip: '코인 두께 때문에 바닥(y=0)에 파묻히지 않도록 살짝 띄운 높이 — 첫 번째 층 기준' })
    baseY: number = 0.07;

    @property({ displayName: '스택 코인 회전(Euler)', tooltip: '코인 메쉬가 세워진 상태로 임포트되어, 눕혀 쌓으려면 X를 -90으로' })
    stackRotation: Vec3 = new Vec3(-90, 0, 0);

    // ── 플레이어에게 되돌려주기 ──────────────────────────────────────────
    @property({ type: CoinPool, displayName: '코인 풀', tooltip: '플레이어에게 돌려보낼 때 사용 — CoinSpawnController가 쓰는 것과 같은 CoinPool을 연결' })
    coinPool: CoinPool | null = null;

    @property({ type: Node, displayName: '플레이어 노드', tooltip: '이 노드가 흡수 반경 안에 들어오면 쌓여있던 코인이 하나씩 등 뒤로 돌아가기 시작한다' })
    playerNode: Node | null = null;

    @property({ displayName: '흡수 반경(m)' })
    radius: number = 2;

    @property({ displayName: '코인 반환 간격(초)', tooltip: '플레이어가 반경 안에 있는 동안 코인을 한 개씩 등 뒤로 돌려보내는 주기' })
    transferInterval: number = 0.05;

    @property({ displayName: '반환 시 자석 반경(m)', tooltip: '플레이어에게 돌아가는 코인은 팝 애니메이션이 끝나는 즉시 이 반경 안에 있는 것으로 간주해 곧장 등 뒤로 날아간다 — 사실상 항상 즉시 흡수되도록 충분히 크게 둔다' })
    transferMagnetRadius: number = 999;

    private _stack: Node[] = [];
    private _reservedCount = 0;
    private _overflowCount = 0; // 비주얼 상한을 넘어 도착해 노드로 표현되지 못한 개수 — 그래도 반환 시 함께 돌려받는다
    private _laneOffsets: Vec3[] = [];
    private _playerStack: CoinStack | null = null;
    private _transferTimer = 0;
    /** 지금 수거 중인지 — 수거 시작 알림(GroundStackCollectStarted)을 한 번만 보내기 위한 상태 */
    private _collecting = false;
    private _onCoinCollected = (coin: Coin) => { if (coin.stack === this) this._addOne(); };

    onLoad() {
        const d = this.laneSpacing / 2;
        this._laneOffsets = [
            new Vec3(-d, 0, -d),
            new Vec3(d, 0, -d),
            new Vec3(-d, 0, d),
            new Vec3(d, 0, d),
        ];
        if (this.playerNode) this._playerStack = this.playerNode.getComponent(CoinStack);
        CoinEvents.on(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.CoinCollected, this._onCoinCollected);
    }

    update(dt: number) {
        if (!this.playerNode || !this.coinPool) return;
        if (this._stack.length === 0 && this._overflowCount === 0) { this._collecting = false; return; }
        if (Vec3.distance(this.node.worldPosition, this.playerNode.worldPosition) > this.radius) {
            this._collecting = false;
            return;
        }

        // 수거가 "시작되는" 순간에만 한 번 알린다 — 코인이 하나씩 날아가는 내내 매 프레임
        // 울리면 안 되므로, 반경을 벗어났다 다시 들어올 때까지 다시 emit하지 않는다.
        if (!this._collecting) {
            this._collecting = true;
            CoinEvents.emit(
                CoinEventName.GroundStackCollectStarted,
                this._stack.length + this._overflowCount,
            );
        }

        this._transferTimer += dt;
        if (this._transferTimer < this.transferInterval) return;
        this._transferTimer = 0;
        // 플레이어 회수도 운반자 회수와 완전히 같은 경로를 쓴다 — 배출 구현이 하나만 존재하도록.
        this.transferOneTo(this.playerNode, this._playerStack);
    }

    /** 지금 이 무더기가 들고 있는 코인 개수(비주얼 상한을 넘겨 숫자로만 세어둔 초과분 포함).
     * 운반자(CoinCourier)가 "가져갈 것이 남았는지" 판단하는 데 쓴다. */
    get storedCount(): number {
        return this._stack.length + this._overflowCount;
    }

    /** 자석에 걸린 코인이 collecting을 시작할 때 호출 — 다음 빈 슬롯 인덱스를 예약해 돌려준다.
     * 인덱스 % 4가 열, 인덱스 / 4가 그 열에서의 층(높이)이 된다. */
    reserveSlot(): number {
        return this._reservedCount++;
    }

    /** 예약된 슬롯의 현재 월드 좌표. 열당 최대 층수를 넘는 인덱스는 마지막 층 자리로 클램프된다
     * (그 코인은 그 자리로 날아와 도착만 하고, 비주얼은 추가되지 않음 — _addOne 참고). */
    getSlotWorldPosition(index: number, out: Vec3): Vec3 {
        const lane = index % 4;
        const height = Math.min(Math.floor(index / 4), this.maxPerLane - 1);
        const off = this._laneOffsets[lane];
        out.set(off.x, this.baseY + height * this.stackSpacing, off.z);
        return Vec3.transformMat4(out, out, this.node.worldMatrix);
    }

    private _addOne() {
        const index = this._stack.length;
        if (Math.floor(index / 4) >= this.maxPerLane) {
            this._overflowCount++; // 화면에는 안 보이지만 개수 자체는 잃지 않는다
            return;
        }
        if (!this.stackCoinPrefab) return;

        const node = instantiate(this.stackCoinPrefab);
        // coin_ground 자신이 레벨 배치상 스케일/회전이 걸려있을 수 있어(예: 0.5배 축소, 45도
        // 회전), 이 노드의 자식으로 붙이면 코인이 그 변형을 그대로 물려받아 작아지거나
        // 비뚤어져 보인다 — 씬 루트에 붙이고 월드 좌표/스케일을 직접 지정해 원본 크기 그대로
        // 눕혀 쌓는다 (getSlotWorldPosition과 동일한 계산을 그대로 재사용).
        const parent = this.node.scene ?? this.node.parent!;
        parent.addChild(node);
        const pos = new Vec3();
        this.getSlotWorldPosition(index, pos);
        node.setWorldPosition(pos);
        node.setWorldScale(1, 1, 1);
        node.setRotationFromEuler(this.stackRotation.x, this.stackRotation.y, this.stackRotation.z);
        this._stack.push(node);
    }

    /** 쌓여있던 코인(또는 비주얼 상한을 넘겨 세어만 두었던 초과분) 하나를 지정한 대상에게
     * 보낸다. 몬스터를 잡았을 때와 완전히 같은 CoinPool.spawn() 경로(팝 → 자석 추적)를
     * 그대로 타므로, 새 애니메이션 코드 없이 항상 같은 손맛으로 날아간다.
     *
     * 대상을 인자로 받는 이유: 이 무더기에서 코인을 빼가는 주체가 플레이어 하나가 아니게
     * 되었다(운반자 추종자도 같은 무더기에서 퍼간다). 대상만 다르고 나머지 동작은 완전히
     * 같으므로 구현을 둘로 나누지 않고 여기 하나만 둔다.
     *
     * @returns 실제로 하나 보냈으면 true, 남은 코인이 없거나 대상이 없어 못 보냈으면 false.
     */
    transferOneTo(target: Node | null, stack: CoinStackTarget | null): boolean {
        if (!target || !this.coinPool) return false;

        let pos: Vec3;
        const node = this._stack.pop();
        if (node) {
            pos = node.worldPosition.clone();
            node.destroy();
        } else if (this._overflowCount > 0) {
            this._overflowCount--;
            pos = this.node.worldPosition.clone();
        } else {
            return false;
        }
        // fromGround=true — 몬스터가 떨군 코인을 처음 줍는 것과 구분된다(수거음이 따로 있어서
        // 개별 코인 획득음은 내지 않는다).
        this.coinPool.spawn(pos, target, this.transferMagnetRadius, stack, true);
        return true;
    }
}
