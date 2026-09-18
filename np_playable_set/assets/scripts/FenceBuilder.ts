import { _decorator, CCFloat, CCInteger, CCObject, Component, Material, MeshRenderer, Node, Prefab, SkinnedMeshRenderer, Vec3, instantiate, tween } from 'cc';
import { EDITOR } from 'cc/env';
import { VirtualWall } from './VirtualWall';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property, executeInEditMode, disallowMultiple } = _decorator;

const _a = new Vec3();
const _b = new Vec3();
const _d = new Vec3();

/**
 * 경로 점을 따라 **기둥 + 연결 모듈**로 울타리를 세운다.
 *
 * **경로는 자식 노드로 정의한다** — `Point0`, `Point1`, `Point2`… 이름 규칙으로 순서대로
 * 인식한다(`RushPath`의 `Anchor0…`, `FollowerFormation`의 `Slot0…`과 같은 컨벤션). 배열
 * 프로퍼티를 쓰지 않는 이유는 두 가지다: 배열은 MCP/툴로 채우기 까다롭고, 씬 뷰에서 노드를
 * 그냥 끌면 형태가 바뀌는 편이 훨씬 빠르다.
 *
 * **씬이나 특정 노드 이름에 종속되지 않는다.** 무엇을 세울지(연결/기둥 프리팹), 한 칸의 기본
 * 길이, 바닥 높이, 어느 구간을 비울지(출입구)가 전부 인스펙터 값이라 다른 씬·다른 모델에
 * 그대로 가져다 쓸 수 있다.
 *
 * **만든 노드에는 `DontSave` 플래그를 찍어 씬 파일에 저장되지 않는다**(`ScatterField`와 같은
 * 방식). 씬에는 경로 점 몇 개만 남고 울타리 조각 수십 개는 실행 시점에 만들어지므로 씬
 * 파일이 불지 않는다. 대신 하이라키에 보이는 조각을 하나씩 골라 옮길 수는 없다 — 형태를
 * 바꾸려면 경로 점을 옮긴다.
 *
 * **길이 맞추기**: 한 구간(기둥과 기둥 사이)을 `기본 길이`에 가장 가까운 **정수 개**로 나누고,
 * 그 개수로 균등 분할한 길이를 쓴다. 그래서 구간 끝에 짧은 자투리가 남지 않는다. 길이 보정은
 * **길이 축(로컬 X)에만** 적용하고 높이·두께는 건드리지 않는다.
 *
 * **연결부 가리기**: 가로대는 기둥 **중심에서 중심까지** 뻗는다. 기둥이 그보다 두꺼우므로
 * 가로대 끝이 기둥 안에 완전히 묻혀 이음매가 보이지 않고, 기둥 바깥으로도 튀어나오지 않는다.
 *
 * 설정되지 않으면 무동작이다 — 프리팹이 비었거나 점이 2개 미만이면 아무것도 만들지 않는다.
 */
@ccclass('FenceBuilder')
@executeInEditMode
@disallowMultiple
export class FenceBuilder extends Component {
    @property({ type: Prefab, displayName: '연결 프리팹', tooltip: '기둥과 기둥 사이를 채울 울타리 한 칸. 길이 축이 로컬 X여야 하고, 원점이 그 칸의 가운데여야 한다(Fence_Connection_3m이 그렇다). 비워두면 가로대 없이 기둥만 선다' })
    connectionPrefab: Prefab | null = null;

    @property({ type: Prefab, displayName: '기둥 프리팹', tooltip: '방향이 바뀌는 지점과 출입구 양 끝에 세울 장식 기둥. 원점이 바닥 중앙이어야 땅에 붙는다. 비워두면 기둥 없이 가로대만 놓인다' })
    postPrefab: Prefab | null = null;

    @property({ type: CCFloat, displayName: '연결 기본 길이(m)', tooltip: '연결 프리팹 한 칸의 원래 길이(Fence_Connection_3m은 3). 이 값을 기준으로 구간을 몇 칸으로 나눌지 정하고, 실제 칸 길이는 구간을 균등 분할한 값이 된다 — 그래서 칸마다 살짝 늘거나 줄 수 있다. **모델의 실제 길이와 다르게 적으면 칸이 늘어나거나 겹친다**' })
    moduleLength: number = 3;

