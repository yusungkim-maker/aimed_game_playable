import { _decorator, Component } from 'cc';
import { MonsterHealthBarManager } from './MonsterHealthBarManager';
import { MonsterHpBarView } from './MonsterHpBarView';
const { ccclass } = _decorator;

/**
 * 몬스터 노드에 addComponent로 붙는 얇은 컴포넌트(Monster.ts와 동일한 방식 — MonsterSpawner가
 * 스폰 시점에 붙인다). 실제 표시는 MonsterHealthBarManager 풀에서 빌린 MonsterHpBarView가
 * 담당하고, 이 컴포넌트는 그 인스턴스의 획득/반납과 데미지 시점의 등장만 책임진다.
 * 데미지를 한 번도 안 입은 몬스터는 체력바를 아예 만들지 않는다(요청사항: 무피해 상태에선 숨김).
 */
@ccclass('MonsterHealthBar')
export class MonsterHealthBar extends Component {
    /** MonsterSpawner가 스폰 직후 RushGroup 설정에 따라 지정 */
    isBoss = false;

    private _view: MonsterHpBarView | null = null;

    /** 데미지를 입을 때마다 호출 — 처음 호출되는 순간 체력바를 실체화한다 */
    onDamaged(hp: number, maxHp: number) {
        if (!this._view) {
            this._view = MonsterHealthBarManager.instance?.acquire() ?? null;
            if (!this._view) return;
            this._view.target = this.node;
            const mgr = MonsterHealthBarManager.instance;
            const s = this.isBoss ? (mgr?.bossBarScale ?? 2) : (mgr?.barScale ?? 1);
            this._view.node.setScale(s, s, 1);
        }
        this._view.setRatio(maxHp > 0 ? hp / maxHp : 0);
    }

    hide() {
        if (!this._view) return;
        MonsterHealthBarManager.instance?.release(this._view);
        this._view = null;
    }

    onDestroy() { this.hide(); }
}
