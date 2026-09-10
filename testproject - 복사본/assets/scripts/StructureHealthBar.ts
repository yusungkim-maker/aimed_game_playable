import { _decorator, Component } from 'cc';
import { StructureHealthBarManager } from './StructureHealthBarManager';
import { MonsterHpBarView } from './MonsterHpBarView';
const { ccclass, property } = _decorator;

/**
 * 기지(base)/문(Door) 같은 구조물에 붙여서 체력바를 관리하는 얇은 컴포넌트.
 * MonsterHealthBar와 완전히 같은 패턴 — 데미지를 한 번도 안 입은 동안은 체력바를 아예
 * 만들지 않고, 처음 데미지를 입는 순간(onDamaged 첫 호출)에만 StructureHealthBarManager
 * 풀에서 인스턴스를 빌려와 노출한다.
 */
@ccclass('StructureHealthBar')
export class StructureHealthBar extends Component {
    @property({ displayName: '체력바 크기 배율', tooltip: '이 구조물만 따로 키우고 싶을 때 조정 (기본 1). StructureHealthBarManager의 전체 배율과 곱해져서 적용됨' })
    barScale: number = 1;

    @property({ displayName: '높이 오프셋 재정의(m)', tooltip: '0이면 체력바 프리팹(StructureHPBar)의 기본 오프셋을 그대로 쓴다. 이 구조물 위에 딱 맞게 띄우고 싶을 때만 값을 지정' })
    offsetYOverride: number = 0;

    private _view: MonsterHpBarView | null = null;

    /** 데미지를 입을 때마다 호출 — 처음 호출되는 순간 체력바를 실체화한다 */
    onDamaged(hp: number, maxHp: number) {
        if (!this._view) {
            this._view = StructureHealthBarManager.instance?.acquire() ?? null;
            if (!this._view) return;
            this._view.target = this.node;
            if (this.offsetYOverride > 0) this._view.offsetY = this.offsetYOverride;
            const mgr = StructureHealthBarManager.instance;
            const s = this.barScale * (mgr?.barScale ?? 1);
            this._view.node.setScale(s, s, 1);
        }
        this._view.setRatio(maxHp > 0 ? hp / maxHp : 0);
    }

    hide() {
        if (!this._view) return;
        StructureHealthBarManager.instance?.release(this._view);
        this._view = null;
    }

    onDestroy() { this.hide(); }
}
