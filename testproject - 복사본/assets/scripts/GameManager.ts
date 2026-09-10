import { _decorator, Component, Sprite, Node, CCFloat, Vec3 } from 'cc';
import { CameraFollow } from './CameraFollow';
import { CoinSpawnController } from './CoinSpawnController';
import { EndingEffect } from './EndingEffect';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { MonsterSpawner } from './MonsterSpawner';
// Monster.ts가 GameManager를 참조하므로 런타임 순환 참조가 생기지 않도록 타입으로만 가져온다
import type { Monster } from './Monster';
import { JoystickUI } from './JoystickUI';
import { StructureHealthBar } from './StructureHealthBar';
import { StructureHitFlash } from './StructureHitFlash';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    static instance: GameManager | null = null;

    /** 엔딩 일제 처치 시 몬스터에게 넣는 피해량 — 보스 체력까지 한 방에 넘기기 위한 값 */
    private static readonly SWEEP_DAMAGE = 1e9;

    @property(Sprite) hpBar:    Sprite | null = null;
    @property(Node)   ctaPanel: Node   | null = null;
    @property({ type: Node, displayName: '기지(base) 노드', tooltip: '몬스터가 처음 데미지를 줄 때 이 노드 위에 체력바(StructureHealthBar)를 노출시키기 위해 참조' })
    baseNode: Node | null = null;
    @property({ type: Node, displayName: '어둡게 가릴 배경', tooltip: 'CTA 버튼이 뜰 때 화면 전체를 반투명 검정으로 덮는 배경. ctaPanel과 함께 켜진다' })
    dimBackground: Node | null = null;
    @property({ type: Node, displayName: '조이스틱(Joystick_Base) 노드', tooltip: 'CTA가 뜨는 순간 함께 숨기고 입력을 끈다 — JoystickUI 컴포넌트가 붙어있는 노드' })
    joystickNode: Node | null = null;
    @property totalWaves: number = 2;
    @property maxHp:     number = 10;

    @property({ type: Node, displayName: '몬스터 스포너 노드', tooltip: '건물 소켓을 전부 지었을 때 최종 보스 웨이브를 시작시키고, CTA가 뜨는 순간 남은 몬스터를 정리하기 위해 참조' })
    monsterSpawnerNode: Node | null = null;
    @property({ displayName: '최종 보스 웨이브 이름', tooltip: 'MonsterSpawner.rushes에 등록된 RushConfig 이름 — 건물 소켓을 전부 지은 순간 시작된다 (모든 path에 보스 2마리씩)' })
    finalRushName: string = 'Rush_Final_Boss';
    @property({ displayName: '최종 웨이브 후 엔딩까지 대기시간(초)', tooltip: '최종 보스 웨이브가 시작된 뒤 이 시간이 지나면 스폰을 멈추고 엔딩 연출(몬스터 일제 처치 → CTA)로 넘어간다' })
    finalWaveToEndingDelay: number = 2;

    // ── 엔딩 연출 ─────────────────────────────────────────────────────────
    @property({ type: CCFloat, displayName: '엔딩 줌아웃 배율', tooltip: '마지막 소켓을 짓는 순간부터 카메라가 이 배율만큼 서서히 물러나며 완성된 기지 전체를 보여준다 (2 = 두 배 넓게)' })
    endingZoomMult: number = 2;

    @property({ type: CCFloat, displayName: '엔딩 줌아웃 시간(초)' })
    endingZoomDuration: number = 2.5;

    @property({ type: CCFloat, displayName: '엔딩 카메라 추적 속도', tooltip: '엔딩에서 카메라가 기지 쪽으로 미끄러지는 속도. 평소 추적 속도보다 낮게 두면 영화처럼 천천히 옮겨간다' })
    endingFollowSpeed: number = 2;

    @property({ displayName: '엔딩 카메라 위치 보정', tooltip: '줌아웃했을 때 기지가 화면 한쪽으로 치우치는 걸 잡는 월드 오프셋. X를 키우면 카메라가 오른쪽으로(=기지가 화면 왼쪽으로), Z를 키우면 화면 아래쪽으로 구도가 옮겨간다. 카메라가 -45도로 내려다보므로 Y는 거의 만질 일이 없다' })
    endingCameraOffset: Vec3 = new Vec3(2, 0, 0);

    @property({ type: CCFloat, displayName: '몬스터 처치 간격(초)', tooltip: '엔딩에서 몬스터가 왼쪽부터 하나씩 죽는 간격. 작을수록 "쫘라라락" 빠르게 쓸려나간다' })
    endingKillInterval: number = 0.07;

    @property({ type: CCFloat, displayName: '마지막 처치 후 CTA까지(초)' })
    endingCtaDelay: number = 1.2;

    private _score   = 0;
    private _hp      = 10;
    private _curWave = 1;
    private _ended   = false;

    onLoad() {
        GameManager.instance = this;
        CoinEvents.on(CoinEventName.AllBuildingSocketsCompleted, this._onAllBuildingSocketsCompleted, this);
    }
    onDestroy() {
        if (GameManager.instance === this) GameManager.instance = null;
        CoinEvents.off(CoinEventName.AllBuildingSocketsCompleted, this._onAllBuildingSocketsCompleted, this);
    }
    start()     { this._hp = this.maxHp; this._refreshUI(); }

    addScore(pts: number) {
        this._score += pts;
        this._refreshUI();
    }

    /** 몬스터가 기지(집)를 공격했을 때 호출 */
    baseTakeDamage(dmg: number) {
        if (this._ended) return;
        this._hp = Math.max(0, this._hp - dmg);
        this._refreshUI();
        this.baseNode?.getComponent(StructureHealthBar)?.onDamaged(this._hp, this.maxHp);
        this.baseNode?.getComponent(StructureHitFlash)?.flash();
        if (this._hp <= 0) this._finish();
    }

    setWave(n: number) {
        this._curWave = n;
        this._refreshUI();
    }

    onAllWavesDone() {
        if (this._ended) return;
        this.scheduleOnce(() => this._finish(), 1.5);
    }

    private _finish() {
        if (this._ended) return;
        this._ended = true;
        this.scheduleOnce(() => this._showCta(), 1.0);
    }

    /** 건물 건축 소켓(SocketManager의 "소켓 목록")을 마지막 하나까지 전부 지었을 때 —
     * 급박한 상황을 연출하기 위해 모든 path에 보스를 2마리씩 태우는 최종 웨이브를 띄우면서,
     * 동시에 카메라가 기지 쪽으로 물러나며 완성된 기지 전체를 보여주기 시작한다. */
    private _onAllBuildingSocketsCompleted() {
        if (this._ended) return;
        const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner);
        spawner?.startRushByName(this.finalRushName);

        CameraFollow.instance?.playEndingZoom(
            this.baseNode, this.endingZoomMult, this.endingZoomDuration,
            this.endingFollowSpeed, this.endingCameraOffset,
        );

        // 씬에 배치해둔 엔딩 이펙트(efffect1~4 등)를 전부 재생 — 각자 애니메이션을 돌리고
        // 자기 설정대로 페이드아웃한 뒤 스스로 꺼진다.
        EndingEffect.playAll();

        this.scheduleOnce(() => this._finishVictory(), this.finalWaveToEndingDelay);
    }

    /** 최종 보스 웨이브가 시작되고 finalWaveToEndingDelay초가 지난 시점 —
     * 추가 스폰만 끊고(이미 나와있는 몬스터는 남긴다) 일제 처치 연출로 넘어간다. */
    private _finishVictory() {
        if (this._ended) return;
        this._ended = true;
        this.monsterSpawnerNode?.getComponent(MonsterSpawner)?.stopSpawning();
        // 여기서 떨어지는 코인은 연출용이라 플레이어에게 회수시키지 않고 그 자리에 남긴다.
        if (CoinSpawnController.instance) CoinSpawnController.instance.dropOnly = true;
        this._sweepMonsters();
    }

    /** 맵에 남아있는 몬스터를 기지에서 가까운 순서로 하나씩 처치한다.
     *
     * 몬스터는 스폰 지점 → 기지 방향으로 몰려오므로, 기지와의 거리 오름차순은 곧 그 진행
     * 방향의 **역순**이다. 결과적으로 기지에서 바깥으로 퍼져나가는 파도처럼 쓸려나가서,
     * 여러 갈래 path가 동시에 정리되는 게 한눈에 보인다 (화면 왼쪽부터 훑는 것보다 몬스터가
     * 실제로 흘러온 줄기를 거슬러 올라가는 그림이라 더 잘 읽힌다).
     *
     * despawnSilently()가 아니라 정상 피격 경로로 죽인다 — 사망 이펙트와 효과음, 코인 드롭이
     * 그대로 나와서 마지막에 한 번에 터지는 맛이 살기 때문. */
    private _sweepMonsters() {
        const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner);
        const base = this.baseNode?.worldPosition;
        const alive = [...(spawner?.activeMonsters ?? [])]
            .filter((m) => m.node?.isValid && !m.isDead)
            .sort((a, b) => this._sweepOrder(a, base) - this._sweepOrder(b, base));

        alive.forEach((m, i) => {
            this.scheduleOnce(() => {
                if (m.node?.isValid && !m.isDead) m.takeDamage(GameManager.SWEEP_DAMAGE);
            }, i * this.endingKillInterval);
        });

        const sweepTime = alive.length * this.endingKillInterval;
        this.scheduleOnce(() => this._showCta(), sweepTime + this.endingCtaDelay);
    }

    /** 처치 순서 기준값 — 기지까지의 거리(제곱). 기지 노드가 없으면 예전처럼 화면 왼쪽부터. */
    private _sweepOrder(m: Monster, base: Readonly<Vec3> | undefined): number {
        if (!base) return m.node.worldPosition.x;
        return Vec3.squaredDistance(m.node.worldPosition, base);
    }

    private _showCta() {
        this.joystickNode?.getComponent(JoystickUI)?.disable();
        if (this.dimBackground) this.dimBackground.active = true;
        if (this.ctaPanel) this.ctaPanel.active = true;
    }

    private _refreshUI() {
        if (this.hpBar && this.hpBar.spriteFrame) {
            this.hpBar.fillRange = this._hp / this.maxHp;
        }
    }
}
