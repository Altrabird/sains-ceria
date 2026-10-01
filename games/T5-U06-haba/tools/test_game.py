"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("baca", 0.04), g.pos("urutan_1")); g.check("L1 reading is not first", "🤔" in g.info(), g.info())
    for i, s in enumerate(["bikar", "pegang", "rendam", "tunggu", "baca"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.hand_tap(g.pos("api", 0.03)); g.check("L2 burner on", "menerima haba" in g.info(), g.info())
    g.until("document.getElementById('info').textContent.includes('kekal pada 100')", 20000)
    g.click(g.pos("api", 0.03))
    g.until("document.getElementById('info').textContent.includes('suhu bilik')", 30000)
    g.click(g.pos("takat_0", 0.03)); g.check("L2 0 C refused", "takat beku" in g.info(), g.info())
    g.click(g.pos("takat_100", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click(g.pos("sejuk_bebola", 0.03)); g.check("L3 heat first", "🤔" in g.info(), g.info())
    g.hand_tap(g.pos("panas_bebola", 0.03))
    for k in ["cecair", "gas"]: g.click(g.pos("panas_" + k, 0.03))
    for k in ["bebola", "cecair", "gas"]: g.click(g.pos("sejuk_" + k, 0.03))
    g.check("L3 -> level done", g.done(), g.guide()); g.wait(1500); g.shot("L3")

    g.open("L4"); g.check("L4 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L3")
