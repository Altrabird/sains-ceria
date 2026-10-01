"""Generate 12 feature-rich AR marker images (one per amali) + an A4 print PDF.
Marker = the square image MindAR tracks. Dense, non-repeating, high-contrast shapes = stable tracking.
Usage: python tools/make_markers.py   -> markers/AM01.png..AM12.png, markers/kad-penanda-AR.pdf
Then:  python tools/compile_markers.py -> markers/targets.mind (target index = AM number - 1)"""
import os, random
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "markers")
os.makedirs(OUT, exist_ok=True)
FONT = "C:/Windows/Fonts/arialbd.ttf"
FONT_R = "C:/Windows/Fonts/arial.ttf"

AMALI = [
    ("AM01", "Kecil ke Besar", "Mengukur saiz badan", (231, 76, 60)),
    ("AM02", "Percambahan Biji Benih", "Air, udara, suhu", (39, 174, 96)),
    ("AM03", "Tumbesaran Tumbuhan", "Merekod ketinggian", (22, 160, 133)),
    ("AM04", "Keperluan Tumbuhan", "Cahaya, air, udara", (46, 204, 113)),
    ("AM05", "Kotak Misteri", "Perlukah cahaya?", (243, 156, 18)),
    ("AM06", "Bayang-bayang", "Lutsinar / lut cahaya / legap", (142, 68, 173)),
    ("AM07", "Litar Elektrik", "Konduktor atau penebat?", (241, 196, 15)),
    ("AM08", "Mengasingkan Campuran", "Ayak, magnet, turas", (211, 84, 0)),
    ("AM09", "Larut atau Tidak?", "Bahan dalam air", (52, 152, 219)),
    ("AM10", "Larut Lebih Cepat", "Panas, kacau, halus", (192, 57, 43)),
    ("AM11", "Kitar Air", "Sejatan, kondensasi, kerpasan", (41, 128, 185)),
    ("AM12", "Udara Bergerak", "Roket angin & bebaling", (233, 30, 99)),
]
PALETTE = [(30, 30, 40), (240, 240, 235), (231, 76, 60), (52, 152, 219), (241, 196, 15), (39, 174, 96), (142, 68, 173),
           (230, 126, 34), (236, 64, 122)]
S = 1000  # marker px


def marker(code, title, sub, accent, seed):
    rnd = random.Random(seed)
    im = Image.new("RGB", (S, S), (250, 246, 240))
    d = ImageDraw.Draw(im)
    # 1. dense random shape field (the trackable texture)
    for _ in range(420):
        c = rnd.choice(PALETTE + [accent] * 3)
        x, y, r = rnd.randrange(S), rnd.randrange(S), rnd.randint(8, 60)
        k = rnd.random()
        if k < 0.35:
            d.ellipse((x - r, y - r, x + r, y + r), fill=c, outline=(20, 20, 25), width=3)
        elif k < 0.65:
            d.polygon([(x + rnd.randint(-r, r), y + rnd.randint(-r, r)) for _ in range(3)], fill=c, outline=(20, 20, 25))
        elif k < 0.85:
            d.rectangle((x - r, y - r // 2, x + r, y + r // 2), fill=c, outline=(20, 20, 25), width=3)
        else:
            d.line((x, y, x + rnd.randint(-120, 120), y + rnd.randint(-120, 120)), fill=c, width=rnd.randint(4, 12))
    # 2. title plate (asymmetric on purpose: breaks rotational ambiguity)
    d.rounded_rectangle((60, 600, 940, 930), 36, fill=(255, 255, 255), outline=accent, width=14)
    d.text((100, 610), code, font=ImageFont.truetype(FONT, 150), fill=accent, stroke_width=4, stroke_fill=(20, 20, 25))
    d.text((100, 785), title, font=ImageFont.truetype(FONT, 58), fill=(20, 20, 25))
    d.text((100, 860), sub, font=ImageFont.truetype(FONT_R, 40), fill=(90, 80, 100))
    # corner tag
    d.pieslice((S - 260, -260, S + 260, 260), 90, 180, fill=accent, outline=(20, 20, 25), width=8)
    d.rectangle((0, 0, S - 1, S - 1), outline=(20, 20, 25), width=18)
    return im


def main():
    pages, ims = [], []
    for i, (code, title, sub, accent) in enumerate(AMALI):
        im = marker(code, title, sub, accent, seed=1000 + i)
        im.save(os.path.join(OUT, f"{code}.png"))
        ims.append((code, title, im))
    # A4 @ 200dpi, 2 cards per page, each 12 cm square
    W, H, dpi = 1654, 2339, 200
    cm = dpi / 2.54
    side = int(12 * cm)
    f_h = ImageFont.truetype(FONT, 36)
    f_s = ImageFont.truetype(FONT_R, 26)
    for k in range(0, len(ims), 2):
        pg = Image.new("RGB", (W, H), "white")
        d = ImageDraw.Draw(pg)
        for j, (code, title, im) in enumerate(ims[k:k + 2]):
            top = 120 + j * (H // 2)
            x = (W - side) // 2
            pg.paste(im.resize((side, side), Image.LANCZOS), (x, top))
            d.text((x, top + side + 20), f"{code} — {title}", font=f_h, fill="black")
            d.text((x, top + side + 70), "Cetak saiz sebenar (12 cm). Jangan lipat / berkilat. Imbas di ar/index.html",
                   font=f_s, fill=(100, 100, 100))
            # cut line
            d.line((40, top - 60, W - 40, top - 60), fill=(200, 200, 200), width=2) if j else None
        pages.append(pg)
    pages[0].save(os.path.join(OUT, "kad-penanda-AR.pdf"), save_all=True, append_images=pages[1:], resolution=dpi)
    print(f"{len(ims)} markers + {len(pages)}-page PDF -> {OUT}")


if __name__ == "__main__":
    main()
