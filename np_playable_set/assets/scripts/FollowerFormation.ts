import { _decorator, Component, Node, Vec3, Mesh, Material, MeshRenderer, utils, primitives } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

const DEBUG_CONTAINER_NAME = '__FollowerDebug__';
const MARKER_SIZE = 0.25; // 디버그 박스 한 변 길이(m)

/**
 * 추종 캐릭터들이 설 수 있는 고정 슬롯들을 정의한다. MapBounds.vertices와 같은 방식으로,
 * 슬롯 하나하나가 이 노드(플레이어)의 자식 노드로 존재하고("Slot0", "Slot1", ... 이름 순서로
 * 자동 인식) 씬 뷰에서 각 자식 노드를 직접 드래그해 원하는 대형(격자든 V자든 무엇이든)을
 * 자유롭게 잡을 수 있다. 이름의 숫자 순서가 곧 배정 우선순위(추종자가 하나씩 늘어날 때
 * 먼저 채워지는 순서)다.
 *
 * 슬롯 노드 자체는 빈 노드라 씬 뷰에서 눈에 띄지 않으므로, showDebugMarkers를 켜두면
 * 각 슬롯 위치에 작은 박스를 그려 한눈에 배치를 확인하며 드래그할 수 있게 해준다
 * (MapBounds의 showDebugOutline과 동일한 원리) — Play/빌드 중에는 항상 자동으로 숨겨진다.
 */
@ccclass('FollowerFormation')
@executeInEditMode
export class FollowerFormation extends Component {
    @property({ displayName: '슬롯 마커 표시', tooltip: '체크하면 씬 뷰(편집 중)에서만 각 슬롯 위치에 작은 박스를 그려 눈으로 바로 확인/드래그할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.' })
    get showDebugMarkers(): boolean { return this._showDebugMarkers; }
    set showDebugMarkers(v: boolean) {
        this._showDebugMarkers = v;
        this._debugContainer && (this._debugContainer.active = v && EDITOR_NOT_IN_PREVIEW);
    }
    private _showDebugMarkers = true;

    @property(Material) debugMaterial: Material | null = null;

    private _slots: Node[] = [];
    private _claimed: boolean[] = [];

    private _debugContainer: Node | null = null;
    private _debugMarkers: Node[] = [];
    private _markerMesh: Mesh | null = null;

    onLoad() {
        this._collectSlots();
        // Play/빌드 시작 시점에 즉시 숨긴다. _debugContainer는 지연 초기화라 update()의
        // 첫 프레임에서만 검사하면 씬 파일에 active:true로 저장된 상태가 그대로 노출될 수 있다.
        if (!EDITOR_NOT_IN_PREVIEW) {
            this._ensureContainer().active = false;
        }
    }

    update() {
        // 디버그 마커는 씬 편집 중(Play/빌드 아님)에만 시각화 보조로 그린다.
        if (!EDITOR_NOT_IN_PREVIEW) return;
        this._collectSlots(); // 에디터에서 슬롯 노드를 추가/삭제/이름변경해도 즉시 반영
        if (this._showDebugMarkers) this._redrawDebug();
        else if (this._debugContainer) this._debugContainer.active = false;
    }

    private _collectSlots() {
        const found: { index: number; node: Node }[] = [];
        for (const child of this.node.children) {
            if (child.name === DEBUG_CONTAINER_NAME) continue;
            const m = /^Slot(\d+)$/.exec(child.name);
            if (m) found.push({ index: parseInt(m[1], 10), node: child });
        }
        found.sort((a, b) => a.index - b.index);
        this._slots = found.map(f => f.node);
        if (this._claimed.length !== this._slots.length) this._claimed = new Array(this._slots.length).fill(false);
    }

    /** 비어있는 슬롯 중 이름 순서상 가장 먼저인 것을 하나 예약한다. 꽉 찼으면 -1 */
    reserveSlot(): number {
        for (let i = 0; i < this._claimed.length; i++) {
            if (!this._claimed[i]) {
                this._claimed[i] = true;
                return i;
            }
        }
        return -1;
    }

    /** 추종자가 사라질 때 자리를 반납 */
    releaseSlot(index: number) {
        if (this._claimed && index >= 0 && index < this._claimed.length) this._claimed[index] = false;
    }

    /** 슬롯의 실시간 월드 좌표 (슬롯 노드를 옮기거나 캐릭터가 움직이면 즉시 반영됨) */
    getSlotWorldPosition(index: number, out: Vec3): Vec3 {
        Vec3.copy(out, this._slots[index].worldPosition);
        return out;
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
