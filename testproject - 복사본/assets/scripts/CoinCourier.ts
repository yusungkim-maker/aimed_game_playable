import { _decorator, Component, Node, Vec2 } from 'cc';
import { Player } from './Player';
import { CoinStack } from './CoinStack';
import { CoinGroundStack } from './CoinGroundStack';
import { CoinPool } from './CoinPool';
const { ccclass, property } = _decorator;

/** 운반자가 지금 무엇을 하고 있는지. */
enum CourierState {
    /** 출발 무더기로 가는 중 */
    ToSource,
    /** 출발 무더기 옆에서 등에 싣는 중 (실을 것이 없으면 여기서 계속 대기한다) */
    Loading,
    /** 목적지 무더기로 가는 중 */
    ToDest,
    /** 목적지에 내리는 중 */
    Unloading,
}

/**
 * 소켓 보상으로 나오는 "코인 운반자" 추종자. 자기 섹터의 coin_ground에 쌓인 코인을 등에
 * 지고(용량만큼) 기지 앞 coin_ground로 옮기는 일을 계속 반복한다.
 *
 * 이 컴포넌트는 이동/애니메이션/전투를 직접 구현하지 않는다 — FollowerMovement와 똑같이
 * `Player.moveDirOverride`에 "지금 목표로 가려면 이 방향" 값만 매 프레임 넣어줄 뿐이고,
 * 실제 이동과 걷기/대기 애니메이션은 전부 Player.ts가 그대로 담당한다.
 *
 * **전투를 하지 않는 이유**: CoinCourierManager가 스폰 직후 `Player.combatEnabled`를 false로
 * 둔다(고스트 상태의 추종자를 비전투로 만드는 FollowerGhostState와 같은 스위치). 몬스터 쪽은
 * 기지와 문만 공격하므로(Monster.ts) 운반자가 피격되는 경로도 애초에 없다 — 즉 운반 루프가
 * 전투 때문에 끊기지 않는다.
 *
 * **코인 이동 자체도 새로 만들지 않는다** — 싣기는 CoinGroundStack.transferOneTo()로 플레이어가
 * 직접 주울 때와 완전히 같은 경로(팝 → 자석 추적 → 등 뒤 슬롯)를 타고, 내리기는 등 뒤 스택에서
 * 하나 빼서 CoinPool.spawn()으로 목적지 무더기를 향해 날린다. 그래서 손맛이 항상 같다.
 */
@ccclass('CoinCourier')
export class CoinCourier extends Component {
    @property({ displayName: '적재 용량(개)', tooltip: '한 번에 등에 싣고 갈 코인 개수. 이만큼 채우면 목적지로 출발한다. 출발 무더기의 코인이 이보다 적으면 있는 만큼만 싣고 출발한다' })
    capacity: number = 10;

    @property({ displayName: '싣는 간격(초)', tooltip: '출발 무더기에서 코인을 한 개씩 등으로 빨아들이는 주기. 작을수록 우르르 빨려온다' })
    pickupInterval: number = 0.05;

    @property({ displayName: '내리는 간격(초)', tooltip: '목적지 무더기에 코인을 한 개씩 내려놓는 주기' })
    depositInterval: number = 0.05;

    @property({ displayName: '도착 판정 거리(m)', tooltip: '무더기 중심에서 이 거리 안에 들어오면 도착한 것으로 보고 싣기/내리기를 시작한다' })
    arriveDist: number = 0.6;

    @property({ displayName: '내릴 때 자석 반경(m)', tooltip: '내려놓는 코인이 목적지 무더기로 곧장 날아가도록 충분히 크게 둔다 (플레이어 회수와 같은 방식)' })
    depositMagnetRadius: number = 999;

    // ── 스폰 시점에 CoinCourierManager가 주입하는 참조들 (프리팹은 씬 노드를 담을 수 없다) ──
    /** 코인을 퍼올 출발 무더기 (자기 섹터의 coin_ground) */
    sourceStack: CoinGroundStack | null = null;
    /** 코인을 내려놓을 목적지 무더기 (기지 앞 coin_ground) */
    destStack: CoinGroundStack | null = null;
    /** 내려놓을 때 코인을 날리기 위해 쓰는 풀 — 씬의 CoinPool 하나를 모두가 공유한다 */
    coinPool: CoinPool | null = null;