    @property({ type: CCFloat, displayName: '울타리 크기 배율', tooltip: '울타리 전체(기둥과 가로대)를 이 배율로 키우거나 줄인다. **한 칸의 실제 길이도 같이 줄어들므로**(기본 길이 3m × 이 값) 구간을 나눌 때 그 줄어든 길이를 기준으로 칸 수를 다시 센다 — 즉 작게 하면 칸이 더 촘촘하게 많이 들어간다. 가로대의 높이·두께와 기둥은 이 값 그대로 곱해지고, 가로대의 **길이만** 구간에 맞춰 따로 조정된다. 1(기본)이면 모델 원래 크기다' })
    fenceScale: number = 1;

    @property({ type: CCFloat, displayName: '칸 길이 상한 배율', tooltip: '한 칸이 기본 길이의 이 배를 넘게 늘어나면 칸을 하나 더 넣어 대신 줄인다. 울타리는 **늘어난 것이 줄어든 것보다 훨씬 티가 난다** — 살이 벌어져 성글어 보이기 때문이다. 1.3(기본)이면 3m 칸이 3.9m까지는 늘어나도 두고 그 이상이면 쪼갠다. 1.0으로 두면 절대 늘이지 않고 항상 촘촘해지고, 아주 크게 두면 칸 수는 적지만 벌어진 칸이 생긴다' })
    maxStretch: number = 1.3;

    @property({ type: CCFloat, displayName: '바닥 높이(m)', tooltip: '울타리를 놓을 Y 높이. 바닥 메시가 y=0이 아니거나 살짝 파묻혀 보이면 여기서 들어올린다. 경로 점의 Y는 무시하고 이 값을 쓴다 — 점을 옮기다 높이가 제각각이 되는 것을 막기 위해서다' })
    groundY: number = 0;

    @property({ displayName: '닫힌 경로', tooltip: '체크(기본)하면 마지막 점과 첫 점을 이어 한 바퀴를 닫는다. 끄면 끝에서 끊긴 열린 울타리가 된다' })
    closed: boolean = true;

    @property({ type: CCInteger, displayName: '출입구 구간 번호', tooltip: '이 번호의 구간만 가로대를 놓지 않아 출입구가 된다. 구간 번호는 점 번호와 같다 — 0번 구간은 Point0에서 Point1까지다. **-1(기본)이면 출입구가 없다.** 양 끝의 기둥은 그대로 서므로 문설주가 된다. 구간을 두 개 이상 비워야 하면 아래 "출입구 구간 번호 2"를 쓴다' })
    gateSegment: number = -1;

    @property({ type: CCInteger, displayName: '출입구 구간 번호 2', tooltip: '비울 구간이 하나 더 필요할 때. -1(기본)이면 쓰지 않는다' })
    gateSegment2: number = -1;

    @property({ type: CCInteger, displayName: '출입구 구간 번호 3', tooltip: '비울 구간이 또 하나 필요할 때. -1(기본)이면 쓰지 않는다. 넷 이상이 필요해지면 그때 칸을 더 만드는 대신, 비울 구간이 서로 붙어 있는지부터 의심해 본다 — 붙어 있다면 점 하나를 지워 한 구간으로 합치는 편이 낫다' })
    gateSegment3: number = -1;

    @property({ type: CCFloat, displayName: '기둥 크기 배율', tooltip: '모든 기둥에 똑같이 곱할 배율. 1이면 모델 원래 크기다 — 기둥마다 다르게 주지 않는 이유는 크기가 들쭉날쭉하면 울타리가 수제처럼 보이기 때문이다' })
    postScale: number = 1;

    // ── 가지 못하게 막기 ────────────────────────────────────────────────
    @property({ displayName: '통과 막기', tooltip: '체크하면 울타리가 선 구간마다 "가상의 벽"(VirtualWall)을 하나씩 같이 만들어 캐릭터가 통과하지 못하게 한다. **비운 구간(출입구)에는 만들지 않으므로 거기로만 드나들 수 있다.** 끄면(기본) 울타리는 장식일 뿐이고 그냥 지나다닐 수 있다' })
    blockPassage: boolean = false;

