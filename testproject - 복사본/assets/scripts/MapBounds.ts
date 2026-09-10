import { _decorator, CCObject, Component, Node, Mesh, Material, MeshRenderer, Vec3, Quat } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

const DEBUG_CONTAINER_NAME = '__MapBoundsDebug__';
const LINE_THICKNESS = 0.15;   // 외곽선 두께(월드 유닛)
const LINE_Y_OFFSET  = 0.03;   // 바닥과 겹쳐 z-fighting 나지 않도록 살짝 띄움

/**
 * 맵의 이동 가능 범위를 다각형으로 정의한다.
 * 꼭짓점은 이 노드의 자식으로 배치하고 vertices 배열에 순서대로(시계/반시계 상관없이,
 * 다각형 둘레 순서대로) 연결한다. 씬 뷰에서 각 꼭짓점 노드를 기본 이동 기즈모로
 * 드래그하면 그대로 범위가 바뀐다. 다각형은 항상 월드 X-Z 평면(수평면) 기준으로
 * 계산되며 꼭짓점의 Y 좌표는 무시한다 (다각형은 항상 위를 바라보는 것으로 취급).
 *
 * showDebugOutline을 켜두면 각 변을 얇은 평면으로 이어 그려서, 에디터에서 Play를
 * 하지 않아도(@executeInEditMode) 다각형의 실제 형태를 바로 확인할 수 있다.
 */
@ccclass('MapBounds')
@executeInEditMode
export class MapBounds extends Component {
    @property({
        type: [Node],
        displayName: '꼭짓점',
        tooltip: '맵 경계를 이루는 꼭짓점 노드들. 다각형 둘레 순서대로 등록 (3개 이상)',
    })
    vertices: Node[] = [];

    @property({ displayName: '외곽선 표시', tooltip: '체크하면 씬 뷰(편집 중)에서만 다각형 외곽선을 그려 형태를 바로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.' })
    get showDebugOutline(): boolean { return this._showDebugOutline; }
    set showDebugOutline(v: boolean) {
        this._showDebugOutline = v;
        this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
    }
    private _showDebugOutline = true;

    @property(Mesh)     segmentMesh:     Mesh     | null = null;  // 외곽선 한 변에 쓸 평면 메쉬 (예: UI_arrow가 쓰는 2x2 쿼드)
    @property(Material) segmentMaterial: Material | null = null;  // 외곽선 머티리얼

    private _debugContainer: Node | null = null;
    private _segNodes: Node[] = [];

    /** 다각형 내부(경계 포함)인지 판정 (월드 X,Z 기준). 꼭짓점이 3개 미만이면 제한 없음(true) */
    contains(x: number, z: number): boolean {
        const pts = this._livePoints();
        if (pts.length < 3) return true;

        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const pi = pts[i], pj = pts[j];
            const intersect = ((pi.z > z) !== (pj.z > z)) &&
                (x < (pj.x - pi.x) * (z - pi.z) / (pj.z - pi.z) + pi.x);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    onLoad() {
        // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
        // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
        if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureContainer().active = false;
        }
    }

    update() {
        // 외곽선은 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다 — 실제 게임 화면에는 노출되면 안 된다.
        if (!EDITOR_NOT_IN_PREVIEW) return;
        if (this._showDebugOutline) this._redrawDebug();
    }

    /** 매번 자식 노드의 현재 월드 위치를 그대로 읽는다 (에디터에서 꼭짓점을 옮기면 즉시 반영) */
    private _livePoints(): { x: number; z: number }[] {
        const pts: { x: number; z: number }[] = [];
        for (const n of this.vertices) {
            if (!n || !n.isValid) continue;
            const p = n.worldPosition;
            pts.push({ x: p.x, z: p.z });
        }
        return pts;
    }

    private _ensureContainer(): Node {
        if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
        let c = this.node.getChildByName(DEBUG_CONTAINER_NAME);
        if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
        }
        // 이 컨테이너와 자식 seg_*는 순수 편집기 시각화이므로 씬에 저장되면 안 된다 —
        // 플래그가 없으면 저장할 때마다 외곽선 노드가 씬 파일에 직렬화되어 눌러앉고 그대로
        // 빌드에도 실려나간다. (EditorGizmoController에 넣은 것과 같은 수정. MapBounds는
        // 그 컨트롤러를 쓰지 않고 컨테이너 관리를 자체 구현하고 있어 여기에도 따로 필요하다.)
        // 매번 다시 세운다 — 플래그 없이 이미 저장돼버린 씬을 열었을 때도 다음 저장에서 빠지도록.
        c.hideFlags |= CCObject.Flags.DontSave;
        for (const child of c.children) child.hideFlags |= CCObject.Flags.DontSave;
        c.setPosition(0, 0, 0);
        c.setRotationFromEuler(0, 0, 0);
        c.setScale(1, 1, 1);
        this._debugContainer = c;
        this._segNodes = c.children.slice();
        return c;
    }

    private _ensureSegCount(count: number) {
        const container = this._ensureContainer();
        while (this._segNodes.length < count) {
            const seg = new Node(`seg_${this._segNodes.length}`);
            seg.hideFlags |= CCObject.Flags.DontSave;
            container.addChild(seg);
            const mr = seg.addComponent(MeshRenderer);
            if (this.segmentMesh)     mr.mesh = this.segmentMesh;
            if (this.segmentMaterial) mr.setMaterial(this.segmentMaterial, 0);
            this._segNodes.push(seg);
        }
        for (let i = count; i < this._segNodes.length; i++) this._segNodes[i].active = false;
        for (let i = 0; i < count; i++) this._segNodes[i].active = true;
    }

    private _redrawDebug() {
        const pts = this._livePoints();
        if (pts.length < 2 || !this.segmentMesh || !this.segmentMaterial) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
        }
        this._debugContainer && (this._debugContainer.active = true);
        this._ensureSegCount(pts.length);

        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            this._placeSegment(this._segNodes[i], a.x, a.z, b.x, b.z);
        }
    }

    /** a→b 구간을 잇는 얇은 평면 하나를 배치한다. 메쉬는 로컬 XY 평면의 2x2 쿼드(normal=+Z)를 가정 */
    private _placeSegment(seg: Node, ax: number, az: number, bx: number, bz: number) {
        const dx = bx - ax, dz = bz - az;
        const len = Math.hypot(dx, dz) || 0.0001;

        seg.setWorldPosition((ax + bx) / 2, LINE_Y_OFFSET, (az + bz) / 2);

        // 평면을 바닥에 눕히는 고정 -90도 X회전(피치) + 구간 방향을 향하게 하는 Z축 roll.
        // roll을 피치보다 먼저 적용해야(로컬 normal은 자기 축 회전에 불변) 항상 정확히
        // 위를 바라보는 상태(수평)를 유지한다. (HitEffect에서 검증한 것과 동일한 원리)
        const rollRad = Math.atan2(-dz, dx);
        const qRoll  = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollRad);
        const qTilt  = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, -Math.PI / 2);
        const qFinal = new Quat();
        Quat.multiply(qFinal, qTilt, qRoll);
        seg.setRotation(qFinal);

        // 메쉬 로컬 X:[-1,1] → 길이 축, 로컬 Y:[-1,1] → 두께 축
        seg.setScale(len / 2, LINE_THICKNESS / 2, 1);
    }
}
