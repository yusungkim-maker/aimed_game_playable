# AGENTS.md

Cocos Creator **3.8.8** 프로젝트. 탑다운 러쉬 디펜스 **플레이어블 광고**.

**이 프로젝트의 목적은 광고 하나가 아니라 "광고를 계속 찍어내는 재사용 모듈 라이브러리"다.**
그래서 아래 규칙 대부분은 "이 씬에서 동작하게 만들기"보다 "다음 광고에서도 그대로 쓰이게 만들기"를 위한 것이다.

- 씬 1 = `assets/scenes/scene.scene` (비대칭 오각형 맵, 6갈래 경로, 팔로워 생산)
- 씬 2 = `assets/scenes/xp_np.scene` (정팔각형 요새, 8방향, 코인 운반자, 돌 업그레이드 연출)
- **스크립트는 한 벌을 두 씬이 공유한다.** 씬별로 다른 것은 씬 파일의 노드 구성과 인스펙터 값뿐이다.

---

## ⚠️ 그림자 — 수정 완료, 빌드 출고됨 (2026-09-14)

2026-09-11에 "증상 미확인"으로 열려 있던 그림자 이슈는 **증상 2건 모두 원인을 확정해 수정**했고, 사용자가 그 상태로 **EN 전환 + 빌드까지 마쳤다.** 추가 증상 보고는 없다.

| 증상 | 원인 (확인함) | 수정 |
|---|---|---|
| 가짜 그림자가 발밑이 아니라 **스폰 지점에 멈춰 있다** | 몬스터 루트의 `SkeletalAnimation`(baked)이 `start()`에서 **직계 자식 전부**에 `isSkipTransformUpdate = true`를 찍는다 → `invalidateChildren`이 그 노드와 하위 트리를 건너뛰어 월드 행렬이 다시 안 올라간다 | `MonsterShadow.update()`에서 플래그를 1회 해제 후 자기 자신을 `enabled = false` |
| **피격 시 그림자도 하얗게 번쩍인다** | `Monster.onLoad`의 `getComponentsInChildren(MeshRenderer)`에 그림자 판이 같이 걸렸다 | `Monster.onLoad`에서 `MonsterShadow` 트리에 속한 렌더러를 제외 |

항구적 교훈은 아래 **엔진 함정**(스켈레톤 자식 트랜스폼 동결)과 **코드 컨벤션**(캐릭터 그림자 기본 방식)으로 옮겼다.

**아직 눈으로 맞춘 적 없는 값 (추론)**: `heightOffset` 0.02의 z-fighting 여부 / 판 크기가 발밑과 맞는지 / `shadowDistance 30`이라 맵 외곽 산 그림자가 잘리는지. 조정은 `assets/prefabs/MonsterShadow.prefab`에서.

**되돌리려면**: `MonsterSpawner.fakeShadowPrefab`을 비우면 가짜 그림자가 무동작으로 복귀(코드 변경 불필요). 동적 그림자는 `monsterCastShadow`/`csmLevel`/`shadowDistance` 세 값 복원.

*이 절은 위 "추론" 항목까지 눈으로 확인되면 삭제한다.*

---

## ✅ FBX 임포터 장애 — 캐릭터 복구 완료, 정리만 남음 (2026-09-16)

2026-09-16 10:19 부팅에서 **`fbx` 에셋 핸들러 하나만 등록 목록에서 누락**되어, asset-db가 프로젝트 `.fbx` 59개 + **에디터 내장 `primitives.fbx`**를 폴백 임포터 `*`로 덮었다. 메시·스켈레톤·클립 서브에셋이 전부 소멸 → 씬 1·2·3 캐릭터 동시 실종.

**해결: 원인 복구가 아니라 `.fbx` → `.glb` 전면 전환으로 의존 자체를 제거했다.** 세 씬 모두 캐릭터 복구를 눈으로 확인했다.

> 📄 **전체 분석: `바탕화면/cocos creator practice/FBX임포터_장애분석_2026-09-16.md`** — 원인 사슬, 배제한 가설 12개, 남은 가설 4개, 방안 비교가 전부 거기 있다.

**핵심 사실 (재발 시 여기부터)**
- 결정적 증거는 `temp/asset-db/log/`의 **세션 간 diff**였다: `grep -a -o "lazy register asset handler [a-z-]*" <로그> | sort -u` → 9/15(정상) 54개에 `fbx` 포함 / 9/16(사고) 53개에서 `fbx`만 누락. **`project.log`보다 이 로그가 정보량이 많다.**
- **`.glb`는 무피해.** Cocos에서 fbx는 `FBX-glTF-conv.exe`를 거치는 2단 경로, glb는 1단이다. "캐릭터만 사라졌다"는 플레이어만 fbx였기 때문.
- **재시작으로 안 풀렸다.** 원인(`registerGltfFbxHandler`가 importer를 공급 못 한 이유)은 **끝내 못 밝혔다.** `.ccc`가 암호화라 소스 확인 불가.

**✅ 잔재 삭제 완료 (2026-09-16).** 구 `.fbx` 59개 + `.bak` 10개를 MCP `asset_operations delete`로 전부 지웠다. 삭제 전 규칙 7대로 uuid 전수 검색해 **참조 0건**을 확인했고, 삭제 후 `assets/`에 fbx·meta·bak이 **0개** 남은 것을 실측했다.

**🔲 남은 일 1가지**
1. **에디터 내장 `primitives.fbx`는 여전히 깨진 상태다.** Box/Sphere/Plane/Quad 등 **기본 도형을 쓸 일이 생기면 에디터 재설치**가 필요하다. 프로젝트 `temp/`·`library/` 삭제로는 복구되지 않는다. (실측 2026-09-16: 이 파일의 `.meta`는 `subMetas`가 **0개**다.)

**부팅 에러는 아직 남아 있다** — `temp/logs/project.log`의 `register asset-handler fbx failed`는 **12:25 부팅 시점 기록**이라 삭제해도 사라지지 않는다. **에디터를 재시작해야** 0건이 된다. 재시작 후 0건을 확인하면 이 절을 지운다.

**되돌리기**: 원본 `.fbx` 59개 + `.meta` 59개를 `바탕화면/fbx_meta_backup_2026-09-16/`에 **함께** 보관(20MB). 리맵 전 `.bak` 10개와 변환본은 스크래치패드.

---

## 📦 캐릭터 에셋 = glb (2026-09-16 전환 완료)

**`.fbx`를 다시 들이지 않는다.** 캐릭터·애니메이션은 전부 `.glb`다.

| 위치 | 개수 | 용도 |
|---|---|---|
| `NPC_Summon/Mesh/NPC_TTSummon_001_Mesh.glb` | 1 | **씬 1·2** 캐릭터 메시 |
| `NPC_Summon/Animation/` | 5 | 씬 1·2 클립 (`Idle` `Move` `One_BT_Attack01/Idle/Move`) |
| `tycoon/models/` | 4 | **씬 3** 메시 + `Axe_Attack01/Idle/Move` |
| `Bob_new/animation/` | 41 | 모션 라이브러리 (미참조, 보관용) |

- 씬 1·2와 씬 3은 **메시 에셋이 따로다**(uuid 별개). 근본은 같지만 머티리얼을 씬별로 분기 관리하기 때문 — 사용자 지시(2026-09-16).
- **규칙 9 위반을 이때 고쳤다.** 씬 3이 쓰던 `Axe_*` 클립 3개가 공유 폴더 `NPC_Summon/Animation/`을 보고 있었다 → `tycoon/models/`로 분기했다. (반대로 `tycoon/models/`에 있던 `@Idle` `@Move` `@One_BT_Attack01`은 아무도 안 쓰던 오배치라 버렸다.)
- **fbx를 glb로 바꿔야 할 일이 또 생기면**: 에디터 번들 변환기 `…/app.asar.unpacked/node_modules/@cocos/fbx-gltf-conv/bin/win32/FBX-glTF-conv.exe`로 `.gltf` 변환 → **애니메이션 이름을 프로젝트가 쓰던 split 이름으로 패치**(원본 take 이름은 `Take 001`이라 그대로 두면 코드·애니그래프가 조용히 깨진다) → glb 패킹. 스크립트는 스크래치패드의 `convert_all.js` / `build_remap.js` / `apply_remap.js` 참조.
- 서브에셋 id는 **클립 이름에서 결정**되므로 재생성해도 같은 값이 나온다(실측: 8/8 일치). 바뀌는 건 부모 uuid뿐이라 리맵이 단순하다.
- **`.bak` 같은 임시 파일을 `assets/` 안에 만들지 말 것** — 에디터가 에셋으로 등록해버려 삭제도 Assets 패널을 거쳐야 한다. 백업은 프로젝트 밖에 둔다.