    @property({ type: CCFloat, displayName: '막는 두께(m)', tooltip: '막는 박스의 두께(울타리를 가로지르는 방향). 울타리 판 자체는 아주 얇지만, 너무 얇게 막으면 빠르게 움직이는 캐릭터가 한 프레임에 건너뛰어 통과해버린다. 0.4~0.8 정도가 안전하다' })
    blockThickness: number = 0.6;

    @property({ type: CCFloat, displayName: '막기 여유 마진(m)', tooltip: '각 박스의 VirtualWall에 넣을 여유분 — 캐릭터가 울타리에 파묻히지 않도록 실제 크기보다 조금 더 넓게 막는다. 캐릭터 반경 정도가 적당하다' })
    blockMargin: number = 0.3;

    @property({ displayName: '막는 박스 보이기', tooltip: '체크하면 씬 뷰(편집 중)에서만 막히는 영역이 반투명 박스로 보인다 — **눈으로 보면서 두께를 맞추라고 있는 것이다.** Play/빌드에서는 항상 숨겨진다' })
    blockShowOutline: boolean = true;

    @property({ displayName: '막는 박스를 플레이 중에도 표시', tooltip: '체크하면 위 박스가 **프리뷰(Play)에서도** 보인다 — 실제로 걸어 보면서 울타리가 막는 범위를 확인할 때 쓴다. 각 박스의 VirtualWall에 그대로 전달된다. 기본값은 꺼짐이고, 빌드에는 켜져 있어도 나오지 않는다' })
    blockShowInPlay: boolean = false;

    @property({ type: Material, displayName: '막는 박스 재질', tooltip: '위 반투명 박스에 쓸 재질. 비워두면 박스가 그려지지 않는다(막는 동작 자체는 그대로다) — 씬 1·2의 VirtualWall.prefab이 쓰는 것과 같은 재질을 넣으면 색이 통일된다' })
    blockMaterial: Material | null = null;

    // ── 등장 ────────────────────────────────────────────────────────────
    @property({ type: TriggerId, displayName: '등장 트리거', tooltip: '이 트리거가 발화할 때까지 울타리를 **숨겨두고 막지도 않는다.** None(기본)이면 처음부터 서 있다. 씬 3에서는 대장간이 서는 트리거(4)를 넣어 바닥(ground_dirt)과 함께 나오게 한다. 숨어 있는 동안에도 경로 점은 그대로라 에디터에서는 형태를 계속 볼 수 있다' })
    appearTriggerId: TriggerId = TriggerId.None;

    @property({ type: CCFloat, displayName: '등장 지연(초)', tooltip: '트리거가 발화한 뒤 이만큼 기다렸다가 나타난다. 같은 트리거로 함께 서는 것들(바닥·건물)의 "건설 지연"과 맞춰두면 순서대로 지어지는 것처럼 보인다' })
    appearDelay: number = 0;

    @property({ type: CCFloat, displayName: '등장 확대 시간(초)', tooltip: '0보다 크면 울타리 조각 하나하나가 크기 0에서 제 크기까지 이 시간 동안 커진다. 0(기본)이면 예전처럼 그냥 나타난다. 조각마다 자기 크기가 다르므로(가로대는 구간 길이만큼 늘어나 있다) 커지기 직전에 각자의 크기를 읽어 그 값으로 돌아간다' })
    appearScaleDuration: number = 0;

    @property({ type: CCFloat, displayName: '조각별 등장 간격(초)', tooltip: '0보다 크면 조각이 한꺼번에 커지지 않고 이 간격만큼 차례로 커진다 — 울타리가 한쪽 끝에서부터 세워지는 것처럼 보인다. 조각이 30개 가까이 되므로 0.05만 줘도 전체가 1.5초쯤 걸린다. 0(기본)이면 전부 동시에' })
    appearStagger: number = 0;

