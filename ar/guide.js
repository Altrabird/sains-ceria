// Guided steps ("Arahan") for each amali. Steps tick themselves off when the game emits a matching event.
// StepTracker is pure (tested by ar/guide.test.mjs); GuidePanel is the on-screen card + read-aloud.

export class StepTracker {
  constructor(spec) { this.spec = spec; this.reset(); }
  reset() { this.idx = 0; this.seen = new Set(); }
  get done() { return this.idx >= this.spec.steps.length; }
  get need() { return this.done ? 0 : this.spec.steps[this.idx].count || 1; }
  matches(step, e) {
    const on = [].concat(step.on);
    if (!on.includes(e.type)) return false;
    if (step.ids && !step.ids.includes(e.id)) return false;
    return Object.entries(step.match || {}).every(([k, v]) => e[k] === v);
  }
  // returns true when this event completed the current step
  event(e) {
    if (this.done || !this.matches(this.spec.steps[this.idx], e)) return false;
    this.seen.add(e.id ?? e.type);
    if (this.seen.size < this.need) return false;
    this.idx++; this.seen = new Set();
    return true;
  }
}

// ---- browser only
function speak(text) {
  const ss = globalThis.speechSynthesis; if (!ss) return;
  ss.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[☝️🤏👋✋❓🎉]/gu, ''));
  const v = ss.getVoices();
  u.voice = v.find(x => /^ms/i.test(x.lang)) || v.find(x => /^id/i.test(x.lang)) || null;  // Malay, else Indonesian
  u.lang = u.voice?.lang || 'ms-MY'; u.rate = 0.9;
  ss.speak(u);
}

export class GuidePanel {
  constructor(el, allSpecs, { onComplete } = {}) {
    this.el = el; this.all = allSpecs; this.onComplete = onComplete; this.am = null;
    this.collapsed = innerWidth < 600;
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'toggle') { this.collapsed = !this.collapsed; this.render(); }
      if (b.dataset.act === 'speak') speak(this.currentText());
      if (b.dataset.act === 'restart') { this.t.reset(); this.render(); }
    });
  }
  load(am, title) {
    if (am === this.am || !this.all[am]) return;
    this.am = am; this.title = title; this.t = new StepTracker(this.all[am]);
    this.el.hidden = false; this.render();
  }
  currentText() {
    const s = this.all[this.am];
    return this.t.done ? 'Kesimpulan: ' + s.k : `Langkah ${this.t.idx + 1}. ${s.steps[this.t.idx].t}`;
  }
  event(e) {
    if (!this.t || !this.t.event(e)) { if (this.t && !this.t.done && this.t.seen.size) this.render(); return; }
    this.render();
    this.el.classList.remove('pop'); void this.el.offsetWidth; this.el.classList.add('pop');
    if (this.t.done) this.onComplete?.(this.all[this.am]);
  }
  render() {
    const s = this.all[this.am], t = this.t, n = s.steps.length;
    const li = s.steps.map((st, i) => {
      const cls = i < t.idx ? 'done' : i === t.idx ? 'cur' : 'todo';
      if (this.collapsed && cls !== 'cur') return '';
      const prog = cls === 'cur' && t.need > 1 ? ` <small>(${t.seen.size}/${t.need})</small>` : '';
      return `<li class="${cls}"><span class="g">${i < t.idx ? '✅' : st.g}</span><span>${st.t}${prog}</span></li>`;
    }).join('');
    this.el.innerHTML = `
      <header><b>📋 ${this.am} · ${this.title}</b><span class="prog">${Math.min(t.idx, n)}/${n}</span>
        <button data-act="speak" title="Baca kuat">🔊</button><button data-act="toggle" title="Kecil/besar">${this.collapsed ? '▸' : '▾'}</button></header>
      ${this.collapsed ? '' : `<p class="q">❓ ${s.q}</p>`}
      <div class="bar"><i style="width:${Math.min(t.idx, n) / n * 100}%"></i></div>
      <ol>${li}</ol>
      ${t.done ? `<div class="k">🎉 <b>Tahniah!</b> Kesimpulan: ${s.k}</div><button data-act="restart">↺ Ulang langkah</button>` : ''}`;
  }
}
