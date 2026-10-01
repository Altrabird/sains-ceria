// Game shell shared by every unit game: menu, 3D stage over the selfie camera, guided steps, and ONE input layer
// where mouse/touch and MediaPipe hand gestures produce the same calls. A game only supplies its levels:
//
//   boot({ title, intro, levels: [{ id, title, sp }], steps, build: (id, S) => level })
//   level = { root, view: { w, d }, pick(x,y)->bool, drag(x,y), drop(x,y), tap(x,y), hit(x,y)->key|null, pen(x,y,on), update(dt) }
//   (x, y) are screen pixels. pick = start holding something (✌️ / mouse down); pen = ☝️ finger or mouse drag on nothing.
//
// URL: ?play=L1 camera + hands (main mode) · ?preview=L1 3D, mouse/touch only · ?preview=L1&handsim tests feed hands.
// (games/T2-amali predates this file and still carries its own copy of the same ideas.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { classify, Gestures, createHandTracker, drawHand } from './hands.js';
import { GuidePanel } from './guide.js';

export const $ = id => document.getElementById(id);

// ------------------------------------------------------------ tweens
const tweens = new Set();
export const ease = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
export function tween(dur, fn, done) {
  return new Promise(res => tweens.add({ t0: performance.now(), dur: dur * 1000, fn, done: () => { done?.(); res(); } }));
}
export const wait = s => tween(s, () => {});
function stepTweens(now) {
  for (const tw of tweens) {
    const t = Math.min(1, (now - tw.t0) / tw.dur);
    tw.fn(ease(t), t);
    if (t >= 1) { tweens.delete(tw); tw.done(); }
  }
}

// ------------------------------------------------------------ info bubble + emoji sprites
let infoTimer;
export function info(html, secs = 6) {
  $('info').innerHTML = html; $('info').style.display = 'block';
  clearTimeout(infoTimer); infoTimer = setTimeout(() => $('info').style.display = 'none', secs * 1000);
}
const emojiTex = new Map();
export function emojiSprite(ch, size = 0.12) {
  if (!emojiTex.has(ch)) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); g.font = '100px "Noto Color Emoji","Segoe UI Emoji","Apple Color Emoji",sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 72);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; emojiTex.set(ch, t);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex.get(ch), transparent: true, depthWrite: false }));
  s.scale.setScalar(size); return s;
}

// a rounded label (Malay text, emoji ok) that always faces the camera; h = world height
export function textSprite(text, { h = 0.05, bg = '#ffffffee', fg = '#2b2340', font = 'bold 44px system-ui, sans-serif' } = {}) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = font; const w = Math.ceil(g.measureText(text).width) + 36;
  c.width = w; c.height = 64; g.font = font;
  g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, 64, 26); g.fill();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 35);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(h * w / 64, h, 1); s.userData.fx = true; return s;
}

const UI = `
<div id="stage"></div>
<div id="top" hidden><button id="home">← Menu</button><button id="handChip">✋ Tangan: memuatkan…</button><select id="pick" aria-label="Tukar tahap"></select><button id="next" hidden>Seterusnya ▶</button></div>
<canvas id="handLayer"></canvas><div id="cursor" hidden></div><div id="cursorIcon" hidden></div>
<div id="hint"></div><aside id="guide" hidden aria-live="polite"></aside><div id="info" role="status"></div>
<div id="menu" hidden></div>`;

