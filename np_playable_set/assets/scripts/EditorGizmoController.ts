import { CCObject, Node } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';

/**
 * "씬 뷰(에디터 편집 중)에서만 보이고, 프리뷰/Play/빌드에서는 항상 숨겨지는" 디버그 시각화
 * 전용 컨테이너 + 이름 기반 노드 풀을 관리하는 헬퍼.
 *
 * MapBounds/FollowerFormation/SocketPreviewSlots/VirtualWall/RushPath가 각자 비슷하지만
 * 미묘하게 다른 방식으로 손으로 구현하고 있던 로직을 하나로 정리한 것 — "씬에서만 보이고
 * 프리뷰/빌드에서는 안 보인다"는 보장을 이 클래스 하나가 전담해서, 스크립트마다 재구현하며
 * 실수가 생길 여지를 없앤다.
 *
 * 판단 기준은 오직 cc/env의 `EDITOR_NOT_IN_PREVIEW` 하나뿐이다 — "에디터 프로세스 안에서
 * 실행 중 + 프리뷰가 아님"일 때만 true. 즉 씬 뷰(편집 중)에서만 true이고, 에디터 안에서
 * Play를 누른 상태(프리뷰)나 실제로 내보낸 빌드에서는 항상 false다 — 빌드에서는 `EDITOR`
 * 자체가 컴파일 타임 상수로 false 확정되므로, 이 분기에 걸린 코드는 빌드 결과물에
 * 포함조차 되지 않는다(런타임에 껐다 켜는 게 아니라, 데드코드로 제거됨).
 *
 * 사용하는 컴포넌트는 반드시 `@executeInEditMode`가 있어야 하고:
 *   - onLoad()에서 `gizmo.hideIfNotEditing()` 호출 — Play/빌드로 곧장 시작하는 경우 첫
 *     프레임부터 즉시 숨긴다. update()의 첫 틱까지 기다리면, 씬/프리팹 파일에 마지막으로
 *     active:true로 저장돼 있던 컨테이너가 그 사이 한두 프레임 노출될 수 있어서 중요하다.
 *   - update() 맨 앞에서 `if (!gizmo.beginFrame(표시여부)) return;` — 편집 중이 아니면
 *     그 프레임엔 아무것도 그리지 않고 즉시 리턴한다.
 *   - 그 아래에서 `gizmo.acquire(풀이름, 개수, makeNode)`로 필요한 만큼 노드를 꺼내 쓴다.
 *     스크립트 핫리로드로 컴포넌트 인스턴스가 새로 만들어져도(=이 컨트롤러 인스턴스도 새로
 *     생성됨), 씬에 이미 남아있는 동일 이름 규칙의 자식 노드를 다시 풀로 편입시키므로
 *     중복 생성되지 않는다.
 */
export class EditorGizmoController {
    private readonly _owner: Node;
    private readonly _containerName: string;
    private _container: Node | null = null;
    private _pools: Map<string, Node[]> = new Map();

    constructor(owner: Node, containerName: string) {
        this._owner = owner;
        this._containerName = containerName;
    }

    /** onLoad()에서 호출. Play/빌드로 시작하는 경우 즉시 숨긴다(편집 중이면 아무 것도 안 함 —
     * 실제 표시 여부는 update()의 beginFrame()이 매 프레임 계속 결정한다). */
    hideIfNotEditing() {
        if (!EDITOR_NOT_IN_PREVIEW) this._ensureContainer().active = false;
    }

    /** update() 맨 앞에서 호출. 편집 중이 아니면(false 반환) 호출부는 그대로 return하면 된다.
     * 편집 중이면 컨테이너의 active를 visible로 맞추고 그대로 visible을 반환한다. */
    beginFrame(visible: boolean): boolean {
        if (!EDITOR_NOT_IN_PREVIEW) return false;
        this._ensureContainer().active = visible;
        return visible;
    }

    /** poolName 풀에서 정확히 count개의 노드를 활성 상태로 확보한다 — 모자라면 makeNode로
     * 새로 만들어 컨테이너 자식으로 붙이고, 남으면 비활성화(재사용 대기)한다. 반환된 배열의
     * 0..count-1이 이번에 써야 할 노드들이다. */
    acquire(poolName: string, count: number, makeNode: (name: string) => Node): Node[] {
        const container = this._ensureContainer();
        let pool = this._pools.get(poolName);
        if (!pool) {
            const prefix = poolName + '_';
            pool = container.children
                .filter(n => n.name.startsWith(prefix))
                .sort((a, b) => parseInt(a.name.slice(prefix.length), 10) - parseInt(b.name.slice(prefix.length), 10));
            this._pools.set(poolName, pool);
        }
        while (pool.length < count) {
            const node = makeNode(`${poolName}_${pool.length}`);
            node.hideFlags |= CCObject.Flags.DontSave;
            container.addChild(node);
            pool.push(node);
        }
        for (let i = count; i < pool.length; i++) pool[i].active = false;
        for (let i = 0; i < count; i++) pool[i].active = true;
        return pool;
    }

    private _ensureContainer(): Node {
        if (this._container && this._container.isValid) return this._container;
        let c = this._owner.getChildByName(this._containerName);
        if (!c) { c = new Node(this._containerName); this._owner.addChild(c); }
        // 이 컨테이너와 그 자식(디버그 메시)은 순수 편집기 시각화이므로 씬에 저장되면 안 된다.
        // 플래그가 없으면 편집기가 저장할 때마다 곡선 세그먼트/마커 노드 전체가 씬 파일에
        // 직렬화되어 눌러앉는다 — 씬 2에서 이 방식으로 MeshRenderer 393개 + 노드 약 1300개
        // (씬 파일 900KB 상당)가 쌓여 있었고, 그건 빌드에도 그대로 실려나간다.
        // DontSave는 매번 다시 세운다 — 이 플래그 없이 이미 저장돼버린 기존 씬을 열었을 때도
        // 다음 저장에서 빠지도록.
        c.hideFlags |= CCObject.Flags.DontSave;
        for (const child of c.children) child.hideFlags |= CCObject.Flags.DontSave;
        c.setPosition(0, 0, 0);
        c.setRotationFromEuler(0, 0, 0);
        c.setScale(1, 1, 1);
        this._container = c;
        // 컨테이너를 새로 얻은 시점(최초 생성 또는 핫리로드 후 재획득)엔 풀 캐시도
        // 반드시 함께 초기화해야 한다 — 그래야 다음 acquire() 호출에서 기존 자식을
        // 다시 스캔해 재사용하지, 빈 풀로 착각해 중복 생성하지 않는다.
        this._pools.clear();
        return c;
    }
}