---

## 🗂 assets 폴더 구조 (2026-09-16 정리)

최상위에 흩어져 있던 낱개 `glb` 37개와 씬 3개를 용도별로 묶었다. **이동은 전부 MCP `asset_operations move`(= 에디터 경유)로 했고, uuid가 보존되므로 참조는 하나도 끊기지 않았다**(실측: 이동 후 씬·프리팹의 미해결 참조 증가 0건, 서브에셋 `library` 컴파일본 148개 전부 정상).

```
assets/
  scenes/     scene.scene(씬1) · xp_np.scene(씬2) · tycoon.scene(씬3)
  models/
    env/      tree rock rock1~3 cactus01/02 ground
    build/    base base2 tower tower2 wall wall2 door1 door2
    props/    coin coin_ground socket socket_large socket_mini
    fx/       3D_arrow efffect1 efffect2 monster_shadow
    cards/    plane2x2 plane2x2_ground        ← 2D 카드 모듈(규칙 9 예외)
  _unused/    어디서도 참조되지 않는 glb 9개를 격리(삭제 아님)
  Bob_new/ NPC_Summon/ UI/ audio/ effects/ prefabs/ scripts/ texture/ tycoon/
```

- **`tycoon/`은 손대지 않았다** — 규칙 9(씬 3 단방향 격리). 씬 3 전용 사본은 전부 그 안에 그대로 있다.
- `_unused/` 9개: `Line_dot_cir` `Line_dot_sq` `apple` `ground_asset` `start` `startpoint` `sword` `table` `wood`. **지우지 않은 이유**는 나중에 쓸 수 있어서고, 빌드에는 어차피 씬이 참조하는 것만 들어가므로 용량에는 원래 영향이 없다.
- **경로가 바뀌었으므로 문서의 경로 표기도 함께 고쳤다**(이 파일 + `docs/cocos-notes/`). 앞으로 씬 경로는 `db://assets/scenes/...`다.

**🔴 에셋을 옮기면 `profiles/v2/packages/`의 빌드 프로필에 구 경로가 남는다.** 씬·프리팹 참조는 uuid라 안 깨지지만, 빌드 태스크 설정은 `scenes: [{url, uuid}]` 형태로 **경로와 uuid를 둘 다** 들고 있어서 `url`만 옛것으로 남는다. 권위 필드는 `uuid`(그리고 `startScene`도 uuid)라 빌드 자체는 돌지만, 불일치를 남기지 않도록 같이 고쳤다 — 2026-09-16에 `builder.json` 45건 + `web-mobile.json` 1건. **에셋을 재배치하면 이 두 파일을 반드시 같이 확인하라.**

## ✅ `undefined` 파일명 오염 사고 — 원인 확정·완전 복구 (2026-09-16)

씬 1·2에서 **바닥 `ground_dirt`와 안개 `ground_fog`가 미싱 노드로 떠 있었다.** 2026-09-10경 어떤 배치 처리가 **`${이름}${확장자}` 형태로 파일명을 만들면서 확장자가 `undefined`로 들어간** 것이 원인이다(이름 쪽까지 엉킨 사례 있음). 오늘 작업과는 무관하다 — 9/10 커밋의 빌드 산출물에는 넷 다 정상으로 들어 있고, 9/16 10:39 asset-db 로그에 이미 임포트 실패가 찍혀 있다.

| 피해 | 결과 |
|---|---|
| `ground_fog.glb` → `door1undefined` | **바이너리 glb인데 `.meta` importer가 텍스트 `gltf`** → `Unexpected token 'g', "glTF…" is not valid JSON`으로 **항상 임포트 실패** |
| `ground_fog.png` → `ground_fogundefined` | importer가 `image`라 **정상 임포트됨**(확장자 없어도) — 에셋 종류에 따라 결과가 갈린다 |
| `ground_dirt.glb` / `.png` | 파일과 `.meta`가 **통째로 삭제** |

**복구 완료.** 전부 `models/env/`·`texture/`에 원래 이름으로 돌아왔고 **`undefined`가 든 파일은 0건**이다. 복구처는 아래 "진실은 어디에 있나"의 `testproject/` 항목.

**`ground_rock`은 모델이 없다** — `StructureUpgradeManager._swapGroundTexture()`가 런타임에 **`ground_dirt` 노드**의 머티리얼 인스턴스 `mainTexture`를 `ground_rock.png`로 갈아끼운다(`revealNamePrefix = "ground_dirt"`, `searchRoot=null`이라 **씬 루트 직계**만 훑는다). 즉 **돌 바닥 = ground_dirt 메시 + ground_rock 텍스처**라, ground_dirt 하나가 사라지면 흙과 돌이 동시에 사라진다. 재배치할 때 ① 이름이 `ground_dirt`로 시작 ② 씬 루트 직계 ③ 머티리얼에 `USE_ALBEDO_MAP` 켜짐 — 셋 다 맞아야 한다(3번이 꺼져 있으면 `setProperty('mainTexture')`가 화면에 반영되지 않는다).

**임포트 로그의 `color doesn't allow set 1`은 `cactus01.glb`다** — 이 메시가 `COLOR_0`과 `COLOR_1` 두 컬러 세트를 갖고 있어 임포터가 두 번째를 거부하며 내는 에러다. **메시 자체는 정상 임포트된다**(서브에셋 `library` 존재 확인). 용량을 줄일 때 `COLOR_1`을 빼면 이 로그도 사라진다.

---

## ▶ 다음 세션에서 바로 할 일

**다음 세션 주제: 씬 3(타이쿤) 이어서 제작** — 사용자 지시(2026-09-16).

### 0. 2026-09-16 세션에서 끝난 것 (다시 손대지 말 것)

- ✅ **fbx 잔재 삭제** — 구 `.fbx` 59개 + `.bak` 10개 제거, 참조 0건 확인.
- ✅ **`assets/` 폴더 재배치** — 아래 "🗂 assets 폴더 구조" 절 참조. **씬 경로가 `assets/scenes/`로 바뀌었다.**
- ✅ **`undefined` 파일명 오염 복구** — `ground_dirt`·`ground_fog` 완전 복구, 씬 1·2 저장까지 마쳤다. 위 전용 절 참조.
- 🔲 **에디터 재시작 후 `register asset-handler fbx failed`가 0건인지만 한 번 확인**하면 그 절을 지울 수 있다.

### 1~5. 아래는 2026-09-15 마감 시점 항목 (그대로 유효)

**모두 "화면으로 봐야만 판단 가능"한 것들이다 — 코드·에셋 쪽 작업은 끝나 있다.** 사용자 확인 결과에 따라 갈린다. **씬 3 제작을 이어가기 전에 이 5개의 확인 결과부터 사용자에게 묻는다.**

1. **테스트용 임시값 정리** — 씬 3 `(-6,0,-2)`의 `plane2x2_ground` 테스트 카드에 `normalOffset2 = 0.25`가 **동작 확인용**으로 들어가 있다. 확인 끝났으면 0으로.
2. **카드 톤 통일 여부 결정** — 지금 ground 카드만 ACES 톤매핑을 건너뛰어 **기존 카드 5장과 색감이 다르다.** 통일하려면 `assets/texture/TextureCard.mtl`을 `TextureCardOffset.effect`로 갈아타면 된다(오프셋 기본 0이라 나머지 동작 동일). 아니면 ground 카드의 `CARD_BYPASS_TONE_MAPPING` 체크를 끈다.
3. **걸음 바운스 튜닝** — `Player`의 `CharacterBob`. 프리뷰로 걸어보고 발 디딤과 어긋나면 `사이클당 걸음 수`(현재 2)와 `위상 오프셋`부터. 어색하면 접근 자체를 재검토(클립에 키 삽입).
4. **통나무 드롭 마감** — `CoinPool`의 `착지 Y 위치 0.07`(코인 두께 기준이라 통나무가 묻힐 수 있음), `자전 속도 180`(통나무가 팽이처럼 돌면 낮추거나 0).
5. **일꾼 운반 동작 확인** — `CoinCourierManager.routes`가 **빈 배열**이라 운반자가 안 돌 수 있다. 배열은 MCP로 못 쓰므로 인스펙터에서 채워야 한다.

