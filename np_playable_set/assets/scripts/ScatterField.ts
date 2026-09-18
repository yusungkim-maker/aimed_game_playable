import { _decorator, CCFloat, CCInteger, CCObject, Component, MeshRenderer, Node, Prefab, Vec3, instantiate, tween } from 'cc';
import { EDITOR } from 'cc/env';
import { ScatterExclude } from './ScatterExclude';
import { Choppable } from './Choppable';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property, executeInEditMode, disallowMultiple } = _decorator;

const _local = new Vec3();
const _world = new Vec3();
const _corner = new Vec3();

/**
 * 프리팹 하나를 **자기 노드를 중심으로 바깥을 향해** 흩뿌린다. 나무 숲, 바위밭, 덤불 등
 * "같은 것이 여러 개 깔린 배경"을 씬에 손으로 박지 않고 숫자 몇 개로 만들기 위한 것이다.
 *
 * **왜 씬에 노드를 박지 않고 런타임에 만드는가**
 * 나무 110그루를 씬에 직접 배치했더니 씬 JSON이 100KB → 494KB(gzip 10KB → 32.5KB)가 됐다.
 * 메시·텍스처는 uuid로 공유되어 개수와 무관하지만 **좌표 데이터만은 개수에 비례**한다.
 * 이 컴포넌트는 숫자 몇 개만 씬에 저장하고 노드는 실행 시점에 만들므로 그 증가분이 0이 된다.
 * 대신 생성 비용이 로딩에 한 번 붙는데, 개수만큼의 `instantiate` 한 번이라 프레임에는 영향이 없다.
 *
 * **에디터에서도 보인다** — `@executeInEditMode`라 값을 바꾸는 즉시 다시 깔린다. 다만 생성된
 * 노드에는 `DontSave` 플래그를 찍어 **씬 파일에는 절대 들어가지 않는다**. 그래서 하이라키에
 * 보이는 개체를 지우거나 옮겨봐야 소용없고 **개별로 골라 값을 바꿀 수도 없다** — 배치를
 * 바꾸려면 이 컴포넌트의 숫자를 바꿔야 한다.
 *
 * **개체마다 다르게 굴려야 하는 것은 여기서 깔지 않는다.** 예를 들어 "다시 자라는 나무"와
 * "한 번 캐면 끝인 나무"를 섞고 싶다면, 이쪽은 숲(다시 자람)만 깔고 고정 나무는 씬에 손으로
 * 배치한 뒤 아래 `제외 기준 노드`로 그 자리를 비우게 한다 — 그러면 고정 오브젝트를 옮기거나
 * 크기를 바꿀 때마다 숲이 알아서 다시 흐른다.
 *
 * 🔴 **이 노드에 자식을 직접 두지 말 것.** 다시 깔 때 자식을 전부 지우고 새로 만든다(아래
 * `_clear`의 주석 참조). 손으로 배치하고 싶은 것은 다른 노드 밑에 둔다.
 *
 * 설정되지 않으면 무동작이다 — `프리팹`이 비었거나 `개수`가 0이면 아무것도 만들지 않는다.
 * 그래서 이 컴포넌트를 다른 씬에 통째로 가져다 놓아도 아무 일이 일어나지 않는다.
 */
@ccclass('ScatterField')
@executeInEditMode
@disallowMultiple
export class ScatterField extends Component {
    @property({ type: Prefab, displayName: '흩뿌릴 프리팹', tooltip: '이것을 개수만큼 복제해 깐다. 비워두면 아무것도 만들지 않는다(무동작). 나무라면 Choppable이 붙은 프리팹을 넣어야 벨 수 있다 — 벌목 설정(타격 횟수·드롭 개수·다시 자라기까지)은 여기가 아니라 그 프리팹에서 고치며, 그러면 깔린 전부에 한 번에 반영된다' })
    prefab: Prefab | null = null;

    @property({ type: CCInteger, displayName: '개수', tooltip: '몇 개를 깔지. 안쪽 링부터 차례로 채우므로 이 수를 늘리면 바깥으로 퍼지고, 줄이면 바깥부터 사라진다. 제외 영역에 걸려 건너뛴 자리는 개수에 세지 않고 더 바깥에서 마저 채운다 — 즉 제외 영역이 넓어져도 총 개수는 유지된다' })
    count: number = 0;

    @property({ type: CCFloat, displayName: '중앙 빈 반지름(m)', tooltip: '이 반지름 안쪽에는 놓지 않는다 — 플레이어 스폰처럼 비워둬야 하는 중앙부를 지키는 값이다. 여기 적는 값은 개체 **중심**까지의 거리이므로, 수관이나 밑동이 원 안으로 조금 들어오는 게 싫으면 그 반지름만큼 더 준다' })
    innerRadius: number = 2;

    @property({ type: CCFloat, displayName: '개체 사이 간격(m)', tooltip: '링과 링 사이, 그리고 같은 링 안에서의 최소 간격. 개체의 폭보다 작게 주면 서로 파고든다. 반대로 키우면 같은 개수가 훨씬 넓게 퍼진다 — 개수와 이 값이 함께 바깥 크기를 정한다' })
    spacing: number = 4;

    @property({ type: CCFloat, displayName: '최대 반지름(m)', tooltip: '개수가 남아도 이 거리를 넘으면 그만 놓는다. 바닥 메시 밖으로 개체가 삐져나가는 것을 막는 안전장치다 — 바닥 크기에 맞춰 두고 개수로 조절하는 것이 편하다' })
    maxRadius: number = 25;

