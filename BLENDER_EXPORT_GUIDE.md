# Blender 캐릭터 익스포트 규격 (Cocos 3.8.8)

플레이어블 광고용 캐릭터를 Blender에서 `.glb`로 내보낼 때의 **작업 상태**와 **익스포터 설정**만 정리한 실무용 문서.

> 상세 근거·실측 데이터·용량 공식은 원문 `CHARACTER_ASSET_SPEC.md` 참조

## 예산

| 등급 | 삼각형 | 본(디폼) | 클립 | 총 용량 |
| --- | --- | --- | --- | --- |
| 잡몹 | ≤ 1,500 | ≤ 12 | 4 | ≤ 200KB |
| 보스 / 히어로 | ≤ 3,000 | ≤ 24 | 5~6 | ≤ 350KB |
| 절대 상한 | — | **30** (엔진 하드 리밋) | — | — |

삼각형 1개 ≒ 53B · 본 1개 ≒ 7.6KB(4클립 기준). **본 개수가 용량에 제일 크게 작용한다.**

---

# 1. 익스포트 전 Blender 상태

## 트랜스폼

| 항목 | 규격 |
| --- | --- |
| 단위 | 1 Blender unit = 1m |
| 스케일 | **Ctrl+A → Apply Scale 필수** |
| 원점 | 바닥 접지물은 발밑 중심, Y=0 |
| 정면 | **−Z 방향** |
| 미러링 | **음수 스케일 금지** → 다른 축 180° 회전으로 대체 |
| 본 스케일 | 정확히 1.0 (0.9999998 같은 오차도 정리) |

음수 스케일은 와인딩이 뒤집혀 toon 아웃라인이 모델을 단색으로 칠한다.

## 메쉬

- **정점 웰딩 필수** — 판정 기준 `정점 ÷ 삼각형 ≤ 0.8`
- **서브메쉬 1개**로 합칠 것 (primitive 2개 = 드로우콜 2배)
- **정점 컬러 금지** (`COLOR_0` / `COLOR_1`)
- 데시메이트는 비율이 아니라 **삼각형 목표치**로 지정
- 모디파이어(Decimate / Mirror / Subdivision)는 **Blender에서 미리 Apply** — 익스포트 옵션으로 굽지 않는다
- 셰이프키(모프 타겟) 없음

## 리그 / 애니메이션

- **디폼 본만** 남기고 컨트롤 본·IK 타겟은 제외 (노드 1개당 클립마다 940B)
- 애니메이션은 **NLA 트랙**으로 관리 — 트랙 1개 = 클립 1개
- 클립 길이: 액션 **≤ 1.0s**, idle **≤ 1.5s**
- 키프레임을 솎아내도 용량은 안 준다 (Cocos가 30fps로 다시 굽는다). 줄어드는 건 **채널을 없앨 때뿐**

**필수 클립 이름 (고정 어휘, 오타 금지)**

| 클립 | 대상 |
| --- | --- |
| `idle` `move` `attack` `dead` | 캐릭터 |
| `appear` | 구조물 · UI |
| `shot` / `open` | 타워 / 문 |

> ⚠️ **클립 이름이 틀려도 에러가 안 난다.** `SkeletalAnimation.play()`가 조용히 실패해 T포즈로 서 있다가 1.5초 뒤 사라진다. 반드시 눈으로 확인할 것.

## 머티리얼 / 텍스처

- **Backface Culling: ON 필수** — 꺼진 채로 내보내면 임포터가 모든 pass의 `cullMode`를 `NONE`으로 덮어써서 모델이 단색이 된다
- 머티리얼은 캐릭터당 **1개**
- 텍스처: **128×128** (최대 256²), 2의 제곱 필수, PNG-8, 캐릭터당 1장
- 이미지 노드는 연결만 해두고 **익스포트에는 미포함**

## 네이밍 (첫 익스포트 전에 확정 — 나중에 못 고침)

