import { _decorator, Component, Prefab, instantiate, Node, CCFloat, CCString, MeshRenderer } from 'cc';
import { Monster } from './Monster';
import { RushPath } from './RushPath';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { MonsterHealthBar } from './MonsterHealthBar';
const { ccclass, property } = _decorator;

/** 한 방향에서 오는 몬스터 그룹 하나의 스폰 설정 */
@ccclass('RushGroup')
export class RushGroup {
    @property({ type: Prefab, displayName: '프리팹', tooltip: '스폰할 몬스터 프리팹' })
    prefab: Prefab | null = null;

    @property({ type: RushPath, displayName: '러쉬 경로', tooltip: '이 그룹이 따라갈 방향별 웨이포인트 경로' })
    path: RushPath | null = null;

    @property({ displayName: '몬스터 수', tooltip: '이 그룹에서 스폰할 총 마리수' })
    count: number = 10;

    @property({ displayName: '스폰 간격(초)', tooltip: '몬스터 한 마리씩 나오는 간격' })
    spawnInterval: number = 0.5;

    @property({ displayName: 'HP', tooltip: '몬스터 최대 체력' })
    hp: number = 3;

    @property({ displayName: '이동 속도', tooltip: '몬스터 이동 속도' })
    moveSpeed: number = 1.5;

    @property({ displayName: '공격력', tooltip: '기지에 주는 데미지' })
    attackDamage: number = 1;

    @property({ displayName: '공격 간격(초)', tooltip: '공격 쿨타임' })
    attackInterval: number = 1.5;

    @property({ displayName: '처치 점수', tooltip: '처치 시 획득 점수' })
    scoreValue: number = 10;

    @property({ displayName: '드롭 코인 수', tooltip: '처치 시 드롭할 코인 개수 (일반 몬스터 1, 보스는 크게)' })
    coinDrop: number = 1;

    @property({ displayName: '크기 배율', tooltip: '스폰 시 몬스터 노드에 적용할 스케일 (기존 일반 몬스터는 0.5로 스폰되던 걸 그대로 필드로 뺀 것 — 보스처럼 더 크게 만들고 싶을 때 조정)' })
    scale: number = 0.5;

    @property({ displayName: '보스', tooltip: '체크하면 이 그룹의 몬스터는 체력바가 3배 크기로 표시된다' })
    isBoss: boolean = false;

    @property({ displayName: '시작 앵커 인덱스', tooltip: '보통은 0(경로의 첫 앵커=스폰 지점)에서 시작하지만, 이미 진행 중인 지점부터 시작시키고 싶을 때(예: 게임 시작 직후 첫 러쉬가 도착하기까지의 텀을 줄이는 1회성 그룹) 앵커 인덱스를 지정한다 — 예: 2 = Anchor2 지점부터 시작. RushPath는 앵커 사이를 곡선으로 잘게 샘플링하므로, 실제로는 그 앵커에 해당하는 샘플 지점부터 시작한다' })
    startWaypointIndex: number = 0;
}

/** 트리거로 시작되는 러쉬 하나. 여러 방향의 RushGroup을 동시에 시작시킨다 */
@ccclass('RushConfig')
export class RushConfig {
    @property({ displayName: '러쉬 이름', tooltip: '트리거에서 startRushByName()으로 지정할 이름' })
    rushName: string = '';

    @property({ type: [RushGroup], displayName: '방향별 그룹', tooltip: '이 러쉬가 시작될 때 동시에 스폰될 그룹들 (방향별로 하나씩)' })
    groups: RushGroup[] = [];

    @property({ displayName: '다음 러쉬', tooltip: '이 러쉬의 몬스터가 전부 죽으면 자동으로 시작할 러쉬 이름. 비워두면 자동 시작 없음. RushCycle에 속한 러쉬는 이 필드를 쓰지 않는다(간격 타이머가 대신 진행을 맡음)' })
    nextRushName: string = '';
}

/** 여러 RushConfig를 몬스터가 죽기를 기다리지 않고 고정 간격으로 라운드로빈 순서로 계속 시작시키는 반복 사이클.
 * firstRushName/unitMilestoneRushNames/BossRushEntry 등 기존의 "이름으로 러쉬 시작" 지점에서 이 cycleName을
 * 그대로 지정하면 된다 — startRushByName()이 rushCycles를 먼저 찾아보고, 있으면 사이클로 시작한다. */
@ccclass('RushCycle')
export class RushCycle {
    @property({ displayName: '사이클 이름', tooltip: '외부에서 startRushByName()으로 이 이름을 호출하면 사이클이 시작된다' })
    cycleName: string = '';

