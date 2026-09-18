import { _decorator, Component, Color, MeshRenderer, Vec3, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

/** 등장/퇴장에 쓰는 클립. 정재생하면 나타나고 역재생하면 사라진다. */
const APPEAR_CLIP = 'appear';
/** 등장이 끝난 뒤 계속 도는 클립(= idle). 없으면 그냥 가만히 있는다. */
const ACTION_CLIP = 'action';

/**
 * 소켓(socket_L/socket_S)에 내장된, 이 소켓으로 들어가라고 알려주는 유도 UI(3D_arrow).
 * 언제 나타나고 사라질지는 전적으로 호출하는 쪽(Socket.ts)이 show()/hide()로 직접 제어한다
 * — 이 컴포넌트 스스로는 아무 이벤트도 구독하지 않는다.
 *
 * **움직임은 전부 glb의 애니메이션 클립이 만든다.** 예전에는 이 스크립트가 update()에서
 * 노드를 위아래로 흔들었지만(bob), 지금은 Blender에서 만든 `action` 클립이 그 역할을 한다 —
 * 코드로 흔들면 클립과 같은 노드를 두고 싸우게 되고, 모션을 바꿀 때마다 코드를 고쳐야 했다.
 *
 * 재생 순서:  show() → `appear` 정재생 → 끝나면 `action` 무한 루프
 *             hide() → `action` 정지 → `appear` 역재생 → 다 사라지면 스스로 destroy
 */
@ccclass('SocketGuideArrow')
export class SocketGuideArrow extends Component {
    @property({ displayName: '발광 색상' })
    glowColor: Color = new Color(255, 235, 120, 255);

    @property({ displayName: '발광 강도', tooltip: '값이 클수록 밝게 빛남' })
    glowIntensity: number = 2.0;

    private _anim: Animation | null = null;
    /** hide()가 시작된 뒤인지. 등장 애니메이션이 끝나며 오는 콜백이 그 시점엔 루프를 시작하면
     * 안 되기 때문에 필요하다 — 다 사라지는 중에 action이 다시 돌면 화살표가 되살아난다. */
    private _hiding = false;

    onLoad() {
        this._anim = this.getComponent(Animation) ?? this.getComponentInChildren(Animation);

        const mr = this.getComponentInChildren(MeshRenderer);
        const inst = mr?.getMaterialInstance(0);
        inst?.setProperty('emissive', this.glowColor);
        inst?.setProperty('emissiveScale', new Vec3(this.glowIntensity, this.glowIntensity, this.glowIntensity));
    }

    /** `appear`를 정재생하며 나타나고, 끝나면 `action`을 무한 루프로 이어 붙인다 */
    show() {
        this._hiding = false;

        const appear = this._anim?.getState(APPEAR_CLIP);
        // 등장 클립이 없는 프리팹이면 곧바로 루프만 돈다(무동작이 아니라 "등장 연출 없음").
        if (!appear) { this._playAction(); return; }

        appear.wrapMode = AnimationClip.WrapMode.Normal;
        appear.speed = 1;
        appear.time = 0;
        appear.once(Animation.EventType.FINISHED, () => {
            // 등장 도중에 hide()가 불렸으면 여기서 루프를 시작하면 안 된다.
            if (!this._hiding) this._playAction();
        });
        appear.play();
    }

    /** `action`을 무한 루프로 돌린다. 클립이 없으면 아무 일도 하지 않는다(구버전 프리팹 호환). */
    private _playAction() {
        const action = this._anim?.getState(ACTION_CLIP);
        if (!action) return;
        action.wrapMode = AnimationClip.WrapMode.Loop;
        action.speed = 1;
        action.time = 0;
        action.play();
    }

    /** `appear`를 역재생하며 사라진 뒤, 다 사라지면 스스로 파괴된다(재사용하지 않음) */
    hide() {
        this._hiding = true;
        // 루프를 먼저 끊는다 — 안 그러면 역재생과 겹쳐서 섞인 포즈가 나온다.
        this._anim?.getState(ACTION_CLIP)?.stop();

        const appear = this._anim?.getState(APPEAR_CLIP);
        if (!appear) { this.node.destroy(); return; }

        appear.wrapMode = AnimationClip.WrapMode.Normal;
        appear.speed = -1;
        appear.time = appear.duration;
        appear.once(Animation.EventType.FINISHED, () => { this.node.destroy(); });
        appear.play();
    }
}
