import { _decorator, Component, Node, Vec3 } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { CoinPool } from './CoinPool';
import { CoinStack } from './CoinStack';
import { Player } from './Player';
import { TowerAttack } from './TowerAttack';
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
    private _onMonsterKilled = (pos: Vec3, count: number = 1, source: Node | null = null) => this._spawnCoin(pos, count, source);

    onLoad() {
        if (this.playerNode) {
            this._player = this.playerNode.getComponent(Player);
            this._stack  = this.playerNode.getComponent(CoinStack);
        }
        CoinEvents.on(CoinEventName.MonsterKilled, this._onMonsterKilled);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.MonsterKilled, this._onMonsterKilled);
    }

    private _spawnCoin(pos: Vec3, count: number, source: Node | null) {
        if (!this.coinPool) return;

        const groundStack = source?.getComponent(TowerAttack)?.coinGroundStack ?? null;
        if (groundStack) {
            for (let i = 0; i < count; i++) {
                this.coinPool.spawn(pos, groundStack.node, this.groundMagnetRadius, groundStack);
            }
            return;
        }

        if (!this.playerNode || !this._player) return;
        const magnetRadius = this._player.attackRange * this.magnetRadiusRatio;
        for (let i = 0; i < count; i++) {
            this.coinPool.spawn(pos, this.playerNode, magnetRadius, this._stack);
        }
    }
}
