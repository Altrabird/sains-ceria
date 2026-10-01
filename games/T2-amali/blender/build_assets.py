"""Builds every AR prop for Rekod Amali Sains T2 as individual GLBs + assets/manifest.json.

Run (headless, ~1 min):
  "C:/Program Files (x86)/Steam/steamapps/common/Blender/blender.exe" -b -P blender/build_assets.py
  optional: -- AM07 cup_A     (only build assets whose id or AM tag matches)

Conventions (read by the game):
  * metres, real-world size; origin = base centre; glTF +Y up.
  * "forward" props (torch, arrows) point along three.js +Z so obj.lookAt(target) aims them.
  * pivot_* nodes  = rotate/translate these (lids, doors, needles, rotors).
  * anchor_* nodes = empty snap points (where a test object / label / particle goes).
  * stage_* / week_* nodes = mutually exclusive visual states; show one, hide the rest.
  * MAT_* materials = game tints/toggles by name (MAT_bulb_glass emissive on = bulb lit).
  * root node extras (userData in three.js) carry science facts: conductor, soluble, opacity...
"""
import bpy, sys, os, math, json, random

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "shared", "blender"))
from lib import mat, reset, box, cyl, tube, sphere, torus, curve_tube, plane, poly_extrude, group, text

OUT = os.path.join(HERE, "..", "assets", "models")
os.makedirs(OUT, exist_ok=True)
REG = []  # (id, am_tags, name_bm, fn, extras)


def asset(aid, am, name_bm, **extras):
    def deco(fn):
        REG.append((aid, am, name_bm, fn, extras))
        return fn
    return deco


def variant(aid, am, name_bm, fn, **extras):
    REG.append((aid, am, name_bm, fn, extras))


# ---------------------------------------------------------------- materials
def M():
    return dict(
        glass=mat("glass", (0.85, 0.95, 1.0), rough=0.05, transmission=1.0, ior=1.5, alpha=0.35),
        plastic_clear=mat("plastic_clear", (0.92, 0.96, 1.0), rough=0.15, transmission=0.9, alpha=0.4),
        water=mat("water", (0.55, 0.8, 1.0), rough=0.05, transmission=0.8, alpha=0.55, ior=1.33),
        white=mat("white", (0.95, 0.95, 0.95), rough=0.5),
        paper=mat("paper", (0.98, 0.97, 0.93), rough=0.9),
        black=mat("black", (0.03, 0.03, 0.035), rough=0.5),
        steel=mat("steel", (0.75, 0.76, 0.78), rough=0.3, metal=1.0),
        copper=mat("copper", (0.85, 0.5, 0.3), rough=0.35, metal=1.0),
        brass=mat("brass", (0.9, 0.75, 0.35), rough=0.3, metal=1.0),
        wood=mat("wood", (0.72, 0.52, 0.32), rough=0.7),
        cardboard=mat("cardboard", (0.72, 0.56, 0.38), rough=0.9),
        soil=mat("soil", (0.28, 0.18, 0.1), rough=1.0),
        terracotta=mat("terracotta", (0.78, 0.4, 0.25), rough=0.8),
        leaf=mat("leaf", (0.2, 0.62, 0.2), rough=0.5),
        leaf_wilted=mat("leaf_wilted", (0.62, 0.52, 0.18), rough=0.8),
        leaf_pale=mat("leaf_pale", (0.85, 0.88, 0.5), rough=0.6),
        leaf_greased=mat("leaf_greased", (0.18, 0.4, 0.15), rough=0.1),
        stem=mat("stem", (0.35, 0.6, 0.25), rough=0.6),
        red=mat("red", (0.85, 0.15, 0.15), rough=0.4),
        blue=mat("blue", (0.15, 0.35, 0.85), rough=0.4),
        yellow=mat("yellow", (0.98, 0.82, 0.15), rough=0.4),
        green=mat("green", (0.2, 0.7, 0.3), rough=0.4),
        pink=mat("pink", (0.98, 0.6, 0.72), rough=0.45),
        navy=mat("navy", (0.1, 0.15, 0.35), rough=0.6),
        skin=mat("skin", (0.87, 0.66, 0.5), rough=0.6),
        rubber=mat("rubber", (0.95, 0.5, 0.55), rough=0.8),
        grey=mat("grey", (0.45, 0.46, 0.48), rough=0.6),
        dark=mat("dark_interior", (0.02, 0.02, 0.02), rough=1.0),
    )


# ---------------------------------------------------------------- reusable parts
def leaf_shape(L, W, n=10):
    top = [(L * i / n, W * math.sin(math.pi * i / n) * (1 - 0.3 * i / n)) for i in range(n + 1)]
    bot = [(x, -y) for x, y in reversed(top[1:-1])]
    return top + bot


def leaf(name, L, W, m, pitch, yaw, loc):
    o = poly_extrude(name, leaf_shape(L, W), 0.0012, m=m)
    o.location = loc
    o.rotation_euler = (0, -pitch, yaw)
    return o


def plant(prefix, h, n_leaves, leaf_m, droop=0.0, stem_r=0.003, lean=0.0):
    """Stem + alternating leaves. droop 0 = perky, 1 = fully wilted."""
    m = M()
    bend = lean + droop * 0.5 * h
    stem = curve_tube(f"{prefix}_stem", [(0, 0, 0), (bend * 0.3, 0, h * 0.5), (bend, 0, h * (1 - 0.25 * droop))],
                      stem_r, m=m["stem"])
    parts = [stem]
    for i in range(n_leaves):
        t = 0.35 + 0.65 * (i + 1) / n_leaves
        z = h * t * (1 - 0.25 * droop * t)
        x = bend * t * t
        L = 0.02 + 0.035 * (1 - abs(t - 0.6))
        pitch = math.radians(35 - 85 * droop)
        parts.append(leaf(f"{prefix}_leaf{i}", L, L * 0.4, leaf_m, pitch, math.radians(137.5 * i), (x, 0, z)))
    return group(prefix, parts)


def pot(prefix="pot", r=0.06, h=0.1):
    m = M()
    p = tube(f"{prefix}_body", r * 0.8, r * 0.8 - 0.005, h, m=m["terracotta"], r_out_top=r)
    rim = torus(f"{prefix}_rim", r, 0.006, loc=(0, 0, h), m=m["terracotta"])
    soil = cyl("soil", r - 0.006, 0.004, loc=(0, 0, h - 0.012), m=m["soil"])
    return [p, rim, soil], h - 0.008


def open_box(prefix, w, d, h, t, m, inner=None):
    """Five-panel open-top box (floor + 4 walls)."""
    parts = [box(f"{prefix}_floor", (w, d, t), (0, 0, t / 2), m)]
    parts += [box(f"{prefix}_wall_n", (w, t, h), (0, d / 2 - t / 2, h / 2), m),
              box(f"{prefix}_wall_s", (w, t, h), (0, -d / 2 + t / 2, h / 2), m),
              box(f"{prefix}_wall_e", (t, d, h), (w / 2 - t / 2, 0, h / 2), m),
              box(f"{prefix}_wall_w", (t, d, h), (-w / 2 + t / 2, 0, h / 2), m)]
    if inner:
        parts.append(box(f"{prefix}_inside", (w - 2.2 * t, d - 2.2 * t, 0.001), (0, 0, t + 0.0006), inner))
    return parts


def hinged_lid(prefix, w, d, t, h, m, hinge="back"):
    """Lid whose pivot_lid sits on the back top edge: rotate pivot X (three.js) to open."""
    lid = box(f"{prefix}_lid", (w + 0.006, d + 0.006, t), (0, 0, h + t / 2), m)
    rim = box(f"{prefix}_lid_lip", (w + 0.006, 0.004, 0.02), (0, -d / 2 - 0.003, h - 0.01 + t), m)
    return group("pivot_lid", [lid, rim], loc=(0, d / 2 + 0.003, h))


def anchor(name, loc):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.01
    bpy.context.collection.objects.link(e)
    e.location = loc
    return e


def pencil(prefix="pencil", L=0.17):
    m = M()
    body = cyl(f"{prefix}_body", 0.0035, L, m=m["yellow"], seg=6)
    wood = cyl(f"{prefix}_wood", 0.0035, 0.015, loc=(0, 0, L), m=m["wood"], seg=6, r2=0.001)
    lead = cyl(f"{prefix}_lead", 0.001, 0.003, loc=(0, 0, L + 0.013), m=m["black"], seg=8, r2=0.0)
    ferrule = cyl(f"{prefix}_ferrule", 0.0037, 0.008, loc=(0, 0, -0.008), m=m["steel"], seg=12)
    eraser = cyl(f"{prefix}_eraser", 0.0036, 0.008, loc=(0, 0, -0.016), m=m["rubber"], seg=12)
    g = group(prefix, [body, wood, lead, ferrule, eraser])
    return g


def glass_with_water(prefix, r=0.035, h=0.1, level=0.7, m_water=None, band=None):
    m = M()
    g = tube(f"{prefix}_glass", r, r - 0.002, h, m=m["glass"], r_out_top=r * 1.1)
    # pivot_water: scale Y in three.js (0..1) to change level; stays inside the glass
    w = cyl("water_body", r - 0.0025, h, loc=(0, 0, 0.002), m=m_water or m["water"], seg=32, r2=r * 1.1 - 0.003)
    pw = group("pivot_water", [w])
    pw.scale = (1, 1, level)
    parts = [g, pw, anchor("anchor_surface", (0, 0, h * level)), anchor("anchor_drop_in", (0, 0, h + 0.05))]
    if band:
        parts.append(tube(f"{prefix}_band", r * 1.06 + 0.001, r * 1.06, 0.012, loc=(0, 0, h * 0.55), m=band,
                          bottom=False))
    return parts


def powder_pile(name, r, h, m, seed=1, grains=0):
    rnd = random.Random(seed)
    parts = [cyl(name, r, h, m=m, seg=20, r2=r * 0.15)]
    for i in range(grains):
        a, d = rnd.uniform(0, 6.28), rnd.uniform(r * 0.9, r * 1.4)
        parts.append(sphere(f"{name}_grain{i}", rnd.uniform(0.0015, 0.004), loc=(d * math.cos(a), d * math.sin(a), 0.001),
                            m=m, seg=6, rings=4))
    return parts


def saucer(r=0.05):
    m = M()
    return cyl("saucer", r, 0.006, m=m["white"], seg=32, r2=r * 1.15)


def croc_clip(prefix, loc, m_sleeve):
    a = box(f"{prefix}_jaw_a", (0.022, 0.006, 0.003), (loc[0], loc[1], loc[2] + 0.0025), M()["steel"])
    b = box(f"{prefix}_jaw_b", (0.022, 0.006, 0.003), (loc[0], loc[1], loc[2] - 0.0025), M()["steel"])
    s = box(f"{prefix}_sleeve", (0.012, 0.009, 0.009), (loc[0] - 0.014, loc[1], loc[2]), m_sleeve, bevel=0.002)
    return [a, b, s]


