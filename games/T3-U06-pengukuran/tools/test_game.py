"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

def cell(g, i, j, cols, rows, cs):  # screen px of cell (i, j) on graph paper centred at (0, -0.12)
    return g.at((i + 0.5 - cols / 2) * cs, 0.003, -0.12 + (j + 0.5 - rows / 2) * cs)

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.click(cell(g, 0, 0, 8, 5, 0.07)); g.check("L2 outside the rectangle refused", "di dalam" in g.info(), g.info())
    g.hand_tap(cell(g, 2, 1, 8, 5, 0.07))
    for i in range(2, 5):
        for j in range(1, 3):
            g.click(cell(g, i, j, 8, 5, 0.07), 150)
    g.check("L2 six squares counted", g.guide() == "1/2", g.guide())
    g.click(g.pos("jawapan_8", 0.03)); g.check("L2 8 is wrong", "🤔" in g.info(), g.info())
    g.click(g.pos("jawapan_6", 0.03)); g.check("L2 6 cm2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    need = g.js("() => window.level.need()")
    g.click(cell(g, 0, 0, 10, 6, 0.06)); g.check("L3 empty corner not counted", "kosong" in g.info() or "kurang" in g.info(), g.info())
    for k in need:
        i, j = map(int, k.split(",")); g.click(cell(g, i, j, 10, 6, 0.06), 120)
    g.check("L3 leaf estimated (%d squares) -> level done" % len(need), g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    for n in range(8):
        g.drag(g.pos("kubus%d" % n, 0.035), g.pos("kotak_lohong", 0.07))
    g.check("L4 box filled", g.guide() == "1/2", g.guide())
    g.click(g.pos("jawapan_8", 0.03)); g.check("L4 8 cm3 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("mata", 0.05), g.at(0.15, 0.42, -0.15))
    g.check("L5 eye too high warned", "tinggi" in g.info(), g.info())
    y200 = g.js("() => window.level.root.getObjectByName('silinder_penyukat').userData.y(200) * 1.3")
    g.drag(g.pos("mata"), g.at(0.15, y200, -0.15))
    g.check("L5 eye at the meniscus", g.guide() == "1/2", g.guide())
    g.click(g.pos("jawapan_200", 0.03)); g.check("L5 200 ml -> level done", g.done(), g.guide()); g.shot("L5")

    g.open("L6")
    g.drag(g.pos("batu", 0.03), g.pos("silinder", 0.3)); g.wait(2300)
    g.click(g.pos("jawapan_30", 0.03)); g.check("L6 final reading is not the stone's volume", "tolak" in g.info() or "−" in g.info(), g.info())
    g.click(g.pos("jawapan_10", 0.03)); g.check("L6 10 ml -> level done", g.done(), g.guide()); g.shot("L6")

    g.play_mode_hands("L4")
