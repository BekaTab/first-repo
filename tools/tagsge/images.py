"""tags.ge product image pipeline.
  python3 images.py prep  -> load/crop/mask every source, write src/<key>.png and upscale_queue.json
  python images.py up     -> (venv311) Real-ESRGAN x4 for the queued sources, writes up/<key>.png (resumable)
  python3 images.py out   -> normalise and export WebP files into the site, write images.json manifest
"""
import json, os, re, sys, hashlib
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SCR = os.path.dirname(HERE)
CAT = os.path.join(SCR, 'cat')
WEB = os.path.join(SCR, 'web')
SRC = os.path.join(HERE, 'img_src'); UP = os.path.join(HERE, 'img_up')
SITE_IMG = '/home/user/first-repo/tagsge/img/p'
K = 1800 / 1404            # RFID page raster scale vs the coordinates used in catalog.py
UPSCALE_BELOW = 560        # long side in px; smaller sources go through Real-ESRGAN
L = (720, 540); S = (160, 120)
BLEACH = {'c:028-155': 234}   # pink haze in the catalogue photo
CLEAN = {'w:shop-anti-theft-alarm-system-rs1601': [(483, 482, 527, 494)]}   # tiny caption next to the antenna base

def key(spec):
    return hashlib.sha1(spec.encode()).hexdigest()[:12]

def all_specs():
    d = json.load(open(os.path.join(HERE, 'catalog.json')))
    order, seen = [], set()
    def add(s):
        if s and s not in seen:
            seen.add(s); order.append(s)
    for f in d['families']:            # card images first, so they are upscaled first
        add(f['hero'])
    for f in d['families']:
        for g in f['gallery']: add(g)
        for r in f['rows']: add(r['img'])
    return order

def load(spec):
    base = spec.split('|')[0]
    kind, rest = base.split(':', 1)
    if kind == 'c':
        mask = rest.endswith('+m')
        ident = rest[:-2] if mask else rest
        p, n = ident.split('-')
        im = Image.open(os.path.join(CAT, 'eas', f'e-{p}-{n}.png'))
        im = im.convert('RGB')
        if mask:
            m = Image.open(os.path.join(CAT, 'eas', f'e-{p}-{int(n) + 1:03d}.png')).convert('L')
            if m.size != im.size: m = m.resize(im.size, Image.LANCZOS)
            im.putalpha(m)
        return im
    if kind == 'w':
        og = json.load(open(os.path.join(WEB, 'og.json')))
        im = Image.open(os.path.join(WEB, og[rest]))
        return im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') else im.convert('RGB')
    if kind == 'r':
        page, box = rest.split(':')
        page = int(page)
        x0, y0, x1, y1 = [round(int(v) * K) for v in box.split(',')]
        im = Image.open(os.path.join(CAT, 'rfid', f'r-{page:03d}-{page - 1:03d}.png')).convert('RGB')
        return im.crop((x0, y0, x1, y1))
    raise ValueError(spec)

def on_white(im):
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3]); return bg
    return im.convert('RGB')

