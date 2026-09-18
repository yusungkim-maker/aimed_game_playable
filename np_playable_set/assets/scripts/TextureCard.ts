import { _decorator, CCFloat, CCInteger, Component, Material, MeshRenderer, Mesh, Node, Texture2D, gfx } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * 판(plane)을 나무·부쉬·건물 등 아무 2D 카드로든 쓰게 해주는 바디.
 *
 * 텍스처를 인스펙터에 꽂으면 **원본 이미지의 픽셀 비율대로** 판의 가로·세로를 맞춘다.
 * 정사각 메시에 세로로 긴 그림을 그냥 입히면 한 방향으로 찌그러지는데, 그걸 막는 게 목적이다.
 *
 * 머티리얼은 카드마다 새로 만들지 않는다 — `getMaterialInstance(i)`가 컴포넌트 전용
 * `MaterialInstance`를 지연 생성하므로, 머티리얼 **에셋은 한 장만 공유**하면서 텍스처만
 * 카드별로 갈라진다. 그 인스턴스는 직렬화되지 않으니, 씬에 저장되는 진실은 아래 `texture`
 * 프로퍼티이고 로드 시점에 다시 적용된다.
 *
 * ── 머티리얼 슬롯이 2개인 메시 (plane2x2_ground) ─────────────────────────────
 * 하나의 glb 오브젝트 안에 판이 2장 들어있고 서브메시마다 머티리얼이 따로 붙은 경우가 있다
 * (바닥에 깔린 판 + 그 위에 45도로 선 판). 이때는 `오브젝트`(슬롯 1)에 두 번째 이미지를 꽂으면
 * 머티리얼 슬롯 1에 들어간다 — 사본마다 두 이미지를 독립적으로 지정할 수 있다.
 *
 * **크기는 노드 스케일 하나로만 조절되므로 두 판이 항상 함께 늘어난다.** 판별로 따로 맞추는 것은
 * 구조상 불가능하다(노드가 하나다). 그래서 `크기 기준 서브메시`로 지정한 판 하나의 실측 크기를
 * 기준으로 스케일을 정하고, 나머지 판은 같은 비율로 따라간다. 두 이미지의 픽셀 크기가 같다면
 * 이것이 곧 두 판 모두에 정확한 결과가 된다.
 *
 * 같은 이유로 **판별 위치 이동도 트랜스폼으로는 불가능**하다. 대신 `법선 오프셋`을 쓰면 각 판이
 * 자기 법선 방향으로만 밀린다 — 머티리얼 인스턴스가 슬롯마다 따로라 값도 따로 들어간다.
 * 이 기능은 `TextureCardOffset.effect`를 쓰는 머티리얼에서만 동작하고, 그 유니폼이 없는
 * 머티리얼(기본 `TextureCard.mtl`)에서는 조용히 무시된다.
 *
 * 스케일은 **노드 원점을 중심으로** 적용되므로, 두 판이 맞닿은 선이 원점을 지나도록 모델링돼
 * 있으면 확대·축소해도 맞닿은 상태가 유지된다(plane2x2_ground는 맞닿은 선이 y=0, z=0이다).
 *
 * 붙이는 위치: **MeshRenderer가 있는 노드 자신**(= glb 안의 Plane 노드). 크기는 기본적으로 그
 * 노드에 적용하지만, 스킨드 메시에서는 `크기를 적용할 노드`로 바꿔줘야 한다(그 프로퍼티 참조).
 * 카메라를 향한 Y 회전과 개별 인스턴스 크기 조정은 부모 노드에서 따로 한다.
 */
@ccclass('TextureCard')
@executeInEditMode
export class TextureCard extends Component {
    @property(Texture2D)
    private _texture: Texture2D | null = null;

    @property(Texture2D)
    private _texture2: Texture2D | null = null;

    @property({
        type: Texture2D,
        displayName: '그림자',
        tooltip: '**바닥에 깔리는 판(머티리얼 슬롯 0)** 에 쓸 이미지 — 오브젝트가 땅에 드리우는 그림자를 그린다. 꽂는 즉시 원본 비율대로 판이 늘어난다. 판이 하나뿐인 보통 카드에서는 이쪽이 곧 그림 본체다. 파일은 assets/texture/2d texture 아래에 두는 것이 규칙이다(엔진이 폴더를 강제하지는 못하므로 수동으로 지킬 것)',
    })
    get texture (): Texture2D | null {
        return this._texture;
    }
    set texture (value: Texture2D | null) {
        this._texture = value;
        this.apply();
    }

