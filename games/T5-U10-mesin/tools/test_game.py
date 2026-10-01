"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

TOOLS = [("pengokot", ["tuas", "baji"]), ("pengasah", ["roda_gandar", "baji"]), ("pemotong", ["tuas", "baji"]), ("jam", ["gear", "skru", "roda_gandar"])]
with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("gear", 0.04), g.pos("pin_pengokot_tuas")); g.check("L1 wrong machine refused", "🤔" in g.info(), g.info())
    first = True
    for t, parts in TOOLS:
        g.until("!!window.level.root.getObjectByName('pin_%s_%s')" % (t, parts[0]), 5000); g.wait(400)
        for p in parts:
            (g.hand_drag if first else g.drag)(g.pos(p, 0.04), g.pos("pin_%s_%s" % (t, p))); first = False
        g.wait(500)
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2"); g.check("L2 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.hand_drag(g.pos("roda", 0.04), g.pos("tong")); g.drag(g.pos("pembahagi", 0.04), g.pos("tong"))
    g.wait(500); g.drag(g.pos("pisang", 0.04), g.pos("ruang_kitar")); g.check("L3 banana not recycling", "🤔" in g.info(), g.info())
    for w, r in [("botol", "kitar"), ("tin", "kitar"), ("surat_khabar", "kitar"), ("pisang", "kompos"), ("sayur", "kompos"), ("tisu", "sisa")]:
        g.drag(g.pos(w, 0.04), g.pos("ruang_" + r))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    g.drag(g.pos("bentang", 0.04), g.pos("urutan_1")); g.check("L4 present is not first", "🤔" in g.info(), g.info())
    for i, s in enumerate(["lakar", "label", "terang", "bentang"]): (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L3")
