"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("melumat", 0.05), g.pos("gigi_kacip", 0.1))
    g.check("L1 incisor does not grind", "tidak sesuai" in g.info(), g.info())
    g.hand_drag(g.pos("memotong", 0.05), g.pos("gigi_kacip", 0.1))
    g.drag(g.pos("mengoyak", 0.05), g.pos("gigi_taring", 0.1)); g.drag(g.pos("melumat", 0.05), g.pos("gigi_geraham", 0.1))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.drag(g.pos("label_saraf", 0.03), g.pos("pin_enamel"))
    g.check("L2 wrong pin refused", "Bukan di situ" in g.info(), g.info())
    for p in ["enamel", "dentin", "gusi", "saraf", "salur_darah"]:
        g.drag(g.pos("label_" + p, 0.03), g.pos("pin_" + p))
    g.check("L2 labelled -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.check("L3 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    tx = g.pos("gigi", 0.15); g.pg.mouse.move(*g.pos("berus_gigi", 0.03)); g.pg.mouse.down()
    for i in range(30):
        g.pg.mouse.move(tx[0] + (40 if i % 2 else -40), tx[1], steps=3); g.wait(25)
    g.pg.mouse.up(); g.wait(800)
    g.check("L4 brushed clean", g.guide() == "1/2", g.guide())
    g.sort_all(by_hand=0); g.check("L4 habits -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("gula", 0.04), g.pos("aras_1", 0.025))
    g.check("L5 sugar is not level 1", "Aras 4" in g.info(), g.info())
    lv = {"nasi": 1, "roti": 1, "ubi": 1, "pisang": 2, "sayur": 2, "epal": 2, "ikan": 3, "ayam": 3, "susu": 3, "minyak": 4, "gula": 4, "garam": 4}
    for f, n in lv.items():
        g.drag(g.pos(f, 0.04), g.pos("aras_%d" % n, 0.03))
    g.check("L5 pyramid -> level done", g.done(), g.guide()); g.shot("L5")

    g.open("L6")
    g.drag(g.pos("goreng", 0.04), g.pos("pinggan"))
    g.check("L6 fried food warns about obesity", "kegemukan" in g.info(), g.info())
    for f in ["nasi", "ikan", "sayur", "tembikai", "air"]:
        g.drag(g.pos(f, 0.04), g.pos("pinggan"))
    g.check("L6 balanced plate -> level done", g.done(), g.guide()); g.shot("L6")

    g.open("L7", "&handsim")
    g.drag(g.pos("makanan"), g.pos("pin_perut"))
    g.check("L7 food starts in the mouth", "mulut" in g.info(), g.info())
    for i, p in enumerate(["mulut", "esofagus", "perut", "usus", "dubur"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("makanan"), g.pos("pin_" + p))
    g.check("L7 digestion route", g.guide() == "1/2", g.guide())
    g.wait(2700); g.click(g.pos("cara_berlari", 0.05)); g.check("L7 running while eating is harmful", "tersedak" in g.info(), g.info())
    g.click(g.pos("cara_perlahan", 0.05))
    g.check("L7 -> level done", g.done(), g.guide()); g.shot("L7")

    g.play_mode_hands("L1")
