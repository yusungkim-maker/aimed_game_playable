import { _decorator, CCObject, Component, Node, Material, MeshRenderer, Quat, Vec3, utils, primitives } from 'cc';
import { EDITOR_NOT_IN_PREVIEW, PREVIEW } from 'cc/env';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
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

    @property({ displayName: '외곽선 표시', tooltip: '체크하면 씬 뷰(편집 중)에 이 노드의 실제 위치/회전/스케일 그대로 반투명 박스를 그려서 막힐 영역을 눈으로 확인할 수 있습니다. 플레이 중에도 보려면 아래 "플레이 중에도 표시"를 함께 켜세요.' })
    get showDebugOutline(): boolean { return this._showDebugOutline; }
    set showDebugOutline(v: boolean) {
        this._showDebugOutline = v;
        this._gizmo && (this._gizmo.active = v && this._canShowGizmo());
    }
    private _showDebugOutline = true;

    @property({ displayName: '플레이 중에도 표시', tooltip: '체크하면 위 반투명 박스가 **프리뷰(Play)에서도** 보인다 — 건물이 이미지를 세워 만든 것이라 막히는 범위를 씬 뷰만 보고 맞추기 어려울 때, 실제로 걸어 보면서 스케일·회전을 맞추기 위한 것이다. 기본값은 꺼짐이라 켜기 전까지는 예전과 똑같이 동작한다. **빌드에는 켜져 있어도 절대 나오지 않는다** — 끄는 것을 잊어도 출고본이 더러워지지 않게 일부러 그렇게 막아뒀다' })
    showInPlay: boolean = false;

    @property({ type: TriggerId, displayName: '등장 트리거', tooltip: '이 트리거가 발화하는 순간부터 막기 시작한다. None(기본)이면 쓰지 않는다. **부모 건물의 BuildingTrigger가 알아서 켜주므로 건물 안에 넣은 벽에는 필요 없다** — 벽을 건물 바깥(공용 정리 노드 등)에 두었을 때, 그래도 그 건물이 설 때 맞춰 막고 싶을 때 쓴다' })
    activateTriggerId: TriggerId = TriggerId.None;

    @property({ displayName: '시작부터 막기', tooltip: '체크하면 씬이 시작될 때 스스로 막기 시작한다. **끄면(기본) BuildingTrigger가 건물을 등장시키는 순간까지 통과 가능하다** — 아직 지어지지 않은 건물이 길을 막으면 안 되기 때문이다. 처음부터 그 자리에 있는 것(기지·바위·울타리)에만 켠다. 켜는 순간의 위치/회전/크기가 그대로 굳으므로, 켠 뒤에 노드를 옮겨도 막는 자리는 따라오지 않는다' })
    activateOnLoad: boolean = false;

    @property({ type: Material, displayName: '외곽선 재질', tooltip: '반투명 박스에 쓸 재질 — VirtualWall.prefab에 미리 지정해두었으므로 보통은 건드릴 필요 없다' })
    gizmoMaterial: Material | null = null;

    /** 갇힌 몬스터를 밀어낼 방향 — 이 박스의 로컬 +Z 부호. 0이면 "가장 가까운 면"으로
     * 밀어낸다. 링처럼 안/밖이 분명한 배치에서는 setOutwardFrom()으로 바깥쪽을 박아둔다. */
    outwardSign = 0;

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
        // yaw는 **그대로** 쓴다 — 부호를 뒤집으면 안 된다. blocks()가 계산하는
        //     lx = dx·cosψ − dz·sinψ,   lz = dx·sinψ + dz·cosψ
        // 는 "월드 델타를 이 박스의 로컬 축에 내린 정사영"이다 (yaw ψ인 노드의 로컬 +X는
        // 월드 (cosψ, −sinψ), 로컬 +Z는 월드 (sinψ, cosψ) 방향을 가리킨다).
        // 여기에 −ψ를 넣으면 sin 항의 부호가 뒤집혀 **박스가 yaw −ψ로 놓인 것처럼** 판정된다.
        // yaw가 90°의 배수일 때는 박스가 대칭이라 결과가 같아서 티가 나지 않지만(씬 1의 문이
        // 어찌어찌 동작한 이유), 45° 계열에서는 박스가 90° 돌아간 채로 판정돼 실제로 막아야
        // 할 자리가 그대로 뚫린다 — 씬 2의 돌 벽 링에서 변 중앙 타워 4곳(Tower-001/002/005/008,
        // 링 기준 약 47°/136°/226°/315° 방향)에 폭 0.33m짜리 구멍 4개가 생겨 몬스터가 그리로
        // 걸어 들어왔다. 이 링은 벽 간격 0.95m에 박스 폭(+마진) 2.6m라 제대로 판정하면 넉넉히
        // 겹치는데, 90° 돌아간 박스는 진행 방향 반폭이 0.75m뿐이라 타워를 건너뛰지 못한다.
        const yaw = this._yaw(this.node.worldRotation);
        this._cachedX = p.x;
        this._cachedZ = p.z;
        this._cachedCos = Math.cos(yaw);
        this._cachedSin = Math.sin(yaw);
        this._cachedHalfW = Math.abs(s.x) / 2 + this.margin;
        this._cachedHalfD = Math.abs(s.z) / 2 + this.margin;
        const r = Math.hypot(this._cachedHalfW, this._cachedHalfD);
        this._cachedBoundRadiusSq = r * r;
        this._active = true;
    }

    onEnable() {
        VirtualWall.all.push(this);
        // 트리거로 등장하지 않는 것(기지·울타리 등)은 스스로 켠다. start()가 아니라 여기서
        // 켜는 이유는, 런타임에 만들어 붙이는 울타리 조각도 붙는 즉시 막아야 하기 때문이다.
        if (this.activateOnLoad) this.activate();
        if (this.activateTriggerId !== TriggerId.None) {
            CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
        }
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (triggerId === this.activateTriggerId) this.activate();
    }
    onDisable() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
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

    /**
     * **벽에 막혔을 때 "미끄러지듯" 지나가게 하는 이동 해결.**
     *
     * 예전에는 부르는 쪽(Player)이 월드 X축, 그다음 Z축을 따로 시도해서 막히는 축만 취소했다.
     * 벽이 축에 나란히 놓여 있으면 그게 곧 미끄러짐이 되지만, **벽이 45도로 놓이면 두 축이
     * 동시에 막혀 그 자리에 완전히 멈춰 선다** — 씬 3의 울타리가 −45도라 정확히 이 경우였고,
     * "꺼끌꺼끌한 표면에 걸린 것 같다"는 느낌이 여기서 나온다.
     *
     * 그래서 **막은 벽 자신의 축**을 기준으로 푼다. 벽을 파고드는 성분만 죽이고 벽을 따라가는
     * 성분은 그대로 남기면, 벽이 어떤 각도로 놓여 있든 그 면을 따라 매끄럽게 미끄러진다.
     * 벽이 축에 나란한 경우에는 벽의 축 = 월드 축이라 예전과 결과가 완전히 같다(씬 1·2 무영향).
     *
     * @param px,pz 지금 위치(막혀 있지 않다고 가정 — 부르는 쪽이 갇힘 검사를 먼저 한다)
     * @param nx,nz 가려는 위치
     * @param out   실제로 갈 수 있는 위치를 담는다
     */
    static slideForPlayer(px: number, pz: number, nx: number, nz: number, out: Vec3) {
        if (!VirtualWall.isBlockedForPlayer(nx, nz)) { out.set(nx, 0, nz); return; }

        // 막은 벽을 찾는다. 여러 개면 첫 번째 것의 면을 따라 미끄러진다 — 두 벽이 만나는
        // 구석에서는 아래 재검사가 걸려 결국 멈추므로, 여기서 더 정교하게 고를 필요가 없다.
        let hit: VirtualWall | null = null;
        for (const w of VirtualWall.all) {
            if (w.playerCanPass) continue;
            if (w.blocks(nx, nz)) { hit = w; break; }
        }
        if (!hit) { out.set(nx, 0, nz); return; }

        // 이동 벡터와 "지금 위치"를 그 벽의 로컬 축으로 옮긴다.
        const dx = nx - px, dz = nz - pz;
        const c = hit._cachedCos, sn = hit._cachedSin;
        const ldx = dx * c - dz * sn;
        const ldz = dx * sn + dz * c;
        const ox = px - hit._cachedX, oz = pz - hit._cachedZ;
        const olx = ox * c - oz * sn;
        const olz = ox * sn + oz * c;

        // 지금 위치가 이미 벗어나 있던 축이 곧 "뚫고 들어간 면"이다 — 그 축 성분만 죽인다.
        let klx = ldx, klz = ldz;
        if (Math.abs(olx) > hit._cachedHalfW) klx = 0;
        if (Math.abs(olz) > hit._cachedHalfD) klz = 0;
        // 두 면을 동시에 넘은 모서리 진입이면 더 깊이 파고든 축을 죽인다.
        if (klx === 0 && klz === 0) {
            if (Math.abs(olx) - hit._cachedHalfW >= Math.abs(olz) - hit._cachedHalfD) klz = ldz;
            else klx = ldx;
        }

        const sx = px + (klx * c + klz * sn);
        const sz = pz + (-klx * sn + klz * c);
        // 미끄러진 자리가 또 막히면(구석) 그냥 멈춘다 — 여기서 더 밀어붙이면 벽을 통과한다.
        if (VirtualWall.isBlockedForPlayer(sx, sz)) out.set(px, 0, pz);
        else out.set(sx, 0, sz);
    }

    /** 이 벽이 링의 어느 쪽을 "바깥"으로 볼지 정한다 — 갇힌 몬스터를 그쪽으로 밀어낸다.
     * activate() 뒤에 호출해야 한다(캐싱된 위치/회전을 쓴다). 호출하지 않으면 outwardSign이
     * 0으로 남아 "가장 가까운 면"으로 밀어내는 기본 동작이 된다. */
    setOutwardFrom(cx: number, cz: number) {
        const dx = this._cachedX - cx, dz = this._cachedZ - cz;
        // 로컬 +Z의 월드 방향은 (sin, cos)이다 (blocks()의 축 정의와 동일).
        this.outwardSign = (dx * this._cachedSin + dz * this._cachedCos) >= 0 ? 1 : -1;
    }

    /** (x,z)가 어떤 벽 안에 갇혀 있으면, 거기서 빠져나갈 방향(월드 XZ 단위벡터)을 out에
     * 담고 true를 돌려준다. 갇혀 있지 않으면 false.
     *
     * **왜 필요한가**: 벽이 생성되는 순간 하필 몬스터와 겹치면 몬스터는 영원히 갇힌다.
     * 예전에는 "갇힌 벽은 판정에서 빼준다"는 예외로 풀었는데, 돌 벽 링은 박스(폭 2.6m)가
     * 간격 0.95m로 겹겹이 놓여 있어서 밴드 안의 한 점은 보통 벽 3개 안에 동시에 들어간다 —
     * 그 3개가 전부 예외로 빠지면 그 자리에는 막는 벽이 하나도 남지 않아 **방어선을 그대로
     * 걸어서 통과했다**(실측: 밴드 바깥 끝에서 출발한 몬스터가 360방향 중 315방향에서 관통).
     * 그래서 예외를 두지 않고, 갇힌 몬스터는 아예 바깥으로 밀어내 정상 판정으로 되돌린다.
     *
     * 여러 벽에 동시에 갇혀 있으면 각 벽의 바깥 방향을 합쳐서 쓴다(링에서는 세 벽의 방향이
     * 거의 같아 그대로 바깥을 가리킨다). 서로 정확히 상쇄되면 첫 벽의 방향을 쓴다. */
    static ejectDir(x: number, z: number, out: Vec3): boolean {
        let sx = 0, sz = 0, fx = 0, fz = 0, n = 0;
        for (const w of VirtualWall.all) {
            if (!w.blocks(x, z)) continue;
            let sign = w.outwardSign;
            if (sign === 0) {
                // 지정된 바깥쪽이 없으면 지금 더 가까운 면 쪽으로.
                const dx = x - w._cachedX, dz = z - w._cachedZ;
                sign = (dx * w._cachedSin + dz * w._cachedCos) >= 0 ? 1 : -1;
            }
            const ux = w._cachedSin * sign, uz = w._cachedCos * sign;
            if (n === 0) { fx = ux; fz = uz; }
            sx += ux; sz += uz; n++;
        }
        if (n === 0) return false;
        let len = Math.hypot(sx, sz);
        if (len < 1e-4) { sx = fx; sz = fz; len = Math.hypot(sx, sz) || 1; }
        out.set(sx / len, 0, sz / len);
        return true;
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
    /** 이 박스를 그려도 되는 환경인가. **빌드에서는 무슨 값을 켜두든 false다** — 디버그용
     * 시각화가 출고본에 실려 나가는 사고를 코드 레벨에서 못 하게 막는다. */
    private _canShowGizmo(): boolean {
        return EDITOR_NOT_IN_PREVIEW || (PREVIEW && this.showInPlay);
    }

    onLoad() {
        if (this._canShowGizmo()) { this._ensureGizmo().active = this._showDebugOutline; return; }
        // 안 보일 환경에서는 **새로 만들지 않는다.** 다만 예전에 씬에 저장돼 버린 박스가
        // 남아 있을 수 있으므로 그것만 찾아서 끈다(DontSave 이전에 저장된 씬 대비).
        const g = this.node.getChildByName(GIZMO_NODE_NAME);
        if (g) g.active = false;
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
        // 이 박스는 **에디터에서 보기 위한 것**이라 씬에 저장되면 안 된다. 저장되면 빌드에
        // 안 보이는 노드가 벽 수만큼 실리고, 씬 파일도 그만큼 불어난다.
        // 매번 다시 찍는 이유는 EditorGizmoController와 같다 — 이 플래그 없이 **이미 저장돼
        // 버린** 씬을 열었을 때도 다음 저장에서 저절로 빠지게 하려는 것이다.
        this._gizmo.hideFlags |= CCObject.Flags.DontSave;
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
