"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.drag(g.pos("kunci", 0.02), g.pos("stesen_elektrik")); g.check("L2 key conducts", "konduktor" in g.info(), g.info())
    for m in ["kain_kapas", "plastik", "kayu_aiskrim"]:
        for s in ["serap", "apung", "elektrik"]:
            if g.done(): break
            g.drag(g.pos(m, 0.02), g.pos("stesen_" + s))
    g.check("L2 eight tests -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim"); g.check("L3 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.click(g.pos("bahan_plastik", 0.03)); g.check("L4 plastic pot refused", "🤔" in g.info(), g.info())
    for b in ["logam", "kapas", "getah", "kaca"]:
        g.click(g.pos("bahan_" + b, 0.03)); g.wait(2900)
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("bina", 0.05), g.pos("urutan_1")); g.check("L5 build is not first", "Langkah 1" in g.info(), g.info())
    for i, s in enumerate(["masalah", "idea", "lakar", "alat", "bina"], 1):
        g.drag(g.pos(s, 0.05), g.pos("urutan_%d" % i))
    g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L2")
