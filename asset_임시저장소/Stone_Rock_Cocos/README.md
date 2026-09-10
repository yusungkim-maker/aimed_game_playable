# 돌 (Rock) — Cocos Creator 용

Neuphoria 프로젝트의 바위 에셋을 **Cocos Creator 3.x** 에서 쓸 수 있는 파일만 추린 것이다.
Unity 전용 파일(`.meta`, `.mat`, `.prefab`)은 모두 제외했다.

원본 씬에서는 이 메시 하나를 스케일만 바꿔 large / medium / small 세 개로 배치해 썼다.
크기 변형이 필요하면 노드 스케일만 조절하면 된다.

## 파일

```
Stone_Rock_Cocos/
├─ Env_Share_RockA.fbx              바위 메시 (스태틱, 스켈레톤 없음)
└─ Textures/
   ├─ Env_Share_Rock_Brown_D.png    Albedo, 512×512          ← 기본
   ├─ Env_Share_Rock_Brown_N.png    Normal Map, 512×512      ← 기본
   ├─ Env_Share_Rock_Brown_PBR.png  ★Cocos용 PBR 맵, 512×512 ← 기본 (이번에 새로 생성)
   ├─ Env_Share_Rock_Brown_MS.png   Unity 원본 Metallic/Smoothness (참고용, 안 써도 됨)
   ├─ Env_Share_Rock_Dark_D.png     어두운 색 변형 Albedo (선택)
   └─ Env_Share_Rock_N.png          공용 Normal 변형 (선택, 16bit)
```

## 임포트 순서

1. `Env_Share_RockA.fbx` 와 `Textures/` 를 Cocos 프로젝트의 `assets/` 아래로 드래그한다.
   Cocos Creator 는 FBX 를 내부적으로 glTF 로 변환해 임포트한다. 이 FBX 는 바이너리
   FBX 7.4 이고 스켈레톤·스키닝이 없는 순수 스태틱 메시라 그대로 들어간다.
2. 임포트된 FBX 를 펼쳐 Prefab 노드를 씬으로 끌어다 놓는다 (`MeshRenderer`).
3. 머티리얼을 새로 만든다 (`builtin-standard`). Unity 머티리얼은 넘어오지 않는다.

## 머티리얼 설정 (builtin-standard)

| Cocos 슬롯 | 텍스처 |
|---|---|
| Albedo Map / Main Texture | `Env_Share_Rock_Brown_D.png` |
| Normal Map | `Env_Share_Rock_Brown_N.png` |
| PBR Map (Occlusion/Roughness/Metallic) | `Env_Share_Rock_Brown_PBR.png` |

- `USE NORMAL MAP`, `USE PBR MAP` 체크를 켜야 해당 슬롯이 나타난다.
- **노멀맵 규약은 손댈 필요 없다.** 원본이 OpenGL 규약(Y+)이고 Cocos 도 같은 규약이다.

### PBR 맵에 대해 — 중요

Unity 원본 `Env_Share_Rock_Brown_MS.png` 는 Unity 규약(`R=Metallic`, `A=Smoothness`)이라
**Cocos 에 그대로 물리면 반사가 엉뚱하게 나온다.** Cocos/glTF 는 `R=AO, G=Roughness, B=Metallic`
규약을 쓴다.

그래서 채널을 변환한 `Env_Share_Rock_Brown_PBR.png` 를 미리 만들어 두었다.
변환식은 `AO=1(흰색, 원본에 AO 없음)`, `Roughness = 1 − Smoothness`, `Metallic = R` 이다.
**이 파일을 쓰면 된다.**

참고로 실측값은 Metallic `0~24/255`(사실상 비금속), Roughness `223~255/255`(매우 거침) 로
거의 상수에 가깝다. 그래서 PBR 맵을 아예 안 쓰고 머티리얼에서
**Metallic `0`, Roughness `0.95`** 로 직접 넣어도 결과는 거의 같다. 더 가볍기도 하다.

## 선택 텍스처

- `Env_Share_Rock_Dark_D.png` — 어두운 색 변형. Albedo 를 이걸로 바꾸면 다른 톤의 바위가 된다.
  원본 프로젝트에서는 Emission 슬롯에 물려 있었지만 그건 이 프로젝트 특유의 사용법이라 무시해도 된다.
- `Env_Share_Rock_N.png` — 공용 Normal 변형(디테일용). 16bit PNG 라 일부 파이프라인에서
  경고가 날 수 있다. 필요 없으면 빼도 된다.

## 참고

- Cocos 는 FBX 보다 **glTF/GLB 임포트가 더 안정적**이다. 문제가 생기면
  Blender 로 `.glb` 재export 한 뒤 넣는 것을 권한다.
- FBX 에 텍스처가 임베드돼 있지 않아 자동 연결은 되지 않는다. 위 표대로 수동 연결할 것.
- 사내 공용 에셋이므로 자유롭게 사용하면 된다.