**보류 중(사용자 입력 대기)**: Bob_new 캐릭터 교체 — 아래 "씬 3 현재 상태" 참조.

---

## 🔧 진행 중 — 2D 카드 시스템 (2026-09-15, 씬 3에서 작업 중)

배경 장식을 3D 메시 대신 알파 PNG 판으로 대체하는 작업. 개념·규칙은 아래 **코드 컨벤션**의 "2D 카드" 항목에, 공유 자산 예외는 **절대 규칙 9**에 적어뒀다. 여기는 **끝나지 않은 것만** 적는다.

**완료 (검증됨)**
- `assets/scripts/TextureCard.ts` — 텍스처를 꽂으면 원본 픽셀 비율대로 노드 스케일을 맞추는 컴포넌트.
- `assets/texture/TextureCard.mtl` — 공유 머티리얼. `builtin-unlit` **기법 1(transparent)** + `USE_ALPHA_TEST` + `alphaThreshold 0.01`. 반투명 그림자가 그려진 PNG를 쓰기 때문에 컷아웃(기법 0)이 아니라 transparent다(사용자 결정). 0.01은 완전 투명 픽셀만 버려 오버드로를 줄이려는 값.
- `assets/prefabs/plane2x2.prefab` — 사용자가 에디터에서 제작. `픽셀/유닛 = 75`. 씬 3에 카드 5개 배치됨, 스케일 정상.

**~~미완료 2~~ — 해결·검증됨 (2026-09-15).** 새로 인스턴스화해도 스케일이 0.0133으로 박히지 않는다. 텍스처 미로드 시 계산을 미루는 가드가 동작한다(`plane2x2_ground`를 실제로 인스턴스화해 정상값 2.667/1.688이 즉시 잡히는 것을 확인).

**~~미완료 1~~ — 전제가 틀렸다. `plane2x2_ground`는 노드 2개가 아니라 서브메시 2개다 (2026-09-15 재익스포트본 실측).**
glb JSON 청크 파싱 결과: **노드 `Plane.003` 1개 / 메시 `Plane.025` 1개 / primitive 2개**(prim0 → material `ground`, prim1 → material `building`). Blender에서 오브젝트 1개 + 머티리얼 슬롯 2개로 만들어졌다. 서브메시마다 버텍스 번들이 따로다(각 4정점)라 `readAttribute(i)`로 판별 정점을 바로 읽을 수 있다.
→ **결론: 판별 독립 크기 조정은 구조상 불가능하다.** `TextureCard`는 자기 노드 스케일을 바꾸는데 노드가 하나뿐이다. 대신 아래 3개 기능으로 해결했다. 판별로 따로 키워야 하는 요구가 다시 생기면 **Blender에서 오브젝트 2개로 분리해 재익스포트**하는 것 외에 방법이 없다.

**판 2장 메시 실측** (스케일·오프셋 계산의 근거라 지우지 말 것)
```
prim 0 (ground)   x[-1,1]  y[0,0]           z[-1.414,+1.414]   2.0 × 2.828  바닥에 평평
prim 1 (building) x[-1,1]  y[0.0002,1.414]  z[-0.0003,+1.414]  2.0 × 2.0    45° 기울기
맞닿은 선 = y0,z0 = 노드 원점  →  스케일이 원점 기준이라 확대·축소해도 안 떨어진다
```

**`TextureCard.ts`에 추가된 프로퍼티 4종** (전부 기본값이 기존 동작과 같아 배치된 카드 5장은 무영향 — 규칙 5)

| 프로퍼티 | 기본 | `plane2x2_ground` | 역할 |
|---|---|---|---|
| `texture2` | null | 두 번째 이미지 | 머티리얼 **슬롯 1**에 `mainTexture`를 꽂는다. 슬롯마다 `MaterialInstance`가 따로라 사본별로 독립 |
| `sizeSubMeshIndex` | 0 | 0 (바닥 판) | 어느 판의 실측 크기로 스케일을 정할지. 서브메시 2개 이상일 때만 `readAttribute` 경로를 탄다 |
| `heightCompensation` | 1 | **√2** | 세로 스케일 보정. 카메라가 `euler(-45,45,0)` 오소라 **45°로 기운 판은 정면으로 보여 보정 불필요(=1)**, `plane2x2_ground`는 바닥 판이 cos45로 눌리고 기운 판은 기준(2.828)보다 자기 길이(2.0)가 √2 짧아 **서로 다른 이유로 같은 √2**가 필요하다 |
| `normalOffset` / `normalOffset2` | 0 / 0 | 튜닝값 | 각 판을 **자기 법선 방향으로만** 미는 거리(월드 단위). 아래 참조 |

**법선 오프셋은 셰이더로 한다 — 노드가 하나라 트랜스폼으로는 불가능하다.**
`assets/texture/TextureCardOffset.effect` + `TextureCardOffset.mtl`을 새로 만들었다(builtin-unlit transparent 기법을 옮기고 `normalOffset` 유니폼 추가, 버텍스에서 `worldPos += normalize(matWorld*a_normal) * normalOffset`). **로컬이 아니라 월드에서 더하는 이유**는 로컬이면 노드 스케일(2~3배)이 곱해져 같은 숫자가 카드마다 다른 거리로 움직이기 때문이다. 비균등 스케일인데도 역전치가 필요 없는 이유는 y·z 배율이 항상 같고 두 판의 법선이 모두 x=0이라서다.
**기존 `TextureCard.mtl`(builtin-unlit)은 그대로 뒀다** — 배치된 카드 5장은 이 유니폼이 없다. 그래서 `_setNormalOffset()`이 `Pass.getHandle('normalOffset') === 0`으로 지원 여부를 검사하고 없으면 건너뛴다. **이 검사를 빼면 에디터 `update()`가 매 프레임 도는 탓에 콘솔이 경고로 뒤덮인다.**

**🔴 2D 카드가 "밝고 색이 날아가" 보이는 원인은 조명이 아니라 ACES 톤매핑이다.**
unlit은 애초에 조명을 안 받는다. 범인은 출력 경로다 — `legacy/output-standard.chunk`의 `CCFragOutput`이 `CC_USE_HDR && CC_TONE_MAPPING_TYPE == HDR_TONE_MAPPING_ACES`일 때 **unlit에도 ACES 필름 커브를 먹인다.** 씬이 `PostSettingsInfo._toneMappingType = 0`(= `ToneMappingType.DEFAULT` = ACES)이고 HDR이 켜져 있어 해당된다. ACES는 밝은 쪽을 눌러 붙이며 채도를 빼므로 "그린 그림 그대로"가 목적인 2D 카드에는 맞지 않는다.
→ `TextureCardOffset.effect`에 **`CARD_BYPASS_TONE_MAPPING`** 매크로를 두고 ACES 분기만 뺀 출력 함수를 쓴다(RGBE·float 출력 분기는 원본 유지). `TextureCardOffset.mtl`에서 켜져 있다.
**아직 안 맞춘 것**: 기존 카드 5장은 `TextureCard.mtl`(builtin-unlit)이라 여전히 ACES가 걸린다 → **지금은 카드마다 톤이 다르다.** 통일하려면 `TextureCard.mtl`도 이 이펙트로 갈아타면 된다(오프셋 기본 0이라 나머지 동작은 동일). 사용자 확인 대기 중.
또 하나의 밝기 요인: 두 머티리얼 모두 `mainColor`가 순백이 아니라 **211,211,211**이다(선형에서 약 0.65 곱). 원본 그대로 내려면 255로.

**남은 확인 (화면으로만 가능, 제가 못 봄)**: 테스트 카드가 `(-6,0,-2)`에 있고 `normalOffset2 = 0.25`가 **테스트용으로 들어가 있다** — 확인 후 0으로 되돌리거나 조정할 것.

---

## 씬 3 현재 상태 (2026-09-15 작업분)

