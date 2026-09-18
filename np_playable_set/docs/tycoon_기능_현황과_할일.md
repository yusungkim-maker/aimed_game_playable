# 타이쿤(씬 3) — 기능 현황과 할 일

> 🔴 **2026-09-18에 사용자가 전체 흐름을 구술로 확정했다. `docs/tycoon_확정명세.md`가 최우선 진실이다.**
> 이 문서와 충돌하면 그쪽이 이긴다. 특히 아래 "6. 아직 정해지지 않은 것"의 상당수가 거기서 확정됐다.


- **기준 기획**: `docs/tycoon_게임흐름_명세.md`
- **조사일**: 2026-09-17. 씬 파일·프리팹·스크립트 64개를 실측한 결과다(컴포넌트 CID를 역산해 씬에 실제로 붙어 있는 것만 셌다).
- **표기**: 🟢 그대로 쓴다 / 🟡 있지만 고쳐야 한다 / 🔴 새로 만들어야 한다

---

## 0. 한 눈에 보기

| 기획 요소 | 상태 | 근거 |
|---|---|---|
| 플레이어 벌목 | 🟢 | `Choppable` + `Player` 벌목 + `CoinEvents.ResourceDropped` |
| 자원 드롭 → 자석 → 등 뒤 적재 | 🟢 | `CoinPool` `Coin` `CoinSpawnController` `CoinStack` |
| 창고에 자원 쌓기 | 🟢 | `CoinGroundStack` (씬의 `Warehouse`에 배선 완료) |
| 일꾼이 나무 캐서 창고에 적재 | 🟡 | `CoinCourier.harvestFromTrees`가 **이미 있다.** `routes`가 빈 배열이라 안 돌 뿐 |
| 일꾼이 달구지를 끄는 외형 | 🟡 | 노드·머티리얼은 2026-09-17에 붙임. **클립 분기 + 애니그래프 상태가 없음** |
| 건물 해금/건설 연출 | 🟡 | `BuildingTrigger`(AND 조건까지) 완비. **씬 3에 건물이 하나도 없다** |
| 다음 목표 유도 | 🟢 | `SocketGuideArrow` `GuideCompass` `T_ArrowGuide` |
| 자원 카운터 HUD | 🟡 | `WoodCounter` 1개만 있음. 3종이면 2개 더 |
| **자원 "종류" 구분** | 🔴 | **경제 전체가 자원을 1종으로만 안다.** 아래 2절 — 최대 난제 |
| 소켓 A (서 있으면 시간당 일꾼) | 🔴 | 기존 소켓은 전부 "코인을 채우면" 방식 |
| 소켓 B (창고 적재 2칸) | 🟡 | `CoinGroundStack`을 2개 두면 되지만 자원 구분이 선행되어야 함 |
| 소켓 C (돈 적재) | 🟡 | `CoinGroundStack` 재사용 가능. 채우는 주체가 손님인 것만 다름 |
| 소켓 D (레일 해금) | 🟢 | 기존 `Socket` + `TriggerId` + `BuildingTrigger`가 거의 그대로 맞는다 |
| 대장간 합성(나무+철→칼) | 🔴 | 전무 |
| 손님 NPC (스폰·이동·구매·지불) | 🔴 | 전무 |
| 레일 자동 운반 | 🔴 | 전무 |
| 광산 채집 | 🔴 | `harvestFromTrees`의 광산 버전이 없음 |
| 엔딩 / CTA | 🟡 | `GameManager` `EndingEffect` `CtaClick` 있음. 씬 3 배선 안 됨 |

---

## 1. 씬 3에 지금 실제로 붙어 있는 것 (실측)