    @property({ type: [CCString], displayName: '번갈아 나올 러쉬 이름들', tooltip: '러쉬 목록(rushes)에 등록된 RushConfig 이름들. 이 순서대로 라운드로빈으로 반복 시작된다 (각 러쉬 자신의 nextRushName은 무시됨)' })
    rushNames: string[] = [];

    @property({ displayName: '시작 간격(초)', tooltip: '한 러쉬를 시작한 뒤 다음 러쉬를 시작하기까지의 간격. 이전 러쉬의 몬스터가 아직 살아있어도 상관없이 이 간격마다 계속 새 러쉬를 시작한다. 사이클 시작 즉시 첫 러쉬가 나가고, 그 뒤로 이 간격마다 다음 러쉬가 나간다' })
    interval: number = 2;
}

@ccclass('MonsterSpawner')
export class MonsterSpawner extends Component {
    @property({ type: Node, displayName: '기지(집) 노드', tooltip: '몬스터가 최종적으로 공격할 대상. 집 에셋을 배치한 뒤 연결' })
    baseNode: Node | null = null;

    @property({ type: [RushConfig], displayName: '러쉬 목록', tooltip: '트리거가 이름/인덱스로 시작시킬 러쉬들을 미리 등록' })
    rushes: RushConfig[] = [];

    @property({ type: [RushCycle], displayName: '간격 반복 사이클 목록', tooltip: '몬스터가 다 죽기를 기다리지 않고 고정 간격으로 번갈아 나오는 러쉬 묶음들' })
    rushCycles: RushCycle[] = [];

    @property({ displayName: '동시 최대 몬스터 수', tooltip: '살아있는 몬스터가 이 수를 넘으면 새 스폰을 잠깐 멈춘다(자리가 나면 바로 이어서 스폰) — 여러 러쉬/서지가 동시에 겹쳐도 화면의 몬스터 수가 일정 수준 이상으로 폭증하지 않게 막아주는 안전장치' })
    maxActiveMonsters: number = 40;

    @property({ displayName: '몬스터 그림자 켜기', tooltip: '스폰한 몬스터가 그림자를 드리우게 한다. 몬스터 프리팹은 glb에서 자동 생성된 것이라 에디터에서 직접 고칠 수 없어서(그림자 끄기가 기본값), 스폰 시점에 코드로 켠다. 씬의 방향광(Directional Light)과 Shadows가 켜져 있어야 실제로 보인다. 동시 생존 몬스터가 많으면 그림자 맵 렌더 비용이 늘어나므로, 무거우면 여기서 끈다' })
    monsterCastShadow: boolean = true;

    // ── 겹침 방지 (전부 스폰 시 1회 계산 — 매 프레임 연산이 늘지 않는다) ──────────
    @property({ type: CCFloat, displayName: '경로 분산 폭(m)', tooltip: '몬스터가 경로 중심선에서 좌우로 최대 이만큼 비켜서 걷는다. 0이면 예전처럼 한 줄로 걸어 겹쳐 보인다. 너무 키우면 문 옆 벽에 걸리므로 문 통로 폭의 절반 정도까지만' })
    laneWidth: number = 0.8;

    @property({ type: CCFloat, displayName: '경로 끝 분산 축소', tooltip: '경로 마지막 지점에서의 분산 배율. 문처럼 좁은 통로가 경로 끝에 있으면 넓게 벌어진 채로 들어가다 벽에 걸리므로, 끝으로 갈수록 다시 좁혀준다 (1이면 끝까지 그대로)', range: [0, 1], slide: true })
    laneTaper: number = 0.4;

    @property({ type: CCFloat, displayName: '이동속도 편차', tooltip: '몬스터마다 이동 속도를 ±이 비율만큼 흩는다. 속도가 똑같으면 한 번 뭉친 무리는 계속 겹쳐 다니므로, 조금만 줘도 저절로 줄이 늘어진다 (0.12 = ±12%)', range: [0, 0.5], slide: true })
    speedJitter: number = 0.12;

    @property({ type: CCFloat, displayName: '공격 거리 편차', tooltip: '기지/문 앞에 멈춰 서는 거리를 몬스터마다 0~이 비율만큼 더 멀게 흩는다. 다 같은 거리에서 멈추면 한 원 위에 포개져 한 마리처럼 보인다 (커지기만 하고 가까워지진 않으므로 기지 안으로 파고들지 않는다)', range: [0, 1], slide: true })
    attackRangeJitter: number = 0.35;

