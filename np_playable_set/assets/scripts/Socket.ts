import { _decorator, Component, Node, Vec3, Color, Prefab, MeshRenderer, Texture2D, instantiate, tween } from 'cc';
import { CoinStack } from './CoinStack';
import { ResourceType } from './ResourceType';
import { Player } from './Player';
import { FollowerFormation } from './FollowerFormation';
import { FollowerMovement } from './FollowerMovement';
import { FollowerGhostState } from './FollowerGhostState';
import { SocketPreviewSlots } from './SocketPreviewSlots';
import { SocketGuideArrow } from './SocketGuideArrow';
import { FallingCoinVisual, CoinFlightTuning } from './FallingCoinVisual';
import { AtlasNumber } from './AtlasNumber';
import { SocketGauge } from './SocketGauge';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
const { ccclass, property } = _decorator;

/** SocketManager가 activate() 시 넘겨주는 값 묶음 — 이 소켓 하나가 채워졌을 때 필요한 모든 것 */
export interface SocketSetup {
    requiredCoins: number;
    followerCount: number;
    playerNode: Node;
    /** 보상 추종자 프리팹. followerCount가 0인 소켓(건물만 짓는 구성)에서는 null이어도 된다 —
     * 아래 두 스폰 경로 모두 개수가 0이면 한 번도 instantiate하지 않는다. */
    followerPrefab: Prefab | null;
    monsterSpawnerNode: Node | null;
    formation: FollowerFormation | null;
    /** 이 소켓 하나에 적용할 코인 흡수 간격(초) — Socket 프리팹 인스펙터의 depositInterval
     * 기본값을 이 소켓만 덮어쓴다. SocketManager/UnitSocketManager의 소켓 목록에서 소켓마다
     * 다르게 지정할 수 있도록 설정값으로 내려받는다. */
    depositInterval: number;
    /** true면 이 소켓이 등장할 때 내장된 유도 화살표(3D_arrow)가 나타나고, 동시에 메인 캐릭터의
     * 나침반 화살표(GuideCompass)도 이 소켓을 가리키기 시작한다 — 요구치를 채우면 둘 다 사라진다 */
    showGuideArrow: boolean;
    /** true면 이 소켓이 요구치를 다 채우는 순간 CoinEvents.SocketFilled(triggerId)를 emit해
     * 씬에 배치된 같은 triggerId의 BuildingTrigger를 발동시킨다 */
    isTrigger: boolean;
    /** isTrigger가 true일 때만 의미 있음 — 어느 BuildingTrigger가 반응할지 결정하는 식별자 */
    triggerId: TriggerId;
    /** 이 소켓 몸통 위 아이콘 판(socket_mini glb의 "icon" 메시)에 표시할 텍스처.
     * null이면 아이콘 판 자체를 끈다 — 아이콘을 쓰지 않는 소켓/씬은 예전과 똑같이 보인다.
     * socket_large에는 icon 메시가 없으므로 그 variant에서는 지정해도 아무 일도 일어나지 않는다. */
    iconTexture: Texture2D | null;
    /** 이 소켓이 플레이어의 등에서 빼가는 자원의 종류. 넘기지 않으면 코인이다 — 자원 구분이
     * 없던 씬의 설정에는 이 필드가 아예 없으므로 자동으로 코인이 된다(절대 규칙 5). */
    requiredResource?: ResourceType;
    /** 이 소켓이 **동시에** 요구하는 두 번째 자원의 개수. 0(기본)이면 두 번째 요구가 없다 —
     * 지금까지의 모든 소켓이 그렇다. 대장간처럼 "나무와 철을 둘 다" 받아야 하는 소켓에만 쓴다.
     * 두 자원은 순서가 없다 — 플레이어가 무엇을 지고 오든 가진 쪽부터 빨려 들어가고, **둘 다**
     * 0이 되어야 충족된다. */
    requiredCoins2?: number;
    /** 두 번째 요구 자원의 종류. `requiredCoins2`가 0이면 의미가 없다. */
    requiredResource2?: ResourceType;
    /** true면 요구치를 채워도 파괴되지 않고 스스로 리셋되어 계속 코인을 받는다(유닛 생산 소켓용).
     * false(기본)면 기존처럼 보상 지급 후 destroy()되는 1회성 소켓(건물 트리거 소켓용). */
    repeatable: boolean;
    onFulfilled: () => void;
}

