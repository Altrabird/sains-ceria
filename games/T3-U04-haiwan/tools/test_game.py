"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("daging", 0.05), g.pos("arnab", 0.08))
    g.check("L1 rabbit refuses meat", "tidak makan" in g.info(), g.info())
    g.hand_drag(g.pos("lobak", 0.05), g.pos("arnab", 0.08))
    for f, a in [("daging", "harimau"), ("bijirin", "ayam"), ("cacing", "ayam")]:
        g.drag(g.pos(f, 0.05), g.pos(a, 0.08))
    g.check("L1 everyone fed -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.check("L2 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.drag(g.pos("jenis_herbivor", 0.05), g.pos("tengkorak_karnivor", 0.1))
    g.check("L3 wrong skull refused", "taring" in g.info(), g.info())
    for k in ["herbivor", "karnivor", "omnivor"]:
        g.drag(g.pos("jenis_" + k, 0.05), g.pos("tengkorak_" + k, 0.1))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.drag(g.pos("buah", 0.04), g.pos("beruang_kutub", 0.07))
    g.check("L4 no berries at the pole", "kutub" in g.info(), g.info())
    for f, b in [("buah", "beruang"), ("madu", "beruang"), ("ikan", "beruang_kutub"), ("anjing_laut", "beruang_kutub")]:
        g.drag(g.pos(f, 0.04), g.pos(b, 0.07))
    g.check("L4 fed", g.guide() == "1/2", g.guide())
    g.wait(1700); g.click(g.pos("pilih_omnivor", 0.03)); g.check("L4 polar bear is not omnivore", "🤔" in g.info(), g.info())
    g.click(g.pos("pilih_karnivor", 0.03))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
