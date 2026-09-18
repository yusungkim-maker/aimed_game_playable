import { _decorator, Component, Mesh, Material, MeshRenderer, Vec3, Vec4, Color, Quat } from 'cc';
const { ccclass } = _decorator;

/** 아틀라스 칸 수 — FX_T_Smoke_002는 2x2(4칸)다. 칸마다 다른 연기 모양이 그려져 있고
 *  **순서대로 재생하는 시퀀스가 아니라** 파티클마다 랜덤으로 한 칸을 골라 쓴다. */
const FRAME_COLS = 2;
const FRAME_ROWS = 2;

/** 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치 — HitEffect와 같은 값.
 *  이 프로젝트의 카메라는 회전하지 않으므로 상수로 충분하다. */
const CAMERA_FACE_PITCH_DEG = -45;

/** Player의 인스펙터 값으로 조절되는 먼지 파라미터 */
export interface DustPuffParams {
    lifetime: number;      // 한 알이 살아있는 시간(초)
    speedMin: number;      // 수평으로 흩어지는 초기 속도(m/s)
    speedMax: number;
    riseMin: number;       // 위로 튀어오르는 초기 속도(m/s)
    riseMax: number;
    gravity: number;       // 아래로 당기는 가속도(m/s^2)
    spreadDeg: number;     // 타격 방향을 중심으로 좌우로 퍼지는 각도 범위(도)
    scaleStart: number;    // pop 곡선: 시작
    scalePeak: number;     // pop 곡선: 최대
    scaleEnd: number;      // pop 곡선: 끝
    sizeRandomMin: number; // 알마다 전체 크기에 곱하는 랜덤 배율
    sizeRandomMax: number;
    opacity: number;       // 기본 오퍼시티(0~1). 수명 끝으로 갈수록 0으로 사라진다
}

/**
 * 타격 지점에서 튀어나와 포물선을 그리며 사라지는 먼지 한 알.
 *
 * **파티클 시스템을 쓰지 않는 이유**: 이 프로젝트의 이펙트는 전부 "쿼드 한 장 + 아틀라스
 * 한 칸"으로 되어 있고(HitEffect, MonsterDeadEffect), 엔진 파티클을 켜면 빌드에 그 런타임이
 * 통째로 들어온다. 먼지는 한 번에 대여섯 알뿐이라 이 방식이 훨씬 싸다.
 *
 * 한 알이 하는 일은 셋뿐이다 — 등속 + 중력으로 날아가고, pop 곡선으로 커졌다 작아지고,
 * 수명이 끝나면 스스로 사라진다. 여러 알을 흩뿌리는 것은 부르는 쪽(Player)이 한다.
 */
@ccclass('DustPuffFx')
export class DustPuffFx extends Component {
    private _timer = 0;
    private _life = 0.45;
    private _gravity = 6;
    private _vel = new Vec3();
    private _mat: Material | null = null;
    private _baseColor = new Color(255, 255, 255, 255);
    private _opacity = 1;
    private _sizeMult = 1;
    private _params: DustPuffParams | null = null;

    /**
     * @param dir 타격이 들어간 방향(월드 XZ). 이 방향을 중심으로 `spreadDeg`만큼 부채꼴로
     *            퍼진다 — 360을 주면 사방으로 고르게 터진다.
     */
    init(mesh: Mesh, mat: Material, dir: Vec3, params: DustPuffParams) {
        this._params = params;
        this._life = params.lifetime > 0 ? params.lifetime : 0.45;
        this._gravity = params.gravity;

        const mr = this.node.addComponent(MeshRenderer);
        mr.mesh = mesh;
        mr.setMaterial(mat, 0);
        const inst = mr.getMaterialInstance(0);
        this._mat = inst;

        // 아틀라스 4칸 중 랜덤 1칸. 순서 재생이 아니라 알마다 다른 그림을 쓰는 것이 목적이다.
        const col = Math.floor(Math.random() * FRAME_COLS);
        const row = Math.floor(Math.random() * FRAME_ROWS);
        inst?.setProperty('tilingOffset', new Vec4(
            1 / FRAME_COLS, 1 / FRAME_ROWS, col / FRAME_COLS, row / FRAME_ROWS,
        ));

        this._opacity = Math.min(1, Math.max(0, params.opacity));
        this._sizeMult = _rand(params.sizeRandomMin, params.sizeRandomMax);

        // ── 초기 속도 ────────────────────────────────────────────────────
        // 타격 방향을 기준으로 좌우 spreadDeg/2 만큼 랜덤하게 틀어 부채꼴로 흩는다.
        const baseAngle = Math.atan2(dir.z, dir.x);
        const spread = (params.spreadDeg * Math.PI / 180) * 0.5;
        const a = baseAngle + _rand(-spread, spread);
        const speed = _rand(params.speedMin, params.speedMax);
        this._vel.set(Math.cos(a) * speed, _rand(params.riseMin, params.riseMax), Math.sin(a) * speed);

        // 카메라 정면 정렬 + 알마다 랜덤 롤. HitEffect와 같은 이유로 roll을 먼저 적용하고
        // 피치를 나중에 곱해야 어떤 각도에서도 카메라와 정확히 수직을 유지한다.
        const qRoll  = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_Z, Math.random() * Math.PI * 2);
        const qPitch = Quat.fromAxisAngle(new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180);
        const qFinal = new Quat();
        Quat.multiply(qFinal, qPitch, qRoll);
        this.node.setRotation(qFinal);

        this._applyScale(0);
        this._applyAlpha(0);
    }

    update(dt: number) {
        if (!this._params) return;
        this._timer += dt;

        if (this._timer >= this._life) { this.node.destroy(); return; }

        // 중력 적분 후 이동 — 튀어오른 뒤 자연스럽게 떨어진다.
        this._vel.y -= this._gravity * dt;
        const p = this.node.worldPosition;
        this.node.setWorldPosition(
            p.x + this._vel.x * dt,
            p.y + this._vel.y * dt,
            p.z + this._vel.z * dt,
        );

        const t = this._timer / this._life;
        this._applyScale(t);
        this._applyAlpha(t);
    }

    /** pop 곡선: 앞 20%에서 start→peak으로 확 커졌다가, 남은 구간에서 end로 줄어든다. */
    private _applyScale(t: number) {
        const p = this._params!;
        const POP_IN = 0.2;
        const v = t < POP_IN
            ? p.scaleStart + (p.scalePeak - p.scaleStart) * (t / POP_IN)
            : p.scalePeak + (p.scaleEnd - p.scalePeak) * ((t - POP_IN) / (1 - POP_IN));
        const s = v * this._sizeMult;
        this.node.setScale(s, s, s);
    }

    /** 뒤 40% 구간에서 서서히 투명해진다 — 튀어오르는 동안은 또렷하게 보이는 편이 낫다. */
    private _applyAlpha(t: number) {
        const FADE_FROM = 0.6;
        const k = t < FADE_FROM ? 1 : 1 - (t - FADE_FROM) / (1 - FADE_FROM);
        this._baseColor.set(255, 255, 255, Math.round(this._opacity * k * 255));
        this._mat?.setProperty('mainColor', this._baseColor);
    }
}

function _rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
