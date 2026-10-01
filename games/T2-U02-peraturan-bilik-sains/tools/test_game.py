"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: paper into the sink refused (clogs); all five to the right place (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("kertas", 0.03), g.pos("sinki", 0.06))
    g.check("L1 solid waste would clog the sink", "tersumbat" in g.info(), g.info())
    g.hand_drag(g.pos("kertas", 0.03), g.pos("bakul_sampah", 0.12)); g.wait(800)
    g.check("L1 hand bins the paper", "bakul sampah" in g.info(), g.info())
    for w, t, dy in [("kulit_pisang", "bakul_sampah", 0.12), ("tisu", "bakul_sampah", 0.12), ("air_sabun", "sinki", 0.06), ("air_berwarna", "sinki", 0.06)]:
        g.drag(g.pos(w, 0.03), g.pos(t, dy)); g.wait(1500)
    g.check("L1 all waste sorted -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: bag through the door refused; bag to rack; three allowed items in
    g.open("L2")
    g.drag(g.pos("beg", 0.05), g.pos("pintu", 0.15))
    g.check("L2 bag stays outside", "mengganggu" in g.info(), g.info())
    g.drag(g.pos("beg", 0.05), g.pos("rak_beg", 0.1))
    for c in ["buku", "pensel", "buku_nota"]:
        g.drag(g.pos(c, 0.05), g.pos("pintu", 0.15))
    g.check("L2 sorted -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: touching glass refused; tell teacher (by hand) twice
    g.open("L3", "&handsim"); g.wait(2500)
    g.click(g.pos("kaca_pecah"))
    g.check("L3 do not touch broken glass", "Jangan sentuh" in g.info(), g.info())
    g.hand_tap(g.pos("guru", 0.2))
    g.check("L3 told about the broken beaker", g.guide() == "1/2", g.guide())
    g.until("document.getElementById('info').textContent.includes('tercedera')", 9000)
    g.click(g.pos("guru", 0.2))
    g.check("L3 told about the injury -> level done", g.until(), g.guide())
    g.shot("L3")

    # ---- L4: store before washing refused; wash three; put each in its place
    g.open("L4")
    g.drag(g.pos("bikar", 0.04), g.pos("tempat_bikar", 0.05))
    g.check("L4 wash before storing", "Bersihkan" in g.info(), g.info())
    for t in ["bikar", "kelalang_kon", "tabung_uji"]:
        g.drag(g.pos(t, 0.04), g.pos("sinki", 0.08)); g.wait(400)
    g.check("L4 all washed", g.guide() == "1/2", g.guide())
    g.drag(g.pos("bikar", 0.04), g.pos("tempat_tabung_uji", 0.05))
    g.check("L4 wrong place refused", "tempat asalnya" in g.info(), g.info())
    for t in ["bikar", "kelalang_kon", "tabung_uji"]:
        g.drag(g.pos(t, 0.04), g.pos("tempat_" + t, 0.05))
    g.check("L4 stored -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L2")
