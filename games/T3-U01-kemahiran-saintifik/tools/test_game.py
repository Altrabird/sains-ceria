"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

def choose(g, prefix, ids, wrong=None, hint=""):
    if wrong:
        g.click(g.pos(prefix + wrong, 0.04)); g.check("wrong %s refused" % wrong, "🤔" in g.info(), g.info())
    for i in ids:
        g.click(g.pos(prefix + i, 0.04)); g.wait(2900)

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 by shape", g.guide() == "1/2", g.guide())
    g.wait(2800); g.sort_all(by_hand=0)
    g.check("L1 by colour -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    zero = g.js("() => { const r = window.level.root.getObjectByName('pembaris'); return r.position.x - 5.5 * 0.06 + 0.5 * 0.06; }")
    g.drag(g.pos("pensel"), g.at(zero + 0.08, 0, -0.165))
    g.check("L2 pencil must start at 0", "senggat 0" in g.info(), g.info())
    g.drag(g.pos("pensel"), g.at(zero, 0, -0.165))
    g.check("L2 aligned at 0", g.guide() == "1/3", g.guide())
    g.click(g.pos("pilihan_6cm", 0.03)); g.check("L2 6 cm is wrong", "🤔" in g.info(), g.info())
    g.click(g.pos("pilihan_5cm", 0.03))
    g.click(g.pos("jam_randik", 0.05)); g.wait(1500); g.click(g.pos("jam_randik", 0.05))
    g.check("L2 timed in seconds -> level done", g.done() and "saat" in g.info(), g.info()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click(g.pos("inferens_merah", 0.05)); g.check("L3 no-evidence inference refused", "bukti" in g.info(), g.info())
    g.hand_tap(g.pos("inferens_air", 0.05)); g.wait(2900)
    choose(g, "inferens_", ["hujan", "panas"])
    g.check("L3 three inferences -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    choose(g, "ramalan_", ["hijau", "lebih_besar", "8cm"], wrong="merah")
    g.check("L4 three predictions -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.click(g.pos("pisang_6", 0.0)); g.check("L5 wrong bar height flagged", "sama" in g.info(), g.info())
    for f, v in [("pisang", 4), ("betik", 2), ("tembikai", 6)]:
        g.click(g.pos("%s_%d" % (f, v)))
    g.check("L5 graph matches the table", g.guide() == "1/2", g.guide())
    g.wait(2000); g.click(g.pos("tembikai_3"))
    g.check("L5 report -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L1")
