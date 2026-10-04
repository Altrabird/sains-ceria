// Unit songs ("Lagu Sains"): a song card (play / seek / lyrics / sing-along) used by a game's menu page and by lagu.html.
// Songs live at games/<id>/assets/lagu.mp3 + lagu.json {title, style, lyrics}; games.json "song" = title when one exists
// (tools/songs/make_song.py makes them). One song plays at a time. Buttons are plain <button>s, so ☝️ hands press them too.
import { track } from './track.js';

const STYLE = { tadika: 'Tadika', pop: 'Pop', dikir: 'Dikir', zapin: 'Zapin', nasyid: 'Nasyid', joget: 'Joget' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mmss = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
let playing = null;  // the <audio> currently playing, page-wide

// "[Verse 1]\n...\n\n[Chorus]\n..." -> sections; Chorus shown as "Korus", Verse n as "Rangkap n"
export function sections(text) {
  return text.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split('\n'), m = lines[0].match(/^\[(.+)\]$/);
    const tag = m ? m[1] : '', body = m ? lines.slice(1) : lines;
    const label = tag === 'Chorus' ? 'Korus' : tag.replace('Verse', 'Rangkap').replace('Bridge', 'Jambatan').replace('Outro', 'Penutup').replace('Intro', 'Pembuka');
    return { chorus: tag === 'Chorus', label, lines: body };
  });
}
export const lyricsHTML = text => sections(text).map(s =>
  `<div class="ls${s.chorus ? ' chorus' : ''}"><span class="lt">${esc(s.label)}</span>${s.lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>`).join('');

// base = folder holding lagu.mp3 + lagu.json (e.g. 'assets/' in a game, 'games/<id>/assets/' on lagu.html)
export async function songCard(el, { base, gid, color = 'var(--blue)', sub = '', compact = false, onEnded } = {}) {
  let meta = {};
  try { meta = await (await fetch(base + 'lagu.json')).json(); } catch (e) { el.remove(); return null; }
  const audio = new Audio(); audio.preload = 'none'; audio.src = base + 'lagu.mp3';
  el.classList.add('song'); if (compact) el.classList.add('compact'); el.style.setProperty('--c', color);
  el.innerHTML = `<div class="srow">
      <button class="splay" aria-label="Main lagu ${esc(meta.title)}"><span class="ip">▶</span></button>
      <div class="sinfo"><span class="spill">🎵 ${esc(sub || 'Lagu unit')}${meta.style ? ' · ' + (STYLE[meta.style] || meta.style) : ''}</span>
        <b class="stitle">${esc(meta.title)}</b>
        <div class="sbar" aria-label="Kedudukan lagu"><i></i></div><span class="stime">0:00</span></div>
      <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="sacts"><button class="btn slyr" aria-expanded="false">📜 Lirik</button><button class="btn ssing">🎤 Mod nyanyi</button></div>
    <div class="slyrics" hidden>${lyricsHTML(meta.lyrics || '')}</div>`;
  const $ = s => el.querySelector(s), bar = $('.sbar i');
  let tracked = false;
  const sync = () => {
    const on = !audio.paused; el.classList.toggle('on', on); $('.ip').textContent = on ? '❚❚' : '▶';
    $('.splay').setAttribute('aria-label', (on ? 'Jeda lagu ' : 'Main lagu ') + meta.title);
  };
  const tick = () => { bar.style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + '%';
    $('.stime').textContent = `${mmss(audio.currentTime)} / ${mmss(audio.duration)}`; };
  const play = () => {
    if (playing && playing !== audio) playing.pause();
    playing = audio; audio.play().catch(() => {});
    if (!tracked) { tracked = true; track('s', { g: gid, p: compact ? 'lagu' : 'menu' }); }
  };
  $('.splay').onclick = () => audio.paused ? play() : audio.pause();
  $('.sbar').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); const go = () => { audio.currentTime = Math.max(0, (e.clientX - r.left) / r.width) * audio.duration; };
    if (audio.duration) go(); else { audio.addEventListener('loadedmetadata', go, { once: true }); audio.load(); } play(); };
  $('.slyr').onclick = () => { const l = $('.slyrics'); l.hidden = !l.hidden; $('.slyr').setAttribute('aria-expanded', String(!l.hidden)); };
  $('.ssing').onclick = () => singAlong({ meta, audio, play, color });
  audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
  audio.addEventListener('timeupdate', tick); audio.addEventListener('loadedmetadata', tick);
  audio.addEventListener('ended', () => { sync(); onEnded?.(); });
  return { audio, play, meta };
}

// full-screen sing-along: big lyrics that scroll with the song (proportional to playback time — a guide, not word-exact)
function singAlong({ meta, audio, play, color }) {
  document.getElementById('singAlong')?.remove();
  const o = document.createElement('div'); o.id = 'singAlong'; o.style.setProperty('--c', color);
  o.innerHTML = `<div class="notes" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i><i>♬</i><i>♫</i><i>♪</i></div>
    <header><b>🎤 ${esc(meta.title)}</b><button class="splay big" aria-label="Main atau jeda"><span class="ip">▶</span></button><button class="sx" aria-label="Tutup">✕</button></header>
    <div class="sscroll"><div class="pad"></div>${lyricsHTML(meta.lyrics || '')}<div class="pad"></div></div><div class="sbar"><i></i></div>`;
  document.body.append(o);
  const sc = o.querySelector('.sscroll'), ip = o.querySelector('.ip'), bar = o.querySelector('.sbar i');
  const sync = () => { ip.textContent = audio.paused ? '▶' : '❚❚'; };
  let raf = 0;
  const follow = () => {  // ease toward the proportional position; the pupil can still scroll by hand while paused
    if (!audio.paused && audio.duration) {
      const want = audio.currentTime / audio.duration * (sc.scrollHeight - sc.clientHeight);
      sc.scrollTop += (want - sc.scrollTop) * 0.08;
    }
    bar.style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + '%';
    raf = requestAnimationFrame(follow);
  };
  o.querySelector('.splay').onclick = () => audio.paused ? play() : audio.pause();
  const close = () => { cancelAnimationFrame(raf); audio.removeEventListener('play', sync); audio.removeEventListener('pause', sync); o.remove(); removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); };
  o.querySelector('.sx').onclick = close; addEventListener('keydown', key);
  audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
  sync(); follow(); if (audio.paused) play();
}
