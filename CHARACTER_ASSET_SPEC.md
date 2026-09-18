# 플레이어블 광고용 캐릭터 에셋 규격 (Cocos Creator 3.8.8)

> 작성 기준: 2026-09-14 / 대상 프로젝트 `testproject - 복사본`
> 이 문서의 모든 수치는 프로젝트의 실제 에셋과 빌드 산출물을 측정해서 얻은 값이다.
> 표기 규칙 — **[확인]** 실측·소스 확인함 · **[추론]** 근거는 있으나 미검증 · **[미확인]** 확인 못 함

---

## 0. 전제 조건

| 항목 | 값 | 비고 |
|---|---|---|
| 엔진 | Cocos Creator **3.8.8** | 버전 업 금지(검증된 함정 목록이 이 버전 기준) |
| 렌더러 | **WebGL 1.0 전용** | `gfx-webgl2: false`, `gfx-webgpu: false` **[확인]** |
| 용량 한도 | 채널별 5MB (AppLovin 등) | 현재 씬2 KR 빌드 = 5,226,040 B |
| 스키닝 | 실시간 (`useBakedAnimation: false`) | animgraph 사용 때문 **[확인]** |
| 물리 | 전부 비활성 | 캐릭터에 Collider 붙이지 말 것 |

WebGL 1.0이라는 점이 아래 규격 여러 개의 근거다 — NPOT 텍스처에 `repeat` 랩·밉맵을 못 쓰고, 스킨 조인트가 유니폼 배열 용량에 묶인다.

---

## 1. 용량 공식 — 캐릭터 1종이 빌드에서 차지하는 바이트

임포트 결과물을 역산해 만든 공식이며, 오차 1% 이내로 검증했다. **[확인]**

```
메쉬 = 정점수 × 72B  (정점컬러 있으면 +4B)  +  삼각형수 × 6B
애니 = 애니되는 노드수 × ( 940B × 클립수  +  약 1,300B × 클립 총 길이(초) )
캐릭터 총합 = 메쉬 + 애니 + 텍스처
```

정점 stride는 **고정값**이다(임포터가 정한다):

| 메쉬 종류 | stride | 구성 |
|---|---|---|
| 정적 | **48B** | position 12 + normal 12 + uv 8 + **tangent 16** |
| 스킨드 | **72B** | 위 + joints 8 + weights 16 |
| 스킨드 + 정점컬러 | 76B | 위 + color 4 |

> `tangent`는 glb에 없어도 임포터가 **항상** 생성한다(4정점짜리 판때기까지 전수 확인). 스킨드 메쉬 용량의 22%다. **[확인]**

### 현재 캐릭터 실측

| 에셋 | 삼각형 | 정점 | 본 | 클립 | glb 원본 | **빌드 실측** |
|---|---|---|---|---|---|---|
| `cactus01` | 2,604 | 1,694 | 21 | 4 (3.47s) | 220KB | 메쉬 144KB + 애니 **196KB** = **340KB** |
| `cactus02` | 1,234 | 806 | 4 | 4 (4.30s) | 69KB | 메쉬 65KB + 애니 49KB = **115KB** |

**glb 파일 크기는 최종 용량과 무관하다.** 임포터가 전부 다시 쓴다.
`cactus01`은 용량의 **58%가 애니메이션**이고, 원인은 순전히 본이 21개라는 점이다(선인장에 3ds Max Biped 전신 리그가 그대로 들어 있다).

---

## 2. 예산 (캐릭터 1종 기준)

| 등급 | 삼각형 | 애니 노드(본) | 클립 | 목표 총량 |
|---|---|---|---|---|
| 잡몹 | **≤ 1,500** | **≤ 12** | 4 | **≤ 200KB** |
| 보스 / 히어로 | **≤ 3,000** | **≤ 24** | 5~6 | **≤ 350KB** |
| 절대 상한 | — | **30** | — | — |

