"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

SAMPLES = [("roti", "fungi"), ("yogurt", "bakteria"), ("air_hijau", "alga"), ("air_kolam", "protozoa"), ("selesema", "virus")]
with Game(__file__) as g:
    g.open("L1", "&handsim")
    for i, (s, k) in enumerate(SAMPLES):
        (g.hand_drag if i == 0 else g.drag)(g.pos("sampel_" + s, 0.03), g.pos("mikroskop"))
        g.wait(300)
        if i == 0:
            g.click(g.pos("kumpulan_virus", 0.03)); g.check("L1 wrong group refused", "🤔" in g.info(), g.info()); g.shot("L1view")
        g.click(g.pos("kumpulan_" + k, 0.03))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.hand_drag(g.pos("yis", 0.04), g.pos("botol"))
    for s in ["gula", "air_suam"]: g.drag(g.pos(s, 0.04), g.pos("botol"))
    g.until("document.getElementById('info').textContent.includes('bernafas')", 9000)
    g.drag(g.pos("titis_air", 0.04), g.pos("roti_kering")); g.check("L2 dry bread stays dry", "🤔" in g.info(), g.info())
    g.drag(g.pos("titis_air", 0.04), g.pos("roti_lembap")); g.wait(300)
    g.click(g.pos("lima_hari", 0.03)); g.wait(2800)
    g.click(g.pos("faktor_cahaya", 0.03)); g.check("L2 light refused", "🤔" in g.info(), g.info())
    g.click(g.pos("faktor_air", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3"); g.check("L3 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L1")
