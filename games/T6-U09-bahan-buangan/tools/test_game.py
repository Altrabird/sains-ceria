"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

W = [("botol_kaca", "kaca"), ("akhbar", "kertas"), ("kotak", "kertas"), ("botol", "plastik"), ("beg", "plastik"), ("tin", "logam"), ("bateri", "toksik"), ("cat", "toksik"), ("pisang", "kompos"), ("sayur", "kompos")]
with Game(__file__) as g:
    g.open("L1"); g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("bateri", 0.04), g.pos("tong_kompos")); g.check("L2 battery not compost", "🤔" in g.info(), g.info())
    for i, (w, b) in enumerate(W): (g.hand_drag if i == 0 else g.drag)(g.pos(w, 0.04), g.pos("tong_" + b))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim"); g.check("L3 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    for i, s in enumerate(["botol", "beg", "tin", "polistirena", "tayar", "straw"]): (g.hand_drag if i == 0 else g.drag)(g.pos("sampah_" + s), g.pos("tong_sampah"))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