**캐릭터**
- **머티리얼이 PBR로 전환됐다.** `T_Body.mtl` = **`legacy/standard`**(`1baf0fc9-…`) + `USE_NORMAL_MAP` + `USE_ALBEDO_MAP`, 텍스처는 `Bob_new/texture/bob_base.png` + `bob_normal.png`. 이게 가능해진 건 `bakeSettings` 손상을 고쳤기 때문이다(위 엔진 함정 참조).
  - ~~`builtin-standard`~~ — **틀린 기록이었다(2026-09-16 실측 정정).** `builtin-standard`는 `c8f66d17-…`로 다른 파일이고, 씬 3에서 그걸 쓰는 건 `T_Axe.mtl` 쪽이다. 둘 다 PBR이라 결론은 안 바뀐다.
  - 참고: **씬 1·2의 캐릭터는 툰이다** — `NPC_Summon/Material/bob01.mtl` = `legacy/toon`(`a7612b54-…`) + `USE_OUTLINE_PASS` + 2단계 셰이드. `Player`·`Follower`·`Worker`가 이 한 장을 공유한다. 씬 3만 PBR로 갈아탄 상태다.
- **발밑 막대기 제거** — 몸통 메시에 join된 지오메트리였고 `Bone_Stick` 스케일을 0으로 죽였다. `tycoon.scene` / `T_Player.prefab` / `T_Worker.prefab` 3곳 모두 적용.
- **발밑 가짜 그림자 적용** — `Player` 자식에 `MonsterShadow` 노드. 규칙 9대로 `tycoon/models/monster_shadow.glb` + `tycoon/prefabs/T_MonsterShadow.prefab`으로 분기했다. 몬스터가 겪었던 두 함정(트랜스폼 동결 / 피격 번쩍임)은 **Player에는 해당 없음을 확인**했다 — `_useBakedAnimation=false`라 동결 플래그가 안 서고, `Player.ts`에 자식 렌더러 일괄 조작 코드가 없으며, `FollowerGhostState`는 `SkinnedMeshRenderer`만 순회해 일반 `MeshRenderer`인 그림자는 안 걸린다.
- **석궁(`crossbow001`)은 원래부터 `_enabled=false`다.** 내가 끈 게 아니다 — 건드리지 말 것. 애니그래프가 `Axe_*` 클립만 재생해 `Bone_CrossBow`를 구동하지 않으므로, 켜면 발밑에 굴러다닌다.

**자원 비주얼 — 코인에서 통나무로 전량 교체**
자원 비주얼은 **코드가 아니라 인스펙터 값**이다(`Choppable.ts` 주석에 그렇게 적혀 있다). 씬에 남은 `T_Coin` 참조는 0건이고 세 군데 모두 `T_Wood.prefab`을 본다.

| 위치 | 프로퍼티 |
|---|---|
| 플레이어 등 뒤 | `CoinStack.stackCoinPrefab` |
| 일꾼 등 뒤 | `CoinCourierManager.backStackCoinPrefab` |
| 땅에 떨어지는 드롭 | `CoinPool.coinPrefab` |

🔴 **크기는 반드시 프리팹의 *자식* 노드에서 준다.** `T_Wood.prefab`은 루트 1 / 자식 `wood` 0.3이다. `Coin.ts._updatePop()`이 팝 연출로 **루트 노드 스케일을 0→1로 애니메이션하며 1.0으로 끝내기** 때문에, 루트에 크기를 주면 땅에 떨어지는 순간 덮어써진다. 자식 스케일은 코드가 안 건드린다.
회전은 등 뒤가 `(90,90,0)`, 땅은 `CoinPool.groundRotationX=90` + **Y는 개체별 랜덤**(`Coin.ts:237`이 `eulerAngles.y`를 헤딩으로 유지). 아직 눈으로 안 맞춘 값: `CoinPool.groundY=0.07`(코인 두께 기준이라 통나무는 묻힐 수 있음), `spinSpeed=180`.

**걸음 바운스 (`CharacterBob.ts`, 실험 중 — 화면 확인 안 됨)**
걸을 때 루트 본을 발 디딤에 맞춰 올렸다 내려 "통통 튀게" 하는 실험. `Player`에 붙어 있고 `튕길 노드 = Player/Root`, 높이 0.06.
🔴 **반드시 `lateUpdate`에서 써야 한다.** 걷기 클립 `Axe_Move`에 **`Root` 노드 자체를 향한 트랙이 있어서**(클립 바이너리에서 `Root` 단독 경로 확인) 애니메이션이 매 프레임 루트를 덮어쓴다. `director.ts:778~794`의 순서가 `updatePhase()` → `systems[].update()`(AnimationManager가 클립 적용) → `lateUpdatePhase()`라, `update()`에서 쓰면 그대로 지워진다.
걸음 동기는 속도 추정이 아니라 `AnimationController.getCurrentStateStatus(layer).progress`(클립의 정규화 진행도)에서 가져온다 — 재생 속도가 바뀌어도 발과 안 어긋난다. 곡선은 `height * abs(sin(PI * (progress * stepsPerCycle + phaseOffset)))`이라 **발이 닿는 순간이 정확히 0**이다.
`Root`를 튕기는 이유: 발밑 그림자가 `Root`의 **형제**라 같이 안 뜬다. `Player` 노드를 튕기면 그림자까지 떠오른다.
누적 방지로 매 프레임 직전 오프셋을 빼고 더하며, `onDisable`에서 원복한다.

**보류 — Bob_new 캐릭터 교체**
`assets/Bob_new/`에 모델·텍스처·애니메이션 41개가 들어와 있지만 **FBX가 기존 `tycoon/models/NPC_TTSummon_001_Mesh.fbx`와 md5까지 동일**해서(같은 파일) 교체를 보류했다. 사용자가 진짜 새 모델을 넣으면 진행한다. 서브에셋 id가 원본과 같아 **치환은 루트 uuid만 바꾸면 되고**, 씬 7곳(메시·스켈레톤 ×3 + `clipAttack`) + 애니그래프 3곳이 대상이다. 애니그래프는 `T_Worker`와 공유하므로 **"그래프도 함께 교체"가 사용자 결정**이다.

---

## 절대 규칙 — 어기면 조용히 깨진다

