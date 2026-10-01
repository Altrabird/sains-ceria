"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 sorted", g.guide() == "1/2", g.guide())
    g.wait(2200); g.click(g.pos("lampu", 0.06))
    g.check("L1 a lamp is not natural", "dibuat oleh manusia" in g.info(), g.info())
    g.click(g.pos("matahari", 0.06))
    g.check("L1 sun -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.hand_drag(g.pos("lampu_meja", 0.06), g.pos("meja", 0.12))
    g.check("L2 lamp lights the room", g.guide() == "1/2", g.guide())
    g.click(g.pos("buku"))
    g.check("L2 reading -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.drag(g.pos("bola", 0.04), g.pos("pemegang", 0.06))
    g.check("L3 nothing happens before the torch is on", g.guide() == "0/2", g.guide())
    g.click(g.pos("lampu_suluh"))
    for o in ["bola", "kertas_tebal", "kertas_surih", "plastik_jernih"]:
        g.drag(g.pos(o, 0.04), g.pos("pemegang", 0.06)); g.wait(400)
    g.check("L3 four objects -> level done", g.done() and "melaluinya" in g.info(), g.info()); g.shot("L3")

    g.open("L4", "&handsim")
    path = g.js("() => window.level.tracePath().map(([x, y, z]) => window.screenAt(x, y, z))")
    for q in path + [path[0]]:
        g.hand("point", (q["x"], q["y"]), 0.06)
    g.hand("none", (path[0]["x"], path[0]["y"]), 0.2)
    g.check("L4 puppet traced by finger", g.guide() == "1/3", g.guide())
    g.drag(g.pos("lidi", 0.04), g.pos("watak"))
    g.check("L4 on a stick", g.guide() == "2/3", g.guide())
    g.drag(g.pos("watak", 0.08), g.at(0.25, 0, -0.12))
    g.check("L4 shadow puppet on the screen -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L3")
