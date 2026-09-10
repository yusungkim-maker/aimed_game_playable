import { _decorator, Component, Sprite, Node } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { MonsterSpawner } from './MonsterSpawner';
import { JoystickUI } from './JoystickUI';
import { StructureHealthBar } from './StructureHealthBar';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    static instance: GameManager | null = null;

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
    @property({ displayName: '최종 웨이브 후 CTA까지 대기시간(초)', tooltip: '최종 보스 웨이브가 시작된 뒤 이 시간이 지나면 웨이브를 멈추고 화면의 몬스터를 전부 정리한 뒤 CTA를 띄운다' })
    finalWaveToEndingDelay: number = 5;

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
     * 급박한 상황을 연출하기 위해 모든 path에 보스를 2마리씩 태우는 최종 웨이브를 띄우고,
     * 그로부터 일정 시간 뒤 게임을 종료(CTA) 시퀀스로 넘긴다. */
    private _onAllBuildingSocketsCompleted() {
        if (this._ended) return;
        const spawner = this.monsterSpawnerNode?.getComponent(MonsterSpawner);
        spawner?.startRushByName(this.finalRushName);
        this.scheduleOnce(() => this._finishVictory(), this.finalWaveToEndingDelay);
    }

    /** 최종 보스 웨이브가 시작되고 finalWaveToEndingDelay초가 지난 시점 — 웨이브를 멈추고
     * 화면에 남아있던 몬스터를 코인 드롭 없이 전부 정리한 뒤 CTA를 띄운다. */
    private _finishVictory() {
        if (this._ended) return;
        this._ended = true;
        this.monsterSpawnerNode?.getComponent(MonsterSpawner)?.stopAndClearAll();
        this._showCta();
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
