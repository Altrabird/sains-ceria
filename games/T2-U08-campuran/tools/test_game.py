"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("kaedah_magnet", 0.05), g.pos("tepung_kismis", 0.05))
    g.check("L1 magnet does not suit flour + raisins", "sesuai" in g.info(), g.info())
    g.hand_drag(g.pos("kaedah_ayak", 0.05), g.pos("tepung_kismis", 0.05)); g.wait(1500)
    for t, m in [("tangan", "kacang_muruku"), ("magnet", "klip_pasir"), ("air", "kayu_pasir"), ("turas", "kelopak_air")]:
        g.drag(g.pos("kaedah_" + t, 0.05), g.pos(m, 0.05)); g.wait(1800)
    g.check("L1 five separated -> level done", g.until(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    for s in ["gula", "garam", "biji_jagung", "kacang_hijau", "beras"]:
        g.drag(g.pos(s, 0.02), g.pos("gelas_" + s, 0.1)); g.wait(400)
        (g.hand_tap if s == "gula" else g.click)(g.pos("gelas_" + s, 0.06)); g.wait(1500)
        if s == "gula": g.check("L2 sugar dissolves (stirred by pointing)", "larut" in g.info(), g.info())
        if s == "beras": g.check("L2 rice does not", "tidak larut" in g.info(), g.info())
    g.check("L2 five -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    for i in range(3):
        g.click(g.pos("mula", 0.05)); g.wait(3500)
        if i == 0:
            g.click(g.pos("gelas_b", 0.08)); g.check("L3 cold water is slower", "Lihat gula" in g.info(), g.info())
        g.click(g.pos("gelas_a", 0.08)); g.wait(3300)
    g.check("L3 three races -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L1")
