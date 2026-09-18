from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).parent
OUT=ROOT/'08_건물_통일수정_v2'
font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',20)
small=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',14)
board=Image.new('RGB',(1800,1440),(239,240,234));d=ImageDraw.Draw(board)
for index,folder in enumerate(sorted(p for p in OUT.iterdir() if p.is_dir())):
    px=(index%3)*600;py=(index//3)*720
    d.text((px+18,py+14),folder.name,fill=(30,35,30),font=font)
    for j,path in enumerate(sorted(folder.glob('*_Body.png'))):
        body=Image.open(path).convert('RGBA');shadow=Image.open(path.with_name(path.name.replace('_Body','_Shadow'))).convert('RGBA')
        union=Image.alpha_composite(shadow,body)
        bbox=union.getbbox();bbox=(max(0,bbox[0]-24),max(0,bbox[1]-24),min(1024,bbox[2]+24),min(1024,bbox[3]+24))
        tile=union.crop(bbox);tile.thumbnail((284,270),Image.Resampling.LANCZOS)
        bg=Image.new('RGBA',(300,310),(181,197,154,255));bg.alpha_composite(tile,((300-tile.width)//2,(290-tile.height)//2))
        x=px+(j%2)*300;y=py+55+(j//2)*330
        board.paste(bg.convert('RGB'),(x,y))
        label=path.stem.split('_',1)[1].replace('_Body','').replace('_',' / ')
        d.text((x+10,y+290),label,fill=(30,35,30),font=small)
board.save(OUT/'전체_비교.jpg',quality=96)
print(OUT/'전체_비교.jpg')
