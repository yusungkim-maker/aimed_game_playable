# Cocos Creator 플레이어블 광고 최적화 가이드
> **대상 엔진**: Cocos Creator 3.8.x
> **목표 플랫폼**: AppLovin (Web Mobile, 단일 HTML 파일 5MB 미만)
> **근거**: 실제 프로젝트 빌드 최적화 과정에서 검증된 내용만 기술

---

## 플레이어블 광고란?

일반 게임 빌드와 달리 플레이어블 광고는:
- **단일 HTML 파일** 또는 **압축 후 5MB 이하** 조건이 있음 (AppLovin 기준)
- 외부 네트워크 요청 없이 자기 완결적으로 동작해야 함
- 가능한 짧은 로딩 시간, 최소한의 에셋으로 구성

일반 빌드처럼 "일단 만들고 나중에 최적화"하면 대부분 용량 초과. **처음부터 최적화를 전제로 제작**해야 한다.

---

## 1. 빌드 크기 구성 이해

Cocos Creator 3.x의 Web Mobile 빌드는 다음 구조로 구성된다:

```
build/web-mobile/
├── cocos-js/
│   └── cc.js          ← 엔진 코어 (약 2MB, 포함 모듈에 따라 가변)
├── assets/
│   ├── main/          ← 게임 에셋 (번들 JSON + native 파일)
│   └── internal/      ← CC 내부 에셋 (약 863KB)
├── src/               ← 게임 스크립트
└── index.html
```

**최대 절감 가능 항목**:
| 항목 | 절감 가능량 |
|---|---|
| 미사용 엔진 모듈 (cc.js) | 300~600KB |
| 스카이박스 큐브맵 | 500~900KB |
| 과도한 텍스처 해상도 | 수백KB |
| 미사용 에셋 참조 제거 | 가변 |

---

## 2. 엔진 모듈 최소화 (검증됨)

### 설정 위치
`settings/v2/packages/engine.json`

### 핵심 원칙
**`includeModules` 배열에는 실제로 사용하는 모듈만** 남긴다.
불필요한 모듈이 `_value: true`로 되어 있어도, `includeModules`에 없으면 빌드에서 제외된다.

### 플레이어블 광고용 최소 구성 예시
```json
"includeModules": [
  "base",
  "gfx-webgl",
  "3d",
  "animation",
  "skeletal-animation",
  "2d",
  "ui",
  "graphics"
]
```

### 모듈별 포함 여부 판단표
| 모듈 | 포함 조건 |
|---|---|
| `base` | 항상 필요 |
| `gfx-webgl` | 항상 필요 (WebGL 렌더러) |
| `3d` | 3D 메시/모델 사용 시 |
| `animation` | 애니메이션 사용 시 |
| `skeletal-animation` | SkeletalAnimation 컴포넌트 사용 시 |
| `2d` | UI, Sprite 사용 시 |
| `ui` | Button, Label 등 UI 컴포넌트 사용 시 |
| `graphics` | cc.Graphics 컴포넌트 사용 시 (조이스틱 등) |
| `custom-pipeline` | 커스텀 렌더 파이프라인 사용 시 |
| `audio` | 효과음/BGM 사용 시만 포함 |
| `particle` | 파티클 이펙트 사용 시만 포함 |
| `marionette` | AnimationGraph 상태머신 사용 시만 포함 |
| `mask` | cc.Mask 컴포넌트 사용 시만 포함 |
| `tween` | cc.tween() 사용 시만 포함 |
| `spine-3.8` / `spine-4.2` | Spine 애니메이션 사용 시만 포함 |
| `physics-ammo` | 물리 엔진 사용 시만 포함 |

> ⚠️ `_value: true`로 캐시에 표시되어 있어도 `includeModules`에 없으면 실제 빌드에서 제외된다.
> 단, 해당 `_value`도 `false`로 바꾸는 것이 명확하다.

---

## 3. 씬(Scene) 파일 주의사항

### 3-1. 스카이박스 텍스처 참조 제거 (검증됨)

`_enabled: false`로 스카이박스를 비활성화해도, UUID 참조가 남아 있으면 빌드에 포함된다.

**잘못된 상태** (빌드에 큐브맵 포함됨):
```json
"__type__": "cc.SkyboxInfo",
"_enabled": false,
"_envmapHDR": { "__uuid__": "d032ac98-...@b47c0" },
"_envmap":    { "__uuid__": "d032ac98-...@b47c0" },
"_envmapLDR": { "__uuid__": "6f01cf7f-...@b47c0" }
```

**올바른 상태** (빌드에서 제외됨):
```json
"__type__": "cc.SkyboxInfo",
"_enabled": false,
"_envmapHDR": null,
"_envmap":    null,
"_envmapLDR": null
```