    @property({
        type: Texture2D,
        displayName: '오브젝트',
        tooltip: '**세워진 45도 판(머티리얼 슬롯 1)** 에 쓸 이미지 — 나무·건물처럼 실제로 보여줄 물체를 그린다. 슬롯이 1개뿐인 보통 카드에서는 비워둔다(비어 있으면 아무 일도 하지 않는다). 크기는 아래 "크기 기준 서브메시"가 정하므로 이 텍스처의 비율은 크기에 영향을 주지 않는다(두 이미지의 픽셀 크기를 같게 맞춰 쓰는 것을 전제로 한다)',
    })
    get texture2 (): Texture2D | null {
        return this._texture2;
    }
    set texture2 (value: Texture2D | null) {
        this._texture2 = value;
        this.apply();
    }

    @property({
        type: Node,
        displayName: '크기를 적용할 노드',
        tooltip: '계산된 크기를 어느 노드의 스케일에 쓸지. 비워두면 이 컴포넌트가 붙은 노드 자신이다(보통 카드는 그대로 두면 된다).\n\n**스킨드 메시(본 애니메이션이 붙은 카드)에서는 반드시 스키닝 루트를 지정해야 한다.** 스킨드 메시는 자기 노드가 아니라 스키닝 루트의 트랜스폼으로 그려지기 때문이다(엔진 skinning-model.ts의 bindSkeleton이 모델의 변환 노드를 스키닝 루트로 바꿔친다). 비워두면 크기 보정이 화면에 반영되지 않고 카드가 1:1로 나온다',
    })
    scaleTarget: Node | null = null;

    @property({
        type: CCFloat,
        displayName: '픽셀/유닛',
        tooltip: '텍스처 몇 픽셀을 월드 1유닛으로 칠지. 값이 클수록 모든 카드가 작아진다. 모든 카드가 같은 값을 써야 나무·부쉬·건물의 상대 크기가 원본 이미지 해상도대로 유지된다 — 개별 카드만 키우고 싶으면 이 값이 아니라 부모 노드의 스케일을 쓸 것',
    })
    pixelsPerUnit: number = 100;

    @property({
        type: CCInteger,
        displayName: '크기 기준 서브메시',
        tooltip: '판이 여러 장 합쳐진 메시에서, 어느 판의 실측 크기를 기준으로 스케일을 계산할지. plane2x2_ground는 0 = 바닥 판, 1 = 45도로 선 판이다. 판이 하나뿐인 보통 카드는 0 그대로 두면 된다(그 경우 이 값은 아무 영향이 없다)',
    })
    sizeSubMeshIndex: number = 0;

    @property({
        type: CCFloat,
        displayName: '세로 보정 배율',
        tooltip: '계산된 세로 스케일에 곱하는 보정값. 판이 카메라를 정면으로 마주보지 않을 때 화면에서 눌려 보이는 만큼을 되돌린다. plane2x2처럼 기울기가 카메라 각도(-45도)와 일치해 정면으로 보이는 카드는 보정이 필요 없으므로 1이다. plane2x2_ground는 √2(약 1.414)를 쓴다 — 바닥 판은 45도로 눕혀져 cos45만큼 눌리고, 위의 기운 판은 기준으로 삼은 바닥 판(2.828)보다 자기 길이(2.0)가 √2배 짧아서, 서로 다른 이유로 정확히 같은 배율이 필요하다',
    })
    heightCompensation: number = 1;

    @property({
        type: CCFloat,
        displayName: '법선 오프셋 (슬롯 0)',
        tooltip: '첫 번째 판(plane2x2_ground에서는 바닥 판)을 자기 법선 방향으로 미는 거리. 월드 단위라 노드 스케일과 무관하게 같은 숫자면 같은 거리만큼 움직인다. 바닥 판은 법선이 위쪽이므로 값을 키우면 위로 뜬다 — 다른 바닥과 겹쳐 깜빡일 때(z-fighting) 아주 작은 값(0.001~0.01)으로 띄우는 용도다. 이 기능은 TextureCardOffset 머티리얼에서만 동작하고, 그 유니폼이 없는 머티리얼에서는 무시된다',
    })
    normalOffset: number = 0;