    /** 황금비 저불일치 수열 커서 — 연속 스폰이 한쪽으로 몰리지 않게 레인을 고르게 분배한다 */
    private _laneSeq = 0;

    private _activeMonsters: Monster[] = [];
    private _running: { rush: RushConfig; group: RushGroup; spawned: number; timer: number }[] = [];
    private _rushState = new Map<RushConfig, { groupsRemaining: number; monstersAlive: number }>();
    private _activeCycles: { cycle: RushCycle; idx: number; timer: number }[] = [];

    get activeMonsters(): readonly Monster[] { return this._activeMonsters; }
    /** 아직 스폰 중인(진행 중인) 러쉬 그룹이 남아있는지 */
    get isSpawning(): boolean { return this._running.length > 0; }

    update(dt: number) {
        for (const c of this._activeCycles) {
            c.timer -= dt;
            if (c.timer <= 0) {
                c.timer += c.cycle.interval;
                const name = c.cycle.rushNames[c.idx];
                c.idx = (c.idx + 1) % c.cycle.rushNames.length;
                const rush = this.rushes.find(r => r.rushName === name);
                if (rush) this.startRush(rush);
                else console.warn(`[MonsterSpawner] cycle rush not found: ${name}`);
            }
        }

        for (let i = this._running.length - 1; i >= 0; i--) {
            const r = this._running[i];
            r.timer += dt;
            if (r.timer >= r.group.spawnInterval) {
                // 동시 생존 몬스터 수가 상한을 넘으면 이번 틱은 스폰을 건너뛴다 — 타이머는 그대로 넘친 채
                // 쌓여있으니 자리가 나는 즉시(다음 프레임) 바로 이어서 스폰된다. 여러 러쉬/서지가 겹쳐
                // 한꺼번에 수백 마리가 몰려서 렉이 나는 걸 막는 안전장치.
                if (this._activeMonsters.length >= this.maxActiveMonsters) continue;
                r.timer = 0;
                this._spawnMonster(r.group, r.rush);
                r.spawned++;
                if (r.spawned >= r.group.count) {
                    this._running.splice(i, 1);
                    this._onGroupSpawnDone(r.rush);
                }
            }
        }
    }

    /** 모든 진행 중인 스폰(러쉬/간격 반복 사이클)을 즉시 중단하고, 화면에 남아있는 몬스터를
     * 코인 드롭 없이 전부 사라지게 한다 — 정상 사망 시 거치는 onDied 콜백(코인 이벤트 emit
     * 포함)을 건너뛰고 직접 정리한다. 건물 소켓을 전부 지어 최종 보스 웨이브 후 CTA가 뜨는
     * 순간처럼, 게임을 종료 연출로 넘어갈 때 호출한다. */
    stopAndClearAll() {
        this.stopSpawning();
        for (const m of this._activeMonsters) {
            if (m.node.isValid) m.despawnSilently();
        }
        this._activeMonsters = [];
    }

    /** 새 몬스터 스폰만 멈추고, 이미 나와있는 몬스터는 그대로 둔다.
     * 엔딩 연출처럼 "더 나오지는 않되 남은 것들은 순서대로 처치"해야 할 때 쓴다. */
    stopSpawning() {
        this._running = [];
        this._activeCycles = [];
        this._rushState.clear();
    }

    /** 외부 트리거가 이름으로 러쉬(또는 간격 반복 사이클)를 시작시킬 때 호출 */
    startRushByName(name: string) {
        const cycle = this.rushCycles.find(c => c.cycleName === name);
        if (cycle) { this._startCycle(cycle); return; }

        const rush = this.rushes.find(r => r.rushName === name);
        if (rush) this.startRush(rush);
        else console.warn(`[MonsterSpawner] rush not found: ${name}`);
    }

    private _startCycle(cycle: RushCycle) {
        if (cycle.rushNames.length === 0) return;
        if (this._activeCycles.some(c => c.cycle === cycle)) return;
        this._activeCycles.push({ cycle, idx: 0, timer: 0 });
    }

    /** 외부 트리거가 인덱스로 러쉬를 시작시킬 때 호출 */
    startRushByIndex(idx: number) {
        if (idx >= 0 && idx < this.rushes.length) this.startRush(this.rushes[idx]);
    }

    startRush(rush: RushConfig) {
        const validGroups = rush.groups.filter(g => g.prefab && g.path && g.path.waypoints.length > 0);
        if (validGroups.length === 0) return;

        this._rushState.set(rush, { groupsRemaining: validGroups.length, monstersAlive: 0 });
        for (const g of validGroups) {
            this._running.push({ rush, group: g, spawned: 0, timer: g.spawnInterval });
        }
    }

