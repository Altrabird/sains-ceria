"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim"); g.hand_tap(g.pos("loceng", 0.05)); g.wait(800)
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("jerit", 0.05)); g.check("L3 needs a surface", "tapak kuning" in g.info(), g.info())
    g.drag(g.pos("dinding_batu", 0.08), g.pos("tapak_permukaan")); g.click(g.pos("jerit", 0.05)); g.wait(1500)
    g.check("L3 hard wall echoes", "gema" in g.info(), g.info())
    g.drag(g.pos("langsir", 0.08), g.pos("tapak_permukaan")); g.click(g.pos("jerit", 0.05)); g.wait(1200)
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4"); g.check("L4 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("pelindung", 0.05), g.pos("bilik")); g.check("L5 earmuffs are for the worker", "pekerja" in g.info(), g.info())
    g.drag(g.pos("langsir", 0.05), g.pos("bilik")); g.drag(g.pos("permaidani", 0.05), g.pos("bilik")); g.drag(g.pos("pelindung", 0.05), g.pos("pekerja", 0.15))
    g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L2")
