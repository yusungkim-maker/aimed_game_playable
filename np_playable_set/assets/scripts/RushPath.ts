import { _decorator, Component, Node, Vec3, Quat, Mesh, Material, MeshRenderer, utils, primitives } from 'cc';
import { EditorGizmoController } from './EditorGizmoController';
const { ccclass, property, executeInEditMode } = _decorator;

const DEBUG_CONTAINER_NAME = '__RushPathGizmo__';
const LINE_THICKNESS     = 0.12;  // 곡선/접선 선 두께(월드 유닛)
const LINE_Y_OFFSET      = 0.03;  // 바닥과 겹쳐 z-fighting 나지 않도록 살짝 띄움
const ANCHOR_MARKER_SIZE = 0.35;
const HANDLE_MARKER_SIZE = 0.22;

interface AnchorData {
    pos: Vec3;
    /** Handle 자식 노드가 있으면 앵커 기준 월드 오프셋, 없으면 null(=뾰족한 코너) */
    handle: Vec3 | null;
}

/**
 * 몬스터 러쉬 경로 — 점을 하나하나 직접 배치하던 기존 웨이포인트 방식 대신, 앵커+핸들로
 * 정의하는 3차 베지어 곡선을 쓴다.
 *
 * 이 노드의 자식으로 "Anchor0","Anchor1","Anchor2",... 이름 규칙에 따라 앵커(경로가 실제로
 * 지나가는 점)를 순서대로 인식한다(MapBounds.vertices/FollowerFormation의 "Slot0","Slot1"...과
 * 동일한 "배열 프로퍼티 대신 이름 스캔" 컨벤션 — Node[] 배열 프로퍼티는 MCP/에디터 툴로
 * 채우기 까다롭다는 문제도 겸사겸사 피해간다. 씬 뷰에서 그냥 노드를 복제/추가/삭제/이름변경만
 * 하면 되므로 배열 인덱스를 직접 관리할 필요가 없다).
 *
 * 각 Anchor는 그 밑에 자식 노드 "Handle"을 하나 선택적으로 가질 수 있다 — 이 핸들의(앵커
 * 기준) 오프셋이 그 지점을 지나는 접선 방향을 정의한다. 벡터 드로잉 툴(일러스트레이터 등)의
 * "대칭 스무스 포인트"와 동일한 방식: 핸들 하나로 나가는 방향(=앵커+오프셋)과 들어오는
 * 방향(=앵커-오프셋)을 동시에 결정한다. Handle이 없으면 그 앵커는 뾰족한 코너(양쪽 다
 * 직선으로 접근)로 취급된다 — 핸들을 단 지점만 곡선이 되고 나머지는 기존처럼 직선이어도
 * 되므로, 필요한 지점에만 점진적으로 곡률을 추가할 수 있다.
 *
 * 씬 뷰(편집 중)에서 Anchor/Handle 노드를 기본 이동 기즈모로 드래그하면, showDebugCurve
 * 미리보기(앵커=곡선색 마커, 핸들=핸들색 마커+접선, 실제 곡선=샘플링된 폴리라인)가 그
 * 즉시 갱신되어 Play 없이 바로 형태를 확인할 수 있다. "씬에서만 보이고 프리뷰/빌드에서는
 * 안 보인다"는 보장 자체는 EditorGizmoController가 전담한다 — 이 컴포넌트는 그 규칙을
 * 다시 구현하지 않고 그 컨트롤러 하나만 통해서 시각화를 켜고 끈다.
 */
@ccclass('RushPath')
@executeInEditMode
export class RushPath extends Component {
    @property({ displayName: '경로 이름', tooltip: '예: North / South / East / West' })
    pathName: string = '';

    @property({ displayName: '구간당 샘플 수', tooltip: '앵커와 앵커 사이 곡선을 몇 개의 점으로 잘게 쪼개 몬스터가 그 점들을 순서대로 따라가게 할지 — 클수록 더 매끄러운 곡선이 되지만 몬스터에게 넘겨주는 좌표 배열이 커진다' })
    samplesPerSegment: number = 12;

    @property({ displayName: '커브 미리보기 표시', tooltip: '체크하면 씬 뷰(편집 중)에서만 앵커/핸들 마커와 접선(핸들 색), 실제 몬스터가 따라갈 곡선(곡선 색)을 그려서 형태를 바로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다(EditorGizmoController가 보장).' })
    showDebugCurve: boolean = true;

    @property({ type: Material, displayName: '곡선 색상(재질)', tooltip: '실제 몬스터가 따라갈 샘플링된 곡선 + 앵커 마커에 쓰인다' })
    curveMaterial: Material | null = null;

    @property({ type: Material, displayName: '핸들 색상(재질)', tooltip: '핸들 마커 + 앵커-핸들 접선에 쓰인다. 비워두면 곡선 색상을 그대로 쓴다' })
    handleMaterial: Material | null = null;

