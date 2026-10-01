"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    c = g.pos("kadbod")
    for n in range(8): g.hand("open", (c[0] + (160 if n % 2 else -160), c[1]), 0.08)
    g.until("document.getElementById('info').textContent.includes('Satu objek jatuh')", 8000); g.shot("L1shake")
    g.click(g.pos("jawapan_semakin_tinggi", 0.03)); g.check("L1 taller-is-stable refused", "🤔" in g.info(), g.info())
    g.click(g.pos("jawapan_semakin_rendah", 0.03)); g.wait(3600)
    g.click(g.pos("goncang", 0.03)); g.until("document.getElementById('info').textContent.includes('Satu objek jatuh')", 8000)
    g.click(g.pos("jawapan_tapak_besar_stabil", 0.03)); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    first = True
    for s in ["kertas", "plastik", "besi"]:
        for _ in range(8):
            if not g.js("() => window.level.root.getObjectByName('tambah_%s').visible" % s): break
            (g.hand_tap if first else g.click)(g.pos("tambah_" + s, 0.03)); first = False
    g.wait(1800); g.click(g.pos("terkuat_kertas", 0.03)); g.check("L2 paper-strongest refused", "🤔" in g.info(), g.info())
    g.click(g.pos("terkuat_besi", 0.03)); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim"); g.check("L3 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    g.drag(g.pos("uji", 0.04), g.pos("urutan_1")); g.check("L4 testing is not first", "🤔" in g.info(), g.info())
    for i, s in enumerate(["lakar", "cantum", "susun", "alas", "uji"]): (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