    private _onGroupSpawnDone(rush: RushConfig) {
        const st = this._rushState.get(rush);
        if (!st) return;
        st.groupsRemaining--;
        this._checkRushCleared(rush, st);
    }

    private _checkRushCleared(rush: RushConfig, st: { groupsRemaining: number; monstersAlive: number }) {
        if (st.groupsRemaining > 0 || st.monstersAlive > 0) return;
        this._rushState.delete(rush);
        if (rush.nextRushName) this.startRushByName(rush.nextRushName);
    }

    private _spawnMonster(g: RushGroup, rush: RushConfig) {
        if (!g.prefab || !this.baseNode || !g.path) return;

        const allWaypoints = g.path.waypoints;
        if (allWaypoints.length === 0) return;
        // RushPath.waypoints는 앵커 i가 정확히 i*samplesPerSegment번째 자리에 오도록
        // 샘플링되어 있다 — "앵커 인덱스"를 그 규칙으로 실제 배열 인덱스로 변환한다.
        const startAnchorIdx = Math.max(g.startWaypointIndex, 0) * g.path.samplesPerSegment;
        const startIdx = Math.min(startAnchorIdx, allWaypoints.length - 1);
        const waypoints = allWaypoints.slice(startIdx);

        const monster = instantiate(g.prefab);
        this.node.addChild(monster);
        // SkinnedMeshRenderer는 MeshRenderer를 상속하므로 이 한 번의 탐색으로 스킨/일반 메쉬를
        // 모두 잡는다. 그림자 "받기"는 프리팹 기본값이 이미 켜져 있어 건드리지 않는다.
        if (this.monsterCastShadow) {
            for (const r of monster.getComponentsInChildren(MeshRenderer)) {
                r.shadowCastingMode = MeshRenderer.ShadowCastingMode.ON;
            }
        }
        monster.setScale(g.scale, g.scale, g.scale);
        monster.setWorldPosition(waypoints[0]);

        const mc = monster.addComponent(Monster);
        mc.maxHp          = g.hp;
        mc.attackDamage   = g.attackDamage;
        mc.attackInterval = g.attackInterval;
        mc.scoreValue     = g.scoreValue;
        mc.coinDrop       = g.coinDrop;
        mc.isBoss         = g.isBoss;

        // ── 겹쳐 보이지 않게 하는 개체별 편차 (전부 스폰 시 1회, 실행 중 추가 비용 없음) ──
        // 같은 속도로 같은 선을 걸으면 한 번 뭉친 무리는 영원히 겹쳐 있으므로 속도를 흩고,
        // 도착 거리를 흩어서 기지/문 앞에서 한 점에 포개지지 않게 한다.
        mc.moveSpeed   = g.moveSpeed * (1 + (Math.random() * 2 - 1) * this.speedJitter);
        mc.attackRange = mc.attackRange * (1 + Math.random() * this.attackRangeJitter);

        const hb = monster.addComponent(MonsterHealthBar);
        hb.isBoss = g.isBoss;
        mc.healthBar = hb;

        // 경로 좌우로 흩어 걷게 한다. 난수 대신 황금비 저불일치 수열을 써서, 연속으로 스폰된
        // 몬스터들이 우연히 같은 쪽으로 몰리는 일 없이 -1~1 구간에 고르게 퍼지도록 한다.
        this._laneSeq = (this._laneSeq + 0.6180339887) % 1;
        const lane = this._laneSeq * 2 - 1;
        mc.setPath(waypoints, this.baseNode, lane, this.laneWidth, this.laneTaper);

        this._activeMonsters.push(mc);
        const st = this._rushState.get(rush);
        if (st) st.monstersAlive++;

        mc.setOnDied(() => {
            const i = this._activeMonsters.indexOf(mc);
            if (i >= 0) this._activeMonsters.splice(i, 1);

            // 코인 경제 시스템 훅 — 원본 Monster.ts 로직은 건드리지 않고 이벤트만 emit.
            // lastHitSource: 타워가 죽였으면 그 타워 노드, 플레이어가 죽였으면 null —
            // CoinSpawnController가 이 값으로 코인을 플레이어 등 뒤 대신 coin_ground로 보낼지 결정한다.
            CoinEvents.emit(CoinEventName.MonsterKilled, mc.node.worldPosition.clone(), mc.coinDrop, mc.lastHitSource);

            const st2 = this._rushState.get(rush);
            if (st2) {
                st2.monstersAlive--;
                this._checkRushCleared(rush, st2);
            }
        });
    }
}