- 삼각형 1개당 약 **53B**. 1,500tri ≒ 80KB.
- 본 1개당 **4클립 기준 약 7.6KB**. 21본 → 12본으로 줄이면 그것만으로 **−85KB**.
- **30본은 엔진 하드 리밋이다.** `JOINT_UNIFORM_CAPACITY = 30` (`cocos/rendering/define.ts:600`) **[확인]**. 초과하면 한 메쉬가 `jointMaps`로 쪼개져 드로우콜이 늘어난다.

---

## 3. Blender 작업 규격

### 3-1. 트랜스폼

| 항목 | 규격 | 이유 |
|---|---|---|
| 단위 | **1 Blender unit = 1m** | |
| 스케일 | 익스포트 전 **Ctrl+A → Apply Scale 필수** | 현재 `cactus01`은 루트 노드에 `_lscale 0.01`이 박혀 있다 **[확인]**. "에셋 크기 = 원시 메쉬 × 루트 스케일"이 되어 추적이 안 된다 |
| 원점 | 바닥 접지물은 **발밑 중심, Y=0** | `efffect2`가 원점을 형상 위쪽에 둬서 전부 땅에 묻혔던 사고 |
| 정면 | **−Z 방향** | `Bullet`에 180° yaw 보정이 들어간 이유 |
| 미러링 | **음수 스케일 금지** → 다른 축 180° 회전으로 | 음수 스케일은 행렬식이 −1이라 와인딩이 뒤집혀, 백페이스 컬링 기반 효과(toon 아웃라인)가 모델 전체를 단색으로 칠한다 |
| 본 스케일 | 1.0 (미세 오차도 정리) | 0.9999998 같은 값이 남으면 scale 트랙을 못 지운다 |

### 3-2. 메쉬

- **정점 웰딩 필수.** 판정 기준: **정점 ÷ 삼각형 ≤ 0.8** (닫힌 메쉬 이론값 0.5)
  - 좋은 예: `cactus01` 0.65 / 나쁜 예: `base2` **2.20** → 288KB 손해 **[확인]**
- **서브메쉬 1개**로 합칠 것 (primitive 2개 = 드로우콜 2배)
- **정점 컬러 금지** — `cactus01`의 `COLOR_0` + `COLOR_1`은 19.8KB 순손실 **[확인]**
- 데시메이트는 **비율이 아니라 삼각형 목표치**로 지정한다. 비율은 재현이 안 되고, 웰딩 안 된 메쉬는 데시메이트해도 정점이 줄지 않는다
- 메쉬 모디파이어(Decimate / Mirror / Subdivision)는 **Blender에서 미리 Apply**한다. 익스포트 옵션 `Apply Modifiers`로 굽지 않는다(4-2절)

### 3-3. 리그 / 애니메이션

- 디폼 본만 남기고 **컨트롤 본·IK 타겟은 익스포트에서 제외**한다. 노드 1개당 클립마다 940B다.
- 애니메이션은 **NLA 트랙**으로 관리. 트랙 1개 = 클립 1개.

**필수 클립 (이름 고정)**

| 클립 이름 | 대상 | 코드 참조 |
|---|---|---|
| `idle` | 캐릭터 | `Monster.ts:76` |
| `move` | 캐릭터 | `Monster.ts:96, 308` |
| `attack` | 캐릭터 | `Monster.ts:249, 287` |
| `dead` | 캐릭터 | `Monster.ts:202-204` |
| `appear` | 구조물·UI | `GuideCompass.ts`, `SocketGuideArrow.ts`, `StructureUpgradeManager.appearClipName` |
| `shot` / `open` | 타워 / 문 | |

> **클립 이름이 틀리면 에러가 나지 않는다.** `SkeletalAnimation.play()`가 조용히 실패해 T포즈로 서 있다가, `getState('dead')`의 널 폴백 때문에 1.5초 뒤 사라진다. **[확인]** 반드시 체크리스트로 잡아야 한다.

- 클립 길이: 액션 **≤ 1.0s**, idle **≤ 1.5s** (용량이 길이에 선형 비례)
- **Blender에서 키프레임을 솎아내도 용량은 줄지 않는다.** Cocos가 원본 키를 버리고 30fps로 다시 굽기 때문이다 **[확인]** — `cactus02 idle`은 원본 샘플러당 평균 10키였는데 컴파일 후 48키가 됐다.
  줄어드는 건 **채널(본 × T/R/S)을 없앨 때뿐이다.**

