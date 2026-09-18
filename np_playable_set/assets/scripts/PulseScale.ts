import { _decorator, Component, Vec3, CCFloat, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 노드를 커졌다 작아졌다 계속 반복시키는 강조 모션. CTA 버튼처럼 "여기를 눌러라"를
 * 알려야 하는 UI에 붙인다.
 *
 * 기준 크기는 인스펙터에 박아둔 숫자가 아니라 **노드가 원래 갖고 있던 스케일**이다 —
 * 버튼 크기를 나중에 바꿔도 배율만 곱해지므로 모션을 다시 손볼 필요가 없다.
 *
 * onEnable에서 시작하고 onDisable에서 멈춘다. CTA 패널처럼 평소엔 꺼져 있다가 켜지는
 * 노드에 붙이면, 켜지는 순간부터 알아서 뛰기 시작한다.
 */
@ccclass('PulseScale')
export class PulseScale extends Component {
    @property({ type: CCFloat, displayName: '최소 배율', tooltip: '가장 작을 때의 크기 배율. 1이면 원래 크기' })
    minScale: number = 1;

    @property({ type: CCFloat, displayName: '최대 배율', tooltip: '가장 클 때의 크기 배율. 1.05~1.15 정도가 과하지 않게 눈에 띈다' })
    maxScale: number = 1.08;

    @property({ type: CCFloat, displayName: '한 주기(초)', tooltip: '커졌다 다시 작아지기까지 걸리는 시간. 짧을수록 조급해 보이고, 길수록 은은하다' })
    period: number = 0.7;

    @property({ displayName: '이징', tooltip: 'cc.tween의 easing 이름. sineInOut = 숨쉬듯 부드럽게(기본), quadOut / backOut 등도 쓸 수 있다. 잘못된 이름을 넣으면 엔진이 경고하고 linear로 동작한다' })
    easing: string = 'sineInOut';

    /** 노드가 원래 갖고 있던 스케일 — 여기에 배율을 곱한다 */
    private _base = new Vec3(1, 1, 1);
    private _captured = false;

    onEnable() {
        // 기준 스케일은 최초 1회만 잡는다. onDisable에서 원래 크기로 되돌려 놓으므로
        // 다시 켜졌을 때 또 잡아도 값은 같지만, 혹시 트윈 도중에 꺼졌다면 그때의
        // 어중간한 크기를 기준으로 삼게 되므로 한 번만 잡는 편이 안전하다.
        if (!this._captured) {
            Vec3.copy(this._base, this.node.scale);
            this._captured = true;
        }
        this._start();
    }

    onDisable() {
        Tween.stopAllByTarget(this.node);
        this.node.setScale(this._base);
    }

    private _start() {
        Tween.stopAllByTarget(this.node);

        const b = this._base;
        const lo = new Vec3(b.x * this.minScale, b.y * this.minScale, b.z * this.minScale);
        const hi = new Vec3(b.x * this.maxScale, b.y * this.maxScale, b.z * this.maxScale);
        const half = Math.max(0.01, this.period) / 2;

        this.node.setScale(lo);
        tween(this.node)
            .to(half, { scale: hi }, { easing: this.easing as never })
            .to(half, { scale: lo }, { easing: this.easing as never })
            .union()
            .repeatForever()
            .start();
    }
}
