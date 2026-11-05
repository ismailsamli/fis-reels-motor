// Kasa Önü motion engine: deterministic seek(t) for frame-by-frame capture
const E = {};
E.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
E.p = (t, a, d) => E.clamp((t - a) / d);
E.oc = x => 1 - Math.pow(1 - x, 3);
E.ob = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
E.io = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
E.lerp = (a, b, x) => a + (b - a) * x;
E.$ = id => document.getElementById(id);

E.pop = (el, t, at, d = .42, from = .3, extra = '') => {
  const x = E.p(t, at, d);
  el.style.opacity = E.clamp(x * 4);
  el.style.transform = `${extra} scale(${E.lerp(from, 1, E.ob(x))})`;
};
E.rise = (el, t, at, d = .45, dy = 70, extra = '') => {
  const x = E.oc(E.p(t, at, d));
  el.style.opacity = x;
  el.style.transform = `${extra} translateY(${(1 - x) * dy}px)`;
};
E.slideX = (el, t, at, d = .5, dx = 400, extra = '') => {
  const x = E.ob(E.p(t, at, d));
  el.style.opacity = E.clamp(E.p(t, at, d) * 4);
  el.style.transform = `translateX(${(1 - x) * dx}px) ${extra}`;
};
E.draw = (path, t, at, d = .6) => {
  const x = E.io(E.p(t, at, d));
  path.setAttribute('pathLength', 1);
  path.style.strokeDasharray = '1 1';
  path.style.strokeDashoffset = 1 - x;
  path.style.opacity = x > 0 ? 1 : 0;
};
E.slam = (el, t, at, d = .26, rot = -7) => {
  const x = E.p(t, at, d);
  el.style.opacity = x > 0 ? 1 : 0;
  el.style.transform = `rotate(${rot}deg) scale(${E.lerp(2.6, 1, E.oc(x))})`;
};
E.count = (el, t, at, d, a, b, fmt) => { el.textContent = fmt(E.lerp(a, b, E.oc(E.p(t, at, d)))); };
E.wrapWords = el => {
  const walk = n => {
    [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.appendChild(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && !c.classList.contains('w')) walk(c);
    });
  };
  walk(el);
  return [...el.querySelectorAll('.w')];
};
E.popWords = (spans, t, at, gap = .11, d = .38) => spans.forEach((s, i) => E.pop(s, t, at + i * gap, d, .2));
E.swing = (el, t, at, amp = 14, extra = '') => {
  const k = Math.max(0, t - at);
  el.style.transform = `${extra} rotate(${amp * Math.exp(-k * 1.6) * Math.sin(k * 7)}deg)`;
};

// ---------------- marka ayarları (kendi hesabına göre değiştir) ----------------
const MARKA = window.MARKA || { ad: 'hesap adı', seri: 'BÖLÜM', sag: '@hesabin' };

// ---------------- chrome ----------------
const FPS = 30;
function setup(V) {
  document.body.innerHTML = `
  <div id="cam"><div id="paper">
    <div class="top"><span class="brand">${MARKA.ad}</span><span id="ctr"></span></div>
    <div id="track"><div id="prog"></div></div>
    <div class="chip">${MARKA.seri} ${V.no}</div>
    <div id="stage"></div>
    <div id="cap"></div>
    <div class="foot"><span>${V.cat}</span><span>${MARKA.sag}</span></div>
  </div></div><div id="grain"></div>`;
  const st = E.$('stage');
  V.scenes.forEach((sc, i) => {
    const d = document.createElement('div'); d.className = 'scene'; d.id = 'sc' + i; d.innerHTML = sc.html; st.appendChild(d);
    if (sc.init) sc.init(d);
  });
  V.T = V.T || V.scenes[V.scenes.length - 1].e;
  window.V = V;
}

let lastCap = -1;
function setCaption(t) {
  const caps = V.caps; let idx = -1;
  for (let i = 0; i < caps.length; i++) if (t >= caps[i][0] - .05) idx = i;
  const cap = E.$('cap');
  if (idx < 0) { cap.style.opacity = 0; return; }
  cap.style.opacity = 1;
  if (idx !== lastCap) {
    const [, , text, hl = []] = caps[idx];
    cap.innerHTML = text.split(' ').map(w => {
      const bare = w.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu, '');
      return `<span class="${hl.some(h => bare.startsWith(h)) ? 'hl' : ''}">${w}</span>`;
    }).join(' ');
    lastCap = idx;
  }
  const [s, e] = caps[idx];
  const spans = cap.querySelectorAll('span');
  const n = spans.length;
  spans.forEach((sp, k) => sp.classList.toggle('on', t >= s + (e - s) * .92 * k / n));
}

window.seek = function (t) {
  const fr = Math.round(t * FPS);
  // scenes
  let active = 0;
  V.scenes.forEach((sc, i) => {
    const el = E.$('sc' + i);
    const last = i === V.scenes.length - 1;
    if (t < sc.s - .05 || (!last && t > sc.e + .35)) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    if (t >= sc.s) active = i;
    const inX = E.oc(E.p(t, sc.s, .32));
    const outX = last ? 0 : E.io(E.p(t, sc.e, .3));
    el.style.opacity = inX * (1 - outX);
    el.style.transform = `translateY(${(1 - inX) * 60 - outX * 90}px)`;
    sc.upd(t, t - sc.s, E.$);
  });
  E.$('ctr').textContent = `${String(active + 1).padStart(2, '0')}/${String(V.scenes.length).padStart(2, '0')}`;
  E.$('prog').style.width = (100 * E.clamp(t / V.T)) + '%';
  setCaption(t);
  // camera
  let s = 1, dx = 0, dy = 0, rot = 0;
  (V.punch || []).forEach(p => { if (t >= p) s += .03 * Math.exp(-(t - p) * 5) * E.clamp((t - p) * 12); });
  (V.shake || []).forEach(p => {
    if (t >= p && t < p + .32) { const a = 8 * (1 - (t - p) / .32); dx += Math.sin(t * 95) * a; dy += Math.cos(t * 71) * a; rot += Math.sin(t * 60) * a * .05; }
  });
  const intro = E.oc(E.p(t, 0, .35));
  E.$('cam').style.transform = `translate(${dx}px,${dy + (1 - intro) * 40}px) scale(${s})`; E.$('cam').style.opacity = intro;
  E.$('grain').style.backgroundImage = `url(grain${fr % 4}.png)`;
};