---

## 4. 익스포트 규격

### 4-1. 확장자: **`.glb` (glTF Binary)** 하나로 통일

| 포맷 | 판정 | 이유 |
|---|---|---|
| **`.glb`** | **표준** | 파일 1개. 메쉬 + 스킨 + NLA 전부 포함. 서브에셋 uuid가 안정적 |
| `.gltf` | 금지 | gltf + bin + 텍스처로 흩어져 관리 지점이 늘어난다 |
| `.fbx` | 비권장 | Cocos가 내부 변환하면서 스켈레톤 이름을 `UnnamedSkeleton-0`처럼 자동 생성한다 **[확인]** — 5장의 uuid 규칙과 정면으로 충돌 |

> 예외: 플레이어처럼 animgraph(블렌드 트리)로 클립을 조합하는 캐릭터는 "메쉬 1파일 + 애니 N파일" 구성이 유리할 수 있다. 몬스터·구조물은 예외 없이 NLA 단일 glb.

### 4-2. Blender glTF 2.0 익스포터 설정

```
[ Format ]
  Format                           : glTF Binary (.glb)

[ Include ]
  Selected Objects                 : ON   (아마추어 + 메쉬만 선택)
  Cameras / Punctual Lights        : OFF
  Custom Properties                : OFF

[ Transform ]
  +Y Up                            : ON

[ Data > Mesh ]
  Apply Modifiers                  : OFF  ← 아래 참조 (Blender 기본값)
  UVs                              : ON
  Normals                          : ON
  Tangents                         : OFF   ← Cocos가 어차피 생성함
  Vertex Colors                    : NONE  ← 정점당 4B 순손실
  Loose Edges / Loose Points       : OFF

[ Data > Material ]
  Materials                        : Export
  Images                           : None  ← 텍스처는 프로젝트 에셋으로 별도 관리
  (Blender 머티리얼의 Backface Culling : ON  ← 7-3절, 반드시)

[ Data > Skinning ]
  Skinning                         : ON
  Export Deformation Bones Only    : ON
  Include All Bone Influences      : OFF   (정점당 본 4개 제한)

[ Animation ]
  Animation Mode                   : NLA Tracks
  Bake All Objects Animations      : OFF
  Optimize Animation Size          : ON
  Force keeping channels for bones : OFF   ← [추론] 아래 참조
  Export all Armature Actions      : OFF
```

> **`Apply Modifiers`는 OFF로 둔다.** 익스포터 소스 확인 결과(`io_scene_gltf2/__init__.py:679`, `blender/exp/nodes.py:297-335`) **[확인]**:
> - 설명문 그대로 **아마추어는 적용 대상에서 제외**된다. Skinning이 켜져 있으면 익스포터가 아마추어 모디파이어를 일시적으로 끄고 평가 메쉬를 뽑는다 → 모디파이어가 아마추어뿐이면 **ON/OFF의 결과가 같다.**
> - 대신 켜면 `to_mesh()` 경로를 타서 **셰이프키(블렌드셰이프)가 익스포트되지 않는다.** 지금은 모프 타겟이 0이라 손해가 없지만, 표정 애니를 넣는 순간 조용히 사라진다.
> - Blender 기본값도 `False`다.
>
> **규칙: 메쉬 모디파이어(Decimate / Mirror / Subdivision)는 Blender에서 미리 Apply해 둔 뒤 내보낸다.** 익스포트 옵션으로 굽지 않는다 — 적용된 결과가 `.blend`에 남아야 정점:삼각형 비율을 원본에서 검사할 수 있다.

> **`Force keeping channels for bones`만 [추론]이다.** 현재 glb는 본 21개 전부에 translation/rotation/scale 63채널이 다 들어 있고(= 이 옵션 ON 상태), 안 움직이는 채널을 빼면 공식상 애니 용량이 **55~60% 줄어든다**(`cactus01` 196KB → 약 80KB). 표준에 확정하기 전 `cactus02`로 1회 비교 검증할 것.

---

