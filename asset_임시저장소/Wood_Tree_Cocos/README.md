# 나무 (Tree) — Cocos Creator 용

Neuphoria 프로젝트의 나무 에셋을 **Cocos Creator 3.x** 에서 쓸 수 있는 파일만 추린 것이다.
Unity 전용 파일(`.meta`, `.mat`, `.prefab`, Animator Controller)은 모두 제외했다.

## 파일

```
Wood_Tree_Cocos/
├─ Env_Base_TreeA_01.fbx          서 있는 나무 본체 (스켈레톤 + 스키닝 포함)
├─ Env_Base_TreePieceA_01.fbx     벌목 후 남는 통나무/그루터기 (스태틱 메시)
├─ Textures/
│  ├─ Env_Base_TreeA_01_DO.png    Albedo (Diffuse+Occlusion), 1024×1024
│  └─ Env_Base_TreeA_01_N.png     Normal Map, 1024×1024
└─ _Animation_별도작업필요/
   └─ Anim_Env_Base_TreeA_01.fbx  흔들림 애니메이션 (아래 "애니메이션" 항목 참고)
```

본체와 통나무는 **같은 텍스처 세트를 공유**한다. 머티리얼 하나 만들어 둘 다에 쓰면 된다.

## 임포트 순서

1. `Env_Base_TreeA_01.fbx` / `Env_Base_TreePieceA_01.fbx` 와 `Textures/` 를
   Cocos 프로젝트의 `assets/` 아래로 드래그한다.
   Cocos Creator 는 FBX 를 내부적으로 glTF 로 변환해 임포트한다. 이 FBX 들은
   바이너리 FBX 7.5 / 7.7 이라 그대로 들어간다.
2. 임포트된 FBX 를 펼쳐 Prefab 노드를 씬으로 끌어다 놓는다.
   - 본체는 스키닝이 있어 `SkinnedMeshRenderer` 로 들어온다.
   - 통나무는 스켈레톤이 없어 `MeshRenderer` 로 들어온다.
3. 머티리얼을 새로 만든다 (`builtin-standard`). Unity 머티리얼은 넘어오지 않는다.

## 머티리얼 설정 (builtin-standard)

| Cocos 슬롯 | 텍스처 |
|---|---|
| Albedo Map / Main Texture | `Env_Base_TreeA_01_DO.png` |
| Normal Map | `Env_Base_TreeA_01_N.png` |
| Metallic | `0` (나무는 비금속) |
| Roughness | `0.8` 근처에서 눈으로 맞춘다 |

- **노멀맵 규약은 손댈 필요 없다.** 원본이 OpenGL 규약(Y+)이고 Cocos 도 같은 규약이라 그대로 쓰면 된다.
- `USE NORMAL MAP` 체크를 켜야 노멀 슬롯이 나타난다.
- 나무 잎에 알파가 필요하면 Albedo 에 알파 채널이 없으므로 별도 작업이 필요하다
  (이 에셋은 잎도 불투명 폴리곤으로 만들어져 있어 알파 컷아웃이 필요 없다).

## 애니메이션 (선택 — 흔들림이 필요할 때만)

`_Animation_별도작업필요/Anim_Env_Base_TreeA_01.fbx` 는 **메시 없이 애니메이션 커브만 든
Unity 방식의 분리 FBX** 다. Unity 는 이런 파일을 자동으로 본체 스켈레톤에 붙여주지만
**Cocos 는 그렇지 않다.** 그대로 임포트하면 애니메이션 클립만 생기고 나무에 적용되지 않는다.

쓰려면 Blender 에서 한 번 합쳐야 한다:

1. Blender 에 `Env_Base_TreeA_01.fbx` (본체) 임포트
2. `Anim_Env_Base_TreeA_01.fbx` 를 같은 아마추어에 임포트해 액션을 옮겨 붙임
3. 본체 + 액션을 하나의 `.glb` 로 export → Cocos 에 임포트

흔들림이 굳이 필요 없으면 이 폴더는 무시하고 본체 메시만 써도 된다.

## 참고

- Cocos 는 FBX 보다 **glTF/GLB 임포트가 더 안정적**이다. 문제가 생기면
  Blender 로 `.glb` 재export 한 뒤 넣는 것을 권한다.
- 원본은 3ds Max 제작 → Substance Painter 텍스처링 → FBX SDK 2020.3.5 export.
- FBX 내부 텍스처 경로가 원작자 로컬 경로로 박혀 있어 자동 연결은 되지 않는다.
  위 표대로 수동 연결할 것.
- 사내 공용 에셋이므로 자유롭게 사용하면 된다.