```
tycoon
  Main Camera        [Camera, CameraFollow]
  Canvas
    UICamera         [Camera, UIAutoFit]
    Joystick_Base    [JoystickUI]
    Logo / Notice
    WoodCounter      [Sprite] → WoodCountLabel [Label, CoinCounterUI]
  Systems
    CoinSystem       [CoinPool, CoinSpawnController]
    SocketManager    [SocketManager]          ← sockets 배열이 0개
    CoinCourierManager [CoinCourierManager]   ← routes 배열이 0개
    GameManager      [GameManager, GameStartTrigger]
    SocketSpawnPoint
  Ground             [MeshRenderer]
  Player             [SkeletalAnimation, Player, AnimationController,
                      FollowerGhostState, CoinStack, CharacterBob]
    └ MonsterShadow, Prop_Axe01, crossbow001(꺼짐)
  ground_fog
  TreeField          [ScatterField]           ← 나무 500그루
  BuildSpots
    Warehouse        [CoinGroundStack, ScatterExclude] + plane2x2_ground 2D 카드
```

**즉 지금 플레이하면**: 조이스틱으로 움직여 나무를 베고, 통나무가 튀어나와 등 뒤에 쌓이는 것까지는 된다. **소켓도 일꾼도 건물도 하나도 안 나온다**(두 배열이 비어 있어서).

---

## 2. 🔴 최대 난제 — 자원에 "종류"라는 개념이 없다

이 기획의 중심은 **나무 / 철 / 칼 / 돈 네 가지를 구분해서 옮기는 것**인데, 현재 경제 코드는 자원을 **구분 없는 1종**으로 다룬다. 실측:

| 지점 | 현재 |
|---|---|
| `CoinEvents.ResourceDropped` | payload가 `(pos, count, source)` — **종류 필드가 없다** |
| `CoinStack` (등 뒤) | `stackCoinPrefab` **1개**, `_stack` 배열 **1개**. 종류 구분 없음 |
| `CoinGroundStack` (창고) | 마찬가지로 1종만 쌓인다 |
| `Coin` / `CoinPool` | 종류 개념 없음 |
| `SocketManager.SocketResource` | `Coin` / `Wood` enum이 **있긴 하다** — 그러나 **소켓 프리팹을 고르는 용도뿐**이고 경제로 흐르지 않는다 |

> 🔴 **이걸 먼저 정하지 않으면 뒤의 모든 작업이 두 번 일이 된다.** 나무·철을 창고에 따로 쌓고, 플레이어가 둘을 같이 싣고 대장간에 가고, 칼을 다시 싣고 상점에 가는 동선이 전부 여기에 얹힌다.

**선택지 (사용자 결정 필요)**

| 안 | 방식 | 장점 | 단점 |
|---|---|---|---|
| **A. 자원 타입 확장** | `ResourceType` enum을 만들고 `ResourceDropped` payload·`CoinStack`·`CoinGroundStack`에 타입을 흘린다 | 구조가 정직하다. 자원이 더 늘어도 대응됨 | **공유 코드를 건드린다 → 씬 1·2 회귀 테스트 필수**(규칙 10) |
| **B. 스택을 종류별로 분리** | `CoinStack`을 종류마다 하나씩 붙이고(등 뒤 3개), 이벤트도 종류별로 나눈다 | 공유 코드 수정이 적다 | 등 뒤 위치 충돌 관리가 번거롭고, "지금 무엇을 싣고 있나"를 코드가 모른다 |
| **C. 씬 3 전용 신규 경제** | 기존 코인 경제를 안 건드리고 타이쿤용을 새로 짠다 | 씬 1·2 무위험 | **규칙 1(씬별 코드 포크 금지) 위반** |

**추천: A** — 규칙 5(새 `@property`·필드의 기본값을 기존 동작과 같게)를 지키면 씬 1·2는 영향받지 않는다. `ResourceType.Coin = 0`을 기본값으로 두면 기존 씬은 전부 코인으로 동작한다. 【추론】

---

## 3. 🟡 있지만 고쳐야 하는 것

