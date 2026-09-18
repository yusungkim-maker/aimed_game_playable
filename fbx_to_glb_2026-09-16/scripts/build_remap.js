// 구 .fbx 서브에셋 id → 신 .glb 서브에셋 id 대응표를 만든다.
// 대응 근거: 같은 원본 .fbx를 같은 변환기로 돌렸으므로 서브에셋 생성 순서가 동일하다.
//   (메시는 이름까지 일치함을 확인했고, 씬이 참조하는 인덱스가 씬의 노드 이름과 맞아떨어지는 것으로 교차검증했다)
const fs = require('fs');
const path = require('path');

const PROJ = 'C:/Users/김유성/Desktop/cocos creator practice/np_playable_set';
const BACKUP = 'C:/Users/김유성/Desktop/fbx_meta_backup_2026-09-16/assets';

// 구(fbx) → 신(glb) 파일 대응. 씬 3의 Axe 클립 3개는 공유 폴더 → tycoon 으로 분기한다(규칙 9).
const PAIRS = [
  ['NPC_Summon/Mesh/NPC_TTSummon_001_Mesh.fbx', 'NPC_Summon/Mesh/NPC_TTSummon_001_Mesh.glb', '씬1·2 메시'],
  ['NPC_Summon/Animation/@Idle.fbx', 'NPC_Summon/Animation/@Idle.glb', '씬1·2 클립'],
  ['NPC_Summon/Animation/@Move.fbx', 'NPC_Summon/Animation/@Move.glb', '씬1·2 클립'],
  ['NPC_Summon/Animation/@One_BT_Attack01.fbx', 'NPC_Summon/Animation/@One_BT_Attack01.glb', '씬1·2 클립'],
  ['NPC_Summon/Animation/@One_BT_Idle.fbx', 'NPC_Summon/Animation/@One_BT_Idle.glb', '씬1·2 클립'],
  ['NPC_Summon/Animation/@One_BT_Move.fbx', 'NPC_Summon/Animation/@One_BT_Move.glb', '씬1·2 클립'],
  ['tycoon/models/NPC_TTSummon_001_Mesh.fbx', 'tycoon/models/NPC_TTSummon_001_Mesh.glb', '씬3 메시'],
  ['NPC_Summon/Animation/@Axe_Attack01.fbx', 'tycoon/models/@Axe_Attack01.glb', '씬3 클립 (분기)'],
  ['NPC_Summon/Animation/@Axe_Idle.fbx', 'tycoon/models/@Axe_Idle.glb', '씬3 클립 (분기)'],
  ['NPC_Summon/Animation/@Axe_Move.fbx', 'tycoon/models/@Axe_Move.glb', '씬3 클립 (분기)'],
];

const map = {};      // oldId -> newId
const rows = [];

for (const [oldRel, newRel, tag] of PAIRS) {
  const om = JSON.parse(fs.readFileSync(path.join(BACKUP, oldRel + '.meta'), 'utf8'));
  const nm = JSON.parse(fs.readFileSync(path.join(PROJ, 'assets', newRel + '.meta'), 'utf8'));

  map[om.uuid] = nm.uuid;                       // 루트 에셋 자체도 참조될 수 있다
  rows.push({ tag, kind: 'asset', old: om.uuid, new: nm.uuid, name: path.basename(oldRel) });

  const oaf = (om.userData && om.userData.assetFinder) || {};
  const naf = (nm.userData && nm.userData.assetFinder) || {};
  const nameOf = id => ((nm.subMetas[id.split('@')[1]] || {}).name || '?');

  for (const kind of ['meshes', 'skeletons', 'materials', 'scenes']) {
    const o = oaf[kind] || [], n = naf[kind] || [];
    if (o.length !== n.length) { rows.push({ tag, kind, error: `개수 불일치 ${o.length} vs ${n.length}` }); continue; }
    for (let i = 0; i < o.length; i++) { map[o[i]] = n[i]; rows.push({ tag, kind, idx: i, old: o[i], new: n[i], name: nameOf(n[i]) }); }
  }

  // 애니메이션 클립: 구는 split.previousId, 신은 gltf-animation 서브에셋
  const splits = [];
  for (const a of ((om.userData && om.userData.animationImportSettings) || []))
    for (const s of (a.splits || [])) splits.push(s);
  const newAnims = Object.entries(nm.subMetas || {}).filter(([, v]) => v.importer === 'gltf-animation');
  if (splits.length !== newAnims.length) {
    if (splits.length || newAnims.length) rows.push({ tag, kind: 'animation', error: `클립 수 ${splits.length} vs ${newAnims.length}` });
  } else {
    for (let i = 0; i < splits.length; i++) {
      const oldId = om.uuid + '@' + splits[i].previousId;
      const newId = nm.uuid + '@' + newAnims[i][0];
      map[oldId] = newId;
      rows.push({ tag, kind: 'animation', idx: i, old: oldId, new: newId, name: splits[i].name, wrapMode: splits[i].wrapMode });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'remap.json'), JSON.stringify({ map, rows }, null, 2));

const errs = rows.filter(r => r.error);
console.log('대응 항목: ' + Object.keys(map).length + '개   오류: ' + errs.length);
errs.forEach(r => console.log('  ⚠ ' + r.tag + '/' + r.kind + ': ' + r.error));
console.log();
for (const [oldRel, , tag] of PAIRS) {
  const g = rows.filter(r => r.tag === tag && !r.error);
  console.log(tag + '  ' + path.basename(oldRel));
}
