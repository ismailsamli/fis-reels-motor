// ÖRNEK SAHNE: "Çapa etkisi" — 3 sahne, ~11 sn, sessiz çalışır.
// Yeni video için bu dosyayı kopyala (ör. sahneler/b01.js), metinleri ve süreleri değiştir.
// s = sahnenin başladığı saniye, e = bittiği saniye. upd(t) her karede çağrılır.
// Hazır animasyonlar: E.pop, E.rise, E.slideX, E.slam (damga), E.draw (çizgi çizdirme), E.popWords (kelime kelime)
setup({
  no: '01', cat: 'FİYAT',
  T: 11,
  scenes: [
    { s: 0, e: 3.4, html: `
      <div id="a1" class="abs big" style="left:66px;top:30px;width:820px">Neden ilk gördüğün fiyat <span class="or">aklında kalır?</span></div>`,
      init(d) { this.w = E.wrapWords(d.querySelector('#a1')); },
      upd(t, lt, $) { E.popWords(this.w, t, .1, .14); } },
    { s: 3.5, e: 7.4, html: `
      <div id="b1" class="abs" style="left:66px;top:60px;font-weight:700;font-size:150px;color:var(--grey)">500 ₺</div>
      <svg class="abs" style="left:56px;top:120px;width:560px;height:60px" viewBox="0 0 560 60"><path id="b2" class="stroke" style="stroke-width:12" d="M4 40 C 180 20, 380 44, 556 14"/></svg>
      <div id="b3" class="abs" style="left:66px;top:300px;font-weight:700;font-size:190px;color:var(--or)">299 ₺</div>
      <div id="b4" class="abs ctr" style="top:620px"><span class="stamp" style="font-size:64px;padding:14px 30px">ÇAPA ETKİSİ</span></div>`,
      upd(t, lt, $) {
        E.rise($('b1'), t, 3.55, .4, 40);
        E.draw($('b2'), t, 4.4, .4);
        E.pop($('b3'), t, 4.9, .45, .3); $('b3').style.transformOrigin = '0 50%';
        E.slam($('b4'), t, 6.0, .26, -4);
      } },
    { s: 7.5, e: 11, html: `
      <div id="c1" class="abs big" style="left:66px;top:60px;width:820px">Sen hangisine <span class="or">baktın?</span></div>
      <div id="c2" class="abs ctr" style="top:520px"><span class="tag" style="font-size:40px;background:var(--or);padding:12px 26px">YORUMA YAZ ↓</span></div>`,
      init(d) { this.w = E.wrapWords(d.querySelector('#c1')); },
      upd(t, lt, $) { E.popWords(this.w, t, 7.55, .14); E.pop($('c2'), t, 8.8, .4, .4); } },
  ],
  // altyazı: [başlangıç sn, bitiş sn, metin, [turuncu/vurgu kelimeler]]
  caps: [
    [0, 3.3, 'Neden ilk gördüğün fiyat aklında kalır?', ['aklında']],
    [3.5, 6.0, 'Önce büyük rakamı görürsün, sonra indirim ucuz gelir.', ['ucuz']],
    [6.0, 7.4, 'Buna çapa etkisi deniyor.', ['çapa', 'etkisi']],
    [7.5, 11, 'Sen hangisine baktın?'],
  ],
  punch: [4.9, 6.0],          // kamera itme anları
  shake: [6.0],               // damga sarsıntısı
  sfx: [[.1, 'whoosh'], [3.5, 'whoosh'], [4.4, 'scratch'], [4.9, 'pop'], [6.0, 'thud'], [7.5, 'whoosh'], [8.8, 'pop']],
  // ara çağrı (isteğe bağlı): ekranda kısa "gönder" etiketi + gönder düğmesine ok
  cta: [{ t: 6.4, kind: 'send', text: 'BİRİNE GÖNDER', dur: 1.9 }],
});
