import { _decorator, Component, SkinnedMeshRenderer, Material } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

interface GhostEntry {
    renderer: SkinnedMeshRenderer;
    realMaterial: Material | null;
}

/**
 * 생산 대기 중인 추종자(소켓 위 미리보기)의 고스트 상태를 관리한다.
 * enterGhost()로 실제 토온 머티리얼을 백업하고 FollowerGhost.effect 기반 머티리얼로
 * 교체한 뒤, fadeTo()로 ghostFactor(프레넬+반투명 factor)를 서서히 낮춘다. factor가
 * 0에 도달하면 solidify()가 원래 토온 머티리얼로 되돌려 다른 추종자들과 동일하게 보이게 한다.
 */
@ccclass('FollowerGhostState')
export class FollowerGhostState extends Component {
    @property(Material)
    ghostBodyMaterial: Material | null = null;

    @property(Material)
    ghostWeaponMaterial: Material | null = null;

    private _entries: GhostEntry[] = [];
    private _ghostFactor = 0;
    private _fadeFrom = 0;
    private _fadeTo = 0;
    private _fadeTimer = 0;
    private _fadeDuration = 0;
    private _fadeActive = false;
    private _onFadeDone: (() => void) | null = null;

    get ghostFactor(): number { return this._ghostFactor; }
    get isGhost(): boolean { return this._entries.length > 0; }

    /** 고스트(생산 대기) 상태로 진입 — 원래 머티리얼을 백업하고 고스트 머티리얼로 교체.
     * 아직 "생산되지 않은" 상태이므로 몬스터 타게팅/공격도 함께 꺼둔다. */
    enterGhost() {
        const player = this.getComponent(Player);
        if (player) player.combatEnabled = false;

        this._entries = [];
        const renderers = this.node.getComponentsInChildren(SkinnedMeshRenderer);
        for (const r of renderers) {
            const isBody = r.node.name === 'NPC_Summon_001';
            const isWeapon = r.node.name.startsWith('crossbow');
            const ghostAsset = isBody ? this.ghostBodyMaterial : (isWeapon ? this.ghostWeaponMaterial : null);
            if (!ghostAsset) continue;

            // setMaterial()에 다시 넣어 되돌리려면 인스턴스(getMaterialInstance)가 아니라
            // 공유 머티리얼 자체를 들고 있어야 한다 — 인스턴스를 넣으면 엔진이
            // "Can't set a material instance to a sharedMaterial slot" 에러를 낸다.
            const realMaterial = r.sharedMaterials[0] ?? null;
            r.setMaterial(ghostAsset, 0);
            this._entries.push({ renderer: r, realMaterial });
        }
        this.setGhostFactor(1);
    }

    setGhostFactor(v: number) {
        this._ghostFactor = v;
        for (const e of this._entries) {
            e.renderer.getMaterialInstance(0)?.setProperty('ghostFactor', v);
        }
    }

    /** ghostFactor를 duration에 걸쳐 target까지 선형 보간. 도달 시 onComplete 호출 */
    fadeTo(target: number, duration: number, onComplete?: () => void) {
        this._fadeFrom = this._ghostFactor;
        this._fadeTo = target;
        this._fadeDuration = Math.max(0.0001, duration);
        this._fadeTimer = 0;
        this._fadeActive = true;
        this._onFadeDone = onComplete ?? null;
    }

    /** 고스트 → 실체화: 원래 토온 머티리얼로 되돌리고 고스트 상태를 해제한다.
     * 이 시점부터 진짜 추종자로 취급해 몬스터 타게팅/공격을 다시 켠다. */
    solidify() {
        this._fadeActive = false;
        for (const e of this._entries) {
            if (e.realMaterial) e.renderer.setMaterial(e.realMaterial, 0);
        }
        this._entries = [];
        this._ghostFactor = 0;

        const player = this.getComponent(Player);
        if (player) player.combatEnabled = true;
    }

    update(dt: number) {
        if (!this._fadeActive) return;
        this._fadeTimer += dt;
        const t = Math.min(1, this._fadeTimer / this._fadeDuration);
        this.setGhostFactor(this._fadeFrom + (this._fadeTo - this._fadeFrom) * t);
        if (t >= 1) {
            this._fadeActive = false;
            const cb = this._onFadeDone;
            this._onFadeDone = null;
            cb?.();
        }
    }
}
