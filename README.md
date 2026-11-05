# Reels motoru

Kodla, kare kare hareketli (motion) dikey Reels videoları üretmek için küçük bir motor.
Her video bir **sahne dosyasıdır** (`sahneler/*.js`): metinler, animasyonlar, altyazılar ve ses efektleri burada tanımlanır.
Motor sahneyi tarayıcıda açar, her kareyi çeker, seslendirme ve ses efektleriyle birleştirip 1080×1920 MP4 üretir.

## Kurulum (bir kere)
Gerekenler: Python 3, Node.js (npm), ffmpeg.

```bash
./kurulum.sh
```

## Kullanım
```bash
# önizleme kareleri (cikti/ klasörüne PNG)
python3 render.py stills ornek 2.5 6.6 10

# seslendirmesiz video (süre sahnedeki T değerinden)
python3 render.py video ornek - cikti/ornek.mp4

# seslendirmeli video
python3 render.py video ornek ses/ornek.mp3 cikti/ornek.mp4
```

## Kendi hesabına uyarlama
- `marka.js` → üstteki hesap adı, seri adı, alttaki kullanıcı adı
- `engine.css` → `:root` içindeki renkler ve yazı tipi
- `sahneler/ornek.js` → kopyala, yeni video için düzenle

## Sahne dosyası nasıl çalışır?
- `scenes`: her sahnenin `s` (başlangıç) ve `e` (bitiş) saniyesi, `html` içeriği ve her karede çağrılan `upd(t)` fonksiyonu var.
- Hazır animasyonlar: `E.pop` (büyüyerek gel), `E.rise` (aşağıdan gel), `E.slideX` (yandan kay), `E.slam` (damga), `E.draw` (çizgi çizdir), `E.popWords` (kelime kelime).
- `caps`: altyazı satırları → `[başlangıç, bitiş, 'metin', ['vurgulu', 'kelimeler']]`
- `punch` / `shake`: kamera itme ve sarsıntı anları
- `sfx`: `[saniye, 'whoosh' | 'pop' | 'thud' | 'drop' | 'ticks' | 'scratch']` — sesler kodla üretilir, telif sorunu yok
- `cta`: video ortasında kısa "gönder / kaydet" etiketi (isteğe bağlı)

## Seslendirme ile senkron
Seslendirmedeki duraksamaları bulmak için:
```bash
ffmpeg -i ses/ornek.mp3 -af silencedetect=noise=-35dB:d=0.18 -f null - 2>&1 | grep silence_
```
Çıkan saniyeleri sahnelerin `s`/`e` değerlerine ve altyazılara yaz.

## Notlar
- İngilizce kelime ve kısaltmaları seslendirme metninde okunuşuyla yaz (MIT → "Emayti").
- Videoyu 35 saniyenin altında tut.
- Sponsorlu içerikte ilk karede "Reklam" etiketi olmalı (Ticaret Bakanlığı yönetmeliği).
