// Mid-video CTA layer: sits above the camera so it doesn't wobble with the receipt.
// V.cta = [{t, kind:'send'|'save', text}], V.mockUI = true draws a generic Reels rail (preview only)
(function () {
  const SEND_TARGET = { x: 1008, y: 1548 };   // approx. send (paper plane) icon on a 1080x1920 Reel
  const css = `
  #ctaL{position:absolute;inset:0;pointer-events:none}
  .ctaS{position:absolute;display:flex;align-items:center;gap:16px;background:#16191d;color:#eef1f2;
    font-family:"Manrope";font-weight:800;font-size:28px;letter-spacing:1px;border-radius:12px;padding:10px 18px;border:0;border-left:6px solid #2f6bff;
    gap:12px;transform-origin:0% 50%}
  .ctaS svg{width:34px;height:30px}
  #ctaArrow{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible}
  #ctaRing{position:absolute;width:120px;height:120px;border-radius:50%;border:7px solid #2f6bff;margin:-60px 0 0 -60px}
  #mock{position:absolute;inset:0}
  #mock .ic{position:absolute;left:978px;width:62px;height:62px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
  #mock .n{position:absolute;left:968px;width:82px;text-align:center;color:#fff;font:600 22px system-ui;text-shadow:0 1px 3px rgba(0,0,0,.7)}
  #mock .lbl{position:absolute;left:24px;top:24px;font:700 22px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border-radius:6px}
  #mock .usr{position:absolute;left:40px;top:1680px;color:#fff;font:700 30px system-ui;text-shadow:0 1px 3px rgba(0,0,0,.8)}
  #mock .cap{position:absolute;left:40px;top:1730px;width:780px;color:#fff;font:400 26px system-ui;text-shadow:0 1px 3px rgba(0,0,0,.8)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const PLANE = c => `<svg viewBox="0 0 60 54"><path d="M4 26 L56 4 L40 50 L28 32 Z M28 32 L56 4" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const BOOK = c => `<svg viewBox="0 0 48 54"><path d="M8 4 H40 V50 L24 38 L8 50 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/></svg>`;

  window.installCTA = function () {
    const L = document.createElement('div'); L.id = 'ctaL';
    document.body.insertBefore(L, document.getElementById('grain'));
    if (V.mockUI) {
      const W = '#ffffff';
      const icons = [
        [1180, `<path d="M31 54 C 8 38, 2 26, 6 16 C 10 6, 24 4, 31 14 C 38 4, 52 6, 56 16 C 60 26, 54 38, 31 54 Z" fill="none" stroke="${W}" stroke-width="5"/>`, '1.204'],
        [1310, `<path d="M31 6 C 14 6, 4 17, 4 30 C 4 36, 6 41, 10 45 L 6 56 L 19 52 C 23 54, 27 55, 31 55 C 48 55, 58 44, 58 30 C 58 17, 48 6, 31 6 Z" fill="none" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>`, '38'],
        [1430, `<path d="M10 24 V18 H48 M40 10 L48 18 L40 26 M52 38 V44 H14 M22 52 L14 44 L22 36" fill="none" stroke="${W}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`, '12'],
        [1548, `<path d="M4 28 L58 6 L42 56 L30 34 Z M30 34 L58 6" fill="none" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>`, '64'],
        [1668, `<circle cx="14" cy="31" r="4" fill="${W}"/><circle cx="31" cy="31" r="4" fill="${W}"/><circle cx="48" cy="31" r="4" fill="${W}"/>`, ''],
      ];
      L.innerHTML += `<div id="mock"><div class="lbl">ÖNİZLEME · TEMSİLİ INSTAGRAM ARAYÜZÜ (videoda yok)</div>
        ${icons.map(([y, p, n]) => `<svg class="ic" style="top:${y - 31}px" viewBox="0 0 62 62">${p}</svg>${n ? `<div class="n" style="top:${y + 36}px">${n}</div>` : ''}`).join('')}
        <div class="usr">hesabin · Takip et</div><div class="cap">örnek açıklama metni ...</div></div>`;
    }
    (V.cta || []).forEach((c, i) => {
      const s = document.createElement('div'); s.className = 'ctaS'; s.id = 'ctaS' + i;
      s.innerHTML = (c.kind === 'send' ? PLANE('#2f6bff') : BOOK('#2f6bff')) + `<span>${c.text}</span>`;
      s.style.left = '136px'; s.style.top = '1494px'; s.style.transformOrigin = '0% 50%';
      L.appendChild(s);
      if (c.kind === 'send') {
        L.insertAdjacentHTML('beforeend', `<svg id="ctaArrow${i}" class="ctaArr" style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible">
          <path id="ctaP${i}" fill="none" stroke="#2f6bff" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 1"/>
          <path id="ctaH${i}" fill="none" stroke="#2f6bff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div id="ctaR${i}" style="position:absolute;left:${SEND_TARGET.x}px;top:${SEND_TARGET.y}px;width:96px;height:96px;border-radius:50%;border:4px solid #2f6bff;margin:-48px 0 0 -48px"></div>`);
      }
    });
    const base = window.seek;
    window.seek = function (t) {
      base(t);
      (V.cta || []).forEach((c, i) => {
        const dur = c.dur || 1.9, k = t - c.t;
        const s = document.getElementById('ctaS' + i);
        const out = E.io(E.p(t, c.t + dur, .3));
        const vis = k >= 0 && t < c.t + dur + .3;
        s.style.display = vis ? 'flex' : 'none';
        if (!vis) { ['ctaArrow', 'ctaR'].forEach(p => { const e = document.getElementById(p + i); if (e) e.style.opacity = 0; }); return; }
        const pin = E.ob(E.p(t, c.t, .4));
        const wob = 0;
        s.style.opacity = E.clamp(E.p(t, c.t, .1) * 1) * (1 - out);
        s.style.transform = `translateX(${(1 - E.oc(E.p(t, c.t, .35))) * -40}px) rotate(-1.5deg)`;
        if (c.kind === 'send') {
          const P = document.getElementById('ctaP' + i);
          if (!P.getAttribute('d')) {
            const sx = s.offsetLeft + s.offsetWidth + 18, sy = s.offsetTop + 10;
            const ex = SEND_TARGET.x - 62, ey = SEND_TARGET.y - 4;
            P.setAttribute('d', `M${sx} ${sy} C ${sx + 90} ${sy - 110}, ${ex - 40} ${ey - 130}, ${ex} ${ey}`);
            const ang = Math.atan2(130, 40), L = 34;
            const h1 = [ex - L * Math.cos(ang - .5), ey - L * Math.sin(ang - .5)], h2 = [ex - L * Math.cos(ang + .5), ey - L * Math.sin(ang + .5)];
            document.getElementById('ctaH' + i).setAttribute('d', `M${h1[0]} ${h1[1]} L${ex} ${ey} L${h2[0]} ${h2[1]}`);
          }
          const a = document.getElementById('ctaArrow' + i); a.style.opacity = 1 - out;
          E.draw(document.getElementById('ctaP' + i), t, c.t + .35, .45);
          E.draw(document.getElementById('ctaH' + i), t, c.t + .75, .15);
          const r = document.getElementById('ctaR' + i);
          const rk = Math.max(0, t - (c.t + .85));
          const ph = Math.min(rk * 1.1, 1.999) % 1;
          r.style.opacity = t > c.t + .85 ? (1 - ph) * .7 * (1 - out) : 0;
          r.style.transform = `scale(${.6 + ph * .9})`;
        }
      });
    };
  };
})();