### 3-1. 일꾼 — 나무는 되고 철이 안 된다
`CoinCourier`에 **`harvestFromTrees`(나무를 베는 일꾼)가 이미 구현되어 있다** — "가장 가까운 나무를 찾아가 베고, 등이 차면 도착 무더기(창고)에 부어넣고 다시 나간다". 광산 버전이 없을 뿐이다.
- 할 일: 채집 대상을 "나무"로 하드코딩하지 말고 **채집원(`Choppable`) 종류**로 일반화. 광산도 `Choppable`의 한 형태로 만들면 코드 추가가 거의 없다. 【추론】
- `routes` 배열은 **MCP로 못 쓴다** → 인스펙터 또는 씬 JSON 패치.

### 3-2. 일꾼 달구지 — 외형만 붙어 있고 안 움직인다
- 2026-09-17: `T_Worker.prefab`에 `Wagon` 노드 + `T_Wagon.mtl` 추가. **`_enabled: false`**.
- 남은 일: `assets/Bob_new/animation/@Wagon_*.glb` 7개를 **규칙 9대로 `assets/tycoon/models/`로 분기** → `T_CharAnimGraph`에 Wagon Idle/Move 상태 추가 → 일꾼이 짐을 실었을 때 그 상태로 전이.
- 실측 근거: `@Wagon_*` 7개는 전부 `Bone_Wagon`+바퀴 트랙 보유 / 현재 씬 3 클립 4개(`Axe_Idle` `Axe_Move` `Axe_Attack01` `Chop`)는 **0개**.

### 3-3. 창고 — 1칸뿐
`Warehouse`의 `CoinGroundStack` 1개만 있다. 나무/철 2칸이 되려면 **2절의 자원 타입**이 선행되어야 한다.

### 3-4. HUD — 카운터가 1개
`WoodCounter`만 있다. 철·돈 카운터 2개 추가. `CoinCounterUI`가 어떤 자원을 세는지 지정할 수 있어야 한다(현재는 코인 전역 카운트로 추정 — **미확인**).

### 3-5. 게임 종료
`GameManager`·`EndingEffect`·`CtaClick`은 있지만 씬 3에 배선되지 않았다. **엔딩 조건 자체가 미정**(명세 6절).

---

## 4. 🔴 새로 만들어야 하는 것

### 4-1. 소켓 A — "플레이어가 서 있으면 일정 시간마다 일꾼 배출"
기존 소켓은 전부 **"코인을 N개 채우면 1회 보상"** 방식이라 그대로 못 쓴다.
- 쓸 수 있는 재료: `Socket.repeatable`(채워도 안 사라지고 리셋), `PlayerMoveTrigger`(플레이어 노드 감시 패턴), `Socket`의 발동 반경 판정.
- 새 컴포넌트 예: `SpawnerSocket` — 반경 안에 플레이어가 있는 동안만 타이머를 돌려 주기마다 일꾼 1명. 광산 해금 시 2번째가 생기고 배출하는 일꾼 종류만 다르다.
- **인스펙터로 노출할 것**: 배출 주기, 일꾼 프리팹, 일꾼 종류, 동시 상한, 반경.

### 4-2. 대장간 합성
- 재료 소켓(나무·철)에 쌓인 것을 소비해 칼 1개 산출. 산출물이 쌓이는 자리 필요.
- **미정**: 재료 소켓이 1개인지 2개인지, 합성 비율(명세 6절 1·3번).

### 4-3. 손님 NPC
- 스폰 → 상점으로 이동 → 칼 1개 소비 → 돈 지급 → 퇴장.
- 재사용 가능한 재료: `RushPath`(경로 이동), `MonsterSpawner`(주기적 스폰·풀링 패턴). **둘 다 전투용이라 그대로는 못 쓰고 패턴만 참고.** 【추론】
- **미정**: 스폰 위치·주기·외형·지불액(명세 6절 5번).

### 4-4. 레일 자동 운반
- 구간 2개 고정: `창고 → 대장간`, `대장간 → 상점`.
- 해금은 소켓 D(기존 `Socket` + `TriggerId`)로 충분하다 — **해금 자체는 새로 만들 게 없다.**
- 새로 만들 것은 **운반 연출**: 레일 위를 자원이 흘러가 도착지 스택에 들어가는 것. 개체 수가 늘어나므로 **풀링 필수**(`CoinPool` 패턴 재사용).

