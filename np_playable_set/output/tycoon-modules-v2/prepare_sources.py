from pathlib import Path
from PIL import Image,ImageDraw
import shutil
ROOT=Path(__file__).parent
RAW=ROOT/'raw'; RAW.mkdir(exist_ok=True)
SRC=Path('C:/Users/김유성/.codex/generated_images/01a0ace0-029c-7d32-b276-786d6f4161cb')
FILES={
'01-headquarters.png':'exec-29163767-6179-492b-95d0-42ad13ee5c76.png',
'02-hiring-office.png':'exec-1ad7b6ae-e732-46bf-933e-0baf06365940.png',
'03-lumber-warehouse.png':'exec-9bda60aa-21ac-4d84-b7d6-e68fb859e361.png',
'04-iron-mine.png':'exec-26a9b84e-f262-45ed-ae6f-53d98226283e.png',
'05-blacksmith.png':'exec-e4a1550d-3446-46d1-a900-272d6982c161.png',
'06-sword-shop.png':'exec-366da9aa-672c-41f5-bdce-6439dded1659.png'}
for name,source in FILES.items(): shutil.copy2(SRC/source,RAW/name)
im=Image.open(RAW/'04-iron-mine.png').convert('RGBA'); w,h=im.size
for i,(x,y) in enumerate([(0,0),(w//2,0),(0,h//2),(w//2,h//2)]):
    cell=im.crop((x,y,x+w//2,y+h//2)); bg=Image.new('RGBA',cell.size,(180,200,155,255)); bg.alpha_composite(cell)
    d=ImageDraw.Draw(bg)
    for k in range(0,w//2,50):
        d.line((k,0,k,h//2),fill=(255,0,0,90)); d.text((k+2,3),str(k),fill='black')
        d.line((0,k,w//2,k),fill=(255,0,0,90)); d.text((2,k+3),str(k),fill='black')
    bg.save(ROOT/f'mine-grid-{i}.png')
print([(p.name,Image.open(p).size) for p in RAW.glob('*.png')])
