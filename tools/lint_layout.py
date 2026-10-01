"""python tools/lint_layout.py [game-id ...] -> layout problems per level at desktop 1280x720 and phone 915x412 (landscape)."""
import sys, os, json, threading, functools, http.server
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
games = sys.argv[1:] or [g["id"] for g in json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8")) if g["id"] != "T2-amali"]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = r"""() => {
  const S = window.S, T = S.THREE, cam = S.camera, W = innerWidth, H = innerHeight;
  const rectOf = o => { const b = new T.Box3().setFromObject(o); if (b.isEmpty()) return null; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const p = new T.Vector3(x, y, z).project(cam); const sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); }
    return [x0, y0, x1, y1]; };
  const vis = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const dom = id => { const e = document.getElementById(id); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left, r.top, r.right, r.bottom] : null; };
  const guide = dom('guide'), top = dom('top'), info = dom('info');
  const cards = []; window.level.root.traverse(o => { if (!o.name || !o.isGroup || !vis(o)) return; const m = o.children[0]; if (m && m.isMesh && m.material && m.material.map && m.material.map.isCanvasTexture && !m.userData.fx) cards.push(o); });
  const out = [];
  const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const all = []; window.level.root.traverse(o => { if (o.isMesh && vis(o) && o.geometry && !(o.geometry.type === 'BoxGeometry' && o.parent === window.level.root && o.position.y < 0)) all.push(o); });
  let cut = 0; for (const o of all) { const r = rectOf(o); if (r && (r[1] < -2 || r[0] < -2 || r[2] > W + 2)) { cut++; if (cut <= 3) out.push(`CROPPED ${o.name || o.parent?.name || o.geometry.type} [${r.map(Math.round)}]`); } }
  const rs = cards.map(c => [c, rectOf(c)]).filter(x => x[1]);
  for (const [c, r] of rs) {
    const w = r[2] - r[0], h = r[3] - r[1];
    if (Math.min(w, h) < 26) out.push(`SMALL ${c.name} ${Math.round(w)}x${Math.round(h)}`);
    for (const [nm, d] of [['GUIDE', guide], ['TOPBAR', top], ['INFOBAR', info]]) if (d && inter(r, d) > 0.3 * w * h) out.push(`UNDER-${nm} ${c.name}`);
  }
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i][1], b = rs[j][1], ov = inter(a, b), sa = (a[2]-a[0])*(a[3]-a[1]), sb = (b[2]-b[0])*(b[3]-b[1]); if (ov > 0.35 * Math.min(sa, sb)) out.push(`OVERLAP ${rs[i][0].name} ~ ${rs[j][0].name}`); }
  return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for vw, vh, tag in [(1280, 720, "desk"), (915, 412, "phone")]:
        pg = b.new_page(viewport={"width": vw, "height": vh})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        for gid in games:
            pg.goto(f"http://127.0.0.1:{srv.server_port}/games/{gid}/?preview=L1"); pg.wait_for_function("window.gameReady===true", timeout=20000)
            lvls = pg.eval_on_selector_all("#pick option", "os => os.map(o => o.value)")
            for L in lvls:
                if L != "L1": pg.goto(f"http://127.0.0.1:{srv.server_port}/games/{gid}/?preview={L}"); pg.wait_for_function("window.gameReady===true", timeout=20000)
                pg.wait_for_timeout(300)
                for m in pg.evaluate(JS): print(f"{tag} {gid} {L} {m}")
        for e in errs: print(tag, "PAGEERROR", e)
        pg.close()
    b.close()
print("LINT DONE")
