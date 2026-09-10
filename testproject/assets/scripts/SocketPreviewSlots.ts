import { _decorator, Component, Node, Vec3, Mesh, Material, MeshRenderer, utils, primitives } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

const DEBUG_CONTAINER_NAME = '__PreviewSlotDebug__';
const MARKER_SIZE = 0.2; // 디버그 박스 한 변 길이(m)

/**
 * 소켓(socket_L) 위에서 생산 대기 중인 고스트 미리보기 추종자들이 설 자리를 정의한다.
 * FollowerFormation.ts와 완전히 동일한 방식: 슬롯 하나하나가 이 노드(소켓)의 자식 노드로
 * 존재하고("PreviewSlot0", "PreviewSlot1", ... 이름 순서로 자동 인식) 씬 뷰/프리팹 편집
 * 화면에서 각 자식 노드를 직접 드래그해 원하는 배치(격자든 한 줄이든 무엇이든)를 자유롭게
 * 잡을 수 있다. 이름의 숫자 순서가 곧 배정 순서(Socket.ts가 요구 추종자 수만큼 앞에서부터
 * 채워 세운다).
 *
 * 슬롯 노드 자체는 빈 노드라 눈에 띄지 않으므로, showDebugMarkers를 켜두면 각 슬롯 위치에
 * 작은 박스를 그려 한눈에 배치를 확인하며 드래그할 수 있게 해준다 — Play/빌드 중에는
 * 항상 자동으로 숨겨진다.
 */
@ccclass('SocketPreviewSlots')
@executeInEditMode
export class SocketPreviewSlots extends Component {
    @property({ displayName: '슬롯 마커 표시', tooltip: '체크하면 씬/프리팹 편집 중에만 각 슬롯 위치에 작은 박스를 그려 눈으로 바로 확인/드래그할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.' })
    get showDebugMarkers(): boolean { return this._showDebugMarkers; }
    set showDebugMarkers(v: boolean) {
        this._showDebugMarkers = v;
        this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
    }
    private _showDebugMarkers = true;

    @property(Material) debugMaterial: Material | null = null;

    private _slots: Node[] = [];

    private _debugContainer: Node | null = null;
    private _debugMarkers: Node[] = [];
    private _markerMesh: Mesh | null = null;

    onLoad() {
        this._collectSlots();
        // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
        // 첫 프레임에서만 검사하면 프리팹 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
        if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureContainer().active = false;
        }
    }

    update() {
        // 디버그 마커는 씬/프리팹 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다.
        if (!EDITOR_NOT_IN_PREVIEW) return;
        this._collectSlots(); // 편집 중 슬롯 노드를 추가/삭제/이름변경해도 즉시 반영
        if (this._showDebugMarkers) this._redrawDebug();
        else if (this._debugContainer) this._debugContainer.active = false;
    }

    /** 현재 인식된 슬롯 개수 */
    get count(): number { return this._slots.length; }

    /** index번째 슬롯의 실시간 월드 좌표 (슬롯 노드를 옮기면 즉시 반영됨) */
    getSlotWorldPosition(index: number, out: Vec3): Vec3 {
        Vec3.copy(out, this._slots[index].worldPosition);
        return out;
    }

    private _collectSlots() {
        const found: { index: number; node: Node }[] = [];
        for (const child of this.node.children) {
            if (child.name === DEBUG_CONTAINER_NAME) continue;
            const m = /^PreviewSlot(\d+)$/.exec(child.name);
            if (m) found.push({ index: parseInt(m[1], 10), node: child });
        }
        found.sort((a, b) => a.index - b.index);
        this._slots = found.map(f => f.node);
    }

    private _ensureContainer(): Node {
        if (this._debugContainer && this._debugContainer.isValid) return this._debugContainer;
        let c = this.node.getChildByName(DEBUG_CONTAINER_NAME);
        if (!c) {
            c = new Node(DEBUG_CONTAINER_NAME);
            this.node.addChild(c);
        }
        c.setPosition(0, 0, 0);
        c.setRotationFromEuler(0, 0, 0);
        c.setScale(1, 1, 1);
        this._debugContainer = c;
        this._debugMarkers = c.children.slice();
        return c;
    }

    private _ensureMarkerCount(count: number) {
        const container = this._ensureContainer();
        if (!this._markerMesh) {
            this._markerMesh = utils.createMesh(primitives.box({ width: MARKER_SIZE, height: MARKER_SIZE, length: MARKER_SIZE }));
        }
        while (this._debugMarkers.length < count) {
            const marker = new Node(`marker_${this._debugMarkers.length}`);
            container.addChild(marker);
            const mr = marker.addComponent(MeshRenderer);
            mr.mesh = this._markerMesh;
            if (this.debugMaterial) mr.setMaterial(this.debugMaterial, 0);
            this._debugMarkers.push(marker);
        }
        for (let i = count; i < this._debugMarkers.length; i++) this._debugMarkers[i].active = false;
        for (let i = 0; i < count; i++) this._debugMarkers[i].active = true;
    }

    private _redrawDebug() {
        if (this._slots.length === 0) {
            if (this._debugContainer) this._debugContainer.active = false;
            return;
        }
        this._ensureContainer().active = true;
        this._ensureMarkerCount(this._slots.length);
        for (let i = 0; i < this._slots.length; i++) {
            this._debugMarkers[i].setWorldPosition(this._slots[i].worldPosition);
        }
    }
}
