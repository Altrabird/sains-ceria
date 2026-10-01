"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1"); g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.click(g.pos("sejuk", 0.03)); g.check("L2 solid cannot cool further", "Sudah pepejal" in g.info(), g.info())
    g.hand_tap(g.pos("panas", 0.03)); g.check("L2 melting", "peleburan" in g.info(), g.info())
    g.click(g.pos("panas", 0.03)); g.check("L2 boiling", "pendidihan" in g.info(), g.info()); g.wait(800); g.shot("L2gas")
    g.click(g.pos("sejuk", 0.03)); g.click(g.pos("sejuk", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.wait(800); g.shot("L2")

    g.open("L3", "&handsim"); g.check("L3 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    g.click(g.pos("awan")); g.check("L4 sun first", "Matahari" in g.info(), g.info())
    g.hand_tap(g.pos("matahari")); g.wait(1200)
    for t in ["awan", "awan", "sungai"]: g.click(g.pos(t)); g.wait(600)
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
