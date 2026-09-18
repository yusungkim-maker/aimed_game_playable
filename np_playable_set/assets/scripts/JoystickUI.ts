import { _decorator, CCFloat, Component, Node, Vec2, Vec3, UITransform, EventTouch, Graphics, Color, Camera } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 플로팅(어디를 눌러도 그 자리에서 시작하는) 가상 조이스틱. 실제 터치 감지는 이 노드 자신이
 * 아니라 화면 전체를 덮는 별도의 touchZone 노드가 담당한다 — 터치가 시작되는 순간 이 노드
 * (베이스 링) 자체를 그 지점으로 옮겨서 보이게 하고, 그 자리를 중심으로 드래그하는 동안
 * 노브가 따라 움직인다. 손을 떼면 다시 숨는다.
 * Read .direction (normalized Vec2) in Player.ts.
 *
 * **첫 터치 전에는 "조이스틱 시작 애니메이션"을 보여준다** — 플로팅 조이스틱은 원래 누르기
 * 전까지 화면에 아무것도 없어서, 플레이어블 광고에서 무엇을 해야 하는지 알 수 없다. 그래서
 * 화면 우측 하단 고정 자리에 조이스틱을 띄워두고 노브만 작은 원을 그리게 한다. 첫 터치가
 * 들어오면 영구히 멈추고 평소의 플로팅 동작으로 넘어간다(아래 _stopHint).
 *
 * 🔴 **시작 애니메이션의 크기·색은 "보여줄 때만" 다르다.** 크기는 radius가 아니라 노드
 * 스케일로 키우고, 색은 씬에 저장된 색상값을 그대로 둔 채 그릴 때만 알파를 더한다. 이유는
 * 아래 hintScale / hintStrokeAlphaAdd 주석 참조 — radius나 색상값 자체를 바꾸면 게임 중
 * 조이스틱까지 같이 바뀐다.
 */
@ccclass('JoystickUI')
export class JoystickUI extends Component {
    @property(Node) knob: Node | null = null;
    @property radius: number = 100;

    @property({ type: Node, displayName: '터치 감지 영역', tooltip: '화면 전체(또는 조작 가능 영역)를 덮는 노드 — 여기서 터치가 시작된 지점에 조이스틱이 나타난다. 비워두면 기존처럼 이 노드 자신의 고정된 자리에서만 반응한다' })
    touchZone: Node | null = null;

    @property({ type: Camera, displayName: 'UI 카메라', tooltip: '터치 좌표를 UI 로컬 좌표로 변환할 때 사용 (UICamera 연결)' })
    uiCamera: Camera | null = null;

    // ── 색 ─────────────────────────────────────────────────────────────────
    // 조이스틱은 이미지가 아니라 cc.Graphics로 그때그때 그린다(에셋 없이 반경만 바꿔도
    // 모양이 따라오게 하려고). 그래서 색도 여기서 지정한다. 기본값은 예전에 코드에
    // 박혀 있던 값 그대로라, 건드리지 않으면 지금과 똑같이 보인다.
    @property({ type: Color, displayName: '베이스 원 채움 색', tooltip: '조이스틱 바깥 큰 원의 안쪽 색. 알파(A)를 낮출수록 배경이 비쳐 보인다' })
    baseFillColor: Color = new Color(0, 0, 0, 120);

    @property({ type: Color, displayName: '베이스 원 테두리 색', tooltip: '조이스틱 바깥 큰 원의 테두리 선 색' })
    baseStrokeColor: Color = new Color(255, 255, 255, 230);

    @property({ type: Color, displayName: '노브 채움 색', tooltip: '손가락을 따라 움직이는 안쪽 작은 원의 색' })
    knobFillColor: Color = new Color(80, 160, 255, 220);

    @property({ type: Color, displayName: '노브 테두리 색', tooltip: '안쪽 작은 원의 테두리 선 색' })
    knobStrokeColor: Color = new Color(255, 255, 255, 255);