## 5. 네이밍 계약 ⚠ 가장 중요

**Cocos의 서브에셋 uuid는 "부모 uuid + 이름의 해시"다.** 실측으로 확정했다. **[확인]**

| 서브에셋 이름 | 해시 id | 나타나는 파일 |
|---|---|---|
| `appear.animation` | `269df` | 3D_arrow, UI_arrow, door1, door2, wall, wall2, tower, tower2 |
| `shot.animation` | `06a9f` | tower, tower2 |
| `attack` / `dead` / `idle` / `move` | `989ed` / `6018c` / `1f586` / `24c9f` | cactus01, cactus02 (동일) |
| `Env_Pla_Fort_WallA01a_2m.material` | `18711` | door2, wall |

파일이 달라도, glTF 인덱스가 달라도 **이름이 같으면 id가 같다.**

### 해도 되는 것

- **NLA 트랙 추가 / 순서 변경** — 기존 클립 이름이 그대로면 uuid가 살아 있다 (door1은 `appear`가 index 0, door2는 index 1인데 둘 다 `269df`)
- **메쉬·애니 내용 교체 후 재익스포트** — 이름만 유지되면 씬 참조가 전부 살아남는다
- `.meta`를 남긴 채 파일 내용만 덮어쓰기

### 하면 안 되는 것

- **클립 이름 변경** — `move` → `run`으로 고치는 순간 `@24c9f`를 참조하던 모든 씬·프리팹이 끊긴다
- **메쉬 데이터블록 이름 변경** — 현재 `Mesh.006/007/008/…`이라는 Blender 자동 이름이 **이미 참조 계약으로 굳어져** 있어 이제 못 고친다
- **머티리얼 이름 변경** — `.glb.meta`에 저장된 머티리얼 오버라이드가 고아가 된다
- 에셋 삭제 후 재생성 (부모 uuid가 바뀐다)

### 신규 에셋 네이밍 규칙 (첫 익스포트 전에 정할 것 — 나중엔 못 고침)

| 대상 | 규칙 | 예 |
|---|---|---|
| 파일명 | `snake_case`, 에셋 식별자 | `mob_slime01.glb` |
| 메쉬 데이터블록 | **파일명과 동일** (`Mesh.008` 같은 자동 이름 금지) | `mob_slime01` |
| 아마추어 | `<파일명>_rig` | `mob_slime01_rig` |
| 머티리얼 | `<파일명>` | `mob_slime01` |
| NLA 트랙 | **고정 어휘만** | `idle` `move` `attack` `dead` `appear` `shot` `open` |
| 무기 노드 | 프로젝트 공통 규약 | 코드가 이름으로 찾아 숨긴다 |

---

## 6. 임포트할 때 Cocos가 하는 일 (참고)

glb 하나를 끌어다 놓으면 다음이 자동으로 일어난다. **[확인]**

1. `.meta` 발급 — 새 uuid, `importer: "gltf"`
2. 서브에셋 분해 — mesh / skeleton / animation(트랙당 1개) / material / prefab(`gltf-scene`). 각각 `<부모uuid>@<이름해시>`
3. **메쉬 재작성** — 정점 인터리브(stride 고정), **탄젠트 생성**, u16 인덱스, `jointMap` 생성(미사용 본 제거: 21 → 19), AABB 계산
4. **애니 변환** — glTF 샘플러 → `ExoticAnimation`(노드별 T/R/S dense Float32Array)으로 **30fps 리샘플**
5. **머티리얼 생성** — `cc.Material`을 만들어 **`.glb.meta`의 `userData.materials`에 통째로 저장**
6. **프리팹 생성** — 노드 계층 + `SkinnedMeshRenderer` + `SkeletalAnimation`
7. 클립별 `span` / `wrapMode` / `sample: 30` 기록
8. 빌드 시 `library/` 파일을 **바이트 그대로** 복사

**씬은 건드리지 않는다.** 재임포트해도 이름이 그대로면 기존 참조는 전부 유지된다.

---

## 7. 머티리얼 규격

### 7-1. Effect 선택 — 프로젝트 최대의 용량 레버