def figure(prefix, height, shirt, bottom, hair, coat=None, drape=False):
    """Chibi kid: head is ~1/3.5 of height so faces read on a phone screen."""
    m = M()
    H = height
    head_r = H * 0.17  # leg+torso+head ~= H
    leg_h = H * 0.37
    torso_h = H * 0.3
    parts = []
    for sx in (-1, 1):
        parts.append(cyl(f"{prefix}_leg_{'l' if sx < 0 else 'r'}", H * 0.045, leg_h, loc=(sx * H * 0.055, 0, 0), m=m["skin"]))
        parts.append(sphere(f"{prefix}_shoe_{'l' if sx < 0 else 'r'}", H * 0.05, loc=(sx * H * 0.055, -H * 0.015, H * 0.02),
                            m=m["black"], scale=(1, 1.4, 0.6)))
        parts.append(curve_tube(f"{prefix}_arm_{'l' if sx < 0 else 'r'}",
                                [(sx * H * 0.12, 0, leg_h + torso_h * 0.9), (sx * H * 0.17, 0, leg_h + torso_h * 0.45),
                                 (sx * H * 0.18, -H * 0.02, leg_h + torso_h * 0.1)], H * 0.035, m=coat or shirt))
        parts.append(sphere(f"{prefix}_hand_{'l' if sx < 0 else 'r'}", H * 0.035,
                            loc=(sx * H * 0.18, -H * 0.02, leg_h + torso_h * 0.05), m=m["skin"]))
    parts.append(cyl(f"{prefix}_bottom", H * 0.12, H * 0.14, loc=(0, 0, leg_h - H * 0.06), m=bottom, r2=H * 0.105))
    parts.append(cyl(f"{prefix}_torso", H * 0.105, torso_h - H * 0.08, loc=(0, 0, leg_h + H * 0.08), m=shirt, r2=H * 0.09))
    if coat:
        parts.append(cyl(f"{prefix}_coat", H * 0.13, torso_h + H * 0.05, loc=(0, 0, leg_h - H * 0.06), m=coat,
                         r2=H * 0.095, seg=24))
    hz = leg_h + torso_h + head_r * 0.85
    parts.append(sphere(f"{prefix}_head", head_r, loc=(0, 0, hz), m=m["skin"]))
    parts.append(sphere(f"{prefix}_hair", head_r * 1.07, loc=(0, H * 0.012, hz + head_r * 0.12), m=hair,
                        scale=(1, 1, 0.85)))
    if drape:  # tudung: frame the face + cover neck/shoulders
        parts.append(torus(f"{prefix}_tudung_frame", head_r * 0.92, head_r * 0.16, loc=(0, -head_r * 0.35, hz - head_r * 0.05),
                           m=hair, rot=(math.radians(90), 0, 0), seg=24, mseg=8))
        parts.append(cyl(f"{prefix}_tudung_drape", H * 0.15, head_r * 1.1, loc=(0, H * 0.01, hz - head_r * 1.95), m=hair,
                         r2=head_r * 0.95, seg=24))
    for sx in (-1, 1):
        parts.append(sphere(f"{prefix}_eye_{sx}", head_r * 0.13, loc=(sx * head_r * 0.36, -head_r * 0.9, hz - head_r * 0.05),
                            m=m["black"], scale=(1, 0.5, 1.3)))
        parts.append(sphere(f"{prefix}_blush_{sx}", head_r * 0.12, loc=(sx * head_r * 0.58, -head_r * 0.78, hz - head_r * 0.3),
                            m=m["pink"], scale=(1, 0.4, 0.6)))
    parts.append(torus(f"{prefix}_smile", head_r * 0.12, head_r * 0.025, loc=(0, -head_r * 0.95, hz - head_r * 0.35),
                       m=m["black"], rot=(math.radians(90), 0, 0), seg=16, mseg=6))
    return parts, hz, head_r


# ================================================================ SHARED
@asset("lab_tray", ["ALL"], "Dulang makmal (tapak AR)")
def _():
    m = M()
    base = box("tray_base", (0.32, 0.22, 0.012), (0, 0, 0.006), mat("tray", (0.97, 0.9, 0.93), rough=0.4), bevel=0.004)
    walls = [box(f"tray_rim_{i}", s, p, m["pink"], bevel=0.002) for i, (s, p) in enumerate([
        ((0.32, 0.008, 0.02), (0, 0.106, 0.016)), ((0.32, 0.008, 0.02), (0, -0.106, 0.016)),
        ((0.008, 0.22, 0.02), (0.156, 0, 0.016)), ((0.008, 0.22, 0.02), (-0.156, 0, 0.016))])]
    anchors = [anchor(f"anchor_slot_{i}", (x, y, 0.012)) for i, (x, y) in
               enumerate([(-0.1, 0.05), (0, 0.05), (0.1, 0.05), (-0.1, -0.05), (0, -0.05), (0.1, -0.05)])]
    return [base] + walls + anchors


@asset("beaker_250ml", ["AM08", "AM09", "AM11"], "Bikar 250 ml")
def _():
    m = M()
    parts = glass_with_water("beaker", r=0.035, h=0.095, level=0.6)
    spout = sphere("beaker_spout", 0.006, loc=(0.0385, 0, 0.094), m=m["glass"], scale=(1.2, 1, 0.5))
    ticks = [box(f"beaker_tick{i}", (0.0005, 0.008, 0.001), (0, -0.0381, 0.02 + i * 0.015), m["white"]) for i in range(5)]
    return parts + [spout] + ticks


@asset("glass_cup", ["AM09", "AM10"], "Gelas berisi air")
def _():
    return glass_with_water("cup", r=0.03, h=0.1, level=0.75)


variant("glass_hot", ["AM10"], "Gelas air panas",
        lambda: glass_with_water("hot", r=0.03, h=0.1, level=0.75,
                                 m_water=mat("water_hot", (1.0, 0.75, 0.6), rough=0.05, transmission=0.8, alpha=0.55),
                                 band=M()["red"]), temperature="panas")
variant("glass_cold", ["AM10"], "Gelas air sejuk",
        lambda: glass_with_water("cold", r=0.03, h=0.1, level=0.75,
                                 m_water=mat("water_cold", (0.5, 0.75, 1.0), rough=0.05, transmission=0.8, alpha=0.55),
                                 band=M()["blue"]), temperature="sejuk")


@asset("spoon", ["AM09", "AM10"], "Sudu")
def _():
    m = M()
    bowl = sphere("spoon_bowl", 0.012, loc=(0, -0.05, 0.004), m=m["steel"], scale=(0.8, 1.2, 0.3))
    handle = box("spoon_handle", (0.006, 0.1, 0.002), (0, 0.012, 0.004), m["steel"], rot=(math.radians(-6), 0, 0))
    return [bowl, handle]


@asset("stopwatch", ["AM05", "AM10"], "Jam randik")
def _():
    m = M()
    body = cyl("sw_body", 0.03, 0.015, m=m["pink"], rot=(math.radians(90), 0, 0), seg=32)
    body.location = (0, 0.0075, 0.032)
    face = cyl("sw_face", 0.025, 0.001, m=m["white"], rot=(math.radians(90), 0, 0), seg=32)
    face.location = (0, -0.0076, 0.032)
    ticks = []
    for i in range(12):
        a = i * math.pi / 6
        ticks.append(box(f"sw_tick{i}", (0.001, 0.001, 0.004), (0.021 * math.sin(a), -0.0087, 0.032 + 0.021 * math.cos(a)),
                         m["black"], rot=(0, a, 0)))
    hand = box("sw_hand", (0.0012, 0.001, 0.02), (0, -0.009, 0.032 + 0.009), m["red"])
    ph = group("pivot_hand", [hand], loc=(0, -0.009, 0.032))  # rotate around three.js Z (faces -Z... see README)
    crown = cyl("sw_crown", 0.004, 0.006, loc=(0, 0, 0.062), m=m["steel"])
    btn = cyl("sw_button", 0.006, 0.005, loc=(0, 0, 0.068), m=m["steel"])
    ring = torus("sw_ring", 0.006, 0.0015, loc=(0, 0, 0.078), m=m["steel"], rot=(math.radians(90), 0, 0))
    return [body, face, ph, crown, btn, ring] + ticks


