from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发")
FILES = [
    ("01 极光白昼", ROOT / "output/imagegen/lumiq-home-01-aurora-white.png"),
    ("02 从清晨到晚安", ROOT / "output/imagegen/lumiq-home-02-day-to-night.png"),
    ("03 光的章节", ROOT / "output/imagegen/lumiq-home-03-light-chapters.png"),
    ("04 四件器物同一轨道", ROOT / "output/imagegen/lumiq-home-04-orbit-gallery.png"),
    ("05 家的长镜头", ROOT / "output/imagegen/lumiq-home-05-home-long-take.png"),
]

font = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 34)
small = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 22)
card_w, image_h, label_h = 520, 780, 76
gap = 36
canvas = Image.new("RGB", (card_w * 3 + gap * 4, (image_h + label_h) * 2 + gap * 3), "#eef2f8")
draw = ImageDraw.Draw(canvas)

for index, (label, path) in enumerate(FILES):
    row, col = divmod(index, 3)
    x = gap + col * (card_w + gap)
    y = gap + row * (image_h + label_h + gap)
    with Image.open(path) as source:
        source = source.convert("RGB")
        source.thumbnail((card_w, image_h), Image.Resampling.LANCZOS)
        ox = x + (card_w - source.width) // 2
        oy = y + (image_h - source.height) // 2
        canvas.paste(source, (ox, oy))
    draw.text((x + 8, y + image_h + 18), label, font=font, fill="#0f2447")

draw.text((gap + 2 * (card_w + gap) + 12, gap + image_h + label_h + gap + 260), "LumiQ 首页\n五个视觉方向", font=font, fill="#0f2447", spacing=18)
draw.text((gap + 2 * (card_w + gap) + 12, gap + image_h + label_h + gap + 380), "Image-2 概念稿 · 仅用于方向选择", font=small, fill="#60708a")
canvas.save(ROOT / "output/imagegen/lumiq-home-00-five-directions.jpg", quality=92)
