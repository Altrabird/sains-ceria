"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("penitis", 0.05), g.pos("kapas_B", 0.02)); g.check("L1 B stays dry", "A sahaja" in g.info(), g.info())
    g.hand_drag(g.pos("penitis", 0.05), g.pos("kapas_A", 0.02)); g.click(g.pos("seminggu", 0.05)); g.wait(1600)
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.drag(g.pos("cili_0", 0.05), g.pos("kotak_A", 0.05)); g.drag(g.pos("cili_1", 0.05), g.pos("kotak_B", 0.05))
    g.click(g.pos("seminggu", 0.04)); g.wait(1600); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("pusing", 0.04)); g.wait(900); g.click(g.pos("semalu", 0.15))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.drag(g.pos("umpan_gula", 0.05), g.pos("pokok", 0.2)); g.check("L4 sweets are not needed", "tidak memerlukan" in g.info(), g.info())
    for n in ["cahaya", "air", "co2", "klorofil"]:
        g.drag(g.pos("keperluan_" + n, 0.05), g.pos("pokok", 0.2))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("perkataan_glukosa", 0.04), g.pos("petak_bahan1")); g.check("L5 glucose is a product", "dihasilkan" in g.info() or "diperlukan" in g.info(), g.info())
    for w, s in [("karbon_dioksida", "bahan1"), ("air", "bahan2"), ("glukosa", "hasil1"), ("oksigen", "hasil2")]:
        g.drag(g.pos("perkataan_" + w, 0.04), g.pos("petak_" + s))
    g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.open("L6", "&handsim"); g.check("L6 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L6 -> level done", g.done(), g.guide()); g.shot("L6")

    g.play_mode_hands("L3")
