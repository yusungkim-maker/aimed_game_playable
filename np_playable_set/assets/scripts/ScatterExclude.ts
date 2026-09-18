import { _decorator, CCFloat, Component } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * "이 오브젝트가 숲을 밀어내는 범위"를 개체마다 직접 지정하는 표식.
 *
 * `ScatterField`는 기본적으로 메시의 AABB를 재서 그만큼 비우는데, 그 값이 눈에 보이는 것과
 * 어긋나는 경우가 있다 — 대표적으로 **2D 카드**다. `plane2x2_ground`는 바닥에 깔린 판이
 * 로컬 Z로 2.828을 차지해서, 45도로 선 건물 그림이 아무리 얇아 보여도 AABB는 그 바닥 판까지
 * 전부 감싼다(스케일 2.387을 곱하면 6.75). 그래서 "보이는 것보다 넓게 비워진다"고 느껴진다.
 *
 * 이 컴포넌트를 붙이면 **측정을 건너뛰고 여기 적은 사각형을 그대로 쓴다.** 붙이지 않은
 * 오브젝트는 예전처럼 AABB로 측정되므로, 필요한 것에만 골라 붙이면 된다.
 *
 * **붙이는 위치는 두 가지다.**
 *  (1) `ScatterField.제외 기준 노드`의 **직계 자식** — 기존 방식. 더 깊은 곳에 붙이면 못 찾는다.
 *  (2) 씬 어디든 — `ScatterField.제외를 씬 전체에서 수집`을 켜면 계층과 무관하게 전부 걸린다.
 *      건물이 여러 부모에 흩어져 있을 때 이쪽이 편하다(계층을 옮기지 않아도 된다).
 *
 * (2)를 위해 활성화된 인스턴스를 static 목록으로 들고 있다 — `VirtualWall.all`, `Choppable.all`과
 * 같은 방식이다. `@executeInEditMode`가 필요한 이유는 **에디터에서도 이 목록이 채워져야**
 * 건물을 옮기는 즉시 숲이 다시 흐르기 때문이다(런타임에만 채우면 에디터에서는 제외가 통째로
 * 사라져 보인다).
 */
@ccclass('ScatterExclude')
@executeInEditMode
export class ScatterExclude extends Component {
    /** 지금 활성화된 모든 제외 표식. 씬 전체 수집 모드의 ScatterField가 이것을 훑는다. */
    static all: ScatterExclude[] = [];

    onEnable() {
        if (!ScatterExclude.all.includes(this)) ScatterExclude.all.push(this);
    }

    onDisable() {
        const i = ScatterExclude.all.indexOf(this);
        if (i >= 0) ScatterExclude.all.splice(i, 1);
    }

    @property({ displayName: '제외 끄기', tooltip: '체크하면 이 오브젝트는 숲을 전혀 밀어내지 않는다. 제외 기준 노드 아래에 두고 싶지만 나무가 주변에 자라도 괜찮은 장식물에 쓴다' })
    disabled: boolean = false;

    @property({ type: CCFloat, displayName: '가로 반경(m)', tooltip: '이 노드의 중심에서 X 방향으로 비울 거리. 전체 폭이 아니라 **반쪽**이다 — 2를 넣으면 가로 4m가 비워진다' })
    halfX: number = 2;

    @property({ type: CCFloat, displayName: '세로 반경(m)', tooltip: '이 노드의 중심에서 Z 방향으로 비울 거리(반쪽). 카메라가 45도로 내려보므로 화면에서는 세로가 눌려 보인다 — 눈으로 맞추지 말고 위에서 내려다본 실제 바닥 크기로 정하는 편이 정확하다' })
    halfZ: number = 2;

    @property({ type: CCFloat, displayName: '중심 오프셋 X(m)', tooltip: '비울 사각형의 중심을 노드 피벗에서 이만큼 옮긴다. 피벗이 오브젝트 한쪽 끝에 있을 때 쓴다' })
    offsetX: number = 0;

    @property({ type: CCFloat, displayName: '중심 오프셋 Z(m)', tooltip: '비울 사각형의 중심을 노드 피벗에서 Z로 이만큼 옮긴다' })
    offsetZ: number = 0;

    @property({ displayName: '안쪽 모드에서도 비운다', tooltip: '끄면(기본) 이 사각형은 **영역을 정의**한다 — 바깥에 까는 필드는 여기를 피하고, "영역 안쪽에만 깔기"를 켠 필드는 반대로 여기에만 깐다. 켜면 **어느 쪽에서도 비운다** — 건물처럼 "무슨 일이 있어도 그 위에는 아무것도 없어야 하는" 것에 쓴다. 바닥 영역 안에 서 있는 건물이 대표적이다: 바닥은 끄고(영역), 그 위의 건물은 켜야(구멍) 건물만 비워진다' })
    alwaysExclude: boolean = false;
}
