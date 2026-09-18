import { _decorator, Component, Node, Prefab, Enum, Texture2D, instantiate } from 'cc';
import { Socket, SocketSetup } from './Socket';
import { FollowerFormation } from './FollowerFormation';
import { TriggerId } from './TriggerId';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { ResourceType } from './ResourceType';
const { ccclass, property } = _decorator;

/** 소켓 크기 변형 — 소켓마다 socket_L/socket_S 중 어느 프리팹으로 스폰할지 고른다. */
export enum SocketVariant {
    L = 0,
    S = 1,
}
Enum(SocketVariant);

/**
 * 소켓이 받는 자원의 종류 — 이제 프로젝트 공용 `ResourceType`을 그대로 쓴다.
 *
 * 예전에는 여기 전용 `SocketResource`(Coin=0, Wood=1)를 따로 뒀는데, `ResourceType`이
 * **같은 숫자로 같은 자원**을 정의하므로(Coin=0, Wood=1) 씬에 직렬화된 기존 값이 그대로
 * 유효하다. 이름만 남겨 두면 예전 import도 안 깨진다.
 *
 * 크기 enum(`SocketVariant`)에 자원 값을 더하지 않은 이유는 그대로다: `SocketVariant`는
 * `UnitSocketManager`도 공유하는데 그쪽에는 나무 프리팹 슬롯도 처리 코드도 없다.
 */
export const SocketResource = ResourceType;
export type SocketResource = ResourceType;

/**
 * 소켓 1개에 대한 설정 — 요구 코인 개수와 보상으로 나오는 추종자 수.
 * 인스펙터 배열의 +/- 버튼으로 몇 번째 소켓까지 있을지 자유롭게 추가/삭제한다.
 */
