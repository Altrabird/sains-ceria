"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: wrong organ refused; all five matched (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("bunyi", 0.05), g.pos("pad_mata"))
    g.check("L1 eye cannot detect sound", "Cuba lagi" in g.info(), g.info())
    g.hand_drag(g.pos("bunyi", 0.05), g.pos("pad_telinga"))
    g.check("L1 hand matches sound -> ear", "Telinga" in g.info(), g.info())
    for c, p in [("warna", "mata"), ("bau", "hidung"), ("rasa", "lidah"), ("tekstur", "kulit")]:
        g.drag(g.pos(c, 0.05), g.pos("pad_" + p))
    g.check("L1 all matched -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: sort before tasting refused; observe colour/smell/taste; sort four fruits
    g.open("L2")
    g.drag(g.pos("epal"), g.pos("bakul_manis"))
    g.check("L2 must taste before sorting", "lidah" in g.info(), g.info())
    g.drag(g.pos("epal"), g.pos("pad_mata")); g.drag(g.pos("epal"), g.pos("pad_hidung"))
    for f in ["ciku", "epal", "oren", "kedondong"]:
        g.drag(g.pos(f), g.pos("pad_lidah"))
    g.check("L2 observed with three senses", g.guide() == "1/2", g.guide())
    g.drag(g.pos("oren"), g.pos("bakul_manis"))
    g.check("L2 orange is not sweet", "masam" in g.info(), g.info())
    for f, b in [("ciku", "manis"), ("epal", "manis"), ("oren", "masam"), ("kedondong", "masam")]:
        g.drag(g.pos(f), g.pos("bakul_" + b))
    g.check("L2 sorted -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: feel objects in the dark with a pointing finger (hands), then switch the torch on
    g.open("L3", "&handsim")
    for o in ["bantal", "berus", "lampu_suluh"]:
        g.hand("point", g.pos(o, 0.03), 0.4)
    g.hand("none", g.pos("bola"), 0.2)
    g.check("L3 felt three objects in the dark", g.guide() == "1/2", g.guide())
    g.hand_tap(g.pos("lampu_suluh", 0.03)); g.wait(1200)
    g.check("L3 torch on -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: glasses to Atuk refused; glasses to pupil, hearing aid to Atuk
    g.open("L4")
    g.drag(g.pos("cermin_mata"), g.pos("atuk"))
    g.check("L4 Atuk does not need glasses", "Atuk tidak" in g.info(), g.info())
    g.drag(g.pos("cermin_mata"), g.pos("murid")); g.drag(g.pos("alat_pendengaran"), g.pos("atuk")); g.wait(1500)
    g.check("L4 both aids given -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L3")