@asset("ruler_30cm", ["AM01", "AM03"], "Pembaris 30 cm")
def _():
    m = M()
    parts = [box("ruler_body", (0.32, 0.032, 0.002), (0, 0, 0.001), mat("ruler", (0.95, 0.93, 0.8), rough=0.4))]
    for i in range(61):
        x = -0.15 + i * 0.005
        L = 0.01 if i % 2 == 0 else 0.005
        parts.append(box(f"ruler_tick{i}", (0.0005, L, 0.0003), (x, 0.016 - L / 2, 0.0021), m["black"]))
        if i % 10 == 0:
            parts.append(text(f"ruler_num{i // 2}", str(i // 2), 0.006, loc=(x, 0.002, 0.0021), m=m["black"]))
    return parts


@asset("flashlight", ["AM05", "AM06"], "Lampu suluh", note="beam points three.js +Z; toggle node beam")
def _():
    m = M()
    R = math.radians
    body = cyl("torch_body", 0.013, 0.11, m=m["blue"], rot=(R(90), 0, 0))
    body.location = (0, 0.07, 0.015)
    head = cyl("torch_head", 0.013, 0.03, m=m["blue"], rot=(R(90), 0, 0), r2=0.02)
    head.location = (0, -0.04, 0.015)
    lens = cyl("torch_lens", 0.018, 0.002, m=mat("torch_lens", (1, 1, 0.9), emit=(1, 0.95, 0.7), emit_strength=3.0),
               rot=(R(90), 0, 0))
    lens.location = (0, -0.07, 0.015)
    btn = box("torch_button", (0.008, 0.015, 0.004), (0, 0.02, 0.029), m["black"], bevel=0.001)
    beam = cyl("beam_cone", 0.02, 0.35, m=mat("beam", (1, 0.95, 0.6), alpha=0.18, emit=(1, 0.95, 0.6), emit_strength=1.0),
               rot=(R(90), 0, 0), r2=0.1, cap=False)
    beam.location = (0, -0.072, 0.015)
    return [body, head, lens, btn, group("beam", [beam]), anchor("anchor_light_origin", (0, -0.072, 0.015))]


@asset("worksheet", ["ALL"], "Lembaran kerja / jadual rekod")
def _():
    m = M()
    parts = [box("sheet", (0.21, 0.297, 0.0006), (0, 0, 0.0003), m["paper"])]
    for i in range(8):
        parts.append(box(f"row{i}", (0.18, 0.0006, 0.0002), (0, 0.1 - i * 0.028, 0.0007), m["grey"]))
    for i in range(4):
        parts.append(box(f"col{i}", (0.0006, 0.196, 0.0002), (-0.09 + i * 0.06, 0.002, 0.0007), m["grey"]))
    parts.append(text("sheet_title", "JADUAL REKOD", 0.012, loc=(0, 0.125, 0.0007), m=m["navy"]))
    return parts


# ================================================================ AM01 body measurement
@asset("tape_measure", ["AM01"], "Pita ukur", note="scale pivot_tape X to extend")
def _():
    m = M()
    R = math.radians
    case = cyl("tm_case", 0.03, 0.02, m=m["yellow"], rot=(R(90), 0, 0), seg=32)
    case.location = (0, 0.01, 0.03)
    hub = cyl("tm_hub", 0.012, 0.022, m=m["black"], rot=(R(90), 0, 0))
    hub.location = (0, 0.011, 0.03)
    strip = [box("tm_strip", (0.3, 0.013, 0.0006), (0.15, 0, 0.0003), mat("tape", (1, 0.95, 0.4), rough=0.5))]
    for i in range(31):
        L = 0.006 if i % 5 else 0.01
        strip.append(box(f"tm_tick{i}", (0.0006, L, 0.0002), (i * 0.01, 0.0065 - L / 2, 0.0007), m["black"]))
    hook = box("tm_hook", (0.002, 0.014, 0.008), (0.301, 0, 0.004), m["steel"])
    p = group("pivot_tape", strip + [hook], loc=(0.03, 0, 0))
    return [case, hub, p]


@asset("weighing_scale", ["AM01"], "Penimbang berat badan", note="rotate pivot_needle about three.js Y; 360deg = 120kg")
def _():
    m = M()
    base = box("scale_base", (0.3, 0.32, 0.05), (0, 0, 0.025), m["white"], bevel=0.015)
    mat_top = box("scale_mat", (0.26, 0.2, 0.002), (0, 0.04, 0.051), mat("scale_mat", (0.3, 0.3, 0.33), rough=0.9))
    dial = cyl("scale_dial", 0.045, 0.004, loc=(0, -0.105, 0.049), m=m["white"], seg=48)
    win = torus("scale_window", 0.045, 0.004, loc=(0, -0.105, 0.052), m=m["grey"])
    ticks = []
    for i in range(24):
        a = i * math.pi / 12
        ticks.append(box(f"scale_tick{i}", (0.001, 0.007 if i % 2 == 0 else 0.004, 0.0005),
                         (0.038 * math.sin(a), -0.105 + 0.038 * math.cos(a), 0.0535), m["black"], rot=(0, 0, -a)))
    needle = box("scale_needle", (0.0015, 0.036, 0.001), (0, -0.105 + 0.016, 0.054), m["red"])
    return [base, mat_top, dial, win, group("pivot_needle", [needle], loc=(0, -0.105, 0.054))] + ticks


@asset("height_chart", ["AM01"], "Carta tinggi (stadiometer)", note="move pivot_slider along three.js Y (0..1.5 m)")
def _():
    m = M()
    parts = [box("hc_foot", (0.3, 0.25, 0.02), (0, -0.08, 0.01), m["wood"], bevel=0.004),
             box("hc_board", (0.12, 0.02, 1.6), (0, 0.02, 0.8), m["white"])]
    cols = [m["red"], m["yellow"], m["green"], m["blue"], m["pink"]]
    for i in range(16):
        z = i * 0.1
        parts.append(box(f"hc_band{i}", (0.03, 0.001, 0.1), (-0.045, 0.0095, z + 0.05), cols[i % 5]))
        parts.append(box(f"hc_tick{i}", (0.05, 0.001, 0.002), (0.02, 0.0095, z), m["black"]))
        parts.append(text(f"hc_num{i}", str(i * 10), 0.02, loc=(0.03, 0.009, z + 0.02), m=m["black"], rot=(math.radians(90), 0, 0)))
    head = box("hc_slider", (0.1, 0.22, 0.012), (0, -0.1, 0), m["pink"], bevel=0.003)
    parts.append(group("pivot_slider", [head], loc=(0, 0, 1.2)))
    return parts


@asset("hand_tracing", ["AM01"], "Jejak tapak tangan atas kertas surih")
def _():
    m = M()
    sheet = box("tracing_sheet", (0.15, 0.2, 0.0005), (0, 0, 0.00025), mat("tracing", (0.95, 0.96, 0.98), alpha=0.8))
    # simple mitten-with-fingers outline (cm scale for a 7-yr-old)
    palm = poly_extrude("hand_palm", [(-0.03, -0.06), (0.03, -0.06), (0.035, 0.01), (-0.035, 0.01)], 0.0006,
                        loc=(0, -0.01, 0.0005), m=m["pink"])
    fingers = []
    for i, (x, L) in enumerate([(-0.026, 0.045), (-0.009, 0.055), (0.009, 0.052), (0.026, 0.042)]):
        fingers.append(box(f"hand_finger{i}", (0.013, L, 0.0006), (x, L / 2 + 0.0, 0.0008), m["pink"], bevel=0.0002))
    thumb = box("hand_thumb", (0.013, 0.04, 0.0006), (-0.045, -0.03, 0.0008), m["pink"], rot=(0, 0, math.radians(35)))
    measure = box("hand_length_line", (0.001, 0.12, 0.0003), (0.05, -0.005, 0.0009), m["red"])
    return [sheet, palm, thumb, measure, anchor("anchor_wrist", (0, -0.07, 0.001)),
            anchor("anchor_fingertip", (0, 0.055, 0.001))] + fingers


def kid(shirt, bottom, hair, height=1.2, drape=False):
    def build():  # args are lambdas: materials must be created after reset()
        parts, hz, hr = figure("kid", height, shirt(), bottom(), hair(), drape=drape)
        return parts + [anchor("anchor_head_top", (0, 0, hz + hr)), anchor("anchor_hand_r", (height * 0.18, 0, height * 0.43))]
    return build


variant("kid_boy", ["AM01", "ALL"], "Murid lelaki (tinggi 1.20 m)",
        kid(lambda: mat("uniform_shirt", (0.97, 0.97, 0.97)), lambda: mat("uniform_navy", (0.12, 0.16, 0.38)),
            lambda: M()["black"]),
        height_m=1.2)
variant("kid_girl", ["AM01", "ALL"], "Murid perempuan (tinggi 1.15 m)",
        kid(lambda: mat("uniform_shirt", (0.97, 0.97, 0.97)), lambda: mat("uniform_blue", (0.2, 0.4, 0.75)),
            lambda: mat("tudung", (0.97, 0.97, 0.97)), 1.15, drape=True), height_m=1.15)


@asset("mascot_scientist", ["ALL"], "Maskot saintis Sakura Lab")
def _():
    m = M()
    parts, hz, hr = figure("mascot", 0.5, m["pink"], m["navy"], mat("hair_sakura", (0.98, 0.45, 0.65), rough=0.5),
                           coat=m["white"])
    parts.append(torus("mascot_goggles", hr * 0.95, hr * 0.08, loc=(0, 0, hz + hr * 0.45), m=m["blue"],
                       rot=(math.radians(8), 0, 0)))
    for sx in (-1, 1):
        parts.append(tube(f"mascot_lens_{sx}", hr * 0.22, hr * 0.18, hr * 0.12, m=m["glass"], bottom=False,
                          loc=(sx * hr * 0.35, -hr * 0.85, hz + hr * 0.45)))
        parts[-1].rotation_euler = (math.radians(90), 0, 0)
    flask = tube("mascot_flask", 0.018, 0.016, 0.03, m=m["glass"], loc=(0.09, -0.01, 0.2), r_out_top=0.006)
    liquid = cyl("mascot_flask_liquid", 0.015, 0.012, loc=(0.09, -0.01, 0.202), m=mat("potion", (0.4, 0.95, 0.6),
                 emit=(0.3, 1, 0.5), emit_strength=0.8), r2=0.011)
    petals = [sphere(f"mascot_petal{i}", hr * 0.12, loc=(hr * (0.5 - i * 0.25), hr * 0.2, hz + hr * 1.02),
                     m=m["pink"], scale=(1, 0.5, 0.3)) for i in range(5)]
    return parts + [flask, liquid, anchor("anchor_speech", (0, 0, hz + hr * 1.6))] + petals


# ================================================================ AM02 germination
@asset("mung_bean", ["AM02", "AM03"], "Biji kacang hijau")
def _():
    return [sphere("bean", 0.0025, m=mat("bean", (0.3, 0.55, 0.15), rough=0.3), scale=(1, 0.75, 0.7), loc=(0, 0, 0.0018)),
            sphere("bean_hilum", 0.0007, m=M()["white"], loc=(0, -0.0018, 0.0022), scale=(1.5, 0.5, 0.5))]


@asset("sprout_stages", ["AM02"], "Peringkat percambahan (stage_0..stage_4)", note="show one stage_* at a time")
def _():
    m = M()
    bean = mat("bean", (0.3, 0.55, 0.15), rough=0.3)
    root_m = mat("root", (0.95, 0.93, 0.82), rough=0.6)
    s = 0.0025
    stages = []
    # 0 dry seed
    stages.append(group("stage_0", [sphere("s0_seed", s, m=bean, scale=(1, 0.75, 0.7), loc=(0, 0, s))]))
    # 1 swollen, coat splitting, radicle tip
    stages.append(group("stage_1", [sphere("s1_seed", s * 1.25, m=bean, scale=(1, 0.8, 0.75), loc=(0, 0, s * 1.2)),
                                    curve_tube("s1_root", [(s, 0, s), (s * 1.8, 0, s * 0.3)], 0.0005, m=root_m)]))
    # 2 root grows down, hook forming
    stages.append(group("stage_2", [sphere("s2_seed", s * 1.2, m=bean, scale=(1, 0.8, 0.75), loc=(0, 0, s * 1.2)),
                                    curve_tube("s2_root", [(s, 0, s), (s * 3, 0, -s * 0.5), (s * 3.2, 0, -s * 3)], 0.0006, m=root_m),
                                    curve_tube("s2_hook", [(0, 0, s * 2), (0, 0, s * 4), (-s, 0, s * 3.5)], 0.0007, m=root_m)]))
    # 3 hypocotyl upright, cotyledons open
    stem3 = curve_tube("s3_stem", [(0, 0, 0), (0.001, 0, 0.012), (0, 0, 0.022)], 0.0008, m=root_m)
    cots = [sphere(f"s3_cot{i}", s, m=bean, loc=(sx * s * 0.9, 0, 0.022), scale=(0.9, 0.6, 0.5)) for i, sx in enumerate((-1, 1))]
    roots3 = curve_tube("s3_root", [(0, 0, 0), (0.002, 0, -0.01), (0.001, 0, -0.02)], 0.0006, m=root_m)
    stages.append(group("stage_3", [stem3, roots3] + cots))
    # 4 seedling with first true leaves
    stem4 = curve_tube("s4_stem", [(0, 0, 0), (0.001, 0, 0.025), (0, 0, 0.045)], 0.001, m=m["stem"])
    roots4 = [curve_tube(f"s4_root{i}", [(0, 0, 0), (0.004 * math.cos(i * 2.1), 0.004 * math.sin(i * 2.1), -0.012),
                                          (0.006 * math.cos(i * 2.1), 0.006 * math.sin(i * 2.1), -0.025)], 0.0005, m=root_m) for i in range(3)]
    lv = [leaf(f"s4_leaf{i}", 0.018, 0.008, m["leaf"], math.radians(25), math.radians(180 * i), (0, 0, 0.045)) for i in range(2)]
    stages.append(group("stage_4", [stem4] + roots4 + lv))
    return stages


def germ_cup(letter, band_color, cotton_wet=True, oil=False, frost=False):
    def build():
        m = M()
        parts = [tube(f"cup{letter}_body", 0.035, 0.0332, 0.08, m=m["plastic_clear"], r_out_top=0.045)]
        cot = mat("cotton_wet" if cotton_wet else "cotton_dry",
                  (0.82, 0.86, 0.9) if cotton_wet else (0.99, 0.99, 0.99), rough=0.95)
        parts.append(sphere("cotton", 0.032, loc=(0, 0, 0.008), m=cot, scale=(1, 1, 0.2), seg=16, rings=8))
        if cotton_wet:
            parts.append(cyl("water_film", 0.033, 0.003, loc=(0, 0, 0.002), m=m["water"]))
        if oil:
            parts.append(cyl("oil_layer", 0.036, 0.006, loc=(0, 0, 0.013), m=mat("oil", (0.95, 0.8, 0.2), rough=0.05,
                                                                                  alpha=0.6, transmission=0.5), r2=0.037))
        if frost:
            parts.append(tube("frost", 0.0455, 0.045, 0.004, loc=(0, 0, 0.076), m=mat("frost", (0.9, 0.97, 1.0), alpha=0.7),
                              bottom=False))
        parts.append(tube(f"cup{letter}_label", 0.0402, 0.04, 0.018, loc=(0, 0, 0.045), m=M()[band_color], bottom=False))
        t = text(f"cup{letter}_letter", letter, 0.014, loc=(0, -0.0415, 0.054), m=m["white"], rot=(math.radians(90), 0, 0))
        rnd = random.Random(ord(letter))
        seeds = [anchor(f"anchor_seed{i}", (0.02 * math.cos(i * 0.63) * rnd.uniform(0.3, 1), 0.02 * math.sin(i * 0.63) *
                                             rnd.uniform(0.3, 1), 0.014)) for i in range(10)]
        return parts + [t] + seeds
    return build


variant("cup_A", ["AM02"], "Bekas A — kapas basah (air+udara+suhu sesuai)", germ_cup("A", "green"),
        condition="lengkap", germinates=True)
variant("cup_B", ["AM02"], "Bekas B — kapas kering (tiada air)", germ_cup("B", "yellow", cotton_wet=False),
        condition="tiada_air", germinates=False)
variant("cup_C", ["AM02"], "Bekas C — biji ditutup minyak (tiada udara)", germ_cup("C", "red", oil=True),
        condition="tiada_udara", germinates=False)
variant("cup_D", ["AM02"], "Bekas D — dalam peti sejuk (suhu tidak sesuai)", germ_cup("D", "blue", frost=True),
        condition="terlalu_sejuk", germinates=False)


@asset("cotton_ball", ["AM02"], "Kapas")
def _():
    rnd = random.Random(3)
    cm = mat("cotton_dry", (0.99, 0.99, 0.99), rough=0.95)
    return [sphere(f"cotton{i}", rnd.uniform(0.008, 0.012), loc=(rnd.uniform(-0.008, 0.008), rnd.uniform(-0.008, 0.008),
                                                                  0.009 + rnd.uniform(0, 0.005)), m=cm, seg=12, rings=8) for i in range(6)]


@asset("oil_bottle", ["AM02"], "Botol minyak masak")
def _():
    m = M()
    body = tube("ob_body", 0.028, 0.026, 0.14, m=mat("pet", (0.95, 0.98, 0.9), rough=0.1, alpha=0.35, transmission=0.9))
    shoulder = cyl("ob_shoulder", 0.028, 0.03, loc=(0, 0, 0.14), m=body.data.materials[0], r2=0.011)
    oil = cyl("ob_oil", 0.0255, 0.12, loc=(0, 0, 0.003), m=mat("oil", (0.95, 0.8, 0.2), rough=0.05, alpha=0.6, transmission=0.5))
    cap = cyl("ob_cap", 0.012, 0.015, loc=(0, 0, 0.168), m=m["red"])
    label = tube("ob_label", 0.0285, 0.0282, 0.05, loc=(0, 0, 0.04), m=m["yellow"], bottom=False)
    return [body, shoulder, oil, cap, label]


@asset("water_jug", ["AM02", "AM04"], "Jag air")
def _():
    m = M()
    parts = glass_with_water("jug", r=0.05, h=0.15, level=0.7)
    handle = torus("jug_handle", 0.035, 0.007, loc=(0.058, 0, 0.085), m=m["plastic_clear"], rot=(math.radians(90), 0, 0))
    spout = cyl("jug_spout", 0.012, 0.02, loc=(-0.055, 0, 0.14), m=m["plastic_clear"], r2=0.02, rot=(0, math.radians(-40), 0))
    return parts + [handle, spout]


@asset("mini_fridge", ["AM02"], "Peti sejuk", note="rotate pivot_door about three.js Y to open")
def _():
    m = M()
    shell = mat("fridge", (0.93, 0.95, 0.97), rough=0.3)
    inside = mat("fridge_inside", (0.8, 0.9, 1.0), rough=0.5, emit=(0.85, 0.92, 1.0), emit_strength=0.3)
    W, D, H, t = 0.5, 0.5, 0.85, 0.03
    parts = [box("fr_back", (W, t, H), (0, D / 2 - t / 2, H / 2), shell),
             box("fr_left", (t, D, H), (-W / 2 + t / 2, 0, H / 2), shell),
             box("fr_right", (t, D, H), (W / 2 - t / 2, 0, H / 2), shell),
             box("fr_top", (W, D, t), (0, 0, H - t / 2), shell),
             box("fr_bottom", (W, D, t), (0, 0, t / 2 + 0.04), shell),
             box("fr_plinth", (W - 0.02, D - 0.04, 0.04), (0, 0.01, 0.02), m["grey"]),
             box("fr_inner_back", (W - 2 * t, 0.002, H - 2 * t), (0, D / 2 - t - 0.001, H / 2), inside),
             box("fr_shelf", (W - 2 * t, D - 2 * t, 0.006), (0, 0, 0.45), m["glass"])]
    door = box("fr_door", (W, 0.035, H - 0.04), (0, -D / 2 - 0.0175, H / 2 + 0.02), shell, bevel=0.006)
    handle = box("fr_handle", (0.02, 0.025, 0.25), (-W / 2 + 0.05, -D / 2 - 0.05, H * 0.6), m["grey"], bevel=0.005)
    snow = text("fr_logo", "*", 0.06, loc=(0, -D / 2 - 0.036, H * 0.85), m=m["blue"], rot=(math.radians(90), 0, 0))
    parts.append(group("pivot_door", [door, handle, snow], loc=(W / 2, -D / 2, 0)))
    parts.append(anchor("anchor_shelf", (0, 0, 0.456)))
    return parts


# ================================================================ AM03 / AM04 plants
@asset("plant_growth", ["AM03"], "Pokok dalam pasu — tumbesaran minggu 1-3", note="show one week_* at a time")
def _():
    parts, top = pot()
    weeks = []
    for w, (h, n) in enumerate([(0.05, 2), (0.11, 4), (0.19, 7)], start=1):
        g = plant(f"week_{w}", h, n, M()["leaf"], stem_r=0.0018 + 0.0008 * w)
        g.location = (0, 0, top)
        weeks.append(g)
    return parts + weeks + [anchor("anchor_soil", (0, 0, top))]


def potted(leaf_key, h, n, droop=0.0, lean=0.0, bag=False):
    def build():
        parts, top = pot()
        g = plant("plant", h, n, M()[leaf_key], droop=droop, lean=lean)
        g.location = (0, 0, top)
        parts.append(g)
        if bag:
            b = sphere("plastic_bag", 0.085, loc=(0, 0, top + h * 0.55), m=mat("bag", (0.95, 0.97, 1.0), rough=0.2, alpha=0.3),
                       scale=(1, 1, 1.6), seg=20, rings=12)
            tie = torus("bag_tie", 0.062, 0.004, loc=(0, 0, top + 0.004), m=M()["red"])
            parts += [b, tie]
        return parts + [anchor("anchor_soil", (0, 0, top)), anchor("anchor_top", (0, 0, top + h))]
    return build


variant("plant_healthy", ["AM03", "AM04"], "Pokok A — sihat (air, cahaya, udara)", potted("leaf", 0.2, 7),
        condition="lengkap", healthy=True)
variant("plant_no_water", ["AM04"], "Pokok B — tanpa air (layu)", potted("leaf_wilted", 0.17, 6, droop=0.9),
        condition="tiada_air", healthy=False)
variant("plant_no_light", ["AM04"], "Pokok C — tanpa cahaya (pucat, tinggi kurus)", potted("leaf_pale", 0.26, 5, lean=0.02),
        condition="tiada_cahaya", healthy=False)
variant("plant_no_air", ["AM04"], "Pokok D — daun bergris / tanpa udara", potted("leaf_greased", 0.18, 6, droop=0.45, bag=True),
        condition="tiada_udara", healthy=False)


@asset("dark_box", ["AM04"], "Kotak gelap (halang cahaya)", note="rotate pivot_lid about three.js X to open")
def _():
    m = M()
    return open_box("db", 0.3, 0.3, 0.42, 0.006, m["cardboard"], inner=m["dark"]) + [
        hinged_lid("db", 0.3, 0.3, 0.006, 0.42, m["cardboard"]), anchor("anchor_inside", (0, 0, 0.006))]


@asset("watering_can", ["AM03", "AM04"], "Penyiram air")
def _():
    m = M()
    body = cyl("wc_body", 0.06, 0.12, m=m["green"], seg=32)
    top = cyl("wc_top", 0.06, 0.012, loc=(0, 0, 0.12), m=m["green"], r2=0.04)
    spout = cyl("wc_spout", 0.008, 0.16, loc=(-0.05, 0, 0.03), m=m["green"], r2=0.006, rot=(0, math.radians(-50), 0))
    rose = cyl("wc_rose", 0.009, 0.015, loc=(-0.172, 0, 0.13), m=m["yellow"], r2=0.018, rot=(0, math.radians(-50), 0))
    handle = torus("wc_handle", 0.05, 0.007, loc=(0.03, 0, 0.13), m=m["green"], rot=(math.radians(90), 0, 0))
    return [body, top, spout, rose, handle, anchor("anchor_pour", (-0.19, 0, 0.14))]


@asset("string_coil", ["AM03", "AM12"], "Benang / tali")
def _():
    pts = [(0.012 * math.cos(t * 0.6), 0.012 * math.sin(t * 0.6), 0.0015 + t * 0.0004) for t in range(30)]
    pts += [(0.012 + 0.005 * i, -0.004 * i, 0.0015) for i in range(1, 8)]
    return [curve_tube("string", pts, 0.0008, m=mat("string", (0.95, 0.9, 0.8), rough=0.9))]


# ================================================================ AM05 mystery box
def shoe_box(lit):
    def build():
        m = M()
        W, D, H, t = 0.3, 0.18, 0.11, 0.004
        parts = open_box("sb", W, D, H, t, m["cardboard"] if not lit else mat("box_blue", (0.35, 0.55, 0.85), rough=0.8),
                         inner=m["dark"])
        parts.append(hinged_lid("sb", W, D, t, H, parts[0].data.materials[0]))
        hole = cyl("peephole", 0.008, 0.002, loc=(-W / 2 - 0.0005, 0, H * 0.6), m=m["black"], rot=(0, math.radians(90), 0))
        parts.append(hole)
        parts.append(text("sb_label", "B" if lit else "A", 0.05, loc=(0, -D / 2 - 0.001, H / 2), m=m["white"],
                          rot=(math.radians(90), 0, 0)))
        if lit:
            lamp = sphere("inner_lamp", 0.01, loc=(0, 0, H - 0.015), m=mat("lamp_on", (1, 1, 0.85), emit=(1, 0.95, 0.7),
                                                                              emit_strength=4.0))
            parts.append(group("light", [lamp]))
        for i, x in enumerate((-0.08, 0, 0.08)):
            parts.append(anchor(f"anchor_object{i}", (x, 0, t)))
        parts.append(anchor("anchor_eye", (-W / 2 - 0.03, 0, H * 0.6)))
        return parts
    return build


variant("shoe_box_dark", ["AM05"], "Kotak misteri A — gelap", shoe_box(False), has_light=False)
variant("shoe_box_lit", ["AM05"], "Kotak misteri B — bercahaya", shoe_box(True), has_light=True)


@asset("eraser", ["AM05", "AM07"], "Getah pemadam", conductor=False, material="getah")
def _():
    m = M()
    return [box("eraser_body", (0.04, 0.02, 0.01), (0, 0, 0.005), m["white"], bevel=0.002),
            box("eraser_sleeve", (0.024, 0.0205, 0.0105), (0.007, 0, 0.005), m["blue"])]


variant("pencil", ["AM05", "AM12"], "Pensel bergetah pemadam",
        lambda: [pencil_lying()], material="kayu")


def pencil_lying():
    p = pencil()
    p.rotation_euler = (0, math.radians(90), 0)
    p.location = (-0.085, 0, 0.0035)
    return p


@asset("coin", ["AM05", "AM07"], "Duit syiling", conductor=True, material="logam")
def _():
    m = M()
    return [cyl("coin_body", 0.0115, 0.0018, m=m["brass"], seg=40),
            torus("coin_rim", 0.0108, 0.0004, loc=(0, 0, 0.0018), m=m["brass"], seg=40, mseg=4),
            text("coin_value", "50", 0.008, loc=(0, 0, 0.0019), m=mat("brass_dark", (0.6, 0.45, 0.2), metal=1.0, rough=0.4))]


# ================================================================ AM06 shadows
@asset("white_screen", ["AM06"], "Skrin putih", note="shadows land on node screen_face (three.js -Z side)")
def _():
    m = M()
    face = box("screen_face", (0.45, 0.01, 0.32), (0, 0, 0.2), mat("screen", (1, 1, 1), rough=0.95))
    frame = [box(f"screen_frame{i}", s, p, m["navy"]) for i, (s, p) in enumerate([
        ((0.47, 0.014, 0.012), (0, 0, 0.366)), ((0.47, 0.014, 0.012), (0, 0, 0.034)),
        ((0.012, 0.014, 0.34), (-0.23, 0, 0.2)), ((0.012, 0.014, 0.34), (0.23, 0, 0.2))])]
    feet = [box(f"screen_foot{i}", (0.03, 0.12, 0.012), (x, 0, 0.006), m["navy"]) for i, x in enumerate((-0.2, 0.2))]
    legs = [box(f"screen_leg{i}", (0.012, 0.012, 0.034), (x, 0, 0.017), m["navy"]) for i, x in enumerate((-0.2, 0.2))]
    return [face] + frame + feet + legs + [anchor("anchor_shadow_centre", (0, -0.006, 0.2))]


def sheet_stand(kind, m_sheet, label):
    def build():
        m = M()
        base = box("stand_base", (0.08, 0.05, 0.015), (0, 0, 0.0075), m["wood"], bevel=0.003)
        clip = box("stand_clip", (0.06, 0.012, 0.02), (0, 0, 0.025), m["black"])
        sheet = box("sheet_" + kind, (0.15, 0.002, 0.15), (0, 0, 0.11), m_sheet())
        tag = text("stand_tag", label, 0.009, loc=(0, -0.026, 0.0075), m=m["white"], rot=(math.radians(90), 0, 0))
        return [base, clip, sheet, tag]
    return build


variant("sheet_transparent", ["AM06"], "Plastik lutsinar", sheet_stand(
    "transparent", lambda: mat("sheet_transparent", (0.9, 0.97, 1.0), rough=0.05, alpha=0.12, transmission=1.0), "LUTSINAR"),
        opacity="lutsinar", shadow="tiada / sangat samar", light_through=0.9)
variant("sheet_translucent", ["AM06"], "Kertas surih (lut cahaya)", sheet_stand(
    "translucent", lambda: mat("sheet_translucent", (0.97, 0.97, 0.95), rough=0.8, alpha=0.6), "LUT CAHAYA"),
        opacity="lut_cahaya", shadow="samar", light_through=0.45)
variant("sheet_opaque", ["AM06"], "Kadbod (legap)", sheet_stand("opaque", lambda: M()["cardboard"], "LEGAP"),
        opacity="legap", shadow="jelas / gelap", light_through=0.0)


# ================================================================ AM07 circuits
@asset("dry_cell", ["AM07"], "Sel kering (bateri)", note="terminals anchor_pos / anchor_neg")
def _():
    m = M()
    body = cyl("cell_body", 0.0165, 0.058, m=m["black"], seg=32, rot=(0, math.radians(90), 0))
    body.location = (-0.029, 0, 0.0165)
    band = cyl("cell_band", 0.0167, 0.02, m=m["yellow"], seg=32, rot=(0, math.radians(90), 0))
    band.location = (0.009, 0, 0.0165)
    nub = cyl("cell_nub", 0.005, 0.0025, m=m["steel"], rot=(0, math.radians(90), 0))
    nub.location = (0.029, 0, 0.0165)
    neg = cyl("cell_neg", 0.013, 0.0008, m=m["steel"], rot=(0, math.radians(90), 0))
    neg.location = (-0.0298, 0, 0.0165)
    plus = text("cell_plus", "+", 0.014, loc=(0.018, 0, 0.0335), m=m["black"])
    minus = text("cell_minus", "-", 0.014, loc=(-0.018, 0, 0.0335), m=m["white"])
    return [body, band, nub, neg, plus, minus, anchor("anchor_pos", (0.032, 0, 0.0165)), anchor("anchor_neg", (-0.031, 0, 0.0165))]


def bulb_parts(prefix="bulb", loc=(0, 0, 0)):
    m = M()
    x, y, z = loc
    base = box(f"{prefix}_holder", (0.05, 0.035, 0.012), (x, y, z + 0.006), m["navy"], bevel=0.002)
    screws = [cyl(f"{prefix}_screw{i}", 0.003, 0.004, loc=(x + sx * 0.019, y, z + 0.012), m=m["brass"]) for i, sx in enumerate((-1, 1))]
    socket = cyl(f"{prefix}_socket", 0.007, 0.012, loc=(x, y, z + 0.012), m=m["steel"], seg=16)
    glass = sphere(f"{prefix}_glass", 0.011, loc=(x, y, z + 0.034),
                   m=mat("bulb_glass", (1, 1, 0.95), rough=0.05, alpha=0.45, transmission=0.9, emit=(1, 0.85, 0.4), emit_strength=0.0),
                   scale=(1, 1, 1.15))
    neck = cyl(f"{prefix}_neck", 0.0068, 0.008, loc=(x, y, z + 0.022), m=glass.data.materials[0])
    fil = curve_tube(f"{prefix}_filament", [(x - 0.003, y, z + 0.026), (x - 0.002, y, z + 0.036), (x + 0.002, y, z + 0.036),
                                            (x + 0.003, y, z + 0.026)], 0.0003,
                     m=mat("filament", (0.3, 0.3, 0.3), emit=(1, 0.6, 0.2), emit_strength=0.0))
    return [base, socket, neck, glass, fil] + screws, [(x - 0.019, y, z + 0.016), (x + 0.019, y, z + 0.016)]


@asset("bulb_holder", ["AM07"], "Mentol + pemegang mentol",
       note="set MAT_bulb_glass & MAT_filament emissiveIntensity > 0 to light it")
def _():
    parts, (a, b) = bulb_parts()
    return parts + [anchor("anchor_term_a", a), anchor("anchor_term_b", b)]


def wire(prefix, pts, m_ins, clips=True):
    parts = [curve_tube(prefix, pts, 0.0018, m=m_ins)]
    if clips:
        parts += croc_clip(prefix + "_clipA", pts[0], m_ins) + croc_clip(prefix + "_clipB", pts[-1], m_ins)
    return parts


@asset("wire_red", ["AM07"], "Wayar penyambung (merah) dengan klip")
def _():
    return wire("wire", [(0, 0, 0.005), (0.05, 0.03, 0.01), (0.1, 0.02, 0.008), (0.15, 0, 0.005)], M()["red"])


@asset("wire_black", ["AM07"], "Wayar penyambung (hitam) dengan klip")
def _():
    return wire("wire", [(0, 0, 0.005), (0.05, -0.03, 0.01), (0.1, -0.02, 0.008), (0.15, 0, 0.005)], M()["black"])


@asset("switch", ["AM07"], "Suis", note="rotate pivot_lever about three.js Z: 0 = on, -25deg = off")
def _():
    m = M()
    base = box("sw_base", (0.05, 0.03, 0.008), (0, 0, 0.004), m["wood"], bevel=0.002)
    posts = [cyl(f"sw_post{i}", 0.003, 0.008, loc=(x, 0, 0.008), m=m["brass"]) for i, x in enumerate((-0.018, 0.018))]
    lever = box("sw_lever", (0.038, 0.006, 0.0015), (0.019, 0, 0.0005), m["steel"])
    knob = sphere("sw_knob", 0.004, loc=(0.036, 0, 0.003), m=m["black"])
    pl = group("pivot_lever", [lever, knob], loc=(-0.018, 0, 0.0165))
    return [base, pl] + posts + [anchor("anchor_term_a", (-0.018, 0, 0.012)), anchor("anchor_term_b", (0.018, 0, 0.012))]


@asset("circuit_tester", ["AM07"], "Litar penguji konduktor (siap pasang)",
       note="drop a test object on anchor_test; if its extras.conductor -> light MAT_bulb_glass")
def _():
    m = M()
    board = box("ct_board", (0.26, 0.16, 0.012), (0, 0, 0.006), m["wood"], bevel=0.003)
    # battery in holder, left
    holder = box("ct_cell_holder", (0.075, 0.04, 0.012), (-0.07, 0.04, 0.018), m["black"])
    cell = cyl("ct_cell", 0.0165, 0.058, m=m["black"], rot=(0, math.radians(90), 0))
    cell.location = (-0.099, 0.04, 0.038)
    band = cyl("ct_cell_band", 0.0167, 0.02, m=m["yellow"], rot=(0, math.radians(90), 0))
    band.location = (-0.061, 0.04, 0.038)
    bparts, (ba, bb) = bulb_parts("ct_bulb", (0.07, 0.04, 0.012))
    w1 = wire("ct_wire1", [(-0.037, 0.04, 0.038), (0.0, 0.07, 0.03), (0.051, 0.04, 0.028)], m["red"], clips=False)
    w2 = wire("ct_wire2", [(-0.103, 0.04, 0.038), (-0.11, -0.02, 0.02), (-0.03, -0.04, 0.02)], m["black"], clips=False)
    w3 = wire("ct_wire3", [(0.089, 0.04, 0.028), (0.1, -0.02, 0.02), (0.03, -0.04, 0.02)], m["red"], clips=False)
    clips = croc_clip("ct_clipL", (-0.02, -0.04, 0.02), m["black"]) + croc_clip("ct_clipR", (0.02, -0.04, 0.02), m["red"])
    clips[-3].rotation_euler = (0, 0, math.pi)  # right clip faces the gap
    pad = box("ct_test_pad", (0.07, 0.04, 0.002), (0, -0.04, 0.013), mat("pad", (0.98, 0.92, 0.94)))
    return [board, holder, cell, band, pad] + bparts + w1 + w2 + w3 + clips + [
        anchor("anchor_test", (0, -0.04, 0.014)), anchor("anchor_bulb", (0.07, 0.04, 0.05))]


@asset("iron_nail", ["AM07"], "Paku besi", conductor=True, material="logam (besi)", magnetic=True)
def _():
    m = M()
    shaft = cyl("nail_shaft", 0.0015, 0.05, m=m["steel"], rot=(0, math.radians(90), 0), seg=12)
    shaft.location = (-0.025, 0, 0.003)
    tip = cyl("nail_tip", 0.0015, 0.006, m=m["steel"], rot=(0, math.radians(90), 0), r2=0.0, seg=12)
    tip.location = (0.025, 0, 0.003)
    head = cyl("nail_head", 0.0035, 0.0012, m=m["steel"], rot=(0, math.radians(90), 0), seg=16)
    head.location = (-0.0262, 0, 0.003)
    return [shaft, tip, head]


@asset("paper_clip", ["AM07", "AM08"], "Klip kertas", conductor=True, material="logam", magnetic=True)
def _():
    pts = [(0.012, -0.004, 0.0006), (0.014, 0, 0.0006), (0.012, 0.004, 0.0006), (-0.012, 0.004, 0.0006), (-0.014, 0, 0.0006),
           (-0.012, -0.004, 0.0006), (0.008, -0.004, 0.0006), (0.01, -0.001, 0.0006), (0.008, 0.0015, 0.0006),
           (-0.008, 0.0015, 0.0006)]
    return [curve_tube("clip", pts, 0.0005, m=M()["steel"], res=4)]


@asset("plastic_ruler_small", ["AM07"], "Pembaris plastik", conductor=False, material="plastik")
def _():
    return [box("pr_body", (0.15, 0.025, 0.002), (0, 0, 0.001), mat("plastic_pink", (0.98, 0.5, 0.7), rough=0.2, alpha=0.8))] + \
           [box(f"pr_tick{i}", (0.0005, 0.006, 0.0003), (-0.07 + i * 0.01, 0.009, 0.0021), M()["black"]) for i in range(15)]


@asset("wood_block", ["AM07"], "Blok kayu", conductor=False, material="kayu")
def _():
    return [box("wood", (0.05, 0.03, 0.02), (0, 0, 0.01), M()["wood"], bevel=0.002)]


@asset("sponge", ["AM07"], "Span", conductor=False, material="span")
def _():
    return [box("sponge", (0.06, 0.04, 0.02), (0, 0, 0.01), mat("sponge", (0.98, 0.85, 0.25), rough=1.0), bevel=0.004),
            box("sponge_scrub", (0.06, 0.04, 0.005), (0, 0, 0.0225), M()["green"], bevel=0.001)]


# ================================================================ AM08 separating mixtures
@asset("sieve", ["AM08"], "Penapis / ayak", separates="batu kecil daripada pasir")
def _():
    m = M()
    ring = tube("sieve_ring", 0.06, 0.057, 0.03, m=m["steel"], bottom=False)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=20, y_subdivisions=20, size=0.114, location=(0, 0, 0.003))
    mesh = bpy.context.object
    mesh.name = "sieve_mesh"
    wf = mesh.modifiers.new("wf", "WIREFRAME")
    wf.thickness = 0.0006
    bpy.ops.object.modifier_apply(modifier=wf.name)
    bpy.ops.object.select_all(action="DESELECT")
    # trim grid to circle: delete verts outside radius
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if (v.co.x ** 2 + v.co.y ** 2) ** 0.5 > 0.057], context="VERTS")
    bm.to_mesh(mesh.data)
    bm.free()
    mesh.data.materials.append(m["steel"])
    handle = box("sieve_handle", (0.1, 0.012, 0.006), (0.11, 0, 0.025), m["wood"], bevel=0.002)
    return [ring, mesh, handle, anchor("anchor_catch", (0, 0, 0.005))]


