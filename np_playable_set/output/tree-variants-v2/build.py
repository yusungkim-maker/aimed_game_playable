from PIL import Image, ImageFilter, ImageDraw
import numpy as np
from pathlib import Path
import math, json
OUT=Path(__file__).parent
GEN=Path('C:/Users/김유성/.codex/generated_images/01a0ace0-029c-7d32-b276-786d6f4161cb')
items=[('01_Standard','exec-4114f44d-58ae-45bd-abaa-1a74dcebe947.png',570,[(980,285,600),(835,255,380),(645,208,168)],80),('02_Slender','exec-77858d35-72fb-4f00-a461-b334e76c4112.png',670,[(965,162,680),(775,148,430),(595,130,127)],52),('03_Broad','exec-e609a5d1-0334-439c-9b4d-88f2d125735d.png',490,[(979,343,650),(830,300,450),(645,220,249)],88)]
C=2**-.5
RX=math.tan(math.radians(27))*math.cos(math.radians(20))
RY=math.tan(math.radians(27))*math.sin(math.radians(20))
def hull(points):
 p=sorted(set(points))
 def cross(o,a,b):return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
 lo=[];hi=[]
 for a in p:
  while len(lo)>1 and cross(lo[-2],lo[-1],a)<=0:lo.pop()
  lo.append(a)
 for a in reversed(p):
  while len(hi)>1 and cross(hi[-2],hi[-1],a)<=0:hi.pop()
  hi.append(a)
 return lo[:-1]+hi[:-1]
preview=Image.new('RGB',(1536,850),(157,177,113))
records=[]
for idx,(name,src,height,tiers,tr) in enumerate(items):
 im=Image.open(GEN/src).convert('RGBA');a=np.array(im)
 mask=Image.fromarray(np.uint8(a[:,:,3]>150)*255).filter(ImageFilter.MinFilter(5))
 # Remove colored fringe by using only opaque interior pixels, then a narrow AA edge.
 mask=mask.filter(ImageFilter.GaussianBlur(.35)); im.putalpha(mask)
 box=mask.getbbox();crop=im.crop(box);s=height/crop.height
 crop=crop.resize((round(crop.width*s),height),Image.Resampling.LANCZOS)
 body=Image.new('RGBA',(1024,1024));left=360-crop.width//2;top=820-height
 body.alpha_composite(crop,(left,top))
 body.save(OUT/f'Env_Deco_Tree_{name}_Body.png')
 # Stacked circular canopy proxy: directional projection of each tier to z=0.
 # Ring front y and radius fitted to the generated source, not a flattened silhouette.
 foot=box[3]-C*tr
 anchor=(360,820-C*tr*s)
 sh=Image.new('L',(2048,2048));d=ImageDraw.Draw(sh)
 def proj(x,y,z):return (2*(anchor[0]+s*(x+RX*z)),2*(anchor[1]-C*s*(y+RY*z)))
 def cone(radius,z,apex):
  pts=[proj(radius*math.cos(t),radius*math.sin(t),z) for t in np.linspace(0,2*math.pi,80,endpoint=False)]
  pts.append(proj(0,0,apex));d.polygon(hull(pts),fill=89)
 for front,r,ap in tiers:
  z=max(0,(foot-(front-C*r))/C);zh=max(z,(foot-ap)/C)
  cone(r,z,zh)
 pts=[proj(tr*math.cos(t),tr*math.sin(t),z) for z in [0,200] for t in np.linspace(0,2*math.pi,48,endpoint=False)]
 d.polygon(hull(pts),fill=89)
 shadow=Image.new('RGBA',(1024,1024));shadow.putalpha(sh.resize((1024,1024),Image.Resampling.LANCZOS))
 shadow.save(OUT/f'Env_Deco_Tree_{name}_Shadow.png')
 comp=Image.new('RGBA',(1024,1024),(157,177,113,255));comp.alpha_composite(shadow);comp.alpha_composite(body)
 preview.paste(comp.resize((512,512)),(idx*512,0))
 standalone=Image.new('RGBA',(1024,1024),(230,230,225,255));standalone.alpha_composite(shadow)
 preview.paste(standalone.resize((512,512)).crop((0,240,512,512)),(idx*512,540))
 ImageDraw.Draw(preview).text((idx*512+30,520),name,fill=(30,45,20))
 records.append({'variant':name,'canvas':[1024,1024],'body_bbox':body.getbbox(),'shadow_bbox':shadow.getbbox(),'shadow_method':'fitted stacked canopy volume proxy, directional ground projection'})
preview.save(OUT/'Preview.jpg',quality=94)
(OUT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf8')
(OUT/'README.txt').write_text('3 tree variants; each Body and Shadow uses the same 1024x1024 canvas. Overlay without independently trimming. Body trunk bottom anchor (360,820). Shadow alpha approximately 35%. Generated with built-in imagegen; Python alpha edge cleanup and fitted 3D canopy-proxy shadow projection. Sun XYZ Euler (0,-27,20); camera orthographic down45. Shadows approximate canopy geometry, not original mesh renders. Prompt set: matching matte low-poly olive conifers, lightly rounded scalloped tiers, no strokes or ground shadows, orthographic45; standard, tall slender, short broad. Original files preserved.',encoding='utf8')
print(json.dumps(records))
