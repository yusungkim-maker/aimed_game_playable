"""Per-part height/depth reconstruction; directional ray/ground intersections.
Original body RGBA files are copied byte-for-byte, never re-rendered.
"""
from pathlib import Path
import math,json,shutil,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageFont

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'08_건물_통일수정_v2';OUT=ROOT/'09_그림자보정_v3';WORK=Path(__file__).parent
OUT.mkdir(exist_ok=True)
C=math.sqrt(.5)
RAY=(math.sin(math.radians(27))*math.cos(math.radians(20)),math.sin(math.radians(27))*math.sin(math.radians(20)),-math.cos(math.radians(27)))
RX=RAY[0]/-RAY[2];RY=RAY[1]/-RAY[2];VY=C-C*RY

# Image-space control vertices (x,y,height), source 627px quadrant coordinates.
# Heights use the same unit as horizontal image coordinates, prior to export scale.
# Ground contacts, eaves, roof ridges and protrusions are independent controls.
A={
'HQ_Basic':[(145,444,0),(356,536,0),(502,450,0),(290,360,0),(150,300,200),(350,400,190),(510,306,200),(224,160,325),(418,273,325),(520,300,210),(323,190,210),(395,145,390),(435,174,390),(439,228,310),(355,204,328),(355,85,496),(279,116,490),(279,150,442),(180,474,0),(265,516,0)],
'HQ_Expanded':[(48,353,0),(200,429,0),(380,500,0),(445,516,0),(558,456,0),(517,349,0),(338,260,0),(49,222,185),(186,296,185),(145,145,285),(272,207,285),(207,215,230),(376,322,230),(536,225,230),(267,92,385),(449,205,385),(350,140,385),(357,40,526),(421,70,526),(421,115,462),(410,126,415),(464,155,415),(438,172,365),(437,398,155),(566,330,155),(503,294,235),(375,338,235),(231,446,0),(310,486,0)],
'HiringOffice_Basic':[(171,433,0),(365,540,0),(502,470,0),(309,360,0),(169,254,252),(355,357,258),(514,286,258),(243,138,350),(415,250,350),(337,188,258),(178,397,65),(332,480,65)],
'HiringOffice_Expanded':[(110,344,0),(277,444,0),(424,535,0),(557,461,0),(399,369,0),(253,275,0),(110,175,239),(269,271,245),(416,366,239),(562,289,245),(185,67,365),(332,158,365),(479,255,365),(385,180,245),(136,327,65),(382,471,65)],
'LumberWarehouse_Basic':[(160,438,0),(380,568,0),(519,480,0),(300,349,0),(159,286,215),(373,421,208),(539,321,224),(250,150,346),(463,290,346),(354,218,224),(206,456,10),(330,526,10),(226,378,85),(317,475,50)],
'LumberWarehouse_Expanded':[(115,332,0),(251,408,0),(367,484,0),(480,504,0),(565,451,0),(510,352,0),(294,227,0),(113,177,220),(365,338,205),(520,248,220),(212,67,335),(438,225,335),(480,393,156),(570,341,156),(504,293,232),(417,346,232),(158,342,15),(307,442,15)],
'IronMine_Active':[(109,405,0),(154,475,0),(242,448,0),(350,574,0),(472,556,0),(570,497,0),(593,430,0),(483,363,0),(382,299,0),(247,339,0),(139,548,0),(185,573,0),(299,433,5),(329,479,5),(359,107,450),(300,145,395),(245,203,280),(176,246,220),(400,146,445),(445,238,325),(489,282,240),(403,273,290),(557,376,90),(199,438,40),(406,477,70),(232,293,205),(370,376,145)],
'Blacksmith_Basic':[(184,434,0),(393,531,0),(503,433,0),(95,336,0),(145,377,0),(258,336,0),(468,501,0),(285,540,0),(228,510,0),(337,508,0),(174,278,220),(385,389,200),(523,309,205),(259,161,315),(449,269,315),(190,134,385),(234,163,385),(189,188,305),(248,127,400),(324,150,425),(411,214,405),(445,241,383),(385,269,320),(271,216,320),(290,464,70),(267,495,65),(250,430,90),(469,440,86)],
'Blacksmith_Expanded':[(91,352,0),(177,414,0),(382,517,0),(468,546,0),(573,477,0),(514,356,0),(285,514,0),(231,486,0),(335,480,0),(176,324,0),(85,223,183),(174,264,214),(377,371,206),(514,281,225),(238,171,320),(446,281,320),(485,405,160),(577,339,190),(201,77,425),(248,101,425),(196,133,345),(269,106,425),(351,132,447),(421,175,420),(455,205,410),(388,239,355),(289,203,355),(284,448,70),(250,412,85),(476,456,110)],
'SwordShop_Basic':[(147,421,0),(358,548,0),(420,560,0),(541,483,0),(432,406,0),(220,288,0),(145,277,205),(357,416,190),(432,345,205),(221,207,205),(419,445,160),(535,374,155),(510,330,218),(480,351,217),(451,374,215),(217,264,220),(352,338,220)],
'SwordShop_Expanded':[(79,297,0),(212,384,0),(420,515,0),(514,454,0),(372,366,0),(162,234,0),(79,179,166),(212,248,192),(422,383,187),(513,326,181),(279,186,188),(163,111,174),(125,174,245),(150,195,244),(181,216,243),(279,249,205)]
}

