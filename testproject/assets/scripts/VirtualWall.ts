import { _decorator, Component, Node, Material, MeshRenderer, Quat, utils, primitives } from 'cc';
import { EDITOR_NOT_IN_PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

const GIZMO_NODE_NAME = '__VirtualWallGizmo__';

/**
 * 건물이 서 있는 자리를 캐릭터/몬스터가 통과하지 못하게 막는 "가상의 벽".
 * 실제로 렌더링되는 건물 메쉬와는 완전히 별개의 노드다 — 이 노드 자신의 위치/회전/스케일이
 * 곧 막을 영역 그 자체이므로(스케일 1 = 가로세로 1m 정육면체 기준), 씬/프리팹 편집 화면에서
 * 평소에 오브젝트를 옮기고 늘리는 것과 똑같은 방식으로 드래그해서 크기를 맞추면 된다 —
 * "프리팹 기준 스케일 1일 때의 폭" 같은 별도 숫자 계산이 필요 없다.
 *
 * 건물(Tower/Wall/Door1 등) 프리팹 안에 자식 노드로 넣어두면, 그 건물이 씬에서 어떤
 * 스케일로 배치되든 부모-자식 변환 합성 덕분에 이 벽도 자동으로 같은 비율로 늘어난다.
 *
 * BuildingTrigger가 소켓 완료로 건물이 "등장"하는 바로 그 순간 activate()를 호출해야
 * 실제로 막기 시작한다 — 그 전(트리거 전 숨겨진 상태)에는 항상 통과 가능.
 */
@ccclass('VirtualWall')
@executeInEditMode
export class VirtualWall extends Component {
    /** 현재 씬에서 활성화된 모든 가상의 벽 — Player/Monster가 매 프레임 순회하며 충돌 판정한다 */
    static all: VirtualWall[] = [];

    @property({ displayName: '여유 마진(m)', tooltip: '캐릭터가 벽에 파묻히지 않도록 이 노드의 실제 크기보다 살짝 넓게 막을 여유분(캐릭터 반경 정도) — 스케일과 무관하게 항상 실제 미터 단위' })
    margin: number = 0.3;

    @property({ displayName: '플레이어는 통과 가능', tooltip: '체크하면 이 벽은 몬스터만 막고 플레이어(및 추종자)는 그냥 지나다닐 수 있다 — 문(Door)처럼 몬스터는 반드시 부숴야 하지만 플레이어의 이동은 방해하면 안 되는 경우에 사용. isBlockedForPlayer()에서만 제외되고, 몬스터가 쓰는 isBlocked()는 그대로 막는다' })
    playerCanPass: boolean = false;

    @property({ displayName: '외곽선 표시', tooltip: '체크하면 씬 뷰(편집 중)에서만 이 노드의 실제 위치/회전/스케일 그대로 반투명 박스를 그려서 막힐 영역을 눈으로 확인할 수 있습니다. Play/빌드 중에는 항상 숨겨집니다.' })
    get showDebugOutline(): boolean { return this._showDebugOutline; }
    set showDebugOutline(v: boolean) {
        this._showDebugOutline = v;
        this._gizmo && (this._gizmo.active = v && EDITOR_NOT_IN_PREVIEW);
    }
    private _showDebugOutline = true;

    @property({ type: Material, displayName: '외곽선 재질', tooltip: '반투명 박스에 쓸 재질 — VirtualWall.prefab에 미리 지정해두었으므로 보통은 건드릴 필요 없다' })
    gizmoMaterial: Material | null = null;

    private _gizmo: Node | null = null;
    /** BuildingTrigger가 건설(등장) 시점에 true로 켜주기 전까지는 막지 않는다 */
    private _active = false;

    // ── 판정용 캐시 — 건물은 activate() 이후 절대 움직이거나 회전하지 않으므로,
    // blocks() 호출마다 매번 위치/삼각함수를 다시 구하지 않고 activate() 시점에 한 번만
    // 계산해둔다. Player+최대 40마리 몬스터가 매 프레임 모든 벽에 대해 이 함수를 부르는
    // 핫패스라, 여기서 아낀 게 그대로 체감 성능으로 이어진다.
    private _cachedX = 0;
    private _cachedZ = 0;
    private _cachedCos = 1;
    private _cachedSin = 0;
    private _cachedHalfW = 0;
    private _cachedHalfD = 0;
    /** 바깥 경계원(half-diagonal+margin)의 제곱 — 이 밖이면 회전 변환까지 갈 것도 없이 즉시 통과 */
    private _cachedBoundRadiusSq = 0;

    /** 건설 완료(등장) 시점에 BuildingTrigger가 호출 — 이 순간부터 통과 불가.
     * 이 시점의 실제 worldPosition/worldRotation/worldScale을 그대로 읽어서 캐싱하므로,
     * 이 노드를 어떤 부모 아래 어떤 스케일로 배치했든 "지금 실제로 보이는 그 크기"가 그대로
     * 판정 크기가 된다. */
    activate() {
        const p = this.node.worldPosition;
        const s = this.node.worldScale;
        const angle = -this._yaw(this.node.worldRotation);
        this._cachedX = p.x;
        this._cachedZ = p.z;
        this._cachedCos = Math.cos(angle);
        this._cachedSin = Math.sin(angle);
        this._cachedHalfW = Math.abs(s.x) / 2 + this.margin;
        this._cachedHalfD = Math.abs(s.z) / 2 + this.margin;
        const r = Math.hypot(this._cachedHalfW, this._cachedHalfD);
        this._cachedBoundRadiusSq = r * r;
        this._active = true;
    }

    onEnable() { VirtualWall.all.push(this); }
    onDisable() {
        const i = VirtualWall.all.indexOf(this);
        if (i >= 0) VirtualWall.all.splice(i, 1);
    }

    /** 이 벽이 월드 (x,z) 지점을 막고 있는지 (활성화 전이면 항상 통과 가능) */
    blocks(x: number, z: number): boolean {
        if (!this._active) return false;
        const dx = x - this._cachedX, dz = z - this._cachedZ;

        // 조기 컷: 벽 중심에서 (여유분 포함) 최대 반경 밖이면 회전 변환 계산 없이 바로 통과.
        if (dx * dx + dz * dz > this._cachedBoundRadiusSq) return false;

        const lx = dx * this._cachedCos - dz * this._cachedSin;
        const lz = dx * this._cachedSin + dz * this._cachedCos;
        return Math.abs(lx) <= this._cachedHalfW && Math.abs(lz) <= this._cachedHalfD;
    }

    /** 등록된 벽 중 하나라도 (x,z)를 막고 있으면 true — 몬스터가 사용 (playerCanPass 여부와
     * 무관하게 전부 막는다, 문도 부수기 전까지는 몬스터를 막아야 하므로) */
    static isBlocked(x: number, z: number): boolean {
        for (const w of VirtualWall.all) {
            if (w.blocks(x, z)) return true;
        }
        return false;
    }

    /** 플레이어(및 추종자) 전용 판정 — playerCanPass가 체크된 벽(예: 문)은 건너뛰고,
     * 그 외 일반 벽/타워만 막는다. */
    static isBlockedForPlayer(x: number, z: number): boolean {
        for (const w of VirtualWall.all) {
            if (w.playerCanPass) continue;
            if (w.blocks(x, z)) return true;
        }
        return false;
    }

    private _yaw(q: Quat): number {
        // 건물은 지면에 눕지 않는다고 가정하고 Y축 회전만 추출
        return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
    }

    // ── 에디터 디버그 시각화 ──────────────────────────────────────────────
    // 이 노드 자신의 로컬 변환은 절대 건드리지 않고, 로컬 트랜스폼이 항등(identity)인
    // 자식 노드 하나에 1x1x1 큐브 메쉬를 얹어둔다 — 부모(이 노드)의 실제 위치/회전/스케일이
    // 그대로 상속되므로 "지금 이 노드가 어떤 모양으로 막고 있는지"를 별도 계산 없이 그대로
    // 보여준다.
    onLoad() {
        if (!EDITOR_NOT_IN_PREVIEW) { this._ensureGizmo().active = false; return; }
        this._ensureGizmo().active = this._showDebugOutline;
    }

    private _ensureGizmo(): Node {
        if (!this._gizmo || !this._gizmo.isValid) {
            let g = this.node.getChildByName(GIZMO_NODE_NAME);
            if (!g) {
                g = new Node(GIZMO_NODE_NAME);
                this.node.addChild(g);
                g.setPosition(0, 0, 0);
                g.setRotationFromEuler(0, 0, 0);
                g.setScale(1, 1, 1);
            }
            this._gizmo = g;
        }
        // 큐브 메쉬는 utils.createMesh()로 그때그때 만드는 런타임 전용 리소스라 에셋 UUID가
        // 없다 — 프리팹/씬을 저장했다가 다시 열면(자식 노드 자체는 남아있어도) mesh 참조가
        // 되살아나지 않는다. 그래서 "노드가 이미 있으니 끝" 하고 넘기지 않고, 매번 mesh가
        // 비어있는지 검사해서 없으면 다시 만들어 채워준다.
        const mr = this._gizmo.getComponent(MeshRenderer) ?? this._gizmo.addComponent(MeshRenderer);
        if (!mr.mesh) mr.mesh = utils.createMesh(primitives.box({ width: 1, height: 1, length: 1 }));
        if (this.gizmoMaterial && mr.sharedMaterial !== this.gizmoMaterial) mr.setMaterial(this.gizmoMaterial, 0);
        return this._gizmo;
    }
}