    private _player: Player | null = null;
    private _back: CoinStack | null = null;
    private _state = CourierState.ToSource;
    private _timer = 0;
    /** 출발 무더기에서 빼왔지만 아직 목적지에 내리지 않은 개수 — **날아오는 중인 코인까지 포함**한다.
     * 등 뒤 스택의 count는 코인이 실제로 "도착"해야 올라가므로, 그것만 보고 용량을 판단하면
     * 날아오는 중인 코인을 세지 못해 용량을 초과해 퍼오게 된다. */
    private _claimed = 0;

    onLoad() {
        this._player = this.getComponent(Player);
        this._back = this.getComponent(CoinStack);
    }

    update(dt: number) {
        if (!this._player || !this._back || !this.sourceStack || !this.destStack) return;

        switch (this._state) {
            case CourierState.ToSource:
                if (this._moveTo(this.sourceStack.node)) {
                    this._state = CourierState.Loading;
                    this._timer = 0;
                }
                break;

            case CourierState.Loading:
                this._stand();
                this._tickLoading(dt);
                break;

            case CourierState.ToDest:
                if (this._moveTo(this.destStack.node)) {
                    this._state = CourierState.Unloading;
                    this._timer = 0;
                }
                break;

            case CourierState.Unloading:
                this._stand();
                this._tickUnloading(dt);
                break;
        }
    }

    /** 출발 무더기 옆에서 등에 싣는다. 용량을 채우면 출발하고, 무더기가 비었는데 실은 것이
     * 있으면 있는 만큼만 들고 출발한다. 둘 다 아니면(무더기가 비었고 실은 것도 없으면) 아무
     * 일도 하지 않고 여기서 계속 대기한다 — 타워가 몬스터를 잡아 코인이 새로 생기는 순간
     * 다음 프레임부터 저절로 다시 싣기 시작한다. */
    private _tickLoading(dt: number) {
        if (this._claimed >= this.capacity) {
            this._state = CourierState.ToDest;
            return;
        }

        this._timer += dt;
        if (this._timer < this.pickupInterval) return;
        this._timer = 0;

        if (this.sourceStack!.transferOneTo(this.node, this._back)) {
            this._claimed++;
            if (this._claimed >= this.capacity) this._state = CourierState.ToDest;
            return;
        }

        // 무더기가 비었다 — 조금이라도 실었으면 그것만 들고 출발, 아니면 계속 대기.
        if (this._claimed > 0) this._state = CourierState.ToDest;
    }

    /** 목적지에서 등 뒤 스택을 하나씩 비운다. 아직 날아오는 중인 코인이 있으면(_claimed가
     * 남아 있는데 등에는 아직 없는 상태) 그것이 도착할 때까지 여기서 기다린다 — 그래야 퍼온
     * 코인을 한 개도 잃지 않는다. */
    private _tickUnloading(dt: number) {
        if (this._claimed <= 0) {
            this._state = CourierState.ToSource;
            return;
        }

        this._timer += dt;
        if (this._timer < this.depositInterval) return;
        this._timer = 0;

        const coin = this._back!.popTop();
        if (!coin) return; // 아직 날아오는 중 — 도착을 기다린다

        const pos = coin.worldPosition.clone();
        coin.destroy();
        this._claimed--;

        this.coinPool?.spawn(pos, this.destStack!.node, this.depositMagnetRadius, this.destStack, true);

        if (this._claimed <= 0) this._state = CourierState.ToSource;
    }

    /** 목표 노드 쪽으로 걷게 한다. 도착했으면 true. 좌표 변환은 FollowerMovement와 동일
     * (Player.ts 조이스틱 좌표계: worldX = joyX, worldZ = -joyY). */
    private _moveTo(target: Node): boolean {
        const p = this.node.worldPosition;
        const t = target.worldPosition;
        const dx = t.x - p.x;
        const dz = t.z - p.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= this.arriveDist) {
            this._stand();
            return true;
        }

        const inv = 1 / dist;
        this._player!.moveDirOverride = new Vec2(dx * inv, -dz * inv);
        return false;
    }

    private _stand() {
        this._player!.moveDirOverride = Vec2.ZERO;
    }
}
