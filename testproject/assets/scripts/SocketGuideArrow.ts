import { _decorator, Component, Vec3, Color, MeshRenderer, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

const CLIP_NAME = 'appear';

/**
 * 소켓(socket_L/socket_S)에 내장된, 이 소켓으로 들어가라고 알려주는 유도 UI(UI_arrow).
 * 제자리에서 위아래로 통통 튀는 모션 + 발광 효과를 항상 내며, 언제 나타나고 사라질지는
 * 전적으로 호출하는 쪽(Socket.ts)이 show()/hide()로 직접 제어한다 — 이 컴포넌트 스스로는
 * 아무 이벤트도 구독하지 않는다.
 */
@ccclass('SocketGuideArrow')
export class SocketGuideArrow extends Component {
    @property({ displayName: '진동 진폭(m)', tooltip: '제자리에서 위아래로 움직이는 폭' })
    bobAmplitude: number = 0.15;

    @property({ displayName: '진동 속도(Hz)', tooltip: '초당 왕복 횟수' })
    bobSpeed: number = 1.0;

    @property({ displayName: '발광 색상' })
    glowColor: Color = new Color(255, 235, 120, 255);

    @property({ displayName: '발광 강도', tooltip: '값이 클수록 밝게 빛남' })
    glowIntensity: number = 2.0;

    private _anim: Animation | null = null;
    private _baseLocalPos = new Vec3();
    private _bobPhase = 0;
    /** hide()가 호출되면 false — Socket.ts가 사라짐 애니메이션 직전에 이 노드를 씬 루트로
     * setParent(keepWorldTransform)하는데, 그 뒤에도 update()가 onLoad 시점(원래 소켓 밑
     * 로컬 좌표)의 _baseLocalPos로 매 프레임 위치를 되돌려버리면 새 부모 기준으로 그 값이
     * 재해석되어 화면 중앙 근처로 순간이동해버린다 — 사라지는 동안은 통통 튀는 모션을 멈춰서
     * 실제 사라진 자리에서 그대로 축소/역재생되게 한다. */
    private _bobbing = true;

    onLoad() {
        this._anim = this.getComponent(Animation) ?? this.getComponentInChildren(Animation);
        Vec3.copy(this._baseLocalPos, this.node.position);

        const mr = this.getComponentInChildren(MeshRenderer);
        const inst = mr?.getMaterialInstance(0);
        inst?.setProperty('emissive', this.glowColor);
        inst?.setProperty('emissiveScale', new Vec3(this.glowIntensity, this.glowIntensity, this.glowIntensity));
    }

    update(dt: number) {
        if (!this._bobbing) return;
        this._bobPhase += dt * this.bobSpeed * Math.PI * 2;
        const y = this._baseLocalPos.y + Math.sin(this._bobPhase) * this.bobAmplitude;
        this.node.setPosition(this._baseLocalPos.x, y, this._baseLocalPos.z);
    }

    /** appear 애니메이션을 정재생하며 나타난다 */
    show() {
        const state = this._anim?.getState(CLIP_NAME);
        if (!state) return;
        state.wrapMode = AnimationClip.WrapMode.Normal;
        state.speed = 1;
        state.time = 0;
        state.play();
    }

    /** appear 애니메이션을 역재생하며 사라진 뒤, 다 사라지면 스스로 파괴된다(재사용하지 않음) */
    hide() {
        this._bobbing = false;
        const state = this._anim?.getState(CLIP_NAME);
        if (!state) { this.node.destroy(); return; }

        state.wrapMode = AnimationClip.WrapMode.Normal;
        state.speed = -1;
        state.time = state.duration;
        state.once(Animation.EventType.FINISHED, () => { this.node.destroy(); });
        state.play();
    }
}
