"""Tiny bpy helpers shared by build_assets.py. Units = metres, Z up (glTF export flips to Y up)."""
import bpy, math

_MATS = {}


def mat(name, color, rough=0.6, metal=0.0, alpha=1.0, emit=None, emit_strength=0.0, transmission=0.0, ior=1.45):
    """Cached Principled material. Name is prefixed MAT_ so the game can find it by name."""
    key = "MAT_" + name
    if key in _MATS:
        return _MATS[key]
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    rgba = (*color, 1.0) if len(color) == 3 else color
    b.inputs["Base Color"].default_value = rgba
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if transmission:
        b.inputs["Transmission Weight"].default_value = transmission
        b.inputs["IOR"].default_value = ior
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = "BLENDED"
        except Exception:
            pass
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1.0)
        b.inputs["Emission Strength"].default_value = emit_strength
    m.diffuse_color = rgba
    _MATS[key] = m
    return m


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATS.clear()


def _finish(o, name, m, smooth):
    o.name = name
    o.data.name = name
    if m:
        o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def box(name, size, loc=(0, 0, 0), m=None, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new("bev", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return _finish(o, name, m, smooth=False)


def cyl(name, r, h, loc=(0, 0, 0), m=None, rot=(0, 0, 0), seg=24, r2=None, cap=True):
    """Cylinder (or cone when r2 given) whose BASE sits at loc (not centred)."""
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=h, location=(0, 0, h / 2),
                                            end_fill_type="NGON" if cap else "NOTHING")
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r2, depth=h, location=(0, 0, h / 2),
                                        end_fill_type="NGON" if cap else "NOTHING")
    o = bpy.context.object
    bpy.ops.object.transform_apply(location=True)
    o.location = loc
    o.rotation_euler = rot
    return _finish(o, name, m, smooth=True)


def tube(name, r_out, r_in, h, loc=(0, 0, 0), m=None, seg=32, bottom=True, r_out_top=None):
    """Open-top hollow cup (beaker/glass/pot). Base at loc."""
    import bmesh
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rt = r_out_top or r_out
    rit = r_in + (rt - r_out)
    t = r_out - r_in  # wall / floor thickness
    rings = [(r_out, 0), (rt, h), (rit, h), (r_in, t if bottom else 0)]
    vs = [[bm.verts.new((rr * math.cos(2 * math.pi * i / seg), rr * math.sin(2 * math.pi * i / seg), z))
           for i in range(seg)] for rr, z in rings]
    for a, bb in zip(vs, vs[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new((a[i], a[j], bb[j], bb[i]))
    bm.faces.new(list(reversed(vs[0])))
    if bottom:
        bm.faces.new(vs[3])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return _finish(o, name, m, smooth=True)


def sphere(name, r, loc=(0, 0, 0), m=None, scale=(1, 1, 1), seg=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc)
    o = bpy.context.object
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    return _finish(o, name, m, smooth=True)


def torus(name, R, r, loc=(0, 0, 0), m=None, rot=(0, 0, 0), seg=32, mseg=12):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=mseg,
                                     location=loc, rotation=rot)
    return _finish(bpy.context.object, name, m, smooth=True)


def curve_tube(name, pts, r, m=None, res=6):
    """Poly-bezier through pts, bevelled into a round tube, converted to mesh (wires, strings, stems)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 2
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    cu.resolution_u = res
    cu.use_fill_caps = True
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.object
    o.name = name
    if m:
        o.data.materials.append(m)
    return o


def plane(name, w, d, loc=(0, 0, 0), m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = (w, d, 1)
    bpy.ops.object.transform_apply(scale=True)
    return _finish(o, name, m, smooth=False)


def poly_extrude(name, pts2d, h, loc=(0, 0, 0), m=None, rot=(0, 0, 0)):
    """Extrude a 2D outline (XY) upward by h — leaves, hand outline, horseshoe magnet etc."""
    import bmesh
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bot = [bm.verts.new((x, y, 0)) for x, y in pts2d]
    top = [bm.verts.new((x, y, h)) for x, y in pts2d]
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    n = len(pts2d)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    return _finish(o, name, m, smooth=False)


def group(name, children, loc=(0, 0, 0)):
    """Empty used as a pivot / named node. Children keep their world transform."""
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    e.location = loc
    bpy.context.view_layer.update()
    inv = e.matrix_world.inverted()
    for c in children:
        mw = c.matrix_world.copy()
        c.parent = e
        c.matrix_parent_inverse = inv
        c.matrix_world = mw
    return e


def text(name, body, size, loc=(0, 0, 0), m=None, rot=(0, 0, 0), depth=0.0005):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = depth
    o.data.align_x = "CENTER"
    o.data.align_y = "CENTER"
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.object
    return _finish(o, name, m, smooth=False)