### 4-5. 광산
- `Choppable`의 변형으로 만들면 채집 코드 재사용이 가능하다. 【추론】
- **철 에셋이 들어온 뒤 착수**(사용자 지시).

---

## 5. 씬 3에 없는 에셋

| 필요 | 현재 |
|---|---|
| 기지 | `models/build/base.glb` `base2.glb`가 프로젝트에 있으나 **씬 3용 사본 없음**(규칙 9) |
| 일꾼 생성 건물 | 없음 |
| 나무 창고 | **있음** (`Warehouse`, 2D 카드) |
| 광산 | 없음 |
| 대장간 | 없음 |
| 상점 | 없음 |
| 레일 | 없음 |
| 철 (자원 오브젝트) | **없음 — 사용자가 직접 제작** |
| 칼 | 없음 |
| 손님 캐릭터 | 없음 (기존 캐릭터 재활용 가능) |

> 규칙 9: 씬 3이 쓰는 자산은 **전부 `assets/tycoon/` 아래 사본**이어야 한다. 새 에셋을 넣을 때 분기부터 한다.

---

## 6. 착수 순서 제안

의존 관계상 이 순서가 아니면 되돌아오는 일이 생긴다.

| 단계 | 내용 | 선행 조건 |
|---|---|---|
| **0** | **자원 타입 설계 확정** (2절 A/B/C 중 선택) | 사용자 결정 |
| 1 | 자원 타입을 경제에 흘리기 + **씬 1·2 회귀 확인**(규칙 10) | 0 |
| 2 | `SocketManager.sockets` / `CoinCourierManager.routes` 채우기 → **일단 굴러가게** | — (지금도 가능) |
| 3 | 소켓 A(`SpawnerSocket`) 신규 | 1 |
| 4 | 건물 배치 + `BuildingTrigger` 배선 (기지·일꾼건물·광산) | 에셋 |
| 5 | 광산 채집 + 철 | **철 에셋** |
| 6 | 대장간 합성 | 1, 5, 기획 확정 |
| 7 | 상점 + 손님 NPC | 6 |
| 8 | 레일 2구간 | 7 |
| 9 | 엔딩 + CTA | 8 |

> **2번은 지금 당장 할 수 있다** — 배열만 채우면 현재 코드로도 "벌목 → 일꾼 → 창고" 루프가 돈다. 구조 작업 전에 한 번 굴려보는 편이 낫다. 【추론】

---

## 7. 참고 — 씬 3이 안 쓰는 스크립트 (39개)

전투 계열이 대부분이다. 타이쿤에는 전투가 없으므로 **그대로 두면 된다** — 씬이 참조하지 않으면 빌드에도 안 들어간다.

`AudioManager` `BossRushManager` `BuildingTrigger`\* `Bullet` `Coin`\* `CoinCourier`\* `CoinEvents`\* `CtaClick` `DoorAutoOpen` `DoorHealth` `DustPuffFx`\* `EditorGizmoController` `EndingEffect` `FallingCoinVisual` `FollowerFormation` `FollowerMovement` `GuideCompass` `HitEffect` `MapBounds` `Monster` `MonsterDeadEffect` `MonsterDeadEffectSpawner` `MonsterHealthBar` `MonsterHealthBarManager` `MonsterHpBarView` `MonsterSpawner` `PlayerMoveTrigger` `PulseScale` `RushPath` `StructureHealthBar` `StructureHealthBarManager` `StructureHitFlash` `StructureUpgradeManager` `TowerAttack` `TriggerId`\* `UnitSocketManager` `VirtualWall` `WebglGuard` `WorldUIAnchor`

\* = 컴포넌트로 붙어 있진 않지만 **코드에서 쓰인다**(이벤트 버스, 런타임 생성, enum 등). "미사용"이 아니다.
