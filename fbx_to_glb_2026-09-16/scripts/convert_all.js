// 프로젝트의 .fbx 전부를 .glb로 변환한다.
// - 에디터가 쓰는 바로 그 변환기(FBX-glTF-conv.exe)를 사용 → 스케일/축/본 이름이 에디터 임포트와 동일
// - 애니메이션 이름은 백업 meta의 split 이름으로 패치한다.
//   이유: FBX 원본 take 이름은 'Take 001'인데, 프로젝트는 임포터에서 자른 이름('Axe_Idle' 등)을
//   코드/애니그래프에서 문자열로 참조한다. 이름이 어긋나면 에러 없이 조용히 깨진다.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONV = 'C:/ProgramData/cocos/editors/Creator/3.8.8/resources/app.asar.unpacked/node_modules/@cocos/fbx-gltf-conv/bin/win32/FBX-glTF-conv.exe';
const PROJ = 'C:/Users/김유성/Desktop/cocos creator practice/np_playable_set';
const BACKUP = 'C:/Users/김유성/Desktop/fbx_meta_backup_2026-09-16';
const OUT = process.argv[2];            // 최종 .glb 출력 루트
const TMP = path.join(OUT, '_tmp');     // 변환기 중간 산출물

for (const d of [OUT, TMP]) fs.mkdirSync(d, { recursive: true });

function walk(dir, hits) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, hits);
    else if (e.name.toLowerCase().endsWith('.fbx')) hits.push(p);
  }
  return hits;
}

// glTF(JSON) + 외부 .bin → 단일 .glb 컨테이너로 묶는다
function packGlb(gltf, bin) {
  gltf.buffers = [{ byteLength: bin.length }];
  const json = Buffer.from(JSON.stringify(gltf), 'utf8');
  const pad = n => (4 - (n % 4)) % 4;
  const jPad = Buffer.alloc(pad(json.length), 0x20);   // JSON 청크는 공백으로 패딩
  const bPad = Buffer.alloc(pad(bin.length), 0);       // BIN 청크는 0으로 패딩
  const total = 12 + 8 + json.length + jPad.length + 8 + bin.length + bPad.length;
  const h = Buffer.alloc(12); h.write('glTF', 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(total, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length + jPad.length, 0); jh.write('JSON', 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length + bPad.length, 0); bh.write('BIN\0', 4);
  return Buffer.concat([h, jh, json, jPad, bh, bin, bPad]);
}

const fbxList = walk(path.join(PROJ, 'assets'), []).sort();
const report = [];
let fail = 0;

fbxList.forEach((fbx, i) => {
  const rel = path.relative(path.join(PROJ, 'assets'), fbx).replace(/\\/g, '/');
  const row = { rel, ok: false };
  try {
    // 1) 백업 meta에서 클립 분할 정보를 읽는다 (이름 + wrapMode + previousId)
    const metaPath = path.join(BACKUP, 'assets', rel + '.meta');
    let splits = [];
    let srcUuid = null;
    if (fs.existsSync(metaPath)) {
      const m = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      srcUuid = m.uuid;
      for (const a of (m.userData?.animationImportSettings || []))
        for (const s of (a.splits || [])) splits.push(s);
    }
    row.srcUuid = srcUuid;
    row.splits = splits.map(s => ({ name: s.name, wrapMode: s.wrapMode, previousId: s.previousId }));

    // 2) 변환 (에디터와 동일한 기본 옵션)
    const work = path.join(TMP, String(i));
    fs.mkdirSync(work, { recursive: true });
    const gltfPath = path.join(work, 'o.gltf');
    execFileSync(CONV, [fbx, '--out', gltfPath], { stdio: 'pipe' });

    const gltf = JSON.parse(fs.readFileSync(gltfPath, 'utf8'));

    // 3) 외부 참조 점검 — .bin 하나 외에 다른 파일을 참조하면 glb 패킹이 불완전해진다
    const extras = fs.readdirSync(work).filter(f => !/^o\.(gltf|bin)$/.test(f));
    if (extras.length) row.warn = '외부 파일 ' + extras.join(',');
    if ((gltf.buffers || []).length !== 1) throw new Error('buffer 개수 ' + (gltf.buffers || []).length);
    if ((gltf.images || []).some(im => im.uri)) row.warn = (row.warn ? row.warn + ' / ' : '') + '외부 이미지 uri';

    // 4) 애니메이션 이름 패치 — 원본 take 이름을 프로젝트가 쓰는 split 이름으로 되돌린다
    const anims = gltf.animations || [];
    row.animBefore = anims.map(a => a.name);
    if (anims.length && splits.length) {
      const n = Math.min(anims.length, splits.length);
      for (let k = 0; k < n; k++) anims[k].name = splits[k].name;
      if (anims.length !== splits.length) row.warn = (row.warn ? row.warn + ' / ' : '') + `애니 ${anims.length} vs split ${splits.length}`;
    }
    row.animAfter = anims.map(a => a.name);

    // 5) glb 패킹
    const bin = fs.readFileSync(path.join(work, 'o.bin'));
    const glb = packGlb(gltf, bin);
    const outPath = path.join(OUT, rel.replace(/\.fbx$/i, '.glb'));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, glb);

    row.ok = true;
    row.size = glb.length;
    row.meshes = (gltf.meshes || []).length;
    row.skins = (gltf.skins || []).length;
    row.nodes = (gltf.nodes || []).length;
    row.out = rel.replace(/\.fbx$/i, '.glb');
  } catch (e) {
    row.error = String(e.message || e).slice(0, 200);
    fail++;
  }
  report.push(row);
});

fs.writeFileSync(path.join(OUT, '_report.json'), JSON.stringify(report, null, 2));
console.log(`변환 완료: 성공 ${report.length - fail} / 실패 ${fail} (전체 ${report.length})`);
const warns = report.filter(r => r.warn);
if (warns.length) { console.log('경고 ' + warns.length + '건:'); warns.forEach(r => console.log('  ' + r.rel + ' → ' + r.warn)); }
const errs = report.filter(r => r.error);
if (errs.length) { console.log('실패:'); errs.forEach(r => console.log('  ' + r.rel + ' → ' + r.error)); }
