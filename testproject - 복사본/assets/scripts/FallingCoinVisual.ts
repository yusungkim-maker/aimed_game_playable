import { _decorator, Component, Vec3, Quat } from 'cc';
const { ccclass } = _decorator;

/**
 * Socket이 activate() 시 넘겨주는 비행 연출 튜닝 값 묶음. 코인은 런타임에 addComponent()로
 * 붙기 때문에 이 컴포넌트 자체엔 인스펙터에 남는 프로퍼티가 없다 — 실제 조정은 항상
 * Socket 쪽 인스펙터(Socket.prefab)에서 한다.
 */
export interface CoinFlightTuning {
    flightDuration:  number; // 비행(낙하) 시간(초)
    flightArcHeight: number; // 비행 중 위로 볼록하게 튀어오르는 높이(m) — 몬스터 처치 시 코인 팝과 동일한 연출
    popPeakScale:    number; // 도착 순간 펀치 스케일 최고 배율
    popDuration:     number; // 펀치 스케일(확대→소멸) 지속시간(초)
}

type Phase = 'flying' | 'pop';

/**
 * 소켓으로 코인 하나가 빨려들어가는 1회성 비주얼. 실제 스택에서 뽑힌 진짜 코인 노드에
 * 붙어서 재생되며, 소켓 도착 후 스스로 파괴된다.
 *
 * 1. flying: from → to로 가속 낙하(ease-in)하며, 동시에 몬스터 처치 시 코인이 튀어오르는
 *    것과 같은 포물선(위로 볼록)으로 살짝 튀어올랐다가 들어가고, 자신의 로컬 X축 기준
 *    한 바퀴(360도) 회전한다.
 * 2. pop: 도착 즉시 짧게 확대(peak)됐다가 0으로 줄어들며 소멸 — 흡수되는 손맛을 위한 펀치 스케일.
 */
@ccclass('FallingCoinVisual')
export class FallingCoinVisual extends Component {
    private _from = new Vec3();
    private _to   = new Vec3();
    private _timer = 0;
    private _tuning!: CoinFlightTuning;
    private _onLanded: (() => void) | null = null;
    private _baseRot = new Quat();
    private _curRot = new Quat();
    private _baseScale = new Vec3(1, 1, 1);

    private _phase: Phase = 'flying';
    private _popTimer = 0;

    /** from → to로 tuning.flightDuration 동안 가속 낙하(ease-in)하며 포물선으로 튀어올랐다가
     * 들어가고, 로컬 X축 기준 한 바퀴 회전한다. onLanded는 도착(펀치 팝 시작) 시점에
     * 호출된다 — 예: 소켓의 "남은 코인 개수" 라벨 갱신용 */
    activate(from: Vec3, to: Vec3, tuning: CoinFlightTuning, onLanded?: () => void) {
        this._from.set(from);
        this._to.set(to);
        this._tuning = tuning;
        this._timer = 0;
        this._onLanded = onLanded ?? null;
        this._phase = 'flying';
        this._popTimer = 0;
        this.node.setWorldPosition(from);
        this.node.getWorldRotation(this._baseRot);
        this._baseScale.set(this.node.scale);
    }

    update(dt: number) {
        if (this._phase === 'pop') { this._updatePop(dt); return; }

        this._timer += dt;
        const dur = Math.max(0.0001, this._tuning.flightDuration);
        const t = Math.min(1, this._timer / dur);
        const eased = t * t; // ease-in: 처음엔 느리게, 도착할수록 빨라짐

        // 몬스터 처치 시 코인 팝과 같은 포물선(위로 볼록, t=0.5에서 최고점) — 실제 이동(eased)과는 별도로 얹는다
        const arc = 4 * this._tuning.flightArcHeight * t * (1 - t);

        this.node.setWorldPosition(
            this._from.x + (this._to.x - this._from.x) * eased,
            this._from.y + (this._to.y - this._from.y) * eased + arc,
            this._from.z + (this._to.z - this._from.z) * eased,
        );

        // 로컬 X축 기준 한 바퀴(0~360도) 회전 — 위치와 달리 일정한 속도로 자연스럽게 돈다
        Quat.rotateAroundLocal(this._curRot, this._baseRot, Vec3.RIGHT, t * Math.PI * 2);
        this.node.setWorldRotation(this._curRot);

        if (t >= 1) {
            this._onLanded?.();
            this._phase = 'pop';
            this._popTimer = 0;
        }
    }

    /** 도착 순간 짧게 펀치 스케일: 0~50%는 원래 크기 → popPeakScale(ease-out),
     * 50~100%는 popPeakScale → 0(ease-in)으로 줄어들며 사라진다 */
    private _updatePop(dt: number) {
        this._popTimer += dt;
        const dur = Math.max(0.0001, this._tuning.popDuration);
        const t = Math.min(1, this._popTimer / dur);

        let factor: number;
        if (t < 0.5) {
            const k = t / 0.5;
            factor = 1 + (this._tuning.popPeakScale - 1) * (1 - (1 - k) * (1 - k));
        } else {
            const k = (t - 0.5) / 0.5;
            factor = this._tuning.popPeakScale * (1 - k * k);
        }

        this.node.setScale(
            this._baseScale.x * factor,
            this._baseScale.y * factor,
            this._baseScale.z * factor,
        );

        if (t >= 1) this.node.destroy();
    }
}