def triangulate(pts):
    # Bowyer-Watson Delaunay triangulation of the manually fitted control mesh.
    pp=[(float(p[0]),float(p[1])) for p in pts]+[(-10000,-10000),(10000,-10000),(0,10000)]
    n=len(pts);tris=[(n,n+1,n+2)]
    def circle(tri,p):
        a,b,c=[np.array(pp[i]) for i in tri];M=2*np.array([b-a,c-a]);v=np.array([b@b-a@a,c@c-a@a])
        if abs(np.linalg.det(M))<1e-8:return False
        center=np.linalg.solve(M,v);r=np.sum((center-a)**2)
        return np.sum((center-np.array(p))**2)<=r+1e-6
    for i in range(n):
        bad=[t for t in tris if circle(t,pp[i])];edges={}
        for t in bad:
            for e in [(t[0],t[1]),(t[1],t[2]),(t[2],t[0])]:
                e=tuple(sorted(e));edges[e]=edges.get(e,0)+1
        tris=[t for t in tris if t not in bad]
        tris.extend((a,b,i) for (a,b),count in edges.items() if count==1)
    return [t for t in tris if max(t)<n]

def height_map(points):
    yy,xx=np.mgrid[:627,:627];z=np.zeros((627,627),dtype=float);dist=np.full(z.shape,np.inf)
    # Extrapolate short protrusions only outside the fitted control hull.
    for px,py,pz in points:
        dd=(xx-px)**2+(yy-py)**2;take=dd<dist
        z[take]=np.maximum(0,pz+(py-yy[take])/C);dist[take]=dd[take]
    tris=triangulate(points)
    for ids in tris:
        p=np.array([points[i] for i in ids]);M=np.array([[p[0,0],p[0,1],1],[p[1,0],p[1,1],1],[p[2,0],p[2,1],1]])
        if abs(np.linalg.det(M))<1e-8:continue
        plane=np.linalg.solve(M,p[:,2])
        mask=Image.new('1',(627,627));ImageDraw.Draw(mask).polygon([tuple(q[:2]) for q in p],fill=1)
        mask=np.array(mask,dtype=bool);z[mask]=(xx*plane[0]+yy*plane[1]+plane[2])[mask]
    return np.clip(z,0,650),tris

def body_to_source(body,raw,points):
    # Reproduce the original fixed .82 scaling and image-space translation.
    rb=raw.getchannel('A').point(lambda a:255 if a>=150 else 0).getbbox();bb=body.getchannel('A').getbbox()
    # Boundary erosion and Lanczos filtering roughly cancel at bbox at .82 scale.
    dx=round((bb[0]+bb[2])/2-.82*(rb[0]+rb[2])/2)
    dy=round(bb[3]-.82*rb[3])
    return dx,dy

def ground_shadow(body,raw,z,dx,dy):
    # At source pixel (u,v), reconstruct world position under an orthographic
    # camera at (0,-d,+d): X=u, Y=-v/cos45-Z, so camera projection remains exact.
    # Ray intersection z=0 is (X+RX*Z,Y+RY*Z,0), reprojected to the SAME canvas.
    yy,xx=np.mgrid[:627,:627]
    final=np.array(body.getchannel('A'))
    bx=np.clip(np.round(xx*.82+dx).astype(int),0,1023);by=np.clip(np.round(yy*.82+dy).astype(int),0,1023)
    valid=final[by,bx]>=150
    qx=(xx+RX*z)*.82+dx;qy=(yy+VY*z)*.82+dy
    factor=2;mask=np.zeros((2048,2048),dtype=np.uint8)
    sx=np.round(qx[valid]*factor).astype(int);sy=np.round(qy[valid]*factor).astype(int)
    good=(sx>=2)&(sx<2046)&(sy>=2)&(sy<2046)
    mask[sy[good],sx[good]]=255
    # Surface area rasterization from subpixel samples; close <2px sampling gaps.
    im=Image.fromarray(mask).filter(ImageFilter.MaxFilter(3))
    im=im.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    # Seal enclosed sampling pinholes, not open gaps between separate components.
    flooded=im.copy();ImageDraw.floodfill(flooded,(0,0),128)
    ar=np.array(im);ar[np.array(flooded)==0]=255
    im=Image.fromarray(ar).resize((1024,1024),Image.Resampling.LANCZOS)
    im=im.point(lambda a:round(a*89/255))
    sh=Image.new('RGBA',(1024,1024));sh.putalpha(im)
    return sh

