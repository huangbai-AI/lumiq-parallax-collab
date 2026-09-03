from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发")
OUT = ROOT / "analysis/contact-sheets"
OUT.mkdir(parents=True, exist_ok=True)

FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT = ImageFont.truetype(FONT_PATH, 24)
SMALL = ImageFont.truetype(FONT_PATH, 18)


def make_sheet(name: str, paths: list[Path], columns: int = 3) -> None:
    tile_w, tile_h, label_h = 600, 450, 54
    rows = (len(paths) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_w, rows * (tile_h + label_h)), "#f3f4f7")
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(paths):
        row, col = divmod(index, columns)
        x, y = col * tile_w, row * (tile_h + label_h)
        with Image.open(path) as source:
            source = source.convert("RGB")
            source.thumbnail((tile_w - 24, tile_h - 24), Image.Resampling.LANCZOS)
            ox = x + (tile_w - source.width) // 2
            oy = y + (tile_h - source.height) // 2
            sheet.paste(source, (ox, oy))
        label = path.name
        if len(label) > 36:
            label = label[:33] + "…"
        draw.text((x + 16, y + tile_h + 10), label, fill="#111827", font=SMALL)
    sheet.save(OUT / f"{name}.jpg", quality=92)


groups = {
    "ola": sorted((Path("/Users/a1/Downloads/LumiQ/LumiQ")).glob("*.png")),
    "tablet": sorted((ROOT / "analysis/materials/tablet").glob("*.*")),
    "go": sorted((ROOT / "analysis/materials/go/go").glob("*.png")),
    "nest15": sorted((ROOT / "analysis/materials/nest15/NEST 15/NEST 15").glob("*.png")),
}

for group, files in groups.items():
    make_sheet(group, [p for p in files if p.suffix.lower() in {".png", ".jpg", ".jpeg"}])
