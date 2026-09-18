// 각 .fbx가 프로젝트 어디에서 참조되는지 전수 조사한다.
// 참조는 uuid 문자열로 걸리므로, 백업 meta에서 각 fbx의 서브에셋 id를 모두 모아 검색한다.
const fs = require('fs');
const path = require('path');

const PROJ = 'C:/Users/김유성/Desktop/cocos creator practice/np_playable_set';
const BACKUP = 'C:/Users/김유성/Desktop/fbx_meta_backup_2026-09-16/assets';

const assets = [];
(function walk(d, rel) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, rel + e.name + '/');
    else if (e.name.endsWith('.fbx.meta')) {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      const u = j.uuid;
      const ids = new Set([u]);
      const af = (j.userData && j.userData.assetFinder) || {};
      for (const k of Object.keys(af)) for (const v of af[k] || []) ids.add(v);
      for (const a of ((j.userData && j.userData.animationImportSettings) || []))
        for (const s of (a.splits || [])) if (s.previousId) ids.add(u + '@' + s.previousId);
      assets.push({ rel: rel + e.name.replace(/\.meta$/, ''), uuid: u, ids: [...ids] });
    }
  }
})(BACKUP, '');

const targets = [];
(function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) w(p);
    else if (/\.(scene|prefab|animgraph|animask|mtl|anim)$/.test(e.name)) targets.push(p);
  }
})(path.join(PROJ, 'assets'));

const texts = targets.map(p => [path.relative(path.join(PROJ, 'assets'), p).split(path.sep).join('/'), fs.readFileSync(p, 'utf8')]);

for (const a of assets) {
  const hits = [];
  for (const [rel, t] of texts) {
    let n = 0;
    for (const id of a.ids) n += t.split(id).length - 1;
    if (n) hits.push(rel + '(' + n + ')');
  }
  a.hits = hits;
}

const used = assets.filter(a => a.hits.length);
const unused = assets.filter(a => !a.hits.length);

console.log('=== 참조되는 fbx: ' + used.length + '개 ===');
for (const a of used) console.log('  ' + a.rel + '\n        -> ' + a.hits.join(', '));
console.log();
console.log('=== 참조 0건 (미사용): ' + unused.length + '개 ===');
const byDir = {};
for (const a of unused) {
  const d = a.rel.replace(/\/[^/]*$/, '');
  (byDir[d] = byDir[d] || []).push(a.rel.split('/').pop());
}
for (const k of Object.keys(byDir).sort()) console.log('  ' + String(byDir[k].length).padStart(3) + '  ' + k + '/');

fs.writeFileSync(path.join(__dirname, 'usage.json'), JSON.stringify({ used, unused }, null, 2));
