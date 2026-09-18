from pathlib import Path
from collections import deque
import math,json,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageFont

ROOT=Path(__file__).parent; RAW=ROOT/'raw'; OUT=ROOT/'08_건물_통일수정_v2'; QA=ROOT/'qa'
OUT.mkdir(exist_ok=True); QA.mkdir(exist_ok=True)
N=1024; BASE=820; CENTER=360; SCALE=.82
TAN=math.tan(math.radians(15)); K=.8
SPECS=[('01-headquarters.png','01_메인기지','HQ'),('02-hiring-office.png','02_고용소','HiringOffice'),
 ('03-lumber-warehouse.png','03_목재창고','LumberWarehouse'),('04-iron-mine.png','04_철광산','IronMine'),
 ('05-blacksmith.png','05_대장간','Blacksmith'),('06-sword-shop.png','06_무기판매소','SwordShop')]

def keep_components(mask,minarea=65):
    h,w=mask.shape; seen=np.zeros_like(mask,dtype=bool); out=np.zeros_like(mask,dtype=np.uint8)
    for y,x in zip(*np.where(mask)):
        if seen[y,x]:continue
        q=deque([(int(y),int(x))]); seen[y,x]=True; comp=[]
        while q:
            cy,cx=q.popleft();comp.append((cy,cx))
            for dy,dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                yy,xx=cy+dy,cx+dx
                if 0<=yy<h and 0<=xx<w and mask[yy,xx] and not seen[yy,xx]:
                    seen[yy,xx]=True;q.append((yy,xx))
        if len(comp)>=minarea:
            yy,xx=zip(*comp);out[yy,xx]=255
    return Image.fromarray(out)

def clean(cell):
    arr=np.array(cell); aa=arr[:,:,3]
    mask=keep_components(aa>=150)
    # Remove the thin exterior matte/contour ring, then feather only subpixel AA.
    eroded=mask.filter(ImageFilter.MinFilter(3))
    alpha=np.array(eroded.filter(ImageFilter.GaussianBlur(.38)))
    rgb=arr[:,:,:3].astype(float)
    inside=np.array(mask.filter(ImageFilter.MinFilter(7)))>0
    ring=(alpha>0)&(~inside)
    h,w=aa.shape; sums=np.zeros((h,w,3)); counts=np.zeros((h,w))
    padded=np.pad(rgb*inside[:,:,None],((3,3),(3,3),(0,0)))
    pm=np.pad(inside.astype(float),3)
    for dy in range(7):
        for dx in range(7):
            sums+=padded[dy:dy+h,dx:dx+w];counts+=pm[dy:dy+h,dx:dx+w]
    valid=ring&(counts>0)
    rgb[valid]=sums[valid]/counts[valid,None]
    rgb[alpha==0]=0
    return Image.fromarray(np.dstack((np.clip(rgb,0,255).astype(np.uint8),alpha)))

def closed_mine(active,donor,side):
    shifted=Image.new('RGBA',active.size);shifted.paste(donor,(0,83))
    polys=[[(247,334),(337,386),(337,474),(247,446)],[(289,386),(382,333),(382,446),(289,474)]]
    mask=Image.new('L',active.size);d=ImageDraw.Draw(mask);d.polygon(polys[side],fill=255)
    if side==0:d.rectangle((261,316,296,379),fill=0)
    else:d.rectangle((330,316,364,378),fill=0)
    result=Image.composite(shifted,active,mask);result.putalpha(active.getchannel('A'))
    return result

def place(body):
    body=body.resize((round(body.width*SCALE),round(body.height*SCALE)),Image.Resampling.LANCZOS)
    box=body.getchannel('A').getbbox();dx=round(CENTER-(box[0]+box[2])/2);dy=BASE-box[3]
    out=Image.new('RGBA',(N,N));out.paste(body,(dx,dy));return out

def shadow_of(body):
    # Ground-plane completion from silhouette. Not a physically solved 3D shadow.
    # Every height-vector projection points exactly +X / -Y at 15 degrees.
    q=K*TAN; cot=1/TAN
    matrix=(1,cot,-cot*BASE,0,1/q,BASE-BASE/q)
    alpha=body.getchannel('A').transform((N,N),Image.Transform.AFFINE,matrix,Image.Resampling.BICUBIC)
    alpha=alpha.point(lambda a:round(a*89/255))
    sh=Image.new('RGBA',(N,N));sh.putalpha(alpha);return sh

