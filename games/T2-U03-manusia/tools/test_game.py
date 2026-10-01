"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: tap mum (by hand); wrong order refused; four stages; old shirt
    g.open("L1", "&handsim")
    g.hand_tap(g.pos("ibu", 0.2))
    g.check("L1 humans give birth", g.guide() == "1/3", g.guide())
    g.drag(g.pos("dewasa", 0.1), g.pos("peringkat_1"))
    g.check("L1 adult is not first", "Peringkat 1" in g.info(), g.info())
    for i, s in enumerate(["bayi", "kanak_kanak", "remaja", "dewasa"], 1):
        g.drag(g.pos(s, 0.05), g.pos("peringkat_%d" % i))
    g.check("L1 stages ordered", g.guide() == "2/3", g.guide())
    g.drag(g.pos("baju_lama", 0.05), g.pos("kanak_kanak", 0.05))
    g.check("L1 old shirt is tight -> level done", g.done() and "ketat" in g.info(), g.info())
    g.shot("L1")

    # ---- L2: weigh before measuring refused; heights; weights; choose taller
    g.open("L2")
    g.drag(g.pos("ali", 0.1), g.pos("alat_penimbang", 0.12))
    g.check("L2 measure height first", "tinggi" in g.info(), g.info())
    for k in ["ali", "mei"]:
        g.drag(g.pos(k, 0.1), g.pos("carta_tinggi", 0.1)); g.wait(2000)
    g.check("L2 heights measured", g.guide() == "1/3", g.guide())
    for k in ["ali", "mei"]:
        g.drag(g.pos(k, 0.1), g.pos("alat_penimbang", 0.12)); g.wait(2000)
    g.check("L2 weights measured", g.guide() == "2/3", g.guide())
    g.click(g.pos("ali", 0.1)); g.check("L2 Ali is not taller", "124" in g.info(), g.info())
    g.click(g.pos("mei", 0.1))
    g.check("L2 growth differs -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: curly hair to Ibu refused; three traits to the right relatives (one by hand)
    g.open("L3", "&handsim")
    g.drag(g.pos("ciri_rambut", 0.04), g.pos("potret_ibu", 0.1))
    g.check("L3 Ibu's hair is not curly", "Bandingkan" in g.info(), g.info())
    g.hand_drag(g.pos("ciri_rambut", 0.04), g.pos("potret_datuk", 0.1))
    g.check("L3 curly hair from Datuk", "datuk" in g.info(), g.info())
    g.drag(g.pos("ciri_iris", 0.04), g.pos("potret_ibu", 0.1)); g.drag(g.pos("ciri_kulit", 0.04), g.pos("potret_bapa", 0.1))
    g.check("L3 inheritance -> level done", g.done(), g.guide())
    g.shot("L3")

    g.play_mode_hands("L1")
