import { _decorator, Component, Mesh, Material, MeshRenderer, MaterialInstance, Vec3, Vec4, Quat } from 'cc';
const { ccclass } = _decorator;

/** 카메라(고정, X-euler -45도)를 정면으로 바라보게 만드는 고정 피치 — HitEffect와 동일한 값.
 * 카메라 forward=(0,-0.7071,-0.7071)와 정확히 반대(dot=-1)가 되는 검증된 각도다. */
const CAMERA_FACE_PITCH_DEG = -45;

export interface DeadEffectParams {
    cols: number;
    rows: number;
    frameCount: number;
    fps: number;
    size: number;
    /** 아틀라스 첫 프레임이 이미지 아래쪽 행에 있으면 true. 기본(false)은 좌상단이 1프레임. */
    rowsBottomUp: boolean;
}

/**
 * monster_dead_effect.png 같은 격자 아틀라스를 한 장씩 넘겨 재생하는 1회성 폭발 이펙트.
 * 쿼드 하나에 unlit 머티리얼을 얹고 tilingOffset(스케일 xy + 오프셋 zw)으로 샘플링할 칸만
 * 옮겨서 스프라이트 시트를 돌린다 — HitEffect가 랜덤 1칸을 뽑아 쓰는 것과 같은 방식이되,
 * 이쪽은 프레임을 순서대로 넘긴다. 마지막 프레임이 끝나면 스스로 사라진다.
 */
@ccclass('MonsterDeadEffect')
export class MonsterDeadEffect extends Component {
    private _inst: MaterialInstance | null = null;
    private _params: DeadEffectParams | null = null;
    private _timer = 0;
    private _frame = -1;

    init(mesh: Mesh, mat: Material, params: DeadEffectParams) {
        this._params = params;

        const mr = this.node.addComponent(MeshRenderer);
        mr.mesh = mesh;
        mr.setMaterial(mat, 0);
        this._inst = mr.getMaterialInstance(0);

        this.node.setRotation(Quat.fromAxisAngle(
            new Quat(), Vec3.UNIT_X, CAMERA_FACE_PITCH_DEG * Math.PI / 180,
        ));
        this.node.setScale(params.size, params.size, params.size);

        this._applyFrame(0);
    }

    update(dt: number) {
        const p = this._params;
        if (!p) return;

        this._timer += dt;
        const idx = Math.floor(this._timer * p.fps);
        if (idx >= p.frameCount) {
            this.node.destroy();
            return;
        }
        if (idx !== this._frame) this._applyFrame(idx);
    }

    private _applyFrame(i: number) {
        const p = this._params;
        if (!p || !this._inst) return;
        this._frame = i;

        const col = i % p.cols;
        const rowFromTop = Math.floor(i / p.cols);
        // 텍스처 v좌표는 아래가 0이라, 이미지 위쪽 행부터 재생하려면 행 번호를 뒤집어야 한다.
        const row = p.rowsBottomUp ? rowFromTop : (p.rows - 1 - rowFromTop);

        this._inst.setProperty('tilingOffset', new Vec4(
            1 / p.cols, 1 / p.rows, col / p.cols, row / p.rows,
        ));
    }
}