    @property({
        type: CCFloat,
        displayName: '법선 오프셋 (슬롯 1)',
        tooltip: '두 번째 판(plane2x2_ground에서는 45도로 선 판)을 자기 법선 방향으로 미는 거리. 기운 판의 법선은 카메라 쪽 비스듬히 위를 향하므로, 값을 키우면 카메라 앞쪽으로 나오며 살짝 올라간다 — 바닥 판과 겹쳐 보일 때 앞으로 빼는 용도다',
    })
    normalOffset2: number = 0;

    onLoad () {
        this.apply();
    }

    /**
     * 에디터 전용 감시. 이 컴포넌트가 반응해야 할 값 중 상당수는 **컴포넌트 밖이나 setter 밖**에 있다
     * — 머티리얼 슬롯은 MeshRenderer 쪽이고, `픽셀/유닛`은 평범한 @property라 setter가 없다.
     * 게다가 프리팹을 새로 인스턴스화한 직후에는 텍스처가 아직 로드되지 않아 크기를 읽을 수 없다.
     * 그래서 개별 변경을 감지하는 대신 에디터에서는 매 프레임 다시 시도한다 — 텍스처가 로드되는
     * 순간 저절로 올바른 크기로 맞춰진다(에디터는 카드 몇 개뿐이라 비용이 문제되지 않는다).
     * 런타임에는 씬 로드 시점에 모든 값이 채워져 있으므로 첫 프레임에 스스로 꺼서 비용을 0으로 만든다.
     */
    update () {
        if (!EDITOR) {
            this.enabled = false;
            return;
        }
        this.apply();
    }

    /** 인스펙터 값을 머티리얼과 노드 스케일에 반영한다. 런타임에 값을 바꿨으면 다시 불러주면 된다 */
    apply () {
        if (!this._texture || this.pixelsPerUnit <= 0) return;

        const width = this._texture.width;
        const height = this._texture.height;
        // 텍스처가 아직 로드되지 않았으면 크기를 믿을 수 없다 — 그 상태에서 width/height를 읽으면
        // 엔진 기본 더미값(2×2)이 나온다. 그대로 계산하면 카드가 터무니없이 작은 스케일로 박히고,
        // 그게 씬에 저장돼 버린다. 에디터에서 프리팹을 새로 인스턴스화할 때 실제로 이 순서가 나온다.
        // 로드될 때까지 아무것도 하지 않으면 직렬화된 스케일이 유지되므로 화면상 문제가 없고,
        // 위 update()가 매 프레임 다시 시도하므로 로드되는 순간 자동으로 맞춰진다.
        if (!this._texture.image || width <= 2 || height <= 2) return;

        // SkinnedMeshRenderer는 MeshRenderer를 상속하므로 스킨드 카드에서도 이 한 줄이 그대로 잡는다.
        const renderer = this.getComponent(MeshRenderer);
        const mesh = renderer?.mesh;
        if (!renderer || !mesh) return;

        const slot0 = renderer.getMaterialInstance(0);
        if (slot0) {
            slot0.setProperty('mainTexture', this._texture);
            this._setNormalOffset(slot0, this.normalOffset);
        }
        // 슬롯 1은 있을 때만 건드린다 — 판이 하나뿐인 카드에서는 getMaterialInstance(1)이 null이라
        // 자연히 무동작이 된다. 텍스처는 꽂았을 때만, 오프셋은 슬롯이 있으면 항상 적용한다
        // (0으로 되돌리는 것도 반영돼야 하므로 값이 0이라고 건너뛰지 않는다).
        const slot1 = renderer.getMaterialInstance(1);
        if (slot1) {
            if (this._texture2) slot1.setProperty('mainTexture', this._texture2);
            this._setNormalOffset(slot1, this.normalOffset2);
        }

        const size = this._nativeSize(mesh, this.sizeSubMeshIndex);
        if (!size) return;
        const [nativeWidth, nativeHeight] = size;
        if (nativeWidth <= 0 || nativeHeight <= 0) return;

        const scaleWidth = width / this.pixelsPerUnit / nativeWidth;
        // 세로에만 보정을 곱한다 — 가로(x)는 카메라 각도와 무관하게 화면에 그대로 나오므로
        // 건드리면 오히려 이미지가 옆으로 찌그러진다.
        const scaleHeight = height / this.pixelsPerUnit / nativeHeight * this.heightCompensation;

        // 기본은 자기 노드. 스킨드 카드에서만 스키닝 루트를 가리키게 해서, 스케일이 실제로
        // 렌더링에 반영되는 노드에 쓰이도록 한다(비어 있으면 예전과 완전히 같은 동작).
        const target = this.scaleTarget ?? this.node;

        // 값이 같을 때 setScale을 부르지 않는다 — 에디터에서 매 프레임 호출되는 경로라,
        // 그냥 쓰면 노드가 계속 변경됨으로 표시돼 씬이 저장 안 된 상태로 남는다.
        const scale = target.scale;
        if (scale.x !== scaleWidth || scale.y !== scaleHeight || scale.z !== scaleHeight) {
            target.setScale(scaleWidth, scaleHeight, scaleHeight);
        }
    }

