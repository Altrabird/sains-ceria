"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2"); g.check("L2 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click(g.pos("tiup", 0.05)); g.check("L3 pick glycerin first", "gliserin dahulu" in g.info(), g.info())
    for i, n in enumerate([1, 3, 5]):
        g.click(g.pos("sudu_%d" % n, 0.03))
        if i == 0:
            c = g.pos("penutup")
            for k in range(8): g.hand("open", (c[0] + (160 if k % 2 else -160), c[1]), 0.08)
        else:
            g.click(g.pos("tiup", 0.05))
        g.until("document.getElementById('info').textContent.includes('pecah selepas')", 9000); g.wait(300)
    g.check("L3 three trials", g.guide() == "1/2", g.guide())
    g.wait(1600); g.click(g.pos("kesimpulan_ditolak", 0.03)); g.check("L3 reject refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_diterima", 0.03)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.play_mode_hands("L3")