→ `scene.scene`을 텍스트 에디터로 직접 수정하거나, 에디터에서 SkyboxInfo의 각 텍스처 슬롯을 비워야 한다.

### 3-2. 컴포넌트 `__type__`에 UUID 사용 금지 (검증됨)

씬 파일에서 컴포넌트의 `__type__`이 클래스명 대신 **UUID**로 저장되는 버그가 있다.

**잘못된 상태** (빌드 크래시):
```json
{
  "__type__": "071cfb3a-8179-423f-a47d-223688537f10",
  "_id": "UIAutoFitComponent01"
}
```

**올바른 상태**:
```json
{
  "__type__": "UIAutoFit",
  "_id": "UIAutoFitComponent01"
}
```

→ 빌드 시 `TypeError: Cannot read properties of undefined (reading 'value')` 에러로 나타남.
→ 에디터에서 컴포넌트를 제거하고 다시 추가하거나, `scene.scene`에서 직접 수정한다.

### 3-3. SkeletalAnimation 설정

런타임에 `addClip()`으로 클립을 추가하는 경우:
```json
"_useBakedAnimation": false,
"playOnLoad": false,
"_defaultClip": null,
"_clips": []
```
- `playOnLoad: true` + `_defaultClip: null` 조합은 런타임 에러 발생
- `_useBakedAnimation: true` 상태에서 `addClip()` 불가

---

## 4. 에셋 관리 규칙

### 4-1. 텍스처 해상도 최소화 (검증됨)

배경/지형처럼 가까이 보지 않는 텍스처는 해상도를 줄여도 품질 차이가 거의 없다.

| 텍스처 용도 | 권장 최대 해상도 |
|---|---|
| UI 아이콘 | 실제 표시 픽셀 수 기준 |
| 캐릭터/몬스터 | 512×512 |
| 배경/지형 | 256×256 ~ 512×512 |
| 스카이박스 | 사용하지 않음 권장 |

**Node.js를 활용한 텍스처 압축** (sharp 라이브러리):
```bash
cd /tmp && npm install sharp
node -e "
const sharp = require('./node_modules/sharp');
sharp('input.png')
  .resize(256, 256)
  .png({ compressionLevel: 9 })
  .toFile('output.png')
  .then(info => console.log(info));
"
```

### 4-2. 에셋 폴더에 임시 파일 두지 않기 (검증됨)

`assets/` 폴더 내에 `.bak`, `.tmp` 등 임시 파일을 두면 **에디터가 자동으로 에셋으로 인식해 UUID를 부여**하고 빌드 대상에 포함시킨다.

- 백업 파일은 반드시 `assets/` 폴더 **외부**에 저장
- 실수로 생성된 경우 `.meta` 파일도 함께 삭제

### 4-3. 에셋은 `@property`로만 참조 (검증됨)

런타임 UUID 로딩(`assetManager.loadAny({ uuid })`)은 에디터 프리뷰에서만 동작하고, **빌드에서는 해당 에셋이 번들에 포함되지 않는다.**

```typescript
// ❌ 빌드에서 동작하지 않음
assetManager.loadAny({ uuid: 'xxxxxxxx-...' }, (err, clip) => { ... });

// ✅ 빌드에서 동작함
@property(AnimationClip) clipIdle: AnimationClip | null = null;
```

### 4-4. SpriteFrame subMeta 주의 (검증됨)

이미지를 Sprite로 사용할 때 meta 파일의 subMeta가 `"imported": false`인 경우 라이브러리 JSON이 생성되지 않아 **빌드 크래시**가 발생한다.

에러 메시지: `TypeError: Cannot read properties of undefined (reading 'value')`

수동 복구 방법:
1. `assets/UI/image.png.meta`의 subMeta에서 `"imported": true` 설정
2. `library/xx/UUID@f9941.json` (SpriteFrame) 생성
3. `library/xx/UUID@6c48a.json` (Texture2D) 생성
4. `library/.assets-data.json`에 해당 서브에셋 항목 추가

→ **애초에 이 문제를 피하려면**: 이미지를 에디터에서 Sprite 타입으로 설정한 후 에디터 콘솔에 임포트 완료 로그가 뜨는 것을 확인하고 씬에서 사용한다.

---

## 5. 런타임 방어 코드 (검증됨)

빌드 환경에서 SpriteFrame이 없으면 `fillRange` 접근 시 크래시:
```typescript
// ❌ 크래시 발생
this.hpBar.fillRange = this._hp / this.maxHp;

// ✅ 안전한 코드
if (this.hpBar && this.hpBar.spriteFrame) {
    this.hpBar.fillRange = this._hp / this.maxHp;
}
```

---

## 6. 빌드 전 체크리스트

### ✅ 에셋 체크