    /**
     * 법선 오프셋을 머티리얼에 쓴다.
     *
     * 이펙트가 `normalOffset`을 선언하지 않았으면 그냥 넘어간다 — 기본 `TextureCard.mtl`은
     * builtin-unlit이라 이 유니폼이 없고, 그런 머티리얼에 setProperty를 부르면 엔진이 경고를 찍는다.
     * 위 update()가 에디터에서 매 프레임 도는 경로라 그대로 두면 콘솔이 경고로 뒤덮인다.
     * `getHandle`은 없는 이름에 0을 돌려주므로 이게 곧 "이 머티리얼이 지원하는가" 검사다.
     */
    private _setNormalOffset (material: Material, value: number) {
        const pass = material.passes?.[0];
        if (!pass || pass.getHandle('normalOffset') === 0) return;
        material.setProperty('normalOffset', value);
    }

    /**
     * 기준 서브메시의 실측 [가로, 세로]를 돌려준다.
     *
     * 판은 카메라 내려보기 각도에 맞춘 기울기가 **메시 버텍스에 구워져** 있어서, 판의 '세로'가
     * 로컬 y와 z에 나뉘어 들어가 있다(plane2x2 기준 각각 √2). 그래서 세로 길이는 두 스팬의
     * 빗변이고, 스케일도 y·z에 같은 값을 줘야 한다 — 한쪽만 늘리면 기울기 각도가 틀어진다.
     * 바닥에 눕는 판은 y 스팬이 0이라 이 식이 자연스럽게 z 스팬이 된다.
     */
    private _nativeSize (mesh: Mesh, index: number): [number, number] | null {
        const struct = mesh.struct;
        const primitives = struct?.primitives;

        // 서브메시가 하나뿐이면 메시 전체 AABB가 곧 그 서브메시의 AABB다. 기존 카드(plane2x2)의
        // 동작을 한 글자도 바꾸지 않기 위해 이 경로를 그대로 유지한다.
        if (!primitives || primitives.length <= 1 || index < 0 || index >= primitives.length) {
            return this._structSize(mesh);
        }

        // 판이 여러 장 합쳐진 메시에서는 전체 AABB가 "두 판을 합친 상자"라 어느 판의 크기도 아니다.
        // 그래서 기준 판의 정점을 직접 읽어 그 판만의 스팬을 잰다. plane2x2_ground는 서브메시마다
        // 버텍스 번들이 따로라(각 4정점) 인덱스를 되짚을 필요 없이 이 배열이 곧 그 판의 정점이다.
        const pos = mesh.readAttribute(index, gfx.AttributeName.ATTR_POSITION);
        if (!pos || pos.length < 3) return this._structSize(mesh);

        let minX = Infinity; let minY = Infinity; let minZ = Infinity;
        let maxX = -Infinity; let maxY = -Infinity; let maxZ = -Infinity;
        for (let i = 0; i + 2 < pos.length; i += 3) {
            const x = pos[i]; const y = pos[i + 1]; const z = pos[i + 2];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }
        return [maxX - minX, Math.hypot(maxY - minY, maxZ - minZ)];
    }

    /** 메시 전체 AABB로 [가로, 세로]를 구한다 — 서브메시가 하나뿐이거나 정점을 못 읽을 때의 경로 */
    private _structSize (mesh: Mesh): [number, number] | null {
        const min = mesh.struct?.minPosition;
        const max = mesh.struct?.maxPosition;
        if (!min || !max) return null;
        return [max.x - min.x, Math.hypot(max.y - min.y, max.z - min.z)];
    }
}
