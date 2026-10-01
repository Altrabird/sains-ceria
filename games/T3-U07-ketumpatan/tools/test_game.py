"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

y = "n => window.level.root.getObjectByName(n).getWorldPosition(window.level.root.position.clone()).y"
with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.hand_drag(g.pos("span", 0.03), g.pos("akuarium", 0.15)); g.wait(1400)
    g.check("L1 sponge floats", "timbul" in g.info() and g.js(y, "span") > 0.15, g.info())
    for o in ["ranting", "bola_plastik", "batu", "sabun", "kunci"]:
        g.drag(g.pos(o, 0.03), g.pos("akuarium", 0.15)); g.wait(1500)
    g.check("L1 stone sank", g.js(y, "batu") < 0.07)
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.drag(g.pos("anggur", 0.03), g.pos("bikar", 0.15)); g.wait(1500)
    g.check("L2 grape sinks", g.guide() == "1/2", g.guide())
    for _ in range(3):
        g.click(g.pos("garam", 0.05)); g.wait(400)
    g.check("L2 salt floats the grape -> level done", g.until() and g.js(y, "anggur") > 0.15, g.info()); g.shot("L2")

    g.open("L3")
    g.drag(g.pos("minyak", 0.05), g.pos("bikar", 0.13)); g.wait(1200)
    g.drag(g.pos("air", 0.05), g.pos("bikar", 0.13)); g.wait(1800)
    g.check("L3 oil ends on top even if poured first -> level done", g.done() and "kurang tumpat" in g.info(), g.info()); g.shot("L3")

    g.open("L4")
    g.drag(g.pos("sauh", 0.05), g.pos("perenang", 0.1))
    g.check("L4 anchor is not for the swimmer", "sesuai" in g.info(), g.info())
    for c, t in [("jaket", "perenang"), ("sauh", "bot"), ("pelampung", "sangkar_ikan")]:
        g.drag(g.pos(c, 0.05), g.pos(t, 0.12)); g.wait(900)
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
