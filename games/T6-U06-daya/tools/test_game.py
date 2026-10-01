"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L4"]:
        g.open(lv); g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(by_hand=1 if lv == "L1" else 0); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)
    for lv in ["L2", "L5"]:
        g.open(lv, "&handsim"); g.check(lv + " wrong pair refused", "🤔" in g.match_wrong(), g.info())
        g.match_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L3", "&handsim")
    g.click(g.pos("lepas", 0.03)); g.check("L3 choose a surface first", "dahulu" in g.info(), g.info())
    for i, s in enumerate(["kertas", "kain", "kertas_pasir", "permaidani"]):
        g.click(g.pos("permukaan_" + s, 0.03))
        if i == 0:
            c = g.pos("permukaan")
            for n in range(8): g.hand("open", (c[0] + (160 if n % 2 else -160), c[1]), 0.08)
        else:
            g.click(g.pos("lepas", 0.03))
        g.until("document.getElementById('info').textContent.includes('sel kering bergerak')", 9000); g.wait(300)
    g.wait(1600); g.click(g.pos("kesimpulan_salah", 0.03)); g.check("L3 wrong conclusion refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_betul", 0.03)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L3")
