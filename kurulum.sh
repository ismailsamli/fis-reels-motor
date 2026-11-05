#!/bin/bash
# Gerekenler: Python 3, Node (npm), ffmpeg. Bir kere çalıştır.
set -e
cd "$(dirname "$0")"
pip install playwright numpy pillow fonttools
python3 -m playwright install chromium
mkdir -p fonts && cd fonts
npm pack @fontsource/manrope >/dev/null
for f in *.tgz; do d=${f%-*.tgz}; mkdir -p tmp && tar xzf "$f" -C tmp && rm -rf "${d#fontsource-}" && mv tmp/package "${d#fontsource-}" && rm -rf tmp "$f"; done
cd ..
python3 - <<'PY'
import numpy as np
from PIL import Image
rng = np.random.default_rng(3)
for i in range(4):
    n = rng.normal(128, 40, (960, 540)).clip(0, 255).astype(np.uint8)
    a = np.full_like(n, 30)
    Image.fromarray(np.dstack([n, n, n, a]), 'RGBA').resize((1080, 1920), Image.NEAREST).save(f'grain{i}.png')
PY
echo "Kurulum tamam."
