import { Enum } from 'cc';

/** 소켓 충족으로 발동되는 "건물 건설 트리거" 식별자. 소켓 목록에서 소켓마다 하나씩 골라
 * 두면, 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 값을 가진 것이 반응한다. 소켓과
 * 건물은 서로를 직접 참조하지 않고 이 값(과 CoinEvents.SocketFilled 이벤트)으로만 연결된다. */
export enum TriggerId {
    None = 0,
    Trigger1 = 1,
    Trigger2 = 2,
    Trigger3 = 3,
    Trigger4 = 4,
    Trigger5 = 5,
    Trigger6 = 6,
}
Enum(TriggerId);
