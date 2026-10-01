"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

CX = [["skru", "baji"], ["tuas", "skru", "roda_gandar"], ["gear", "skru", "roda_gandar"]]
with Game(__file__) as g:
    g.open("L1")
    g.drag(g.pos("label_daya", 0.03), g.pos("pin_beban")); g.check("L1 wrong pin refused", "Bukan" in g.info(), g.info())
    for p in ["beban", "fulkrum", "daya"]: g.drag(g.pos("label_" + p, 0.03), g.pos("pin_" + p))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    CM, L = 0.012, 0.6
    for i, cm in enumerate([25, 20, 15]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("fulkrum", 0.03), g.at(-L / 2 + cm * CM, 0, -0.12)); g.wait(700)
    g.check("L2 three fulcrum positions", g.guide() == "1/2", g.guide())
    g.click(g.pos("kesimpulan_jauh", 0.04)); g.check("L2 wrong conclusion refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_dekat", 0.04)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim"); g.check("L3 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.click(g.pos("mesin_takal", 0.03)); g.check("L4 shears have no pulley", "tidak menggunakan" in g.info(), g.info())
    for need in CX:
        for m in need: g.click(g.pos("mesin_" + m, 0.03))
        g.wait(3000)
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("troli", 0.05), g.pos("kotak", 0.05)); g.drag(g.pos("papan", 0.05), g.at(0.15, 0, -0.15))
    g.click(g.pos("tolak", 0.03)); g.wait(2300)
    g.click(g.pos("lestari_kereta", 0.05)); g.check("L5 car is not sustainable", "🤔" in g.info(), g.info())
    g.click(g.pos("lestari_basikal", 0.05)); g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L2")
