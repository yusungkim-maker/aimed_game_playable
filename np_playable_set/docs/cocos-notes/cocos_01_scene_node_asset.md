# Cocos Creator 3.8 — 씬 그래프 & 에셋 파이프라인

## 1. 기본 구조: Scene / Node / Component / Prefab

- **Scene**: 게임 월드를 구성하는 최상위 단위. 씬 안에는 기본적으로 카메라 컴포넌트가 하나 있어야 화면에 뭔가 보인다.
- **Node**: 씬을 이루는 기본 단위. 부모-자식 트리 구조와 공간 변환(Transform: position/rotation/scale)을 관리한다. Node 자체는 로직을 갖지 않고, 로직/기능은 전부 Component로 붙는다.
- **Component**: Node에 부착되는 기능 단위(MeshRenderer, Animation, Light, Camera, 커스텀 TS 스크립트 등). Unity의 MonoBehaviour와 동일한 역할.
- **Prefab**: Node 트리 + Component 구성을 통째로 저장해둔 "재사용 가능한 설계도". 씬에 여러 번 인스턴스화(instantiate)해서 배치할 수 있다. `PrefabInstance`는 원본 프리팹에서 특정 속성만 덮어쓴(override) 상태를 `propertyOverrides`로 기록한다.

```
Scene
 └─ Node (Transform)
     ├─ Component (MeshRenderer / Camera / 커스텀 스크립트 ...)
     └─ Child Node
         └─ ...
```

## 2. 에셋 파이프라인: uuid와 .meta

Cocos는 파일명이 아니라 **uuid로 모든 에셋 참조를 관리**한다. 이게 이 엔진 디버깅의 핵심 개념.

- `assets/` 폴더에 파일을 넣으면 에디터가 자동 임포트하면서 같은 폴더에 **원본 파일명 전체 + `.meta`**를 붙인 사이드카 파일을 생성한다.
  - 예: `chair.glb` → `chair.glb.meta` (확장자를 떼고 붙이는 게 아니라 전체 파일명 뒤에 붙임)
- `.meta` 파일(JSON)에는 `"uuid"` 필드와 임포트 설정(압축 방식, 밉맵 여부 등)이 들어있다.
- 씬(`.scene`)이나 프리팹(`.prefab`) 파일 안에서 에셋을 참조할 때는 파일명이 아니라 `{"__uuid__": "...", "__expectedType__": "cc.Texture2D"}` 형태로 uuid만 기록된다. 그래서 에디터 안에서 파일명을 바꿔도(rename) 참조가 안 끊긴다 — 리네임 시 `.meta` 파일명도 자동으로 같이 바뀌지만 내부 uuid 값은 유지되기 때문.
- **주의**: 에디터를 끈 상태에서 탐색기로 직접 파일명을 바꾸면 에디터는 "삭제+새 파일 추가"로 인식해 uuid가 새로 발급되고 기존 참조가 전부 끊긴다. 리네임은 반드시 에디터 안에서 해야 한다.
- glTF/glb처럼 파일 하나에 여러 서브 에셋(mesh, material, skeleton, animation clip)이 들어있는 경우, `.meta`의 `subMetas` 필드에 `부모uuid@짧은해시` 형식으로 각 서브 에셋의 uuid가 개별 기록된다.

## 3. Error 3702 디버깅 절차 ("json file of asset %s is empty or missing")

이 프로젝트에서 반복적으로 발생한 캐시 손상 에러. 원인은 `library/` 폴더 안의 컴파일된 캐시 JSON이 비어있거나 깨진 것.

1. 에러 로그의 uuid를 확보한다.
2. `assets/` 전체에서 `.meta` 파일을 grep해서 해당 uuid를 가진 파일을 찾는다.
3. glTF류라면 `.meta`의 `subMetas`를 확인해서, 참조된 서브 에셋(스켈레톤/애니메이션 클립 등)이 실제로 존재하는지 확인한다. 존재하지 않는 서브 에셋을 참조하는 컴포넌트(예: 스켈레톤 없는 메쉬에 `SkinnedMeshRenderer`+`SkeletalAnimation`을 붙인 경우)는 렌더링 실패의 흔한 원인이다.
4. 단발성이면 해당 에셋만 재임포트. 같은 에러가 여러 에셋에 걸쳐 반복 재발하면 `library`/`temp` 폴더를 통째로 삭제하고 전체 재임포트를 권장한다.

## 4. "에디터 미저장" 함정

에디터/프리팹 편집 모드에서 변경한 내용은 **명시적으로 Ctrl+S(Save Scene / Save Prefab)를 눌러야 저장**된다. "고쳤다"고 말한 내용이 실제로 반영 안 된 채 넘어가는 경우가 이 프로젝트에서 여러 번 발생했다.

검증 방법: 해당 `.scene`/`.prefab` 파일의 mtime이 최근인지 확인하고, 파일 내용을 직접 grep해서 논의된 컴포넌트/속성 값이 실제로 존재하는지 대조한다. 0건이면 저장이 안 된 것.
