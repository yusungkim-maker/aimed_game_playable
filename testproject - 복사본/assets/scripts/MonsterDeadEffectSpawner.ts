import { _decorator, Component, Node, Mesh, Material, Vec3, CCFloat, CCInteger } from 'cc';
import { MonsterDeadEffect } from './MonsterDeadEffect';
const { ccclass, property } = _decorator;

/**
 * 몬스터가 죽은 자리에 아틀라스 시퀀스 폭발 이펙트를 띄우는 단일 스포너.
 * Monster는 죽는 순간 여기에 위치만 넘기고 바로 사라진다 — 메시/머티리얼/타이밍 설정을
 * 몬스터 프리팹마다 중복해서 들고 있지 않도록, MonsterHealthBarManager와 같은
 * "씬에 하나만 두는 매니저" 패턴을 따랐다.
 */
@ccclass('MonsterDeadEffectSpawner')
export class MonsterDeadEffectSpawner extends Component {
    static instance: MonsterDeadEffectSpawner | null = null;

    @property({ type: Mesh, displayName: '쿼드 메시', tooltip: '이펙트를 그릴 평면 메시 — 히트 이펙트가 쓰는 것과 같은 것(UI_arrow.glb의 쿼드)을 그대로 쓰면 된다' })
    quadMesh: Mesh | null = null;

    @property({ type: Material, displayName: '이펙트 머티리얼', tooltip: 'texture/MonsterDeadFx.mtl — monster_dead_effect.png를 쓰는 unlit 반투명 머티리얼' })
    fxMaterial: Material | null = null;

    @property({ type: CCInteger, displayName: '아틀라스 열(가로 칸수)' })
    cols: number = 3;

    @property({ type: CCInteger, displayName: '아틀라스 행(세로 칸수)' })
    rows: number = 3;

    @property({ type: CCInteger, displayName: '총 프레임 수', tooltip: '격자 칸이 남더라도 여기 적은 수만큼만 재생한다' })
    frameCount: number = 9;

    @property({ type: CCFloat, displayName: '초당 프레임(FPS)', tooltip: '9프레임 기준 24면 약 0.37초 동안 재생된다' })
    fps: number = 24;

    @property({ type: CCFloat, displayName: '이펙트 크기' })
    size: number = 2;

    @property({ type: CCFloat, displayName: '높이 오프셋(m)', tooltip: '몬스터 발밑 기준 이만큼 위에 이펙트를 띄운다' })
    heightOffset: number = 0.8;

    @property({ displayName: '아틀라스 첫 프레임이 아래쪽', tooltip: '재생 순서가 거꾸로(작은 파편 → 폭발)로 보이면 이 값을 켜서 행 순서를 뒤집는다' })
    rowsBottomUp: boolean = false;

    onLoad() { MonsterDeadEffectSpawner.instance = this; }
    onDestroy() { if (MonsterDeadEffectSpawner.instance === this) MonsterDeadEffectSpawner.instance = null; }

    /** 몬스터가 죽는 순간 그 위치에 이펙트를 하나 띄운다 */
    playAt(worldPos: Vec3, scaleMult = 1) {
        if (!this.quadMesh || !this.fxMaterial) return;

        const fx = new Node('MonsterDeadFx');
        this.node.addChild(fx);
        fx.setWorldPosition(worldPos.x, worldPos.y + this.heightOffset, worldPos.z);
        fx.addComponent(MonsterDeadEffect).init(this.quadMesh, this.fxMaterial, {
            cols: this.cols,
            rows: this.rows,
            frameCount: this.frameCount,
            fps: this.fps,
            size: this.size * scaleMult,
            rowsBottomUp: this.rowsBottomUp,
        });
    }
}
