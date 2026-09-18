# Cocos Creator 3.8 — UI 시스템 & 화면비 대응

## 1. 3계층 구조

1. **Canvas의 Fit Width / Fit Height (스케일링 정책)**
   - Canvas의 `UITransform`(Content Size, Anchor Point)은 Project Settings의 Design Resolution에 자동 동기화되며 인스펙터에서 잠겨(lock) 있다 — 직접 수정 불가.
   - `Fit Height` 체크: 세로 기준을 유지하고 가로가 넓은 화면에서는 좌우가 잘림(crop).
   - `Fit Width` 체크: 가로 기준을 유지하고 세로가 긴 화면에서는 위아래가 잘림.
   - 둘 다 체크: 레터박스(Show-All) 방식으로 잘리는 부분 없이 여백이 생김.

2. **Widget 컴포넌트 (개별 노드의 반응형 위치)**
   - 고정 좌표 대신 화면 가장자리 기준 앵커로 위치를 정의.
   - `Align Mode` 3종:
     - `ONCE`: 최초 1회만 정렬하고 이후 비활성화 (성능 가장 좋음, 런타임에 화면비가 안 바뀌는 경우)
     - `ALWAYS`: 매 프레임 재계산 (비용 가장 큼, 런타임에 레이아웃이 계속 바뀌는 경우에만 사용)
     - `ON_WINDOW_RESIZE`: 최초 1회 + 실제 리사이즈 이벤트 발생 시에만 재정렬 — **정적인 HUD의 권장 기본값** (공식 문서: "성능을 크게 개선한다")

3. **Safe Area 컴포넌트**: 노치/컷아웃 대응.

## 2. Node의 Mobility 속성 — UI와 무관

`Static`/`Stationary`/`Movable`은 **라이팅/라이트맵 베이킹 분류**이지 UI 레이아웃과는 무관하다. 2D UI 노드에서는 신경 쓸 필요 없음. (Static: 직접+간접광 모두 베이킹, Stationary: 간접광만 베이킹, Movable: 실시간 계산.)

## 3. 3D 월드 좌표를 따라다니는 UI (몬스터 머리 위 체력바 등)

Unity의 "World Space Canvas"에 해당하는 기본 프리셋이 Cocos에는 없다. 대신 매 프레임 `camera.convertToUINode(worldPos, uiNode, out)`으로 3D 월드 좌표를 UI 노드의 로컬 좌표로 직접 변환해야 한다.

- `convertToUINode`는 내부적으로 원점 보정, 카메라 rect, 현재 해상도/Fit 정책까지 반영해서 변환해주는 **공식 API**이므로 이 방식이 정석이다.
- **흔한 실수**: `camera.worldToScreen()`이 반환하는 좌표는 디바이스 화면 픽셀 공간(좌하단 원점)이라, `visibleSize/windowSize` 비율로 단순 스케일링하면 중심 정렬(recentering)이 빠져서 화면비가 좁아질수록 오차가 커지는 버그가 재발한다. `convertToUINode`를 쓰는 이유가 바로 이런 수동 보정을 피하기 위함.
- 화면 clamp(가장자리에 붙여 계속 보이게)가 필요하면, clamp 기준이 되는 부모 컨테이너의 `UITransform.contentSize`가 실제 화면 크기와 동기화되어 있어야 한다 (기본값 100×100인 채로 방치되면 clamp 범위가 틀어짐). 반대로 "화면 밖으로 나가면 그냥 안 보여도 된다"는 요구사항이면 clamp 로직 자체를 빼는 게 훨씬 단순하다 — 이 경우 컨테이너 크기 동기화 자체가 불필요해진다.

## 4. 요약: 증상별 원인 매핑

| 증상 | 유력 원인 |
|---|---|
| 화면비별로 HUD가 잘리거나 위치가 밀림 | Canvas Fit Width/Height 정책 미스매치, Widget 미사용(고정좌표) |
| 3D 월드 추적 UI가 화면비 좁을수록 위로 밀림 | worldToScreen 수동 스케일링(재중심화 누락) — convertToUINode로 교체 |
| 3D 월드 추적 UI가 이상한 지점에서 잘림/안 보임 | clamp 기준 부모 컨테이너의 contentSize가 실제 화면과 미동기화 |
