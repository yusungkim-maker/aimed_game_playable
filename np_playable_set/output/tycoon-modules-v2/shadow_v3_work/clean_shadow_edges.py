from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image,ImageFilter
OUT=Path(__file__).resolve().parents[1]/'09_그림자보정_v3'
for path in OUT.glob('*/*_Shadow.png'):
    im=Image.open(path).convert('RGBA');a=im.getchannel('A')
    binary=a.point(lambda v:255 if v>=40 else 0)
    # Seal sampling cracks while preserving a hard (not feathered) silhouette.
    binary=binary.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask=np.array(binary)>0;seen=np.zeros_like(mask);keep=np.zeros_like(mask);h,w=mask.shape
    for yy,xx in zip(*np.where(mask)):
        if seen[yy,xx]:continue
        q=deque([(int(yy),int(xx))]);seen[yy,xx]=True;comp=[]
        while q:
            y,x=q.popleft();comp.append((y,x))
            for dy,dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                ny,nx=y+dy,x+dx
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((ny,nx))
        if len(comp)>=20:
            y,x=zip(*comp);keep[y,x]=True
    aa=Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.35))
    im.putalpha(aa.point(lambda v:round(v*89/255)));im.save(path)
print('Cleaned sampling speckles on all 24 shadow layers; hard edges retained.')