1. **씬별로 코드를 포크하지 않는다.** 씬 전용 스크립트/클래스를 만들지 말 것. 차이는 인스펙터 프로퍼티로 흡수한다(그건 분기가 아니라 모듈화 수단이다).
2. **사용자가 인스펙터에서 손으로 맞춘 값을 되돌리지 않는다.** **코드 기본값과 씬의 라이브 값은 다르다** — 씬 값이 이긴다. 숫자를 바꾸기 전에 씬에 직렬화된 오버라이드가 있는지 확인하고, 요청받은 것만 바꾸고, 보존한 값을 명시적으로 보고한다.
3. **`@property` 이름을 바꾸지 않는다.** Cocos는 컴포넌트 값을 **프로퍼티 이름으로 직렬화**한다. 이름을 바꾸면 씬에 저장된 값이 에러 없이 사라진다. 새 이름을 추가하고 옛 이름은 남긴다.
4. **스크립트 파일을 지우고 다시 만들지 않는다.** 컴포넌트는 **CID**(스크립트 `.meta` uuid의 압축형)로 직렬화된다. 삭제→재생성하면 모든 씬의 그 컴포넌트가 끊긴다. `.meta`를 유지하면 파일명 변경은 괜찮다.
5. **새 `@property`의 기본값은 "기존 씬의 현재 동작"과 같게.** 이미 직렬화된 컴포넌트는 새 프로퍼티 추가에 영향받지 않으므로, 기본값만 맞으면 다른 씬이 조용히 깨지지 않는다.
6. **에셋은 재생성하지 말고 제자리에서 진화시킨다.** 참조는 경로가 아니라 **uuid**로 걸린다. 교체는 `.meta`를 건드리지 않고 **파일 내용만 덮어쓰기**(uuid 유지 → 참조 유지 + 자동 재임포트). glb 재익스포트 시 **서브에셋 id가 유지됐는지 확인**할 것.
7. **삭제는 에디터 Assets 패널에서만.** 편집기 밖에서 지우면 `library`에 유령 uuid가 남아 빌드가 `Error 3702`로 멈춘다. 삭제 전 그 uuid를 참조하는 곳이 자기 `.meta` 외에 없는지 전수 검색한다.
8. **빌드에는 그 광고 씬만 포함한다.** 씬 2가 함께 들어가 5MB 규격을 넘긴 전례가 있다.
9. **씬 3(타이쿤)의 에셋은 단방향이다 — 사용자 지시(2026-09-14).** 씬 3은 씬 1·2의 것을 **가져다 쓰되**, 씬 3에서 바꾸는 것은 씬 1·2에 **절대 영향을 주지 않아야 한다.** 그래서 씬 3이 쓰는 프로젝트 자산은 **전부** `assets/tycoon/` 아래 사본으로 분기해 두었다 — 머티리얼 18 / 프리팹 9 / 모델(glb·fbx) 14 / 텍스처 13 / 애니메이션 그래프·마스크 2 / 이펙트 1 = **57개**. (2026-09-15에 발밑 가짜 그림자 모듈을 분기하며 `tycoon/models/monster_shadow.glb` + `tycoon/prefabs/T_MonsterShadow.prefab` 2개가 추가됐다.) **씬 3이 참조하는 공유 프로젝트 자산은 0건이다**(엔진 내장 `db://internal` 이펙트만 예외 — 엔진 자산은 건드리지 않는다). **씬 3 작업 중 `assets/tycoon/` 밖의 파일을 수정하면 규칙 위반이다.** 새 자산이 씬 3에 추가되면 같은 방식으로 분기부터 한다. 코드·메시·스켈레톤·애니메이션·텍스처는 읽기 전용 공유가 원칙(바꿔야 하면 새 자산을 만든다).
   - **2026-09-16 실측 — "공유 자산 0건"은 그때 사실이 아니었다.** 씬 3의 `clipAttack`과 `T_CharAnimGraph`가 공유 폴더 `assets/NPC_Summon/Animation/`의 `@Axe_Attack01` `@Axe_Idle` `@Axe_Move`를 보고 있었다. glb 전환 때 `assets/tycoon/models/`로 분기해 **고쳤다.** 분기해뒀다고 끝이 아니라 **실제 참조를 전수 검색해 확인해야 한다** — `tycoon/models/`에 있던 `@Idle` `@Move` `@One_BT_Attack01`은 아무도 안 쓰는 오배치였다(엉뚱한 파일을 복사해둔 것).
   - 검증 방법: 씬3 사본 uuid가 `assets/tycoon/` 밖 어디에도 나타나지 않고, 씬 1·2와 공유 프리팹이 여전히 원본 uuid만 참조하는지 전수 검색.
   - **예외 — 2D 카드 모듈(사용자 지시 2026-09-15).** 아래 "2D 카드" 세트는 씬 3이 쓰지만 **의도적으로 공유 라이브러리로 승격**했다(다음 광고에서도 그대로 쓸 모듈이라서). 그래서 **"씬 3이 참조하는 공유 자산 0건"은 더 이상 사실이 아니다** — 이 네 개는 예외로 세고, 전수 검색에서 걸려도 위반이 아니다: `assets/models/cards/plane2x2.glb` / `assets/texture/2d texture/` / `assets/texture/TextureCard.mtl` / `assets/scripts/TextureCard.ts`. 이 예외는 **한 방향으로만 안전하다** — 씬 1·2가 나중에 같은 모듈을 쓰기 시작하면, 이 자산들을 고칠 때 세 씬을 전부 확인해야 한다.
10. 공유 코드나 매니저를 바꿨으면 **다른 씬 영향을 체크하고 넘어간다.** 두 씬 파일에서 `__uuid__`와 스크립트 CID를 뽑아 교집합을 내면 공유 에셋이 나온다.

---

## MCP(`cocos-creator`) 작업 규칙

- **MCP는 세션 시작 때 한 번만 연결된다.** 도중에 서버를 켜도 그 세션에서는 안 붙으니 세션을 다시 시작해야 한다. `autoStart:false`라 에디터를 켤 때마다 확장에서 수동 Start가 필요하다.
- **배열 프로퍼티는 MCP로 쓸 수 없다.** (`rushes`, `rushCycles`, `entries`, `sockets`, `_materials`, `waypoints` …) → 씬을 닫고 JSON 패치 → reimport → open → 라이브 조회 확인 → save → 파일 재확인.
- **`prefab_lifecycle create`를 쓰지 말 것.** 메시·머티리얼 참조가 날아가고 `bakeSettings`에 인스펙터 메타데이터가 덤프된다. **프리팹 신규 작성은 `VirtualWall.prefab`을 골격으로 JSON을 직접 쓴다.** 이 `bakeSettings` 덤프는 임포터를 실패시키는 데 그치지 않고 **standard 계열 셰이더를 통째로 죽인다** — 위 **엔진 함정**의 `[object Object]` 항목 참조. 증상이 몇 세션 뒤에야, 그것도 머티리얼을 바꾼 순간에만 나타나므로 원인 추적이 매우 어렵다.
- **MCP 응답의 프로퍼티는 원래 `{name, value, default, type, …}` 봉투에 싸여 온다.** 이건 인스펙터 직렬화 형식이지 손상이 아니다 — 실제 값은 `value`다. **그 봉투가 씬/프리팹 파일에 그대로 들어가 있으면** 그때가 손상이다. 둘을 혼동하지 말 것.
- **`scene_management close`는 편집 중인 씬에 대해 `success: true`를 반환하면서 실제로는 닫지 않는다.** 로그에만 `"Trying to close current edit scene in general edit mode is not allowed"`가 남는다. 씬 파일을 손패치할 때 "닫았으니 안전하다"고 가정하지 말고, **패치 후 `open`으로 강제 리로드하고 라이브 값을 조회해 확인**하라(파일이 그대로면 리로드된 것이다).
- **두 씬이 같은 노드 uuid를 공유한다** (한쪽을 복사해 만든 씬이라 `_id`가 같다). 편집 전 **반드시 `scene_management get_current`로 어느 씬인지 확인**한다.
- **`changeVerified: true`를 durable 증거로 쓰지 않는다.** 프로퍼티 수정은 **마지막 라이브 편집 단계**로 하고, **즉시 save**, 그다음 **씬 JSON 파일을 다시 읽어** 확인한다. 중간에 리임포트가 끼면 이전 확인은 무효다.
- **🔴 `node_node_transform`은 3D 노드를 2D로 오인해 값을 조용히 버린다.** `"2D node: z position ignored"` / `"x,y rotations ignored"` 경고를 응답에 남기면서 **성공(`success:true`)을 반환한다.** 씬 3을 만들 때 카메라의 z 위치와 -45° 내려보기, 조명의 x·y 회전이 전부 날아갔다. → **3D 노드의 위치/회전은 MCP로 넣지 말고 씬 JSON을 직접 패치**한다(`_euler`와 `_lrot`를 반드시 같이 맞출 것). `layer`는 이 도구로 정상 반영된다. `node_lifecycle create`의 `initialTransform`도 같은 방식으로 z를 버린다.
- **`save_as`를 호출하지 않는다.** 네이티브 대화상자가 떠서 씬 프로세스가 멈춘다.
- **에셋 이동·삭제는 `asset_operations move`/`delete`가 안전하다 (2026-09-16 실측).** 에디터를 거치므로 `.meta`가 파일과 함께 따라가고 **uuid가 보존돼 참조가 안 끊긴다** — glb 37개 + 씬 3개를 재배치했는데 미해결 참조 증가 0건이었다. 폴더는 `create`에 `content`를 주지 않으면 만들어진다. **편집 중인 씬 파일을 옮길 때는 다른 씬을 먼저 열어 비워둔다.**
- **glb의 루트 uuid는 `library` 컴파일본이 원래 없다** — 서브에셋(mesh/material/prefab)에만 생긴다. 무결성 검사를 짤 때 이걸 모르면 멀쩡한 glb를 전부 손상으로 오판한다. 반드시 **이동하지 않은 glb를 대조군**으로 같이 확인하라.
- 노드 *삭제*는 참조·프리팹 데이터 정리를 편집기가 해주므로 `node_lifecycle delete`가 손패치보다 안전하다. 손패치는 스칼라/배열 값 변경에만 쓴다.
- **🔴 에디터가 파일시스템 직접 쓰기를 감지하지 못한다 (2026-09-15에 두 번 걸림).** `Write`/`Edit`으로 `assets/` 밑에 파일을 만들면 **`.meta`가 생기지 않고** 에셋 DB에 등록되지 않는다 — 스크립트라면 `[Scene] ctor with name X is not child class of Component`로 나타나고, 기존 파일을 고치면 **에디터가 옛 코드를 계속 실행한다**(수정이 안 먹은 것처럼 보인다). `asset_operations reimport`는 이 경우 `success`를 반환하면서 아무것도 하지 않는다. → **`assets/` 밑 파일은 `asset_operations create`(필요하면 `overwrite: true`)로 에디터를 통해 쓴다.** 그래도 실행 중인 씬이 새 코드를 안 쓰면 **에디터 재시작**이 답이다. 검증: `.meta` 생성 여부 + `library/<uuid>.json` 존재 + 실제 동작.

