// Hand navigation for normal pages (the hub, a game's page): ☝️ point-and-hold presses any card/button,
// ✌️ two fingers up/down scrolls. Opt-in with the "✋ Guna tangan" button; the choice is remembered on the device
// (localStorage sains.hands) and levels already use the camera, so a pupil can go hub → game → level hands-free.
// The hand skeleton + ring are drawn on a top layer (z-index 1000), always in front of cards and panels.
import { Gestures, classify, createHandTracker, drawHand } from './hands.js';

const KEY = 'sains.hands';
const on = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
const save = v => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} };

export function handNav({ scroller = document.scrollingElement } = {}) {
  const sim = new URLSearchParams(location.search).has('handsim');
  document.body.insertAdjacentHTML('beforeend', `<button id="hnToggle" class="btn" aria-pressed="false">✋ Guna tangan</button>
    <video id="hnCam" autoplay muted playsinline hidden></video><canvas id="hnLayer"></canvas><div id="hnRing" hidden></div><div id="hnIcon" hidden></div>`);
  const $ = id => document.getElementById(id), btn = $('hnToggle'), cam = $('hnCam'), layer = $('hnLayer'), ctx = layer.getContext('2d'), ring = $('hnRing'), icon = $('hnIcon');
  const ICON = { two: '✌️', point: '☝️', open: '✋', none: '✊' };
  let tracker = null, stream = null, running = false, lastLm = null, lastVT = -1, hovered = null, grabY = null;

  // camera frame (mirrored, object-fit: cover over the whole window) -> screen px
  const toScreen = (x, y) => ({ x: (1 - x) * innerWidth, y: y * innerHeight });
  const target = (x, y) => { const el = document.elementFromPoint(x, y)?.closest('a[href], button, [data-hand]'); return el && el !== btn ? el : null; };
  const hover = el => { if (el === hovered) return; hovered?.classList.remove('hand-hover'); hovered = el; el?.classList.add('hand-hover'); };
  const sc = f => (x, y) => { const s = toScreen(x, y); return f(s.x, s.y); };
  const G = new Gestures({
    hit: sc((x, y) => { const el = target(x, y); hover(el); return el; }),
    tap: sc((x, y) => { const el = target(x, y); hover(null); el?.click(); }),
    grab: sc((x, y) => { grabY = y; }),
    drag: sc((x, y) => { if (grabY !== null) { scroller.scrollBy(0, (grabY - y) * 2.2); grabY = y; } }),  // move the hand up = page moves up
    drop: () => { grabY = null; },
    wind: () => {}, reset: () => {},
  });
  function feed(lm, now) {
    lastLm = lm; G.update(lm ? classify(lm, G.grabbing) : null, now / 1000);
    if (G.g !== 'point') hover(null);
    if (layer.width !== innerWidth || layer.height !== innerHeight) { layer.width = innerWidth; layer.height = innerHeight; }
    ctx.clearRect(0, 0, layer.width, layer.height);
    const show = !!lm && G.x !== null; ring.hidden = icon.hidden = !show; if (!show) return;
    drawHand(ctx, lm, toScreen, G.grabbing ? '#ffc800' : '#ff6fae');
    const s = toScreen(G.x, G.y); ring.style.left = icon.style.left = s.x + 'px'; ring.style.top = icon.style.top = s.y + 'px';
    ring.style.setProperty('--p', G.progress); icon.textContent = ICON[G.g];
  }
  window.feedHand = lm => feed(lm, performance.now());  // tests (and ?handsim) drive it with synthHand()

  function loop(now) {
    if (!running) return;
    if (tracker && cam.readyState >= 2 && cam.currentTime !== lastVT) { lastVT = cam.currentTime; feed(tracker.detectForVideo(cam, now).landmarks?.[0] || null, now); }
    requestAnimationFrame(loop);
  }
  async function start() {
    btn.textContent = '✋ Memuatkan…';
    if (sim) { running = true; btn.textContent = '✋ Tangan: simulasi'; btn.setAttribute('aria-pressed', 'true'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      cam.srcObject = stream; cam.hidden = false; tracker ||= await createHandTracker();
      running = true; requestAnimationFrame(loop); btn.textContent = '✋ Tangan: AKTIF'; btn.classList.add('green'); btn.setAttribute('aria-pressed', 'true');
    } catch (e) { stop(); btn.textContent = '✋ Kamera tidak dapat dibuka'; console.warn('handnav', e); }
  }
  function stop() {
    running = false; stream?.getTracks().forEach(t => t.stop()); stream = null; cam.hidden = true; feed(null, performance.now());
    btn.textContent = '✋ Guna tangan'; btn.classList.remove('green'); btn.setAttribute('aria-pressed', 'false');
  }
  btn.onclick = () => { const v = !running; save(v); v ? start() : stop(); };
  if (on() || sim) start();
}
