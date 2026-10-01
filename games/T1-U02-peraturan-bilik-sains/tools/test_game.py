"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: asking before queueing is refused; queue 3 (one by hand); ask the teacher
    g.open("L1", "&handsim")
    g.hand_tap(g.pos("guru", 0.2))
    g.check("L1 teacher refuses before queue", "Beratur dahulu" in g.info(), g.info())
    spots = [g.at(x, 0, -0.05) for x in (0.2, 0.02, -0.16)]
    g.hand_drag(g.pos("murid1", 0.1), spots[0])
    g.check("L1 hand drag puts a pupil in the queue", "2</b> murid lagi" in g.js("() => document.getElementById('info').innerHTML"), g.info())
    g.drag(g.pos("murid2", 0.1), spots[1]); g.drag(g.pos("murid3", 0.1), spots[2])
    g.check("L1 three pupils queued", g.guide() == "1/2", g.guide())
    g.click(g.pos("guru", 0.2)); g.wait(4000)
    g.check("L1 permission asked -> level done", g.done())
    g.shot("L1")

    # ---- L2: good pupil early does nothing for step 1; spot all 4 (runner chased by hand), then a good one
    g.open("L2")
    g.click(g.pos("baik1", 0.15))
    g.check("L2 good pupil is praised, not counted", "mematuhi" in g.info() and g.guide() == "0/2")
    for k in ["makan", "minum", "bermain"]:
        g.click(g.pos(k, 0.15))
    g.check("L2 three breakers spotted", "(3/4)" in g.pg.inner_text("#guide"), g.pg.inner_text("#guide"))
    g.pg.goto(g.url + "?preview=L2&handsim"); g.wait(1200)
    for k in ["makan", "minum", "bermain"]:
        g.click(g.pos(k, 0.15), 200)
    for _ in range(40):  # point at the running pupil, following him like a pupil would
        g.hand("point", g.pos("berlari", 0.12), 0.1)
        if g.guide() == "1/2":
            break
    g.check("L2 runner caught with a pointing finger", g.guide() == "1/2", g.guide())
    g.click(g.pos("baik2", 0.15))
    g.check("L2 good pupil -> level done", g.done())
    g.shot("L2")

    # ---- L3: tidying before the sink is refused; litter x3 to bin; beaker + book to shelf; stool
    g.open("L3")
    g.drag(g.pos("buku"), g.pos("rak"))
    g.check("L3 tidy before sink refused", "singki" in g.info(), g.info())
    for o in ["tisu", "daun", "kulit_oren"]:
        g.drag(g.pos(o), g.pos("tong_sampah"))
    g.check("L3 litter binned, sink drains", g.guide() == "1/3" and "mengalir" in g.info(), g.info())
    g.drag(g.pos("bikar"), g.pos("rak")); g.drag(g.pos("buku"), g.pos("rak"))
    g.check("L3 shelf tidy", g.guide() == "2/3", g.guide())
    g.click(g.pos("kerusi", 0.09)); g.wait(800)
    g.check("L3 stool pushed in -> level done", g.done())
    g.shot("L3")

    g.play_mode_hands("L1")
