from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json,numpy as np
ROOT=Path(__file__).resolve().parents[1];OLD=ROOT/'08_건물_통일수정_v2';NEW=ROOT/'09_그림자보정_v3'
font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',20);small=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',14)
board=Image.new('RGB',(1800,1440),(240,242,237));d=ImageDraw.Draw(board)
checks=[]
for index,folder in enumerate(sorted(p for p in NEW.iterdir() if p.is_dir())):
    px=(index%3)*600;py=(index//3)*720;d.text((px+15,py+14),folder.name,fill='#202920',font=font)
    files=sorted(folder.glob('*_Body.png'));assert len(files)==4
    for j,path in enumerate(files):
        old=OLD/folder.name/path.name;assert hashlib.sha256(old.read_bytes()).digest()==hashlib.sha256(path.read_bytes()).digest()
        body=Image.open(path).convert('RGBA');sp=path.with_name(path.name.replace('_Body','_Shadow'));shadow=Image.open(sp).convert('RGBA')
        arr=np.array(shadow);assert shadow.size==body.size==(1024,1024) and not arr[:,:,:3].any() and arr[:,:,3].max()==89
        union=Image.alpha_composite(shadow,body);box=union.getbbox();box=(max(0,box[0]-24),max(0,box[1]-24),min(1024,box[2]+24),min(1024,box[3]+24))
        tile=union.crop(box);tile.thumbnail((280,270),Image.Resampling.LANCZOS)
        bg=Image.new('RGBA',(300,310),(194,211,163,255));bg.alpha_composite(tile,((300-tile.width)//2,(290-tile.height)//2))
        x=px+(j%2)*300;y=py+50+(j//2)*330;board.paste(bg.convert('RGB'),(x,y))
        d.text((x+10,y+290),path.stem.split('_',1)[1].replace('_Body','').replace('_',' / '),fill='#202920',font=small)
        checks.append({'file':str(sp.relative_to(NEW)),'body_unchanged':True,'shadow_sha256':hashlib.sha256(sp.read_bytes()).hexdigest()})
board.save(NEW/'전체_그림자_확인.jpg',quality=96)
# Large before/after on a checkerboard for the exact example raised by the user.
folder='01_메인기지';name='HQ_Basic_Left45';body=Image.open(NEW/folder/f'{name}_Body.png').convert('RGBA')
oldsh=Image.open(OLD/folder/f'{name}_Shadow.png').convert('RGBA');newsh=Image.open(NEW/folder/f'{name}_Shadow.png').convert('RGBA')
union=Image.alpha_composite(Image.alpha_composite(oldsh,newsh),body);box=union.getbbox();box=(box[0]-25,box[1]-25,box[2]+25,box[3]+25)
proof=Image.new('RGB',(1500,850),'white');pd=ImageDraw.Draw(proof)
for col,(label,sh) in enumerate([('이전: 단일 바닥선으로 눌린 그림자',oldsh),('수정: 부분별 높이·깊이 + Sun (0, -27, 20)',newsh)]):
    crop=Image.alpha_composite(sh,body).crop(box);crop.thumbnail((720,740),Image.Resampling.LANCZOS)
    bg=Image.new('RGBA',(750,790),'white');bd=ImageDraw.Draw(bg)
    for yy in range(0,790,16):
        for xx in range(0,750,16):
            if (xx//16+yy//16)%2==0:bd.rectangle((xx,yy,xx+15,yy+15),fill=(217,217,217,255))
    bg.alpha_composite(crop,((750-crop.width)//2,(790-crop.height)//2));proof.paste(bg.convert('RGB'),(750*col,60))
    pd.text((750*col+16,20),label,fill='black',font=font)
proof.save(NEW/'메인기지_수정전후.jpg',quality=97)
assert len(checks)==24
for side in ['Left45','Right45']:
    assert (NEW/'04_철광산'/f'IronMine_Active_{side}_Shadow.png').read_bytes()==(NEW/'04_철광산'/f'IronMine_Inactive_{side}_Shadow.png').read_bytes()
(Path(__file__).parent/'final_validation.json').write_text(json.dumps({'shadow_count':24,'unchanged_bodies':24,'checks':checks},indent=2,ensure_ascii=False),encoding='utf8')
print('QA verified: 24 unchanged bodies + 24 new aligned shadow layers.')
