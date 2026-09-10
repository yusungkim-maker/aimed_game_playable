# Cocos Creator 플레이어블 광고 빌드 에이전트 기획서

> **참조 문서**: `playable-ad-optimization-guide.md`
> **대상 환경**: Cocos Creator 3.8.x / Windows / Node.js 22+
> **목적**: 빌드 전 최적화 체크리스트를 자동 수행하고, 문제 항목을 자동 수정 또는 명확한 경고로 보고

---

## 1. 배경 및 목적

### 문제 정의

플레이어블 광고 빌드는 5MB 제한, SpriteFrame 미임포트 크래시, 스카이박스 텍스처 잔류, UUID-as-type 버그 등 **일반 빌드에서는 드러나지 않는 문제**들이 빌드 단계에서 실패를 유발한다.

이 문제들은:
- 원인이 에러 메시지만으로 특정하기 어렵다 (`TypeError: Cannot read properties of undefined (reading 'value')` 등)
- 수작업 점검에 의존하면 매 프로젝트마다 동일한 시행착오가 반복된다
- 빌드 실패 후 원인 탐색에 수 시간이 소요될 수 있다

### 목표

빌드 버튼을 누르기 전, 또는 누른 직후 **에이전트가 자동으로 체크리스트를 수행**하여:
1. 자동 수정 가능한 항목은 즉시 수정
2. 수동 조치가 필요한 항목�� 명확한 위치와 방법을 보고
3. 5MB 초과 예상 시 구체적인 절감 방안을 제시

---

## 2. 에이전트 개요

### 명칭
**PlayableAdChecker** (이하 "에이전트")

### 실행 방식
Cocos Creator **Extension(플러그인)** 형태로 구현.
에디터 메뉴 또는 빌드 패널의 커스텀 버튼으로 실행.

### 실행 시점 (2가지 모드)

| 모드 | 트리거 | 동작 |
|---|---|---|
| **Pre-Build 모드** | 빌드 버튼 클릭 직전 | 자동 수정 수행 → 빌드 진행 또는 블로킹 |
| **Standalone 모드** | 메뉴에서 수동 실행 | 전체 보고서 출력, 수동 확인용 |

---

## 3. 체크리스트 항목 및 처리 방식

각 항목은 **[자동 수정(Auto-Fix)]** 또는 **[경고(Warn)]** 중 하나로 처리한다.

### CHECK-01. 씬 파일 UUID-as-type 검사

