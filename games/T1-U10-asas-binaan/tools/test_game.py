"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: circle into the square hole refused; four shapes (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("bulatan"), g.pos("lubang_segi_empat_sama"))
    g.check("L1 circle does not fit the square", "tidak muat" in g.info(), g.info())
    g.hand_drag(g.pos("segi_tiga"), g.pos("lubang_segi_tiga"))
    g.check("L1 hand fits the triangle", "Segi tiga" in g.info(), g.info())
    for s in ["segi_empat_sama", "segi_empat_tepat", "bulatan"]:
        g.drag(g.pos(s), g.pos("lubang_" + s))
    g.check("L1 all fit -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: wrong name refused; seven solids named
    g.open("L2")
    g.drag(g.pos("nama_kon", 0.03), g.pos("bongkah_piramid"))
    g.check("L2 pyramid is not a cone", "bukan kon" in g.info(), g.info())
    for k in ["kubus", "kuboid", "piramid", "prisma", "kon", "silinder", "sfera"]:
        g.drag(g.pos("nama_" + k, 0.03), g.pos("bongkah_" + k))
    g.check("L2 all named -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: wrong block for the head refused; build the robot; switch it on
    g.open("L3")
    g.drag(g.pos("blok_topi", 0.03), g.pos("slot_kepala", 0.03))
    g.check("L3 cone is not the head", "kubus" in g.info(), g.info())
    for sl in ["topi", "kepala", "badan", "tangan_kiri", "tangan_kanan", "kaki_kiri", "kaki_kanan"]:
        g.drag(g.pos("blok_" + sl, 0.03), g.pos("slot_" + sl, 0.03))
    g.check("L3 robot built", g.guide() == "1/2", g.guide())
    g.click(g.pos("slot_badan", 0.05))
    g.check("L3 robot comes alive -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: kick both balls (one by pointing); both clocks onto the shelf
    g.open("L4", "&handsim")
    g.hand_tap(g.pos("bola_sfera", 0.04))
    g.check("L4 sphere rolls", g.until("document.getElementById('info').textContent.includes('bergolek')", 5000), g.info())
    g.click(g.pos("bola_kubus", 0.035)); g.wait(1200)
    g.check("L4 both kicked", g.guide() == "1/2", g.guide())
    for c in ["jam_kuboid", "jam_sfera"]:
        g.drag(g.pos(c, 0.03), g.pos("rak", 0.16)); g.wait(1400)
    g.check("L4 clocks shelved -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L3")