    /** "씬에서만 보이고 프리뷰/빌드에서는 숨김" 규칙 자체는 여기서 다시 구현하지 않는다 —
     * onLoad()/update()에서 이 컨트롤러의 hideIfNotEditing()/beginFrame()만 통해서 시각화
     * on/off를 결정한다. */
    private _gizmo: EditorGizmoController | null = null;
    private _lineMesh:   Mesh | null = null;
    private _anchorMesh: Mesh | null = null;
    private _handleMesh: Mesh | null = null;

    /** "Anchor0","Anchor1",... 이름 규칙에 맞는 자식을 순서대로 찾고, 각각의 "Handle" 자식
     * (있다면)까지 함께 읽는다. 매번 새로 스캔하므로 에디터에서 Anchor/Handle 노드를
     * 추가/삭제/이동/이름변경해도 다음 호출부터 바로 반영된다 — 별도의 "적용" 버튼이 없다. */
    private _collectAnchors(): AnchorData[] {
        const found: { index: number; node: Node }[] = [];
        for (const child of this.node.children) {
            const m = /^Anchor(\d+)$/.exec(child.name);
            if (m) found.push({ index: parseInt(m[1], 10), node: child });
        }
        found.sort((a, b) => a.index - b.index);

        return found.map(f => {
            const handleNode = f.node.getChildByName('Handle');
            const handle = handleNode
                ? Vec3.subtract(new Vec3(), handleNode.worldPosition, f.node.worldPosition)
                : null;
            return { pos: f.node.worldPosition.clone(), handle };
        });
    }

    /**
     * 몬스터가 실제로 순서대로 따라갈 월드 좌표 목록. 앵커 i는 이 배열의 정확히
     * `i * samplesPerSegment` 번째 자리에 위치한다(구간마다 samplesPerSegment개의 점을
     * 추가하고 마지막 점이 항상 다음 앵커와 정확히 일치하므로) — MonsterSpawner의
     * "N번 앵커부터 시작" 기능이 이 규칙을 이용한다.
     *
     * 캐싱하지 않고 호출마다 새로 계산한다 — 씬 뷰에서 Anchor/Handle을 옮기면 다음 스폰부터
     * 바로 반영되게 하기 위함이며, 몬스터 스폰 시점에만 호출되므로 비용도 무시할 만하다.
     */
    get waypoints(): Vec3[] {
        const anchors = this._collectAnchors();
        if (anchors.length === 0) return [];
        const pts: Vec3[] = [anchors[0].pos.clone()];
        for (let i = 0; i < anchors.length - 1; i++) {
            const a = anchors[i], b = anchors[i + 1];
            const p1 = a.handle ? Vec3.add(new Vec3(), a.pos, a.handle) : a.pos;
            const p2 = b.handle ? Vec3.subtract(new Vec3(), b.pos, b.handle) : b.pos;
            for (let s = 1; s <= this.samplesPerSegment; s++) {
                pts.push(_bezierAt(a.pos, p1, p2, b.pos, s / this.samplesPerSegment));
            }
        }
        return pts;
    }

    onLoad() {
        this._gizmo = new EditorGizmoController(this.node, DEBUG_CONTAINER_NAME);
        this._gizmo.hideIfNotEditing();
    }

    update() {
        const anchors = this._collectAnchors();
        const shouldShow = this.showDebugCurve && anchors.length > 0 && !!this.curveMaterial;
        if (!this._gizmo!.beginFrame(shouldShow)) return;
        if (shouldShow) this._redrawDebug(anchors);
    }

    // 곡선/접선 선은 MapBounds._placeSegment와 동일하게, 로컬 X:[-1,1]/Y:[-1,1]인 얇은
    // 평면(두께 방향인 Z는 거의 0)으로 만들어 재사용한다. 마커는 FollowerFormation과 동일한
    // 정육면체.
    private _getLineMesh(): Mesh {
        if (!this._lineMesh) this._lineMesh = utils.createMesh(primitives.box({ width: 2, height: 2, length: 0.001 }));
        return this._lineMesh;
    }
    private _getAnchorMesh(): Mesh {
        if (!this._anchorMesh) this._anchorMesh = utils.createMesh(primitives.box({ width: ANCHOR_MARKER_SIZE, height: ANCHOR_MARKER_SIZE, length: ANCHOR_MARKER_SIZE }));
        return this._anchorMesh;
    }
    private _getHandleMesh(): Mesh {
        if (!this._handleMesh) this._handleMesh = utils.createMesh(primitives.box({ width: HANDLE_MARKER_SIZE, height: HANDLE_MARKER_SIZE, length: HANDLE_MARKER_SIZE }));
        return this._handleMesh;
    }