Cocos의 서브에셋 uuid = **부모 uuid + 이름 해시**. 이름을 바꾸면 그걸 참조하던 씬·프리팹이 전부 끊긴다.

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 파일명 | `snake_case` | `mob_slime01.glb` |
| 메쉬 데이터블록 | 파일명과 동일 (`Mesh.008` 같은 자동 이름 금지) | `mob_slime01` |
| 아마추어 | `<파일명>_rig` | `mob_slime01_rig` |
| 머티리얼 | `<파일명>` | `mob_slime01` |
| NLA 트랙 | 위 고정 어휘만 | `idle` `move` … |

**해도 되는 것** — NLA 트랙 추가·순서 변경, 메쉬/애니 내용 교체 후 재익스포트 (이름만 유지되면 참조 살아있음)

**하면 안 되는 것** — 클립·메쉬·머티리얼 이름 변경, 에셋 삭제 후 재생성

---

# 2. glTF 2.0 익스포터 설정

포맷은 **`.glb` 하나로 통일**. `.gltf`는 금지, `.fbx`는 스켈레톤 이름이 `UnnamedSkeleton-0`으로 자동 생성돼 네이밍 계약과 충돌한다.

```
[ Format ]
  Format                           : glTF Binary (.glb)

[ Include ]
  Selected Objects                 : ON    (아마추어 + 메쉬만 선택)
  Cameras / Punctual Lights        : OFF
  Custom Properties                : OFF

[ Transform ]
  +Y Up                            : ON

[ Data > Mesh ]
  Apply Modifiers                  : OFF   ← 모디파이어는 미리 Apply해 둘 것
  UVs                              : ON
  Normals                          : ON
  Tangents                         : OFF   ← Cocos가 어차피 생성함
  Vertex Colors                    : NONE  ← 정점당 4B 순손실
  Loose Edges / Loose Points       : OFF

[ Data > Material ]
  Materials                        : Export
  Images                           : None  ← 텍스처는 프로젝트 에셋으로 별도 관리

[ Data > Skinning ]
  Skinning                         : ON
  Export Deformation Bones Only    : ON
  Include All Bone Influences      : OFF   (정점당 본 4개 제한)

[ Animation ]
  Animation Mode                   : NLA Tracks
  Bake All Objects Animations      : OFF
  Optimize Animation Size          : ON
  Force keeping channels for bones : OFF   ← 검증 중 (아래 참조)
  Export all Armature Actions      : OFF
```

## 주의 2가지

- **`Apply Modifiers`를 켜면 셰이프키가 익스포트되지 않는다.** 지금은 모프 타겟이 0이라 손해가 없지만, 표정 애니를 넣는 순간 조용히 사라진다. 아마추어는 어차피 적용 대상에서 제외되므로 켤 이유가 없다.
- **`Force keeping channels for bones: OFF`는 아직 미검증.** 안 움직이는 채널을 빼면 애니 용량이 55~60% 줄어들 것으로 계산되나(196KB → 약 80KB), 실측 비교가 아직 안 됐다.

---

# 3. 내보내기 직전 체크리스트

- [ ] Apply Scale 했는가 (루트 스케일 1.0)
- [ ] 음수 스케일 성분이 없는가
- [ ] 정점 ÷ 삼각형 ≤ 0.8 인가
- [ ] 삼각형 수가 등급 예산 이내인가 (잡몹 1,500 / 보스 3,000)
- [ ] 디폼 본이 예산 이내인가 (12 / 24, 하드 리밋 30)
- [ ] 서브메쉬가 1개인가
- [ ] 정점 컬러가 없는가
- [ ] 필수 클립 `idle` `move` `attack` `dead` 가 **이름까지 정확히** 있는가
- [ ] 클립 길이가 상한 이내인가 (액션 1.0s / idle 1.5s)
- [ ] 메쉬 · 아마추어 · 머티리얼 이름이 자동 이름이 아닌가
- [ ] Backface Culling이 켜져 있는가
- [ ] 익스포터에서 Tangents OFF · Vertex Colors NONE · Images None 인가