- [ ] `assets/` 폴더 내에 `.bak`, `.tmp`, `.orig` 등 임시 파일 없음
- [ ] 모든 텍스처 해상도가 용도에 맞게 조정되었는가
- [ ] 스카이박스를 사용하지 않는다면 scene.scene의 SkyboxInfo에서 `_envmapHDR/LDR/envmap` 모두 `null`
- [ ] 빌드에 포함될 필요 없는 에셋은 `@property` 참조에서 제거

### ✅ 씬 파일 체크

- [ ] 모든 컴포넌트의 `__type__`이 UUID가 아닌 **클래스명** (예: `"UIAutoFit"`)
  - 확인 방법: `scene.scene`에서 `"__type__".*[0-9a-f]{8}-` 패턴으로 검색
- [ ] SkeletalAnimation의 `playOnLoad: false` (defaultClip이 없는 경우)
- [ ] SkeletalAnimation의 `_useBakedAnimation: false` (런타임 addClip 사용 시)
- [ ] 씬에서 참조하는 모든 SpriteFrame의 meta가 `imported: true` 상태
  - 확인 방법: 에디터에서 해당 이미지를 클릭했을 때 Inspector에 SpriteFrame이 보이는지 확인

### ✅ 엔진 모듈 체크 (`settings/v2/packages/engine.json`)

- [ ] `includeModules` 배열에서 실제 사용하는 모듈만 남김
- [ ] 미사용 확인 방법: 스크립트에서 해당 기능 import/사용 여부 검색
  ```bash
  grep -r "tween\|Audio\|particle\|Mask\|marionette\|spine" assets/scripts/
  ```

### ✅ 스크립트 체크

- [ ] Sprite.fillRange 접근 시 `spriteFrame` null 체크
- [ ] 런타임 UUID 로딩 없이 모든 에셋이 `@property`로 참조됨

### ✅ 빌드 후 크기 확인

```bash
# 빌드 폴더 전체 크기
du -sh build/web-mobile/

# 파일별 크기 확인 (상위 20개)
find build/web-mobile -type f | while read f; do
  echo "$(stat -c%s "$f") $f"
done | sort -rn | head -20
```

**5MB 초과 시 확인 순서**:
1. `cocos-js/cc.js` → 엔진 모듈 추가 제거
2. `assets/main/native/*.png` → 텍스처 해상도 축소
3. 스카이박스 파일(`d032ac98`, `6f01cf7f` 등) 존재 시 → scene.scene 스카이박스 참조 제거

---

## 7. 빌드 에러 대응

### `TypeError: Cannot read properties of undefined (reading 'value')`

**진단 방법**:
```bash
python -c "
import json
with open('library/.assets-data.json', encoding='utf-8') as f:
    data = json.load(f)
scene_uuid = '여기에_씬_UUID'
deps = data[scene_uuid]['value'].get('depends', [])
for dep in deps:
    if dep not in data:
        print('NOT IN DATA:', dep)
"
```

**원인별 해결**:

| 원인 | 해결 |
|---|---|
| `__type__`에 UUID 사용 | scene.scene에서 클래스명으로 수정 |
| SpriteFrame 라이브러리 JSON 없음 | `@f9941.json`, `@6c48a.json` 수동 생성 + meta `imported: true` + `.assets-data.json` 항목 추가 |
| 삭제된 에셋의 UUID가 씬에 남음 | 씬에서 해당 참조 제거 후 에디터 재저장 |

---

## 8. 권장 작업 순서 (처음부터 최적화를 고려한 개발 플로우)

1. **프로젝트 생성 직후**
   - `engine.json`에서 사용할 모듈만 `includeModules`에 등록
   - 스카이박스 비사용 시 scene에서 즉시 null 처리

2. **에셋 추가 시**
   - 텍스처는 용도에 맞는 최소 해상도로 준비
   - 이미지를 Sprite로 쓸 경우 에디터에서 Sprite 타입 설정 후 Import 완료 확인
   - 임시/백업 파일은 `assets/` 외부에 보관

3. **스크립트 작성 시**
   - 에셋 참조는 `@property` 사용, UUID 하드코딩 금지
   - Sprite 접근 전 null 체크 코드 작성

4. **빌드 직전**
   - 체크리스트 전체 확인
   - 씬 파일 UUID-as-type 검색: `grep -n '"__type__".*[0-9a-f]\{8\}-' assets/*.scene`
   - 빌드 후 크기 측정

---

## 참고: 이번 프로젝트 최적화 결과

| 항목 | 변경 전 | 변경 후 | 절감 |
|---|---|---|---|
| 스카이박스 큐브맵 | ~850KB | 0KB | -850KB |
| ground.png (1024×1024) | 622KB | 92KB | -530KB |
| 엔진 모듈 제거 | 포함 | 미포함 | -수백KB |
| **빌드 합계** | **6.9MB** | **5MB 미만** | **약 2MB 절감** |