@asset("horseshoe_magnet", ["AM08"], "Magnet ladam", separates="klip kertas (besi) daripada pasir")
def _():
    m = M()
    Ro, Ri, L, n = 0.03, 0.016, 0.04, 12
    outer = [(Ro * math.cos(math.pi * i / n), Ro * math.sin(math.pi * i / n)) for i in range(n + 1)]
    inner = [(Ri * math.cos(math.pi * i / n), Ri * math.sin(math.pi * i / n)) for i in range(n, -1, -1)]
    pts = [(Ro, -L)] + outer + [(-Ro, -L), (-Ri, -L)] + inner + [(Ri, -L)]
    body = poly_extrude("magnet_body", pts, 0.012, m=m["red"])
    tips = [box(f"magnet_tip{i}", (Ro - Ri, 0.012, 0.0122), (sx * (Ro + Ri) / 2, -L + 0.006, 0.006), m["steel"])
            for i, sx in enumerate((-1, 1))]
    labels = [text("magnet_N", "N", 0.008, loc=(-(Ro + Ri) / 2, -L + 0.006, 0.0123), m=m["red"]),
              text("magnet_S", "S", 0.008, loc=((Ro + Ri) / 2, -L + 0.006, 0.0123), m=m["blue"])]
    return [body] + tips + labels + [anchor("anchor_pole", (0, -L, 0.006))]


