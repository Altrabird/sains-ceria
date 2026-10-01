"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 sorted -> level done", g.done(), g.guide()); g.shot("L1")

    # ---- L2: water on B refused; setup 5; a week; reasons (wrong dish refused)
    g.open("L2")
    g.drag(g.pos("penitis_air", 0.04), g.pos("piring_b"))
    g.check("L2 dish B stays dry", "kering" in g.info(), g.info())
    g.drag(g.pos("piring_a"), g.pos("peti_ais", 0.1))
    for d in ["piring_a", "piring_c", "piring_d"]:
        g.drag(g.pos("penitis_air", 0.04), g.pos(d))
    g.drag(g.pos("plastik", 0.04), g.pos("piring_c"))
    g.check("L2 experiment set up", g.guide() == "1/3", g.guide())
    g.click(g.pos("seminggu", 0.03))
    g.check("L2 a week later only D sprouts", g.guide() == "2/3", g.guide())
    g.drag(g.pos("sebab_air", 0.03), g.pos("piring_c"))
    g.check("L2 wrong reason refused", "Bandingkan" in g.info(), g.info())
    for r, d in [("suhu", "piring_a"), ("air", "piring_b"), ("udara", "piring_c")]:
        g.drag(g.pos("sebab_" + r, 0.03), g.pos(d))
    g.check("L2 reasons -> level done", g.done(), g.guide()); g.shot("L2")

    # ---- L3: wrong first stage refused; five stages (one by hand)
    g.open("L3", "&handsim")
    g.drag(g.pos("berbuah", 0.05), g.pos("urutan_1"))
    g.check("L3 fruiting is not first", "biji benih" in g.info(), g.info())
    g.hand_drag(g.pos("biji_benih", 0.02), g.pos("urutan_1"))
    for i, s in enumerate(["bercambah", "anak_pokok", "berbunga", "berbuah"], 2):
        g.drag(g.pos(s, 0.03), g.pos("urutan_%d" % i))
    g.check("L3 ordered -> level done", g.done(), g.guide()); g.shot("L3")

    # ---- L4: three more days (by pointing), then the tape on the stem
    g.open("L4", "&handsim")
    for _ in range(3):
        g.hand_tap(g.pos("hari_seterusnya", 0.04)); g.wait(300)
    g.check("L4 grew to day 21", g.guide() == "1/2", g.guide())
    g.drag(g.pos("pita_ukur", 0.04), g.pos("pokok_jagung", 0.12))
    g.check("L4 stem measured -> level done", g.done(), g.guide()); g.shot("L4")

    # ---- L5: watering B refused; water A seven days; choose A
    g.open("L5")
    g.drag(g.pos("penyiram", 0.04), g.pos("pokok_b", 0.15))
    g.check("L5 only pot A is watered", "pokok A sahaja" in g.info(), g.info())
    for _ in range(7):
        g.drag(g.pos("penyiram", 0.04), g.pos("pokok_a", 0.15))
    g.check("L5 seven days", g.guide() == "1/2", g.guide())
    g.click(g.pos("pokok_b", 0.1)); g.check("L5 B wilted", "layu" in g.info(), g.info())
    g.click(g.pos("pokok_a", 0.1))
    g.check("L5 A grows well -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L3")
