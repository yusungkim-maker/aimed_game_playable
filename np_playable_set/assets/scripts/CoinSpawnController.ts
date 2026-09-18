import { _decorator, Component, Node, Vec3 } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinPool } from './CoinPool';
import { CoinStack } from './CoinStack';
import { Player } from './Player';
import { TowerAttack } from './TowerAttack';
import { ResourceType } from './ResourceType';
import { CoinCourier } from './CoinCourier';
const { ccclass, property } = _decorator;

/**
 * MonsterKilled 이벤트를 구독해 코인 1개를 드롭시킨다. 자석 반경은 플레이어의 실제
 * attackRange 값을 참조해 "공격 사거리보다 살짝 짧게" 계산한다 (0단계 컨텍스트 문서 규칙).
 * 정확한 계수는 아직 미확정이라 인스펙터에서 바로 튜닝할 수 있게 노출해둔다.
 *
 * 타워가 죽인 몬스터는 예외 — 그 타워(TowerAttack)의 coinGroundStack이 지정돼 있으면
 * 코인이 플레이어 대신 그 coin_ground(CoinGroundStack)로 날아가 쌓인다. 어느 coin_ground로
 * 보낼지는 각 타워 프리팹 인스펙터에서 직접 지정한다(여러 타워가 같은 coin_ground를
 * 가리켜도 된다). 지정 안 된 타워, 또는 플레이어가 직접 죽인 몬스터는 기존처럼
 * 플레이어에게 날아간다.
 */
@ccclass('CoinSpawnController')
export class CoinSpawnController extends Component {
    /** 엔딩 연출에서 GameManager가 찾아 쓰기 위한 참조 (인스펙터 연결 불필요) */
    static instance: CoinSpawnController | null = null;

    /** 켜면 이후 스폰되는 코인은 플레이어에게 날아가지 않고 떨어진 자리에 그대로 남는다.
     * 엔딩에서 몬스터를 싹쓸이할 때 코인이 우수수 떨어지는 그림만 남기고 회수는 하지 않으려고 쓴다. */
    dropOnly = false;

    @property({ type: CoinPool, displayName: '코인 풀' })
    coinPool: CoinPool | null = null;

    @property({ type: Node, displayName: '플레이어 노드', tooltip: '자석 이동 대상 + attackRange 참조용' })
    playerNode: Node | null = null;

    @property({ displayName: '자석 반경 계수', tooltip: 'magnetRadius = player.attackRange * 이 값 (1보다 작으면 공격 사거리보다 짧음)' })
    magnetRadiusRatio: number = 0.8;

    @property({ displayName: '코인 무더기로 향할 때의 자석 반경(m)', tooltip: '타워가 처치해 코인 무더기로 향하는 코인은 착지 즉시 이 반경 안에 있는 것으로 간주해 곧바로 쌓이러 날아간다 — 사실상 항상 즉시 흡수되도록 충분히 크게 둔다' })
    groundMagnetRadius: number = 999;

    private _player: Player    | null = null;
    private _stack:  CoinStack | null = null;
    // 4번째 인자(자원 종류)는 나중에 추가된 것이라, 넘기지 않는 예전 emit은 코인으로 떨어진다
    private _onMonsterKilled = (pos: Vec3, count: number = 1, source: Node | null = null, type: ResourceType = ResourceType.Coin) => this._spawnCoin(pos, count, source, type);

    onLoad() {
        CoinSpawnController.instance = this;
        if (this.playerNode) {
            this._player = this.playerNode.getComponent(Player);
            this._stack  = this.playerNode.getComponent(CoinStack);
        }
        CoinEvents.on(CoinEventName.MonsterKilled, this._onMonsterKilled);
        // 나무 등 몬스터가 아닌 출처. 페이로드 모양이 같아서 같은 핸들러를 그대로 쓴다 —
        // 스폰 이후의 경로(자석 → 등 뒤 스택 → 소켓)는 코인과 완전히 동일하다.
        // 구독을 하나 더 다는 것뿐이라, 이 이벤트를 아무도 쏘지 않는 씬은 영향이 없다.
        CoinEvents.on(CoinEventName.ResourceDropped, this._onMonsterKilled);
    }

