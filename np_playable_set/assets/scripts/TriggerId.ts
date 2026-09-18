import { Enum } from 'cc';

/** 소켓 충족으로 발동되는 "건물 건설 트리거" 식별자. 소켓 목록에서 소켓마다 하나씩 골라
 * 두면, 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 값을 가진 것이 반응한다. 소켓과
 * 건물은 서로를 직접 참조하지 않고 이 값(과 CoinEvents.SocketFilled 이벤트)으로만 연결된다.
 *
 * 이름을 일부러 의미 없는 TriggerN으로 둔다 — 이 스크립트는 여러 씬이 공유하고,
 * "몇 번이 무엇을 짓는가"는 씬마다 다른 데이터이기 때문이다. 어떤 씬에서 어느 번호가
 * 무엇을 뜻하는지는 씬 쪽 문서/인스펙터에 남긴다.
 *
 * 1~16은 소켓 충족 신호용, 100번대는 소켓과 무관하게 게임 진행 자체에서 나오는
 * "플로우 트리거"용으로 구간을 나눠 쓴다. */
export enum TriggerId {
    None = 0,
    Trigger1 = 1,
    Trigger2 = 2,
    Trigger3 = 3,
    Trigger4 = 4,
    Trigger5 = 5,
    Trigger6 = 6,
    Trigger7 = 7,
    Trigger8 = 8,
    Trigger9 = 9,
    Trigger10 = 10,
    Trigger11 = 11,
    Trigger12 = 12,
    Trigger13 = 13,
    Trigger14 = 14,
    Trigger15 = 15,
    Trigger16 = 16,

    /** 플레이어가 **철을 처음 수집**하는 순간 발화한다(씬 3). 대장간 건설 소켓을 여는 신호다 —
     * 소켓이 채워져서 나오는 신호가 아니라 "자원을 처음 먹었다"는 게임 진행 사실에서 나온다.
     * 그래서 SocketManager.sockets가 아니라 CoinStack 쪽에서 emit된다. */
    FirstIron = 101,

    /** 플레이어가 **코인을 처음 수집**하는 순간 발화한다(씬 3). 레일 해금 소켓 2개를 여는 신호.
     * 씬 3에서 코인은 손님이 칼을 사고 지불할 때만 생기므로, 이 트리거는 상점이 돌기 시작한
     * 뒤에야 나온다. */
    FirstCoin = 102,

    /** 레일 2개가 모두 해금되어 **게임이 끝나는** 순간 발화한다(씬 3). 종료 연출/CTA가 반응한다. */
    GameClear = 103,

    /** 게임 시작 시 딱 한 번 발화하는 플로우 트리거. GameStartTrigger 컴포넌트가 emit하고,
     * SocketManager가 "소켓 스폰 시작 트리거 ID"로 이 값을 지정하면 그때부터 첫 소켓이
     * 등장한다. BuildingTrigger에 이 값을 넣으면 게임 시작과 동시에 지어지는 건물이 된다. */
    GameStart = 100,
}
Enum(TriggerId);
