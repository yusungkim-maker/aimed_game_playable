import { _decorator, Component, Node, Prefab, Camera, instantiate } from 'cc';
import { MonsterHpBarView } from './MonsterHpBarView';
const { ccclass, property } = _decorator;

/**
 * 몬스터 체력바 UI 인스턴스 풀. 모든 몬스터가 공유하는 단일 Canvas 아래 컨테이너 하나만 두고,
 * 필요할 때(데미지를 처음 입는 순간)만 풀에서 하나 꺼내 쓰고 몬스터가 죽거나 다시 풀피가 되면
 * 반납한다 — 몬스터 수만큼 매번 새 UI 노드를 만들고 부수는 대신 재사용해서
 * 스폰/사망이 잦은 러쉬 디펜스 특성상 생기는 GC/인스턴스화 비용을 줄인다.
 */
@ccclass('MonsterHealthBarManager')
export class MonsterHealthBarManager extends Component {
    static instance: MonsterHealthBarManager | null = null;

    @property({ type: Prefab, displayName: '체력바 프리팹' })
    barPrefab: Prefab | null = null;

    @property({ type: Camera, displayName: '월드 카메라(3D)' })
    worldCamera: Camera | null = null;

    @property({ displayName: '체력바 높이 오프셋', tooltip: '몬스터 머리 위로 띄울 높이 (월드 단위, 몬스터 스케일 1 기준 — 실제로는 몬스터 스케일만큼 비례 적용됨)' })
    offsetY: number = 1.2;

    @property({ displayName: '체력바 크기 배율', tooltip: '일반 몬스터 체력바 크기 배율 (기본 1)' })
    barScale: number = 1;

    @property({ displayName: '보스 체력바 크기 배율', tooltip: '보스 몬스터 체력바 크기 배율 (기본 2)' })
    bossBarScale: number = 2;

    private _pool: Node[] = [];

    onLoad() { MonsterHealthBarManager.instance = this; }
    onDestroy() { if (MonsterHealthBarManager.instance === this) MonsterHealthBarManager.instance = null; }

    acquire(): MonsterHpBarView | null {
        if (!this.barPrefab) return null;
        let node = this._pool.pop();
        if (!node) {
            node = instantiate(this.barPrefab);
            this.node.addChild(node);
        }
        node.active = true;
        const view = node.getComponent(MonsterHpBarView);
        if (view) {
            view.worldCamera = this.worldCamera;
            view.offsetY = this.offsetY;
        }
        return view;
    }

    release(view: MonsterHpBarView) {
        view.target = null;
        view.node.active = false;
        view.node.setScale(1, 1, 1);
        this._pool.push(view.node);
    }
}
