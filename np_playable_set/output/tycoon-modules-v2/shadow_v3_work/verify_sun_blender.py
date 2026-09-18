import bpy,math,json
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).parent
bpy.ops.wm.read_factory_settings(use_empty=True)
sun_data=bpy.data.lights.new('Sun_exact_X0_Yminus27_Z20','SUN')
sun_data.energy=3;sun_data.angle=0
sun=bpy.data.objects.new('Sun_exact_X0_Yminus27_Z20',sun_data);bpy.context.collection.objects.link(sun)
sun.rotation_mode='XYZ';sun.rotation_euler=tuple(math.radians(a) for a in (0,-27,20))
sun.location=(0,0,4.0618)
ray=sun.rotation_euler.to_matrix()@Vector((0,0,-1))
cam_data=bpy.data.cameras.new('Orthographic_45deg');cam_data.type='ORTHO';cam_data.ortho_scale=10.24
cam=bpy.data.objects.new('Orthographic_45deg',cam_data);bpy.context.collection.objects.link(cam)
cam.location=(0,-20,20);cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.resolution_x=1024;scene.render.resolution_y=1024;scene.render.resolution_percentage=100
info={'sun_rotation_xyz_degrees':[math.degrees(v) for v in sun.rotation_euler],
      'ray_direction_negative_local_z':list(ray),'camera_type':cam.data.type,
      'camera_elevation_degrees':45,'sun_angular_diameter_degrees':0}
(ROOT/'blender_sun_verification.json').write_text(json.dumps(info,indent=2),encoding='utf8')
geometry=ROOT/'geometry.json'
if geometry.exists():
    data=json.loads(geometry.read_text(encoding='utf8'));c=math.sqrt(.5)
    material=bpy.data.materials.new('Reconstructed_proxy_only');material.diffuse_color=(.45,.5,.55,1)
    for name,item in data['variants'].items():
        pts=item['control_vertices'];dx,dy=item['translation'];world=[]
        angle=math.radians(-45 if 'Left45' in name else 45);inv=Matrix.Rotation(-angle,3,'Z')
        for x,y,z in pts:
            u=x*.82+dx;v=y*.82+dy;zz=z*.82
            p=Vector(((u-512)/100,((512-v)/c-zz)/100,zz/100));world.append(tuple(inv@p))
        mesh=bpy.data.meshes.new(name+'_FittedSurfaces');mesh.from_pydata(world,[],item['triangles']);mesh.update()
        obj=bpy.data.objects.new(name+'_APPROXIMATE_DEPTH_PROXY',mesh);scene.collection.objects.link(obj)
        obj.rotation_euler[2]=angle;obj.data.materials.append(material)
        obj.hide_render=name!='HQ_Basic_Left45';obj.hide_set(name!='HQ_Basic_Left45')
        obj['source']='Manually fitted image-space depths; not original 3D geometry'
    bpy.ops.mesh.primitive_plane_add(size=30,location=(0,0,-.01));bpy.context.object.name='Ground_Z0'
    ground=bpy.data.materials.new('Ground');ground.diffuse_color=(.65,.73,.5,1);bpy.context.object.data.materials.append(ground)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Sun_calibration_and_fitted_proxies.blend'))
print('SUN_VERIFIED',json.dumps(info))
