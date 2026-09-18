# testproject 트러블슈팅 로그 (AppLovin 플레이어블 광고)

증상 → 원인 → 해결 순서로 기록. 같은 증상이 재발하면 여기부터 먼저 대조할 것.

---

## 1. 빌드가 부팅 로고 이후로 안 넘어감 (Error 3702, ground.png)

- **증상**: 새로 빌드한 AppLovin.html이 Cocos 부팅 로고에서 멈춤.
- **원인**: `ground.png`의 uuid(`521abd8c-e9b7-4f84-ad28-7118b1913cf3@6c48a`)에 해당하는 `library/` 캐시 JSON이 비어있거나 손상됨.
- **해결**: 해당 텍스처 재저장/재임포트 + 씬 저장 → 재빌드로 해결 확인(스크린샷상 정상 플레이 화면).
- **재발**: 이후 "최적화"한 빌드에서 **ground.png + coin.png 동시에** 같은 에러 재발. 개별 재임포트로는 근본 해결이 안 되는 반복 패턴으로 판단, `library`/`temp` 폴더 전체 삭제 후 재임포트를 권고함 (실제 적용 여부는 마지막으로 확인된 시점 기준 미확인).
- **교훈**: Error 3702가 여러 에셋에 걸쳐 재발하면 개별 수정이 아니라 캐시 자체를 의심할 것.

## 2. 소켓의 유도 화살표(UI_arrow) 메쉬가 안 보임

- **증상**: Socket_L/Socket_S 프리팹에 내장된 화살표 UI가 렌더링되지 않음.
- **원인 A**: `UI_arrow.prefab`이 스켈레톤 없는 정적 플레인 메쉬(`Plane.004.mesh`, glb 원본에 skeleton/animation 서브 에셋 자체가 없음)에 `SkinnedMeshRenderer` + `SkeletalAnimation`을 붙여둠 → `_skeleton`/`_defaultClip` uuid가 허공 참조라 렌더링 실패.
- **원인 B**: `SocketManager.ts`의 `SocketConfig.showGuideArrow` 기본값이 `false`라, 인스펙터 배열에서 개별 소켓마다 체크 안 하면 `Socket.activate()`가 `node.active=false`로 꺼버림.
- **해결 방향(제시함, 최종 적용 미확인)**: `SkinnedMeshRenderer`→`MeshRenderer` 교체, `SkeletalAnimation` 제거(움직임 필요시 스크립트로 bob 모션 구현), `showGuideArrow`는 인스펙터에서 소켓별로 명시적 체크.

## 3. 2D 체력바 HUD가 화면비마다 잘리거나 위치가 밀림

- **증상**: 세로/가로/모바일 등 화면비에 따라 HUD가 보였다 안 보였다 하고 위치가 미묘하게 다름.
- **원인**: Canvas의 Fit Width/Fit Height 정책과 개별 노드의 Widget 컴포넌트(또는 그 부재)의 조합 문제. Canvas의 UITransform은 Design Resolution에 잠겨 자동 동기화되므로 직접 수정 불가 — Fit 정책 + Widget 앵커로 대응해야 함.
- **해결 방향**: 정적 HUD는 Widget의 Align Mode를 `ON_WINDOW_RESIZE`로 설정해 화면 가장자리 기준으로 앵커링.

## 4. 몬스터 머리 위 체력바가 세로 화면비로 갈수록 위로 밀리며 사라짐