@ccclass('SocketConfig')
export class SocketConfig {
    @property({ type: SocketVariant, displayName: '소켓 크기', tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지 — 아래 SocketManager의 두 프리팹 슬롯 중 하나가 실제로 쓰인다. 아래 "받는 자원"을 나무로 두면 이 값은 무시된다(나무 프리팹이 하나뿐이라서)' })
    variant: SocketVariant = SocketVariant.L;

    @property({ type: ResourceType, displayName: '받는 자원', tooltip: '이 소켓이 무엇을 받는지. 재화면 위 "소켓 크기"에 따라 L/S 프리팹을, 나무면 크기와 무관하게 SocketManager의 "소켓 프리팹 (나무)" 하나를 쓴다 — 소켓 위에 얹힌 코인/통나무 모형이 다른 별개 프리팹이기 때문이다. 기본값이 재화라서 기존 씬은 이 항목을 건드리지 않아도 그대로 동작한다' })
    resource: ResourceType = ResourceType.Coin;

    @property({ displayName: '요구 코인 개수' })
    requiredCoins: number = 5;

    @property({ type: ResourceType, displayName: '추가 요구 자원', tooltip: '이 소켓이 위 자원과 **동시에** 요구하는 두 번째 자원. 아래 "추가 요구 개수"가 0이면 아무 의미가 없다 — 지금까지의 모든 소켓이 그렇다. 씬 3의 대장간처럼 나무와 철을 둘 다 받아야 하는 소켓에만 쓴다' })
    resource2: ResourceType = ResourceType.Coin;

    @property({ displayName: '추가 요구 개수', tooltip: '두 번째 자원을 몇 개 요구하는지. **0(기본)이면 두 번째 요구가 없다.** 두 자원은 순서가 없어서 플레이어가 지고 온 쪽부터 빨려 들어가고, 둘 다 0이 되어야 소켓이 충족된다. 소켓 위 숫자와 게이지는 두 요구를 합쳐서 보여준다(게이지가 하나뿐이라 자원별로 나눌 자리가 없다)' })
    requiredCoins2: number = 0;

    @property({ displayName: '보상 추종자 수' })
    followerCount: number = 1;

    @property({ displayName: '코인 흡수 간격(초)', tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)' })
    depositInterval: number = 0.05;

    @property({ displayName: '유도 화살표 UI 표시', tooltip: '체크하면 이 소켓이 등장할 때 socket_L/socket_S에 내장된 유도 화살표(3D_arrow)가 함께 나타나고, 동시에 메인 캐릭터에 붙은 나침반 화살표(GuideCompass)도 이 소켓 방향을 가리키기 시작한다 — 둘 다 이 소켓이 요구치를 다 채우는 순간 사라진다' })
    showGuideArrow: boolean = false;

    @property({ type: Node, displayName: '소켓 위치(개별)', tooltip: '이 소켓이 등장할 위치. 비워두면 아래 SocketManager의 공용 "소켓 스폰 위치"를 대신 사용한다 — 소켓마다 자기 자리를 씬에 마커 노드로 만들어 여기 드래그' })
    spawnPoint: Node | null = null;

    @property({ displayName: '건물 트리거 여부', tooltip: '체크하면 이 소켓이 요구치를 다 채우는 순간 아래 "트리거 ID"로 전역 건물 건설 이벤트(CoinEvents.SocketFilled)를 발동한다 — 씬에 배치된 BuildingTrigger 컴포넌트 중 같은 트리거 ID를 가진 것이 반응해 건설 애니메이션을 재생한다' })
    isTrigger: boolean = false;

    @property({ type: TriggerId, displayName: '트리거 ID', tooltip: '"건물 트리거 여부"가 체크된 경우에만 의미 있음 — 씬에 배치할 건물의 BuildingTrigger.triggerId와 같은 값으로 맞춰야 반응한다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ type: TriggerId, displayName: '등장 대기 트리거', tooltip: '이 소켓의 차례가 와도 이 트리거가 아직 발화하지 않았으면 **기다렸다가** 그때 등장한다. None(기본)이면 앞 소켓을 채우는 즉시 등장한다(기존 동작). 씬 3의 대장간 소켓처럼 "철을 처음 먹어야 열린다"처럼 소켓이 아닌 사건이 여는 소켓에 쓴다' })
    waitTriggerId: TriggerId = TriggerId.None;

    @property({ displayName: '이전 소켓과 함께 등장', tooltip: '체크하면 바로 앞 소켓과 **동시에** 등장한다 — 한 번에 하나씩이 아니라 둘 이상이 같이 서 있게 된다. 이때 다음 소켓은 함께 등장한 것들이 **전부** 채워진 뒤에 나온다. 씬 3의 레일 해금 소켓 2개가 이 경우다. 배열의 첫 번째 소켓에 체크하면 무시된다(앞이 없다)' })
    spawnWithPrevious: boolean = false;

    @property({ type: Texture2D, displayName: '아이콘 텍스처', tooltip: '이 소켓 몸통 위 아이콘 판("icon" 메시)에 표시할 이미지 — 소켓마다 어떤 건물이 나오는지 다르게 보여줄 때 지정한다. 비워두면 프리팹에 authoring된 기본 아이콘을 그대로 쓴다. 아이콘 메시가 없는 프리팹(구 socket_L 등)에서는 지정해도 표시되지 않는다 — socket_S와 나무 소켓(socket_large_icon)에는 있다' })
    iconTexture: Texture2D | null = null;
}

/**
 * 소켓을 순서대로 한 번에 하나씩만 스폰한다. 현재 소켓이 코인을 다 채워 보상을
 * 지급하면 스스로 사라지고(Socket.ts), 그 알림을 받아 다음 소켓(있다면)을 이어서 스폰한다.
 *
 * 씬 시작과 동시에 스폰하지 않는다 — 아래 둘 중 하나가 올 때까지 대기했다가 첫 소켓을 스폰한다.
 *  (1) CoinEvents.BuildingSocketsUnlocked — UnitSocketManager가 지정된 유닛 생산 소켓을 처음
 *      채웠을 때 emit. 유닛 소켓이 있는 씬(씬 1)의 기존 경로.
 *  (2) "소켓 스폰 시작 트리거 ID"로 지정한 트리거의 발화 — 유닛 소켓이 없는 씬에서 쓴다.
 *      GameStartTrigger가 게임 시작 시 TriggerId.GameStart를 발화하는 게 표준 조합이다.
 */
@ccclass('SocketManager')
export class SocketManager extends Component {
    @property({ type: [SocketConfig], displayName: '소켓 목록', tooltip: '등장 순서대로. 1번=배열의 0번째. 배열 +/- 버튼으로 개수 자유롭게 조정' })
    sockets: SocketConfig[] = [];

    @property({ type: Node, displayName: '소켓 스폰 위치', tooltip: '소켓이 등장할 고정 위치(기지 앞). 씬에서 이 노드를 드래그해 정확한 위치로 조정' })
    spawnPoint: Node | null = null;

    @property({ type: Prefab, displayName: '소켓 프리팹 (L)', tooltip: '소켓 목록에서 "소켓 크기"를 L로, "받는 자원"을 재화로 설정한 소켓이 사용할 프리팹 (socket_L)' })
    socketPrefab: Prefab | null = null;

    @property({ type: Prefab, displayName: '소켓 프리팹 (S)', tooltip: '소켓 목록에서 "소켓 크기"를 S로, "받는 자원"을 재화로 설정한 소켓이 사용할 프리팹 (socket_S)' })
    socketPrefabS: Prefab | null = null;

    @property({ type: Prefab, displayName: '소켓 프리팹 (나무)', tooltip: '소켓 목록에서 "받는 자원"을 나무로 설정한 소켓이 사용할 프리팹 (Socket_L_wood). 비워두면 나무 소켓은 스폰되지 않는다 — 재화 소켓만 쓰는 기존 씬은 이 칸이 비어 있어도 아무 영향이 없다. 나무 소켓에 크기 구분이 필요해지면 그때 슬롯을 하나 더 만든다' })
    socketPrefabWood: Prefab | null = null;

    @property({ type: Prefab, displayName: '추종자 프리팹' })
    followerPrefab: Prefab | null = null;

    @property({ type: Node, displayName: '플레이어 노드' })
    playerNode: Node | null = null;

    @property({ type: Node, displayName: '몬스터 스포너 노드', tooltip: '보상으로 나온 추종자가 몬스터를 찾을 수 있도록 연결 (Follower 프리팹은 프리팹 특성상 이 참조를 저장할 수 없어 스폰 시점에 코드로 주입함)' })
    monsterSpawnerNode: Node | null = null;

    @property({ displayName: '다음 소켓 등장 대기시간(초)', tooltip: '한 소켓을 채운 뒤 같은 자리에 다음 소켓이 나타나기까지의 지연 시간. 코인을 한꺼번에 많이 모아둔 상태에서 여러 소켓이 동시에 반응해버리는 것을 방지' })
    nextSocketDelay: number = 2;

    @property({ type: TriggerId, displayName: '소켓 스폰 시작 트리거 ID', tooltip: '이 트리거 ID가 발화하는 순간부터 첫 소켓이 등장한다 (예: GameStart = 게임 시작과 동시에). 비워두면(None) 기존처럼 유닛 생산 소켓 마일스톤(CoinEvents.BuildingSocketsUnlocked)을 기다린다 — 유닛 소켓이 없는 씬에서는 반드시 값을 지정해야 소켓이 나온다' })
    unlockTriggerId: TriggerId = TriggerId.None;

    private _index = 0;
    private _formation: FollowerFormation | null = null;
    private _unlocked = false;
    /** 지금 씬에 서 있는 소켓 수. "이전 소켓과 함께 등장"으로 둘 이상이 동시에 설 수 있으므로
     * 하나가 채워졌다고 바로 다음으로 넘어가면 안 된다 — 이 수가 0이 될 때 넘어간다. */
    private _active = 0;
    /** "등장 대기 트리거"를 기다리느라 멈춰 선 배열 위치. -1이면 대기 중이 아니다. */
    private _pendingIndex = -1;
    /** 지금까지 발화한 트리거 — 소켓 차례가 **오기 전에** 트리거가 먼저 발화할 수 있으므로
     * (철을 먼저 먹고 나중에 그 소켓 차례가 오는 경우) 기억해두지 않으면 영영 안 열린다. */
    private _fired = new Set<TriggerId>();

    start() {
        if (this.playerNode) this._formation = this.playerNode.getComponent(FollowerFormation);
        CoinEvents.on(CoinEventName.BuildingSocketsUnlocked, this._onUnlocked, this);
        CoinEvents.on(CoinEventName.SocketFilled, this._onTriggerFired, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.BuildingSocketsUnlocked, this._onUnlocked, this);
        CoinEvents.off(CoinEventName.SocketFilled, this._onTriggerFired, this);
    }

    /** "소켓 스폰 시작 트리거 ID"가 지정된 경우, 그 트리거가 발화하면 스폰을 시작한다.
     * 건물 트리거와 완전히 같은 이벤트(SocketFilled)를 쓰므로 트리거 발화 주체가
     * 무엇이든(게임 시작 컴포넌트든, 앞선 소켓이든) 동일하게 동작한다. */
    private _onTriggerFired(triggerId: TriggerId) {
        this._fired.add(triggerId);

        // 대기 중인 소켓이 있고 그것이 기다리던 트리거라면 지금 등장시킨다.
        if (this._pendingIndex >= 0) {
            const waiting = this.sockets[this._pendingIndex];
            if (waiting && waiting.waitTriggerId === triggerId) {
                const i = this._pendingIndex;
                this._pendingIndex = -1;
                this._spawnFrom(i);
                // 스폰 시작 트리거와 같은 값일 수도 있으므로 아래 처리로 계속 내려간다.
            }
        }

        if (this.unlockTriggerId === TriggerId.None) return;
        if (triggerId !== this.unlockTriggerId) return;
        this._onUnlocked();
    }

    private _onUnlocked() {
        if (this._unlocked) return;
        this._unlocked = true;
        this._spawnFrom(this._index);
    }

    /**
     * 이 소켓 설정이 쓸 프리팹. 자원 종류가 먼저고, 재화일 때만 크기를 본다.
     * **채워지지 않은 슬롯은 null을 돌려주고, 부르는 쪽이 스폰을 건너뛴다** — 나무를 쓰지 않는
     * 씬에 나무 슬롯이 비어 있는 것은 정상이지 오류가 아니다(매니저는 씬이 채운 만큼만 동작한다).
     */
    private _prefabFor(config: SocketConfig): Prefab | null {
        if (config.resource === ResourceType.Wood) return this.socketPrefabWood;
        return config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
    }

    /**
     * `i`번째부터 등장시킨다. 보통 하나만 세우고 끝나지만, 뒤이은 소켓에 "이전 소켓과 함께
     * 등장"이 켜져 있으면 그것들까지 연달아 세운다.
     *
     * 등장 대기 트리거가 아직 발화하지 않았으면 **그 자리에서 멈추고 기억해둔다** —
     * 나중에 그 트리거가 오면 `_onTriggerFired`가 여기를 다시 부른다.
     */
    private _spawnFrom(start: number) {
        if (!this.playerNode) return;
        let i = start;
        while (i < this.sockets.length) {
            const cfg = this.sockets[i];
            if (cfg.waitTriggerId !== TriggerId.None && !this._fired.has(cfg.waitTriggerId)) {
                this._pendingIndex = i;
                this._index = i;
                return;
            }
            this._spawnOne(cfg);
            i++;
            // 다음 것이 "함께 등장"이 아니면 여기서 멈춘다.
            if (i >= this.sockets.length || !this.sockets[i].spawnWithPrevious) break;
        }
        this._index = i;
    }

    private _spawnOne(config: SocketConfig) {
        // 호출부(_spawnFrom)에서도 막지만 여기서 한 번 더 본다 — 타입 좁히기가 함수 경계를
        // 넘지 못해서이고, 이 참조는 아래 setup에 그대로 들어간다.
        if (!this.playerNode) return;
        // 보상 추종자가 0인 소켓(건물만 짓는 타이쿤 구성)은 추종자 프리팹이 필요 없다.
        // 예전에는 여기서 followerPrefab을 무조건 요구해서, 추종자를 쓰지 않는 씬은 소켓이
        // 한 개도 스폰되지 않았다 — 매니저는 "그 씬이 채운 만큼만" 동작해야 한다.
        if (config.followerCount > 0 && !this.followerPrefab) return;
        const prefab = this._prefabFor(config);
        if (!prefab) return; // 해당 크기/자원의 소켓 프리팹이 연결 안 돼 있으면 스폰하지 않음

        const spawnAt = config.spawnPoint ?? this.spawnPoint;
        if (!spawnAt) return; // 개별/공용 스폰 위치가 둘 다 없으면 스폰하지 않음

        const node = instantiate(prefab);
        this.node.addChild(node);
        node.setWorldPosition(spawnAt.worldPosition);

        this._active++;

        const socket = node.getComponent(Socket) ?? node.addComponent(Socket);
        const setup: SocketSetup = {
            requiredCoins: config.requiredCoins,
            requiredCoins2: config.requiredCoins2,
            requiredResource2: config.resource2,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: config.isTrigger,
            requiredResource: config.resource,
            triggerId: config.triggerId,
            iconTexture: config.iconTexture,
            repeatable: false,
            onFulfilled: () => this._onSocketFulfilled(),
        };
        socket.activate(setup);
    }

    private _onSocketFulfilled() {
        this._active--;
        // 함께 등장한 형제가 아직 남아 있으면 다음으로 넘어가지 않는다.
        if (this._active > 0) return;
        if (this._index >= this.sockets.length) {
            // 소켓 목록의 마지막 하나까지 다 지었음 — GameManager가 이 신호로 최종 보스 웨이브 +
            // 게임 종료(CTA) 시퀀스를 시작한다. 더 스폰할 다음 소켓이 없으므로 여기서 끝낸다.
            CoinEvents.emit(CoinEventName.AllBuildingSocketsCompleted);
            return;
        }
        // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 진입하면 다음 소켓이 같은 자리에서
        // 즉시(같은 프레임/바로 다음 프레임에) 곧바로 충족되어 버려 "동시에 터지는" 것처럼
        // 보이는 문제가 있었다 — 일정 시간 텀을 둬서 확실히 순차적으로 등장하게 한다.
        this.scheduleOnce(() => this._spawnFrom(this._index), this.nextSocketDelay);
    }
}
