# testproject 아키텍처 용어집 (AppLovin 플레이어블 광고)

프로젝트 경로: `testproject/assets/scripts/`. 러쉬 디펜스류 게임으로 추정(코인 수집 → 소켓 충족 → 추종자 획득 → 몬스터 러쉬 방어 구조).

## 소켓(Socket) 시스템 — 코인으로 추종자를 얻는 코어 루프

- **`SocketManager.ts`**: 소켓들을 순서대로 하나씩만 스폰. `SocketConfig[]` 배열(요구 코인 개수, 보상 추종자 수, 유도 화살표 표시 여부)을 인스펙터에서 자유롭게 추가/삭제. 첫 번째 소켓 충족 시 `MonsterSpawner.startRushByName()`으로 러쉬 시작.
- **`Socket.ts`**: 개별 소켓의 상태(코인 카운트, 충족 여부) 관리. `SocketSetup` 인터페이스로 필요한 참조(플레이어 노드, 추종자 프리팹, 포메이션 등)를 주입받음. 충족되면 `onFulfilled` 콜백 호출 후 스스로 사라짐.
- **`SocketGuideArrow.ts`**: 화살표 UI의 show/hide. `CLIP_NAME='appear'` 애니메이션 클립을 재생 — 단, 실제 UI_arrow 에셋에는 애니메이션 클립이 없어 문제가 됐던 이력 있음(트러블슈팅 로그 #2).
- **`Socket_L.prefab` / `Socket_S.prefab`**: 실제 사용 중인 소켓 프리팹(크기 대/소). `Socket.prefab`(구버전)은 더 이상 사용 안 함 — 헷갈리지 말 것.
- **`UI_arrow.prefab` / `UI_arrow.glb`**: 유도 화살표 3D 에셋. 스켈레톤 없는 단순 플레인 메쉬(`Plane.004.mesh`).

## 몬스터 체력바 시스템

- **`MonsterHealthBar.ts`**: 몬스터 노드에 얇게 붙는 컴포넌트. `onDamaged(hp, maxHp)` 호출 시 최초 1회 풀에서 뷰를 빌려오고, 이후 데미지마다 `setRatio()` 호출. 무피해 몬스터는 체력바 자체를 생성 안 함.
- **`MonsterHealthBarManager.ts`**: 싱글턴. `MonsterHealthBars` 컨테이너 노드 아래 `MonsterHpBarView` 인스턴스를 풀링(pool)해서 재사용 — 몬스터 스폰/사망이 잦은 러쉬 디펜스 특성상 GC 비용 절감 목적.
- **`MonsterHpBarView.ts`**: 실제 화면 위치 계산 담당. 매 프레임 `target`(몬스터) 위치 + `offsetY * target.worldScale.y`를 `camera.convertToUINode()`로 변환. **화면 clamp 없음** — 화면 밖으로 나가면 그냥 숨김(`node.active=false`). 카메라 뒤에 있어도 숨김.
- **`WorldUIAnchor.ts`**: 범용 3D→UI 앵커 스크립트. **플레이어용 체력바**에 쓰이는 것으로 확인됨(몬스터용 아님, 혼동 주의). `MonsterHpBarView`와 달리 화면 가장자리 clamp 로직이 있고, 그 기준이 `this.node.parent`의 `UITransform.contentSize`.

## 화면비 대응

- **`UIAutoFit.ts`**: UI 카메라 노드에 붙여서 화면비에 따라 `orthoHeight`와 부모(Canvas)의 `contentSize`를 동적 재계산하는 스크립트. **트러블슈팅 로그 #5 시점 기준 어떤 노드에도 부착되지 않은 상태였음** — 재확인 필요.

## 기타 확인된 스크립트 (상세 미분석, 존재만 파악)

`StructureHealthBar.ts` / `StructureHealthBarManager.ts`(구조물 체력바, Monster쪽과 유사 구조로 추정), `BossRushManager.ts`, `BuildingTrigger.ts`, `DoorAutoOpen.ts`, `DoorHealth.ts`, `GuideCompass.ts`, `TowerAttack.ts`, `UnitSocketManager.ts`, `VirtualWall.ts`, `FollowerFormation`(플레이어 추종자 대형), `MonsterSpawner`(몬스터/러쉬 스폰) — 필요 시 개별적으로 파일을 열어 상세 분석할 것.

## 참고 경로

- 프로젝트 루트: `C:\Users\김유성\Desktop\cocos creator practice\testproject`
- 스크립트: `assets/scripts/`
- 프리팹: `assets/prefabs/`
- 씬: `assets/scenes/scene.scene` (씬2 `assets/scenes/xp_np.scene`, 씬3 `assets/scenes/tycoon.scene`)
