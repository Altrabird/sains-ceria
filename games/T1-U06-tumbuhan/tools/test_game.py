"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: flower first refused; build bottom-up (roots by hand); water -> fruit
    g.open("L1", "&handsim")
    g.drag(g.pos("bunga", 0.02), g.pos("pasu", 0.1))
    g.check("L1 must build from the bottom", "dari bawah" in g.info(), g.info())
    g.hand_drag(g.pos("akar", 0.12), g.pos("pasu", 0.1))
    g.check("L1 hand places the roots", "(1/4)" in g.pg.inner_text("#guide"), g.pg.inner_text("#guide"))
    for p, dy in [("batang", 0.1), ("daun", 0.1), ("bunga", 0.02)]:
        g.drag(g.pos(p, dy), g.pos("pasu", 0.1))
    g.check("L1 plant built", g.guide() == "1/2", g.guide())
    g.wait(500); g.hand_tap(g.pos("penyiram", 0.04)); g.wait(7000)
    g.check("L1 watering -> flower becomes fruit, level done", g.done(), g.info())
    g.shot("L1")

    # ---- L2: fern into 'berbunga' refused; all eight specimens
    g.open("L2")
    g.drag(g.pos("paku_pakis"), g.pos("petak_teratai"))
    g.check("L2 fern does not flower", "Cuba petak lain" in g.info(), g.info())
    for sp in ["teratai", "paku_pakis", "batang_durian", "batang_betik", "daun_ros", "daun_pandan", "akar_tunjang", "akar_serabut"]:
        g.drag(g.pos(sp, 0.01), g.pos("petak_" + sp))
    g.check("L2 all sorted -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: 'serabut' refused; four shared features
    g.open("L3")
    g.drag(g.pos("serabut", 0.04), g.pos("zon_serupa"))
    g.check("L3 fibrous roots are not shared", "tunjang" in g.info(), g.info())
    for f in ["berbunga", "jejala", "berkayu", "tunjang"]:
        g.drag(g.pos(f, 0.04), g.pos("zon_serupa"))
    g.check("L3 four shared features -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: wrong pin refused; label all four
    g.open("L4")
    g.drag(g.pos("label_akar", 0.03), g.pos("pin_bunga"))
    g.check("L4 roots label on flower refused", "Bukan" in g.info(), g.info())
    for k in ["bunga", "daun", "batang", "akar"]:
        g.drag(g.pos("label_" + k, 0.03), g.pos("pin_" + k))
    g.check("L4 all labelled -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L1")
