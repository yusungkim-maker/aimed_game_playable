System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, EventTarget, _crd, CoinEvents, CoinEventName;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      EventTarget = _cc.EventTarget;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7536d0unptJ2YAtRI7jlre0", "CoinEvents", undefined);

      /**
       * 코인 경제 시스템 전역 이벤트 버스. 몬스터 처치 → 코인 스폰 → 수집 → 스택의 각 단계를
       * 이 버스로만 느슨하게 연결한다 (단계별 컴포넌트가 서로를 직접 참조하지 않는다).
       */
      __checkObsolete__(['EventTarget']);

      _export("CoinEvents", CoinEvents = new EventTarget());
      /** 이벤트 이름 상수. 페이로드는 각 항목의 주석 참고. */


      _export("CoinEventName", CoinEventName = {
        /** payload: (pos: Vec3, coinDrop: number, source: Node | null) — 몬스터 사망 지점, 드롭할
         * 코인 개수(Monster.coinDrop, RushGroup에서 몬스터별로 설정 — 보스는 여러 개, 잡몹은 기본 1개),
         * 그리고 마지막으로 이 몬스터를 맞춘 발사체의 출처(Monster.lastHitSource — 타워가 죽였으면
         * 그 타워 노드, 플레이어가 죽였으면 null). MonsterSpawner의 기존 onDied 콜백에서 emit
         * (Monster.ts 원본은 미수정). CoinSpawnController가 source로 코인을 플레이어 등 뒤 대신
         * coin_ground(CoinGroundStack)로 보낼지 결정한다. */
        MonsterKilled: 'coin-economy:monster-killed',

        /** payload: (coin: Coin) — 코인 1개가 스폰되어 자석 추적을 시작함 */
        CoinSpawned: 'coin-economy:coin-spawned',

        /** payload: (coin: Coin) — 코인이 캐릭터에게 도달해 수집됨 (드롭 코인은 이 시점에 풀로 반환) */
        CoinCollected: 'coin-economy:coin-collected',

        /** payload: (count: number) — 등에 쌓인 코인 스택 개수 변경 */
        StackChanged: 'coin-economy:stack-changed',
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
        AllBuildingSocketsCompleted: 'coin-economy:all-building-sockets-completed'
      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=46df8d9ff07b94e47d99a1626fa0659a524480c7.js.map