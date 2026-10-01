"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

ALL = ["tisu_dapur", "kain_lap", "kertas", "sapu_tangan", "gelas_kaca", "sudu_logam", "mainan_plastik", "klip_kertas"]
with Game(__file__) as g:
    # ---- L1: drip on all eight (first by hand), then tap the four absorbers (glass refused)
    g.open("L1", "&handsim")
    g.hand_drag(g.pos("penitis", 0.05), g.pos(ALL[4], 0.12)); g.wait(1200)
    g.check("L1 water stays on the glass", "tidak menyerap" in g.info(), g.info())
    for o in ALL[:4] + ALL[5:]:
        g.drag(g.pos("penitis", 0.05), g.pos(o, 0.12)); g.wait(1300)
    g.check("L1 all eight dripped", g.guide() == "1/2", g.guide())
    g.wait(2600); g.click(g.pos("gelas_kaca", 0.04))
    g.check("L1 glass does not absorb", "tidak menyerap" in g.info(), g.info())
    for o in ALL[:4]:
        g.click(g.pos(o, 0.01))
    g.check("L1 absorbers found -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: squeeze before soaking refused; soak + squeeze three; rank least -> most (wrong start resets)
    g.open("L2")
    g.drag(g.pos("tisu"), g.pos("silinder_tisu", 0.2))
    g.check("L2 must soak first", "Rendam" in g.info(), g.info())
    for m in ["kain_lap", "tisu", "kapas"]:
        g.drag(g.pos(m), g.pos("besen", 0.04)); g.wait(2600)
        g.drag(g.pos(m, 0.04), g.pos("silinder_" + m, 0.2)); g.wait(3000)
    g.check("L2 three squeezed", g.guide() == "1/2", g.guide())
    g.wait(1500); g.click(g.pos("silinder_kain_lap", 0.08))
    g.check("L2 wrong first pick resets", "Mula semula" in g.info(), g.info())
    for m in ["tisu", "kapas", "kain_lap"]:
        g.click(g.pos("silinder_" + m, 0.08))
    g.check("L2 ranked -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: umbrella to the bath refused; all four matched
    g.open("L3")
    g.drag(g.pos("payung", 0.05), g.pos("situasi_mandi"))
    g.check("L3 umbrella is not for drying", "tidak menyerap" in g.info(), g.info())
    for it, sc in [("tuala", "mandi"), ("kain_lap", "tumpah"), ("payung", "hujan"), ("kasut_getah", "lopak")]:
        g.drag(g.pos(it, 0.03), g.pos("situasi_" + sc))
    g.check("L3 all matched -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: five threads to the tie, bundle into the pen, tap to spread (by hand), mop the spill
    g.open("L4", "&handsim")
    for i in range(1, 6):
        g.drag(g.pos("benang%d" % i), g.pos("ikatan"))
    g.check("L4 five threads tied", g.guide() == "1/4", g.guide())
    g.drag(g.pos("ikatan_benang"), g.pos("pen_kosong"))
    g.check("L4 bundle in the pen", g.guide() == "2/4", g.guide())
    g.hand_tap(g.pos("mop", 0.01)); g.wait(600)
    g.check("L4 mop head spread", g.guide() == "3/4", g.guide())
    sx, sz = g.js("() => window.level.root.getObjectByName('tumpahan').position.toArray()")[::2]
    m = g.pos("mop"); g.pg.mouse.move(*m); g.pg.mouse.down()
    for i in range(30):
        q = g.at(sx + 0.17 + (0.05 if i % 2 else -0.05), 0, sz + (0.02 if i % 4 < 2 else -0.02)); g.pg.mouse.move(*q, steps=3); g.wait(30)
    g.pg.mouse.up(); g.wait(800)
    g.check("L4 spill mopped -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L1")
