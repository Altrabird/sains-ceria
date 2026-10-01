"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L2"]:
        g.open(lv, "&handsim"); g.check(lv + " wrong pair refused", "🤔" in g.match_wrong(), g.info())
        g.match_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L3"); g.check("L3 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    g.click(g.pos("lepas", 0.03)); g.check("L4 choose a balloon first", "dahulu" in g.info(), g.info())
    for i, k in enumerate(["kecil", "sederhana", "besar"]):
        g.click(g.pos("belon_" + k, 0.03))
        if i == 0:
            c = g.pos("kereta_belon")
            for n in range(8): g.hand("open", (c[0] + (160 if n % 2 else -160), c[1]), 0.08)
        else:
            g.click(g.pos("lepas", 0.03))
        g.until("document.getElementById('info').textContent.includes('kereta bergerak')", 9000); g.wait(300)
    g.wait(1600); g.click(g.pos("kesimpulan_ditolak", 0.03)); g.check("L4 reject refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_diterima", 0.03)); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L4")