@asset("funnel_filter", ["AM08"], "Corong turas & kertas turas atas bikar", separates="pasir daripada air")
def _():
    m = M()
    parts = glass_with_water("bk", r=0.035, h=0.095, level=0.25)
    funnel = tube("funnel_cone", 0.006, 0.0045, 0.05, loc=(0, 0, 0.115), m=m["plastic_clear"], bottom=False, r_out_top=0.045)
    stem = tube("funnel_stem", 0.006, 0.0045, 0.04, loc=(0, 0, 0.075), m=m["plastic_clear"], bottom=False)
    paper = cyl("filter_paper", 0.004, 0.047, loc=(0, 0, 0.12), m=mat("filter", (0.98, 0.98, 0.96), rough=1.0, alpha=0.85),
                r2=0.04, cap=False)
    residue = cyl("residue_sand", 0.006, 0.012, loc=(0, 0, 0.121), m=mat("sand", (0.85, 0.72, 0.5), rough=1.0), r2=0.016)
    return parts + [funnel, stem, paper, group("residue", [residue]), anchor("anchor_pour", (0, 0, 0.2)),
                    anchor("anchor_drip", (0, 0, 0.074))]


@asset("sand_pile", ["AM08", "AM09"], "Pasir", soluble=False)
def _():
    return powder_pile("sand", 0.04, 0.02, mat("sand", (0.85, 0.72, 0.5), rough=1.0), grains=12)


