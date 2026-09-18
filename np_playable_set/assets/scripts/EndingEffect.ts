import { _decorator, Component, MeshRenderer, SkeletalAnimation, Material, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 엔딩 연출용 일회성 이펙트. 평소엔 꺼져 있다가 마지막 소켓이 완성되는 순간 켜지면서
 * 자기 애니메이션을 재생하고, 지정한 시간에 걸쳐 서서히 사라진 뒤 스스로 다시 꺼진다.
 *
 * 씬에 놓인 이펙트 노드마다 하나씩 붙이면 되고, 켜는 쪽(GameManager)이 각 노드를 인스펙터로
 * 참조할 필요가 없도록 static 목록에 자동 등록된다 — 이펙트를 더 추가/삭제해도 코드 수정이 없다.
 *
 * 페이드는 머티리얼의 alphaScale(GlowFx.effect)을 렌더러별 인스턴스에만 낮춰서 처리하므로
 * 공유 머티리얼 에셋은 건드리지 않는다.
 */
@ccclass('EndingEffect')
export class EndingEffect extends Component {
    static all: EndingEffect[] = [];

    @property({ type: Material, displayName: '발광 머티리얼', tooltip: 'effects/GlowFx.mtl — 비워두면 모델이 원래 들고 있던 머티리얼을 그대로 쓴다. glb가 자동 생성한 builtin-standard 머티리얼은 이 프로젝트에서 컴파일에 실패해 아예 안 보일 수 있으므로 지정하는 쪽을 권장' })
    glowMaterial: Material | null = null;

    @property({ displayName: '시작 시 숨김', tooltip: '켜두면 씬 시작과 함께 노드를 꺼서, 엔딩 전까지 보이지 않게 한다' })
    hideOnStart: boolean = true;

    @property({ displayName: '엔딩 일괄 재생에 등록', tooltip: '켜두면 마지막 소켓 완성 시 EndingEffect.playAll()로 함께 재생되는 목록에 들어간다. 씬에 미리 놓아둔 엔딩 이펙트는 켜둔 채로 두고, 게임 도중 코드가 그때그때 만들어 쓰는 1회성 이펙트(예: 일꾼 발밑 원형 이펙트)는 꺼야 한다 — 안 그러면 엔딩 때 이미 사라진 것들이 되살아난다' })
    registerToPlayAll: boolean = true;

    @property({ displayName: '끝나면 노드 삭제', tooltip: '페이드아웃이 끝났을 때 노드를 끄는 대신 아예 파괴한다. 코드가 매번 새로 만들어 쓰는 1회성 이펙트는 켜두어야 노드가 쌓이지 않는다' })
    destroyOnFinish: boolean = false;

    @property({ type: CCFloat, displayName: '유지 시간(초)', tooltip: '등장한 뒤 이 시간 동안은 그대로 보여주고, 그 다음부터 사라지기 시작한다' })
    holdDuration: number = 0;

    @property({ type: CCFloat, displayName: '페이드아웃 시간(초)' })
    fadeDuration: number = 2;

    @property({ type: CCFloat, displayName: '발광 세기', tooltip: 'GlowFx 머티리얼의 emissiveIntensity에 그대로 들어간다. 알파가 0인 부분은 영향을 받지 않고, 보이는 부분만 이 배율만큼 밝아진다', range: [0, 10], slide: true })
    emissiveIntensity: number = 2;

    private _renderers: MeshRenderer[] = [];
    private _anim: SkeletalAnimation | null = null;
    private _timer = 0;
    private _playing = false;

    onLoad() {
        if (this.registerToPlayAll) EndingEffect.all.push(this);
        this._renderers = this.node.getComponentsInChildren(MeshRenderer);
        this._anim = this.getComponent(SkeletalAnimation) ?? this.getComponentInChildren(SkeletalAnimation);

        // 머티리얼 교체는 여기서 한다 — sharedMaterials는 배열 프로퍼티라 인스펙터/툴로
        // 지정하기 번거롭고, glb가 자동 생성한 머티리얼을 파일 단위로 고칠 수도 없기 때문.
        if (this.glowMaterial) {
            for (const r of this._renderers) {
                for (let i = 0; i < r.sharedMaterials.length; i++) r.setMaterial(this.glowMaterial, i);
            }
        }

        if (this.hideOnStart) this.node.active = false;
    }

    onDestroy() {
        const i = EndingEffect.all.indexOf(this);
        if (i >= 0) EndingEffect.all.splice(i, 1);
    }

    /** 씬에 있는 모든 엔딩 이펙트를 한꺼번에 재생 */
    static playAll() {
        for (const e of EndingEffect.all) {
            if (e.node?.isValid) e.play();
        }
    }

    play() {
        this.node.active = true;
        this._timer = 0;
        this._playing = true;
        this._apply(1);
        this._anim?.play();
    }

    update(dt: number) {
        if (!this._playing) return;

        this._timer += dt;
        const t = this._timer - this.holdDuration;
        if (t <= 0) return;

        const k = Math.min(1, t / Math.max(0.0001, this.fadeDuration));
        this._apply(1 - k);

        if (k >= 1) {
            this._playing = false;
            if (this.destroyOnFinish) this.node.destroy();
            else this.node.active = false;
        }
    }

    private _apply(alpha: number) {
        for (const r of this._renderers) {
            for (let i = 0; i < r.sharedMaterials.length; i++) {
                const inst = r.getMaterialInstance(i);
                if (!inst) continue;
                inst.setProperty('alphaScale', alpha);
                inst.setProperty('emissiveIntensity', this.emissiveIntensity);
            }
        }
    }
}
