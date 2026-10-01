"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: horn to the fish refused; six parts to owners (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("tanduk", 0.03), g.pos("ikan"))
    g.check("L1 fish has no horns", "tidak mempunyai" in g.info(), g.info())
    g.hand_drag(g.pos("sisik", 0.03), g.pos("ikan"))
    g.check("L1 hand gives scales to the fish", "sisik" in g.info(), g.info())
    for p, a in [("sumbu", "badak_sumbu"), ("cangkerang", "kura_kura"), ("sesungut", "rama_rama"), ("kaki_selaput", "itik"), ("tanduk", "kambing")]:
        g.drag(g.pos(p, 0.03), g.pos(a))
    g.check("L1 all parts placed -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: wings to the fish refused; each animal gets what it needs
    g.open("L2")
    g.drag(g.pos("kepak", 0.03), g.pos("ikan"))
    g.check("L2 wings do not help the fish", "tidak membantu" in g.info(), g.info())
    for p, a in [("kepak", "burung"), ("kaki_selaput", "itik"), ("ekor", "ikan"), ("sumbu", "badak_sumbu"), ("kulit_keras", "buaya")]:
        g.drag(g.pos(p, 0.03), g.pos(a)); g.wait(400)
    g.wait(2500)
    g.check("L2 all helped -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: fish into fur zone refused; four furry animals
    g.open("L3")
    g.drag(g.pos("ikan", 0.05), g.pos("zon_bulu"))
    g.check("L3 fish is not furry", "bersisik" in g.info(), g.info())
    for a in ["lembu", "kucing", "hamster", "arnab"]:
        g.drag(g.pos(a, 0.05), g.pos("zon_bulu"))
    g.check("L3 furry four -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: trace the fish with a pointing finger (hands), then three labels
    g.open("L4", "&handsim")
    path = g.js("() => window.level.tracePath().map(([x, y, z]) => window.screenAt(x, y, z))")
    for q in path + [path[0]]:
        g.hand("point", (q["x"], q["y"]), 0.07)
    g.hand("none", (path[0]["x"], path[0]["y"]), 0.2)
    g.check("L4 traced the fish by hand", g.guide() == "1/2", g.guide())
    g.wait(600)
    g.drag(g.pos("ekor", 0.03), g.pos("titik_sirip"))
    g.check("L4 tail label on fin spot refused", "Bukan di situ" in g.info(), g.info())
    for l in ["sirip", "sisik", "ekor"]:
        g.drag(g.pos(l, 0.03), g.pos("titik_" + l))
    g.check("L4 labelled -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L1")