def compose(body,shadow):
    bg=Image.new('RGBA',body.size,(206,218,185,255));bg.alpha_composite(shadow);bg.alpha_composite(body);return bg

def main():
    data={'sun_euler_xyz_degrees':[0,-27,20],'camera_elevation':45,'ray_world':RAY,
          'ground_displacement_per_height':[RX,RY],'screen_ground_bearing_deg':math.degrees(math.atan2(C*RY,RX)),
          'body_files_unchanged':True,'method':'per-part fitted 2.5D surfaces, directional ray intersections, not an affine silhouette flatten',
          'limitation':'Reconstructed from PNG, hidden 3D geometry is approximate.','variants':{}}
    sources=['01-headquarters.png','02-hiring-office.png','03-lumber-warehouse.png','04-iron-mine.png','05-blacksmith.png','06-sword-shop.png']
    debug=[]
    for index,folder in enumerate(sorted(p for p in SRC.iterdir() if p.is_dir())):
        sheet=Image.open(ROOT/'raw'/sources[index]).convert('RGBA');target=OUT/folder.name;target.mkdir(exist_ok=True)
        for path in sorted(folder.glob('*_Body.png')):
            prefix,state,side,_=path.stem.split('_');key=prefix+'_'+('Active' if prefix=='IronMine' else state)
            right=side=='Right45';bottom=state in ['Expanded','Inactive'];body=Image.open(path).convert('RGBA')
            raw=sheet.crop((627 if right else 0,627 if bottom else 0,1254 if right else 627,1254 if bottom else 627))
            pts=[list(p) for p in A[key]]
            # Both mine states use the active geometry and identical registration.
            if prefix=='IronMine':raw=sheet.crop((627 if right else 0,0,1254 if right else 627,627))
            if right:
                left=sheet.crop((0,627 if bottom and prefix!='IronMine' else 0,627,1254 if bottom and prefix!='IronMine' else 627))
                lb=left.getchannel('A').point(lambda a:255 if a>=150 else 0).getbbox();rb=raw.getchannel('A').point(lambda a:255 if a>=150 else 0).getbbox()
                shift=(rb[0]+rb[2]-(1254-lb[0]-lb[2]))/2
                for p in pts:p[0]=627-p[0]+shift
            z,tris=height_map(pts);dx,dy=body_to_source(body,raw,pts)
            sh=ground_shadow(body,raw,z,dx,dy)
            destination=target/path.name;shutil.copy2(path,destination)
            outshadow=target/path.name.replace('_Body','_Shadow');sh.save(outshadow)
            assert hashlib.sha256(path.read_bytes()).digest()==hashlib.sha256(destination.read_bytes()).digest()
            a=np.array(sh.getchannel('A'));assert a.any() and not a[0].any() and not a[-1].any() and not a[:,0].any() and not a[:,-1].any()
            stem=path.stem.replace('_Body','');data['variants'][stem]={'translation':[dx,dy],'control_vertices':pts,'triangles':tris}
            debug.append({'name':stem,'points':pts,'triangles':tris,'translation':[dx,dy]})
            if stem=='HQ_Basic_Left45':
                old=Image.open(path.with_name(path.name.replace('_Body','_Shadow')))
                proof=Image.new('RGB',(2048,1024));proof.paste(compose(body,old).convert('RGB'),(0,0));proof.paste(compose(body,sh).convert('RGB'),(1024,0))
                proof.resize((1536,768)).save(WORK/'HQ-before-after.jpg',quality=97)
        print(folder.name,'complete',flush=True)
    # Mine entrance boards do not change its exterior occluder; shadow bytes match.
    mine=OUT/'04_철광산'
    for side in ['Left45','Right45']:
        shutil.copy2(mine/f'IronMine_Active_{side}_Shadow.png',mine/f'IronMine_Inactive_{side}_Shadow.png')
    assert len(list(OUT.glob('*/*_Shadow.png')))==24
    (WORK/'geometry.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print('DONE',RAY,'bearing',data['screen_ground_bearing_deg'])

if __name__=='__main__':main()
