"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

KIND = {"limau_nipis": "asid", "asam_jawa": "asid", "sabun": "alkali", "kapur_sirih": "alkali", "air_garam": "neutral", "air_gula": "neutral"}
with Game(__file__) as g:
    g.open("L1", "&handsim")
    first = True
    for s, k in KIND.items():
        (g.hand_drag if first else g.drag)(g.pos("kertas_litmus", 0.06), g.pos(s, 0.08)); g.wait(900)
        if first:
            g.click(g.pos("sifat_alkali", 0.03)); g.check("L1 wrong property refused", "🤔" in g.info(), g.info()); first = False
        g.click(g.pos("sifat_" + k, 0.03)); g.wait(700)
    g.check("L1 six classified -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.click(g.pos("rasa", 0.05)); g.click(g.pos("teka_alkali", 0.03))
    g.drag(g.pos("kertas_litmus", 0.06), g.pos("kopi", 0.08)); g.wait(800)
    g.check("L2 bitter coffee is acidic -> level done", g.done() and "bukan penunjuk" in g.info(), g.info()); g.shot("L2")

    g.open("L3")
    for j in ["limau_nipis", "sabun", "air_garam"]:
        g.drag(g.pos("ekstrak_kubis", 0.05), g.pos(j, 0.08)); g.wait(1200)
    g.check("L3 cabbage indicator -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.drag(g.pos("kertas_litmus", 0.06), g.pos("tanah_kebun", 0.04)); g.wait(1800)
    g.check("L4 soil is acidic", g.guide() == "1/3", g.guide())
    g.drag(g.pos("kapur", 0.05), g.pos("tanah_kebun", 0.04)); g.wait(1000)
    g.drag(g.pos("kertas_litmus", 0.06), g.pos("tanah_kebun", 0.04)); g.wait(1000)
    g.check("L4 limed soil neutral -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