    /** pool에서 꺼낸 노드에 mesh/mat이 아직 없으면(=방금 새로 만들어진 노드) MeshRenderer를
     * 붙이고, 이미 있으면 재질만 최신 상태로 맞춘다(에디터에서 curveMaterial/handleMaterial을
     * 바꾼 경우 바로 반영되도록). */
    private _applyRenderer(node: Node, mesh: Mesh, mat: Material | null) {
        let mr = node.getComponent(MeshRenderer);
        if (!mr) mr = node.addComponent(MeshRenderer);
        // 항상 다시 대입한다(새로 만든 노드든 재사용하는 노드든 상관없이) — mesh는 uuid가
        // 없는 런타임 전용 리소스라, 스크립트 핫리로드로 이 컴포넌트 인스턴스가 다시
        // 만들어질 때마다 _getAnchorMesh() 등이 매번 새 mesh 객체를 만든다. 재사용되는
        // (핫리로드 전부터 씬에 남아있던) 노드의 MeshRenderer는 그 "이전 인스턴스가 만든,
        // 이제 아무도 참조하지 않는 옛날 mesh 객체"를 계속 들고 있게 되므로, 여기서 매번
        // 최신 mesh로 갱신해주지 않으면 리로드를 반복할수록 지오메트리가 끊긴 참조를
        // 가리키게 되어 결국 아무것도 안 그려진다.
        if (mr.mesh !== mesh) mr.mesh = mesh;
        if (mat && mr.sharedMaterial !== mat) mr.setMaterial(mat, 0);
    }

    private _redrawDebug(anchors: AnchorData[]) {
        const gizmo = this._gizmo!;
        const handleMat = this.handleMaterial ?? this.curveMaterial;

        const anchorNodes = gizmo.acquire('anchor', anchors.length, name => new Node(name));
        for (let i = 0; i < anchors.length; i++) {
            this._applyRenderer(anchorNodes[i], this._getAnchorMesh(), this.curveMaterial);
            anchorNodes[i].setWorldPosition(anchors[i].pos);
        }

        const withHandle = anchors.filter(a => a.handle);
        const handleMarkers = gizmo.acquire('handleMarker', withHandle.length, name => new Node(name));
        const handleLines   = gizmo.acquire('handleLine', withHandle.length, name => new Node(name));
        for (let i = 0; i < withHandle.length; i++) {
            const a = withHandle[i];
            const hp = Vec3.add(new Vec3(), a.pos, a.handle!);
            this._applyRenderer(handleMarkers[i], this._getHandleMesh(), handleMat);
            handleMarkers[i].setWorldPosition(hp);
            this._applyRenderer(handleLines[i], this._getLineMesh(), handleMat);
            this._placeLine(handleLines[i], a.pos, hp);
        }

        const pts = this.waypoints;
        const segCount = Math.max(0, pts.length - 1);
        const curveSegs = gizmo.acquire('curveSeg', segCount, name => new Node(name));
        for (let i = 0; i < segCount; i++) {
            this._applyRenderer(curveSegs[i], this._getLineMesh(), this.curveMaterial);
            this._placeLine(curveSegs[i], pts[i], pts[i + 1]);
        }
    }

    /** a→b를 잇는 얇은 막대 하나를 배치한다. 이 프로젝트의 러쉬 경로는 항상 수평(바닥)
     * 기준이므로 X/Z 투영만으로 방향(roll)을 잡고, 높이(Y)는 두 점의 평균으로 중점에만
     * 반영한다 — MapBounds.ts에서 이미 검증된 것과 동일한 roll(Z축)→tilt(X축, 평면을
     * 눕힘) 순서의 회전 합성. */
    private _placeLine(seg: Node, a: Vec3, b: Vec3) {
        const dx = b.x - a.x, dz = b.z - a.z;
        const len = Math.hypot(dx, dz) || 0.0001;

        seg.setWorldPosition((a.x + b.x) / 2, (a.y + b.y) / 2 + LINE_Y_OFFSET, (a.z + b.z) / 2);

        const rollRad = Math.atan2(-dz, dx);
        const qRoll = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, rollRad);
        const qTilt = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, -Math.PI / 2);
        const qFinal = new Quat();
        Quat.multiply(qFinal, qTilt, qRoll);
        seg.setRotation(qFinal);

        seg.setScale(len / 2, LINE_THICKNESS / 2, 1);
    }
}

/** 3차 베지어 곡선 위 t(0~1) 지점의 좌표 */
function _bezierAt(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
    const u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return new Vec3(
        p0.x * a + p1.x * b + p2.x * c + p3.x * d,
        p0.y * a + p1.y * b + p2.y * c + p3.y * d,
        p0.z * a + p1.z * b + p2.z * c + p3.z * d,
    );
}
