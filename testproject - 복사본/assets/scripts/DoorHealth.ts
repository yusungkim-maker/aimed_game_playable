import { _decorator, Component } from 'cc';
import { VirtualWall } from './VirtualWall';
import { StructureHealthBar } from './StructureHealthBar';
import { StructureHitFlash } from './StructureHitFlash';
const { ccclass, property } = _decorator;

/**
 * 문(Door) 하나의 체력. 몬스터는 기지로 가는 길에 살아있는 문이 있으면 그 문을 먼저 부숴야
 * 지나갈 수 있다(Monster.ts가 DoorHealth.all을 순회해 앞을 막는 문을 찾아 공격한다) — 문을
 * 완전히 부수면(hp<=0) 노드 자체가 사라진다(destroy). 자식인 VirtualWall도 함께 파괴되며
 * onDisable()에서 자동으로 막힘 목록에서 빠지므로, 별도 처리 없이 그 즉시 통과 가능해진다.
 *
 * BuildingTrigger가 이 문을 "건설"하는 시점(appear 재생 완료 후)에만 activate()로 켜진다 —
 * 그 전(아직 안 지어진 상태)에는 몬스터가 공격 대상으로 보지 않는다.
 */
@ccclass('DoorHealth')
export class DoorHealth extends Component {
    /** 현재 건설 완료되어(=활성화되어) 아직 안 부서진 모든 문 — Monster가 매 프레임 순회하며
     * 자기 앞을 막고 있는 문이 있는지 확인한다 */
    static all: DoorHealth[] = [];

    @property({ type: VirtualWall, displayName: '이 문의 가상의 벽', tooltip: '문이 부서지면 이 벽도 함께 사라져 더 이상 길을 막지 않는다 — 보통 이 문 프리팹 안의 VirtualWall 자식 노드' })
    obstacle: VirtualWall | null = null;

    @property({ displayName: '최대 체력', tooltip: '몬스터가 이 문을 부수는 데 필요한 총 데미지량. 문마다 다르게 조정 가능' })
    maxHp: number = 20;

    private _active = false;
    private _hp = 0;

    get hp(): number { return this._hp; }
    get isActive(): boolean { return this._active; }

    /** BuildingTrigger가 건설(appear) 완료 시점에 호출 */
    activate() {
        this._hp = this.maxHp;
        this._active = true;
        DoorHealth.all.push(this);
    }

    onDestroy() {
        const i = DoorHealth.all.indexOf(this);
        if (i >= 0) DoorHealth.all.splice(i, 1);
    }

    takeDamage(amt: number) {
        if (!this._active) return;
        this._hp = Math.max(0, this._hp - amt);
        // 몬스터를 때릴 때처럼, 처음 데미지를 입는 순간에만 체력바가 노출된다.
        this.getComponent(StructureHealthBar)?.onDamaged(this._hp, this.maxHp);
        this.getComponent(StructureHitFlash)?.flash();
        if (this._hp <= 0) this._die();
    }

    private _die() {
        this._active = false;
        this.node.destroy();
    }
}