    // ── 조이스틱 시작 애니메이션 ────────────────────────────────────────────
    @property({ displayName: '조이스틱 시작 애니메이션', tooltip: '첫 터치 전까지 우측 하단에 조이스틱을 띄우고 노브가 원을 그리게 한다. 끄면 예전처럼 누르기 전엔 화면에 아무것도 안 보인다 — 플레이어블 광고에서는 켜두는 것이 기본이다' })
    showTouchHint: boolean = true;

    @property({ type: CCFloat, displayName: '시작 애니 — 크기 배율', tooltip: '시작 애니메이션 동안만 조이스틱을 이 배율로 키운다. 첫 터치가 들어오면 즉시 1로 돌아간다. **radius가 아니라 노드 스케일을 키우는 이유**: radius는 _apply()에서 방향 벡터를 0~1로 정규화하는 분모라, 그 값을 키우면 같은 거리를 밀어도 캐릭터가 느리게 움직여 조작감이 바뀐다' })
    hintScale: number = 1.5;

    @property({ type: CCFloat, displayName: '시작 애니 — 우측 여백(px)', tooltip: '화면 오른쪽 끝에서 베이스 원의 오른쪽 끝까지의 거리(디자인 해상도 기준). 위 "크기 배율"이 반영된 실제 보이는 크기를 기준으로 재므로, 배율을 키워도 여백은 말한 값 그대로 유지된다' })
    hintMarginRight: number = 100;

    @property({ type: CCFloat, displayName: '시작 애니 — 하단 여백(px)', tooltip: '화면 아래 끝에서 베이스 원의 아래 끝까지의 거리(디자인 해상도 기준). 너무 낮으면 손가락에 가리고, 너무 높으면 조작 위치와 동떨어져 보인다' })
    hintMarginBottom: number = 230;

    @property({ type: CCFloat, displayName: '시작 애니 — 테두리 알파 +', tooltip: '시작 애니메이션 동안만 테두리 색 알파에 이만큼 더해 눈에 띄게 한다(255에서 잘림). **씬에 저장된 색상값 자체는 건드리지 않는다** — 게임 중 조이스틱은 원래 색 그대로다' })
    hintStrokeAlphaAdd: number = 15;

    @property({ type: CCFloat, displayName: '시작 애니 — 채움 알파 +', tooltip: '시작 애니메이션 동안만 채움 색 알파에 이만큼 더한다. 테두리보다 작게 주는 것이 보통이다 — 채움은 면적이 넓어 같은 값을 더해도 훨씬 크게 체감된다' })
    hintFillAlphaAdd: number = 5;

    @property({ type: CCFloat, displayName: '시작 애니 — 한 바퀴 시간(초)', tooltip: '노브가 원을 한 바퀴 도는 데 걸리는 시간. 짧을수록 다급해 보이고, 길면 눈에 안 띈다. 1.4~2.0 사이가 무난하다' })
    hintCycleDuration: number = 1.6;

    @property({ type: CCFloat, range: [0, 1, 0.01], slide: true, displayName: '시작 애니 — 궤도 크기(반지름 대비)', tooltip: '노브가 얼마나 멀리까지 나갔다 오는지 — 1이면 스틱을 끝까지 민 위치(반지름 전체)까지 간다. 궤도 원의 지름이 "링 중심 → 이 지점"이므로, 값을 줄이면 궤도 전체가 작아진다' })
    hintOrbitRatio: number = 1;

    @property({ type: CCFloat, displayName: '시작 애니 — 궤도 방향(도)', tooltip: '노브가 가장 멀리 나가는 지점의 각도. 0=오른쪽, 90=위. 기본 45는 우측 상단이다' })
    hintOrbitAngle: number = 45;

    @property({ displayName: '시작 애니 — 궤도 시계방향', tooltip: '노브가 도는 방향. 가장 멀리 나가는 지점은 어느 쪽으로 돌든 한 바퀴의 절반 시점에서 같다 — 바뀌는 건 거기까지 가는 경로뿐이다' })
    hintClockwise: boolean = false;

    private _dir     = new Vec2();
    private _active  = false;
    private _touchId = -1;

