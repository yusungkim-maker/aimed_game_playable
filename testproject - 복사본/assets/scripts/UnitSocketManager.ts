import { _decorator, Component, Node, Prefab, Texture2D, instantiate } from 'cc';
import { Socket, SocketSetup } from './Socket';
import { SocketVariant } from './SocketManager';
import { FollowerFormation } from './FollowerFormation';
import { MonsterSpawner } from './MonsterSpawner';
import { TriggerId } from './TriggerId';
import { CoinEvents, CoinEventName } from './CoinEvents';
const { ccclass, property } = _decorator;

/**
 * 유닛 생산 소켓 1개에 대한 설정. 건물 트리거 소켓(SocketManager)과 마찬가지로 목록 순서대로
 * 하나씩만 등장하고 1회성이다(요구치를 채우면 사라짐) — 다른 점은 각 소켓마다 자기만의 고정
 * 위치가 있다는 것뿐이다(공용 위치 없음, spawnPoint 필수).
 */
@ccclass('UnitSocketConfig')
export class UnitSocketConfig {
    @property({ type: SocketVariant, displayName: '소켓 크기', tooltip: '이 소켓을 socket_L(대형)로 스폰할지 socket_S(소형)로 스폰할지' })
    variant: SocketVariant = SocketVariant.L;

    @property({ displayName: '요구 코인 개수' })
    requiredCoins: number = 5;

    @property({ displayName: '생산 유닛 수', tooltip: '요구치를 채우는 순간(1회) 생산되는 유닛 수' })
    followerCount: number = 1;

    @property({ displayName: '코인 흡수 간격(초)', tooltip: '등 뒤 스택에서 코인을 한 개씩 빼서 이 소켓으로 보내는 주기 — 작을수록 빠르게 우르르 빨려들어감 (Socket 프리팹 기본값을 이 소켓만 덮어씀)' })
    depositInterval: number = 0.05;

    @property({ type: Node, displayName: '소켓 위치(필수)', tooltip: '이 소켓이 등장할 자리 — 목록의 각 소켓마다 자기 자리가 다르므로 반드시 지정해야 한다' })
    spawnPoint: Node | null = null;

    @property({ displayName: '유도 화살표 UI 표시' })
    showGuideArrow: boolean = false;

    @property({ type: Texture2D, displayName: '아이콘 텍스처', tooltip: '이 소켓 몸통 위 아이콘 판(socket_S의 "icon" 메시)에 표시할 이미지 — 소켓마다 어떤 유닛이 나오는지 다르게 보여줄 때 지정한다. 비워두면 아이콘 판 자체를 끈다(기존 씬처럼 보임). socket_L에는 아이콘 메시가 없어서 지정해도 표시되지 않는다' })
    iconTexture: Texture2D | null = null;
}

/**
 * 유닛 생산 소켓 전용 매니저. 건물 건축 소켓(SocketManager)과 동일하게 목록 순서대로 하나씩만
 * 등장시키고, 요구치를 채우면 사라지고(1회성) 대기시간 후 다음 소켓이 등장한다 — 다른 점은
 * 각 소켓마다 자기만의 고정 위치를 쓴다는 것뿐이다(공용 스폰 위치 없음).
 *
 * 지정된 개수(기본 3개, 즉 목록의 0~2번)만큼 소켓을 완료하면 건물 건축 소켓(SocketManager)이
 * 그때부터 등장하기 시작한다 — CoinEvents.BuildingSocketsUnlocked로 느슨하게 연결됨.
 */
@ccclass('UnitSocketManager')
export class UnitSocketManager extends Component {
    @property({ type: [UnitSocketConfig], displayName: '유닛 생산 소켓 목록', tooltip: '등장 순서대로. 1번=배열의 0번째. 한 번에 하나만 등장하며, 요구치를 채우면 사라지고 대기시간 후 다음 소켓이 등장한다' })
    sockets: UnitSocketConfig[] = [];

    @property({ type: Prefab, displayName: '소켓 프리팹 (L)' })
    socketPrefab: Prefab | null = null;

    @property({ type: Prefab, displayName: '소켓 프리팹 (S)' })
    socketPrefabS: Prefab | null = null;

