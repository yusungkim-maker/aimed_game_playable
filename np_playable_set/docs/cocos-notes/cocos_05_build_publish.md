# Cocos Creator 3.8 — 빌드 용량 최적화 (HTML5 / 플레이어블 광고 특화)

## 1. 빌드 옵션 (Build Panel)

- **Debug Mode**: 끄기. 디버그 정보 포함 시 용량 증가.
- **Source Maps**: 끄기. 배포용 빌드에는 불필요.
- **Mangle Engine Internal Properties / Inline Enums** (3.8.6+): 켜면 내부 프로퍼티명을 난독화·축약해 용량 절감.
- **Feature Cropping (Project Settings)**: 안 쓰는 물리 엔진, 안 쓰는 렌더링 기능을 여기서 꺼서 번들에서 제외.

## 2. 실제 빌드 내용물 검증 방법 (중요)

HTML5 단일 파일 빌드는 `window.__adapter_zip__`에 base64+zlib 압축된 형태로 엔진 코드와 모든 에셋이 통째로 들어있다. "이 라이브러리/에셋이 진짜 포함됐는지"는 코드 안의 로더 문자열만 보고 판단하면 안 되고, 실제로 디코딩(base64 decode → zlib decompress)해서 `data:image/...;base64,`, `data:application/wasm;base64,` 같은 실데이터 블록이 있는지, 그리고 그 크기가 얼마인지 직접 확인해야 정확하다. 이렇게 하면 어떤 에셋이 용량을 얼마나 차지하는지(uuid까지 매칭해서 실제 파일명 특정) 정밀하게 파악할 수 있다.

## 3. 텍스처 최적화

- 다운스케일 기준은 **화면에 실제로 표시되는 픽셀 크기**. 원본이 그보다 훨씬 크면 무조건 축소.
- 알파 없는 이미지는 JPG로 전환 고려.
- 팔레트(인덱스 컬러) 압축 시 알파 채널을 반드시 함께 고려: 완전 투명 픽셀의 RGB 값이 팔레트/평균 계산에 섞여 들어가면 가장자리에 이상한 색 테두리(fringing)가 생긴다. 리사이즈는 premultiplied alpha 방식으로, 팔레트 생성은 alpha=0 픽셀의 RGB를 제외하고 계산해야 한다.
- GPU 압축 포맷(ASTC/ETC/PVRTC)은 VRAM에는 유리하지만 다운로드 용량 및 HTML5/웹뷰 지원 일관성 면에서는 원본 이미지 최적화(해상도/팔레트/JPG 전환)가 더 우선순위가 높다.

## 4. 매체별 특성 (참고용 — 정확한 수치는 반드시 최신 공식 문서로 재확인)

- **AppLovin MAX**: HTML5 zip 형태로 업로드, 일반적으로 5MB 이내 권장. `p.applov.in/playablePreview`에서 사전 검증 가능(MRAID 준수, 방향 대응, CTA 트리거 여부 확인). 실기기 QR 테스트는 별도의 "Playable Preview" 앱(iOS/Android)을 통함.
- **Meta(Facebook) Audience Network**: 타 매체 대비 용량 제한이 엄격한 편. 단일 HTML 권장.
- **Google AdMob / Unity Ads / ironSource(LevelPlay)**: MRAID 표준 기반, 매체별 대시보드 업로드 규격 상이.
- 정확한 KB/MB 상한, 지원 포맷 버전 등은 자주 바뀌므로 집행 직전 매체 공식 문서 재확인 필수.

## 5. 실행 환경 이해 (디버깅에 도움)

플레이어블 광고는 최종적으로 퍼블리셔 앱 안에 내장된 **네이티브 WebView(Android WebView / iOS WKWebView)** 안에서 실행된다. 즉 로컬 크롬/Playwright로 하는 테스트가 실제 매체 환경과 근본적으로 다르지 않다 — 결국 같은 웹 렌더링 엔진 위에서 돌아가기 때문. 웹뷰와 호스트 앱 사이의 통신(CTA 클릭 시 스토어 이동 등)은 MRAID 표준 JS 브릿지로 이뤄진다.
