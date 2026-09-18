// 씬·프리팹·애니그래프의 구 fbx uuid를 신 glb uuid로 치환한다.
// node apply_remap.js            → 드라이런 (파일 안 건드림)
// node apply_remap.js --write    → 실제 적용 (.bak 백업 생성)
const fs = require('fs');
const path = require('path');

const PROJ = 'C:/Users/김유성/Desktop/cocos creator practice/np_playable_set';
const { map } = JSON.parse(fs.readFileSync(path.join(__dirname, 'remap.json'), 'utf8'));
const WRITE = process.argv.includes('--write');

// 긴 id(서브에셋 포함)부터 치환해야 한다.
// 루트 uuid를 먼저 바꾸면 "<uuid>@<sub>" 의 앞부분만 바뀌어 서브에셋 id가 깨진다.
const keys = Object.keys(map).sort((a, b) => b.length - a.length);

const targets = [];
(function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) w(p);
    else if (/\.(scene|prefab|animgraph|animask|mtl|anim)$/.test(e.name)) targets.push(p);
  }
})(path.join(PROJ, 'assets'));

let totalHits = 0, changedFiles = 0;
const summary = [];

for (const p of targets) {
  let t = fs.readFileSync(p, 'utf8');
  const before = t;
  let hits = 0;
  const detail = {};
  for (const k of keys) {
    if (!t.includes(k)) continue;
    const n = t.split(k).length - 1;
    t = t.split(k).join(map[k]);
    hits += n;
    detail[k] = n;
  }
  if (!hits) continue;
  changedFiles++; totalHits += hits;
  summary.push({ file: path.relative(path.join(PROJ, 'assets'), p).split(path.sep).join('/'), hits, detail });
  if (WRITE) {
    if (!fs.existsSync(p + '.bak')) fs.writeFileSync(p + '.bak', before);
    fs.writeFileSync(p, t);
  }
}

console.log((WRITE ? '=== 적용 완료 ===' : '=== 드라이런 (파일 안 건드림) ===') + '\n');
for (const s of summary) console.log('  ' + String(s.hits).padStart(3) + '건  ' + s.file);
console.log('\n합계: ' + totalHits + '건 / ' + changedFiles + '개 파일');

// 잔존 검사: 치환 후에도 구 id가 남아 있으면 안 된다
if (WRITE) {
  let left = 0;
  for (const p of targets) {
    const t = fs.readFileSync(p, 'utf8');
    for (const k of keys) if (t.includes(k)) { console.log('  ⚠ 잔존: ' + k + ' in ' + p); left++; }
  }
  console.log('구 id 잔존: ' + left + '건');
}