    onDestroy() {
        if (CoinSpawnController.instance === this) CoinSpawnController.instance = null;
        CoinEvents.off(CoinEventName.MonsterKilled, this._onMonsterKilled);
        CoinEvents.off(CoinEventName.ResourceDropped, this._onMonsterKilled);
    }

    private _spawnCoin(pos: Vec3, count: number, source: Node | null, type: ResourceType = ResourceType.Coin) {
        if (!this.coinPool) return;

        // 엔딩 싹쓸이 중 — 떨어뜨리기만 하고 회수하지 않는다. 타워가 죽였든 아니든 상관없이
        // 그 자리에 남겨야 하므로 coin_ground로 보내는 분기보다 먼저 처리한다.
        if (this.dropOnly && this.playerNode) {
            for (let i = 0; i < count; i++) {
                this.coinPool.spawn(pos, this.playerNode, 0, null, false, true, type);
            }
            return;
        }

        const groundStack = source?.getComponent(TowerAttack)?.coinGroundStack ?? null;
        if (groundStack) {
            for (let i = 0; i < count; i++) {
                this.coinPool.spawn(pos, groundStack.node, this.groundMagnetRadius, groundStack, false, false, type);
            }
            return;
        }

        // 캔 쪽이 일꾼이면 그 일꾼의 상태가 행선지를 정한다. 일꾼은 게임 진행에 따라 세 가지로
        // 달라지는데, 그 판단을 여기서 하지 않고 일꾼에게 물어본다 — 조건(창고가 섰는가)은
        // 일꾼이 알고 있고, 여기는 "어디로 날릴까"만 아는 것이 맞다.
        const courier = source?.getComponent(CoinCourier) ?? null;
        if (courier) {
            if (!courier.canAbsorb) {
                // ① 아직 가져갈 창고가 없다 → 그 자리에 떨어뜨려 플레이어가 줍게 한다.
                //    아래 플레이어 분기로 그대로 흘려보내면 정확히 그 동작이 된다.
            } else if (!courier.carryVisually) {
                // ② 가져가되 등에 쌓지는 않는다 → 일꾼에게 날아가 사라지고 개수만 센다.
                //    스택을 null로 주면 Coin이 대상 위치로 날아간 뒤 그대로 풀로 돌아간다.
                for (let i = 0; i < count; i++) {
                    this.coinPool.spawn(pos, source!, this.groundMagnetRadius, null, false, false, type);
                }
                return;
            }
            // ③ 등에 쌓는 일꾼은 아래 기존 경로(자기 CoinStack)를 그대로 탄다.
        }

        // 자기 등 뒤 스택을 가진 쪽이 캔 자원은 그쪽으로 간다 — 일꾼이 벤 나무가 플레이어
        // 등으로 날아가면 운반이라는 개념 자체가 성립하지 않는다. 몬스터 킬(MonsterKilled)의
        // source는 타워 노드이거나 null이고 타워에는 CoinStack이 없으므로, 기존 두 씬은
        // 이 분기에 들어오지 않는다.
        const carrierStack = (courier && !courier.canAbsorb) ? null : (source?.getComponent(CoinStack) ?? null);
        if (carrierStack) {
            for (let i = 0; i < count; i++) {
                this.coinPool.spawn(pos, source!, this.groundMagnetRadius, carrierStack, false, false, type);
            }
            return;
        }

        if (!this.playerNode || !this._player) return;
        const magnetRadius = this._player.attackRange * this.magnetRadiusRatio;
        for (let i = 0; i < count; i++) {
            this.coinPool.spawn(pos, this.playerNode, magnetRadius, this._stack, false, false, type);
        }
    }
}