    /** 시작 애니메이션이 도는 중인지. 첫 터치 이후로는 영영 false다. */
    private _hinting = false;
    /** 한 바퀴 안에서의 진행도 0~1 (아직 이징을 먹이기 전의 선형 값) */
    private _hintTime = 0;

    /** 방향 벡터. 크기가 0(중앙)~1(가장자리)로 스틱을 밀어낸 정도를 그대로 나타냄. Vec2.ZERO when idle */
    get direction(): Readonly<Vec2> { return this._dir; }

    /** 조이스틱을 강제로 숨기고 입력을 완전히 무효화한다 — CTA 등 게임 종료 화면으로 넘어갈 때
     * 사용. 터치 도중(손을 안 뗀 채로) 호출돼도 안전하게 정리되고, 터치 감지 영역 자체도
     * 꺼서 그 뒤로는 새 터치가 다시 조이스틱을 띄우지 못하게 한다. */
    disable() {
        this._active  = false;
        this._touchId = -1;
        this._dir.set(0, 0);
        this._stopHint();
        this.knob?.setPosition(0, 0, 0);
        this.node.active = false;
        if (this.touchZone) this.touchZone.active = false;
    }

    onLoad() {
        this._drawVisuals();

        // 터치는 시작된 노드가 그 제스처(move/end)를 끝까지 계속 받는다(Cocos의 터치 캡처
        // 방식) — 그래서 start/move/end/cancel을 전부 같은 노드(touchZone, 지정 안 하면
        // 이 노드 자신)에 등록해야 한다. touchZone에서 시작해도 이 노드(베이스 링) 자체를
        // 눌린 지점으로 옮겨서 보여주고, 그 이후 좌표 계산은 그대로 이 노드 기준으로 한다.
        const target = this.touchZone ?? this.node;
        target.on(Node.EventType.TOUCH_START,  this._onStart, this);
        target.on(Node.EventType.TOUCH_MOVE,   this._onMove,  this);
        target.on(Node.EventType.TOUCH_END,    this._onEnd,   this);
        target.on(Node.EventType.TOUCH_CANCEL, this._onEnd,   this);

        // 플로팅 조이스틱은 누르기 전엔 숨겨둔다 — 단, 시작 애니메이션을 켰으면 숨기는 대신
        // 유도 자리로 옮겨 띄운다(첫 터치가 오면 _stopHint가 원래 규칙으로 되돌린다).
        if (this.touchZone) {
            if (this.showTouchHint) this._startHint();
            else this.node.active = false;
        }
    }

    onDestroy() {
        const target = this.touchZone ?? this.node;
        target.off(Node.EventType.TOUCH_START,  this._onStart, this);
        target.off(Node.EventType.TOUCH_MOVE,   this._onMove,  this);
        target.off(Node.EventType.TOUCH_END,    this._onEnd,   this);
        target.off(Node.EventType.TOUCH_CANCEL, this._onEnd,   this);
    }

    // ── 조이스틱 시작 애니메이션 ────────────────────────────────────────────
    /** 우측 하단 고정 자리에 조이스틱을 띄우고 노브 궤도를 돌리기 시작한다. */
    private _startHint() {
        // 여백은 화면(=부모 Canvas)의 끝에서 재므로 부모 크기를 읽는다. 부모가 없거나
        // 크기를 못 읽으면 자리를 정할 수 없으니 유도를 포기하고 예전처럼 숨긴다(무동작 원칙).
        const parentUi = this.node.parent?.getComponent(UITransform);
        if (!parentUi) { this.node.active = false; return; }

        const s = this.hintScale;
        // 여백은 "화면에 실제로 보이는 원의 가장자리"까지의 거리다 — contentSize(220)가 아니라
        // radius에 크기 배율을 곱한 값을 쓰는 이유는, radius나 배율을 바꿨을 때 여백이 눈에
        // 보이는 것과 어긋나지 않게 하기 위해서다.
        const edge = this.radius * s;
        this.node.setScale(s, s, s);
        this.node.setPosition(
            parentUi.contentSize.width * 0.5 - this.hintMarginRight - edge,
            -parentUi.contentSize.height * 0.5 + this.hintMarginBottom + edge,
            0,
        );
        // 시작 애니메이션 동안만 알파를 올려 눈에 띄게 한다. 씬에 저장된 색상값은 그대로다.
        this._drawVisuals(this.hintStrokeAlphaAdd, this.hintFillAlphaAdd);
        this.node.active = true;
        this._hinting  = true;
        this._hintTime = 0;
        this.knob?.setPosition(0, 0, 0);
    }

