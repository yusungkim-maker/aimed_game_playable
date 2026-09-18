from pathlib import Path
from PIL import Image

src=Path('C:/Users/김유성/.codex/generated_images/01a0ace0-029c-7d32-b276-786d6f4161cb')
root=Path(__file__).parent
items=[('exec-f80e1135-0283-4e13-982d-b9651175e6e7.png','wood-resource-v1','WoodLog_Resource_Ground_NoShadow.png'),
       ('exec-3139e4b6-2815-4363-9d9c-5c71c0ad1d3d.png','coin-resource-v1','Coin_N_Resource_Ground_NoShadow.png')]
preview=Image.new('RGB',(1536,768),(169,186,116))
for index,(source,folder,name) in enumerate(items):
    out=root/folder; out.mkdir(exist_ok=True)
    im=Image.open(src/source).convert('RGBA')
    alpha=im.getchannel('A').point(lambda v:0 if v<12 else (255 if v>=245 else round((v-12)*255/233)))
    im.putalpha(alpha)
    tile=im.crop(alpha.getbbox()); tile.thumbnail((900,900),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(1024,1024)); canvas.paste(tile,((1024-tile.width)//2,(1024-tile.height)//2))
    canvas.putdata([(0,0,0,0) if p[3]==0 else p for p in canvas.getdata()])
    canvas.save(out/name)
    bg=Image.new('RGBA',canvas.size,(169,186,116,255)); bg.alpha_composite(canvas)
    preview.paste(bg.convert('RGB').resize((768,768)),(index*768,0))
    print((out/name).resolve(),canvas.mode,canvas.size)
preview.save(root/'wood-coin-preview.jpg',quality=95)