빌드에 실제로 들어간 바이트를 측정한 결과다. **[확인]**

| Effect | 빌드 추가 용량 | 내역 |
|---|---|---|
| **`builtin-unlit`** | **0KB** | `internal` 번들에 항상 포함되어 이미 값을 치렀다 |
| `builtin-toon` | **+660KB** | GLSL 소스 559KB (변이 8종 × vert/frag) |
| `builtin-standard` | **+1,420KB** | GLSL 소스 1,190KB (변이 16종) |

> 현재 씬2 빌드 **5.2MB 중 2.08MB(40%)가 이 두 effect의 셰이더 소스다.** `base2.glb`(713KB)보다 3배 크고, 이 프로젝트에서 가장 큰 단일 항목이다.

**규칙**

- 프로젝트 전체에서 **effect 종류를 2개 이하**로 유지한다 (`builtin-unlit` + 캐릭터용 1종).
- **`builtin-standard` 금지.** 용량이 최악이고, 이 프로젝트·엔진 조합에서 GLSL 컴파일 실패 전력이 있다(reflection-probe 매크로가 `CC_USE_REFLECTION_PROBE[object Object]`로 치환되어 메쉬가 아무것도 안 그려진다. 에셋 레벨에서는 아무 에러도 안 난다).
- 캐릭터에 toon 룩이 꼭 필요하지 않다면 **`builtin-unlit`이 정답이다** — 660KB가 통째로 빠진다.
- 커스텀 셰이더가 필요하면 `legacy/toon`을 포크하지 말 것(3.8.8 엔진 버그로 `surfaces` 청크 기반 effect는 새 에셋으로 등록되는 순간 컴파일 실패). `legacy/unlit` + `#include <legacy/input-standard>`(스키닝 지원) 조합을 쓴다.

### 7-2. toon 머티리얼에서 켜고 끌 것

현재 `cactus01` 머티리얼의 실제 상태를 기준으로 한다.

| 항목 | 값 | 이유 |
|---|---|---|
| `USE_OUTLINE_PASS` | **필요할 때만 ON** | 패스가 하나 늘어 드로우콜·정점 처리가 2배가 된다 |
| pass 0 `rasterizerState.cullMode` | **FRONT (1)** 필수 | `NONE(0)`이면 확대된 아웃라인 셸의 앞면까지 그려져 **모델 전체가 아웃라인 색으로 칠해진다** |
| `USE_BASE_COLOR_MAP` | ON | |
| `USE_1ST_SHADE_MAP` / `USE_2ND_SHADE_MAP` | ON, 단 **mainTexture와 같은 텍스처 지정** | 텍스처를 1장으로 유지. 톤 분리가 필요할 때만 별도 맵 |
| `USE_NORMAL_MAP` | **OFF** | 텍스처 1장 추가 + 탄젠트 의존 |
| `USE_EMISSIVE_MAP` / `USE_ALPHA_TEST` | OFF (필요할 때만) | 셰이더 변이가 늘면 빌드 용량이 는다 |
| Technique | **0 (opaque)** | 알파가 정말 필요할 때만 1(transparent) |
| `specular` | a = 76 | 현재 값 |

- **머티리얼 프로퍼티(텍스처·색·스칼라)는 `.glb.meta`에 영구 저장된다.** 별도 `.mtl`을 만들 필요가 없다.
- 별도 `.mtl`이 필요한 경우는 둘뿐이다: **(a)** effect 자체를 바꿔야 할 때, **(b)** `cullMode`처럼 인스펙터가 노출하지 않는 pass 상태를 고쳐야 할 때.

### 7-3. Blender 머티리얼 설정 (익스포트 전)

- **Backface Culling: ON 필수.** 꺼진 채로 내보내면 glTF 임포터가 생성 머티리얼의 **모든 pass의 `cullMode`를 `NONE(0)`으로** 만들어, effect 자신의 기본값(아웃라인 패스는 `FRONT`)을 조용히 덮어쓴다 → 모델이 단색으로 칠해진다. `3D_arrow.glb`에서 실제로 발생했다.
- 머티리얼은 캐릭터당 **1개**.
- 이미지 텍스처 노드는 연결해두되 **익스포트에는 포함하지 않는다**(Images: None).