    /** 첫 터치가 들어온 뒤로는 다시 켜지지 않는다 — 시작 애니메이션은 "무엇을 해야 하는지"를
     * 알려주는 것이라, 한 번 조작한 플레이어에게 다시 보이면 조작을 방해한다.
     * 크기와 색을 평소 값으로 되돌리는 것도 여기서 한다 — 되돌리기 전에 _apply()가 돌면
     * 노드 스케일 때문에 터치 좌표 변환이 어긋나므로 _onStart의 맨 앞에서 부른다. */
    private _stopHint() {
        if (!this._hinting) return;
        this._hinting = false;
        this.node.setScale(1, 1, 1);
        this._drawVisuals();
        this.knob?.setPosition(0, 0, 0);
    }

    update(dt: number) {
        if (!this._hinting || !this.knob) return;
        if (this.hintCycleDuration <= 0) return;

        this._hintTime = (this._hintTime + dt / this.hintCycleDuration) % 1;

        // 궤도 원: "링 중심(0,0)"과 "가장 멀리 나가는 점 P"를 지름의 양 끝으로 하는 원.
        // 그래서 원의 중심은 P/2, 반지름은 |P|/2이고 — 노브는 진행도 0에서 정확히 (0,0),
        // 0.5에서 정확히 P 위에 있게 된다. 두 점이 지름의 양 끝이라는 조건이 그대로 성립한다.
        // (여기 좌표는 전부 로컬이라 크기 배율은 노드 스케일이 알아서 곱해준다)
        const rad = this.hintOrbitAngle * Math.PI / 180;
        const cx = this.radius * this.hintOrbitRatio * Math.cos(rad) * 0.5;
        const cy = this.radius * this.hintOrbitRatio * Math.sin(rad) * 0.5;
        const r  = Math.sqrt(cx * cx + cy * cy);

        // 이지-인/아웃: 선형 진행도를 코사인 반주기로 눕힌다. 미분값이 양 끝에서 0이라
        // 출발점(=링 중심)에서 천천히 떠났다가 중간에 가장 빠르고 다시 천천히 돌아온다.
        // 선형으로 두면 기계적으로 뱅뱅 도는 느낌이라 "밀어보라"는 신호로 안 읽힌다.
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * this._hintTime);