@asset("pebbles", ["AM08", "AM09"], "Batu kecil", soluble=False, magnetic=False)
def _():
    rnd = random.Random(7)
    cols = [mat(f"pebble{i}", c, rough=0.8) for i, c in enumerate([(0.5, 0.5, 0.5), (0.62, 0.58, 0.52), (0.4, 0.38, 0.36)])]
    return [sphere(f"pebble{i}", rnd.uniform(0.004, 0.008), loc=(rnd.uniform(-0.025, 0.025), rnd.uniform(-0.025, 0.025), 0.004),
                   m=cols[i % 3], scale=(1, rnd.uniform(0.6, 0.9), 0.55), seg=10, rings=6) for i in range(14)]


def mixture_tray(kind):
    def build():
        m = M()
        rnd = random.Random(11)
        tray = tube("mix_tray", 0.08, 0.077, 0.02, m=m["white"], r_out_top=0.085)
        parts = [tray, cyl("mix_sand", 0.075, 0.008, loc=(0, 0, 0.003), m=mat("sand", (0.85, 0.72, 0.5), rough=1.0))]
        for i in range(12):
            loc = (rnd.uniform(-0.05, 0.05), rnd.uniform(-0.05, 0.05), 0.012)
            if kind == "pebbles":
                parts.append(sphere(f"mix_pebble{i}", rnd.uniform(0.004, 0.007), loc=loc, m=m["grey"], scale=(1, 0.8, 0.6), seg=8, rings=6))
            else:
                c = bpy.data.objects.new(f"mix_clip{i}", None)  # placeholder anchor for runtime paper_clip instances
                bpy.context.collection.objects.link(c)
                c.location = loc
                c.rotation_euler = (0, 0, rnd.uniform(0, 6.28))
                c.name = f"anchor_clip{i}"
                parts.append(c)
        return parts
    return build


variant("mix_sand_pebbles", ["AM08"], "Campuran pasir + batu kecil", mixture_tray("pebbles"), method="mengayak")
variant("mix_sand_clips", ["AM08"], "Campuran pasir + klip kertas (klip = anchor_clip*)", mixture_tray("clips"),
        method="magnet")


@asset("muddy_water", ["AM08"], "Campuran air + pasir", method="menuras")
def _():
    m = M()
    parts = glass_with_water("mud", r=0.035, h=0.095, level=0.7,
                             m_water=mat("muddy", (0.65, 0.5, 0.3), rough=0.2, alpha=0.75, transmission=0.3))
    parts.append(cyl("sediment", 0.032, 0.01, loc=(0, 0, 0.002), m=mat("sand", (0.85, 0.72, 0.5), rough=1.0)))
    return parts


# ================================================================ AM09 / AM10 dissolving
SAMPLES = [
    ("sugar", "Gula", (0.98, 0.98, 0.98), True, (0.98, 0.98, 1.0, 0.0)),
    ("salt", "Garam", (0.93, 0.94, 0.97), True, (0.95, 0.95, 1.0, 0.0)),
    ("sand", "Pasir", (0.85, 0.72, 0.5), False, None),
    ("coffee", "Serbuk kopi", (0.3, 0.18, 0.1), True, (0.35, 0.2, 0.1, 0.8)),
    ("flour", "Tepung", (0.97, 0.95, 0.88), False, (0.95, 0.94, 0.9, 0.6)),
    ("cocoa", "Serbuk koko", (0.4, 0.24, 0.15), False, (0.45, 0.28, 0.18, 0.7)),
]
for key, bm_name, col, sol, tint in SAMPLES:
    def _mk(key=key, col=col):
        pile = powder_pile(key, 0.03, 0.016, mat(key, col, rough=0.95), seed=len(key), grains=8)
        for o in pile:
            o.location.z += 0.006
        return [saucer()] + pile
    variant(f"sample_{key}", ["AM09"] + (["AM10"] if key == "sugar" else []), f"{bm_name} (atas piring)", _mk,
            soluble=sol, water_tint=list(tint) if tint else None,
            note="water_tint = RGBA the glass water should fade to; alpha 0 = clear solution")


