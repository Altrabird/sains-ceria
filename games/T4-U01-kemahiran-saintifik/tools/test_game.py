"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("minit20", 0.04), g.pos("urutan_1"))
    g.check("L1 melted lolly is not first", "Mula" in g.info(), g.info())
    g.hand_drag(g.pos("mula", 0.04), g.pos("urutan_1"))
    g.drag(g.pos("minit10", 0.04), g.pos("urutan_2")); g.drag(g.pos("minit20", 0.04), g.pos("urutan_3"))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.click(g.pos("tempat_C", 0.2)); g.check("L2 C is not the most", "jadual" in g.info(), g.info())
    g.click(g.pos("tempat_A", 0.2)); g.click(g.pos("tempat_B", 0.2))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("rendam", 0.05)); g.wait(2300)
    g.click(g.pos("bikar_A", 0.08)); g.check("L3 most water left = least absorbent", "paling sedikit" in g.info(), g.info())
    g.click(g.pos("bikar_C", 0.08)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.check("L4 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.click(g.pos("pilih_salah", 0.05)); g.check("L5 vague hypothesis refused", "dimanipulasi" in g.info(), g.info())
    g.click(g.pos("pilih_betul", 0.05)); g.click(g.pos("mula", 0.05))
    g.until("document.querySelector('#guide .prog').textContent === '2/3'", 15000)
    g.click(g.pos("pilih_ditolak", 0.04)); g.check("L5 rejecting is wrong", "menyokong" in g.info(), g.info())
    g.click(g.pos("pilih_diterima", 0.04)); g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L1")
