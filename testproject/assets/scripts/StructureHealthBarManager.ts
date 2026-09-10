import { _decorator, Component, Node, Prefab, Camera, instantiate } from 'cc';
import { MonsterHpBarView } from './MonsterHpBarView';
const { ccclass, property } = _decorator;

/**
 * 기지/문 등 "몬스터가 아닌" 구조물 체력바 UI 인스턴스 풀. MonsterHealthBarManager와 완전히
 * 같은 방식(필요할 때만 꺼내 쓰고 반납)이지만 별도 풀로 분리해서, 몬스터와 다른 프리팹
 * (아군 색상 Bar_Pc_hp_our를 쓰는 StructureHPBar.prefab)을 쓸 수 있게 한다 — 구조물 수가
 * 적어(기지 1개 + 문 몇 개) 몬스터처럼 자주 생성/파괴되지는 않지만, 같은 View/풀 패턴을
 * 재사용하는 게 새 로직을 만드는 것보다 안전하다.
 */
@ccclass('StructureHealthBarManager')
export class StructureHealthBarManager extends Component {
    static instance: StructureHealthBarManager | null = null;

    @property({ type: Prefab, displayName: '체력바 프리팹' })
    barPrefab: Prefab | null = null;

    @property({ type: Camera, displayName: '월드 카메라(3D)' })
    worldCamera: Camera | null = null;

    private _pool: Node[] = [];

    onLoad() { StructureHealthBarManager.instance = this; }
    onDestroy() { if (StructureHealthBarManager.instance === this) StructureHealthBarManager.instance = null; }

    acquire(): MonsterHpBarView | null {
        if (!this.barPrefab) return null;
        let node = this._pool.pop();
        if (!node) {
            node = instantiate(this.barPrefab);
            this.node.addChild(node);
        }
        node.active = true;
        const view = node.getComponent(MonsterHpBarView);
        if (view) view.worldCamera = this.worldCamera;
        return view;
    }

    release(view: MonsterHpBarView) {
        view.target = null;
        view.node.active = false;
        view.node.setScale(1, 1, 1);
        this._pool.push(view.node);
    }
}