    @property({ displayName: '미리보기 새로 고침', tooltip: '체크했다 풀면 울타리를 다시 만든다. 경로 점을 옮기면 저절로 다시 만들어지므로 보통 쓸 일이 없다 — 프리팹을 바꿨는데 반영이 안 될 때만 쓴다' })
    get rebuildNow(): boolean { return false; }
    set rebuildNow(_v: boolean) { this._rebuild(); }

    /** 마지막으로 반영한 설정의 지문 — 에디터에서 점을 옮긴 것을 알아채는 데만 쓴다. */
    private _sig = '';
    /** 이번에 만든 막는 벽들 — 등장 트리거로 한꺼번에 켜야 해서 들고 있는다. */
    private _walls: VirtualWall[] = [];
    /** 등장 트리거를 기다리는 중인지. 기다리는 동안에는 보이지도, 막지도 않는다. */
    private _hidden = false;

    onLoad() {
        // 에디터에서는 트리거가 돌지 않으므로 항상 보여준다 — 안 그러면 형태를 맞출 수가 없다.
        this._hidden = !EDITOR && this.appearTriggerId !== TriggerId.None;
        this._rebuild();
        if (this._hidden) CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
        this._clear();
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (!this._hidden || triggerId !== this.appearTriggerId) return;
        if (this.appearDelay > 0) this.scheduleOnce(() => this._appear(), this.appearDelay);
        else this._appear();
    }

    /** 숨겨뒀던 울타리를 드러내고 그때부터 막기 시작한다. **막기는 이 순간에 켠다** —
     * 아직 서지도 않은 울타리가 길을 막고 있으면 안 되기 때문이다. */
    private _appear() {
        this._hidden = false;
        this._setBuiltVisible(true);
        for (const w of this._walls) if (w && w.isValid) w.activate();
        this._playAppearScale();
    }

    /**
     * 조각마다 크기 0 → 제 크기로 부풀린다. **각자의 크기를 지금 읽는 이유**는 가로대가 구간
     * 길이에 맞춰 길이축만 늘어나 있어 조각마다 값이 다르기 때문이다 — 하나의 기준 크기로
     * 되돌리면 울타리가 전부 같은 길이로 뭉개진다.
     * 경로 점(Point0…)은 DontSave가 아니므로 건드리지 않는다.
     */
    private _playAppearScale() {
        if (this.appearScaleDuration <= 0) return;
        let i = 0;
        for (const n of this.node.children) {
            if ((n.hideFlags & CCObject.Flags.DontSave) === 0) continue;
            const base = n.scale.clone();
            n.setScale(0, 0, 0);
            const t = tween(n);
            if (this.appearStagger > 0) t.delay(this.appearStagger * i);
            t.to(this.appearScaleDuration, { scale: base }).start();
            i++;
        }
    }

    /** 만들어둔 조각들의 렌더러만 껐다 켠다 — 노드를 끄면 그 안의 VirtualWall도 목록에서
     * 빠져버려 나중에 다시 켤 때 순서가 꼬인다. */
    private _setBuiltVisible(v: boolean) {
        for (const n of this.node.children) {
            if ((n.hideFlags & CCObject.Flags.DontSave) === 0) continue;   // 경로 점은 건드리지 않는다
            for (const r of n.getComponentsInChildren(MeshRenderer)) r.enabled = v;
            for (const r of n.getComponentsInChildren(SkinnedMeshRenderer)) r.enabled = v;
        }
    }

    /** 에디터에서만 돈다 — 경로 점을 끌면 그 즉시 다시 세워진다. 빌드에서는 EDITOR가 상수로
     * 접혀 이 분기 자체가 사라지므로 프레임 비용이 0이다. */
    update() {
        if (!EDITOR) return;
        const s = this._signature();
        if (s !== this._sig) this._rebuild();
    }

    /** `Point0`, `Point1`, … 순서대로 모은다. 번호가 중간에 비면 거기서 끊는다 —
     * 점을 지웠을 때 뒤쪽이 엉뚱하게 이어붙지 않게 하려는 것이다. */
    private _points(): Node[] {
        const out: Node[] = [];
        for (let i = 0; ; i++) {
            const n = this.node.getChildByName('Point' + i);
            if (!n || !n.activeInHierarchy) break;
            out.push(n);
        }
        return out;
    }