def whiten(im):
    """Lift a near-white studio background to pure white without touching the product."""
    w, h = im.size
    px = im.load()
    border = [px[x, 0] for x in range(0, w, max(1, w // 40))] + [px[x, h - 1] for x in range(0, w, max(1, w // 40))] + \
             [px[0, y] for y in range(0, h, max(1, h // 40))] + [px[w - 1, y] for y in range(0, h, max(1, h // 40))]
    lum = sorted(sum(p) / 3 for p in border)
    bgv = lum[len(lum) // 2]
    if bgv < 200:            # not a light background: leave it alone
        return im, False
    wp = max(200.0, min(254.0, bgv - 2))
    lut = [min(255, round(i * 255.0 / wp)) for i in range(256)]
    im = im.point(lut * 3)
    return im, True

def trim(im, thresh=242, pad=0.04):
    g = im.convert('L').point(lambda v: 255 if v < thresh else 0)
    g = g.filter(ImageFilter.MaxFilter(5))
    bb = g.getbbox()
    if not bb: return im
    x0, y0, x1, y1 = bb
    mx, my = round((x1 - x0) * pad), round((y1 - y0) * pad)
    return im.crop((max(0, x0 - mx), max(0, y0 - my), min(im.width, x1 + mx), min(im.height, y1 + my)))

def product_canvas(im, size, fill=(0.86, 0.82)):
    W, H = size
    im = im.copy()
    s = min(W * fill[0] / im.width, H * fill[1] / im.height)
    nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    c = Image.new('RGB', size, (255, 255, 255))
    c.paste(im, ((W - nw) // 2, (H - nh) // 2))
    return c

def photo_canvas(im, size):
    return ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.5))

def cmd_prep():
    os.makedirs(SRC, exist_ok=True)
    queue, info = [], {}
    for spec in all_specs():
        k = key(spec)
        im = load(spec)
        photo = spec.endswith('|photo')
        if not photo:
            im = on_white(im)
            if spec.startswith('r:'):
                im, _ = whiten(im); im = trim(im, pad=0.03)
        im = on_white(im) if im.mode == 'RGBA' else im
        im.save(os.path.join(SRC, k + '.png'))
        need = max(im.size) < UPSCALE_BELOW
        if need: queue.append(k)
        info[spec] = {'key': k, 'size': im.size, 'upscale': need}
    json.dump(queue, open(os.path.join(HERE, 'upscale_queue.json'), 'w'))
    json.dump(info, open(os.path.join(HERE, 'img_info.json'), 'w'), indent=1)
    print(len(info), 'sources,', len(queue), 'queued for Real-ESRGAN')

def cmd_up1():
    """Upscale one source (run in its own process: Real-ESRGAN's CPU memory is only freed on exit)."""
    sys.path.insert(0, os.path.join(sys.prefix, 'lib/python3.11/site-packages/realesrgan_ncnn_py'))
    from realesrgan_ncnn_py import Realesrgan
    k = sys.argv[2]
    out = os.path.join(UP, k + '.png')
    src = Image.open(os.path.join(SRC, k + '.png')).convert('RGB')
    res = Realesrgan(gpuid=-1, model=4, tilesize=200).process_pil(src)
    tmp = f'{out}.{os.getpid()}.tmp.png'
    res.save(tmp); os.replace(tmp, out)

def cmd_up():
    """Run up to N single-image processes at a time (one per core, limited by memory); retry failures once."""
    import subprocess, time
    os.makedirs(UP, exist_ok=True)
    for f in os.listdir(UP):
        if f.endswith('.tmp.png'): os.remove(os.path.join(UP, f))
    queue = json.load(open(os.path.join(HERE, 'upscale_queue.json')))
    todo = [k for k in queue if not os.path.exists(os.path.join(UP, k + '.png'))]
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    print(f'{len(queue) - len(todo)} done, {len(todo)} to go, {n} at a time', flush=True)
    tries, running, done = {}, {}, 0
    while todo or running:
        while todo and len(running) < n:
            k = todo.pop(0); tries[k] = tries.get(k, 0) + 1
            running[k] = (subprocess.Popen([sys.executable, __file__, 'up1', k], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL), time.time())
        time.sleep(0.5)
        for k, (pr, t0) in list(running.items()):
            if pr.poll() is None: continue
            del running[k]
            ok = pr.returncode == 0 and os.path.exists(os.path.join(UP, k + '.png'))
            if ok: done += 1
            elif tries[k] < 2: todo.append(k)
            print(f'{"ok  " if ok else "FAIL"} {k} rc={pr.returncode} {time.time() - t0:.0f}s  [{done} new]', flush=True)
    missing = [k for k in queue if not os.path.exists(os.path.join(UP, k + '.png'))]
    print('UPSCALE DONE', len(missing), 'missing', flush=True)

def slug(s):
    s = s.lower().replace(' ', '-')
    return re.sub(r'[^a-z0-9\-]', '', s) or 'x'

def cmd_out():
    d = json.load(open(os.path.join(HERE, 'catalog.json')))
    info = json.load(open(os.path.join(HERE, 'img_info.json')))
    os.makedirs(SITE_IMG, exist_ok=True)
    names, manifest, used = {}, {}, set()
    def uniq(base):
        n, i = base, 2
        while n in used:
            n = f'{base}-{i}'; i += 1
        used.add(n); return n
    for f in d['families']:          # readable, unique file names
        if f['hero'] not in names: names[f['hero']] = uniq(f['id'])
    for f in d['families']:
        for i, r in enumerate(f['rows']):
            if r['img'] and r['img'] not in names:
                sl = slug(r['m'])
                names[r['img']] = uniq(f"{f['id']}-{sl if sl != 'x' else 'v' + str(i + 1)}")
        for i, g in enumerate(f['gallery']):
            if g not in names: names[g] = uniq(f"{f['id']}-{i + 1}")
    for x in os.listdir(SITE_IMG):   # the folder is generated: drop files from earlier runs
        if x.endswith('.webp'): os.remove(os.path.join(SITE_IMG, x))
    missing = []
    for spec, name in names.items():
        k = info[spec]['key']
        up = os.path.join(UP, k + '.png')
        src = up if os.path.exists(up) else os.path.join(SRC, k + '.png')
        if info[spec]['upscale'] and not os.path.exists(up): missing.append(spec)
        im = Image.open(src).convert('RGB')
        if spec.endswith('|photo'):
            big, small = photo_canvas(im, L), photo_canvas(im, S)
        else:
            im, _ = whiten(im)
            if spec in BLEACH:         # faint coloured haze around the product -> white
                t = BLEACH[spec]
                r, g, b = im.split()
                from PIL import ImageChops
                mn = ImageChops.darker(ImageChops.darker(r, g), b)
                mask = mn.point(lambda v: 255 if v >= t else 0)
                im = Image.composite(Image.new('RGB', im.size, (255, 255, 255)), im, mask)
            im = trim(im)
            if spec in CLEAN:          # paint out small source captions (boxes in 720x540 output pixels)
                sc = min(L[0] * 0.86 / im.width, L[1] * 0.82 / im.height)
                ox, oy = (L[0] - round(im.width * sc)) // 2, (L[1] - round(im.height * sc)) // 2
                from PIL import ImageDraw
                dr = ImageDraw.Draw(im)
                for x0, y0, x1, y1 in CLEAN[spec]:
                    dr.rectangle(((x0 - ox) / sc, (y0 - oy) / sc, (x1 - ox) / sc, (y1 - oy) / sc), fill=(255, 255, 255))
            big, small = product_canvas(im, L), product_canvas(im, S, (0.9, 0.86))
        big.save(os.path.join(SITE_IMG, name + '.webp'), 'WEBP', quality=82, method=6)
        small.save(os.path.join(SITE_IMG, name + '-s.webp'), 'WEBP', quality=80, method=6)
        manifest[spec] = name
    json.dump(manifest, open(os.path.join(HERE, 'images.json'), 'w'), indent=1)
    total = sum(os.path.getsize(os.path.join(SITE_IMG, x)) for x in os.listdir(SITE_IMG))
    print(len(manifest), 'images exported,', f'{total / 1e6:.1f} MB;', len(missing), 'still waiting for upscale')

if __name__ == '__main__':
    {'prep': cmd_prep, 'up': cmd_up, 'up1': cmd_up1, 'out': cmd_out}[sys.argv[1]]()
