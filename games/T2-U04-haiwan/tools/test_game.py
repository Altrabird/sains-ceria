"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

def cycle(g, lv, ids):
    g.open(lv, "&handsim")
    g.drag(g.pos(ids[2], 0.03), g.pos("kitar_1"))
    g.check(lv + " cycle starts with eggs", "telur" in g.info(), g.info())
    g.hand_drag(g.pos(ids[0], 0.03), g.pos("kitar_1"))
    for i, s in enumerate(ids[1:], 2):
        g.drag(g.pos(s, 0.03), g.pos("kitar_%d" % i))
    g.check(lv + " cycle complete -> level done", g.done(), g.guide()); g.shot(lv)

with Game(__file__) as g:
    for lv in ["L1", "L2", "L5"]:
        g.open(lv, "&handsim")
        g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all()
        g.check(lv + " all sorted -> level done", g.done(), g.guide()); g.shot(lv)
    cycle(g, "L3", ["telur_katak", "berudu", "anak_katak", "katak"])
    cycle(g, "L4", ["telur_rama", "larva", "pupa", "rama_rama"])

    # ---- L6: kittens to the nest refused; protect all three
    g.open("L6")
    g.drag(g.pos("anak_kucing", 0.02), g.pos("sarang"))
    g.check("L6 kittens do not go in a nest", "sesuai" in g.info(), g.info())
    for o, t in [("telur_burung", "sarang"), ("telur_penyu", "pasir"), ("anak_kucing", "tempat_tersorok")]:
        g.drag(g.pos(o, 0.02), g.pos(t)); g.wait(1300)
    g.check("L6 all protected -> level done", g.done(), g.guide()); g.shot("L6")

    g.play_mode_hands("L3")