export async function boot({ title, intro, levels, steps, build }) {
  document.body.insertAdjacentHTML('afterbegin', UI);
  const Q = new URLSearchParams(location.search);
  const MODE = ['play', 'preview'].find(k => Q.has(k));
  const ids = levels.map(l => l.id);
  if (!MODE || !ids.includes(Q.get(MODE))) {
    $('menu').hidden = false;
    $('menu').innerHTML = `<p style="margin:0"><a class="back" href="../../">← Semua permainan</a></p><h1>${title}</h1><p>${intro}</p>
      <div class="list">${levels.map(l => `<div class="lv"><a class="play" href="?play=${l.id}">▶ ${l.id}</a><b>${l.title}</b><small>${l.sp}</small><br>
      <a href="?preview=${l.id}">🧊 3D (tetikus)</a></div>`).join('')}</div>`;
    return;
  }
  const id = Q.get(MODE), lv = levels[ids.indexOf(id)], nextId = ids[ids.indexOf(id) + 1];
  $('top').hidden = false;
  $('home').onclick = () => location.href = location.pathname;
  $('pick').innerHTML = levels.map(l => `<option value="${l.id}">${l.id} · ${l.title}</option>`).join('');
  $('pick').value = id; $('pick').onchange = e => location.search = `?${MODE}=${e.target.value}`;
  if (nextId) $('next').onclick = () => location.search = `?${MODE}=${nextId}`;

  // camera behind the scene (play mode)
  let video = null;
  if (MODE === 'play') {
    video = Object.assign(document.createElement('video'), { id: 'camBg', autoplay: true, muted: true, playsInline: true });
    document.body.prepend(video); document.body.style.background = 'transparent';
    try { video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } }); }
    catch (e) { video.remove(); video = null; info('Kamera tidak dapat dibuka — guna tetikus/sentuhan. (' + e.message + ')', 20); }
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: !!video });
  renderer.setPixelRatio(devicePixelRatio); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  $('stage').append(renderer.domElement);
  const scene = new THREE.Scene(); if (!video) scene.background = new THREE.Color(0xe9e3ee);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x886677, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(0.5, 2, 1); scene.add(sun);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.01, 50);

  // ---- helpers handed to the level
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  const aim = (x, y) => { v2.set(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1); ray.setFromCamera(v2, camera); return ray; };
  const S = {
    THREE, scene, camera, tween, wait, info, emojiSprite,
    evt: (type, oid, extra = {}) => GUIDE.event({ type, id: oid, ...extra }),
    // first of `objs` under the screen point (a hit on a child counts for its listed ancestor)
    hitTest(x, y, objs) {
      const hits = aim(x, y).intersectObjects(objs, true).filter(h => h.object.isMesh && h.object.visible && !h.object.userData.fx);  // lines raycast with a 1 m slop
      for (const h of hits) for (let o = h.object; o; o = o.parent) if (objs.includes(o)) return o;
      return null;
    },
    // nearest of `objs` whose centre is within px on screen (forgiving grabs for small hands)
    nearest(x, y, objs, px = 70) {
      let best = null, bd = px;
      for (const o of objs) { const s = S.screenOf(o), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = o; } }
      return best;
    },
    onPlane(x, y, h = 0) { return aim(x, y).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -h), new THREE.Vector3()); },
    screenOf(o) { const p = o.getWorldPosition(new THREE.Vector3()).project(camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; },
    rayAt: aim,
    async star(at) {
      const s = emojiSprite('⭐', 0.001); s.position.copy(at); scene.add(s);
      await tween(0.5, t => { s.scale.setScalar(0.001 + t * 0.14); s.position.y = at.y + t * 0.1; });
      await tween(0.5, t => s.material.opacity = 1 - t); scene.remove(s);
    },
  };

  let level = null;
  const GUIDE = new GuidePanel($('guide'), steps, {
    onComplete: spec => {
      setTimeout(() => info(`🎉 <b>Tahniah! Tahap selesai.</b> ${spec.k}`, 12), 1500);
      for (let i = 0; i < 5; i++) setTimeout(() => S.star(new THREE.Vector3((i - 2) * 0.12, 0.2, 0)), i * 180);
      $('next').hidden = !nextId; window.levelDone = true;
    },
  });
  async function load() {
    if (level) scene.remove(level.root);
    level = await build(id, S); scene.add(level.root); fitView();
    window.level = level;
  }
  // frame the level's table area (w wide, d deep) from the front-above, clear of the guide panel on wide screens
  function fitView() {
    const { w = 1.2, d = 0.8 } = level?.view || {};
    camera.aspect = innerWidth / innerHeight;
    const g = $('guide'), off = !g.hidden && innerWidth > 700 ? g.getBoundingClientRect().right / 2 : 0;
    const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * (innerWidth - 2 * off) / innerHeight);  // fit beside the panel
    const el = THREE.MathUtils.degToRad(55);  // table seen from the front-above: depth shrinks by sin(el), props add ~0.3 m
    const dist = Math.max((w / 2) / Math.tan(hf / 2), (d * Math.sin(el) + 0.3) / 2 / Math.tan(vf / 2)) * 1.05;
    camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist); camera.lookAt(0, 0, 0);
    if (off) camera.setViewOffset(innerWidth, innerHeight, -off, 0, innerWidth, innerHeight); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  GUIDE.load(id, lv.title);
  await load();
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fitView(); });
  $('hint').textContent = `${id} · ${lv.title}` + (MODE === 'preview' ? ' — pratonton 3D' : ' · ☝️ tuding  ✌️ 2 jari = pegang  ✋ tahan = ulang');

  // ---- one input layer: mouse/touch ...
  let holding = false, down = null;
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, moved: false }; holding = !!level.pick?.(e.clientX, e.clientY); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!down) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) down.moved = true;
    if (holding) level.drag?.(e.clientX, e.clientY); else if (down.moved) level.pen?.(e.clientX, e.clientY, true);
  });
  cv.addEventListener('pointerup', e => {
    if (!down) return;
    if (holding) level.drop?.(e.clientX, e.clientY);
    else { level.pen?.(e.clientX, e.clientY, false); if (!down.moved) level.tap?.(e.clientX, e.clientY); }
    holding = false; down = null;
  });

  // ... and hands (MediaPipe landmarks -> the same calls)
  const toScreen = (x, y) => {  // normalized camera coords -> screen px, matching object-fit:cover + mirror of #camBg
    if (!video?.videoWidth) return { x: (1 - x) * innerWidth, y: y * innerHeight };
    const k = Math.max(innerWidth / video.videoWidth, innerHeight / video.videoHeight);
    const w = video.videoWidth * k, h = video.videoHeight * k;
    return { x: (innerWidth - w) / 2 + (1 - x) * w, y: (innerHeight - h) / 2 + y * h };
  };
  const sc = f => (x, y) => { const s = toScreen(x, y); return f(s.x, s.y); };
  let hHold = false, penOn = false;
  const G = new Gestures({
    hit: sc((x, y) => level.hit?.(x, y) ?? null),
    tap: sc((x, y) => level.tap?.(x, y)),
    grab: sc((x, y) => { hHold = !!level.pick?.(x, y); }),
    drag: sc((x, y) => { if (hHold) level.drag?.(x, y); }),
    drop: sc((x, y) => { if (hHold) level.drop?.(x, y); hHold = false; }),
    wind: () => level.wind?.(),
    reset: async () => { hHold = false; GUIDE.t.reset(); GUIDE.render(); await load(); info('✋ Tahap dimulakan semula.'); },
  });
  const useHands = !!video || Q.has('handsim');
  let tracker = null, lastVT = -1, lastLm = null, handsOn = true;
  const chip = $('handChip');
  if (!useHands) chip.hidden = true;
  else if (video) createHandTracker().then(t => { tracker = t; chip.textContent = '✋ Tangan: AKTIF'; })
    .catch(e => { chip.textContent = '✋ Tangan: gagal'; console.warn('hand tracker', e); });
  else chip.textContent = '✋ Tangan: simulasi';
  chip.onclick = () => { handsOn = !handsOn; chip.textContent = handsOn ? '✋ Tangan: AKTIF' : '✋ Tangan: MATI'; if (!handsOn) feed(null, performance.now()); };
  function feed(lm, now) {
    lastLm = handsOn ? lm : null;
    G.update(lastLm ? classify(lastLm, G.grabbing) : null, now / 1000);
    const pen = !!lastLm && G.g === 'point';  // ☝️ = pen down (tracing); anything else lifts it
    if (pen || penOn) { const s = toScreen(G.x, G.y); level.pen?.(s.x, s.y, pen); }
    penOn = pen;
  }
  window.feedHand = lm => feed(lm, performance.now());
  const layer = $('handLayer'), ctx = layer.getContext('2d'), cur = $('cursor'), icon = $('cursorIcon');
  const ICON = { two: '✌️', point: '☝️', open: '✋', none: '✊' };
  function drawHands() {
    if (layer.width !== innerWidth || layer.height !== innerHeight) { layer.width = innerWidth; layer.height = innerHeight; }
    ctx.clearRect(0, 0, layer.width, layer.height);
    const on = !!lastLm && G.x !== null; cur.hidden = icon.hidden = !on;
    if (!on) return;
    drawHand(ctx, lastLm, toScreen, G.grabbing ? '#ffcc33' : '#ff7aa8');
    const s = toScreen(G.x, G.y);
    cur.style.left = icon.style.left = s.x + 'px'; cur.style.top = icon.style.top = s.y + 'px';
    cur.style.setProperty('--p', G.progress); icon.textContent = ICON[G.g];
  }

  // test helpers: screen px of a named object in the level (dy = metres above it) or of a world point
  window.screenAt = (x, y, z) => { const p = new THREE.Vector3(x, y, z).project(camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; };
  window.screenOf = (name, dy = 0) => { const p = level.root.getObjectByName(name).getWorldPosition(new THREE.Vector3()); return window.screenAt(p.x, p.y + dy, p.z); };
  let last = performance.now();
  renderer.setAnimationLoop(now => {
    stepTweens(now); level.update?.(Math.min(0.05, (now - last) / 1000)); last = now;
    if (tracker && handsOn && video.readyState >= 2 && video.currentTime !== lastVT) {
      lastVT = video.currentTime; feed(tracker.detectForVideo(video, now).landmarks?.[0] || null, now);
    }
    drawHands(); renderer.render(scene, camera);
  });
  window.gameReady = true;
}
