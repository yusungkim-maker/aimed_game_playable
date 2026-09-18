from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

ROOT = Path(__file__).parent
OUT = ROOT / 'qa'
OUT.mkdir(exist_ok=True)
for p in ROOT.glob('*.png'):
    im = Image.open(p).convert('RGBA')
    a = np.asarray(im)[:,:,3]
    print(p.name, [(lo,hi,int(((a>=lo)&(a<=hi)).sum())) for lo,hi in [(1,20),(21,100),(101,159),(160,219),(220,255)]])
    bg = Image.new('RGBA', im.size, (169,186,116,255))
    bg.alpha_composite(im)
    bg.convert('RGB').resize((752,752)).save(OUT / p.name)
    if 'mine' in p.name:
        for i,(x,y) in enumerate([(0,0),(627,0),(0,627),(627,627)]):
            cell = im.crop((x,y,x+627,y+627))
            bg = Image.new('RGBA',cell.size,(180,200,155,255)); bg.alpha_composite(cell)
            d=ImageDraw.Draw(bg)
            for k in range(0,627,50):
                d.line((k,0,k,627),fill=(255,0,0,80)); d.text((k+2,3),str(k),fill='black')
                d.line((0,k,627,k),fill=(255,0,0,80)); d.text((2,k+3),str(k),fill='black')
            bg.save(OUT / f'mine-grid-{i}.png')
