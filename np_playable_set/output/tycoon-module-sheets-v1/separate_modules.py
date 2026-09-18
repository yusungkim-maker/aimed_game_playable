"""User-authorized, deterministic PNG layer separation; never modifies inputs."""
from pathlib import Path
from collections import deque
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).parent
OUT=ROOT.parent/'tycoon-separated-v1'
QA=ROOT/'qa'
SIZE=768
FACILITIES=[
 ('01-headquarters.png','01_메인기지','HQ'),
 ('02-worker-lodge.png','02_일꾼숙소','WorkerLodge'),
 ('03-lumber-warehouse.png','03_목재창고','LumberWarehouse'),
 ('04-mine-active-inactive.png','04_철광산','IronMine'),
 ('05-blacksmith.png','05_대장간','Blacksmith'),
 ('06-sword-shop.png','06_무기판매소','SwordShop'),
]

def main_component(mask):
    # Original is one discrete object per cell. Remove detached generation speckles.
    h,w=mask.shape
    seen=np.zeros_like(mask,dtype=bool)
    largest=[]
    for y,x in zip(*np.where(mask)):
        if seen[y,x]: continue
        seen[y,x]=True; q=deque([(int(y),int(x))]); comp=[]
        while q:
            cy,cx=q.popleft(); comp.append((cy,cx))
            for dy,dx in ((-1,0),(1,0),(0,-1),(0,1)):
                ny,nx=cy+dy,cx+dx
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True; q.append((ny,nx))
        if len(comp)>len(largest): largest=comp
    out=np.zeros_like(mask,dtype=np.uint8)
    if largest:
        ys,xs=zip(*largest); out[ys,xs]=255
    return Image.fromarray(out)

def hull(points):
    pts=sorted(set(points))
    if len(pts)<3: return pts
    def cross(o,a,b): return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    low=[]; up=[]
    for p in pts:
        while len(low)>=2 and cross(low[-2],low[-1],p)<=0: low.pop()
        low.append(p)
    for p in reversed(pts):
        while len(up)>=2 and cross(up[-2],up[-1],p)<=0: up.pop()
        up.append(p)
    return low[:-1]+up[:-1]

def separate(cell):
    arr=np.array(cell); a=arr[:,:,3]
    core=main_component(a>=175)
    support=np.array(core.filter(ImageFilter.MaxFilter(3)))>0
    # Eliminate low-alpha matte speckles; preserve a narrow antialias transition.
    ba=np.clip((a.astype(float)-145)*255/103,0,255).astype(np.uint8)
    ba[~support]=0
    rgb=arr[:,:,:3].copy(); rgb[ba==0]=0
    body=Image.fromarray(np.dstack((rgb,ba)))

    # Real cast-shadow pixels in these RGBA sources occupy the low-alpha band.
    grow=np.array(core.filter(ImageFilter.MaxFilter(5)))>0
    candidate=(a>=24)&(a<160)&(~grow)
    cast=main_component(candidate)
    ca=np.array(cast)>0
    ys,xs=np.where(ca)
    if not len(xs): raise ValueError('No cast shadow found')
    # Complete the occluded ground shadow toward contact, constrained to the
    # building interior: no invented visible shadow outside the original shape.
    by,bx=np.where(ba>=250)
    bottom=int(by.max())
    foot=(by>=bottom-16)
    anchors=[(int(bx[foot].min()),bottom-2),(int(bx[foot].max()),bottom-2)]
    pts=list(zip(xs[::5].tolist(),ys[::5].tolist()))+anchors
    fill=Image.new('L',cell.size,0); ImageDraw.Draw(fill).polygon(hull(pts),fill=255)
    hidden=(np.array(fill)>0)&(np.array(core.filter(ImageFilter.MinFilter(3)))>0)
    # Reconnect the 2px extraction gap, but only where source alpha exists.
    expanded=np.array(cast.filter(ImageFilter.MaxFilter(5)))>0
    bridge=expanded & (a>=24)
    sm=np.where(ca|hidden|bridge,255,0).astype(np.uint8)
    # Supersampled equivalent edge softening < 1 px; opaque interior stays flat.
    # Fill closed pinholes and seams left by imperfect generated shadow alpha.
    padded=Image.new('L',(sm.shape[1]+2,sm.shape[0]+2),0)
    padded.paste(Image.fromarray(sm),(1,1))
    outside=padded.copy(); ImageDraw.floodfill(outside,(0,0),128)
    filled=np.array(outside)[1:-1,1:-1]
    sm[filled==0]=255
    smi=Image.fromarray(sm).filter(ImageFilter.GaussianBlur(0.35))
    sa=(np.array(smi).astype(float)*0.35).round().astype(np.uint8)
    shadow=Image.new('RGBA',cell.size,(0,0,0,0)); shadow.putalpha(Image.fromarray(sa))
    return body,shadow