    private _signature(): string {
        const parts: (string | number)[] = [
            this.connectionPrefab ? this.connectionPrefab.uuid : '-',
            this.postPrefab ? this.postPrefab.uuid : '-',
            this.moduleLength, this.fenceScale, this.maxStretch, this.groundY, this.closed ? 1 : 0,
            this.gateSegment, this.gateSegment2, this.gateSegment3, this.postScale,
            this.blockPassage ? 1 : 0, this.blockThickness, this.blockMargin,
            this.blockShowOutline ? 1 : 0, this.blockShowInPlay ? 1 : 0, this.appearTriggerId, this.appearDelay,
            this.appearScaleDuration, this.appearStagger,
        ];
        for (const p of this._points()) {
            const w = p.worldPosition;
            parts.push(w.x.toFixed(3), w.z.toFixed(3));
        }
        return parts.join('|');
    }

    /**
     * 만든 것을 전부 치운다.
     *
     * **경로 점(`Point*`)은 남긴다** — 그것이 이 컴포넌트의 설정이기 때문이다. 만든 조각만
     * 골라 지우기 위해 `DontSave` 플래그가 찍힌 자식만 지운다(`ScatterField`는 자식 전부를
     * 지워도 됐지만 여기는 설정이 자식으로 들어 있어서 그럴 수 없다).
     */
    private _clear() {
        for (const n of this.node.children.slice()) {
            if (!n || !n.isValid) continue;
            if ((n.hideFlags & CCObject.Flags.DontSave) === 0) continue;
            n.removeFromParent();
            n.destroy();
        }
    }

    private _rebuild() {
        this._clear();
        this._walls.length = 0;
        this._sig = this._signature();

        const pts = this._points();
        if (pts.length < 2) return;

        const last = this.closed ? pts.length : pts.length - 1;
        for (let i = 0; i < last; i++) {
            if (i === this.gateSegment || i === this.gateSegment2 || i === this.gateSegment3) continue;
            this._buildSegment(pts[i].worldPosition, pts[(i + 1) % pts.length].worldPosition);
        }
        // 기둥은 구간이 아니라 점마다 하나씩 — 그래야 꼭짓점에서 양쪽 구간이 하나를 공유하고
        // 같은 자리에 두 개가 겹치지 않는다. 출입구 양 끝도 점이므로 자동으로 세워진다.
        if (this.postPrefab) for (const p of pts) this._placePost(p.worldPosition);

        // 아직 등장 전이면 만들어만 두고 감춘다(막기도 _appear에서 켠다).
        if (this._hidden) this._setBuiltVisible(false);
    }

