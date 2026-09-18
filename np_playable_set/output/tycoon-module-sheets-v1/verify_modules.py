from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image, ImageDraw

ROOT=Path(__file__).parent
OUT=ROOT.parent/'tycoon-separated-v1'
report={'folders':{},'mine':{},'files':{}}
folders=sorted(p for p in OUT.iterdir() if p.is_dir())
assert len(folders)==6
for folder in folders:
    files=sorted(folder.glob('*.png')); assert len(files)==8
    report['folders'][folder.name]=len(files)
    for file in files:
        im=Image.open(file); assert im.mode=='RGBA' and im.size==(768,768)
        a=np.array(im); alpha=a[:,:,3]
        assert not alpha[0].any() and not alpha[-1].any() and not alpha[:,0].any() and not alpha[:,-1].any()
        assert alpha.any()
        if '_Shadow' in file.name:
            assert not a[:,:,:3].any()
            assert alpha.max()==89
        else:
            assert alpha.max()==255
            assert (alpha==255).sum()>10000
            shadow=file.with_name(file.name.replace('_Body','_Shadow'))
            assert shadow.exists()
        report['files'][str(file.relative_to(OUT))]=hashlib.sha256(file.read_bytes()).hexdigest()
mine=OUT/'04_철광산'
for view in ['ViewA','ViewB']:
    active=np.array(Image.open(mine/f'IronMine_Active_{view}_Body.png'))
    inactive=np.array(Image.open(mine/f'IronMine_Inactive_{view}_Body.png'))
    assert np.array_equal(active[:,:,3],inactive[:,:,3])
    delta=np.any(active!=inactive,axis=2)
    yy,xx=np.where(delta)
    # Entire upper mountain and external silhouette are byte-identical.
    assert yy.min()>400 and xx.max()-xx.min()<140 and yy.max()-yy.min()<190
    sa=(mine/f'IronMine_Active_{view}_Shadow.png').read_bytes()
    si=(mine/f'IronMine_Inactive_{view}_Shadow.png').read_bytes()
    assert sa==si
    report['mine'][view]={'identical_alpha':True,'identical_shadow':True,
        'changed_pixel_count':int(delta.sum()),'change_bbox':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]}
    proof=Image.new('RGB',(768*3,768),(220,230,210))
    for i,arr in enumerate([active,inactive]):
        bg=Image.new('RGBA',(768,768),(220,230,210,255))
        bg.alpha_composite(Image.fromarray(arr)); proof.paste(bg.convert('RGB'),(i*768,0))
    diff=Image.new('RGB',(768,768),(30,30,30)); da=np.array(diff); da[delta]=(255,180,0)
    proof.paste(Image.fromarray(da),(1536,0))
    proof.resize((1536,512)).save(ROOT/'qa'/f'mine-alignment-{view}.jpg',quality=95)
(ROOT/'qa'/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'folder_count':6,'png_count':48,'size':'768x768','mine':report['mine']},ensure_ascii=False,indent=2))
