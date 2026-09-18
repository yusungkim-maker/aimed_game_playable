from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).parent
OUT=ROOT/'shadow_v3_work'; OUT.mkdir(exist_ok=True)
for file in sorted((ROOT/'raw').glob('*.png')):
    im=Image.open(file).convert('RGBA')
    for level,y in [('basic',0),('expanded',627)]:
        cell=im.crop((0,y,627,y+627));bg=Image.new('RGBA',cell.size,(220,228,205,255));bg.alpha_composite(cell)
        d=ImageDraw.Draw(bg)
        for k in range(0,627,50):
            d.line((k,0,k,627),fill=(230,30,30,110));d.text((k+2,2),str(k),fill='black')
            d.line((0,k,627,k),fill=(230,30,30,110));d.text((2,k+2),str(k),fill='black')
        bg.save(OUT/f'{file.stem}-{level}-grid.png')
