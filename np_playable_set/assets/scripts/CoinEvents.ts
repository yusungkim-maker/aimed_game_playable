import { EventTarget } from 'cc';

/**
 * 코인 경제 시스템 전역 이벤트 버스. 몬스터 처치 → 코인 스폰 → 수집 → 스택의 각 단계를
 * 이 버스로만 느슨하게 연결한다 (단계별 컴포넌트가 서로를 직접 참조하지 않는다).
 */
export const CoinEvents = new EventTarget();

/** 이벤트 이름 상수. 페이로드는 각 항목의 주석 참고. */
export const CoinEventName = {
    /** payload: (pos: Vec3, coinDrop: number, source: Node | null) — 몬스터 사망 지점, 드롭할
     * 코인 개수(Monster.coinDrop, RushGroup에서 몬스터별로 설정 — 보스는 여러 개, 잡몹은 기본 1개),
     * 그리고 마지막으로 이 몬스터를 맞춘 발사체의 출처(Monster.lastHitSource — 타워가 죽였으면
     * 그 타워 노드, 플레이어가 죽였으면 null). MonsterSpawner의 기존 onDied 콜백에서 emit
     * (Monster.ts 원본은 미수정). CoinSpawnController가 source로 코인을 플레이어 등 뒤 대신
     * coin_ground(CoinGroundStack)로 보낼지 결정한다. */
    MonsterKilled: 'coin-economy:monster-killed',
    /** payload: (pos: Vec3, count: number, source: Node | null, type?: ResourceType) — 몬스터가 아닌 것이 자원을
     * 뱉었다. 페이로드는 MonsterKilled와 **정확히 같은 모양**이라 CoinSpawnController가 같은
     * 핸들러로 받는다 — 스폰·자석·등 뒤 스택·소켓 흡수 이후의 경로는 코인과 완전히 동일하고,
     * 다른 것은 "무엇이 뱉느냐"뿐이기 때문이다. 타이쿤 씬의 나무(Choppable)가 타격마다 emit한다.
     * 이름을 MonsterKilled로 재활용하지 않은 이유: 이벤트 이름이 인터페이스라서, 몬스터가 없는
     * 씬에서 "몬스터가 죽었다"는 신호가 날아다니면 다음 광고를 만드는 사람이 읽을 수 없다.
     *
     * **4번째 인자 `type`은 나중에 덧붙인 것이다.** 안 넘기면 받는 쪽이 `ResourceType.Coin`으로
     * 취급하므로, 자원 구분이 없던 시절의 emit(그리고 MonsterKilled 전부)이 그대로 동작한다.
     * 인자를 앞에 끼워넣지 말 것 — 두 이벤트가 같은 핸들러를 공유하는 전제가 깨진다. */
    ResourceDropped: 'coin-economy:resource-dropped',
    /** payload: (coin: Coin) — 코인 1개가 스폰되어 자석 추적을 시작함 */
    CoinSpawned: 'coin-economy:coin-spawned',
    /** payload: (coin: Coin) — 코인이 캐릭터에게 도달해 수집됨 (드롭 코인은 이 시점에 풀로 반환) */
    CoinCollected: 'coin-economy:coin-collected',
    /** payload: (count: number, stack: CoinStack, type?: ResourceType) — 등에 실린 자원 개수 변경.
     * `count`는 **종류를 가리지 않은 합계**다(예전 의미 그대로). 종류별 개수가 필요하면
     * 같이 온 `stack`에 `countOf(type)`을 물어본다 — 이벤트에 종류별 수를 실어 보내면
     * 구독자마다 관심 있는 종류가 달라 결국 다시 물어보게 된다. */
    StackChanged: 'coin-economy:stack-changed',
    /** payload: (coinCount: number) — 플레이어가 coin_ground(바닥 무더기) 흡수 반경에 들어와
     * 쌓여있던 코인이 등 뒤로 돌아오기 시작함. 코인이 한 개씩 날아가는 동안 매번이 아니라
     * "수거가 시작되는 순간" 딱 한 번만 emit되며, 그 시점에 남아있던 총 개수를 실어보낸다.
     * AudioManager가 이 개수에 비례해 수거음을 여러 겹으로 재생한다. */
    GroundStackCollectStarted: 'coin-economy:ground-stack-collect-started',

    // ── 미구현 스텁. 0단계 범위에서는 emit/on 어느 쪽도 구현하지 않는다.
    /** (미구현 스텁) 캐릭터가 소켓 유효 반경에 진입 */
    SocketReached: 'coin-economy:socket-reached',
    /** payload: (socket: Socket) — 소켓이 코인 한 개를 스택에서 흡수(도착 완료)함. Socket.ts가 매 코인 착지 시 emit */
    SocketAbsorbed: 'coin-economy:socket-absorbed',
    /** payload: (triggerId: TriggerId) — 소켓 목록에서 "건물 트리거"로 표시된 소켓이 요구치를
     * 다 채웠음. Socket.ts의 _completeFulfillment()에서 emit. BuildingTrigger.ts가 같은
     * triggerId를 가진 건물에서 이 이벤트를 구독해 건설 애니메이션을 재생한다. */
    SocketFilled: 'coin-economy:socket-filled',
    /** payload 없음 — UnitSocketManager의 유닛 생산 소켓이 지정된 개수만큼(기본 3개, 0~2번)
     * 순서대로 완료됐음. UnitSocketManager.ts가 딱 한 번만 emit한다. SocketManager.ts가 이
     * 이벤트를 구독해서 그때부터 건물 건축 소켓을 스폰하기 시작하고, BossRushManager.ts도
     * 구독해서 이 시점에 등록된 러쉬(추가 웨이브 단계 + 보스)를 시작시킨다. */
    BuildingSocketsUnlocked: 'coin-economy:building-sockets-unlocked',
    /** payload 없음 — SocketManager의 "소켓 목록"(건물 건축 소켓)을 마지막 하나까지 전부
     * 지었음. SocketManager.ts가 마지막 소켓이 완료되는 순간 딱 한 번 emit한다. GameManager.ts가
     * 구독해서 마지막 보스 웨이브를 띄우고 게임 종료(CTA) 시퀀스를 시작한다. */
    AllBuildingSocketsCompleted: 'coin-economy:all-building-sockets-completed',
} as const;
