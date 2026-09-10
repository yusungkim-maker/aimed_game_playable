System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, MeshRenderer, director, Monster, HitEffect, _dec, _class, _crd, ccclass, Bullet;

  function _reportPossibleCrUseOfMonster(extras) {
    _reporterNs.report("Monster", "./Monster", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitEffect(extras) {
    _reporterNs.report("HitEffect", "./HitEffect", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitEffectParams(extras) {
    _reporterNs.report("HitEffectParams", "./HitEffect", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
      MeshRenderer = _cc.MeshRenderer;
      director = _cc.director;
    }, function (_unresolved_2) {
      Monster = _unresolved_2.Monster;
    }, function (_unresolved_3) {
      HitEffect = _unresolved_3.HitEffect;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "03a0csFoEdHnrYFM7A+iWpO", "Bullet", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Mesh', 'Material', 'MeshRenderer', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("Bullet", Bullet = (_dec = ccclass('Bullet'), _dec(_class = class Bullet extends Component {
        constructor(...args) {
          super(...args);
          this._target = null;
          this._dmg = 1;
          this._speed = 14;
          this._dir = new Vec3();
          this._tmp = new Vec3();
          this._timer = 0;
          this._fxMesh = null;
          this._fxMat = null;
          this._fxParams = null;

          /** 이 화살을 쏜 출처 노드(예: TowerAttack이 붙은 타워). Player가 쏜 화살은 null —
           * Monster.takeDamage로 그대로 전달돼, 죽었을 때 "어느 타워가 죽였는지" 코인 경제
           * 시스템이 구분할 수 있게 한다. */
          this._source = null;
        }

        init(target, damage, speed = 14, mesh = null, mat = null, fxMesh = null, fxMat = null, fxParams = null, source = null) {
          this._target = target;
          this._dmg = damage;
          this._speed = speed;
          this._fxMesh = fxMesh;
          this._fxMat = fxMat;
          this._fxParams = fxParams;
          this._source = source;
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

        _spawnHitEffect(pos, dir) {
          if (!this._fxMesh || !this._fxMat || !this._fxParams) return;
          const scene = director.getScene();
          if (!scene) return;
          const fxNode = new Node('HitEffect');
          scene.addChild(fxNode);
          fxNode.setWorldPosition(pos);
          fxNode.addComponent(_crd && HitEffect === void 0 ? (_reportPossibleCrUseOfHitEffect({
            error: Error()
          }), HitEffect) : HitEffect).init(this._fxMesh, this._fxMat, dir, this._fxParams);
        }

        _updateRotation() {
          if (this._dir.lengthSqr() > 0.001) {
            // arrow 메쉬의 로컬 forward가 화살촉 반대(깃털) 방향이라 180도 보정
            const horizLen = Math.sqrt(this._dir.x * this._dir.x + this._dir.z * this._dir.z);
            const yaw = Math.atan2(this._dir.x, this._dir.z) * 180 / Math.PI + 180;
            const pitch = Math.atan2(this._dir.y, horizLen) * 180 / Math.PI;
            this.node.setRotationFromEuler(pitch, yaw, 0);
          }
        }

        _destroySelf() {
          this.node.destroy();
        }

        update(dt) {
          var _this$_target;

          this._timer += dt;

          if (this._timer > 4) {
            this._destroySelf();

            return;
          }

          if ((_this$_target = this._target) != null && _this$_target.isValid) {
            Vec3.subtract(this._tmp, this._target.worldPosition, this.node.worldPosition);

            const dist = this._tmp.length();

            if (dist < 0.6) {
              var _this$_target$getComp;

              (_this$_target$getComp = this._target.getComponent(_crd && Monster === void 0 ? (_reportPossibleCrUseOfMonster({
                error: Error()
              }), Monster) : Monster)) == null || _this$_target$getComp.takeDamage(this._dmg, this._dir, this._source);

              this._spawnHitEffect(this.node.worldPosition, this._dir);

              this._destroySelf();

              return;
            }

            this._tmp.normalize();

            this._dir.set(this._tmp);
          }

          const p = this.node.worldPosition;
          this.node.setWorldPosition(p.x + this._dir.x * this._speed * dt, p.y + this._dir.y * this._speed * dt, p.z + this._dir.z * this._speed * dt);

          this._updateRotation();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6cea83acb44d6093250e59e70c3e9e96c29040c5.js.map