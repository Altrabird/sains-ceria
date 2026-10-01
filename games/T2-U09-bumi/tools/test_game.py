"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

def wave(g, at, n=8):
    for i in range(n):
        g.hand("open", (at[0] + (160 if i % 2 else -160), at[1]), 0.08)

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 sorted -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.hand_tap(g.pos("blok_kiri", 0.03)); g.wait(2000)
    g.check("L2 water flows to the low end", "rendah" in g.info(), g.info())
    g.wait(1500); g.click(g.pos("blok_kanan", 0.03)); g.wait(2000)
    g.check("L2 both ends -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.drag(g.pos("hujan", 0.03), g.pos("kitar_1"))
    g.check("L3 cycle starts with water", "air" in g.info(), g.info())
    for i, s in enumerate(["air", "wap_air", "awan", "hujan"], 1):
        g.drag(g.pos(s, 0.03), g.pos("kitar_%d" % i))
    g.check("L3 water cycle -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    for t in ["botol_plastik", "tin_minuman", "plastik", "kertas", "daun"]:
        g.drag(g.pos(t, 0.04), g.pos("tong_sampah", 0.1))
    g.check("L4 drain cleared -> level done", g.done() and "banjir kilat" in g.info(), g.info()); g.shot("L4")

    g.open("L5")
    g.drag(g.pos("air_siram", 0.04), g.pos("balang_tanah", 0.1)); g.click(g.pos("akuarium", 0.07))
    g.check("L5 air in soil and water", g.guide() == "1/2", g.guide())
    g.drag(g.pos("oksigen", 0.03), g.pos("nafas_keluar"))
    g.check("L5 oxygen is breathed in, not out", "🤔" in g.info(), g.info())
    g.drag(g.pos("oksigen", 0.03), g.pos("nafas_masuk")); g.drag(g.pos("karbon_dioksida", 0.03), g.pos("nafas_keluar"))
    g.check("L5 gases -> level done", g.done(), g.guide()); g.shot("L5")

    g.open("L6", "&handsim")
    c = g.pos("kincir_angin", 0.1)
    wave(g, c)
    g.check("L6 a hand wave makes wind", g.guide() == "1/2", g.guide())
    for _ in range(3):
        g.click(g.pos("tiup", 0.04), 300)
    g.check("L6 strong wind -> level done", g.done() and "kencang" in g.info(), g.info()); g.wait(1500); g.shot("L6")

    g.open("L7", "&handsim")
    g.drag(g.pos("straw_panjang"), g.pos("roket", 0.08))
    g.check("L7 short straw first", g.guide() == "0/2", g.guide())
    g.drag(g.pos("straw_pendek"), g.pos("roket", 0.08)); g.drag(g.pos("straw_panjang"), g.pos("roket", 0.08))
    g.check("L7 rocket built", g.guide() == "1/2", g.guide())
    wave(g, g.pos("roket", 0.1))
    g.check("L7 a wave launches the rocket -> level done", g.until(), g.guide()); g.shot("L7")

    g.play_mode_hands("L6")
