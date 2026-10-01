"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

lit = "() => { let on = false; window.level.root.traverse(o => o.isSprite && o.visible && o.material.blending === 2 && (on = true)); return on; }"  # bulb halo visible
with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("fungsi_mentol", 0.04), g.pos("suis", 0.03))
    g.check("L1 wrong function refused", "Bukan fungsi" in g.info(), g.info())
    g.hand_drag(g.pos("fungsi_mentol", 0.04), g.pos("mentol", 0.03))
    for k in ["sel_kering", "suis", "wayar"]:
        g.drag(g.pos("fungsi_" + k, 0.04), g.pos(k, 0.03))
    g.check("L1 functions matched -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("mentol"), g.pos("soket_sel"))
    g.check("L2 bulb not in the battery socket", "Soket itu" in g.info(), g.info())
    for p, s in [("sel_kering", "sel"), ("mentol", "beban"), ("suis", "suis")]:
        g.drag(g.pos(p), g.pos("soket_" + s))
    g.check("L2 parts placed, bulb still off", g.guide() == "1/3" and not g.js(lit), g.guide())
    g.hand_tap(g.pos("suis", 0.02))
    g.check("L2 switch closed -> bulb lights", g.guide() == "2/3" and g.js(lit), g.guide())
    g.click(g.pos("suis", 0.02))
    g.check("L2 switch opened -> bulb off, level done", g.done() and not g.js(lit), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("mentol", 0.03))
    g.check("L3 wrong part explained", "tiada masalah" in g.info(), g.info())
    g.click(g.pos("suis", 0.02)); g.wait(2800)
    g.drag(g.pos("sel_baharu"), g.pos("sel_kering")); g.wait(2800)
    g.click(g.pos("mentol", 0.04)); g.wait(2800)
    g.click(g.pos("hujung_wayar"))
    g.check("L3 four faults fixed -> level done", g.done() and g.js(lit), g.guide()); g.shot("L3")

    g.open("L4")
    for o in ["klip_kertas", "getah_pemadam", "sudu_logam", "straw", "paku", "rod_kaca", "duit_syiling", "kayu_aiskrim"]:
        g.drag(g.pos(o), g.pos("soket_suis")); ok = g.js(lit)
        if o == "klip_kertas": g.check("L4 paper clip lights the bulb", ok)
        if o == "straw": g.check("L4 straw does not", not ok)
        g.wait(2400)
    g.check("L4 eight tested -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("buzzer"), g.pos("mentol", 0.03))
    g.check("L5 buzzer swapped in", g.guide() == "1/2", g.guide())
    g.click(g.pos("suis", 0.02))
    g.check("L5 buzzer sounds -> level done", g.done() and "Bzzz" in g.info(), g.info()); g.shot("L5")

    g.play_mode_hands("L2")
