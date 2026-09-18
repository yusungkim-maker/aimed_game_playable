import { _decorator, CCFloat, Component, Animation, AnimationClip, MeshRenderer, SkinnedMeshRenderer, tween, Vec3 } from 'cc';
import { CoinEvents, CoinEventName } from './CoinEvents';
import { TriggerId } from './TriggerId';
import { TowerAttack } from './TowerAttack';
import { DoorAutoOpen } from './DoorAutoOpen';
import { DoorHealth } from './DoorHealth';
import { VirtualWall } from './VirtualWall';
const { ccclass, property } = _decorator;

/**
 * door1/door2/tower/wall 같은 건물 프리팹에 붙여서, 소켓 목록에서 같은 트리거 ID로 설정한
 * 소켓이 요구치를 채우는 순간 이 건물이 "건설"되게(등장 애니메이션 재생) 만드는 컴포넌트.
 * 소켓 쪽(Socket.ts)과는 CoinEvents.SocketFilled 이벤트로만 느슨하게 연결되어 있다 —
 * 서로의 존재를 직접 참조하지 않으므로 건물을 씬 어디에 몇 개 배치하든 상관없다.
 *
 * 각 건물의 Animation/SkeletalAnimation이 가진 등장 클립 이름은 에셋마다 다르지만
 * (tower/wall/door1/door2 전부 "appear") 클립 이름을 하드코딩하지 않고 항상 defaultClip을
 * 재생한다. 각 프리팹의 defaultClip이 실제 등장 클립으로 지정되어 있어야 한다
 * (Tower/Wall/Door1/Door2 프리팹 준비 시 이미 그렇게 맞춰둠).
 *
 * door2는 별도로 "open" 클립을 DoorAutoOpen이 여닫힘 연출에 쓴다 — appear(건설 등장)와
 * open(플레이어 접근 시 여닫힘)은 서로 다른 클립이므로, appear가 다 재생되기 전까지는
 * DoorAutoOpen을 비활성 상태로 둬 두 애니메이션이 같은 뼈대를 동시에 건드리지 않게 한다.
 */
@ccclass('BuildingTrigger')
export class BuildingTrigger extends Component {
    @property({ type: TriggerId, displayName: '반응할 트리거 ID', tooltip: '소켓 목록에서 같은 트리거 ID로 설정된 소켓이 요구치를 채우면 이 건물이 반응해 건설 애니메이션을 재생한다' })
    triggerId: TriggerId = TriggerId.None;

    @property({ type: TriggerId, displayName: '반응할 트리거 ID (B) — AND 조건', tooltip: '비워두면(None) 위 트리거 ID 하나만으로 건설된다(기존 동작). 값을 넣으면 두 트리거가 "모두" 발화해야 건설된다 — 순서는 상관없다. 이웃한 두 타워가 다 지어졌을 때만 그 사이의 벽/문이 생기는 구조를 이걸로 만든다' })
    triggerIdB: TriggerId = TriggerId.None;

    @property({ displayName: '트리거 전까지 숨기기', tooltip: '체크하면 씬 시작 시 이 건물의 메쉬를 즉시 숨겨두고, 트리거가 발동하는 순간 다시 보이게 하면서 등장 애니메이션을 재생한다 (node.active는 건드리지 않는다 — 비활성 노드는 스스로 다시 켜질 수 없기 때문)' })
    hideUntilTriggered: boolean = true;

    @property({ displayName: '건설 지연(초)', tooltip: '조건이 충족된 뒤 이 시간만큼 기다렸다가 건설한다. 타워를 0으로 두고 그 사이 벽/문 그룹에만 0.3~0.5초를 주면, 타워가 먼저 서고 방어선이 뒤이어 닫히는 순서로 보인다' })
    buildDelay: number = 0;

    @property({ type: CCFloat, displayName: '등장 확대 시간(초)', tooltip: '0보다 크면 등장하는 순간 크기 0에서 원래 크기까지 이 시간 동안 커진다 — 씬 1·2의 건물이 appear 클립으로 하는 연출을, **클립이 없는 오브젝트**(2D 카드로 만든 바닥·장식)에도 똑같이 주기 위한 것이다. 0(기본)이면 예전처럼 그냥 나타난다. 원래 크기는 커지기 직전에 읽으므로, 텍스처 비율로 크기를 정하는 카드(TextureCard)와도 어긋나지 않는다' })
    appearScaleDuration: number = 0;

    private _anim: Animation | null = null;
    private _renderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    private _obstacles: VirtualWall[] = [];
    private _built = false;
    /** 등장 확대 연출의 도착점 — onLoad 시점의 원래 크기다. */
    private _baseScale = new Vec3(1, 1, 1);
    /** 지금까지 발화한 트리거 중 이 건물이 기다리는 것들. AND 조건(triggerIdB)에서 두 트리거가
     * 서로 다른 시점에 발화할 수 있으므로, 한쪽만 먼저 와도 기억해둬야 한다. */
    private _fired = new Set<TriggerId>();

