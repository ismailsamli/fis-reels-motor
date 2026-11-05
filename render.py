import json, subprocess, sys, wave
from pathlib import Path
import numpy as np
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
FPS = 30
SR = 44100


def page_html(vid):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="engine.css"></head><body>
<script src="marka.js"></script><script src="engine.js"></script><script src="cta.js"></script><script src="sahneler/{vid}.js"></script>
<script>if (V.cta && V.cta.length) installCTA();</script></body></html>"""


def open_page(p, vid):
    html = ROOT / f"_{vid}.html"
    html.write_text(page_html(vid), encoding="utf-8")
    b = p.chromium.launch(args=["--disable-gpu"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    pg.goto(html.as_uri())
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(400)
    return b, pg


def stills(vid, times):
    with sync_playwright() as p:
        b, pg = open_page(p, vid)
        for t in times:
            pg.evaluate(f"seek({t})")
            pg.screenshot(path=str(ROOT / "cikti" / f"kare_{vid}_{t:05.2f}.png"))
        b.close()


# ---------------- sfx ----------------
def env(n, a=0.005, r=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def synth(kind):
    rng = np.random.default_rng(len(kind))
    if kind == "pop":
        n = int(.09 * SR); t = np.arange(n) / SR
        f = 500 + 900 * t / t[-1]
        return .5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .03)
    if kind == "drop":
        n = int(.18 * SR); t = np.arange(n) / SR
        f = 520 - 380 * t / t[-1]
        return .6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .05)
    if kind == "thud":
        n = int(.35 * SR); t = np.arange(n) / SR
        s = np.sin(2 * np.pi * 62 * t) * env(n, .002, .12) + .35 * rng.normal(0, 1, n) * env(n, .001, .02)
        return .9 * s
    if kind == "whoosh":
        n = int(.38 * SR); noise = rng.normal(0, 1, n)
        k = np.ones(40) / 40; noise = np.convolve(noise, k, "same")
        w = np.sin(np.pi * np.arange(n) / n) ** 2
        return .9 * noise * w
    if kind == "scratch":
        n = int(.35 * SR); noise = rng.normal(0, 1, n)
        noise = np.diff(np.concatenate([[0], noise]))
        return .12 * noise * np.sin(np.pi * np.arange(n) / n)
    if kind == "ticks":
        out = np.zeros(int(.9 * SR))
        for i in range(9):
            st = int(i * .09 * SR * (1 + i * .04))
            if st + 600 > len(out): break
            c = np.sin(2 * np.pi * 2400 * np.arange(600) / SR) * env(600, .0005, .006)
            out[st:st + 600] += .35 * c
        return out
    raise ValueError(kind)


def sfx_track(events, dur, path):
    buf = np.zeros(int((dur + 1) * SR))
    for t, k in events:
        s = synth(k); i = int(t * SR)
        buf[i:i + len(s)] += s[: len(buf) - i]
    buf = np.clip(buf, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())


def render(vid, voice, out):
    """voice: mp3 yolu ya da '-' (sessiz, süre sahnedeki V.T'den alınır)."""
    with sync_playwright() as p:
        b, pg = open_page(p, vid)
        if voice != "-":
            dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice]))
        else:
            dur = float(pg.evaluate("V.T"))
        total = dur + 0.6
        n = int(total * FPS)
        silent = ROOT / f"_{vid}_silent.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                               "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", str(silent)], stdin=subprocess.PIPE)
        events = pg.evaluate("V.sfx || []")
        for f in range(n):
            pg.evaluate(f"seek({f / FPS})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
            if f % 150 == 0: print(vid, f, "/", n, flush=True)
        b.close()
    ff.stdin.close(); ff.wait()
    sfx = ROOT / f"_{vid}_sfx.wav"
    sfx_track(events, total, sfx)
    if voice != "-":
        inputs = ["-i", str(silent), "-i", voice, "-i", str(sfx)]
        fc = "[1:a]volume=1.0,apad[v];[2:a]volume=0.32[s];[v][s]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]"
    else:
        inputs = ["-i", str(silent), "-i", str(sfx)]
        fc = "[1:a]volume=0.5,alimiter=limit=0.95[a]"
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", fc,
                           "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-b:v", "6M", "-maxrate", "8M",
                           "-bufsize", "12M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
    print("bitti", out)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "stills":
        stills(sys.argv[2], [float(x) for x in sys.argv[3:]])
    else:
        render(sys.argv[2], sys.argv[3], sys.argv[4])
