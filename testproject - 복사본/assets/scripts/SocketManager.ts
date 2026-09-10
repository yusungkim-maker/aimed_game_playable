import { _decorator, Component, Node, Prefab, Enum, Texture2D, instantiate } from 'cc';
import { Socket, SocketSetup } from './Socket';
import { FollowerFormation } from './FollowerFormation';
import { TriggerId } from './TriggerId';
import { CoinEvents, CoinEventName } from './CoinEvents';
const { ccclass, property } = _decorator;

/** 소켓 크기 변형 — 소켓마다 socket_L/socket_S 중 어느 프리팹으로 스폰할지 고른다. */
export enum SocketVariant {
    L = 0,
    S = 1,
}
Enum(SocketVariant);

/**
 * 소켓 1개에 대한 설정 — 요구 코인 개수와 보상으로 나오는 추종자 수.
 * 인스펙터 배열의 +/- 버튼으로 몇 번째 소켓까지 있을지 자유롭게 추가/삭제한다.
 */
@ccclass('SocketConfig')
export class SocketConfig {
    @property({ type: SocketVariant, displayName: '소켓 크기', tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지 — 아래 SocketManager의 두 프리팹 슬롯 중 하나가 실제로 쓰인다' })
    variant: SocketVariant = SocketVariant.L;

    @property({ displayName: '요구 코인 개수' })
    requiredCoins: number = 5;

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

    @property({ type: Texture2D, displayName: '아이콘 텍스처', tooltip: '이 소켓 몸통 위 아이콘 판(socket_S의 "icon" 메시)에 표시할 이미지 — 소켓마다 어떤 건물이 나오는지 다르게 보여줄 때 지정한다. 비워두면 아이콘 판 자체를 끈다(기존 씬처럼 보임). socket_L에는 아이콘 메시가 없어서 지정해도 표시되지 않는다' })
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

    @property({ type: Prefab, displayName: '소켓 프리팹 (L)', tooltip: '소켓 목록에서 "소켓 크기"를 L로 설정한 소켓이 사용할 프리팹 (socket_L)' })
    socketPrefab: Prefab | null = null;

    @property({ type: Prefab, displayName: '소켓 프리팹 (S)', tooltip: '소켓 목록에서 "소켓 크기"를 S로 설정한 소켓이 사용할 프리팹 (socket_S)' })
    socketPrefabS: Prefab | null = null;

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
        if (this.unlockTriggerId === TriggerId.None) return;
        if (triggerId !== this.unlockTriggerId) return;
        this._onUnlocked();
    }

    private _onUnlocked() {
        if (this._unlocked) return;
        this._unlocked = true;
        this._spawnCurrent();
    }

    private _spawnCurrent() {
        if (!this.playerNode || !this.followerPrefab) return;
        if (this._index >= this.sockets.length) return;

        const config = this.sockets[this._index];
        const prefab = config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
        if (!prefab) return; // 해당 크기의 소켓 프리팹이 연결 안 돼 있으면 스폰하지 않음

        const spawnAt = config.spawnPoint ?? this.spawnPoint;
        if (!spawnAt) return; // 개별/공용 스폰 위치가 둘 다 없으면 스폰하지 않음

        const node = instantiate(prefab);
        this.node.addChild(node);
        node.setWorldPosition(spawnAt.worldPosition);

        const socket = node.getComponent(Socket) ?? node.addComponent(Socket);
        const setup: SocketSetup = {
            requiredCoins: config.requiredCoins,
            followerCount: config.followerCount,
            playerNode: this.playerNode,
            followerPrefab: this.followerPrefab,
            monsterSpawnerNode: this.monsterSpawnerNode,
            formation: this._formation,
            depositInterval: config.depositInterval,
            showGuideArrow: config.showGuideArrow,
            isTrigger: config.isTrigger,
            triggerId: config.triggerId,
            iconTexture: config.iconTexture,
            repeatable: false,
            onFulfilled: () => this._onSocketFulfilled(),
        };
        socket.activate(setup);
    }

    private _onSocketFulfilled() {
        this._index++;
        if (this._index >= this.sockets.length) {
            // 소켓 목록의 마지막 하나까지 다 지었음 — GameManager가 이 신호로 최종 보스 웨이브 +
            // 게임 종료(CTA) 시퀀스를 시작한다. 더 스폰할 다음 소켓이 없으므로 여기서 끝낸다.
            CoinEvents.emit(CoinEventName.AllBuildingSocketsCompleted);
            return;
        }
        // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 진입하면 다음 소켓이 같은 자리에서
        // 즉시(같은 프레임/바로 다음 프레임에) 곧바로 충족되어 버려 "동시에 터지는" 것처럼
        // 보이는 문제가 있었다 — 일정 시간 텀을 둬서 확실히 순차적으로 등장하게 한다.
        this.scheduleOnce(() => this._spawnCurrent(), this.nextSocketDelay);
    }
}