    // ── 제외 영역 ───────────────────────────────────────────────────────
    // "손으로 배치한 것이 차지한 자리는 비운다". 기본은 **실제 메시가 차지하는 범위(AABB)를
    // 읽어** 그 사각형 안을 비우는 것이고, 그 값이 눈에 보이는 것과 어긋나는 개체에는
    // ScatterExclude를 붙여 사각형을 직접 지정한다. 배열 대신 부모 노드 하나만 받는 이유는
    // 두 가지다 — (1) 배열 프로퍼티는 MCP로 쓸 수 없어 자동화가 막히고, (2) 자식을 추가하는
    // 것만으로 제외 지점이 늘어나므로 설정을 두 군데서 관리하지 않아도 된다.
    @property({ type: Node, displayName: '제외 기준 노드', tooltip: '이 노드의 **직계 자식들이 차지하는 범위**를 비워둔다. 각 자식의 하위 메시를 전부 훑어 실제 크기를 재므로 보통은 반경을 손으로 맞출 필요가 없다. 개체별로 다르게 잡고 싶으면 그 자식에 ScatterExclude 컴포넌트를 붙인다. 비워두면 제외 없이 전부 채운다(기존 동작). 그룹 노드 자체는 원점(0,0,0)에 두는 것이 가장 깔끔하다 — 자식의 월드 좌표를 읽으므로 그룹 위치는 결과에 영향을 주지 않는다' })
    excludeRoot: Node | null = null;

    @property({ type: CCFloat, displayName: '제외 여유(m)', tooltip: '측정한 실제 범위의 바깥으로 이만큼 더 비운다. **각 변에 따로 더해지므로 1을 주면 가로·세로가 각각 2씩 늘어난다** — 넓게 느껴지면 여기부터 0으로 내려본다. ScatterExclude로 직접 지정한 개체에는 적용되지 않는다(그쪽은 이미 명시값이다)' })
    excludeMargin: number = 1;

    @property({ type: CCFloat, displayName: '제외 반경 — 메시 없는 노드용(m)', tooltip: '메시가 하나도 없고 ScatterExclude도 없는 자식(빈 마커 노드 등)은 크기를 잴 수 없으므로 이 반경의 정사각형을 대신 쓴다' })
    excludeRadius: number = 3;

    @property({ displayName: '제외를 씬 전체에서 수집', tooltip: '끄면(기본) 위 "제외 기준 노드"의 직계 자식만 본다 — 기존 동작이다. 켜면 그 노드를 무시하고 **씬 어디에 있든 ScatterExclude가 붙은 것을 전부** 본다. 건물이 여러 부모에 흩어져 있어도 계층을 옮기지 않고 한 번에 걸 수 있다. 대신 제외 여부가 씬 전체에 퍼지므로, 어디가 왜 비었는지 찾으려면 ScatterExclude를 검색해야 한다' })
    collectFromScene: boolean = false;

    @property({ displayName: '영역 안쪽에만 깔기', tooltip: '끄면 제외 영역을 비우고 그 바깥을 채운다(기본·기존 동작). 켜면 정반대로 제외 영역 "안"에만 깐다 — 같은 제외 기준 노드를 보는 두 필드를 하나는 끄고 하나는 켜두면, 영역 경계를 기준으로 서로 다른 프리팹이 빈틈 없이 나뉘어 깔린다. 영역 크기를 바꿔도 양쪽이 같은 값을 읽으므로 경계가 어긋나지 않는다. 켠 상태에서 제외 영역이 하나도 없으면 아무것도 만들지 않는다 — 안쪽이 없기 때문이다' })
    invertExclude: boolean = false;

    @property({ type: CCFloat, displayName: '최소 크기 배율', tooltip: '개체마다 이 값과 "최대 크기 배율" 사이에서 크기가 무작위로 정해진다. 둘을 같은 값으로 두면 전부 같은 크기가 된다' })
    minScale: number = 0.85;

    @property({ type: CCFloat, displayName: '최대 크기 배율', tooltip: '최소보다 작게 넣으면 두 값이 자동으로 바뀌어 해석된다. 차이를 크게 벌릴수록 자연스럽지만, 너무 벌리면 큰 개체가 작은 개체를 덮어 간격이 무의미해 보인다' })
    maxScale: number = 1.15;

    @property({ type: CCFloat, range: [0, 1, 0.01], slide: true, displayName: '흐트러뜨리기(0~1)', tooltip: '0이면 정확한 동심원이라 인공적으로 보이고, 1이면 최대로 흩어진다. 흩어져도 간격이 "개체 사이 간격 × (1 - 이 값)" 밑으로는 내려가지 않게 되어 있어서, 1로 둬도 서로 겹치지는 않되 아주 가까워질 수는 있다' })
    jitter: number = 0.35;

    @property({ displayName: 'Y축 무작위 회전', tooltip: '개체를 세운 채 제자리에서만 무작위로 돌린다. 같은 메시가 반복되는 티를 지우는 가장 싼 방법이다. 앞뒤가 정해진 물건(간판 등)이라면 꺼야 한다' })
    randomYaw: boolean = true;

    @property({ type: CCInteger, displayName: '무작위 씨앗', tooltip: '같은 숫자면 항상 같은 배치가 나온다(재현 가능). 배치가 마음에 안 들면 이 숫자만 바꿔 다른 모양을 뽑아보면 된다 — 손으로 배치한 것과 제외 영역은 그대로 남으므로 숲만 새로 굴려볼 수 있다' })
    seed: number = 20260916;