/**
 * 코인을 소비해 추종 캐릭터를 보상으로 주는 소켓 1개의 동작.
 * 물리 콜라이더 없이 플레이어와의 거리로 진입을 판정한다 (이 프로젝트의 MapBounds/Monster
 * 등과 동일한 방식). 임시로 단순 Plane 비주얼을 쓰되, 소켓마다 랜덤 색을 입혀 서로 구분되게 한다.
 *
 * 플레이어가 반경 안에 머무는 동안, 등 뒤 코인 스택의 맨 위 코인을 depositInterval마다
 * 하나씩 실제로 뽑아(CoinStack.popTop) 소켓으로 빠르게 날려보낸다 — 장식용 코인을 새로
 * 만드는 게 아니라 캐릭터 등에 쌓여있던 그 코인 노드를 그대로 재사용한다. 가진 코인이
 * 부족하면 그만큼만 우선 흡수하고 대기하다가, 이후 코인이 더 쌓이면 이어서 자동으로
 * 마저 흡수한다(중간에 멈추지 않고 차근차근 채워짐). 요구량을 모두 흡수하면(코인이
 * 실제로 소켓에 도착 완료) 추종 캐릭터를 스폰하고 스스로 파괴된다.
 */
@ccclass('Socket')
export class Socket extends Component {
    /** 현재 "유도 화살표 UI 표시"가 켜진 채로 활성화되어 있는 소켓의 노드. 한 번에 소켓이
     * 하나만 등장하는 이 프로젝트의 구조를 그대로 반영한 단순 static 참조 — GuideCompass.ts가
     * 이 값을 읽어 메인 캐릭터에 붙은 나침반 화살표가 가리킬 방향을 구한다. */
    static activeGuideTarget: Node | null = null;
    @property({ displayName: '발동 반경(m)', tooltip: '플레이어가 이 거리 안에 있는 동안 코인을 순차적으로 흡수함' })
    radius: number = 1.5;