---

## 엔진 함정 — 가장 비쌌던 것들

- **🔴 `bakeSettings`에 인스펙터 메타데이터가 덤프되면 standard 계열이 컴파일 실패한다 (2026-09-15 원인 확정·수정 완료).**
  ~~"`builtin-standard.effect`는 이 엔진 버전에서 컴파일 실패한다"~~ — **이 서술은 틀렸다.** `builtin-standard`는 정상 동작한다(같은 씬에서 `T_Tree`/`T_Ground`/소켓 5종이 이걸로 렌더된다). 진짜 원인은 렌더러 컴포넌트의 데이터 손상이었다.
  `cc.ModelBakeSettings`의 필드에 값 대신 인스펙터 메타데이터 객체(`{name, value, default, type, animatable, …}`)가 통째로 직렬화되면, `_reflectionProbeType`이 객체인 채로 `mesh-renderer.ts:1225` → `model.ts:1198`을 타고 셰이더 매크로가 된다 → `#define CC_USE_REFLECTION_PROBE [object Object]` → 이 매크로를 `#if`로 읽는 지점마다 `'syntax error' : invalid expression`. **버텍스 셰이더가 통째로 죽어서 메시가 안 보인다.**
  **증상이 선택적이라 헷갈린다**: `legacy/toon`과 `builtin-unlit`은 이 매크로를 한 번도 참조하지 않아서, 손상이 있어도 멀쩡히 보인다. standard로 바꾸는 순간에만 드러난다. 같은 씬에서 "나무는 보이는데 캐릭터만 안 보인다"면 이걸 의심하라.
  **진단**: 씬/프리팹 JSON에서 `cc.ModelBakeSettings`를 찾아 필드 값이 스칼라가 아니라 객체인지 본다. **수정**: 객체를 그 안의 `"value"`로 치환한다(동작 중립 — `_reflectionProbeType`은 어차피 어떤 분기에도 안 걸리고, `_useLightProbe`는 `node.mobility === Movable`까지 필요해 이미 꺼져 있었고, `_bakeable`/`_castShadow`/`_lightmapSize`는 런타임 소비처가 없는 라이트맵 베이크 전용이다).
  **출처는 `prefab_lifecycle create`다**(아래 MCP 규칙 참조). 2026-09-15 시점에 11개 파일 147필드를 수정했다: `tycoon.scene`, `T_Player`/`T_Worker`/`T_ArrowGuide`, `NPC_TTSummon_001`, `Worker`, `Follower`, `Door1`, `Door2`, `GuideCompassIcon`, `3D_arrow`. `scene.scene`·`xp_np.scene` 본체는 처음부터 깨끗했다.
- **🔴 미싱 프리팹 인스턴스가 있는 씬을 저장하면 그 노드의 `propertyOverrides`가 통째로 삭제된다 (2026-09-16에 실제로 당했다).** 프리팹 소스를 못 찾는 인스턴스는 노드 스텁만 남고 **위치·회전·스케일·이름 오버라이드가 전부 버려진 채** 직렬화된다. 에러도 경고도 없다. `xp_np` 저장 한 번에 오브젝트가 **1814 → 1788로 26개** 줄었다(ground_dirt 5 + ground_fog 8, 각각 `cc.TargetInfo` 동반 = 13×2).
  **그래서 하이라키에 미싱이 보이면 절대 저장하지 않는다.** 먼저 에셋을 복구하고, 노드가 이름과 함께 돌아온 것을 눈으로 확인한 뒤에 저장한다.
  이미 저장해 버렸다면 값은 되살릴 수 있다 — 씬 백업에서 그 `cc.PrefabInstance`의 `propertyOverrides`만 **외과적으로 이식**하면 된다. 씬을 통째로 되돌리면 그 사이 작업이 날아가므로 하지 말 것. 이식 전에 **양쪽 인스턴스의 `fileId`가 일치하는지** 반드시 확인하고, 오버라이드 레코드(`CCPropertyOverrideInfo`)와 그 `targetInfo`(`cc.TargetInfo`, `localID`) 쌍을 배열 끝에 덧붙인 뒤 `__id__`를 다시 엮는다.
- 참조가 다 맞는데 메시가 안 보이면 즉시 `debug_debug_logs`에서 `"compilation failed"`를 검색하라. 셰이더 덤프에서 **에러 줄의 바로 윗줄**이 진짜 범인인 경우가 많다(전처리기는 `#if` 다음 줄 번호를 보고한다).
- **🔴 `UICamera`의 `projection`은 반드시 ORTHO(0)여야 한다.** `cc.Camera`의 엔진 기본값은 **PERSPECTIVE(1)**이라, 빈 씬에서 UI 카메라를 새로 만들면 기본값이 그대로 들어간다. 그러면 화면 좌표 ↔ UI 좌표 변환이 어긋나 **조이스틱·버튼 등 UI 입력이 통째로 먹지 않는다**(렌더는 그럴듯하게 보여서 더 헷갈린다). 씬 3에서 실제로 이 이유로 조이스틱이 안 먹었다. 같이 볼 것: `Canvas._alignCanvasWithScreen`도 씬 1·2는 **false**다.
- **카메라 `visibility` × 노드 `layer`.** UI는 **`UI_2D`(1<<25 = 33554432)**, 3D는 `DEFAULT`(1<<30). `UICamera.visibility`도 UI_2D만. 이게 어긋나면 UI가 3D 카메라에 **월드 스케일의 거대한 판**으로 그려진다.
- **`new Node()`는 layer가 항상 `DEFAULT`다.** 부모를 물려받지 않는다. Canvas 아래에 런타임으로 노드를 만들면 `node.layer = this.node.layer;`를 넣어라. `instantiate(prefab)`은 프리팹에 저장된 레이어를 가져온다.
- **`addComponent`는 노드가 이미 활성 계층에 있으면 `onLoad`를 그 자리에서 부른다.** 그래서 **컴포넌트를 붙이고 값을 다 넣은 "뒤에" `addChild`** 해야 한다. 순서가 반대면 `onLoad`가 기본값으로 먼저 돈다.
- **반투명은 깊이가 아니라 오브젝트 단위로 정렬된다** (pass priority → 오브젝트 중심 거리). 화면을 덮는 큰 반투명 평면에는 **pass `priority`를 명시**하라(기본 128, 낮을수록 먼저). 현재: `ground_fog` 100, `ground_dirt` 110, `GuideCompassIcon` 150.
- **회전 판정은 비대칭 각도(45°)로 테스트하라.** 월드→로컬은 회전의 역이라 부호가 반대다. 축 정렬 각도(0/90/180/270)만으로 검증하면 부호 버그가 통과한다 — 실제로 4세션 잠복했다.
- **스켈레톤 캐릭터에 런타임으로 붙인 자식 노드는 트랜스폼이 얼어붙는다.** `SkeletalAnimation`은 `useBakedAnimation`이 기본 true이고, `start()`에서 **루트의 직계 자식 전부**(`sockets`로 등록한 것만 예외)에 `isSkipTransformUpdate = true`를 찍는다. 그러면 `Node.invalidateChildren`이 그 노드와 **하위 트리 전체**를 건너뛰어, `Model.updateTransform`이 월드 행렬을 다시 올리지 않는다 → 부모가 움직여도 **처음 그려진 자리에 멈춘 채로 보인다**(에러도 경고도 없다). 발밑 그림자·이펙트·장식을 캐릭터에 붙일 때 반드시 걸린다. 해법은 붙인 뒤 `(node as any).isSkipTransformUpdate = false`를 **`start()`가 아니라 첫 `update()`에서** 1회 해제하는 것(엔진은 한 프레임에서 모든 `start()`를 돌린 뒤 `update()`를 돌리므로 순서가 보장된다). `@engineInternal`이라 `cc.d.ts`에 없어 캐스팅이 필요하다.
- **메시 원점 ≠ 노드 원점.** 발밑에 놓을 것은 `mesh.struct.minPosition.y`를 읽어 들어올려라.
- **🔴 캐릭터 메시에 join된 부속물은 "노드/렌더러 찾기"로는 절대 안 나온다. 본 스케일 0으로 끈다 (2026-09-15).**
  캐릭터에서 특정 부위만 안 보이게 하려 할 때, 그게 **별도 노드가 아니라 몸통 메시에 합쳐진 지오메트리**일 수 있다. 그러면 씬을 아무리 뒤져도 끌 렌더러가 없다 — 실제로 씬 3 `Player` 발밑의 막대기를 찾느라 `crossbow001`·환경 카드를 잘못 짚었고, **사용자가 `Bone_Stick`을 직접 찾아 해결했다.**
  **판별법**: 스킨드 메시의 **스켈레톤 조인트 목록**을 보라(`library/<meshUuid@서브id>.json`에서 `Root/...` 경로를 뽑는다). 몸통(`NPC_Summon_001.mesh`)의 스켈레톤 `@30732`에는 `Root/Bone_Stick`이 조인트로 들어 있었다 — 즉 막대기는 그 본에만 웨이트가 걸린 **같은 메시의 일부**였다. 노드 트리에 `Bone_Stick`은 보이지만 렌더러가 없어서, 렌더러 기준으로 훑으면 영원히 안 걸린다.
  **해법**: 그 본 노드의 `scale`을 0으로. 버텍스가 한 점으로 모여 삼각형 면적이 0이 되어 아예 래스터화되지 않는다.
  **적용 전 반드시 확인할 3가지** (하나라도 어긋나면 에디터에서만 먹고 빌드에서 되돌아온다):
  ① 그 본이 **해당 스켈레톤의 조인트가 맞는지** — 아니면 스키닝에 영향이 없다.
  ② **어떤 클립도 그 본을 애니메이션하지 않는지** — 클립이 스케일 트랙을 갖고 있으면 런타임에 덮어쓴다. 클립 라이브러리는 `.bin`이라 JSON 파싱이 안 되니 **바이너리를 `latin-1`로 읽어 본 이름 문자열을 세면 된다**(CCON 문자열 테이블이 평문으로 들어 있다).
  ③ **`SkeletalAnimation._useBakedAnimation`이 false인지** — true(엔진 기본값!)면 조인트 행렬을 구워둔 텍스처에서 읽으므로 **노드 스케일이 통째로 무시된다.**
  같은 메시를 쓰는 다른 프리팹(`T_Worker` 등)에는 따로 적용해야 한다 — 본은 각 인스턴스가 자기 것을 갖는다.
