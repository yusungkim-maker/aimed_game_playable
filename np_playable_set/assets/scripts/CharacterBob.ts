import { _decorator, animation, CCFloat, CCInteger, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 걷는 캐릭터의 루트 본을 발 디딤에 맞춰 위아래로 튕겨 "통통 튀는" 걸음을 만든다.
 *
 * 한 발이 땅에 닿은 순간 0, 반대 발이 공중에 있는 동안 최대로 올라갔다가, 그 발이 닿을 때 다시 0.
 * 이걸 걸음마다 반복한다.
 *
 * ── 왜 lateUpdate인가 (이것이 이 스크립트의 핵심) ──────────────────────────────
 * 걷기 클립(`Axe_Move`)에는 **`Root` 노드 자체를 향한 트랙이 들어 있다.** 즉 애니메이션이 매 프레임
 * 루트의 트랜스폼을 직접 덮어쓴다. `update()`에서 값을 쓰면 그 직후 애니메이션이 지워버린다.
 * 엔진의 한 프레임 순서는 `director.ts`에서 이렇다:
 *   compScheduler.updatePhase()  →  systems[].update()(= AnimationManager가 클립 적용)  →  compScheduler.lateUpdatePhase()
 * 그래서 **`lateUpdate()`에서 써야** 애니메이션 결과 위에 덧씌워진다.
 *
 * ── 왜 직전 오프셋을 빼고 더하는가 ────────────────────────────────────────────
 * 애니메이션이 루트를 덮어쓰는 상태(걷기)에서는 매 프레임 원래 값이 복원되지만, 루트 트랙이 없는
 * 클립으로 전환되면 내가 쓴 값이 그대로 남는다. 그때 계속 더하기만 하면 캐릭터가 하늘로 떠오른다.
 * 그래서 항상 **직전에 더한 만큼을 먼저 빼고** 새 오프셋을 더한다 — 두 경우 모두에서 정확하다.
 *
 * 붙이는 위치: `AnimationController`가 있는 노드(= 캐릭터 루트, 씬 3에서는 `Player`).
 * `튕길 노드`에는 보통 그 아래 `Root`(스켈레톤 루트)를 넣는다. 발밑 그림자는 `Root`의 형제라
 * 같이 튀지 않고 땅에 남는다 — 그게 접지감 유지에 맞다.
 *
 * `튕길 노드`를 비워두면 아무 일도 하지 않는다(무동작).
 */
@ccclass('CharacterBob')
export class CharacterBob extends Component {
    @property({
        type: Node,
        displayName: '튕길 노드',
        tooltip: '위아래로 움직일 노드. 보통 캐릭터 밑의 스켈레톤 루트(Root)를 넣는다. 캐릭터 노드 자신을 넣으면 발밑 그림자까지 같이 떠오르므로 권장하지 않는다. 비워두면 이 컴포넌트는 아무 일도 하지 않는다',
    })
    bobTarget: Node | null = null;

    @property({
        type: CCFloat,
        displayName: '튕김 높이(m)',
        tooltip: '한 걸음에 최대로 올라가는 높이. 캐릭터 키에 비해 크면 만화처럼 과장되고, 0.03~0.1 정도가 "살짝 통통 튀는" 느낌이다. 0이면 사실상 꺼진다',
    })
    height: number = 0.06;

    @property({
        type: CCInteger,
        displayName: '사이클당 걸음 수',
        tooltip: '걷기 클립 한 바퀴에 발을 몇 번 내딛는지. 보통 왼발·오른발 2회다. 이 값이 실제 클립과 다르면 튕김이 발 디딤과 어긋나 미끄러지듯 보인다',
    })
    stepsPerCycle: number = 2;

    @property({
        type: CCFloat,
        displayName: '위상 오프셋(0~1)',
        tooltip: '튕김 타이밍을 걸음 주기 안에서 앞뒤로 민다. 발이 닿는 순간과 최고점이 어긋나 보이면 이 값으로 맞춘다. 0.25면 정확히 반 걸음만큼 밀린다',
    })
    phaseOffset: number = 0;

    @property({
        displayName: '이동 중에만',
        tooltip: '켜면 실제로 움직일 때만 튕긴다. 끄면 제자리 대기(Idle) 중에도 튕기는데, Idle 클립에는 걸음이 없어 보통 어색하다',
    })
    onlyWhenMoving: boolean = true;

    @property({
        type: CCFloat,
        displayName: '이동 판정 속도(m/s)',
        tooltip: '이 속도 이상으로 움직일 때 "걷는 중"으로 본다. 너무 낮으면 멈춘 순간의 미세한 떨림에도 튕기고, 너무 높으면 걷기 시작이 늦게 반응한다',
    })
    moveThreshold: number = 0.05;

    @property({
        type: CCInteger,
        displayName: '애니메이션 레이어',
        tooltip: '걸음 주기를 읽어올 애니메이션 그래프의 레이어 인덱스. 보통 0이다',
    })
    layerIndex: number = 0;

    private _controller: animation.AnimationController | null = null;
    private _lastOffset = 0;
    private _lastPos = new Vec3();
    private _hasLastPos = false;

    onLoad () {
        this._controller = this.getComponent(animation.AnimationController);
    }

    onDisable () {
        // 꺼질 때 마지막으로 더한 만큼을 되돌려 놓는다 — 안 그러면 들린 채로 굳는다.
        if (this.bobTarget && this._lastOffset !== 0) {
            const p = this.bobTarget.position;
            this.bobTarget.setPosition(p.x, p.y - this._lastOffset, p.z);
        }
        this._lastOffset = 0;
        this._hasLastPos = false;
    }

    lateUpdate (dt: number) {
        const target = this.bobTarget;
        if (!target) return;

        const offset = this._computeOffset(dt);

        // 직전 오프셋을 빼고 새 오프셋을 더한다(위 주석 참조). 값이 같으면 건드리지 않는다.
        if (offset !== this._lastOffset) {
            const p = target.position;
            target.setPosition(p.x, p.y - this._lastOffset + offset, p.z);
            this._lastOffset = offset;
        }
    }

    private _computeOffset (dt: number): number {
        if (this.height === 0 || this.stepsPerCycle <= 0) return 0;

        if (this.onlyWhenMoving && !this._isMoving(dt)) return 0;

        // 걸음 주기는 클립의 정규화 진행도(0~1)에서 그대로 가져온다. 속도나 이동거리로 추정하면
        // 클립 재생 속도와 어긋나 발이 미끄러지는데, 이 값은 클립 자신의 시간이라 항상 동기된다.
        const status = this._controller?.getCurrentStateStatus(this.layerIndex);
        if (!status) return 0;

        // 한 걸음마다 0 → 최대 → 0. abs(sin)이 그 모양이고, 발이 닿는 순간(정수 지점)이 정확히 0이다.
        const phase = status.progress * this.stepsPerCycle + this.phaseOffset;
        return this.height * Math.abs(Math.sin(Math.PI * phase));
    }

    /** 캐릭터 노드의 월드 위치 변화로 이동 여부를 판정한다 — 이동 로직(Player.ts)에 의존하지 않기 위해서다 */
    private _isMoving (dt: number): boolean {
        const now = this.node.worldPosition;
        if (!this._hasLastPos) {
            Vec3.copy(this._lastPos, now);
            this._hasLastPos = true;
            return false;
        }
        const moved = Vec3.distance(this._lastPos, now);
        Vec3.copy(this._lastPos, now);
        return dt > 0 && moved / dt >= this.moveThreshold;
    }
}