    @property({ displayName: '코인 흡수 간격(초)', tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감' })
    depositInterval: number = 0.05;

    // ── 코인 비행 연출 (FallingCoinVisual에 전달) ──────────────────────────
    // FallingCoinVisual은 런타임에 addComponent()로 붙는 컴포넌트라 그 자체엔 씬에 저장되는
    // 인스펙터 값이 없다 — Coin/CoinPool과 동일한 패턴으로, 모든 수치는 여기 Socket(프리팹)
    // 인스펙터에서 조정하고 spawn 시점에 그대로 전달한다.
    @property({ displayName: '코인 비행 시간(초)', tooltip: '코인 한 개가 스택 위치에서 소켓까지 날아가는 데 걸리는 시간' })
    flightDuration: number = 0.2;

    @property({ displayName: '코인 비행 중 튀어오르는 높이(m)', tooltip: '몬스터 처치 시 코인이 튀어오르는 것과 같은 연출 — 소켓으로 들어가는 동안 살짝 위로 볼록하게 튀었다가 들어감' })
    flightArcHeight: number = 0.5;

    @property({ displayName: '착지 팝 최고 배율', tooltip: '소켓 도착 순간 원래 크기 대비 얼마나 커졌다가 사라지는지' })
    popPeakScale: number = 1.35;

    @property({ displayName: '착지 팝 지속시간(초)', tooltip: '도착 후 확대→축소(소멸)까지 걸리는 시간' })
    popDuration: number = 0.12;

    @property({ displayName: '고스트→실체화 전환 시간(초)', tooltip: '소켓을 다 채운 순간, 소켓 위에 서있던 미리보기 추종자의 프레넬/반투명 factor가 0으로 내려가며 실체화되는 데 걸리는 시간' })
    ghostFadeDuration: number = 0.5;

    // ── 등장/소멸 스케일 애니메이션 (소켓마다 지속시간을 다르게 줄 수 있도록 프리팹 인스펙터 노출) ──
    @property({ displayName: '등장 확대 시간(초)', tooltip: '소켓이 스폰되는 순간 스케일 0→1(프리팹 원래 크기)로 커지는 데 걸리는 시간' })
    appearScaleDuration: number = 0.3;

    @property({ displayName: '소멸 축소 시간(초)', tooltip: '요구치를 다 채운 소켓이 사라지기 직전 스케일 1→0으로 줄어드는 데 걸리는 시간. 반복 생산 소켓(유닛 생산용, repeatable)은 요구치를 채워도 destroy되지 않으므로 적용되지 않는다' })
    disappearScaleDuration: number = 0.25;

    private _setup: SocketSetup | null = null;
    private _fulfilled = false;
    /**
     * 요구 자원 슬롯. 보통 1칸이고, "나무와 철을 동시에" 같은 소켓만 2칸이 된다.
     *
     * 슬롯을 배열로 둔 이유: 필드를 `_toPop`/`_toPop2`처럼 늘리면 흡수·표시·리셋 세 군데를
     * 전부 두 번씩 쓰게 되고, 나중에 3종을 요구하는 소켓이 생기면 또 늘려야 한다. 배열이면
     * 그 세 곳이 각각 루프 하나로 끝난다.
     *
     * - `toPop`    : 스택에서 아직 뽑아야 할 개수. 0이면 더 이상 흡수 시도를 하지 않는다.
     * - `remaining`: 아직 소켓에 **도착 완료**하지 않은 개수. 날아가는 중인 것이 있으므로
     *                `toPop`보다 늦게 줄어든다. **모든 슬롯이 0이 되는 순간** 보상을 지급한다.
     */
    private _req: { res: ResourceType; total: number; toPop: number; remaining: number }[] = [];
    private _depositTimer = 0;
    private _label: AtlasNumber | null = null;
    private _gauge: SocketGauge | null = null;
    /** socket_L 전용: 소켓 위에 서서 생산을 기다리는 고스트 미리보기 추종자들이 설 자리
     * (SocketPreviewSlots가 "PreviewSlot0","PreviewSlot1"... 자식 노드를 스캔해 관리 — 배치는
     * 프리팹 편집 화면에서 그 마커 노드들을 직접 드래그해 조정한다, FollowerFormation과 동일한 방식) */
    private _previewSlots: SocketPreviewSlots | null = null;
    /** 현재 소켓 위에 서 있는 고스트 미리보기 추종자 인스턴스 (충족 시 이 인스턴스들을 그대로 실체화한다) */
    private _previewFollowers: Node[] = [];
    /** socket_L/socket_S에 내장된 유도 화살표 UI. showGuideArrow 설정에 따라 표시 여부를 제어한다 */
    private _guideArrow: SocketGuideArrow | null = null;
    /** socket_mini glb에만 있는 아이콘 판("icon" 노드)의 렌더러. socket_large에는 없어서 null일 수 있다 */
    private _iconRenderer: MeshRenderer | null = null;

    onLoad() {
        // 소켓마다 랜덤한 색의 머티리얼 인스턴스를 입혀서 서로 구분되게 한다
        // (공유 머티리얼을 그대로 쓰면 전체 소켓이 동시에 같은 색이 되어버림).
        // 바디 메쉬 노드는 variant(socket_large/socket_mini)마다 자식 순서/중첩 깊이가 달라서
        // getComponentInChildren(MeshRenderer)로 "첫 번째"를 집으면 게이지나 코인 장식 메쉬가
        // 잘못 걸릴 수 있다 — 이름이 "socket"/"socket.001"인 노드를 정확히 찾아 그 아래에서만 찾는다.
        const bodyNode = this._findByExactName(this.node, ['socket', 'socket.001']) ?? this.node;
        const mr = bodyNode.getComponentInChildren(MeshRenderer);
        const inst = mr?.getMaterialInstance(0);
        inst?.setProperty('mainColor', new Color(
            Math.floor(80 + Math.random() * 175),
            Math.floor(80 + Math.random() * 175),
            Math.floor(80 + Math.random() * 175),
            255,
        ));

        // 요구/남은 코인 개수 라벨은 프리팹 안에 실제 3D 자식(CoinLabel)으로 붙어있다 —
        // 2D UI 오버레이가 아니라 소켓 오브젝트 위에 그대로 얹혀서 트랜스폼을 상속받는다.
        this._label = this.getComponentInChildren(AtlasNumber);
        this._gauge = this.getComponentInChildren(SocketGauge);
        // socket_L에만 붙어있고 socket_S 등 다른 variant에는 없을 수 있음 — 없으면 null
        // (고스트 미리보기 없이 기존 즉시-스폰 방식으로만 동작).
        this._previewSlots = this.getComponent(SocketPreviewSlots);
        this._guideArrow = this.getComponentInChildren(SocketGuideArrow);

        // 아이콘 판은 socket_mini glb에만 있는 "icon" 노드다 — socket_large에는 없으므로 null 가능.
        // 여기서는 렌더러만 찾아두고, 실제 표시 여부는 activate()에서 소켓 설정에 따라 정한다.
        // (바디 메쉬와 마찬가지로 getComponentInChildren으로 "첫 번째"를 집으면 엉뚱한 메쉬가
        //  걸릴 수 있어 이름으로 정확히 찾는다.)
        const iconNode = this._findByExactName(this.node, ['icon']);
        this._iconRenderer = iconNode?.getComponent(MeshRenderer) ?? null;
    }

    /** root(포함)부터 자식들을 재귀로 훑어 이름이 정확히 일치하는 첫 노드를 반환 */
    private _findByExactName(root: Node, names: string[]): Node | null {
        if (names.includes(root.name)) return root;
        for (const child of root.children) {
            const found = this._findByExactName(child, names);
            if (found) return found;
        }
        return null;
    }

    /** SocketManager가 스폰 직후 호출 */
    activate(setup: SocketSetup) {
        this._setup = setup;
        this._fulfilled = false;
        this._resetRequirements();
        this._depositTimer = 0;
        this.depositInterval = setup.depositInterval;
        this._refreshDisplay();
        this._spawnPreviewFollowers();

        // 이 소켓 설정이 유도 화살표를 켜두지 않았으면, 등장(appear) 애니메이션 없이
        // 그냥 처음부터 안 보이게 한다 — SocketGuideArrow.show()를 호출하지 않으므로
        // 프리팹에 내장된 채로 있던 모습(비활성 전) 그대로 노출되지 않도록 즉시 꺼둔다.
        if (setup.showGuideArrow) this._guideArrow?.show();
        else if (this._guideArrow) this._guideArrow.node.active = false;

        if (setup.showGuideArrow) Socket.activeGuideTarget = this.node;

        this._applyIcon(setup.iconTexture);

        this._playAppearScale();
    }

    /**
     * 소켓별 아이콘 텍스처를 아이콘 판에 덮어씌운다.
     *
     * **기본 아이콘은 glb 머티리얼에 authoring한 그대로 쓴다** — 이 함수는 소켓 설정에 텍스처가
     * 지정된 경우에만 개입한다. tex가 null이면 아무것도 건드리지 않는다(노드를 끄지도 않는다).
     * 아이콘을 아예 쓰지 않는 씬은 프리팹에서 icon 노드를 꺼두는 것으로 표현한다.
     *
     * 소켓마다 다른 이미지를 쓰기 위해 **머티리얼 에셋을 여러 개 만들 필요는 없다** — 렌더러
     * 인스턴스별 머티리얼(getMaterialInstance)에 텍스처만 바꿔 꽂으면 된다. 소켓 몸통 색을
     * 소켓마다 랜덤으로 주는 onLoad()의 처리와 동일한 패턴이다.
     */
    private _applyIcon(tex: Texture2D | null) {
        if (!tex) return;                        // 지정 없음 → authoring 상태 그대로 유지
        const mr = this._iconRenderer;
        if (!mr) return;                         // 아이콘 판이 없는 variant(socket_large 등)
        mr.getMaterialInstance(0)?.setProperty('mainTexture', tex);
        mr.node.active = true;
    }

    /** 스케일 0에서 프리팹 원래 크기(activate() 호출 시점의 this.node.scale)까지 커지는
     * 등장 연출. 미리보기 추종자(_spawnPreviewFollowers)는 이미 자식으로 붙어 월드 좌표가
     * 고정된 뒤이므로, 이 노드와 함께 비율 그대로 작게 시작해 같이 커진다. */
    private _playAppearScale() {
        const target = this.node.scale.clone();
        this.node.setScale(0, 0, 0);
        tween(this.node)
            .to(this.appearScaleDuration, { scale: target })
            .start();
    }

    onDestroy() {
        if (Socket.activeGuideTarget === this.node) Socket.activeGuideTarget = null;
    }

    /** 요구치를 채우기 전, 소켓 위 미리보기 슬롯에 고스트(반투명+프레넬) 상태의 추종자를 미리 세워둔다.
     * 슬롯 수보다 보상 추종자 수가 많으면 넘치는 만큼은 충족 시점에 기존 방식대로 즉시 스폰한다. */
    private _spawnPreviewFollowers() {
        this._previewFollowers = [];
        if (!this._setup || !this._previewSlots) return;
        const { followerCount, followerPrefab, monsterSpawnerNode } = this._setup;
        const count = Math.min(followerCount, this._previewSlots.count);
        const pos = new Vec3();

        if (!followerPrefab) return;

        for (let i = 0; i < count; i++) {
            const node = instantiate(followerPrefab);
            this.node.addChild(node);
            this._previewSlots.getSlotWorldPosition(i, pos);
            node.setWorldPosition(pos);

            // start()가 이번 프레임 안에 돌기 전에 넣어줘야 Player가 스포너를 정상적으로 캐싱한다
            // (old _spawnFollowers와 동일한 타이밍 요구사항 — Player.start()는 spawnerNode를 그때 딱 한 번만 읽는다).
            const player = node.getComponent(Player);
            if (player && monsterSpawnerNode) player.spawnerNode = monsterSpawnerNode;

            node.getComponent(FollowerGhostState)?.enterGhost();
            this._previewFollowers.push(node);
        }
    }

    /** 요구 슬롯을 설정값에서 다시 만든다 — 최초 activate와 repeatable 소켓의 리셋이 같은
     * 코드를 쓰게 해서 둘이 어긋나지 않게 한다(예전에 리셋 쪽만 고쳐 버그가 나기 쉬운 자리였다). */
    private _resetRequirements() {
        const st = this._setup;
        if (!st) { this._req = []; return; }
        this._req = [{
            res: st.requiredResource ?? ResourceType.Coin,
            total: st.requiredCoins, toPop: st.requiredCoins, remaining: st.requiredCoins,
        }];
        // 개수가 0이면 슬롯 자체를 만들지 않는다 — 만들면 "이미 채워진 슬롯"이 하나 생겨
        // 표시와 게이지 계산이 어긋난다.
        const n2 = st.requiredCoins2 ?? 0;
        if (n2 > 0) {
            this._req.push({
                res: st.requiredResource2 ?? ResourceType.Coin,
                total: n2, toPop: n2, remaining: n2,
            });
        }
    }

    /** 아직 도착하지 않은 개수의 합. 슬롯이 하나뿐인 기존 소켓에서는 예전 `_remaining`과 같다. */
    private get _remainingTotal(): number {
        let n = 0;
        for (const r of this._req) n += r.remaining;
        return n;
    }

    private _refreshDisplay() {
        this._label?.setValue(Math.max(0, this._remainingTotal));
        // 요구가 둘이면 두 요구를 합친 진행도를 보여준다 — 게이지가 하나뿐이라 자원별로
        // 나눠 보여줄 자리가 없고, 플레이어에게 필요한 정보는 "얼마나 남았나" 하나다.
        let total = 0;
        for (const r of this._req) total += r.total;
        this._gauge?.setProgress(total > 0 ? (total - this._remainingTotal) / total : 1);
    }

    update(dt: number) {
        if (this._fulfilled || !this._setup) return;
        // 모든 슬롯을 다 뽑았으면 더 볼 것이 없다(아직 날아가는 중일 수는 있다).
        let anyToPop = false;
        for (const r of this._req) if (r.toPop > 0) { anyToPop = true; break; }
        if (!anyToPop) return;

        const { playerNode } = this._setup;
        if (!playerNode.isValid) return;

        if (Vec3.distance(this.node.worldPosition, playerNode.worldPosition) > this.radius) return;

        this._depositTimer += dt;
        if (this._depositTimer < this.depositInterval) return;
        this._depositTimer = 0;

        const stack = playerNode.getComponent(CoinStack);
        if (!stack) return;

        // 자원이 여러 종류일 수 있으므로 **내가 요구하는 종류만** 본다. 나무 소켓 앞에서
        // 철만 지고 서 있으면 아무 일도 일어나지 않는 것이 맞다.
        // 요구가 둘이면 **플레이어가 지금 가진 쪽부터** 빨아들인다 — 순서를 고정하면 나무만
        // 지고 온 플레이어가 철을 가지러 다녀올 때까지 아무 반응이 없어 고장처럼 보인다.
        for (const r of this._req) {
            if (r.toPop <= 0) continue;
            if (stack.countOf(r.res) <= 0) continue;
            this._depositOne(stack, r);
            return;
        }
        // 여기 도달 = 요구하는 자원을 하나도 안 갖고 있음 → 대기. 이후 더 쌓이면 다음 틱에 이어서 흡수.
    }

    /** 스택 맨 위 코인 노드를 실제로 하나 뽑아 소켓까지 빠르게 날려보낸다.
     * 착지(도착) 시점에 "남은 코인 개수" 라벨을 갱신하고, 마지막 코인이면 보상을 지급한다. */
    private _depositOne(stack: CoinStack, req: { res: ResourceType; total: number; toPop: number; remaining: number }) {
        const coinNode = stack.popTop(req.res);
        if (!coinNode) return;
        req.toPop--;

        const parent = this.node.scene ?? this.node.parent!;
        const from = coinNode.worldPosition.clone();
        coinNode.setParent(parent, true); // 월드 트랜스폼(위치+회전) 유지한 채 플레이어에서 분리

        const socketPos = this.node.worldPosition;
        const to = new Vec3(socketPos.x, socketPos.y + 0.05, socketPos.z);
        const tuning: CoinFlightTuning = {
            flightDuration:  this.flightDuration + (Math.random() - 0.5) * 0.06,
            flightArcHeight: this.flightArcHeight,
            popPeakScale:    this.popPeakScale,
            popDuration:     this.popDuration,
        };

        coinNode.addComponent(FallingCoinVisual).activate(from, to, tuning, () => {
            req.remaining--;
            this._refreshDisplay();
            CoinEvents.emit(CoinEventName.SocketAbsorbed, this);
            // **모든** 슬롯이 0이 되어야 충족이다 — 나무만 다 넣고 철이 남았으면 아직 아니다.
            if (this._remainingTotal <= 0) this._completeFulfillment();
        });
    }

    private _completeFulfillment() {
        if (!this._setup) return;
        this._fulfilled = true;
        const { followerCount, playerNode, followerPrefab, monsterSpawnerNode, formation, showGuideArrow, isTrigger, triggerId, repeatable, onFulfilled } = this._setup;
        const parent = this.node.scene ?? this.node.parent!;

        // 이 소켓이 건물 트리거로 설정돼 있으면, 같은 트리거 ID를 가진 BuildingTrigger가
        // 반응하도록 전역 이벤트를 쏜다 (소켓과 건물은 서로를 직접 참조하지 않는다).
        if (isTrigger) CoinEvents.emit(CoinEventName.SocketFilled, triggerId);

        // repeatable(유닛 생산 소켓)이 아닐 때만: 유도 화살표가 켜져 있었다면, 소켓이 destroy되기
        // 전에 씬으로 먼저 분리해서 역재생(사라짐) 애니메이션이 끝까지 재생될 시간을 준 뒤
        // 스스로 정리되게 한다. repeatable 소켓은 destroy되지 않으므로 화살표도 그대로 둔다.
        if (!repeatable && showGuideArrow && this._guideArrow) {
            this._guideArrow.node.setParent(parent, true);
            this._guideArrow.hide();
        }

        // 소켓 위에서 대기하던 고스트 미리보기를 그대로 실체화한다 — 새로 스폰하지 않고
        // 같은 인스턴스가 프레넬/반투명 factor를 0으로 낮추며(fadeTo) FollowerMovement로
        // 대형 슬롯까지 걸어가게(FollowerMovement.update가 매 프레임 처리) 만든다.
        for (const node of this._previewFollowers) {
            node.setParent(parent, true); // 월드 트랜스폼 유지한 채 소켓에서 분리 (destroy 안 되더라도 소켓 밖 대형으로 옮겨야 함)
            this._promoteFollower(node, formation);
        }
        const promotedCount = this._previewFollowers.length;
        this._previewFollowers = [];

        // 미리보기 슬롯이 모자라 고스트로 대기시키지 못했던 나머지는 기존처럼 즉시 스폰
        const overflow = followerCount - promotedCount;
        if (overflow > 0) this._spawnFollowersInstant(overflow, playerNode, followerPrefab, monsterSpawnerNode, formation);

        onFulfilled();

        if (repeatable) {
            // 파괴하지 않고 스스로 리셋 — 요구치를 다시 채우면 또 유닛을 생산한다.
            this._fulfilled = false;
            this._resetRequirements();
            this._depositTimer = 0;
            this._refreshDisplay();
            this._spawnPreviewFollowers();
        } else {
            this._playDisappearScaleThenDestroy();
        }
    }

    /** 스케일 1→0으로 줄어든 뒤 destroy — repeatable이 아닌(건물 트리거) 소켓이 요구치를
     * 다 채웠을 때만 호출된다. 미리보기 추종자/유도 화살표는 이 시점 이전에 이미 부모에서
     * 분리되었으므로(위 코드) 이 노드와 함께 줄어들지 않는다. */
    private _playDisappearScaleThenDestroy() {
        tween(this.node)
            .to(this.disappearScaleDuration, { scale: new Vec3(0, 0, 0) })
            .call(() => this.node.destroy())
            .start();
    }

    /** 고스트 미리보기 1개를 실체화 상태로 전환: 대형 슬롯을 예약해 걸어가게 하고, 동시에
     * ghostFactor를 0으로 fade한 뒤 원래 토온 머티리얼로 되돌린다(solidify). */
    private _promoteFollower(node: Node, formation: FollowerFormation | null) {
        if (formation) {
            const move = node.getComponent(FollowerMovement) ?? node.addComponent(FollowerMovement);
            move.setup(formation);
        }

        const ghost = node.getComponent(FollowerGhostState);
        if (ghost) ghost.fadeTo(0, this.ghostFadeDuration, () => ghost.solidify());
    }

    /**
     * 추종 캐릭터를 즉시 스폰한다(고스트 미리보기 없이). formation이 있으면 격자 슬롯(플레이어에
     * 가까운 순서로 예약, 서로 겹치지 않음)에 배치하고 FollowerMovement로 계속 그 자리를 따라가게
     * 한다. formation이 없으면(연결 누락 등 예외 상황) 플레이어 위치에 임시로 스폰한다.
     * 미리보기 슬롯이 보상 추종자 수보다 적었을 때의 오버플로우 대비책으로만 쓰인다.
     */
    private _spawnFollowersInstant(count: number, playerNode: Node, followerPrefab: Prefab | null, spawnerNode: Node | null, formation: FollowerFormation | null) {
        const parent = this.node.scene ?? this.node.parent!;
        const pos = new Vec3();

        if (!followerPrefab) return;

        for (let i = 0; i < count; i++) {
            const node = instantiate(followerPrefab);
            parent.addChild(node);

            const player = node.getComponent(Player);
            if (player && spawnerNode) player.spawnerNode = spawnerNode;

            if (formation) {
                const move = node.getComponent(FollowerMovement) ?? node.addComponent(FollowerMovement);
                move.setup(formation);
                if (move.slotIndex >= 0) {
                    formation.getSlotWorldPosition(move.slotIndex, pos);
                    node.setWorldPosition(pos);
                    continue;
                }
            }
            // formation이 없거나 슬롯이 꽉 찬 경우의 대비책
            node.setWorldPosition(playerNode.worldPosition);
        }
    }
}