- **상태 플래그를 조기 return 경로가 있는 함수 안에서 세우지 말 것.**
- **미러링을 음수 스케일로 하지 말 것** — 와인딩이 뒤집혀 모델이 통째로 단색이 된다. 다른 축 180° 회전으로.
- **`AnimationController.graph`는 런타임 대입이 불가능하다.** 프리팹에 박아야 한다.
- **애니메이션 클립 이름이 인터페이스다** — 코드가 문자열로 찾는다(`'appear'` 등).

---

## 코드 컨벤션

- **모든 튜너블은 인스펙터에 노출한다.** 한글 `displayName` + **트레이드오프를 설명하는** `tooltip`. 값이 footgun이면(조용히 뭔가를 깨는 범위가 있으면) 툴팁에 명시한다. 하드코딩보다 프로퍼티 추가가 기본값이다.
- **매니저는 설정되지 않은 상태에서 무동작(inert)이어야 한다.** 시스템 세트를 새 씬에 통째로 넣어도 아무 일이 없어야 하고, 씬이 데이터를 채운 만큼만 동작해야 한다. 어떤 매니저가 비어 있으면 게임이 시작조차 안 되는 상태는 커플링 결함이다.
- **캐릭터 그림자는 동적 그림자가 아니라 "발밑 가짜 그림자 판"이 기본이다.** 동적 그림자는 개체 수만큼 비용이 곱해져 모바일에서 제일 먼저 렉이 난다. **몬스터는 예외 없이 전부** 이 방식을 쓴다 — `MonsterSpawner._spawnMonster()`가 **유일한 몬스터 생성 경로**라서(보스 포함, 모든 러쉬가 `startRushByName` → 같은 함수로 들어온다) `fakeShadowPrefab` 한 곳만 채워두면 새 몬스터 프리팹을 추가해도 자동으로 붙는다. **몬스터를 다른 곳에서 `instantiate` 하지 말 것** — 그 순간 이 보장이 깨진다. 판의 높이·크기 조정은 `assets/prefabs/MonsterShadow.prefab`의 `MonsterShadow` 컴포넌트 한 군데에서 한다(모든 몬스터에 동시 반영, 개체 스케일은 자동 보정).
- **배경 장식은 3D 메시 대신 "2D 카드"가 기본이다 (2026-09-15부터).** 오소그래픽이라 카메라 각도가 절대 안 변하니, 나무·부쉬처럼 개체 수가 많고 잎 폴리곤이 많은 것은 알파 PNG를 입힌 판 한 장으로 대체한다. 구성: `assets/models/cards/plane2x2.glb`(바디) + `assets/scripts/TextureCard.ts`(텍스처 비율 자동 맞춤) + `assets/texture/TextureCard.mtl`(공유 머티리얼) + `assets/texture/2d texture/`(카드 이미지). 문이 열리거나 업그레이드 연출이 있는 건물은 예외 — 정적 이미지로는 표현이 안 된다.
  - **투명은 블렌드가 아니라 알파 테스트(컷아웃)로 한다.** 블렌드면 위의 "반투명은 오브젝트 단위로 정렬된다" 함정에 걸려 카드끼리 겹칠 때 순서가 깨진다. 그래서 `TextureCard.mtl`은 `builtin-unlit` 기법 0(opaque) + `USE_ALPHA_TEST`다. 컷오프 값은 인스펙터에서 조절한다.
  - 머티리얼은 **에셋 한 장을 공유**하고 카드마다 복사하지 않는다. `MeshRenderer.material`(`sharedMaterial`이 아니다) 게터가 컴포넌트별 `MaterialInstance`를 지연 생성하므로 텍스처만 갈라진다. 그 인스턴스는 직렬화되지 않으니 **씬에 저장되는 진실은 `TextureCard.texture` 프로퍼티**다.
  - **🔴 `plane2x2` 메시는 45° 기울기가 버텍스에 구워져 있다.** 실측: min `(-1, 0.0077, -0.7071)` / max `(1, 1.4219, 0.7071)` — 2×2 정사각형을 로컬 X축으로 45° 눕히고 바닥이 y≈0에 오도록 올린 것이다. 그래서 **판의 "세로"가 로컬 y와 z에 나뉘어 들어간다**(각각 √2) → 세로를 키우려면 `scale.y`와 `scale.z`에 **같은 값**을 줘야 하고, 한쪽만 늘리면 기울기 각도가 조용히 틀어진다. 카메라를 향한 요(yaw)는 부모 노드의 Y 회전(45°)이 따로 담당한다.
  - 카드를 애니메이션시키려면 PNG 시퀀스를 격자 아틀라스 한 장으로 합치고 `tilingOffset`(`builtin-unlit` 내장 vec4: `.xy`=타일링, `.zw`=오프셋)을 프레임마다 바꾼다. 커스텀 셰이더가 필요 없다 — `MonsterDeadFx.mtl`이 이미 3×3 아틀라스로 같은 걸 한다. 프레임 갱신은 개체 수만큼 곱해지므로 전역 타이머 하나로 묶을 것.
- **불리언 플래그를 계속 덧붙이는 방식은 지양한다.** 데이터 주도(씬이 채우는 테이블)와 이벤트 기반 디커플링(`CoinEvents` 패턴)을 택한다.
- 원시 배열 `@property`에는 타입을 명시한다. 문자열 배열은 `type: [String]`이 아니라 **`type: [CCString]`**.
- **주석은 "무엇"이 아니라 "왜"를 쓴다.** 기존 코드가 그렇게 되어 있다 — 특히 함정을 피하려고 그 순서/그 값으로 쓴 이유를 남긴다.
- 물리 엔진을 쓰지 않는다. 충돌은 `Vec3` 거리 계산과 `VirtualWall` 박스 판정으로 직접 구현되어 있다.

