"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1"); g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("air_biasa", 0.04), g.pos("tabung_A")); g.check("L2 wrong tube refused", "🤔" in g.info(), g.info())
    g.drag(g.pos("minyak", 0.04), g.pos("tabung_B")); g.check("L2 oil needs water first", "dahulu" in g.info(), g.info())
    g.hand_drag(g.pos("kalsium", 0.04), g.pos("tabung_A"))
    for c, t in [("air_didih", "B"), ("minyak", "B"), ("air_biasa", "C")]: g.drag(g.pos(c, 0.04), g.pos("tabung_" + t))
    g.wait(1600); g.click(g.pos("empat_hari", 0.03)); g.wait(3500)
    g.click(g.pos("kesimpulan_air", 0.03)); g.check("L2 water-only refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_air_udara", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.drag(g.pos("cat", 0.04), g.pos("rantai")); g.check("L3 paint on chain refused", "🤔" in g.info(), g.info())
    g.hand_drag(g.pos("cat", 0.04), g.pos("pagar"))
    for t, o in [("gris", "rantai"), ("plastik", "penyangkut"), ("sadur", "sudu")]: g.drag(g.pos(t, 0.04), g.pos(o))
    g.wait(2000); g.click(g.pos("hujan", 0.03)); g.until("window.levelDone === true", 8000)
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L2")