def composite(body,shadow,bg=(178,194,143,255)):
    im=Image.new('RGBA',(N,N),bg);im.alpha_composite(shadow);im.alpha_composite(body);return im.convert('RGB')

def main():
    alltiles=[];report={'shadow_angle_degrees':15,'shadow_opacity':89/255,'size':[N,N],
      'anchor_pixels':[CENTER,BASE],'camera':'orthographic target elevation 45 yaw +/-45; generative approximation',
      'shadow_method':'complete silhouette projected toward screen right/up15; hidden geometry approximated',
      'files':{},'mine_checks':{}}
    for source,folder,prefix in SPECS:
        im=Image.open(RAW/source).convert('RGBA');w,h=im.size
        cells=[clean(im.crop((x,y,x+w//2,y+h//2))) for x,y in [(0,0),(w//2,0),(0,h//2),(w//2,h//2)]]
        if prefix=='IronMine':
            cells[2]=closed_mine(cells[0],cells[2],0);cells[3]=closed_mine(cells[1],cells[3],1)
        target=OUT/folder;target.mkdir(exist_ok=True)
        panel=Image.new('RGB',(1024,1120),(237,239,234));d=ImageDraw.Draw(panel)
        saved=[]
        for i,cell in enumerate(cells):
            body=place(cell);shadow=shadow_of(body)
            state=('Active' if i<2 else 'Inactive') if prefix=='IronMine' else ('Basic' if i<2 else 'Expanded')
            view='Left45' if i%2==0 else 'Right45';stem=f'{prefix}_{state}_{view}'
            for suffix,image in [('Body',body),('Shadow',shadow)]:
                path=target/f'{stem}_{suffix}.png';image.save(path)
                a=np.array(image.getchannel('A'))
                assert a.any() and not a[0].any() and not a[-1].any() and not a[:,0].any() and not a[:,-1].any(),path
                report['files'][str(path.relative_to(OUT))]=hashlib.sha256(path.read_bytes()).hexdigest()
            tile=composite(body,shadow).resize((512,512))
            x=(i%2)*512;y=(i//2)*560
            panel.paste(tile,(x,y+30));d.text((x+12,y+10),stem,fill=(40,45,40))
            saved.append((body,shadow))
        panel.save(QA/f'{prefix}-preview.jpg',quality=96);alltiles.append(panel.resize((512,560)))
        if prefix=='IronMine':
            for side in [0,1]:
                a=np.array(saved[side][0]);b=np.array(saved[side+2][0])
                assert np.array_equal(a[:,:,3],b[:,:,3])
                assert np.array_equal(np.array(saved[side][1]),np.array(saved[side+2][1]))
                diff=np.any(a!=b,axis=2);yy,xx=np.where(diff)
                report['mine_checks'][str(side)]={'alpha_identical':True,'shadow_identical':True,
                   'difference_bbox':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]}
                proof=Image.new('RGB',(1536,512),(230,235,224))
                for col,index in enumerate([side,side+2]):proof.paste(composite(saved[index][0],Image.new('RGBA',(N,N))).resize((512,512)),(col*512,0))
                delta=np.zeros((N,N,3),dtype=np.uint8);delta[diff]=(255,180,0)
                proof.paste(Image.fromarray(delta).resize((512,512)),(1024,0));proof.save(QA/f'mine-diff-{side}.jpg',quality=95)
    contact=Image.new('RGB',(1536,1120),'white')
    for i,tile in enumerate(alltiles):contact.paste(tile,((i%3)*512,(i//3)*560))
    contact.save(QA/'all-buildings-preview.jpg',quality=96)
    assert len(report['files'])==48
    assert len(list(OUT.iterdir()))==6
    for folder in OUT.iterdir():assert len(list(folder.glob('*.png')))==8
    (QA/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Verified: 6 folders, 48 RGBA PNGs, identical mine silhouette/shadows, 15-degree shadow projection.')

if __name__=='__main__':main()
