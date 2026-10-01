"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

SYMS = ["sel_kering", "mentol", "suis_terbuka", "suis_tertutup", "wayar"]
with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("label_mentol"), g.pos("pin_wayar")); g.check("L2 wrong symbol refused", "🤔" in g.info(), g.info())
    for i, s in enumerate(SYMS):
        (g.hand_drag if i == 0 else g.drag)(g.pos("label_" + s), g.pos("pin_" + s))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.hand_tap(g.pos("suis_siri", 0.02)); g.check("L3 series lit", "satu laluan" in g.info(), g.info())
    g.click(g.pos("suis_siri", 0.02)); g.check("L3 series open -> all off", "semua" in g.info(), g.info())
    g.click(g.pos("suis_a", 0.02)); g.click(g.pos("suis_b", 0.02)); g.check("L3 parallel lit", "lebih daripada" in g.info(), g.info())
    g.click(g.pos("suis_a", 0.02)); g.check("L3 branch open, other lit", "masih menyala" in g.info(), g.info())
    g.click(g.pos("suis_siri", 0.02)); g.wait(2500)
    g.click(g.pos("jawapan_siri", 0.03)); g.check("L3 series-brighter refused", "🤔" in g.info(), g.info())
    g.click(g.pos("jawapan_selari", 0.03)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim")
    g.hand_tap(g.pos("tambah_sel", 0.04)); g.click(g.pos("tambah_sel", 0.04))
    g.check("L4 3 cells brighter", "cerah" in g.info(), g.info())
    g.click(g.pos("kurang_sel", 0.04)); g.click(g.pos("kurang_sel", 0.04))
    g.click(g.pos("tambah_mentol", 0.04)); g.click(g.pos("tambah_mentol", 0.04)); g.check("L4 3 bulbs dimmer", "malap" in g.info(), g.info())
    g.wait(2200); g.click(g.pos("kesimpulan_ditolak", 0.03)); g.check("L4 reject refused", "🤔" in g.info(), g.info())
    g.click(g.pos("kesimpulan_diterima", 0.03)); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.open("L5"); g.check("L5 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(by_hand=0); g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L3")
