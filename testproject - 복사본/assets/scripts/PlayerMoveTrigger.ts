import { _decorator, Component, Node, Vec3, CCFloat } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { MonsterSpawner } from './MonsterSpawner';
const { ccclass, property } = _decorator;

/**
 * 플레이어가 "처음 움직이기 시작한" 순간을 딱 한 번 잡아서 러쉬를 시작시킨다.
 *
 * 왜 필요한가: 몬스터가 나오는 시점을 "첫 소켓 완성"에 물려두면, 플레이어가 아직 아무것도
 * 안 하고 있는 동안에는 화면이 비어 있고, 반대로 소켓을 채우자마자 러쉬 + 건물 + 보스가
 * 한꺼번에 몰린다. 그래서 잡몹 러쉬만 "조작을 시작한 순간"으로 떼어냈다.
 *
 * 판정은 입력 장치가 아니라 **플레이어 노드가 실제로 움직인 거리**로 한다 — 조이스틱을
 * 살짝 건드려 방향만 바뀐 것은 무시되고, 조이스틱이든 다른 경로(추종자 이동 override 등)든
 * 실제로 이동했을 때만 발화한다.
 *
 * 발화 후에는 스스로 update를 끈다(enabled = false).
 */
@ccclass('PlayerMoveTrigger')
export class PlayerMoveTrigger extends Component {
    @property({ type: Node, displayName: '플레이어 노드', tooltip: '움직임을 감시할 노드. 보통 메인 캐릭터 노드를 그대로 연결한다' })
    playerNode: Node | null = null;

    @property({ type: CCFloat, displayName: '움직임 판정 거리(m)', tooltip: '시작 위치에서 이 거리 이상 벗어나면 "움직이기 시작했다"로 본다. 너무 작으면 미세한 흔들림에도 발화하고, 너무 크면 몇 걸음 걷고 나서야 시작된다' })
    moveThreshold: number = 0.15;

    @property({ type: CCFloat, displayName: '발화 지연(초)', tooltip: '움직임을 감지한 뒤 이만큼 기다렸다가 러쉬를 시작한다. 0이면 즉시' })
    startDelay: number = 0;

    @property({ type: Node, displayName: '몬스터 스포너 노드', tooltip: '아래 러쉬 이름을 쓸 때만 필요. 비워두면 러쉬를 시작시키지 않는다' })
    monsterSpawnerNode: Node | null = null;

    @property({ displayName: '시작할 러쉬 이름', tooltip: '발화와 동시에 시작할 MonsterSpawner.rushes(또는 간격 반복 사이클)의 이름. 비워두면 없음' })
    rushName: string = '';

    @property({ displayName: '시작할 러쉬 이름 2', tooltip: '경로 중간에서 바로 등장시키는 1회성 인트로 러쉬처럼, 하나 더 내보낼 때 쓴다. 비워두면 없음' })
    rushExtraName: string = '';

    @property({ type: TriggerId, displayName: '함께 발화할 트리거 ID', tooltip: '이 순간에 맞춰 건물 트리거까지 발동시키고 싶을 때 지정한다(GameStartTrigger와 같은 방식으로 CoinEvents.SocketFilled를 emit). 필요 없으면 None으로 둔다 — 기본값' })
    triggerId: TriggerId = TriggerId.None;

    private _fired = false;
    private _origin = new Vec3();
    private _hasOrigin = false;

    start() {
        this._captureOrigin();
    }

    private _captureOrigin() {
        if (!this.playerNode) return;
        Vec3.copy(this._origin, this.playerNode.worldPosition);
        this._hasOrigin = true;
    }

    update() {
        if (this._fired || !this.playerNode) return;
        // start()보다 늦게 배치/이동되는 경우를 대비해 기준점이 없으면 여기서 잡는다.
        if (!this._hasOrigin) { this._captureOrigin(); return; }

        const p = this.playerNode.worldPosition;
        const dx = p.x - this._origin.x;
        const dz = p.z - this._origin.z;
        if (dx * dx + dz * dz < this.moveThreshold * this.moveThreshold) return;

        this._fired = true;
        this.enabled = false;   // 한 번만 — 이후 매 프레임 검사 비용도 없앤다
        if (this.startDelay > 0) this.scheduleOnce(() => this._fire(), this.startDelay);
        else this._fire();
    }

    private _fire() {
        const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner) ?? null;
        if (this.rushName) spawner?.startRushByName(this.rushName);
        if (this.rushExtraName) spawner?.startRushByName(this.rushExtraName);
        if (this.triggerId !== TriggerId.None) {
            CoinEvents.emit(CoinEventName.SocketFilled, this.triggerId);
        }
    }
}