    @property({ type: Prefab, displayName: '유닛(추종자) 프리팹' })
    followerPrefab: Prefab | null = null;

    @property({ type: Node, displayName: '플레이어 노드' })
    playerNode: Node | null = null;

    @property({ type: Node, displayName: '몬스터 스포너 노드' })
    monsterSpawnerNode: Node | null = null;

    @property({ displayName: '다음 소켓 등장 대기시간(초)', tooltip: '한 소켓이 요구치를 채우고 사라진 뒤 다음 소켓이 나타나기까지의 지연 시간' })
    nextSocketDelay: number = 2;

    @property({ displayName: '첫 생산 완료 시 시작할 러쉬 이름', tooltip: '1번째 소켓이 요구치를 채우는 순간 이 이름의 러쉬를 시작한다' })
    firstRushName: string = 'Rush_1';

    @property({ displayName: '첫 생산 완료 시 추가로 1회만 시작할 러쉬 이름', tooltip: '게임 시작 직후 소켓에 코인을 넣고 첫 러쉬가 도착하기까지의 텀을 줄이기 위한 1회성 추가 러쉬 (예: 경로 중간 지점에서 바로 등장). 비워두면 추가 러쉬 없음. firstRushName과 마찬가지로 딱 한 번만 시작된다' })
    firstRushExtraName: string = 'Rush_1_Intro';

    @property({ displayName: '건물 소켓 해금까지 필요한 완료 소켓 개수', tooltip: '유닛 생산 소켓을 이 개수만큼 순서대로 완료하면(기본 3 = 0,1,2번) 건물 건축 소켓(SocketManager)이 그때부터 등장하기 시작한다' })
    unlockBuildingSocketsAfterCount: number = 3;

    private _index = 0;
    private _formation: FollowerFormation | null = null;
    private _rushStarted = false;
    private _buildingSocketsUnlocked = false;

    start() {
        if (this.playerNode) this._formation = this.playerNode.getComponent(FollowerFormation);
        this._spawnCurrent();
    }

    private _spawnCurrent() {
        if (!this.playerNode || !this.followerPrefab) return;
        if (this._index >= this.sockets.length) return;

        const config = this.sockets[this._index];
        if (!config.spawnPoint) return; // 이 소켓의 고정 위치가 지정 안 돼 있으면 스폰하지 않음
        const prefab = config.variant === SocketVariant.S ? this.socketPrefabS : this.socketPrefab;
        if (!prefab) return;

        const node = instantiate(prefab);
        this.node.addChild(node);
        node.setWorldPosition(config.spawnPoint.worldPosition);

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
            isTrigger: false,
            triggerId: TriggerId.None,
            iconTexture: config.iconTexture,
            repeatable: false,
            onFulfilled: () => this._onSocketFulfilled(),
        };
        socket.activate(setup);
    }

    private _onSocketFulfilled() {
        // 1번째 소켓이 요구치를 채우는 순간 러쉬를 시작한다 (한 번만).
        if (!this._rushStarted && this._index === 0) {
            this._rushStarted = true;
            const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner);
            spawner?.startRushByName(this.firstRushName);
            if (this.firstRushExtraName) spawner?.startRushByName(this.firstRushExtraName);
        }

        this._index++;

        // 지정된 개수만큼(기본 3개, 0~2번) 완료되는 순간 건물 건축 소켓 스폰을 풀어준다.
        // SocketManager.ts가 이 이벤트를 구독해서 그전까지는 건물 소켓을 하나도 스폰하지 않는다.
        if (!this._buildingSocketsUnlocked && this._index >= this.unlockBuildingSocketsAfterCount) {
            this._buildingSocketsUnlocked = true;
            CoinEvents.emit(CoinEventName.BuildingSocketsUnlocked);
        }

        // 코인을 한 번에 여러 소켓 분량만큼 모아둔 채로 다음 소켓이 같은 자리에서 즉시 충족되어
        // 버리는 것을 방지 — SocketManager와 동일한 이유의 지연.
        this.scheduleOnce(() => this._spawnCurrent(), this.nextSocketDelay);
    }
}