### 7-4. 텍스처

| 항목 | 규격 | 근거 |
|---|---|---|
| 해상도 | 캐릭터 **128×128**, 최대 256² | 현재 `cactus01/02` = 128², 각 6~8KB |
| 2의 제곱 | **필수** | WebGL 1.0은 NPOT에 `repeat` 랩·밉맵을 못 쓴다 |
| 포맷 | PNG-8 (팔레트) | 현재 캐릭터 텍스처 전부 P 모드 |
| 알파 | 불필요하면 채널 제거 | |
| 장수 | 캐릭터당 **1장** | shadeMap1/2도 같은 텍스처 재사용 |
| 임포트 설정 | `mipfilter: none`, `anisotropy: 0`, `filter: linear`, `wrap: repeat` | 프로젝트 전체 관행 |
| 모델 임베드 | **금지** | 현재 glb 전부 `images: 0` — 잘 지켜지고 있다 |

---

## 8. 씬 / 프리팹 배치 규격

| 컴포넌트 | 프로퍼티 | 값 | 이유 |
|---|---|---|---|
| 노드 | `layer` | **DEFAULT (1073741824)** | UI_2D로 두면 3D 카메라에 안 그려진다. 반대로 UI를 DEFAULT로 두면 거대한 체력바 버그가 난다 |
| 노드(루트) | `scale` | **1** | 현재 `cactus01`은 0.01 (Blender 100배) |
| `SkinnedMeshRenderer` | `shadowCastingMode` | **0 (OFF)** — 잡몹 | 몬스터 그림자가 렉의 원인이었다. 대신 `MonsterShadow` 프리팹(알파 텍스처 판때기)을 쓴다 |
| `SkinnedMeshRenderer` | `shadowReceivingMode` | 1 (ON) | |
| `SkinnedMeshRenderer` | `enableMorph` | 모프 없으면 OFF | 현재 모든 캐릭터 `targets: 0` |
| `SkeletalAnimation` | `useBakedAnimation` | **false** | animgraph 사용 시 필수 |
| `SkeletalAnimation` | `playOnLoad` | false | 코드가 제어 |
| — | Collider | **붙이지 말 것** | 물리 모듈 전부 비활성. 판정은 `VirtualWall` 등 자체 구현 |

### 임포트 직후 손으로 해야 하는 설정 (자동 아님)

- 클립별 **`wrapMode`**: `dead` = **Normal(1)**, 나머지(`idle` / `move` / `attack`) = **Loop(2)**
- 캐릭터 머티리얼을 `builtin-standard`에서 목표 effect로 교체
- 아웃라인을 쓸 경우 pass 0 `cullMode` 확인

---

## 9. 임포트 체크리스트

기계로 판정 가능한 항목만 모았다 — 문서가 아니라 스크립트로 만들 것.

**glb 원본 검사**

- [ ] 삼각형 수가 등급 예산 이내인가 (잡몹 1,500 / 보스 3,000)
- [ ] 정점 ÷ 삼각형 ≤ 0.8 인가 (웰딩)
- [ ] 스킨 조인트 ≤ 30 인가 (하드 리밋), 예산(12 / 24) 이내인가
- [ ] `COLOR_0` / `COLOR_1` 이 없는가
- [ ] `TANGENT` 를 내보내지 않았는가
- [ ] 임베드 이미지가 0장인가
- [ ] 서브메쉬(primitive)가 1개인가
- [ ] 필수 클립 `idle` `move` `attack` `dead` 가 **이름까지 정확히** 있는가
- [ ] 클립 길이가 상한 이내인가 (액션 1.0s / idle 1.5s)
- [ ] 루트 노드 스케일이 1인가 (Apply Scale 누락 탐지)
- [ ] 어느 노드에도 음수 스케일 성분이 없는가
- [ ] 메쉬 / 아마추어 / 머티리얼 이름이 `Mesh.NNN`·`UnnamedSkeleton-N` 같은 자동 이름이 아닌가
- [ ] 모프 타겟이 0인가

**임포트 후 검사**

