import { _decorator, Component, Node, CCFloat } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { MonsterSpawner } from './MonsterSpawner';
const { ccclass, property } = _decorator;

/**
 * 게임이 시작될 때 트리거 하나를 발화시키는 것만 담당하는 컴포넌트.
 *
 * 이게 필요한 이유: 원래 "다음 단계 해금" 신호(CoinEvents.BuildingSocketsUnlocked)를 발화하는
 * 곳이 UnitSocketManager 단 하나였다. 그래서 유닛 생산 소켓이 없는 씬에서는 건물 소켓이
 * 영원히 등장하지 않았다. 진행 시작 책임을 유닛 소켓 시스템 밖으로 떼어내서, 어떤 씬이든
 * "무엇으로 시작하는지"를 이 컴포넌트 하나로 정할 수 있게 한다.
 *
 * 발화 방식은 소켓이 충족될 때와 완전히 동일하다(CoinEvents.SocketFilled에 트리거 ID를 실어
 * 보냄) — 그래서 이 트리거에 반응하는 쪽도 똑같다:
 *  - SocketManager.unlockTriggerId 를 같은 값으로 두면 그때부터 소켓이 등장하기 시작한다
 *  - BuildingTrigger.triggerId 를 같은 값으로 두면 게임 시작과 동시에 지어지는 건물이 된다
 *  - BossRushManager의 보스 러쉬 목록에 같은 값을 등록하면 시작과 동시에 러쉬가 나간다
 */
@ccclass('GameStartTrigger')
export class GameStartTrigger extends Component {
    @property({ type: TriggerId, displayName: '발화할 트리거 ID', tooltip: '게임 시작 시 딱 한 번 발화시킬 트리거. 소켓이 쓰는 번호(1~12)와 겹치지 않게 GameStart(100)를 쓰는 것이 기본이다' })
    triggerId: TriggerId = TriggerId.GameStart;

    @property({ type: CCFloat, displayName: '발화 지연(초)', tooltip: '씬이 시작된 뒤 이만큼 기다렸다가 발화한다. 0이어도 모든 컴포넌트의 start()가 끝난 다음 프레임에 발화하므로 신호를 놓치지 않는다' })
    startDelay: number = 0;

    @property({ type: Node, displayName: '몬스터 스포너 노드', tooltip: '아래 러쉬 이름을 쓸 때만 필요. 비워두면 러쉬를 시작시키지 않는다' })
    monsterSpawnerNode: Node | null = null;

    @property({ displayName: '함께 시작할 러쉬 이름', tooltip: '발화와 동시에 시작할 MonsterSpawner.rushes(또는 간격 반복 사이클)의 이름. 비워두면 없음' })
    rushName: string = '';

    @property({ displayName: '함께 시작할 러쉬 이름 2', tooltip: '경로 중간에서 바로 등장시키는 1회성 인트로 러쉬처럼, 시작과 동시에 하나 더 내보낼 때 쓴다. 비워두면 없음' })
    rushExtraName: string = '';

    private _fired = false;

    start() {
        // 지연이 0이어도 반드시 한 프레임 미룬다 — 컴포넌트 start() 실행 순서는 보장되지
        // 않으므로, 같은 프레임에 발화하면 SocketManager.start()가 아직 이벤트를 구독하지
        // 않은 상태일 수 있고 그러면 신호가 조용히 사라진다.
        this.scheduleOnce(() => this._fire(), Math.max(0, this.startDelay));
    }

    private _fire() {
        if (this._fired) return;
        if (this.triggerId === TriggerId.None) return;
        this._fired = true;

        const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner);
        if (this.rushName) spawner?.startRushByName(this.rushName);
        if (this.rushExtraName) spawner?.startRushByName(this.rushExtraName);

        CoinEvents.emit(CoinEventName.SocketFilled, this.triggerId);
    }
}
