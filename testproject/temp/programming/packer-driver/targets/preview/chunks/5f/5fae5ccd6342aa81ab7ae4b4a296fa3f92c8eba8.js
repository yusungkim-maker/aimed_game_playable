System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, SkinnedMeshRenderer, Material, Player, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, FollowerGhostState;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayer(extras) {
    _reporterNs.report("Player", "./Player", _context.meta, extras);
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
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
      Material = _cc.Material;
    }, function (_unresolved_2) {
      Player = _unresolved_2.Player;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6da1fN8TAxBWbxuFZlZUtVn", "FollowerGhostState", undefined);

      __checkObsolete__(['_decorator', 'Component', 'SkinnedMeshRenderer', 'Material']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * 생산 대기 중인 추종자(소켓 위 미리보기)의 고스트 상태를 관리한다.
       * enterGhost()로 실제 토온 머티리얼을 백업하고 FollowerGhost.effect 기반 머티리얼로
       * 교체한 뒤, fadeTo()로 ghostFactor(프레넬+반투명 factor)를 서서히 낮춘다. factor가
       * 0에 도달하면 solidify()가 원래 토온 머티리얼로 되돌려 다른 추종자들과 동일하게 보이게 한다.
       */
      _export("FollowerGhostState", FollowerGhostState = (_dec = ccclass('FollowerGhostState'), _dec2 = property(Material), _dec3 = property(Material), _dec(_class = (_class2 = class FollowerGhostState extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "ghostBodyMaterial", _descriptor, this);

          _initializerDefineProperty(this, "ghostWeaponMaterial", _descriptor2, this);

          this._entries = [];
          this._ghostFactor = 0;
          this._fadeFrom = 0;
          this._fadeTo = 0;
          this._fadeTimer = 0;
          this._fadeDuration = 0;
          this._fadeActive = false;
          this._onFadeDone = null;
        }

        get ghostFactor() {
          return this._ghostFactor;
        }

        get isGhost() {
          return this._entries.length > 0;
        }
        /** 고스트(생산 대기) 상태로 진입 — 원래 머티리얼을 백업하고 고스트 머티리얼로 교체.
         * 아직 "생산되지 않은" 상태이므로 몬스터 타게팅/공격도 함께 꺼둔다. */


        enterGhost() {
          var player = this.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player);
          if (player) player.combatEnabled = false;
          this._entries = [];
          var renderers = this.node.getComponentsInChildren(SkinnedMeshRenderer);

          for (var r of renderers) {
            var _r$sharedMaterials$;

            var isBody = r.node.name === 'NPC_Summon_001';
            var isWeapon = r.node.name.startsWith('crossbow');
            var ghostAsset = isBody ? this.ghostBodyMaterial : isWeapon ? this.ghostWeaponMaterial : null;
            if (!ghostAsset) continue; // setMaterial()에 다시 넣어 되돌리려면 인스턴스(getMaterialInstance)가 아니라
            // 공유 머티리얼 자체를 들고 있어야 한다 — 인스턴스를 넣으면 엔진이
            // "Can't set a material instance to a sharedMaterial slot" 에러를 낸다.

            var realMaterial = (_r$sharedMaterials$ = r.sharedMaterials[0]) != null ? _r$sharedMaterials$ : null;
            r.setMaterial(ghostAsset, 0);

            this._entries.push({
              renderer: r,
              realMaterial
            });
          }

          this.setGhostFactor(1);
        }

        setGhostFactor(v) {
          this._ghostFactor = v;

          for (var e of this._entries) {
            var _e$renderer$getMateri;

            (_e$renderer$getMateri = e.renderer.getMaterialInstance(0)) == null || _e$renderer$getMateri.setProperty('ghostFactor', v);
          }
        }
        /** ghostFactor를 duration에 걸쳐 target까지 선형 보간. 도달 시 onComplete 호출 */


        fadeTo(target, duration, onComplete) {
          this._fadeFrom = this._ghostFactor;
          this._fadeTo = target;
          this._fadeDuration = Math.max(0.0001, duration);
          this._fadeTimer = 0;
          this._fadeActive = true;
          this._onFadeDone = onComplete != null ? onComplete : null;
        }
        /** 고스트 → 실체화: 원래 토온 머티리얼로 되돌리고 고스트 상태를 해제한다.
         * 이 시점부터 진짜 추종자로 취급해 몬스터 타게팅/공격을 다시 켠다. */


        solidify() {
          this._fadeActive = false;

          for (var e of this._entries) {
            if (e.realMaterial) e.renderer.setMaterial(e.realMaterial, 0);
          }

          this._entries = [];
          this._ghostFactor = 0;
          var player = this.getComponent(_crd && Player === void 0 ? (_reportPossibleCrUseOfPlayer({
            error: Error()
          }), Player) : Player);
          if (player) player.combatEnabled = true;
        }

        update(dt) {
          if (!this._fadeActive) return;
          this._fadeTimer += dt;
          var t = Math.min(1, this._fadeTimer / this._fadeDuration);
          this.setGhostFactor(this._fadeFrom + (this._fadeTo - this._fadeFrom) * t);

          if (t >= 1) {
            this._fadeActive = false;
            var cb = this._onFadeDone;
            this._onFadeDone = null;
            cb == null || cb();
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ghostBodyMaterial", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ghostWeaponMaterial", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5fae5ccd6342aa81ab7ae4b4a296fa3f92c8eba8.js.map