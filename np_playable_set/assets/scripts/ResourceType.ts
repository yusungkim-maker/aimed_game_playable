import { Enum } from 'cc';

/**
 * 게임 안에서 오가는 자원의 종류. 코인 경제(스폰 → 자석 → 등 뒤 스택 → 소켓)를 타는
 * 모든 물건이 이 값 중 하나를 달고 다닌다.
 *
 * **`Coin = 0`인 것이 핵심이다.** 이 enum이 도입되기 전에 만들어진 씬·프리팹·호출부는
 * 이 값을 아예 갖고 있지 않으므로 전부 `undefined`거나 `0`으로 떨어진다. 그래서 씬 1·2는
 * 새 필드가 생긴 줄도 모르고 예전과 똑같이 "코인 한 종류"만 다루게 된다(절대 규칙 5).
 * 순서를 바꾸거나 0번 자리에 다른 값을 넣으면 그 보장이 깨진다.
 *
 * 타입을 늘릴 때는 **반드시 뒤에 덧붙인다.** 씬에 직렬화되는 것은 이름이 아니라 숫자다.
 */
export enum ResourceType {
    /** 재화. 씬 1·2의 유일한 자원이자 모든 기본값 */
    Coin = 0,
    /** 통나무 — 타이쿤 씬에서 나무를 베면 나온다 */
    Wood = 1,
    /** 철광석 — 타이쿤 씬에서 광산을 캐면 나온다 */
    Iron = 2,
    /** 칼 — 대장간이 나무와 철을 합성해 만든다. 상점에서 손님에게 팔린다 */
    Sword = 3,
}
Enum(ResourceType);

/** 인스펙터 툴팁에 쓰는 한글 이름. 로그·디버그 출력에도 쓴다 */
export const ResourceTypeName: Record<ResourceType, string> = {
    [ResourceType.Coin]: '코인',
    [ResourceType.Wood]: '나무',
    [ResourceType.Iron]: '철',
    [ResourceType.Sword]: '칼',
};