    onLoad() {
        // 등장 확대에 쓸 원래 크기는 **아무것도 건드리기 전에** 잡아둔다. 연출 도중에 다시
        // 읽으면 0에서 커지는 중간값(또는 0 자체)을 원래 크기로 착각해 영영 안 보이게 된다.
        this._baseScale = this.node.scale.clone();
        this._anim = this.getComponent(Animation) ?? this.getComponentInChildren(Animation);
        this._renderers = [
            ...this.getComponentsInChildren(MeshRenderer),
            ...this.getComponentsInChildren(SkinnedMeshRenderer),
        ];
        // 가상의 벽(VirtualWall)은 건물 프리팹 안에 별도 자식 노드로 들어있다 — 실제
        // 렌더링되는 메쉬와 완전히 분리된 노드라, 건물 자체와 위치/회전/스케일이 다를 수 있다.
        // **전부** 모은다. 건물 하나가 여러 박스로 막힐 수 있다(ㄱ자 건물, 출입구를 낀 건물).
        // 예전에는 첫 번째 하나만 잡아서, 두 번째 박스를 넣어도 조용히 안 막혔다.
        this._obstacles = this.getComponentsInChildren(VirtualWall);

        if (this.hideUntilTriggered && this.triggerId !== TriggerId.None) {
            this._setVisible(false);
        }

        CoinEvents.on(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    onDestroy() {
        CoinEvents.off(CoinEventName.SocketFilled, this._onSocketFilled, this);
    }

    private _onSocketFilled(triggerId: TriggerId) {
        if (this._built) return;
        if (this.triggerId === TriggerId.None) return;
        if (triggerId !== this.triggerId && triggerId !== this.triggerIdB) return;

        this._fired.add(triggerId);
        // AND 조건: triggerIdB가 지정돼 있으면 양쪽이 다 발화할 때까지 기다린다.
        if (!this._fired.has(this.triggerId)) return;
        if (this.triggerIdB !== TriggerId.None && !this._fired.has(this.triggerIdB)) return;

        this._built = true;
        if (this.buildDelay > 0) this.scheduleOnce(() => this._build(), this.buildDelay);
        else this._build();
    }

    private _build() {
        this._setVisible(true);
        this._playAppearScale();
        for (const w of this._obstacles) w.activate();
        // Door2처럼 DoorHealth가 붙어있는 건물이면, 건설 완료(등장) 즉시 체력을 켜서
        // 몬스터의 공격 대상 목록(DoorHealth.all)에 들어가게 한다 — 이때부터 이 문을 부수지
        // 않으면 몬스터가 기지 방향으로 더 나아갈 수 없다.
        this.getComponent(DoorHealth)?.activate();
        const duration = this._playOnce();
        // 화살탑처럼 TowerAttack이 붙어있는 건물이면, 건설 완료 순간부터 자동 공격을 켠다
        // (그 전까지는 TowerAttack.combatEnabled가 false라 조준/발사 둘 다 하지 않는다).
        // appear 클립이 Root_Bow 회전까지 애니메이션하는 경우가 있어서, appear가 끝나기 전에
        // combatEnabled를 켜면 TowerAttack.update()가 매 프레임 aimBone 회전을 덮어써서
        // appear 애니메이션이 재생되는 게 안 보이는 문제가 있었다 — 재생 시간만큼 지연시킨다.
        const tower = this.getComponent(TowerAttack);
        if (tower) {
            if (duration > 0) this.scheduleOnce(() => { tower.combatEnabled = true; }, duration);
            else tower.combatEnabled = true;
        }

        // Door2처럼 DoorAutoOpen이 붙어있는 건물이면, appear(건설) 애니메이션이 끝난 뒤에야
        // open 상태를 건드리기 시작하게 한다 — 그 전까지 DoorAutoOpen이 이미 open 상태를
        // 재생 중이었다면 appear와 open 두 애니메이션이 같은 뼈대를 동시에 건드려 문이
        // 등장하는 순간 포즈가 뒤섞이며 튀는 문제가 있었다.
        const door = this.getComponent(DoorAutoOpen);
        if (door) {
            if (duration > 0) this.scheduleOnce(() => { door.activate(); }, duration);
            else door.activate();
        }
    }

    /**
     * 크기 0 → 원래 크기로 부풀리는 등장 연출. **원래 크기를 지금 읽는 이유**는, 이 노드가
     * `TextureCard`처럼 자기 크기를 스스로 정하는 컴포넌트를 갖고 있을 수 있어서다 —
     * onLoad 시점에 미리 저장해두면 그 계산 전의 값을 잡을 수 있다.
     */
    private _playAppearScale() {
        if (this.appearScaleDuration <= 0) return;
        const base = this._baseScale;
        // 원래 크기가 0이면 연출을 하지 않는다 — 했다가는 0에서 0으로 커져 영영 안 보인다.
        if (base.x === 0 && base.y === 0 && base.z === 0) return;
        this.node.setScale(0, 0, 0);
        tween(this.node).to(this.appearScaleDuration, { scale: base.clone() }).start();
    }

    /** defaultClip을 정확히 한 번만 재생한다 — 임포트된 클립 자체의 wrapMode가 Loop로
     * 잡혀 있어도(에셋 쪽 기본값) 여기서 매번 Normal로 강제해 반복 재생을 막는다.
     * 반환값은 클립 재생 시간(초) — 0이면 재생하지 못했다는 뜻. */
    private _playOnce(): number {
        const clip = this._anim?.defaultClip;
        if (!this._anim || !clip) return 0;
        const state = this._anim.getState(clip.name);
        if (!state) return 0;
        state.wrapMode = AnimationClip.WrapMode.Normal;
        state.speed = 1;
        state.time = 0;
        state.play();
        return clip.duration;
    }

    private _setVisible(visible: boolean) {
        for (const r of this._renderers) r.enabled = visible;
    }
}