    /** 두 점 사이를 균등한 칸으로 채운다. 가로대는 점(=기둥 중심)에서 점까지 정확히 뻗는다. */
    private _buildSegment(from: Readonly<Vec3>, to: Readonly<Vec3>) {
        if (!this.connectionPrefab || this.moduleLength <= 0) return;

        _a.set(from.x, this.groundY, from.z);
        _b.set(to.x, this.groundY, to.z);
        Vec3.subtract(_d, _b, _a);
        const len = Math.hypot(_d.x, _d.z);
        if (len < 0.0001) return;

        // 기본 길이에 가장 가까운 정수 개로 나눈다 — 반올림이라 자투리가 생기지 않고,
        // 실제 칸 길이는 기본 길이의 ±50% 안에 머문다.
        // 한 칸이 실제로 차지하는 길이는 모델 길이 × 크기 배율이다. 배율을 줄이면 칸도
        // 짧아지므로 같은 구간에 더 많이 들어가야 한다 — 그래서 여기서 배율을 곱해 센다.
        const k = this.fenceScale > 0 ? this.fenceScale : 1;
        const want = this.moduleLength * k;
        let count = Math.max(1, Math.round(len / want));
        // 너무 벌어진 칸이 나오면 한 칸 더 넣어 줄이는 쪽을 택한다(위 툴팁의 이유).
        if (this.maxStretch > 0) {
            while (len / count > want * this.maxStretch) count++;
        }
        const seg = len / count;
        const ux = _d.x / len, uz = _d.z / len;
        // 로컬 +X를 진행 방향에 맞춘다. Cocos의 Y 회전은 +X를 (cos, -sin)으로 보내므로
        // yaw = atan2(-dz, dx)다.
        const yaw = Math.atan2(-uz, ux) * 180 / Math.PI;

        // 막는 박스는 **구간마다 하나**만 둔다. 칸마다 하나씩 두면 박스 수가 몇 배가 되는데,
        // 막힘 판정은 캐릭터마다 모든 박스를 도는 구조라 그 수가 곧 프레임 비용이다.
        if (this.blockPassage) this._placeBlock(_a, _b, len, ux, uz, yaw);

        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) * seg;
            const n = instantiate(this.connectionPrefab);
            n.setRotationFromEuler(0, yaw, 0);
            // 길이 축(X)은 구간에 맞춘 실제 길이 / 모델 길이다(크기 배율이 이미 반영된 값).
            // 높이(Y)와 두께(Z)는 크기 배율을 그대로 쓴다 — 길이만 늘었다 줄었다 한다.
            n.setScale(seg / this.moduleLength, k, k);
            n.hideFlags |= CCObject.Flags.DontSave;
            n.parent = this.node;
            n.setWorldPosition(_a.x + ux * t, this.groundY, _a.z + uz * t);
        }
    }

    /** 한 구간을 통째로 막는 박스 하나. `VirtualWall`은 **노드의 스케일을 그대로 미터로** 읽으므로
     * 스케일에 길이와 두께를 직접 넣는다(스케일 1 = 1m). 그래서 씬 뷰에서 이 박스를 끌어 늘리면
     * 막히는 범위가 그대로 바뀐다. */
    private _placeBlock(a: Readonly<Vec3>, b: Readonly<Vec3>, len: number, ux: number, uz: number, yaw: number) {
        const n = new Node('Block');
        n.setRotationFromEuler(0, yaw, 0);
        // 로컬 +X가 구간 방향이므로 X에 길이, Z에 두께를 넣는다.
        n.setScale(len, 1, this.blockThickness);
        n.hideFlags |= CCObject.Flags.DontSave;

        const w = n.addComponent(VirtualWall);
        w.margin = this.blockMargin;
        w.showDebugOutline = this.blockShowOutline;
        w.showInPlay = this.blockShowInPlay;
        w.gizmoMaterial = this.blockMaterial;

        n.parent = this.node;
        n.setWorldPosition(a.x + ux * len * 0.5, this.groundY, a.z + uz * len * 0.5);

        // 🔴 **위치를 잡은 "뒤"에 굳힌다.** VirtualWall.activate()는 그 순간의 월드 좌표를
        // 캐싱하는데, `parent =` 대입이 onEnable을 그 자리에서 부르므로 activateOnLoad를
        // 켜두면 **아직 옮기기 전인 원점(0,0,0)이 굳어버린다** — 실제로 그렇게 해서 막는
        // 박스 9개가 전부 맵 한가운데에 길게 겹쳐 있었고(맵을 가로질러 막힘), 정작 울타리
        // 자리는 하나도 안 막혔다. 그래서 activateOnLoad를 쓰지 않고 여기서 직접 부른다.
        this._walls.push(w);
        if (!this._hidden) w.activate();
    }

    private _placePost(at: Readonly<Vec3>) {
        const n = instantiate(this.postPrefab!);
        // 기둥은 전체 배율 × 기둥 전용 배율. 기둥만 조금 굵게/가늘게 쓰고 싶을 때를 위해
        // 두 값을 따로 두고 곱한다.
        const k = (this.fenceScale > 0 ? this.fenceScale : 1) * this.postScale;
        n.setScale(k, k, k);
        n.hideFlags |= CCObject.Flags.DontSave;
        n.parent = this.node;
        n.setWorldPosition(at.x, this.groundY, at.z);
    }
}