- **증상**: 가로 화면에서는 정상, 세로 비율로 갈수록 체력바가 점점 위로 밀리다 화면 밖으로 사라짐.
- **1차 시도(잘못된 접근, 기록으로 남김)**: `camera.worldToScreen()` 결과를 `visibleSize/windowSize` 비율로 수동 스케일링하는 방식을 제안했으나, 중심 좌표계 보정(recentering)이 빠져있어 화면비가 좁아질수록 오차가 커지는 동일한 버그를 재생산하는 잘못된 해결책이었음 — 실제 사용 중인 `WorldUIAnchor.ts`가 이미 공식 API `camera.convertToUINode()`를 정석대로 쓰고 있다는 지적을 받고 정정함.
- **추가 발견**: `MonsterHealthBars` 컨테이너 노드의 `UITransform.contentSize`가 Cocos 기본값 100×100인 채로 방치되어, 이걸 clamp 기준으로 쓰는 로직이 있다면 오작동 소지가 있음 — 단, 아래 항목 참고.
- **중요한 재확인**: 실제 몬스터 체력바는 `WorldUIAnchor.ts`가 아니라 별도의 `MonsterHpBarView.ts`가 담당하며, 이 스크립트는 **애초에 화면 clamp 로직이 없음**(주석: "몬스터가 화면 밖으로 나가면 그냥 안 보이는 게 맞다"). 즉 `MonsterHealthBars` contentSize=100×100 버그는 **플레이어용 WorldUIAnchor 경로에만 해당**하고, 몬스터 체력바가 세로에서 밀리는 현상과는 별개 원인일 가능성이 높음 — 진짜 원인은 3D 월드 카메라(`MonsterHealthBarManager.worldCamera`) 자체의 화면비 대응(FOV/orthoHeight 재계산 여부) 쪽일 가능성이 큼. **최종 확정 원인·해결은 아직 파일로 재검증되지 않음.**
- **경과**: 이후 사용자가 별도 세션(오푸스)에 요청해 "다 고쳐졌다"고 보고함 — 실제로 어떤 파일이 어떻게 바뀌었는지는 이 로그 작성 시점 기준 미검증. 재발 시 `WorldUIAnchor.ts`, `MonsterHpBarView.ts`, `UIAutoFit.ts`, `scene.scene`의 `MonsterHealthBars` 노드를 다시 대조할 것.

## 5. UIAutoFit.ts가 존재하지만 미사용 상태였음

- **증상**: 화면비 대응용으로 설계된 `UIAutoFit.ts`(카메라 orthoHeight + Canvas contentSize를 화면비에 맞게 동적 조정)가 있는데도 문제가 해결 안 됨.
- **원인**: 파일의 mtime이 프로젝트 생성 시점 그대로였고, `scene.scene` 전체를 grep해도 "UIAutoFit" 문자열이 0건 — 즉 어떤 노드에도 부착된 적이 없고 저장도 안 된 상태.
- **교훈(반복 패턴)**: 이 프로젝트에서 "에디터에서 논의만 하고 실제 저장은 안 됨" 패턴이 최소 3회 반복됨(코인 경제 씬 와이어링, Socket.prefab UI_arrow 추가, 이 건). 수정 완료 보고를 받으면 항상 파일 mtime과 실제 내용을 재확인할 것.

## 6. Cocos Creator에서 드래그 앤 드랍이 전체적으로 안 됨

- **증상**: 에디터 안 모든 드래그 앤 드랍(에셋→인스펙터, 에셋→씬, Hierarchy 재정렬 등)이 갑자기 작동 안 함.
- **원인**: Cocos 자체 버그가 아니라 **윈도우 탐색기 창 하나가 응답 없음(멈춤) 상태**였고, 윈도우의 OLE 기반 드래그 앤 드랍 메커니즘이 이 멈춘 창 때문에 시스템 전체적으로 막힌 것으로 추정.
- **해결**: 작업 관리자에서 "응답 없음"인 탐색기 창만 골라 작업 끝내기(또는 explorer.exe 재시작)로 해결 시도.

## 7. 빌드 용량 최적화 과정에서 발견한 것들

- Spine 2D 런타임(`spine-CC34fKUR.wasm` 등)이 프로젝트에서 실제로 안 쓰는데도 번들에 포함되어 있었음 — Spine 관련 참조가 어딘가 남아있으면 자동 포함되는 Cocos 번들러 특성.
- `ground_new.png`(343KB), `ground_fog.png`(300KB)가 텍스처 중 가장 큰 비중 차지.
- 빌드 안에 bullet/box2d 피직스가 실제로는 포함 안 됐는데 제네릭 로더 문자열만 보고 오판할 뻔함 — 실제 데이터 유무는 반드시 디코딩해서 확인.
