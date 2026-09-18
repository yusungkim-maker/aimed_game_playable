import bpy, math, json
from pathlib import Path
from mathutils import Vector

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene.render.engine='CYCLES'
scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=1200
scene.render.resolution_y=1000
scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Soft ambient')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.82,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
scene.view_settings.view_transform='Standard'

def material(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.72;p.inputs['Metallic'].default_value=metal
 return m
wood=material('Warm oak',(.43,.235,.10))
railmat=material('Honey oak',(.59,.355,.17))
metal=material('Matte iron',(.235,.265,.28),.25)
stone=material('Warm gray stone',(.37,.385,.35))
ground=material('Preview ground',(.34,.40,.22))
sources=bpy.data.collections.new('01_Modules_EDIT_HERE');scene.collection.children.link(sources)
demo=bpy.data.collections.new('02_Four_Directions_Demo');scene.collection.children.link(demo)
stage=bpy.data.collections.new('03_Preview_Only');scene.collection.children.link(stage)

def move_collection(obj,col):
 for c in list(obj.users_collection):c.objects.unlink(obj)
 col.objects.link(obj)

def box(name,loc,size,mat,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name
 o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat)
 mod=o.modifiers.new('Small clean bevel','BEVEL');mod.width=bevel;mod.segments=2
 bpy.ops.object.modifier_apply(modifier=mod.name)
 move_collection(o,sources)
 return o

def combine(parts,name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
 o=parts[0];o.name=name;scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
 return o

post=combine([
 box('Stone foot',(0,0,.12),(.48,.48,.24),stone,.035),
 box('Timber post',(0,0,.74),(.32,.32,1.10),wood,.025),
 box('Bottom iron collar',(0,0,.29),(.35,.35,.14),metal,.014),
 box('Cap',(0,0,1.32),(.42,.42,.18),metal,.035),
 box('Cap crown',(0,0,1.43),(.29,.29,.08),metal,.025),
], 'Fence_Decorative_Post')
parts=[box('Lower rail',(0,0,.55),(3,.17,.19),railmat,.022),box('Upper rail',(0,0,1.02),(3,.19,.22),railmat,.025),box('Center upright',(0,0,.77),(.14,.21,.74),wood,.018)]
for z in [.55,1.02]:
 for y in [-.115,.115]:
  parts.append(box('Iron peg',(0,y,z),(.055,.025,.055),metal,.008))
rail=combine(parts,'Fence_Connection_3m')
post['usage']='Ground-centered origin. Corner and endpoint post.'
rail['usage']='Local X span 3m. Connect endpoints at X=-1.5,+1.5 to post centers. Local Z up.'
rail['span_m']=3.0

def export(obj,name):
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 bpy.ops.export_scene.gltf(filepath=str(OUT/name),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
export(post,'Fence_Decorative_Post.glb')
export(rail,'Fence_Connection_3m.glb')
for angle in [45,135,225,315]:
 rail.rotation_euler.z=math.radians(angle)
 export(rail,f'Fence_Connection_{angle:03d}.glb')
rail.rotation_euler.z=0

def copy_at(src,name,loc,angle=0):
 o=src.copy();o.data=src.data;demo.objects.link(o);o.name=name;o.location=loc;o.rotation_euler.z=math.radians(angle);return o
q=3/math.sqrt(2)
corners=[(0,-q,0),(q,0,0),(0,q,0),(-q,0,0)]
for i,p in enumerate(corners):copy_at(post,f'Corner_{i+1}',p)
for i,a in enumerate([45,135,225,315]):
 p=Vector(corners[i]);n=Vector(corners[(i+1)%4]);copy_at(rail,f'Connection_{a:03d}',(p+n)/2,a)
sources.hide_render=True;sources.hide_viewport=True
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='Preview floor - not exported';floor.location.z=-.012;floor.data.materials.append(ground);move_collection(floor,stage)
bpy.ops.object.light_add(type='SUN',location=(0,0,6));sun=bpy.context.object;sun.name='Sun XYZ 0 -27 20';sun.rotation_euler=(0,math.radians(-27),math.radians(20));sun.data.energy=2.2;sun.data.angle=0;move_collection(sun,stage)
bpy.ops.object.camera_add(location=(0,-10,10.5));cam=bpy.context.object;cam.name='Orthographic Down45';cam.rotation_euler=(Vector((0,0,.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=7.6;scene.camera=cam;move_collection(cam,stage)
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'Fence_Preview.png')
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Fence_Modular_Set.blend'))
bpy.ops.render.render(write_still=True)
stats={o.name:{'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons)} for o in [post,rail]}
(OUT/'validation.json').write_text(json.dumps({'meshes':stats,'span':3,'sun_euler':[0,-27,20],'camera_down':45,'export_axes':'GLB Y-up; Blender Z-up','directions':[45,135,225,315]},indent=2))