def close_mine(active,donor,side):
    # Both states share ALL mountain, portal frame and silhouette pixels.
    # Only the interior of the entrance is replaced by existing closed planks.
    moved=Image.new('RGBA',active.size); moved.paste(donor,(0,54))
    polys=[[(316,414),(449,367),(449,502),(316,550)],
           [(182,388),(302,430),(302,549),(182,509)]]
    mask=Image.new('L',active.size); ImageDraw.Draw(mask).polygon(polys[side],fill=255)
    # Keep hanging lamp and the structural diagonal braces from active base.
    d=ImageDraw.Draw(mask)
    if side==0:
        d.ellipse((379,364,425,432),fill=0)
    else:
        d.ellipse((205,371,251,440),fill=0)
    out=Image.composite(moved,active,mask)
    out.putalpha(active.getchannel('A'))
    return out

def place(body,shadow):
    # Add working margin before extending any cast-shadow tip clipped by the atlas.
    pad=64
    oldshadow=np.array(shadow.getchannel('A'))
    bpad=Image.new('RGBA',(755,755)); bpad.paste(body,(pad,pad)); body=bpad
    spad=Image.new('RGBA',(755,755)); spad.paste(shadow,(pad,pad)); shadow=spad
    touched=np.where(oldshadow[:,-1]>30)[0]
    if len(touched)>3:
        alpha=shadow.getchannel('A'); d=ImageDraw.Draw(alpha)
        ymin,ymax=int(touched.min())+pad,int(touched.max())+pad
        edge=626+pad
        d.polygon([(edge-1,ymin),(edge+30,max(pad,ymin-14)),
                   (edge+40,(ymin+ymax)//2-6),(edge-1,ymax)],fill=89)
        shadow.putalpha(alpha)
    # Seal extraction seams and fill holes after tip completion, retaining one
    # uniform-opacity ground silhouette rather than disconnected visible scraps.
    binary=shadow.getchannel('A').point(lambda v:255 if v>=40 else 0)
    binary=binary.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    flooded=binary.copy(); ImageDraw.floodfill(flooded,(0,0),128)
    clean=np.array(binary); clean[np.array(flooded)==0]=255
    aa=Image.fromarray(clean).filter(ImageFilter.GaussianBlur(0.35))
    shadow.putalpha(aa.point(lambda v:round(v*89/255)))
    bbox=body.getchannel('A').getbbox()
    dx=round(SIZE/2-(bbox[0]+bbox[2])/2); dy=690-bbox[3]
    result=[]
    for im in (body,shadow):
        dst=Image.new('RGBA',(SIZE,SIZE)); dst.paste(im,(dx,dy)); result.append(dst)
    return result, (dx,dy)

def preview(body,shadow,bg):
    out=Image.new('RGBA',body.size,bg)
    out.alpha_composite(shadow); out.alpha_composite(body)
    return out.convert('RGB')

def main():
    OUT.mkdir(exist_ok=True); QA.mkdir(exist_ok=True)
    manifest=[]; alltiles=[]
    for source,folder,prefix in FACILITIES:
        im=Image.open(ROOT/source).convert('RGBA')
        cells=[im.crop((x,y,x+627,y+627)) for x,y in [(0,0),(627,0),(0,627),(627,627)]]
        pairs=[separate(c) for c in cells]
        if prefix=='IronMine':
            pairs[2]=(close_mine(pairs[0][0],pairs[2][0],0),pairs[0][1].copy())
            pairs[3]=(close_mine(pairs[1][0],pairs[3][0],1),pairs[1][1].copy())
        dest=OUT/folder; dest.mkdir(exist_ok=True)
        panel=Image.new('RGB',(1024,1152),'#e5e7eb'); draw=ImageDraw.Draw(panel)
        for i,(body,shadow) in enumerate(pairs):
            (body,shadow),offset=place(body,shadow)
            state=('Active' if i<2 else 'Inactive') if prefix=='IronMine' else ('Basic' if i<2 else 'Expanded')
            # Left/Right names refer to sheet orientation rather than object-local normals.
            direction='ViewA' if i%2==0 else 'ViewB'
            stem=f'{prefix}_{state}_{direction}'
            body.save(dest/f'{stem}_Body.png'); shadow.save(dest/f'{stem}_Shadow.png')
            x=(i%2)*512; y=(i//2)*576
            panel.paste(preview(body,shadow,(170,190,125,255)).resize((512,512)),(x,y+32))
            draw.text((x+12,y+12),stem,fill='black')
            # small shadow-only thumbnail makes layer separation reviewable.
            sbg=Image.new('RGBA',(SIZE,SIZE),'white'); sbg.alpha_composite(shadow)
            panel.paste(sbg.convert('RGB').resize((150,150)),(x+350,y+410))
            manifest.append({'folder':folder,'stem':stem,'size':[SIZE,SIZE],'translation':offset})
        panel.save(QA/f'{prefix}-layers.jpg',quality=94)
        alltiles.append(panel.resize((512,576)))
    contact=Image.new('RGB',(1536,1152),'white')
    for i,t in enumerate(alltiles): contact.paste(t,((i%3)*512,(i//3)*576))
    contact.save(QA/'all-layers.jpg',quality=95)
    (QA/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Prepared',len(manifest),'variants /',len(list(OUT.glob('*/*.png'))),'PNG layers at',OUT)

if __name__=='__main__':main()
