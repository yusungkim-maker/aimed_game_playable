import { _decorator, Component, Node } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { MonsterSpawner } from './MonsterSpawner';
const { ccclass, property } = _decorator;

/** 특정 건물 트리거 ID가 발동하면 시작할 보스 러쉬 1건 */
@ccclass('BossRushEntry')
export class BossRushEntry {
    @property({ type: TriggerId, displayName: '반응할 건물 트리거 ID', tooltip: '소켓 목록에서 이 트리거 ID를 가진 건물 소켓이 요구치를 채우는 순간 아래 러쉬를 시작한다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ displayName: '시작할 보스 러쉬 이름', tooltip: 'MonsterSpawner.rushes 목록에 등록된 RushConfig의 이름과 정확히 같아야 한다 (보스 프리팹/경로/스탯은 그쪽에서 구성)' })
    rushName: string = '';
}

/**
 * 잡몹 러쉬(UnitSocketManager가 트리거하는 Rush_1 등)와 완전히 별개로, 건물 건축 소켓이
 * 특정 트리거 ID까지 채워질 때마다 보스 러쉬를 시작시키는 전용 컨트롤러.
 *
 * 새 스폰/이동 로직을 직접 만들지 않는다 — CoinEvents.SocketFilled(BuildingTrigger.ts가
 * 반응하는 것과 같은 이벤트)를 구독하기만 하고, 실제 스폰은 기존 MonsterSpawner.startRushByName()에
 * 위임한다. 보스 프리팹/전용 러쉬 경로/스탯 등은 MonsterSpawner의 "러쉬 목록"(rushes)에
 * 이 컴포넌트가 참조하는 것과 같은 이름의 RushConfig로 직접 구성하면 된다 — 러쉬 경로는
 * 기존 RushPath(Path_1~6)를 그대로 재사용할 수 있다.
 */
@ccclass('BossRushManager')
export class BossRushManager extends Component {
    @property({ type: [BossRushEntry], displayName: '보스 러쉬 목록', tooltip: '건물 트리거 ID별로 시작할 보스/몬스터 러쉬 이름을 등록. 같은 트리거 ID로 여러 개를 등록하면(예: 보스 등장 + 새 몬스터 티어 시작) 그 트리거가 발동할 때 전부 함께 시작된다. 같은 트리거는 한 번만 발동한다' })
    entries: BossRushEntry[] = [];

    @property({ displayName: '유닛 소켓 마일스톤 러쉬 목록', tooltip: 'UnitSocketManager가 CoinEvents.BuildingSocketsUnlocked를 딱 한 번 emit할 때(유닛 생산 소켓을 지정 개수만큼 완료) 함께 시작할 러쉬 이름들. 여러 개면 전부 동시에 시작된다' })
    unitMilestoneRushNames: string[] = [];

    @property({ type: Node, displayName: '몬스터 스포너 노드' })
    monsterSpawnerNode: Node | null = null;

    private _spawner: MonsterSpawner | null = null;
    private _firedTriggerIds = new Set<TriggerId>();
    private _unitMilestoneFired = false;

    onLoad() {
        this._spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner) ?? null;
        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        CoinEvents.on(CoinEventName.BuildingSocketsUnlocked, this._onUnitMilestone, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
        CoinEvents.off(CoinEventName.BuildingSocketsUnlocked, this._onUnitMilestone, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._firedTriggerIds.has(triggerId)) return;
        const matches = this.entries.filter(e => e.triggerId === triggerId && e.rushName);
        if (matches.length === 0) return;
        this._firedTriggerIds.add(triggerId);
        for (const entry of matches) this._spawner?.startRushByName(entry.rushName);
    }

    private _onUnitMilestone() {
        if (this._unitMilestoneFired) return;
        this._unitMilestoneFired = true;
        for (const name of this.unitMilestoneRushNames) {
            if (name) this._spawner?.startRushByName(name);
        }
    }
}