    @property({ type: CCFloat, displayName: '재배치 지연(초)', tooltip: '에디터에서 설정이나 제외 기준 노드가 바뀐 뒤 이만큼 조용해져야 숲을 다시 깐다. 0이면 바뀌는 즉시 다시 깐다(기존 동작) — 건물을 드래그하면 매 프레임 전부를 지우고 다시 만들어 에디터가 멈추므로, 제외 기준 노드를 손으로 옮길 일이 있으면 0.3 정도를 준다. 드래그를 놓은 뒤 그만큼 늦게 반영되는 것이 대가다. 런타임에는 아무 영향이 없다 — 실행 중에는 로드할 때 한 번만 깔린다' })
    rebuildDelay: number = 0;

    // ── 사라짐 ──────────────────────────────────────────────────────────
    // "건물이 들어설 자리에 처음에는 나무가 자라 있다가, 그 건물이 지어지는 순간 치워진다".
    // 소켓·건물과 직접 참조로 엮지 않고 트리거 ID + CoinEvents로만 연결한다 — 같은 트리거를
    // BuildingTrigger에 넣어두면 "바닥이 드러나는 것"과 "나무가 치워지는 것"이 한 신호로
    // 동시에 일어나면서도 서로의 존재를 모른다.
    @property({ type: TriggerId, displayName: '사라짐 트리거', tooltip: '이 트리거가 발화하면 깔아둔 것을 전부 치운다. None(기본)이면 절대 사라지지 않는다 — 기존 동작이다. 같은 트리거 ID를 그 자리에 들어설 건물의 BuildingTrigger에도 넣으면 건물이 서는 순간 함께 치워진다. 한 번 치우면 끝이고 다시 깔리지 않는다' })
    clearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '사라짐 지연(초)', tooltip: '트리거가 발화한 뒤 이만큼 기다렸다가 치우기 시작한다. 0(기본)이면 즉시. 같은 트리거로 바닥이나 건물이 함께 등장하는 경우, 그쪽 "건설 지연"과 맞춰두면 바닥이 드러나는 순간에 나무가 걷히는 것처럼 보인다 — 먼저 걷히면 맨땅이 잠깐 보이고, 너무 늦으면 바닥 위에 나무가 겹쳐 보인다' })
    clearDelay: number = 0;

    // ── 개체별 사라짐 배정 ──────────────────────────────────────────────
    // "이 나무는 어느 건물이 지어질 때 사라지는가"를 **개체마다** 정한다. 아래 기준 노드 중
    // 가장 가까운 것의 트리거를 그 나무에게 준다 — 그러면 건물 하나가 설 때 그 건물 주변의
    // 나무만 걷혀 "자리를 내주는" 그림이 되고, 셋을 다 지으면 영역 안이 완전히 빈다.
    // 기준 노드를 하나도 안 주면 예전처럼 위의 "사라짐 트리거"로 전부 한꺼번에 처리한다.
    @property({ type: Node, displayName: '분기 A 기준 노드', tooltip: '첫 번째 건물의 위치. 이 노드에 가장 가까운 개체들이 아래 "분기 A 트리거"를 받는다. 보통 그 건물 노드를 그대로 넣는다 — 건물을 옮기면 배정도 따라 바뀐다' })
    branchNodeA: Node | null = null;

    @property({ type: TriggerId, displayName: '분기 A 트리거', tooltip: '분기 A에 배정된 개체가 사라질 트리거. 그 건물의 BuildingTrigger와 같은 값으로 맞춘다' })
    branchTriggerA: TriggerId = TriggerId.None;

    @property({ type: Node, displayName: '분기 B 기준 노드', tooltip: '두 번째 건물의 위치. 비워두면 이 분기를 쓰지 않는다' })
    branchNodeB: Node | null = null;

    @property({ type: TriggerId, displayName: '분기 B 트리거', tooltip: '분기 B에 배정된 개체가 사라질 트리거' })
    branchTriggerB: TriggerId = TriggerId.None;

    @property({ type: Node, displayName: '분기 C 기준 노드', tooltip: '세 번째 건물의 위치. 비워두면 이 분기를 쓰지 않는다. 넷 이상이 필요해지면 칸을 더 만드는 대신, 건물 하나가 두 번에 나눠 서는 것은 아닌지부터 확인한다' })
    branchNodeC: Node | null = null;

    @property({ type: TriggerId, displayName: '분기 C 트리거', tooltip: '분기 C에 배정된 개체가 사라질 트리거' })
    branchTriggerC: TriggerId = TriggerId.None;

    @property({ displayName: '분기를 균등하게 나누기', tooltip: '끄면(기본) 각 개체가 **가장 가까운 기준 노드**의 분기를 받는다 — 건물 주변부터 걷혀 "자리를 내주는" 그림이 되지만, 기준 노드가 영역 한쪽에 몰려 있으면 **어떤 분기는 한 그루도 못 받는다**(그러면 그 건물을 지어도 아무것도 안 사라진다). 켜면 위치와 무관하게 개수를 정확히 N등분해 돌아가며 나눠 준다 — 숲이 고르게 성글어지고, 모든 분기가 반드시 자기 몫을 갖는다' })
    branchEvenly: boolean = false;

    @property({ type: CCFloat, displayName: '사라짐 퍼짐 시간(초)', tooltip: '치울 때 개체마다 0~이 값 사이의 무작위 지연을 준다. 0이면 전부 동시에 사라져 한 프레임에 뭉텅 없어지는 티가 난다. 크게 주면 한동안 계속 넘어져 건설 연출보다 오래 끌 수 있다. "사라짐 트리거"가 None이면 아무 의미가 없다' })
    clearSpread: number = 0.6;

    @property({ displayName: '씬에 굳히기 (체크 → 저장)', tooltip: '체크하는 순간 지금 깔려 있는 것을 다시 한 번 깔되, 이번에는 **씬에 저장되는 진짜 노드**로 만든다. 그 뒤 Ctrl+S 하면 개체가 씬 파일에 들어가 손으로 옮기고 지우고 복사할 수 있게 된다 — 개체마다 "사라짐 트리거"나 "다시 자라기까지"를 따로 정하고 싶을 때 쓴다. 굳힌 뒤에는 이 컴포넌트가 **더 이상 자동으로 다시 깔지 않는다**(손으로 고친 것을 덮어쓰면 안 되므로). 되돌리려면 체크를 풀고 굳어 있는 자식을 직접 지운 뒤 다시 깔면 된다. 대가는 씬/빌드 용량이다 — 좌표 데이터가 개수에 비례해 늘어난다(gzip 후 개당 대략 0.2~0.3KB). 런타임 성능은 두 방식이 완전히 같다' })
    get bakeToScene(): boolean { return this._bake; }
    set bakeToScene(v: boolean) {
        if (this._bake === v) return;
        this._bake = v;
        // 켜는 순간 딱 한 번 다시 깐다. 끌 때는 아무것도 하지 않는다 — 굳어 있는 자식을
        // 멋대로 지우면 손으로 고친 것이 날아가기 때문이다.
        if (v && EDITOR) this._rebuild();
    }
    private _bake = false;

    /** 마지막으로 반영한 설정값의 지문 — 에디터에서 값이 바뀐 것을 알아채는 데만 쓴다. */
    private _sig = '';

    /** 마지막으로 다시 깐 시각(초, 벽시계). `재배치 지연`이 0보다 클 때 스로틀에 쓴다.
     *  프레임 수가 아니라 실제 시간으로 재야 에디터가 틱을 띄엄띄엄 줘도 정확하다. */
    private _lastRebuildAt = 0;

    /** 사라짐 트리거로 이미 치웠는지 — 같은 트리거가 두 번 와도 다시 치우지 않는다. */
    private _cleared = false;
    /** 균등 분배에서 다음에 줄 분기 번호 — 다시 깔 때마다 0부터 시작해야 같은 배치가 나온다. */
    private _branchTurn = 0;

    onLoad() {
        // 트리거를 안 쓰면 아예 등록하지 않는다 — 배경 장식용으로 이 컴포넌트를 쓰는 씬에
        // 쓸모없는 리스너가 남지 않게 한다.
        if (this.clearTriggerId !== TriggerId.None) {
            CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        }
    }

    /**
     * 🔴 첫 배치는 반드시 `start()`에서 한다 — `onLoad`가 아니다.
     *
     * `제외를 씬 전체에서 수집`은 다른 노드의 `ScatterExclude`가 자기 `onEnable`에서 채워 넣는
     * static 목록을 읽는다. 그런데 엔진은 노드를 계층 순서대로 활성화하므로, 이 컴포넌트가
     * 그 노드들보다 앞에 있으면 **onLoad 시점의 목록은 비어 있다.** 그러면 바깥에 까는 필드는
     * 건물을 못 피해 그 위에 깔리고, `영역 안쪽에만 깔기`를 켠 필드는 "깔 곳이 하나도 없다"로
     * 판정해 **한 그루도 안 깔린다**(에러도 경고도 없이 조용히 0이 된다 — 실제로 당했다).
     * 엔진은 씬의 모든 `onLoad`/`onEnable`을 돌린 뒤에야 `start()`를 부르므로, 여기서 하면
     * 계층 순서와 무관하게 항상 목록이 채워져 있다.
     */
    start() {
        // 굳혀둔 상태면 개체가 이미 씬에 들어 있다 — 여기서 또 깔면 두 배가 된다.
        if (this._bake) return;
        this._rebuild();
    }

    /**
     * 에디터에서 인스펙터 값이 바뀌었는지 매 프레임 확인한다. 프로퍼티마다 setter를 다는 대신
     * 지문 하나를 비교하는 이유는 프로퍼티가 여럿이라 setter가 그만큼 늘어나기 때문이고,
     * 비교 비용은 문자열 하나라 에디터에서만 도는 이 루프에는 부담이 없다.
     * **제외 기준 노드 자식들의 위치·크기·ScatterExclude 값까지 지문에 넣는다** — 그래야 건물을
     * 드래그하거나 제외 반경을 고치는 즉시 숲이 다시 흐른다(이게 이 기능의 핵심 사용감이다).
     * 메시 범위 측정(AABB)은 비싸므로 지문에는 넣지 않고, 실제로 다시 깔 때만 한 번 잰다.
     * **런타임에는 아무 일도 하지 않는다** — EDITOR는 빌드 시 상수로 접혀 이 분기 자체가 사라진다.
     */
    update(dt: number) {
        if (!EDITOR) return;
        // 굳힌 뒤에는 자동으로 다시 깔지 않는다 — 손으로 옮긴 개체를 덮어쓰지 않기 위해서다.
        if (this._bake) return;
        const s = this._signature();
        if (s === this._sig) return;

        // 지연이 0이면 예전 그대로 즉시 반영한다 — 이 컴포넌트를 이미 쓰고 있는 씬이
        // 새 프로퍼티 때문에 조용히 다르게 동작하지 않게 하려는 기본값이다.
        if (this.rebuildDelay <= 0) { this._rebuild(); return; }

        // 🔴 **dt를 모아서 타이머를 깎지 않는다. 벽시계 시간으로 잰다.**
        // 에디터는 화면에 변화가 있을 때만 update를 돌리는 경우가 있어서, 인스펙터에서 값만
        // 바꾸고 마우스를 뷰포트 밖에 두면 **틱이 한 번 오고 끝난다.** dt를 모으는 방식은
        // "다음 틱"이 있어야 타이머가 줄어드는데 그 틱이 안 와서 **영영 다시 깔리지 않았다**
        // (2026-09-18에 실제로 멈춰 있었다 — 시드를 바꿔도 배치가 그대로였다).
        //
        // 그래서 뒤로 미루는 디바운스가 아니라 **앞에서 한 번 쓰고 쉬는 스로틀**로 바꿨다:
        //  · 조용하다가 값이 바뀌면 **그 틱에서 즉시** 다시 깐다 → 틱 한 번이면 충분하다.
        //  · 드래그처럼 값이 쏟아지는 동안에는 `재배치 지연`마다 한 번만 깐다 → 에디터가 안 멈춘다.
        // 드래그가 아직 무겁게 느껴지면 `재배치 지연`을 키우면 된다(0.5~1.0).
        const now = Date.now() / 1000;
        if (now - this._lastRebuildAt < this.rebuildDelay) return;
        this._lastRebuildAt = now;
        this._rebuild();
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
        this._clear();
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._cleared) return;
        if (this.clearTriggerId === TriggerId.None) return;
        if (triggerId !== this.clearTriggerId) return;
        this._cleared = true;
        this._clearAway();
    }

    /**
     * 깔아둔 것을 **연출과 함께** 치운다. `_clear()`(즉시 파괴)와 달리 화면에 보이는 상황에서
     * 쓰는 것이라, 채집물이면 그 프리팹이 가진 쓰러짐 연출을 그대로 재사용한다 — 치우는 쪽이
     * 별도의 연출을 갖고 있으면 벨 때와 치울 때의 모습이 달라져 같은 나무로 보이지 않는다.
     * 채집물이 아닌 장식은 제자리에서 줄어들며 사라진다.
     */
    private _clearAway() {
        const kids = this.node.children.slice();
        for (const n of kids) {
            if (!n || !n.isValid) continue;
            const delay = this.clearDelay + (this.clearSpread > 0 ? Math.random() * this.clearSpread : 0);
            const ch = n.getComponent(Choppable);
            if (ch) { ch.clearAway(delay); continue; }
            tween(n)
                .delay(delay)
                .to(0.2, { scale: new Vec3(0, 0, 0) })
                .call(() => { if (n.isValid) n.destroy(); })
                .start();
        }
    }

    private _signature(): string {
        const parts: (string | number)[] = [
            this.prefab ? this.prefab.uuid : '-',
            this.count, this.innerRadius, this.spacing, this.maxRadius,
            this.minScale, this.maxScale, this.jitter,
            this.randomYaw ? 1 : 0, this.seed, this.excludeMargin, this.excludeRadius,
            this.invertExclude ? 1 : 0, this.collectFromScene ? 1 : 0,
            this.branchTriggerA, this.branchTriggerB, this.branchTriggerC,
            this.branchNodeA ? 1 : 0, this.branchNodeB ? 1 : 0, this.branchNodeC ? 1 : 0,
            this.branchEvenly ? 1 : 0,
        ];
        // 씬 전체 수집 모드에서는 기준 노드가 아니라 등록된 표식 전부를 지문에 넣는다 —
        // 그래야 어느 부모에 있든 건물을 옮기는 즉시 숲이 다시 흐른다.
        if (this.collectFromScene) {
            for (const ov of ScatterExclude.all) {
                if (!ov || !ov.isValid) continue;
                const p = ov.node.worldPosition;
                parts.push(ov.node.activeInHierarchy ? 1 : 0, ov.disabled ? 1 : 0,
                    ov.alwaysExclude ? 1 : 0,
                    p.x.toFixed(3), p.z.toFixed(3), ov.halfX, ov.halfZ, ov.offsetX, ov.offsetZ,
                    ScatterField._yaw(ov.node).toFixed(4));
            }
            return parts.join('|');
        }
        const kids = this.excludeRoot?.children;
        if (kids) {
            for (const k of kids) {
                const p = k.worldPosition;
                const s = k.worldScale;
                parts.push(k.activeInHierarchy ? 1 : 0,
                    p.x.toFixed(3), p.z.toFixed(3), s.x.toFixed(3), s.z.toFixed(3));
                const ov = k.getComponent(ScatterExclude);
                if (ov) parts.push(ov.disabled ? 1 : 0, ov.halfX, ov.halfZ, ov.offsetX, ov.offsetZ,
                                   ScatterField._yaw(k).toFixed(4));
            }
        }
        return parts.join('|');
    }

    /**
     * 깔아둔 것을 전부 치운다.
     *
     * **"내가 만든 목록"이 아니라 "지금 붙어 있는 자식 전부"를 기준으로 지운다.** 만든 것만
     * 기억해뒀다 지우면, 한 프레임 안에서 두 번 이상 다시 깔릴 때(인스펙터에서 값을 연속으로
     * 바꾸면 실제로 그렇게 된다) 이전 것이 그대로 남는다 — `destroy()`가 프레임 끝으로 미뤄지는
     * 사이에 목록만 비워지기 때문이다. 같은 이유로 `removeFromParent()`를 먼저 부른다 —
     * destroy를 기다리지 않고 즉시 떼어내야 바로 이어지는 생성이 올바른 개수에서 시작한다.
     */
    private _clear() {
        const kids = this.node.children.slice();
        for (const n of kids) {
            if (!n || !n.isValid) continue;
            // 🔴 **씬에 굳어 있는 자식은 건드리지 않는다.** 굳히기를 쓰면 그 개체들은 사용자가
            // 손으로 옮기고 지우는 대상이 되므로, 이 컴포넌트가 자동으로 다시 깔거나 씬을
            // 닫을 때 쓸어버리면 작업이 통째로 날아간다. 표식은 DontSave 플래그 하나다 —
            // 이 컴포넌트가 만든 임시 개체에만 붙어 있다.
            if ((n.hideFlags & CCObject.Flags.DontSave) === 0) continue;
            n.removeFromParent();
            n.destroy();
        }
    }

    /**
     * 제외할 사각형들을 월드 XZ 기준으로 모은다 — [minX, minZ, maxX, maxZ] 네 개씩.
     *
     * 우선순위: ScatterExclude(명시값) > 메시 AABB(측정값) > 대체 반경(메시가 없을 때).
     *
     * 원이 아니라 **사각형**인 이유: 건물은 길쭉한 것이 많은데 원으로 덮으려면 대각선 길이를
     * 반지름으로 써야 해서 필요 이상으로 넓게 비워진다. 사각형을 쓰면 실제로 차지한 만큼만
     * 정확히 비울 수 있다.
     */
    /**
     * 노드의 **월드 Y 회전(요)**. 제외 사각형은 바닥에 눕는 판이므로 X·Z 기울기는 무시하고
     * 요만 본다 — `VirtualWall`이 막는 상자를 돌릴 때 쓰는 것과 같은 식이다.
     */
    private static _yaw(n: Node): number {
        const q = n.worldRotation;
        return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
    }

    /**
     * 사각형 하나를 목록에 넣는다. **한 칸이 6개다**: 중심 x·z, 반경 x·z, 그리고 요의 cos·sin.
     * 예전에는 [minX, minZ, maxX, maxZ] 네 개였는데, 그 형태로는 **회전을 표현할 수 없어서**
     * 노드를 돌려도 비워지는 자리가 그대로였다(사용자 보고 2026-09-18). 중심+반경+각도로 바꾸면
     * 판정 때 점을 사각형의 로컬 좌표로 옮겨 보기만 하면 되므로 회전이 자연스럽게 들어온다.
     * 회전이 0이면 cos=1, sin=0이라 예전 판정과 수치가 완전히 같다.
     */
    private static _push(out: number[], cx: number, cz: number, hx: number, hz: number, yaw: number) {
        out.push(cx, cz, hx, hz, Math.cos(yaw), Math.sin(yaw));
    }

    private _excludeRects(): { soft: number[]; hard: number[] } {
        const soft: number[] = [];
        const hard: number[] = [];

        // 씬 전체 수집 모드 — 계층과 무관하게 ScatterExclude가 붙은 것만 본다.
        // 이 모드에서는 메시 AABB 측정을 하지 않는다: 어떤 노드를 잴지 고를 기준이 없기 때문이다
        // (씬의 모든 메시를 재면 나무 자신까지 자기를 밀어낸다).
        if (this.collectFromScene) {
            for (const ov of ScatterExclude.all) {
                if (!ov || !ov.isValid || ov.disabled) continue;
                if (!ov.node.activeInHierarchy) continue;
                const p = ov.node.worldPosition;
                const yaw = ScatterField._yaw(ov.node);
                const c = Math.cos(yaw), sn = Math.sin(yaw);
                // 중심 오프셋은 **사각형이 돌아간 방향으로** 따라 돈다 — 노드를 돌리면 오프셋도
                // 같이 도는 것이 "피벗에서 이만큼 옮긴다"는 뜻에 맞다.
                const cx = p.x + ov.offsetX * c + ov.offsetZ * sn;
                const cz = p.z - ov.offsetX * sn + ov.offsetZ * c;
                ScatterField._push(ov.alwaysExclude ? hard : soft, cx, cz, ov.halfX, ov.halfZ, yaw);
            }
            return { soft, hard };
        }

        const out = soft;
        const kids = this.excludeRoot?.children;
        if (!kids) return { soft, hard };

        for (const k of kids) {
            if (!k.activeInHierarchy) continue;

            // ① 개체가 직접 지정한 값이 있으면 측정을 아예 하지 않는다.
            //    명시값에는 "제외 여유"를 더하지 않는다 — 여유는 측정 오차를 메우는 값이라,
            //    직접 적은 숫자에 몰래 더해지면 인스펙터에 보이는 값과 결과가 달라진다.
            const ov = k.getComponent(ScatterExclude);
            if (ov) {
                if (ov.disabled) continue;
                const p = k.worldPosition;
                const yaw = ScatterField._yaw(k);
                const c = Math.cos(yaw), sn = Math.sin(yaw);
                const cx = p.x + ov.offsetX * c + ov.offsetZ * sn;
                const cz = p.z - ov.offsetX * sn + ov.offsetZ * c;
                ScatterField._push(ov.alwaysExclude ? hard : out, cx, cz, ov.halfX, ov.halfZ, yaw);
                continue;
            }

            // ② 하위 메시의 AABB를 재서 감싼다.
            let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
            const renderers = k.getComponentsInChildren(MeshRenderer);
            for (const r of renderers) {
                const mesh = r.mesh;
                const lo = mesh?.struct?.minPosition;
                const hi = mesh?.struct?.maxPosition;
                if (!lo || !hi) continue;
                // 로컬 AABB의 8개 꼭짓점을 월드로 옮겨 감싼다 — 노드가 회전·스케일돼 있어도
                // 실제 차지하는 범위가 정확히 나온다(두 점만 변환하면 회전 시 틀어진다).
                const m = r.node.worldMatrix;
                for (let c = 0; c < 8; c++) {
                    _corner.set(c & 1 ? hi.x : lo.x, c & 2 ? hi.y : lo.y, c & 4 ? hi.z : lo.z);
                    Vec3.transformMat4(_corner, _corner, m);
                    if (_corner.x < minX) minX = _corner.x;
                    if (_corner.x > maxX) maxX = _corner.x;
                    if (_corner.z < minZ) minZ = _corner.z;
                    if (_corner.z > maxZ) maxZ = _corner.z;
                }
            }

            // ③ 메시가 하나도 없는 자식(빈 마커) — 크기를 잴 수 없으니 대체 반경을 쓴다.
            if (minX > maxX) {
                if (this.excludeRadius <= 0) continue;
                const p = k.worldPosition;
                minX = p.x - this.excludeRadius; maxX = p.x + this.excludeRadius;
                minZ = p.z - this.excludeRadius; maxZ = p.z + this.excludeRadius;
            }

            const m = this.excludeMargin;
            // 메시 범위로 잰 사각형은 애초에 축정렬이라 회전이 없다(요 0).
            ScatterField._push(out, (minX + maxX) / 2, (minZ + maxZ) / 2,
                               (maxX - minX) / 2 + m, (maxZ - minZ) / 2 + m, 0);
        }
        return { soft, hard };
    }

    /**
     * 월드 XZ 점이 사각형 목록 중 하나에라도 들어가는지. 각 사각형은 6칸이다(_push 참조).
     *
     * **점을 사각형의 로컬 좌표로 옮겨서** 본다 — 사각형을 돌리는 대신 점을 반대로 돌리는 것이
     * 훨씬 싸고(삼각함수는 사각형마다 한 번 미리 구해뒀다) 판정이 단순한 부등식 두 개로 끝난다.
     * 🔴 **월드→로컬은 회전의 역이라 부호가 반대다.** 요 θ로 놓인 사각형의 로컬 좌표는
     * `lx = dx·cosθ − dz·sinθ`, `lz = dx·sinθ + dz·cosθ`다. 축에 나란한 각도(0/90/180)로만
     * 검증하면 부호가 틀려도 통과하므로 **반드시 45도 같은 비대칭 각도로 확인할 것**.
     */
    private static _hits(rects: number[], wx: number, wz: number): boolean {
        for (let e = 0; e < rects.length; e += 6) {
            const dx = wx - rects[e];
            const dz = wz - rects[e + 1];
            const c = rects[e + 4], sn = rects[e + 5];
            const lx = dx * c - dz * sn;
            const lz = dx * sn + dz * c;
            if (Math.abs(lx) <= rects[e + 2] && Math.abs(lz) <= rects[e + 3]) return true;
        }
        return false;
    }

    /** 전부 지우고 현재 설정으로 다시 깐다. */
    private _rebuild() {
        this._clear();
        this._branchTurn = 0;
        this._sig = this._signature();

        // 무동작 조건 — 하나라도 걸리면 조용히 아무것도 만들지 않는다.
        if (!this.prefab || this.count <= 0 || this.spacing <= 0) return;

        // 좌표·크기·회전이 **하나의 난수열**을 공유한다. 씨앗 하나로 배치 전체가 결정되어야
        // "씨앗만 바꿔 다른 숲을 뽑는다"가 성립하기 때문이다.
        const rnd = ScatterField._makeRandom(this.seed);
        let lo = this.minScale, hi = this.maxScale;
        if (lo > hi) { const t = lo; lo = hi; hi = t; }

        const { soft: rects, hard } = this._excludeRects();
        // 안쪽 모드인데 영역이 하나도 없으면 "깔 곳이 없다"는 뜻이다. 아래 판정은 영역이
        // 없을 때 검사를 건너뛰도록 되어 있어서, 여기서 막지 않으면 맵 전체가 채워진다.
        if (this.invertExclude && rects.length === 0) return;

        let ring = 0;
        let made = 0;
        while (made < this.count) {
            const r = this.innerRadius + ring * this.spacing;
            if (r > this.maxRadius) break;

            // 이 링의 원주에 간격을 몇 개 나눠 넣을 수 있는지. 중심(r=0)이면 1개만 놓는다.
            const slots = Math.max(1, Math.floor((2 * Math.PI * r) / this.spacing));
            // 링마다 시작 각도를 흔든다 — 안 그러면 중심에서 뻗어나가는 방사형 줄이 보인다.
            const a0 = rnd() * Math.PI * 2;

            for (let i = 0; i < slots && made < this.count; i++) {
                let a = a0 + (i / slots) * Math.PI * 2;
                let rr = r;

                if (this.jitter > 0) {
                    // 반지름 방향과 원주 방향으로 각각 "간격의 절반 × 흐트러뜨리기"만큼만 민다.
                    // 이 상한 덕분에 이웃끼리 최악의 경우에도 간격 × (1 - jitter)는 벌어져 있어서,
                    // 배치 후에 서로 겹쳤는지 다시 검사할(= O(n²)) 필요가 없다.
                    const half = this.spacing * 0.5 * this.jitter;
                    rr += (rnd() * 2 - 1) * half;
                    a += ((rnd() * 2 - 1) * half) / Math.max(r, 0.001);
                    if (rr < this.innerRadius) rr = this.innerRadius;
                }

                const lx = Math.cos(a) * rr;
                const lz = Math.sin(a) * rr;

                // 제외 검사는 월드 좌표로 한다 — 제외 기준 노드가 이 필드의 자식이 아닐 수
                // 있으므로(보통 씬의 다른 그룹이다) 같은 공간으로 맞춰야 비교가 성립한다.
                if (rects.length > 0 || hard.length > 0) {
                    _local.set(lx, 0, lz);
                    Vec3.transformMat4(_world, _local, this.node.worldMatrix);

                    // "안쪽 모드에서도 비운다"로 표시된 사각형은 **어느 모드에서도** 구멍이다 —
                    // 바닥 영역 안에 서 있는 건물이 여기 해당한다. 영역 판정보다 먼저 본다.
                    if (ScatterField._hits(hard, _world.x, _world.z)) continue;
                    const inside = ScatterField._hits(rects, _world.x, _world.z);
                    // 건너뛴 자리는 개수에 세지 않는다 — 제외 영역을 넓혀도 총 개수가 유지되고
                    // 모자란 만큼 더 바깥 링에서 채워진다. 안쪽 모드에서는 반대로 영역을 벗어난
                    // 자리가 건너뛰어지므로, `개수`가 영역 용량보다 크면 "최대 반지름"에서 멈춘다
                    // — 즉 안쪽 모드의 실제 개수는 영역 크기와 간격이 정하고 `개수`는 상한이다.
                    if (inside !== this.invertExclude) continue;
                }

                const n = instantiate(this.prefab);
                // 값을 넣는 것은 반드시 addChild "전"이다 — 활성 계층에 들어가는 순간
                // Choppable.onLoad가 그 자리에서 돌며 이 값을 보고 리스너를 건다.
                this._assignBranch(n, lx, lz);
                // 값을 다 넣은 "뒤"에 붙인다 — 활성 계층에 들어가는 순간 Choppable.onLoad가
                // 그 자리에서 돌면서 배치 각도·크기를 기준값으로 잡기 때문이다.
                n.setPosition(lx, 0, lz);
                if (this.randomYaw) n.setRotationFromEuler(0, rnd() * 360, 0);
                const s = lo + rnd() * (hi - lo);
                n.setScale(s, s, s);
                // 씬 파일을 불리지 않기 위한 핵심 한 줄 — 이게 없으면 에디터에서 저장할 때
                // 생성된 개체가 전부 씬에 박혀 손으로 배치한 것과 똑같아진다.
                // 굳히기 모드에서는 이 플래그를 찍지 않는다 — 그래야 씬에 저장된다.
                if (!this._bake) n.hideFlags |= CCObject.Flags.DontSave;
                n.parent = this.node;

                made++;
            }
            ring++;
        }
    }

    /**
     * 이 개체가 "어느 건물이 지어질 때 사라질지"를 정한다 — 기준 노드 중 **가장 가까운 것**의
     * 트리거를 준다. 기준 노드를 하나도 안 줬으면 아무것도 하지 않는다(프리팹 값 그대로).
     *
     * 거리는 이 필드의 로컬 좌표가 아니라 **월드 XZ**로 잰다 — 기준 노드는 보통 이 필드의
     * 자식이 아니라 씬의 다른 건물이기 때문이다.
     */
    private _assignBranch(n: Node, lx: number, lz: number) {
        const ch = n.getComponent(Choppable);
        if (!ch) return;
        _local.set(lx, 0, lz);
        Vec3.transformMat4(_world, _local, this.node.worldMatrix);

        const nodes = [this.branchNodeA, this.branchNodeB, this.branchNodeC];
        const trigs = [this.branchTriggerA, this.branchTriggerB, this.branchTriggerC];

        let best = -1;
        if (this.branchEvenly) {
            // 쓰이는 분기만 모아 돌아가며 준다 — 그래야 개수가 정확히 N등분되고, 어떤 분기도
            // 빈손으로 남지 않는다. 기준 노드는 트리거를 적어두는 칸으로만 쓰인다.
            const use: number[] = [];
            for (let i = 0; i < 3; i++) if (trigs[i] !== TriggerId.None) use.push(i);
            if (use.length === 0) return;
            best = use[this._branchTurn % use.length];
            this._branchTurn++;
        } else {
            let bestD = Infinity;
            for (let i = 0; i < 3; i++) {
                const b = nodes[i];
                if (!b || !b.isValid) continue;
                const p = b.worldPosition;
                const dx = p.x - _world.x, dz = p.z - _world.z;
                const d = dx * dx + dz * dz;
                if (d < bestD) { bestD = d; best = i; }
            }
        }
        if (best < 0) return;                 // 쓸 분기가 하나도 없다 — 배정하지 않는다
        ch.clearTriggerId = trigs[best];
        // 한꺼번에 사라지지 않도록 개체마다 조금씩 다르게 민다. 여기서 주는 이유는 개체가
        // 스스로 트리거를 받아 사라지기 때문이다(필드가 일괄로 치우는 경로가 아니다).
        ch.clearDelay = this.clearDelay + (this.clearSpread > 0 ? Math.random() * this.clearSpread : 0);
    }

    /** mulberry32 — 씨앗이 같으면 항상 같은 수열. 엔진의 Math.random은 씨앗을 못 줘서 직접 둔다. */
    private static _makeRandom(seed: number): () => number {
        let a = seed >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
}