**감지 조건**: `scene.scene`에서 `"__type__"` 값이 UUID 패턴(`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)인 컴포넌트 존재

**원인**: 에디터가 스크립트 클래스명 대신 파일 UUID를 저장하는 버그

**처리 방식**: `[자동 수정]`
- `library/.assets-info.json`에서 해당 UUID → 파일 경로 역조회
- 스크립트 파일에서 `@ccclass('ClassName')` 파싱하여 클래스명 확인
- scene.scene에서 UUID를 클래스명으로 교체

**관련 에러**: `TypeError: Cannot read properties of undefined (reading 'value')`

```
[CHECK-01] UUID-as-type 발견
  위치: scene.scene 3645번째 줄
  UUID: 071cfb3a-8179-423f-a47d-223688537f10
  → scripts/UIAutoFit.ts → 클래스명: UIAutoFit
  → 자동 수정 완료
```

---

### CHECK-02. 스카이박스 텍스처 참조 검사

**감지 조건**: `scene.scene`의 `cc.SkyboxInfo`에서 `_enabled: false`인데 `_envmapHDR`, `_envmap`, `_envmapLDR` 중 하나라도 UUID 참조가 있는 경우

**처리 방식**: `[자동 수정]`
- 해당 필드를 모두 `null`로 교체
- 예상 절감 크기 계산 후 보고

```
[CHECK-02] 스카이박스 비활성화 상태이나 큐브맵 UUID 참조 존재
  _envmapHDR: d032ac98-... (~640KB)
  _envmapLDR: 6f01cf7f-... (~330KB)
  → 자동 null 처리 완료 (예상 절감: ~970KB)
```

---

### CHECK-03. SkeletalAnimation 설정 검사

**감지 조건**: `scene.scene`에서 `cc.SkeletalAnimation` 컴포넌트의 다음 조합 감지
- `playOnLoad: true` + `_defaultClip: null` → 런타임 에러
- `_useBakedAnimation: true` + 스크립트에서 `addClip()` 호출 → 런타임 에러

**처리 방식**:
- `playOnLoad: true` + `_defaultClip: null` → `[자동 수정]` `playOnLoad: false`로 변경
- `_useBakedAnimation: true` 감지 → `[경고]` (스크립트 확인 후 수동 결정 필요)

```
[CHECK-03] SkeletalAnimation 설정 이상
  노드: NPC_TTSummon_001
  playOnLoad: true + _defaultClip: null → 자동 수정 (playOnLoad: false)
  _useBakedAnimation: true → 경고: 런타임 addClip() 사용 시 false로 변경 필요
```

---

### CHECK-04. SpriteFrame 임포트 상태 검사

**감지 조건**: `assets/` 하위 `.meta` 파일에서 subMeta의 `"imported": false` 항목이 존재하고, 해당 UUID가 씬의 `depends`에 포함된 경우

**처리 방식**: `[자동 수정]`
1. `library/.assets-data.json`에서 씬 UUID의 `value.depends` 배열 조회
2. 각 의존 UUID에 대해 `library/XX/UUID.json` 파일 존재 여부 확인
3. 없으면 meta의 subMeta 정보(width, height 등)를 읽어 `@f9941.json`, `@6c48a.json` 생성
4. `.assets-data.json`에 해당 서브에셋 항목 추가
5. meta의 `imported: false` → `imported: true` 변경

```
[CHECK-04] SpriteFrame 라이브러리 파일 미생성 감지
  Bar_Pc_hp.png@f9941 → library/e0/e052cf49-...@f9941.json 없음
  Bar_Pc_hp.png@6c48a → library/e0/e052cf49-...@6c48a.json 없음
  → 라이브러리 파일 자동 생성
  → .assets-data.json 항목 추가
  → meta imported: true 설정
```

---

### CHECK-05. assets/ 폴더 임시 파일 검사

**감지 조건**: `assets/` 폴더 재귀 탐색에서 `.bak`, `.tmp`, `.orig`, `.backup` 확장자 파일 발견

**처리 방식**: `[경고]`
- 에디터가 자동 임포트하여 빌드 대상에 포함될 수 있음을 안내
- 파일 목록과 권장 조치(assets 외부 이동 또는 삭제) 출력
- 자동 삭제는 수행하지 않음 (데이터 손실 위험)

```
[CHECK-05] assets/ 폴더 내 임시 파일 발견
  assets/texture/ground.png.bak (622KB)
  → 빌드에 포함될 수 있습니다. assets/ 폴더 외부로 이동하세요.
```

---

### CHECK-06. 엔진 모듈 최적화 검사

**감지 조건**: `settings/v2/packages/engine.json`의 `includeModules` 배열에서 스크립트 전체에서 사용되지 않는 모듈 발견

**스크립트 분석 방법**: `assets/scripts/` 하위 모든 `.ts` 파일에서 모듈별 사용 패턴 정규식 검색

| 모듈 | 사용 감지 패턴 |
|---|---|
| `audio` | `AudioSource`, `AudioClip`, `audioEngine` |
| `particle` | `ParticleSystem`, `ParticleSystem2D` |
| `tween` | `tween(`, `cc.tween` |
| `marionette` | `AnimationGraph`, `AnimationController` |
| `mask` | `Mask` (import 구문 기준) |
| `spine-3.8` | `sp.Skeleton`, `spine.` |
| `physics-ammo` | `RigidBody`, `Collider`, `PhysicsSystem` |

**처리 방식**: `[경고]` (엔진 모듈 변경은 게임 동작에 영향을 줄 수 있어 자동 수정하지 않음)
- 제거 가능한 모듈 목록과 예상 절감 크기 안내
- 사용자가 확인 후 `engine.json` 수정

```
[CHECK-06] 제거 가능한 엔진 모듈 발견
  audio      → 스크립트 미사용, 제거 권장 (예상 절감: ~100KB)
  particle   → 스크립트 미사용, 제거 권장 (예상 절감: ~80KB)
  tween      → 스크립트 미사용, 제거 권장 (예상 절감: ~30KB)
  marionette → 스크립트 미사용, 제거 권장 (예상 절감: ~150KB)
  spine-3.8  → 스크립트 미사용, 제거 권장 (예상 절감: ~300KB)
  합계 예상 절감: ~660KB
  → settings/v2/packages/engine.json의 includeModules에서 위 항목을 제거하세요.
```

---

### CHECK-07. 텍스처 크기 검사

**감지 조건**: `assets/` 하위 PNG/JPG 파일 중 해상도가 512×512 초과인 파일 발견

**처리 방식**: `[경고]`
- 파일명, 현재 해상도, 파일 크기, 권장 해상도 출력
- Node.js sharp를 사용한 리사이즈 명령어 제안

```
[CHECK-07] 고해상도 텍스처 발견
  texture/ground.png  1024×1024  622KB → 256×256 권장 (예상 92KB)
  → 리사이즈 명령:
    node -e "require('sharp')('ground.png').resize(256,256).png({compressionLevel:9}).toFile('ground_new.png').then(console.log)"
```

---

### CHECK-08. @property 없는 에셋 참조 검사

**감지 조건**: `assets/scripts/` 하위 `.ts` 파일에서 `assetManager.loadAny` 또는 `resources.load` 호출 중 UUID 하드코딩 패턴(`'[0-9a-f]{8}-'`) 발견

**처리 방식**: `[경고]`
- 해당 코드 위치와 파일명 출력
- 빌드에서 에셋이 누락됨을 안내

```
[CHECK-08] 런타임 UUID 참조 감지 (빌드에서 에셋 누락 위험)
  scripts/Player.ts:52 → assetManager.loadAny({ uuid: '6f192739-...' })
  → @property(AnimationClip)으로 교체 필요
```

---

### CHECK-09. 빌드 결과물 크기 측정 (Post-Build)

**실행 시점**: 빌드 완료 후 자동 실행

**동작**:
1. 빌드 출력 폴더 탐색
2. 파일별 크기 측정 및 카테고리 분류
3. 5MB 초과 시 절감 가능 항목 우선순위 출력

```
[CHECK-09] 빌드 크기 보고
  cc.js (엔진)            2,024KB
  main bundle JSON         1,050KB
  internal bundle          863KB
  ground.png 텍스처         92KB
  NPC 메시/애니메이션       380KB
  기타                      300KB
  ───────────���─────────────────
  합계                    4,709KB ✅ 5MB 미만

  절감 가능 (추가 최적화 시):
  - ground.png 128×128 → 추가 ~60KB 절감 가능
```

---

## 4. 에이전트 아키텍처

```
PlayableAdChecker Extension
├── main.ts                  ← 에디터 Extension 진입점
├── checker/
│   ├── CheckRunner.ts       ← 체크 항목 순차 실행, 결과 집계
│   ├── checks/
│   │   ├── Check01_UuidAsType.ts
│   │   ├── Check02_Skybox.ts
│   │   ├── Check03_SkeletalAnim.ts
│   │   ├── Check04_SpriteFrame.ts
│   │   ├── Check05_TempFiles.ts
│   │   ├── Check06_EngineModules.ts
│   │   ├── Check07_TextureSize.ts
│   │   ├── Check08_AssetRef.ts
│   │   └── Check09_BuildSize.ts
│   └── BaseCheck.ts         ← 공통 인터페이스
├── fixer/
│   ├── SceneFileFixer.ts    ← scene.scene JSON 수정
│   ├── LibraryFixer.ts      ← library/ JSON 파일 생성
│   ├── MetaFixer.ts         ← .meta 파일 수정
│   └── DataJsonFixer.ts     ← .assets-data.json 수정
├── reporter/
│   └── ReportPanel.ts       ← 에디터 UI 패널로 결과 출력
└── utils/
    ├── SceneParser.ts       ← scene.scene JSON 파싱
    ├── MetaReader.ts        ← .meta 파일 읽기
    └── LibraryReader.ts     ← library/ 파일 읽기
```

### 인터페이스 정의

```typescript
// 각 체크 항목의 공통 인터페이스
interface CheckResult {
  id: string;             // CHECK-01 ~ CHECK-09
  status: 'pass' | 'warn' | 'error' | 'fixed';
  message: string;        // 사람이 읽을 수 있는 설명
  autoFixed: boolean;     // 자동 수정 수행 여부
  sizeSaved?: number;     // 절감된 바이트 (해당 시)
  actionRequired?: string; // 수동 조치 필요 시 구체적 안내
}

abstract class BaseCheck {
  abstract id: string;
  abstract name: string;
  abstract run(projectPath: string): Promise<CheckResult[]>;
}
```

---

## 5. 실행 흐름

```
사용자: [메뉴 > PlayableAdChecker > Run] 또는 빌드 버튼 클릭

  1. CheckRunner 시작
     ├── 프로젝트 경로 확인
     ├── scene.scene 경로 확인
     └── 체크 목록 로드

  2. Pre-Build 체크 실행 (CHECK-01 ~ CHECK-08)
     ├── CHECK-01: UUID-as-type → 자동 수정
     ├── CHECK-02: 스카이박스 → 자동 수정
     ├── CHECK-03: SkeletalAnimation → 자동 수정/경고
     ├── CHECK-04: SpriteFrame → 자동 수정
     ├── CHECK-05: 임시 파일 → 경고 출력
     ├── CHECK-06: 엔진 모듈 → 경고 출력
     ├── CHECK-07: 텍스처 크기 → 경고 출력
     └── CHECK-08: 에셋 참조 → 경고 출력

  3. 보고서 출력
     ├── 자동 수정 항목 목록
     ├── 경고 항목 목록 (조치 방법 포함)
     └── ERROR 항목 있으면 빌드 블로킹 (Pre-Build 모드)

  4. 빌드 실행 (Pre-Build 모드, 블로킹 없을 시)

  5. Post-Build 체크 실행
     └── CHECK-09: 빌드 크기 측정 및 보고
```

---

## 6. 에디터 UI 패널

### 보고서 패널 구성

```
┌─────────────────────────────────────────────────────┐
│  PlayableAd Checker                         [Run]   │
├───────────────────────���─────────────────────────────┤
│  ✅ CHECK-01  UUID-as-type         자동 수정됨       │
│  ✅ CHECK-02  스카이박스 참조       자동 수정됨 -970KB│
│  ✅ CHECK-03  SkeletalAnimation    자동 수정됨       │
│  ✅ CHECK-04  SpriteFrame 임포트   자동 수정됨       │
│  ⚠️ CHECK-05  임시 파일             수동 조치 필요   │
│  ⚠️ CHECK-06  엔진 모듈             수동 조치 필요   │
│  ⚠️ CHECK-07  텍스처 크기           수동 조치 권장   │
│  ✅ CHECK-08  에셋 참조             이상 없음        │
├─────────────────────────────────────────────────────┤
│  예상 빌드 크기: ~4.7MB ✅                          │
│  추가 최적화 시: ~4.1MB                             │
├────────────────────────────────────────────────���────┤
│  ⚠️ CHECK-05 상세                                   │
│    assets/texture/ground.png.bak (622KB)            │
│    → assets/ 폴더 밖으로 이동하세요                 │
│                                                     │
│  ⚠️ CHECK-06 상세                                   │
│    제거 권장: audio, particle, tween, marionette    │
│    → engine.json 열기  [Open File]                  │
└─────────────────────────────────────────────────────┘
```

---

## 7. 기술 구현 세부사항

### Cocos Creator Extension 등록 방법

`extensions/playable-ad-checker/package.json`:
```json
{
  "name": "playable-ad-checker",
  "version": "1.0.0",
  "main": "./dist/main.js",
  "contributions": {
    "menu": [
      {
        "path": "i18n:menu.tools/PlayableAd Checker/Run",
        "message": "playable-ad-checker:run"
      }
    ],
    "messages": {
      "run": {
        "methods": ["runChecker"]
      }
    }
  }
}
```

### 씬 파일 파싱 전략

`scene.scene`은 JSON 배열 구조이므로 표준 `JSON.parse()`로 처리:
```typescript
// 씬 JSON 로드
const sceneJson: any[] = JSON.parse(fs.readFileSync(scenePath, 'utf-8'));

// UUID-as-type 검색
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const broken = sceneJson.filter(
  obj => obj.__type__ && uuidPattern.test(obj.__type__)
);
```

### library/.assets-data.json 의존성 분석

```typescript
// 씬의 depends 배열에서 DataManager에 없는 UUID 탐지
const assetsData = JSON.parse(fs.readFileSync('.assets-data.json', 'utf-8'));
const sceneEntry = assetsData[sceneUuid];
const depends: string[] = sceneEntry?.value?.depends ?? [];

const missing = depends.filter(uuid => !(uuid in assetsData));
// missing → CHECK-04 대상
```

### SpriteFrame 라이브러리 파일 자동 생성

meta의 subMeta userData를 기반으로 생성:
```typescript
function createSpriteFrameLibrary(uuid: string, w: number, h: number): void {
  const texture2dJson = {
    "__type__": "cc.Texture2D",
    "content": {
      "base": "2,2,0,0,0,0",
      "mipmaps": [uuid.split('@')[0]]
    }
  };

  const spriteFrameJson = {
    "__type__": "cc.SpriteFrame",
    "content": {
      "name": displayName,
      "rect": { x: 0, y: 0, width: w, height: h },
      "originalSize": { width: w, height: h },
      "vertices": {
        "rawPosition": [-w/2, -h/2, 0, w/2, -h/2, 0, -w/2, h/2, 0, w/2, h/2, 0],
        "indexes": [0, 1, 2, 2, 1, 3],
        "uv": [0, h, w, h, 0, 0, w, 0],
        "nuv": [0, 0, 1, 0, 0, 1, 1, 1],
        "minPos": { x: -w/2, y: -h/2, z: 0 },
        "maxPos": { x: w/2, y: h/2, z: 0 }
      },
      "texture": `${uuid.split('@')[0]}@6c48a`,
      "packable": true,
      "pixelsToUnit": 100,
      "pivot": { x: 0.5, y: 0.5 },
      "meshType": 0
    }
  };
  // library/XX/ 하위에 파일 저장
}
```

---

## 8. 개발 단계 계획

### Phase 1 - 핵심 크래시 방지 (최우선)
- CHECK-01: UUID-as-type 자동 수정
- CHECK-04: SpriteFrame 라이브러리 자동 생성
- CHECK-02: 스카이박스 자동 null 처리
- 기본 CLI 스크립트 형태로 구현 (`node checker.js`)

### Phase 2 - 크기 최적화 보조
- CHECK-06: 엔진 모듈 미사용 분석 및 경고
- CHECK-07: 텍스처 크기 분석 및 리사이즈 명령어 제안
- CHECK-09: 빌드 결과 크기 분석

### Phase 3 - Cocos Creator Extension 통합
- 에디터 패널 UI 구현
- 빌드 전후 자동 실행 훅 연결
- CHECK-03, CHECK-05, CHECK-08 추가

### Phase 4 - 고도화
- 다중 씬 지원
- 빌드 이력 저장 및 크기 추이 그래프
- 설정 파일로 체크 항목 ON/OFF 제어

---

## 9. 제약 및 주의사항

1. **library/ 파일 직접 수정은 에디터가 실행 중일 때도 동작하나**, 에디터가 재임포트를 트리거하면 덮어씌워질 수 있다. Phase 1에서는 에디터 종료 후 실행을 권장.

2. **엔진 모듈 자동 제거는 하지 않는다.** 모듈 제거는 런타임 동작에 영향을 줄 수 있고, 스크립트 정적 분석만으로는 동적 사용(eval, string 기반 컴포넌트 생성 등)을 감지하지 못한다.

3. **scene.scene 수정 후 에디터가 자동으로 씬을 리로드할 수 있다.** CHECK-01, CHECK-02, CHECK-03 수정 후 에디터에서 씬을 다시 열어 정상 표시되는지 확인이 필요하다.

4. **다중 씬 프로젝트**: 현재 기획은 단일 scene.scene 기준. 다중 씬은 Phase 3에서 대응.

---

## 10. 기대 효과

| 항목 | 현재 (수작업) | 에이전트 도입 후 |
|---|---|---|
| 빌드 크래시 원인 파악 | 수 시간 | 즉시 (자동 수정 포함) |
| 최적화 체크 소요 시간 | 30분~수 시간 | 1분 이내 |
| 숙련도 의존도 | 높음 (직접 library 파일 구조 파악 필요) | 낮음 |
| 반복 프로젝트 시 동일 실수 | 발생 가능 | 자동 방지 |
