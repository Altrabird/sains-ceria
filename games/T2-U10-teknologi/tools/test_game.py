"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("blok4_kiub_merah", 0.02), g.pos("dulang"))
    g.check("L1 red cube is not in the manual", "Manual tidak memerlukan" in g.info(), g.info())
    g.hand_drag(g.pos("blok0_kiub_hijau", 0.02), g.pos("dulang"))
    for n in ["blok1_kiub_hijau", "blok2_kiub_hijau", "blok3_kiub_hijau", "blok5_prisma_merah", "blok6_prisma_merah", "blok8_silinder_kuning"]:
        g.drag(g.pos(n, 0.02), g.pos("dulang"))
    g.check("L1 manual components collected -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.drag(g.pos("kipas", 0.03), g.pos("slot_kipas", 0.04))
    g.check("L2 rotor is not step 1", "langkah 1" in g.info(), g.info())
    for p in ["kepala", "badan", "ekor", "kipas"]:
        g.drag(g.pos(p, 0.03), g.pos("slot_" + p, 0.04))
    g.check("L2 assembled", g.guide() == "1/2", g.guide())
    g.click(g.pos("slot_badan", 0.04))
    g.check("L2 helicopter flies -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    spots = [(-0.18, -0.1), (-0.1, -0.1), (-0.02, -0.1), (-0.18, -0.02), (-0.1, -0.02), (-0.14, -0.06)]
    for i, (x, z) in enumerate(spots):
        (g.hand_drag if i == 0 else g.drag)(g.pos("bekal_%d" % i, 0.02), g.at(x, 0, z))
    g.check("L3 six bricks built", g.guide() == "1/2", g.guide())
    g.click(g.pos("siap", 0.04))
    g.check("L3 new build described -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.click(g.pos("bahagian_kepala", 0.03))
    g.check("L4 must start from the last step", "langkah akhir" in g.info(), g.info())
    for p in ["kipas", "ekor", "badan", "kepala"]:
        g.click(g.pos("bahagian_" + p, 0.03)); g.wait(200)
    g.check("L4 dismantled", g.guide() == "1/3", g.guide())
    pieces = g.js("() => { const o = []; window.level.root.traverse(c => c.name.startsWith('kepingan_') && o.push([c.name, c.userData.color])); return o; }")
    for name, color in pieces:
        g.drag(g.pos(name, 0.02), g.pos("petak_" + color))
    g.check("L4 all %d pieces stored" % len(pieces), g.guide() == "2/3", g.guide())
    g.click(g.pos("penutup"))
    g.check("L4 box closed -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L2")
