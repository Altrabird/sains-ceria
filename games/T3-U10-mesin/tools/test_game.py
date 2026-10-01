"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

def pull(g, pulley, hand=False):
    h = g.js("n => { const p = window.level.root.getObjectByName(n); const v = p.userData.handle.getWorldPosition(p.position.clone()); return window.screenAt(v.x, v.y, v.z); }", pulley)
    a = (h["x"], h["y"]); b = (h["x"], h["y"] + 260)
    (g.hand_drag if hand else g.drag)(a, b)

with Game(__file__) as g:
    g.open("L1")
    g.drag(g.pos("label_tali", 0.03), g.pos("pin_gandar"))
    g.check("L1 wrong pin refused", "Bukan di situ" in g.info(), g.info())
    for p in ["alur", "gandar", "roda", "tali", "beban"]:
        g.drag(g.pos("label_" + p, 0.03), g.pos("pin_" + p))
    g.check("L1 labelled -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    load0 = g.js("() => window.level.root.getObjectByName('beban').getWorldPosition(window.level.root.position.clone()).y")
    pull(g, "takal", hand=True)
    load1 = g.js("() => window.level.root.getObjectByName('beban').getWorldPosition(window.level.root.position.clone()).y")
    g.check("L2 pulling the rope down by hand lifts the load (%.2f -> %.2f)" % (load0, load1), load1 > load0 + 0.1)
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    for u in ["bendera", "perigi", "pukat", "pelabuhan"]:
        pull(g, "takal_" + u)
    g.check("L3 four uses -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.drag(g.pos("bina", 0.04), g.pos("langkah_1"))
    g.check("L4 building is not step 1", "Langkah 1" in g.info(), g.info())
    for i, d in enumerate(["masalah", "idea", "lakar", "bahan", "bina"], 1):
        g.drag(g.pos(d, 0.04), g.pos("langkah_%d" % i))
    g.check("L4 design order", g.guide() == "1/2", g.guide())
    pull(g, "model_takal")
    g.check("L4 model tested -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
