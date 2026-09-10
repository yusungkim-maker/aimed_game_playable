import { _decorator, Component, Node, Vec3, Mesh, Material, MeshRenderer, director } from 'cc';
import { Monster } from './Monster';
import { HitEffect, HitEffectParams } from './HitEffect';
const { ccclass } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _target: Node | null = null;
    private _dmg    = 1;
    private _speed  = 14;
    private _dir    = new Vec3();
    private _tmp    = new Vec3();
    private _timer  = 0;

    private _fxMesh:   Mesh             | null = null;
    private _fxMat:    Material         | null = null;
    private _fxParams: HitEffectParams  | null = null;
    /** 이 화살을 쏜 출처 노드(예: TowerAttack이 붙은 타워). Player가 쏜 화살은 null —
     * Monster.takeDamage로 그대로 전달돼, 죽었을 때 "어느 타워가 죽였는지" 코인 경제
     * 시스템이 구분할 수 있게 한다. */
    private _source: Node | null = null;

    init(
        target: Node, damage: number, speed = 14,
        mesh: Mesh | null = null, mat: Material | null = null,
        fxMesh: Mesh | null = null, fxMat: Material | null = null,
        fxParams: HitEffectParams | null = null,
        source: Node | null = null,
    ) {
        this._target   = target;
        this._dmg      = damage;
        this._speed    = speed;
        this._fxMesh   = fxMesh;
        this._fxMat    = fxMat;
        this._fxParams = fxParams;
        this._source   = source;
        Vec3.subtract(this._dir, target.worldPosition, this.node.worldPosition);
        this._dir.normalize();
        this.node.setScale(4, 4, 4);
        this._updateRotation();
        if (mesh && mat) {
            const mr = this.node.addComponent(MeshRenderer);
            mr.mesh = mesh;
            mr.setMaterial(mat, 0);
        }
    }

    private _spawnHitEffect(pos: Vec3, dir: Vec3) {
        if (!this._fxMesh || !this._fxMat || !this._fxParams) return;
        const scene = director.getScene();
        if (!scene) return;
        const fxNode = new Node('HitEffect');
        scene.addChild(fxNode);
        fxNode.setWorldPosition(pos);
        fxNode.addComponent(HitEffect).init(this._fxMesh, this._fxMat, dir, this._fxParams);
    }

    private _updateRotation() {
        if (this._dir.lengthSqr() > 0.001) {
            // arrow 메쉬의 로컬 forward가 화살촉 반대(깃털) 방향이라 180도 보정
            const horizLen = Math.sqrt(this._dir.x * this._dir.x + this._dir.z * this._dir.z);
            const yaw   = Math.atan2(this._dir.x, this._dir.z) * 180 / Math.PI + 180;
            const pitch = Math.atan2(this._dir.y, horizLen) * 180 / Math.PI;
            this.node.setRotationFromEuler(pitch, yaw, 0);
        }
    }

    private _destroySelf() {
        this.node.destroy();
    }

    update(dt: number) {
        this._timer += dt;
        if (this._timer > 4) { this._destroySelf(); return; }

        if (this._target?.isValid) {
            Vec3.subtract(this._tmp, this._target.worldPosition, this.node.worldPosition);
            const dist = this._tmp.length();
            if (dist < 0.6) {
                this._target.getComponent(Monster)?.takeDamage(this._dmg, this._dir, this._source);
                this._spawnHitEffect(this.node.worldPosition, this._dir);
                this._destroySelf();
                return;
            }
            this._tmp.normalize();
            this._dir.set(this._tmp);
        }

        const p = this.node.worldPosition;
        this.node.setWorldPosition(
            p.x + this._dir.x * this._speed * dt,
            p.y + this._dir.y * this._speed * dt,
            p.z + this._dir.z * this._speed * dt,
        );
        this._updateRotation();
    }
}