@asset("sample_pebble", ["AM09"], "Batu kecil (atas piring)", soluble=False)
def _():
    return [saucer(), sphere("pebble", 0.012, loc=(0, 0, 0.014), m=M()["grey"], scale=(1, 0.8, 0.6))]


@asset("sugar_cube", ["AM10"], "Gula kasar / ketulan", soluble=True, dissolve_rate="perlahan")
def _():
    return [box("sugar_cube", (0.015, 0.015, 0.015), (0, 0, 0.0075), mat("sugar", (0.98, 0.98, 0.98), rough=0.95), bevel=0.0012)]


@asset("kettle", ["AM10", "AM11"], "Cerek air panas")
def _():
    m = M()
    body = sphere("kettle_body", 0.08, loc=(0, 0, 0.075), m=m["steel"], scale=(1, 1, 0.85), seg=32, rings=16)
    base = cyl("kettle_base", 0.07, 0.01, m=m["black"], seg=32)
    spout = cyl("kettle_spout", 0.012, 0.09, loc=(-0.06, 0, 0.06), m=m["steel"], r2=0.006, rot=(0, math.radians(-55), 0))
    handle = torus("kettle_handle", 0.055, 0.008, loc=(0, 0, 0.145), m=m["black"], rot=(math.radians(90), 0, 0))
    lid = cyl("kettle_lid", 0.035, 0.008, loc=(0, 0, 0.135), m=m["steel"], r2=0.03)
    knob = sphere("kettle_knob", 0.008, loc=(0, 0, 0.146), m=m["red"])
    return [body, base, spout, handle, lid, knob, anchor("anchor_steam", (-0.135, 0, 0.115))]


# ================================================================ AM11 water cycle
@asset("water_cycle_setup", ["AM11"], "Simulasi kitar air (balang + air panas + piring ais)",
       note="anchor_evap = wisps rise; anchor_condense = droplets form under plate; anchor_rain = drops fall")
def _():
    m = M()
    parts = glass_with_water("jar", r=0.06, h=0.16, level=0.35,
                             m_water=mat("water_hot", (1.0, 0.75, 0.6), rough=0.05, transmission=0.8, alpha=0.55))
    plate = cyl("plate", 0.068, 0.008, loc=(0, 0, 0.176), m=m["glass"], seg=40, r2=0.075)
    ice = [box(f"ice{i}", (0.022, 0.022, 0.02), (x, y, 0.194), mat("ice", (0.85, 0.95, 1.0), rough=0.1, alpha=0.6,
                                                                       transmission=0.9), bevel=0.003)
           for i, (x, y) in enumerate([(-0.025, -0.02), (0.02, -0.022), (0, 0.025), (0.03, 0.02), (-0.03, 0.02)])]
    for i, o in enumerate(ice):
        o.rotation_euler = (0, 0, i * 0.4)
    return parts + [plate] + ice + [anchor("anchor_evap", (0, 0, 0.06)), anchor("anchor_condense", (0, 0, 0.172)),
                                    anchor("anchor_rain", (0, 0, 0.17))]


@asset("ice_cube", ["AM11"], "Ketulan ais")
def _():
    return [box("ice", (0.022, 0.022, 0.02), (0, 0, 0.01), mat("ice", (0.85, 0.95, 1.0), rough=0.1, alpha=0.6, transmission=0.9),
                bevel=0.003)]


@asset("water_droplet", ["AM11"], "Titisan air / hujan")
def _():
    w = mat("droplet", (0.4, 0.7, 1.0), rough=0.05, alpha=0.8, transmission=0.6)
    return [sphere("drop_ball", 0.004, loc=(0, 0, 0.004), m=w), cyl("drop_tip", 0.0038, 0.006, loc=(0, 0, 0.0055), m=w, r2=0.0)]


@asset("cloud", ["AM11"], "Awan", note="tint MAT_cloud darker grey before rain")
def _():
    c = mat("cloud", (0.97, 0.98, 1.0), rough=0.9)
    return [sphere(f"cloud{i}", r, loc=l, m=c, seg=16, rings=10) for i, (r, l) in enumerate([
        (0.05, (0, 0, 0.05)), (0.038, (-0.05, 0, 0.04)), (0.04, (0.05, 0, 0.042)), (0.03, (-0.085, 0, 0.03)),
        (0.03, (0.088, 0, 0.03)), (0.035, (0.02, 0.02, 0.07))])]


@asset("sun", ["AM11", "AM05"], "Matahari")
def _():
    s = mat("sun", (1, 0.8, 0.2), emit=(1, 0.75, 0.2), emit_strength=2.0)
    parts = [sphere("sun_core", 0.05, loc=(0, 0, 0.1), m=s)]
    for i in range(12):
        a = i * math.pi / 6
        r = cyl(f"sun_ray{i}", 0.008, 0.03, m=s, r2=0.0, rot=(0, a + math.pi / 2, 0))
        r.location = (0.06 * math.cos(a), 0, 0.1 - 0.06 * math.sin(a))
        r.rotation_euler = (0, math.pi / 2 - a, 0)
        parts.append(r)
    return [group("pivot_spin", parts, loc=(0, 0, 0.1))]


@asset("water_cycle_diorama", ["AM11"], "Diorama kitar air semula jadi",
       note="anchors: evaporation (sea), condensation (cloud), precipitation (rain), collection (river mouth)")
def _():
    m = M()
    base = box("dio_base", (0.4, 0.28, 0.02), (0, 0, 0.01), m["soil"], bevel=0.004)
    sea = box("dio_sea", (0.16, 0.26, 0.004), (-0.11, 0, 0.022), mat("sea", (0.15, 0.45, 0.8), rough=0.1))
    land = box("dio_land", (0.22, 0.26, 0.006), (0.085, 0, 0.023), mat("grass", (0.35, 0.65, 0.25), rough=0.8))
    mountain = cyl("dio_mountain", 0.08, 0.15, loc=(0.11, 0.04, 0.026), m=mat("rock", (0.5, 0.48, 0.45), rough=0.9), r2=0.0, seg=7)
    cap = cyl("dio_snow", 0.027, 0.05, loc=(0.11, 0.04, 0.126), m=m["white"], r2=0.0, seg=7)
    river = curve_tube("dio_river", [(0.08, 0.0, 0.027), (0.05, -0.05, 0.027), (0.0, -0.07, 0.026), (-0.03, -0.08, 0.025)],
                       0.006, m=mat("sea", (0.15, 0.45, 0.8), rough=0.1))
    trees = []
    for i, (x, y) in enumerate([(0.03, 0.08), (0.17, -0.07), (0.05, -0.1), (0.18, 0.1)]):
        trees.append(cyl(f"dio_trunk{i}", 0.004, 0.02, loc=(x, y, 0.026), m=m["wood"]))
        trees.append(cyl(f"dio_crown{i}", 0.016, 0.035, loc=(x, y, 0.044), m=m["leaf"], r2=0.0, seg=8))
    c = mat("cloud", (0.97, 0.98, 1.0), rough=0.9)
    cloud = [sphere(f"dio_cloud{i}", r, loc=(0.04 + dx, 0.0, 0.23 + dz), m=c, seg=14, rings=8)
             for i, (r, dx, dz) in enumerate([(0.03, 0, 0), (0.024, -0.03, -0.006), (0.025, 0.032, -0.004)])]
    sun = sphere("dio_sun", 0.025, loc=(-0.17, 0.1, 0.25), m=mat("sun", (1, 0.8, 0.2), emit=(1, 0.75, 0.2), emit_strength=2.0))
    arrows = []
    return [base, sea, land, mountain, cap, river, sun, group("cloud_group", cloud)] + trees + arrows + [
        anchor("anchor_evaporation", (-0.11, 0, 0.1)), anchor("anchor_condensation", (0.04, 0, 0.2)),
        anchor("anchor_precipitation", (0.1, 0, 0.18)), anchor("anchor_collection", (-0.04, -0.08, 0.03))]


def label_card(word, color_key):
    def build():
        m = M()
        card = box("card", (0.08, 0.05, 0.002), (0, 0, 0.001), m["white"], bevel=0.001)
        band = box("card_band", (0.08, 0.012, 0.0022), (0, 0.019, 0.0011), m[color_key])
        t = text("card_word", word, 0.009, loc=(0, -0.004, 0.0023), m=m["navy"])
        return [card, band, t]
    return build


for w, ck, step in [("SEJATAN", "red", 1), ("KONDENSASI", "blue", 2), ("KERPASAN", "green", 3), ("PENGUMPULAN", "yellow", 4)]:
    variant(f"card_{w.lower()}", ["AM11"], f"Kad label: {w.title()}", label_card(w, ck), sequence=step)


# ================================================================ AM12 moving air
@asset("balloon", ["AM12"], "Belon", note="scale pivot_inflate uniformly 0.3..1 to inflate; origin at nozzle")
def _():
    m = M()
    b = mat("balloon", (0.95, 0.2, 0.35), rough=0.25)
    body = sphere("balloon_body", 0.1, loc=(0, 0, 0.13), m=b, scale=(1, 1, 1.25), seg=32, rings=16)
    neck = cyl("balloon_neck", 0.004, 0.028, loc=(0, 0, 0.0), m=b, r2=0.012)
    knot = torus("balloon_knot", 0.005, 0.002, loc=(0, 0, 0.0), m=b)
    return [group("pivot_inflate", [body, neck, knot]), anchor("anchor_nozzle", (0, 0, 0))]


@asset("balloon_rocket", ["AM12"], "Roket angin (belon pada straw & tali)",
       note="translate pivot_rocket along three.js X (-0.35..0.35) and shrink pivot_inflate as air escapes; thrust = -X")
def _():
    m = M()
    R = math.radians
    posts = [cyl(f"br_post{i}", 0.006, 0.25, loc=(x, 0, 0), m=m["wood"]) for i, x in enumerate((-0.4, 0.4))]
    feet = [box(f"br_foot{i}", (0.05, 0.05, 0.01), (x, 0, 0.005), m["wood"]) for i, x in enumerate((-0.4, 0.4))]
    line = cyl("br_string", 0.0008, 0.8, m=mat("string", (0.95, 0.9, 0.8), rough=0.9), rot=(0, R(90), 0), seg=6)
    line.location = (-0.4, 0, 0.24)
    straw = tube("br_straw", 0.0035, 0.003, 0.08, m=m["pink"], bottom=False)
    straw.rotation_euler = (0, R(90), 0)
    straw.location = (-0.04, 0, 0.24)
    tape = [tube(f"br_tape{i}", 0.02, 0.0195, 0.012, m=mat("tape_clear", (0.95, 0.95, 0.9), alpha=0.5), bottom=False)
            for i in range(2)]
    for t, x in zip(tape, (-0.02, 0.02)):
        t.rotation_euler = (0, R(90), 0)
        t.location = (x - 0.006, 0, 0.222)
    b = mat("balloon", (0.95, 0.2, 0.35), rough=0.25)
    body = sphere("br_balloon", 0.05, loc=(0, 0, 0.2), m=b, scale=(1.6, 1, 1), seg=24, rings=12)
    neck = cyl("br_neck", 0.004, 0.02, m=b, r2=0.01, rot=(0, R(-90), 0))
    neck.location = (-0.078, 0, 0.2)
    infl = group("pivot_inflate", [body, neck], loc=(0.0, 0, 0.2))
    rocket = group("pivot_rocket", [straw, infl] + tape, loc=(0, 0, 0.24))
    return posts + feet + [line, rocket, anchor("anchor_exhaust", (-0.1, 0, 0.2))]


