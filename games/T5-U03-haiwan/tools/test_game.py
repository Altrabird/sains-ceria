"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

LINKS = ["rumpai>siput", "rumpai>berudu", "rumpai>belalang", "belalang>katak", "siput>bangau", "berudu>bangau", "katak>bangau"]
with Game(__file__) as g:
    for lv in ["L1", "L3", "L6"]:
        g.open(lv, "&handsim"); g.check(lv + " wrong pair refused", "🤔" in g.match_wrong(), g.info())
        g.match_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L2"); g.check("L2 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L4", "&handsim")
    g.drag(g.pos("ular", 0.05), g.pos("urutan_1")); g.check("L4 producer first", "pengeluar" in g.info(), g.info())
    for i, s in enumerate(["buah", "tupai", "ular", "helang"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.05), g.pos("urutan_%d" % (i + 1)))
    g.check("L4 -> level done", g.done(), g.guide()); g.wait(1500); g.shot("L4")

    g.open("L5", "&handsim")
    g.click(g.pos("katak", 0.05)); g.click(g.pos("rumpai", 0.05)); g.check("L5 wrong link refused", "🤔" in g.info(), g.info())
    for i, k in enumerate(LINKS):
        a, b = k.split(">")
        if i == 0: g.hand_tap(g.pos(a, 0.05)); g.hand_tap(g.pos(b, 0.05))
        else: g.click(g.pos(a, 0.05)); g.click(g.pos(b, 0.05))
    g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L5")
