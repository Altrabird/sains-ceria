"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("udara"), g.pos("pin_peparu"))
    g.check("L1 air enters through the nose first", "hidung" in g.info(), g.info())
    for i, p in enumerate(["hidung", "trakea", "peparu", "trakea", "hidung"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("udara"), g.pos("pin_" + p))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    for lv in ["L2", "L5"]:
        g.open(lv, "&handsim")
        g.check(lv + " wrong pair refused", "🤔" in g.match_wrong(), g.info())
        g.match_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L3")
    for a in ["berehat", "berjalan", "berlari"]:
        g.click(g.pos(a, 0.05)); g.wait(2800)
    g.click(g.pos("pilih_salah", 0.03)); g.check("L3 same-rate conclusion refused", "berbeza" in g.info(), g.info())
    g.click(g.pos("pilih_betul", 0.03)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4"); g.check("L4 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L6"); g.match_all(by_hand=0); g.wait(500)
    g.click(g.pos("tabiat_senaman", 0.05)); g.check("L6 exercise is fine", "Bersenam" in g.info(), g.info())
    for h in ["arak", "gam", "dadah"]:
        g.click(g.pos("tabiat_" + h, 0.05))
    g.check("L6 -> level done", g.done(), g.guide()); g.shot("L6")

    g.play_mode_hands("L1")
