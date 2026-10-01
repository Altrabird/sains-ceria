"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: car into "hidup" is refused; sort all six (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("kereta", 0.04), g.pos("zon_hidup"))
    g.check("L1 car is not a living thing", "Cuba lagi" in g.info(), g.info())
    g.hand_drag(g.pos("pokok", 0.05), g.pos("zon_hidup"))
    g.check("L1 hand sorts the tree", "(1/6)" in g.pg.inner_text("#guide"), g.pg.inner_text("#guide"))
    for o, z in [("manusia", "zon_hidup"), ("burung", "zon_hidup"), ("anak_patung", "zon_bukan"), ("kereta", "zon_bukan"), ("batu", "zon_bukan")]:
        g.drag(g.pos(o, 0.03), g.pos(z))
    g.check("L1 all sorted -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: trait on bird before the plane step is refused; 'bergerak' to plane; non-move trait on plane refused; 5 traits to bird
    g.open("L2")
    g.drag(g.pos("bernafas", 0.05), g.pos("burung"))
    g.check("L2 must test the plane first", "kapal terbang" in g.info(), g.info())
    g.drag(g.pos("bergerak", 0.05), g.pos("kapal_terbang")); g.wait(2200)
    g.check("L2 plane can move", g.guide() == "1/2", g.guide())
    g.drag(g.pos("bernafas", 0.05), g.pos("kapal_terbang"))
    g.check("L2 plane does not breathe", "bukan hidup" in g.info(), g.info())
    for t in ["bernafas", "makan", "bergerak", "membesar", "membiak"]:
        g.drag(g.pos(t, 0.05), g.pos("burung"))
    g.wait(2000)
    g.check("L2 five traits -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: wrong order refused; correct order kecil -> besar
    g.open("L3")
    slot = lambda i: g.at((i - 2) * 0.24, 0, -0.18)
    g.drag(g.pos("gajah", 0.05), slot(0))
    g.check("L3 elephant is not the smallest", "besar" in g.info(), g.info())
    for i, a in enumerate(["tikus", "kucing_hutan", "rusa", "seladang", "gajah"]):
        g.drag(g.pos(a, 0.04), slot(i))
    g.check("L3 sorted by size -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: food to plant explains plants make food; water plant; feed child; rain -> shelter both
    g.open("L4")
    g.drag(g.pos("makanan"), g.pos("pokok"))
    g.check("L4 plants make their own food", "sendiri" in g.info(), g.info())
    g.drag(g.pos("air", 0.03), g.pos("pokok"))
    g.check("L4 plant watered", g.guide() == "1/3", g.guide())
    g.drag(g.pos("makanan"), g.pos("manusia")); g.wait(3000)
    g.check("L4 child fed, rain starts", g.guide() == "2/3" and "Hujan" in g.info(), g.info())
    g.drag(g.pos("manusia", 0.1), g.pos("rumah")); g.drag(g.pos("burung", 0.04), g.pos("sarang"))
    g.check("L4 both sheltered -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L1")