### 성능은 한 군데만 신경 쓴다
`update()` 안, 그리고 **개체 수만큼 곱해지는 곳**만이다(`Monster.update`가 최대 200회 × `VirtualWall.all` 전체 순회). 그 외 1회성 코드는 가독성이 이긴다.
- **프레임당 연산을 늘리지 말고 스폰 시점으로 밀어라.**
- **O(n²)가 보이면 멈춰라.**
- 자주 생성·파괴되는 것은 풀링한다(`CoinPool`, `MonsterHealthBarManager`).
- 개수 상한을 프로퍼티로 만들어 두면 랙이 났을 때 코드를 안 고치고 대응할 수 있다.
- 다만 **실제 랙의 1순위는 스크립트가 아니라 그림자·드로우콜·반투명 오버드로**다. 그쪽을 먼저 보라.

---

## 빌드 / 플레이어블 광고 규격

- 어댑터: `extensions/playable-ads-adapter` (8채널). **채널별 SDK 스크립트만 주입하고 "스토어 열기"는 넣어주지 않는다** → `CtaClick.ts`가 직접 호출한다.
- **스토어 URL을 크리에이티브에 박지 말 것.** 광고 네트워크 대시보드의 캠페인 설정에 넣는다. `CtaClick.fallbackUrl`은 로컬 테스트 전용이며 배포본에서는 비워둔다.
- AppLovin 규격: **5MB 이하 / 첫 상호작용 전까지 BGM·효과음 전부 무음 / 숨겨지면 오디오 정지(`visibilitychange` + MRAID `viewableChange`) / WebGL 폴백 / 단일 HTML(외부 참조는 `mraid.js`만) / 첫 탭에 스토어 이동 없음**.
- 용량을 줄일 때 보는 순서: ① 빌드 포함 씬 목록 → ② glb 메시(정점:삼각형 비율, 불필요한 스킨·`COLOR_n`) → ③ 텍스처 해상도. 엔진 코어(`cocos-js` 2.68MB)는 더 줄이기 어렵다.
- 빌드 HTML을 로컬에서 그냥 열면 `mraid.js`가 없어 스플래시에서 멈춘다. **프로젝트 버그가 아니다.** `file://`도 별개 이유로 실패하니 로컬 HTTP로 서빙하거나 네트워크 프리뷰 툴을 쓴다.

---

## 진실은 어디에 있나

추측하지 말고 실측한다. 순서대로:

1. **씬/프리팹 JSON 파일** — 저장된 값의 최종 진실. 라이브 조회보다 이걸 믿는다.
2. **`library/<uuid>.json`** — 컴파일된 머티리얼·이펙트. `{}`가 "기본값 사용"이라는 뜻이니 그 기본값이 무엇인지는 여기서 본다.
3. **엔진 소스** `C:\ProgramData\cocos\editors\Creator\3.8.8\resources\resources\3d\engine` — 동작이 의심되면 코드를 읽는다.
4. **원본 glb의 JSON 청크** — 정점 속성 구성, 클립 목록, AABB. `library` 컴파일본에는 안 보인다.
5. **부모 저장소의 `testproject/`** — **사라진 에셋의 복구처.** 바탕화면 `cocos creator practice`가 git 저장소이고(`np_playable_set/assets`는 미추적), 거기 **옛 프로젝트 `testproject/`와 `testproject - 복사본/`이 `assets`·`library`·`build`까지 통째로 커밋**돼 있다. 2026-09-16에 `ground_dirt`·`ground_fog`를 여기서 **md5 일치로 복원**했다. `.meta`까지 있어서 **uuid·서브에셋 id·머티리얼 설정(`userData.materials`)이 그대로 복구된다** — 이게 결정적이다. 찾는 법: `git ls-files | grep <이름>` 또는 uuid로 `git show HEAD:<meta경로> | grep <uuid>`.
6. **`temp/asset-db/log/`** — 임포트 실패의 시점과 이유가 여기 남는다(`project.log`보다 정보량이 많다). "언제부터 깨졌나"를 확정할 때 세션 간 diff를 뜬다.
7. **`library/.assets-data.json`** — uuid ↔ 에셋 경로 매핑 캐시. **파일이 이미 사라진 뒤에도 옛 경로를 기억하고 있어서**, 미아 uuid의 원래 정체를 알아내는 데 결정적이다(`893a2a1f…` → `db://assets/ground_dirt.glb`를 이걸로 밝혔다).
8. **`debug_debug_logs`** — 셰이더 컴파일 실패는 에셋 레벨에 에러를 내지 않고 여기에만 남는다.

사용자는 확인된 것 / 추론한 것 / 모르는 것을 문장에서 구분해 표기하기를 요구한다. 생략·우회·추측으로 넘어가지 말 것.

---

## 문서

- `C:\Users\김유성\Desktop\씬1_개발경험_정리_2026-09-11.html` (+ `.md`) — 12장짜리 개발 경험 정리. 사용자가 읽는 문서이며, 새로 배운 것이 생기면 **이 문서와 메모리를 함께** 갱신한다.




testproject — Cocos Creator 3.8 작업 지침
이 프로젝트(AppLovin 플레이어블 광고, 러쉬 디펜스류)에서 작업할 때 아래 원칙과 참고 문서를 반드시 확인할 것.
핵심 원칙 (필독)
추측 금지, 할루시네이션 금지. 확신 없는 API 시그니처/버전별 동작은 공식 문서(https://docs.cocos.com/creator/3.8/manual/en/)를 조회하거나, 실제 파일(.scene/.prefab/.meta)을 열어 uuid·mtime을 대조해 확정한다. 모르면 모른다고 말한다.
"에디터 미저장" 패턴을 항상 의심한다. 이 프로젝트에서 최소 3회 반복된 실제 원인: 사용자가 "고쳤다"고 말해도 Ctrl+S가 안 눌려서 scene/prefab에 반영 안 된 경우가 있었다. 수정 완료 보고를 받으면 해당 `.scene`/`.prefab` 파일의 mtime과 실제 내용(grep)을 재확인한다.
용량(빌드 크기) vs 성능(런타임 부하)을 구분해서 설명한다. 특히 셰이더/라이팅/그림자.
빌드 산출물 검증은 반드시 디코딩까지 한다. 코드 안 로더 문자열만 보고 "포함/미포함"을 판단하지 않는다 (false-positive 사례 있었음 — bullet/box2d).
참고 문서 (같은 지식 기반, 전체 내용은 각 파일 참조)
@docs/cocos-notes/cocos_01_scene_node_asset.md
@docs/cocos-notes/cocos_02_material_shader.md
@docs/cocos-notes/cocos_03_animation_physics.md
@docs/cocos-notes/cocos_04_ui_system.md
@docs/cocos-notes/cocos_05_build_publish.md
@docs/cocos-notes/cocos_06_troubleshooting_log.md
@docs/cocos-notes/cocos_07_project_glossary.md
미확정 / 재검증 필요 항목 (착수 전 먼저 확인)
몬스터 체력바 세로 화면비 이슈: 사용자가 "다 고쳐졌다"고 보고했으나 실제 변경 파일/내용 미검증. 재발 시 `WorldUIAnchor.ts`, `MonsterHpBarView.ts`, `UIAutoFit.ts`, `scene.scene`의 `MonsterHealthBars` 노드를 대조할 것.
`UI_arrow.prefab`의 SkinnedMeshRenderer→MeshRenderer 교체, `showGuideArrow` 인스펙터 체크: 해결 방향만 제시됐고 최종 적용 여부 미확인.
`library`/`temp` 전체 삭제 후 재임포트 권고: 실제 적용 여부 미확인.
`UIAutoFit.ts` 부착 여부: 마지막 확인 시점 기준 어떤 노드에도 부착 안 된 상태였음 — 재확인 필요.
프로젝트 경로
루트: `C:\Users\김유성\Desktop\cocos creator practice\testproject - 복사본`  ← **작업 폴더는 "복사본" 쪽이다** (옆에 `testproject`도 실재하지만 그쪽이 아니다)
스크립트: `assets/scripts/`
프리팹: `assets/prefabs/`
씬: `assets/scenes/scene.scene`
