"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L2", "L3"]:
        g.open(lv); g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(by_hand=1 if lv == "L1" else 0); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L4", "&handsim")
    g.hand_drag(g.pos("siram", 0.04), g.pos("pasu_kecil"))
    g.drag(g.pos("siram", 0.04), g.pos("pasu_kecil")); g.check("L4 same pot twice refused", "sudah disiram" in g.info(), g.info())
    g.drag(g.pos("siram", 0.04), g.pos("pasu_besar")); g.wait(400)
    g.click(g.pos("tiga_minggu", 0.03)); g.wait(3200)
    g.click(g.pos("jawapan_kecil", 0.03)); g.check("L4 small pot refused", "🤔" in g.info(), g.info())
    g.click(g.pos("jawapan_besar", 0.03)); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L4")
