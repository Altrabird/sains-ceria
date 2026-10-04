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
import { classify, Gestures, createHandTracker, drawHand, openCamera, cameras, pickCamera, weakCam } from './hands.js';
import { track, tap, trackTaps } from './track.js';
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

// per-device progress for the hub (index.html reads the same keys): sains.done = {gameId: [levelIds]}, sains.last = {id, level, t}
const GAME = (location.pathname.match(/games\/([^/]+)\//) || [])[1];
const store = (k, f) => { try { const v = f(JSON.parse(localStorage.getItem(k) || 'null')); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: no progress */ } };
const progress = {
  done: lv => GAME && store('sains.done', d => { d ||= {}; d[GAME] = [...new Set([...(d[GAME] || []), lv])]; return d; }),
  last: lv => GAME && store('sains.last', () => ({ id: GAME, level: lv, t: Date.now() })),
};

// soft sky gradient with round cartoon clouds (no camera = preview / no permission)
function skyTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#8fd8ff'); gr.addColorStop(0.6, '#cdeeff'); gr.addColorStop(1, '#fff6e6');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  const cloud = (x, y, s) => { g.fillStyle = '#ffffffe6'; for (const [dx, dy, r] of [[0, 0, 26], [28, -12, 32], [60, 0, 26], [30, 8, 24]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); } };
  cloud(90, 90, 1.2); cloud(700, 60, 1.5); cloud(860, 170, 0.9); cloud(380, 140, 0.8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const UI = `
<div id="stage"></div>
<div id="top" hidden><button id="hub" aria-label="Semua permainan">⌂</button><button id="home">← Menu</button><button id="handChip">✋ Tangan: memuatkan…</button><button id="weakChip" hidden title="Untuk kamera kabur / bilik gelap">📷 Kamera biasa</button><select id="camPick" hidden aria-label="Pilih kamera"></select><select id="pick" aria-label="Tukar tahap"></select><button id="next" hidden>Seterusnya ▶</button></div>
<canvas id="handLayer"></canvas><div id="cursor" hidden></div><div id="cursorIcon" hidden></div>
<div id="hint"></div><aside id="guide" hidden aria-live="polite"></aside><div id="info" role="status"></div>
<div id="menu" hidden></div><div id="win" hidden></div>`;

export async function boot({ title, intro, levels, steps, build }) {
  document.body.insertAdjacentHTML('afterbegin', UI);
  const Q = new URLSearchParams(location.search);
  const MODE = ['play', 'preview'].find(k => Q.has(k));
  const ids = levels.map(l => l.id);
  if (!MODE || !ids.includes(Q.get(MODE))) {
    let meta = {}; try { meta = (await (await fetch('../../games.json')).json()).find(g => g.id === GAME) || {}; } catch (e) { /* opened alone */ }
    let got = []; try { got = (JSON.parse(localStorage.getItem('sains.done') || '{}') || {})[GAME] || []; } catch (e) {}
    const first = levels.find(l => !got.includes(l.id)) || levels[0], img = meta.icon ? `<img src="../../shared/icons/${meta.icon}.png" alt="">` : '';
    $('menu').hidden = false; $('menu').style.setProperty('--c', `var(--y${meta.year || 3})`);
    $('menu').innerHTML = `<div class="mnav"><a class="btn" href="../../index.html">← Semua permainan</a></div>
      <section class="exp"><span class="ico big">${img}</span><div class="about">
        <span class="pill">${meta.year ? `Tahun ${meta.year}${meta.unit ? ' · Unit ' + meta.unit : ''}` : 'Sains'}</span><h1>${title}</h1>
        <div class="meta"><span class="stars">${'★'.repeat(got.length)}<span class="off">${'★'.repeat(Math.max(0, levels.length - got.length))}</span></span><span>${got.length}/${levels.length} tahap selesai</span></div>
        <a class="btn green big" href="?play=${first.id}">▶ ${got.length ? 'Sambung' : 'Mula main'} · ${first.id}</a></div></section>
      ${meta.song ? '<div id="songBox"></div>' : ''}
      <p class="intro">${intro}</p><h2>Tahap</h2>
      <div class="list">${levels.map((l, i) => `<div class="lv${got.includes(l.id) ? ' done' : ''}"><span class="num">${got.includes(l.id) ? '★' : i + 1}</span>
        <div class="lvt"><b>${l.title}</b><small>${l.sp}</small></div>
        <div class="acts"><a class="btn green" href="?play=${l.id}">▶ Main</a><a class="btn" href="?preview=${l.id}" title="Tanpa kamera">Tanpa kamera</a></div></div>`).join('')}</div>`;
    (await import('./handnav.js')).handNav({ scroller: $('menu') });  /* hands on the game page too */
    track('v', { p: 'menu', g: GAME }); trackTaps({ p: 'menu', g: GAME }, $('menu'));
    if (meta.song) (await import('./lagu.js')).songCard($('songBox'), { base: 'assets/', gid: GAME, color: `var(--y${meta.year || 3})` });
    return;
  }
  const id = Q.get(MODE), lv = levels[ids.indexOf(id)], nextId = ids[ids.indexOf(id) + 1];
  $('top').hidden = false;
  $('home').onclick = () => location.href = location.pathname;
  $('hub').onclick = () => location.href = '../../index.html';
  progress.last(id);
  $('pick').innerHTML = levels.map(l => `<option value="${l.id}">${l.id} · ${l.title}</option>`).join('');
  $('pick').value = id; $('pick').onchange = e => location.search = `?${MODE}=${e.target.value}`;
  if (nextId) $('next').onclick = () => location.search = `?${MODE}=${nextId}`;

  // camera behind the scene (play mode)
  let video = null;
  if (MODE === 'play') {
    video = Object.assign(document.createElement('video'), { id: 'camBg', autoplay: true, muted: true, playsInline: true });
    document.body.prepend(video); document.body.style.background = 'transparent';
    try { video.srcObject = await openCamera(1280, 720); }
    catch (e) { video.remove(); video = null; info('Kamera tidak dapat dibuka — guna tetikus/sentuhan. (' + e.message + ')', 20); }
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: !!video });
  renderer.setPixelRatio(devicePixelRatio); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  $('stage').append(renderer.domElement);
  const scene = new THREE.Scene(); if (!video) scene.background = skyTexture();  /* blocky sky; in play mode the camera is the background */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x886677, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(0.5, 2, 1); scene.add(sun);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.01, 50);

  // ---- helpers handed to the level
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  const aim = (x, y) => { v2.set(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1); ray.setFromCamera(v2, camera); return ray; };
  const S = {
    THREE, scene, camera, tween, wait, info, emojiSprite,
    evt: (type, oid, extra = {}) => { const i = GUIDE.t?.idx; GUIDE.event({ type, id: oid, ...extra }); if (GUIDE.t && GUIDE.t.idx !== i && !GUIDE.t.done) track('st', { ...where, i: GUIDE.t.idx, t: secs() }); },
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
    // the nearest (on screen) of `list` that passes ok(v): use this, never list.find(), to pick a drop target (obj maps an item to its 3D object)
    closest(list, x, y, ok = () => true, obj = v => v) {
      return list.filter(ok).map(v => { const s = S.screenOf(obj(v)); return [v, Math.hypot(s.x - x, s.y - y)]; }).sort((a, b) => a[1] - b[1])[0]?.[0];
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

  // analytics: where = this level, inp = taps per input kind, usage() = inputs + how well the camera saw the hand
  const where = { p: 'lvl', g: GAME, l: id, m: MODE }, t0 = performance.now(), secs = () => Math.round((performance.now() - t0) / 1000);
  const inp = { im: 0, it: 0, ih: 0 };
  const usage = () => { let st; try { st = tracker?.stats; } catch (e) { /* left before the tracker existed */ }
    const dur = st && (performance.now() - st.t0) / 1000;
    return { ...inp, c: MODE === 'preview' ? 'pv' : video ? 'ok' : 'no', wk: weakCam.on ? 1 : 0, r: video?.videoWidth ? `${video.videoWidth}x${video.videoHeight}` : '',
      det: st?.frames ? Math.round(st.hands / st.frames * 100) : '', fps: dur > 1 ? Math.round(st.frames / dur) : '' }; };
  track('v', where); track('ls', where); trackTaps(where);
  addEventListener('pointerdown', e => { if (e.isPrimary) inp[e.pointerType === 'mouse' ? 'im' : 'it']++; }, { capture: true });
  addEventListener('pagehide', () => { if (!window.levelDone) track('q', { ...where, i: GUIDE.t?.idx ?? 0, t: secs(), ...usage() }); });

  let level = null;
  const GUIDE = new GuidePanel($('guide'), steps, {
    onComplete: spec => {
      setTimeout(() => info(`🎉 <b>Tahniah! Tahap selesai.</b> ${spec.k}`, 12), 1500);
      for (let i = 0; i < 5; i++) setTimeout(() => S.star(new THREE.Vector3((i - 2) * 0.12, 0.2, 0)), i * 180);
      $('next').hidden = !nextId; window.levelDone = true; progress.done(id);
      track('ld', { ...where, t: secs(), ...usage() });
      setTimeout(() => { const w = $('win'); w.hidden = false;
        w.innerHTML = `<div class="wcard"><div class="wstars"><span>★</span><span>★</span><span>★</span></div><h2>Tahniah!</h2><p>${lv.id} · ${lv.title} selesai</p>
          <div class="wbtn">${nextId ? `<a class="btn green big" href="?${MODE}=${nextId}">Tahap seterusnya ▶</a>` : `<a class="btn green big" href="../../index.html">Unit selesai! Pilih unit lain</a>`}
          <a class="btn" href="?${MODE}=${id}">↻ Main semula</a><a class="btn" href="../../index.html">⌂ Semua permainan</a></div><button id="winX" aria-label="Tutup">✕</button></div>`;
        $('winX').onclick = () => { w.hidden = true; }; }, 2600);
    },
  });
  async function load() {
    if (level) scene.remove(level.root);
    level = await build(id, S); scene.add(level.root); fitView(); crisp();
    window.level = level; window.S = S;  /* test hook */
  }
  // frame everything the level built (hidden things too: they appear later), clear of the guide panel, top bar and info bar.
  // Tagging a mesh userData.nofit leaves it out (the table). Iterates: perspective makes the screen span ~ 1/distance.
  // cards, labels and drawn diagrams are flat pictures: keep their whites white (ACES tone mapping greys them). Re-run for things added later.
  const crisp = () => level.root.traverse(o => { const ms = [].concat(o.material || []); for (const m of ms) if ((m.isMeshBasicMaterial || m.isSpriteMaterial) && m.map && m.toneMapped) { m.toneMapped = false; m.needsUpdate = true; } });
  setInterval(() => level && crisp(), 500);
  let fitted = new THREE.Box3();
  function contentBox() {
    const box = new THREE.Box3(), tmp = new THREE.Box3();
    level.root.updateMatrixWorld(true);
    level.root.traverse(o => { if ((o.isMesh || o.isSprite || o.isPoints) && !o.userData.nofit && o.geometry) { o.geometry.computeBoundingBox?.(); tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); box.union(tmp); } });
    return box;
  }
  // things spawned later (a new cell, a result card) can land outside the first framing: widen the view (never shrink) when they do
  setInterval(() => { if (!level || holding || hHold) return; const b = contentBox(); if (!b.isEmpty() && !fitted.containsBox(b)) fitView(b.union(fitted)); }, 700);
  function fitView(extra) {
    camera.aspect = innerWidth / innerHeight; camera.clearViewOffset();
    const box = extra || contentBox(); fitted = box.clone().expandByScalar(0.02);
    if (box.isEmpty()) box.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(1.2, 0.2, 0.8));
    const g = $('guide'), off = !g.hidden && innerWidth > 700 ? g.getBoundingClientRect().right / 2 : 0;
    const topPx = ($('top').getBoundingClientRect().bottom || 0) + 8, botPx = innerHeight < 500 ? 40 : 64;  // info bar
    const availW = innerWidth - 2 * off - 16, availH = innerHeight - topPx - botPx;
    const c = box.getCenter(new THREE.Vector3()), el = THREE.MathUtils.degToRad(55), dir = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
    const corners = []; for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z));
    let dist = 2;
    for (let it = 0; it < 4; it++) {
      camera.position.copy(c).addScaledVector(dir, dist); camera.lookAt(c); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      let x0 = 1, x1 = -1, y0 = 1, y1 = -1; for (const k of corners) { const q = k.clone().project(camera); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
      const sx = (x1 - x0) / 2 * innerWidth / availW, sy = (y1 - y0) / 2 * innerHeight / availH;
      dist *= Math.max(sx, sy) * 1.02;
      if (it === 3) { /* shift so the content's screen centre sits in the middle of the free area (between top bar and info bar) */
        const midY = (y0 + y1) / 2, wantY = 1 - 2 * (topPx + availH / 2) / innerHeight; camera.position.copy(c).addScaledVector(dir, dist);
        const up = new THREE.Vector3(0, Math.cos(el), -Math.sin(el)); camera.position.addScaledVector(up, (midY - wantY) / 2 * 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)); camera.lookAt(camera.position.clone().addScaledVector(dir, -dist)); }
    }
    if (off) camera.setViewOffset(innerWidth, innerHeight, -off, 0, innerWidth, innerHeight);
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
    if (holding) { level.drop?.(e.clientX, e.clientY); if (!down.moved) level.tap?.(e.clientX, e.clientY); }  // a click on a draggable is still a tap
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
  // ☝️ point-and-hold also presses on-screen buttons (sound, next level, Tahniah! card, hub...): a button under the finger wins over the 3D scene.
  // #handChip is skipped so a hand can never switch the hands off.
  let hovered = null;
  const uiAt = (x, y) => { const el = document.elementFromPoint(x, y)?.closest('button, a[href], [data-hand]'); return el && el.id !== 'handChip' && !el.closest('[hidden]') ? el : null; };
  const hover = el => { if (el === hovered) return; hovered?.classList.remove('hand-hover'); hovered = el; el?.classList.add('hand-hover'); };
  const G = new Gestures({
    hit: sc((x, y) => { const el = uiAt(x, y); hover(el); return el || (level.hit?.(x, y) ?? null); }),
    tap: sc((x, y) => { inp.ih++; tap(x, y, { ...where, h: 1 }); const el = uiAt(x, y); if (el) { hover(null); el.click(); } else level.tap?.(x, y); }),
    grab: sc((x, y) => { inp.ih++; tap(x, y, { ...where, h: 1 }); hHold = !!level.pick?.(x, y); }),
    drag: sc((x, y) => { if (hHold) level.drag?.(x, y); }),
    drop: sc((x, y) => { if (hHold) level.drop?.(x, y); hHold = false; }),
    wind: () => level.wind?.(),
    reset: async () => { track('r', where); hHold = false; GUIDE.t.reset(); GUIDE.render(); await load(); info('✋ Tahap dimulakan semula.'); },
  });
  const useHands = !!video || Q.has('handsim');
  let tracker = null, lastVT = -1, lastLm = null, handsOn = true;
  const chip = $('handChip');
  if (!useHands) chip.hidden = true;
  else if (video) createHandTracker().then(t => { tracker = t; chip.textContent = '✋ Tangan: AKTIF'; })
    .catch(e => { chip.textContent = '✋ Tangan: gagal'; console.warn('hand tracker', e); });
  else chip.textContent = '✋ Tangan: simulasi';
  chip.onclick = () => { handsOn = !handsOn; chip.textContent = handsOn ? '✋ Tangan: AKTIF' : '✋ Tangan: MATI'; if (!handsOn) { G.lost = Infinity; feed(null, performance.now()); } };
  // weak cameras: a mode that accepts fainter hands (reloads: the tracker's confidence is fixed at creation) + choose a USB webcam
  if (video) {
    const wc = $('weakChip'); wc.hidden = false; wc.textContent = weakCam.on ? '📷 Kamera lemah ✓' : '📷 Kamera biasa';
    wc.onclick = () => { weakCam.set(!weakCam.on); location.reload(); };
    cameras().then(list => { if (list.length < 2) return; const cp = $('camPick'), cur = video.srcObject.getVideoTracks()[0]?.getSettings().deviceId;
      cp.innerHTML = list.map((d, i) => `<option value="${d.deviceId}">📷 ${d.label || 'Kamera ' + (i + 1)}</option>`).join(''); cp.value = cur; cp.hidden = false;
      cp.onchange = () => { pickCamera(cp.value); location.reload(); }; });
  }
  function feed(lm, now) {
    lastLm = handsOn ? lm : null;
    G.update(lastLm ? classify(lastLm, G.grabbing) : null, now / 1000);
    if (G.g !== "point") hover(null);
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
      lastVT = video.currentTime; feed(tracker.detect(video, now), now);
    }
    drawHands(); renderer.render(scene, camera);
  });
  window.gameReady = true;
}
