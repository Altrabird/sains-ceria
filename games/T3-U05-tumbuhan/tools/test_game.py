"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L3"]:
        g.open(lv, "&handsim")
        g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L2")
    g.drag(g.pos("biji_kangkung", 0.05), g.pos("pasu_batang_ubi", 0.08))
    g.check("L2 own pot only", "berlabel sama" in g.info(), g.info())
    for p in ["keratan_kangkung", "biji_kangkung", "batang_ubi"]:
        g.drag(g.pos(p, 0.05), g.pos("pasu_" + p, 0.08))
    for _ in range(3):
        g.click(g.pos("hari_seterusnya", 0.04)); g.wait(400)
    g.check("L2 shoots grow -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L4", "&handsim")
    g.hand_drag(g.pos("tisu_pokok", 0.05), g.pos("balang_kultur", 0.08))
    g.check("L4 tissue culture grows plantlets", g.guide() == "1/3", g.guide())
    g.drag(g.pos("tut_plastik", 0.05), g.pos("dahan_mangga", 0.22))
    g.check("L4 marcotting order enforced", "Langkah 1" in g.info(), g.info())
    for s in ["kupas", "tanah", "plastik"]:
        g.drag(g.pos("tut_" + s, 0.05), g.pos("dahan_mangga", 0.22))
    g.wait(1800); g.click(g.pos("dahan_mangga", 0.3))
    g.check("L4 rooted cutting -> level done", g.until(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