- [ ] `.glb.meta`의 머티리얼 effect가 `builtin-standard`가 아닌가
- [ ] 아웃라인 패스를 쓴다면 pass 0 `cullMode == 1` 인가
- [ ] `dead`의 `wrapMode == 1`, 나머지 `== 2` 인가
- [ ] 기존 서브에셋 id가 전부 유지됐는가 (재익스포트 시 — 이름 변경 탐지)
- [ ] 계산 용량이 등급 예산 이내인가 (1장의 공식으로 산출)

---

## 10. 절대 금지 목록

1. **`builtin-standard` 사용** — +1.4MB + 컴파일 실패 전력
2. **클립 / 메쉬 / 머티리얼 이름 변경** — 씬 참조 즉사
3. **에셋 삭제 후 재생성** — uuid 변경. 교체는 `.meta`를 남기고 내용만 덮어쓴다
4. **에디터 밖(탐색기)에서 에셋 이동·삭제** — `library`에 유령 uuid가 남아 빌드가 `Error 3702`로 멈춘다. 반드시 Assets 패널에서
5. **음수 스케일 미러링** — 와인딩 반전 → 모델이 단색으로 칠해짐
6. **Blender Backface Culling OFF** — 동일 증상, 다른 원인
7. **정점 컬러 익스포트**
8. **NPOT 텍스처** (WebGL 1.0)
9. **캐릭터에 Collider 부착** — 물리 모듈 비활성
10. **`legacy/toon` 포크** — 3.8.8 엔진 버그로 컴파일 실패

---

## 11. 현재 에셋 대비 개선 항목

| 대상 | 문제 | 예상 절감 |
|---|---|---|
| 프로젝트 전체 | `builtin-standard` effect 포함 | **−1,420KB** |
| 프로젝트 전체 | toon이 꼭 필요한 에셋만 남기고 unlit 전환 | 최대 −660KB |
| `cactus01` | 본 21개 → 12개 | −85KB |
| `cactus01` | 정점 컬러 2종 제거 | −20KB |
| 캐릭터 전체 | 안 움직이는 본 채널 제거 **[추론]** | 애니의 55~60% |
| `base2.glb` | 정점:삼각형 2.20 (웰딩 안 됨) | −288KB |

---

## 12. 미확인 항목 (다음에 확인할 것)

- **[미확인]** 클립의 `sample: 30`을 에디터 인스펙터에서 24fps 등으로 낮출 수 있는가. 가능하면 애니 용량의 리샘플 부분이 비례해서 준다.
- **[미확인]** Mesh 서브에셋 인스펙터에서 Tangents를 `exclude`로 설정할 수 있는가. 가능하면 정점당 16B.
- **[추론]** Blender `Force keeping channels for bones` OFF의 실제 효과 — `cactus02`로 1회 비교 검증 필요.

*(이번 조사 시점에 `cocos-creator` MCP 서버가 연결 실패 상태라 에디터 UI 쪽은 확인하지 못했다.)*

---

## 부록. 검증 경로

| 주장 | 확인 방법 |
|---|---|
| 정점 stride 48 / 72 / 76B | `library/<uuid>@<mesh>.json`의 `vertexBundles[0].view.stride`를 모델 39개 전수 조회 |
| 서브에셋 id = 이름 해시 | 모델 10개의 `.glb.meta` `subMetas`를 교차 대조 (`appear` → `269df` 8회 일치) |
| 30fps 리샘플 | 컴파일된 CCON 클립을 MessagePack 디코딩해 `TypedArrayRef.length`와 원본 glTF 샘플러 키 수를 비교 |
| effect 용량 | 빌드 `assets/main/import/**.json`에서 2KB 초과 문자열(GLSL 소스) 합산 |
| `JOINT_UNIFORM_CAPACITY = 30` | 엔진 소스 `cocos/rendering/define.ts:600` |
| WebGL 1.0 전용 | `settings/v2/packages/engine.json`의 `gfx-webgl2: false` |
| 빌드 = library 바이트 동일 | `np_project_1/scene2_kr/Pangle/assets/main/import/`와 `library/` 파일 크기 대조 |
