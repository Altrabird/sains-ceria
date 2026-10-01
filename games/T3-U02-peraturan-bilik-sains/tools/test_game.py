"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.hand_tap(g.pos("tingkap1", 0.2)); g.click(g.pos("tingkap2", 0.2)); g.click(g.pos("pintu", 0.15))
    g.check("L1 windows and door open", g.guide() == "1/2", g.guide())
    g.drag(g.pos("selipar", 0.05), g.pos("murid", 0.1))
    g.check("L1 sandals refused", "bertutup" in g.info(), g.info())
    g.drag(g.pos("kasut_bertutup", 0.05), g.pos("murid", 0.1))
    g.check("L1 closed shoes -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.click(g.pos("baik", 0.15)); g.check("L2 the good pupil is not a mistake", "mematuhi" in g.info() and g.guide() == "0/1", g.info())
    for k in ["menconteng", "cuai", "tanpa_arahan", "makan", "sorok"]:
        g.click(g.pos(k, 0.15))
    g.check("L2 five mistakes -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("suis_kipas")); g.check("L3 wash first", "Bersihkan" in g.info(), g.info())
    for b in ["bikar1", "bikar2", "bikar3"]:
        g.drag(g.pos(b, 0.04), g.pos("sinki", 0.06))
    g.check("L3 washed", g.guide() == "1/2", g.guide())
    g.click(g.pos("suis_kipas")); g.click(g.pos("suis_lampu"))
    g.check("L3 switched off -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L2")
