"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.hand_tap(g.pos("mula", 0.03)); g.until("document.getElementById('info').textContent.includes('Tuding kereta')", 9000)
    g.click(g.pos("kereta_merah")); g.check("L1 slower car refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kereta_biru")); g.wait(3800)
    g.click(g.pos("mula", 0.03)); g.until("document.getElementById('info').textContent.includes('Tuding kereta')", 9000)
    g.click(g.pos("kereta_merah")); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    for i, n in enumerate([1, 2, 3]):
        g.click(g.pos("tinggi_%d" % n, 0.03))
        if i == 0:
            c = g.pos("guli")
            for k in range(8): g.hand("open", (c[0] + (160 if k % 2 else -160), c[1]), 0.08)
        else:
            g.click(g.pos("lepas", 0.03))
        g.until("document.getElementById('info').textContent.includes('sampai ke hujung')", 9000); g.wait(300)
    g.wait(1600); g.click(g.pos("kesimpulan_lama", 0.03)); g.check("L2 wrong conclusion refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_singkat", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click(g.pos("jawapan_1", 0.03)); g.check("L3 wrong answer refused", "🤔" in g.info(), g.info())
    for i, a in enumerate([0, 1, 2]):
        if i: g.wait(2800)
        (g.hand_tap if i == 0 else g.click)(g.pos("jawapan_%d" % a, 0.03))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim"); g.check("L4 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
