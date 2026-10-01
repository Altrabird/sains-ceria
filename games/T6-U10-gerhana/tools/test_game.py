"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.hand_drag(g.pos("bulan"), g.pos("titik_purnama")); g.check("L1 lunar eclipse", "Gerhana Bulan" in g.info(), g.info()); g.shot("L1lunar")
    g.drag(g.pos("bulan"), g.pos("titik_baharu")); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim"); g.check("L2 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.drag(g.pos("label_umbra"), g.pos("pin_penumbra")); g.check("L3 wrong pin refused", "🤔" in g.info(), g.info())
    for i, l in enumerate(["umbra", "penumbra", "objek_legap", "cahaya"]): (g.hand_drag if i == 0 else g.drag)(g.pos("label_" + l), g.pos("pin_" + l))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4"); g.check("L4 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
