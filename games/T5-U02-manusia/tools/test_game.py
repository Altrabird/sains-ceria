"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

LABELS = ["tengkorak", "tulang_rusuk", "tulang_belakang", "tulang_tangan", "tulang_kaki"]
JOINTS = ["leher", "bahu", "siku", "pergelangan", "pinggul", "lutut", "buku_lali"]
with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("label_tengkorak"), g.pos("pin_tulang_kaki")); g.check("L1 wrong pin refused", "🤔" in g.info(), g.info())
    for i, l in enumerate(LABELS):
        (g.hand_drag if i == 0 else g.drag)(g.pos("label_" + l), g.pos("pin_" + l))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim"); g.check("L2 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click((1180, 640)); g.check("L3 empty tap hints", "🔎" in g.info(), g.info())
    g.hand_tap(g.pos("pin_leher"))
    for j in JOINTS[1:]:
        g.click(g.pos("pin_" + j), 300)
    g.check("L3 -> level done", g.done(), g.guide()); g.wait(800); g.shot("L3")

    g.open("L4", "&handsim")
    g.drag(g.pos("darah"), g.pos("pin_tubuh")); g.check("L4 lungs first", "🤔" in g.info(), g.info())
    for i, p in enumerate(["peparu", "jantung", "tubuh", "jantung", "peparu"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("darah"), g.pos("pin_" + p))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5"); g.check("L5 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L4")