        const start = Math.atan2(-cy, -cx);   // 궤도 중심에서 본 출발점(0,0)의 각도
        const th = start + (this.hintClockwise ? -1 : 1) * Math.PI * 2 * eased;
        this.knob.setPosition(cx + r * Math.cos(th), cy + r * Math.sin(th), 0);
    }

    // ── Visuals ────────────────────────────────────────────────────────────
    /**
     * 조이스틱을 다시 그린다. strokeAdd/fillAdd는 시작 애니메이션 동안만 알파에 더하는 값이고,
     * 인자 없이 부르면 씬에 저장된 색 그대로 그린다(= 게임 중 모습).
     */
    private _drawVisuals(strokeAdd = 0, fillAdd = 0) {
        // 새 Color를 만들어 쓴다 — 프로퍼티 객체의 alpha를 직접 올리면 다시 그릴 때마다
        // 누적되어 몇 번 만에 255로 타버린다.
        const boost = (c: Color, add: number) =>
            new Color(c.r, c.g, c.b, Math.max(0, Math.min(255, c.a + add)));

        // Base ring
        let g = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
        g.clear();
        g.fillColor   = boost(this.baseFillColor, fillAdd);
        g.strokeColor = boost(this.baseStrokeColor, strokeAdd);
        g.lineWidth   = 5;
        g.circle(0, 0, this.radius);
        g.fill();
        g.stroke();

        // Knob dot
        if (this.knob) {
            let kg = this.knob.getComponent(Graphics) ?? this.knob.addComponent(Graphics);
            kg.clear();
            kg.fillColor   = boost(this.knobFillColor, fillAdd);
            kg.strokeColor = boost(this.knobStrokeColor, strokeAdd);
            kg.lineWidth   = 3;
            kg.circle(0, 0, this.radius * 0.38);
            kg.fill();
            kg.stroke();
        }
    }

    // ── Touch handlers ─────────────────────────────────────────────────────
    private _onStart(e: EventTouch) {
        if (this._active) return;
        this._active  = true;
        this._touchId = e.getID();

        // 첫 터치 — 시작 애니메이션은 여기서 영구히 끝난다. 크기·색이 평소 값으로 돌아간
        // 뒤에 아래에서 베이스를 누른 지점으로 옮기므로, 손가락 밑으로 자연스럽게 따라붙는다.
        // **반드시 _apply()보다 먼저**: 노드 스케일이 1로 돌아가야 좌표 변환이 맞는다.
        this._stopHint();

        // touchZone(화면 전체)에서 시작한 경우, 눌린 지점을 이 노드의 부모 기준 좌표로
        // 바꿔서 베이스 링 자체를 그 자리로 옮기고 보이게 한다 — "어디를 눌러도 그 자리에서
        // 시작"하는 플로팅 조이스틱의 핵심 동작.
        if (this.touchZone) {
            const parentUi = this.node.parent?.getComponent(UITransform);
            if (parentUi && this.uiCamera) {
                const screen = e.getLocation();
                const world  = new Vec3();
                this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
                const local = parentUi.convertToNodeSpaceAR(world);
                this.node.setPosition(local.x, local.y, 0);
            }
            this.node.active = true;
        }

        this._apply(e);
    }

    private _onMove(e: EventTouch) {
        if (e.getID() !== this._touchId) return;
        this._apply(e);
    }

    private _onEnd(e: EventTouch) {
        if (e.getID() !== this._touchId) return;
        this._active  = false;
        this._touchId = -1;
        this._dir.set(0, 0);
        this.knob?.setPosition(0, 0, 0);
        // 플로팅 조이스틱은 손을 떼면 다시 숨긴다 (touchZone 없이 고정 배치로 쓰는 경우는
        // 기존처럼 계속 표시).
        if (this.touchZone) this.node.active = false;
    }

    private _apply(e: EventTouch) {
        const ui = this.node.getComponent(UITransform);
        if (!ui || !this.knob || !this.uiCamera) return;

        // e.getUILocation()은 cc.view의 정적 디자인 해상도 스케일을 기준으로 변환되는데,
        // UIAutoFit이 화면 비율에 맞춰 Canvas/UICamera를 매 리사이즈마다 직접 재조정하고 있어서
        // 그 값과 어긋난다 (특히 세로 화면에서 크게 벌어짐). 대신 UICamera의 실시간 투영으로
        // 직접 화면 좌표 → 월드 좌표 → 이 노드의 로컬 좌표로 변환해서 항상 실제 렌더링과 일치시킨다.
        const screen = e.getLocation();
        const world  = new Vec3();
        this.uiCamera.screenToWorld(new Vec3(screen.x, screen.y, 0), world);
        const local = ui.convertToNodeSpaceAR(world);
        const len   = Math.sqrt(local.x * local.x + local.y * local.y);

        // 노브는 항상 클릭/터치 지점 그대로 이동 (반경 밖이면 가장자리로 clamp)
        const clamp = Math.min(len, this.radius);
        const kx = len > 0 ? (local.x / len) * clamp : 0;
        const ky = len > 0 ? (local.y / len) * clamp : 0;
        this.knob.setPosition(kx, ky, 0);

        // 방향은 유지하되 크기는 0(중앙)~1(가장자리)로 스틱을 밀어낸 비율을 그대로 담음
        // → Player.ts가 이 크기만큼 이동 속도를 비례시킴
        this._dir.set(kx / this.radius, ky / this.radius);
    }
}
