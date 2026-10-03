// Anonymous usage beacons -> nginx /b (logged to /var/log/edugames/events.log, summed by tools/admin/stats.py).
// No names, no IPs: d = random device id (localStorage), s = random session id. Off on localhost (tests read window.__ev)
// and inside iframes (the admin heat map shows pages in an iframe).
//   e=v page view (p=hub|menu|lvl)  ls level start  st step done (i, t)  ld level done (t, inputs, camera)  q left mid-level
//   r palm reset  c tap (x, y as fractions of page width, w = viewport width, h=1 by hand)
const SITE = 'https://edugames.altrabird.click';
const local = /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname) || location.protocol === 'file:';
const url = window.Capacitor ? SITE + '/b' : local || window.top !== window ? null : '/b';
const id = (st, k) => { try { let v = st.getItem(k); if (!v) st.setItem(k, v = Math.random().toString(36).slice(2, 10)); return v; } catch (e) { return 'x'; } };
const base = { d: id(localStorage, 'sains.did'), s: id(sessionStorage, 'sains.sid'), a: window.Capacitor ? 1 : 0 };
window.__ev = [];

export function track(e, data = {}) {
  const ev = { e, ...base, ...data };
  window.__ev.push(ev);
  if (!url) return;
  const q = new URLSearchParams(Object.entries(ev).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  try { navigator.sendBeacon(url + '?' + q); } catch (err) { /* offline: drop it */ }
}

// tap heat map: page-relative position scaled by the viewport width (pages scroll; width decides the layout)
let taps = 0;
export function tap(x, y, extra = {}, top = scrollY) {
  if (++taps > 300) return;  /* ponytail: per-page cap keeps a scribbling pupil from flooding the log */
  const w = innerWidth;
  track('c', { x: (x / w).toFixed(3), y: ((y + top) / w).toFixed(3), w, ...extra });
}
export function trackTaps(extra, scroller) { addEventListener('pointerdown', e => e.isPrimary && tap(e.clientX, e.clientY, extra, scroller ? scroller.scrollTop : scrollY), { capture: true, passive: true }); }
