import { _decorator, Component, CCFloat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 몬스터 발밑에 깔리는 "가짜 그림자" 판 하나를 제어한다.
 *
 * 동적 그림자(그림자 맵)는 동시 생존 몬스터 수만큼 비용이 곱해져서 모바일에서 렉을 유발하므로
 * `MonsterSpawner.monsterCastShadow`를 끄고, 대신 알파 텍스처 판을 발밑에 깔아 접지감만 남긴다.
 *
 * 이 컴포넌트는 그 판 노드 자신에 붙는다(= 프리팹 루트). 몬스터 프리팹은 glb에서 자동 생성된
 * 서브에셋이라 에디터에서 자식을 추가할 수 없어서, `MonsterSpawner`가 스폰 시점에 이 프리팹을
 * 몬스터의 자식으로 붙인다. **조정은 이 프리팹(MonsterShadow.prefab)을 열어서 하면 되고,
 * 값을 바꾸면 이후 스폰되는 모든 몬스터에 반영된다.**
 */
@ccclass('MonsterShadow')
export class MonsterShadow extends Component {
    @property({ type: CCFloat, displayName: '높이(m)', tooltip: '지면에서 판을 이만큼 띄운다(월드 기준). 0이면 지면과 같은 높이라 깜빡일 수 있다(z-fighting). 너무 키우면 그림자가 공중에 뜬 것처럼 보인다. 부모(몬스터)의 스케일은 자동으로 보정되므로 보스든 일반 몬스터든 실제 부양 높이는 같다' })
    heightOffset: number = 0.02;

    @property({ type: CCFloat, displayName: '크기 배율', tooltip: '판의 크기 배율. 몬스터의 스폰 스케일은 부모에서 이미 상속되므로(큰 몬스터 = 큰 그림자), 이 값은 그 위에 곱해지는 추가 보정이다' })
    sizeScale: number = 1;

    @property({ displayName: '좌우/앞뒤 오프셋', tooltip: '발 위치가 메시 원점과 어긋난 몬스터를 보정할 때만 쓴다. 보통은 0,0 (Y는 위의 높이 값으로 조절)' })
    planeOffset: Vec3 = new Vec3(0, 0, 0);

    onLoad() {
        this.apply();
    }

    /**
     * 🔴 엔진 함정 우회 — 이 판이 스폰 지점에 얼어붙던 원인.
     *
     * 몬스터 루트에는 glb가 만든 `cc.SkeletalAnimation`이 붙어 있고 `useBakedAnimation`이
     * 기본 true다. 이때 엔진의 `SkeletalAnimation.start()` → `_applyBakeFlagChange()` →
     * `_setSkeletonTransformEnabled(false)`가 **루트의 직계 자식 전부**(소켓으로 등록된 것만
     * 예외)에 `isSkipTransformUpdate = true`를 찍는다. 스켈레톤 관절은 조인트 텍스처로
     * 그려지니 트랜스폼 갱신이 낭비라서 끄는 것인데, **우리가 나중에 붙인 그림자 판도 직계
     * 자식이라 같이 걸린다.**
     *
     * 그 플래그가 서면 `Node.invalidateChildren`이 그 노드와 하위 트리를 통째로 건너뛴다
     * → 판의 `_transformFlags`/`hasChangedFlags`가 영영 서지 않고
     * → `Model.updateTransform`(게이트가 `hasChangedFlags || isTransformDirty`)이 월드 행렬을
     *   다시 올리지 않아 **처음 그려진 위치(=스폰 지점)에 그대로 멈춘다.**
     *
     * 그래서 플래그를 한 번 되돌린다. `start()`가 아니라 `update()`에서 하는 이유는
     * 순서 보장 때문이다 — 엔진은 한 프레임에서 모든 `start()`를 돌린 뒤 `update()`를 돌리므로,
     * 첫 `update()` 시점에는 `SkeletalAnimation.start()`가 반드시 끝나 있다. `start()`에서
     * 하면 "스포너가 어느 컴포넌트를 먼저 붙였는가"에 결과가 의존해 조용히 다시 깨진다.
     * 되돌린 뒤에는 스스로 꺼서 프레임당 비용을 0으로 만든다(몬스터 최대 200마리).
     *
     * `isSkipTransformUpdate`는 `@engineInternal`이라 `cc.d.ts`에 없어 캐스팅이 필요하다.
     */
    update() {
        (this.node as any).isSkipTransformUpdate = false;
        this.enabled = false;
    }

    /** 인스펙터 값을 노드 트랜스폼에 반영한다. 런타임에 값을 바꿨으면 다시 불러주면 된다 */
    apply() {
        // 부모가 스케일된 상태면 자식의 로컬 좌표도 같이 배율되므로, 높이를 월드 기준으로
        // 읽히게 하려면 부모 월드 스케일로 나눠 보정해야 한다. 보정하지 않으면 보스(스케일 1.5)와
        // 일반 몬스터(0.5)의 실제 부양 높이가 3배 차이난다.
        const ps = this.node.parent?.worldScale;
        const invY = ps && ps.y !== 0 ? 1 / ps.y : 1;
        const invX = ps && ps.x !== 0 ? 1 / ps.x : 1;
        const invZ = ps && ps.z !== 0 ? 1 / ps.z : 1;
        this.node.setPosition(
            this.planeOffset.x * invX,
            (this.heightOffset + this.planeOffset.y) * invY,
            this.planeOffset.z * invZ,
        );
        this.node.setScale(this.sizeScale, this.sizeScale, this.sizeScale);
    }
}
