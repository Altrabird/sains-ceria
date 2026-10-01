"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: wrong name refused; six names (one by hand); four uses tapped (cup refused)
    g.open("L1", "&handsim")
    g.drag(g.pos("nama_bar", 0.03), g.pos("m_cincin"))
    g.check("L1 wrong shape name refused", "bentuknya" in g.info(), g.info())
    g.hand_drag(g.pos("nama_cincin", 0.03), g.pos("m_cincin"))
    g.check("L1 hand names the ring magnet", "cincin" in g.info(), g.info())
    for k in ["bar", "silinder", "ladam", "bentuk_u", "butang"]:
        g.drag(g.pos("nama_" + k, 0.03), g.pos("m_" + k))
    g.check("L1 shapes named", g.guide() == "1/2", g.guide())
    g.wait(800); g.hand_tap(g.pos("cawan", 0.06))
    g.check("L1 cup does not use a magnet", "tidak menggunakan" in g.info(), g.info())
    for u in ["peti_sejuk", "tanda_nama", "kotak_pensel", "pemutar_skru"]:
        g.click(g.pos(u, 0.06))
    g.check("L1 uses found -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: sweep the magnet over all eight objects, then drop it in the box
    g.open("L2")
    m = g.pos("magnet"); g.pg.mouse.move(*m); g.pg.mouse.down()
    for o in ["pensel", "paku", "guli", "skru", "pemadam", "klip", "pembaris", "kunci"]:
        p = g.js("n => { const o = window.level.root.getObjectByName(n).position; return window.screenAt(o.x - 0.1, 0, o.z); }", o)
        g.pg.mouse.move(p["x"], p["y"], steps=12); g.wait(150)
    g.check("L2 every object tested", g.guide() == "1/2", g.guide())
    b = g.pos("kotak_ditarik"); g.pg.mouse.move(*b, steps=15); g.pg.mouse.up(); g.wait(600)
    g.check("L2 attracted objects collected -> level done", g.done(), g.info())
    g.shot("L2")

    # ---- L3: push -> attract; tap to flip; push -> repel
    g.open("L3")
    near = g.at(0.06, 0, 0)
    g.drag(g.pos("magnet_gerak"), near); g.wait(1500)
    g.check("L3 unlike poles attract", g.guide() == "1/3" and "menarik" in g.info(), g.info())
    g.click(g.pos("magnet_gerak", 0.02), 1800)  # flipping the stuck magnet makes it jump away at once
    g.check("L3 flipped -> like poles repel -> level done", g.done() and "menolak" in g.info(), g.info())
    g.drag(g.pos("magnet_gerak"), g.at(0.06, 0, 0)); g.wait(1500)
    g.check("L3 pushing again still repels", "menolak" in g.info() and g.pg.evaluate("window.level.root.getObjectByName('magnet_gerak').position.x") > 0.05)
    g.shot("L3")

    # ---- L4: dip both magnets; A is not the stronger; choose B
    g.open("L4")
    for mg in ["magnet_a", "magnet_b"]:
        g.drag(g.pos(mg), g.pos("dulang_klip")); g.wait(800)
    g.check("L4 both tested", g.guide() == "1/2", g.guide())
    g.wait(1500); g.click(g.pos("magnet_a", 0.02))
    g.check("L4 magnet A is weaker", "3 klip" in g.info(), g.info())
    g.click(g.pos("magnet_b", 0.02))
    g.check("L4 stronger magnet chosen -> level done", g.done(), g.guide())
    g.shot("L4")

    # ---- L5: same pole repels; flip (by hand); unlike poles hold the pin
    g.open("L5", "&handsim")
    behind = g.at(0.03, 0.1, -0.05)
    g.drag(g.pos("magnet_belakang", 0.03), behind); g.wait(900)
    g.check("L5 same poles push the button away", "menolak" in g.info(), g.info())
    g.hand_tap(g.pos("magnet_belakang", 0.03))
    g.check("L5 flipped by pointing", "kutub <b>S</b>" in g.js("() => document.getElementById('info').innerHTML"), g.info())
    g.drag(g.pos("magnet_belakang", 0.03), behind); g.wait(900)
    g.check("L5 pin holds -> level done", g.done(), g.guide())
    g.shot("L5")

    g.play_mode_hands("L3")