@asset("pinwheel", ["AM12"], "Bebaling kertas pada pensel", note="spin pivot_rotor about three.js Z (axle faces -Z/+Z)")
def _():
    m = M()
    import mathutils
    stick = pencil("pw_stick", 0.17)
    stick.rotation_euler = (math.pi, 0, 0)  # eraser end up
    stick.location = (0, 0.004, 0.19)
    cols = [m["red"], m["yellow"], m["blue"], m["green"]]
    blades = []
    for i in range(4):
        bl = poly_extrude(f"pw_blade{i}", [(0.004, 0), (0.06, 0), (0.06, 0.056)], 0.0008, m=cols[i])
        # lie in XZ plane (axle = Y), 90deg apart, 12deg pitch so moving air turns it
        bl.matrix_world = (mathutils.Matrix.Rotation(i * math.pi / 2, 4, "Y") @
                           mathutils.Matrix.Rotation(math.radians(90), 4, "X") @
                           mathutils.Matrix.Rotation(math.radians(12), 4, "X"))
        blades.append(bl)
    pin = cyl("pw_pin", 0.0006, 0.018, m=m["steel"], rot=(math.radians(90), 0, 0))
    pin.location = (0, 0.012, 0)
    head = sphere("pw_pin_head", 0.003, loc=(0, -0.008, 0), m=m["red"])
    hub = sphere("pw_hub", 0.004, m=m["white"])
    rotor = group("pivot_rotor", blades + [pin, head, hub])
    rotor.location = (0, -0.004, 0.2)
    return [stick, rotor]


@asset("straw", ["AM12"], "Straw")
def _():
    s = tube("straw", 0.0035, 0.003, 0.2, m=M()["pink"], bottom=False)
    s.rotation_euler = (0, math.radians(90), 0)
    s.location = (-0.1, 0, 0.0035)
    stripes = [tube(f"straw_stripe{i}", 0.00355, 0.0035, 0.008, m=M()["white"], bottom=False) for i in range(8)]
    for i, st in enumerate(stripes):
        st.rotation_euler = (0, math.radians(90), 0)
        st.location = (-0.09 + i * 0.025, 0, 0.0035)
    return [s] + stripes


@asset("tape_roll", ["AM12"], "Pita pelekat")
def _():
    core = tube("tape_core", 0.02, 0.018, 0.015, m=M()["cardboard"], bottom=False)
    roll = tube("tape_roll", 0.03, 0.0202, 0.015, m=mat("tape_clear", (0.95, 0.95, 0.9), alpha=0.5), bottom=False)
    for o in (core, roll):
        o.rotation_euler = (math.radians(90), 0, 0)
        o.location = (0, 0.0075, 0.03)
    return [core, roll]


@asset("push_pin", ["AM12"], "Pin")
def _():
    m = M()
    return [cyl("pin_shaft", 0.0006, 0.012, m=m["steel"], r2=0.0002), cyl("pin_grip", 0.003, 0.01, loc=(0, 0, 0.012), m=m["red"], r2=0.002),
            cyl("pin_head", 0.005, 0.003, loc=(0, 0, 0.022), m=m["red"])]


@asset("scissors", ["AM12"], "Gunting", note="rotate pivot_blade_a about three.js Y to open")
def _():
    m = M()
    blade_a = poly_extrude("sc_blade_a", [(0, -0.004), (0.08, -0.001), (0.08, 0.001), (0, 0.004)], 0.0015, m=m["steel"])
    loop_a = torus("sc_loop_a", 0.012, 0.003, loc=(-0.03, 0.012, 0.0008), m=m["pink"])
    blade_b = poly_extrude("sc_blade_b", [(0, -0.004), (0.08, -0.001), (0.08, 0.001), (0, 0.004)], 0.0015, m=m["steel"],
                           loc=(0, 0, 0.0016))
    loop_b = torus("sc_loop_b", 0.012, 0.003, loc=(-0.03, -0.012, 0.0024), m=m["pink"])
    arm_a = box("sc_arm_a", (0.02, 0.004, 0.0015), (-0.012, 0.006, 0.0008), m["pink"], rot=(0, 0, math.radians(-25)))
    arm_b = box("sc_arm_b", (0.02, 0.004, 0.0015), (-0.012, -0.006, 0.0024), m["pink"], rot=(0, 0, math.radians(25)))
    screw = cyl("sc_screw", 0.002, 0.004, m=m["brass"])
    return [group("pivot_blade_a", [blade_a, loop_a, arm_a]), blade_b, loop_b, arm_b, screw]


# ================================================================ game UI props
def star_pts(R=0.03, r=0.013):
    return [((R if i % 2 == 0 else r) * math.cos(math.pi / 2 + i * math.pi / 5),
             (R if i % 2 == 0 else r) * math.sin(math.pi / 2 + i * math.pi / 5)) for i in range(10)]


@asset("ui_star", ["UI"], "Bintang ganjaran")
def _():
    s = poly_extrude("star", star_pts(), 0.008, m=mat("gold", (1, 0.8, 0.2), metal=0.6, rough=0.3, emit=(1, 0.7, 0.1), emit_strength=0.3))
    s.rotation_euler = (math.radians(90), 0, 0)
    s.location = (0, 0.004, 0.03)
    return [s]


@asset("ui_check", ["UI"], "Tanda betul")
def _():
    g = M()["green"]
    return [box("check_short", (0.025, 0.008, 0.01), (-0.014, 0, 0.022), g, rot=(0, math.radians(45), 0), bevel=0.002),
            box("check_long", (0.05, 0.008, 0.01), (0.011, 0, 0.032), g, rot=(0, math.radians(-50), 0), bevel=0.002)]


@asset("ui_cross", ["UI"], "Tanda salah")
def _():
    m = M()
    return [box("cross_a", (0.05, 0.008, 0.012), (0, 0, 0.03), m["red"], rot=(0, math.radians(45), 0), bevel=0.002),
            box("cross_b", (0.05, 0.008, 0.012), (0, 0, 0.03), m["red"], rot=(0, math.radians(-45), 0), bevel=0.002)]


@asset("ui_arrow", ["UI", "AM11"], "Anak panah (menunjuk three.js +Z)")
def _():
    m = M()
    shaft = cyl("arrow_shaft", 0.004, 0.05, m=m["yellow"], rot=(math.radians(90), 0, 0))
    shaft.location = (0, 0.025, 0.006)
    head = cyl("arrow_head", 0.01, 0.02, m=m["yellow"], r2=0.0, rot=(math.radians(90), 0, 0))
    head.location = (0, -0.025, 0.006)
    return [shaft, head]


for tp in range(1, 7):
    def _medal(tp=tp):
        m = M()
        cols = [(0.7, 0.45, 0.25), (0.75, 0.75, 0.78), (1, 0.8, 0.2), (0.4, 0.8, 0.5), (0.4, 0.6, 1), (0.95, 0.4, 0.7)]
        disc = cyl("medal_disc", 0.025, 0.004, m=mat(f"medal_tp{tp}", cols[tp - 1], metal=0.7, rough=0.3), seg=40,
                   rot=(math.radians(90), 0, 0))
        disc.location = (0, 0.002, 0.03)
        num = text("medal_num", f"TP{tp}", 0.012, loc=(0, -0.0025, 0.03), m=m["navy"], rot=(math.radians(90), 0, 0))
        rib = [box(f"medal_ribbon{i}", (0.01, 0.002, 0.035), (sx * 0.008, 0.002, 0.065), m["red" if i else "blue"],
                   rot=(0, sx * math.radians(15), 0)) for i, sx in enumerate((-1, 1))]
        return [disc, num] + rib
    variant(f"ui_medal_tp{tp}", ["UI"], f"Pingat TP{tp}", _medal, tp=tp)


# ================================================================ build loop
def bbox_dims(objs):
    import mathutils
    pts = [o.matrix_world @ mathutils.Vector(c) for o in objs if o.type == "MESH" for c in o.bound_box]
    if not pts:
        return [0, 0, 0]
    mn = [min(p[i] for p in pts) for i in range(3)]
    mx = [max(p[i] for p in pts) for i in range(3)]
    return [round(mx[i] - mn[i], 4) for i in range(3)]


def build(aid, fn, extras):
    reset()
    fn()
    scene = bpy.context.scene
    tops = [o for o in scene.objects if o.parent is None]
    root = group(aid, tops)
    for k, v in extras.items():
        if v is not None:
            root[k] = v
    bpy.context.view_layer.update()
    objs = list(scene.objects)
    meshes = [o for o in objs if o.type == "MESH"]
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
    names = sorted({o.name for o in objs if o.name.startswith(("pivot_", "anchor_", "stage_", "week_", "beam", "light",
                                                                "residue", "water", "cloud_group"))})
    mats = sorted({s.material.name for o in meshes for s in o.material_slots if s.material})
    for o in objs:
        o.select_set(True)
    path = os.path.join(OUT, aid + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_extras=True,
                              export_apply=True, export_yup=True)
    d = bbox_dims(meshes)
    return {"file": f"models/{aid}.glb", "size_m": [d[0], d[2], d[1]], "tris": tris, "nodes": names, "materials": mats,
            "bytes": os.path.getsize(path)}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    man_path = os.path.join(OUT, "..", "manifest.json")
    manifest = json.load(open(man_path, encoding="utf-8")) if (argv and os.path.exists(man_path)) else {"assets": {}}
    fails = []
    for aid, am, name_bm, fn, extras in REG:
        if argv and not any(a == aid or a in am for a in argv):
            continue
        try:
            info = build(aid, fn, extras)
            manifest["assets"][aid] = {"name_bm": name_bm, "am": am, **{k: v for k, v in extras.items() if v is not None}, **info}
            print(f"OK   {aid:24s} {info['tris']:6d} tris {info['bytes'] // 1024:5d} KB  {info['size_m']}")
        except Exception as e:
            import traceback
            traceback.print_exc()
            fails.append(aid)
            print(f"FAIL {aid}: {e}")
    manifest["conventions"] = __doc__.split("Conventions (read by the game):")[1].strip()
    manifest["count"] = len(manifest["assets"])
    json.dump(manifest, open(man_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"\n{len(manifest['assets'])} assets in manifest, {len(fails)} failed: {fails}")
    if fails:
        sys.exit(1)


main()
