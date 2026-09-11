"""Run: python3 review.py [version number]. Metrics flag candidates; inspect contact sheets too."""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent


def frames(path, width=192, height=108, fps=None):
    filters = f"scale={width}:{height}"
    if fps:
        filters += f",fps={fps}"
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path),
                                   "-vf", filters, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, height, width, 3)


def inspect(path):
    info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams",
                                              "-show_format", "-of", "json", str(path)]))
    stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    small = frames(path).astype(np.float32)
    differences = np.abs(np.diff(small, axis=0)).mean(axis=(1, 2, 3))
    brightness = small.mean(axis=(1, 2, 3))
    jumps = np.abs(np.diff(brightness))
    rate = stream["r_frame_rate"].split("/")
    fps = int(rate[0]) / int(rate[1])
    samples = frames(path, 384, 216, 4)
    sheet = Image.new("RGB", (384 * 4, 242 * ((len(samples) + 3) // 4)), "#f2f2f2")
    draw = ImageDraw.Draw(sheet)
    for i, sample in enumerate(samples):
        x, y = (i % 4) * 384, (i // 4) * 242
        sheet.paste(Image.fromarray(sample), (x, y))
        draw.text((x + 8, y + 219), f"{path.name}  {i / 4:.2f}s", fill="black")
    sheet.save(path.with_name(path.stem + "-contact.jpg"), quality=92)
    for label, i in [("first", 0), ("middle", len(small) // 2), ("last", len(small) - 1)]:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-vf",
                        f"select=eq(n\\,{i})", "-frames:v", "1",
                        str(path.with_name(path.stem + f"-{label}.png"))], check=True)
    report = {"file": path.name, "resolution": [stream["width"], stream["height"]],
              "duration": float(stream.get("duration", info["format"]["duration"])),
              "fps": fps, "frame_count": len(small),
              "mean_frame_change": float(differences.mean()), "max_frame_change": float(differences.max()),
              "max_brightness_change": float(jumps.max()),
              "candidate_jump_times": [round(float(i + 1) / fps, 3) for i in np.where((differences > 15) | (jumps > 8))[0]],
              "note": "Thresholds only flag abrupt changes; visual review is required."}
    path.with_suffix(".review.json").write_text(json.dumps(report, indent=2) + "\n")
    return report, small[0], small[-1]


if __name__ == "__main__":
    versions = [ROOT / f"version-{sys.argv[1]}"] if len(sys.argv) > 1 else sorted(ROOT.glob("version-*"))
    for version in versions:
        reports, joins, previous = [], [], None
        for path in sorted(version.glob("segment-[1-6].mp4")):
            if not re.fullmatch(r"segment-\d+\.mp4", path.name):
                continue
            report, first, last = inspect(path)
            reports.append(report)
            if previous is not None:
                joins.append({"before": path.name, "rgb_difference": float(np.abs(first - previous).mean())})
            previous = last
        if reports:
            output = {"segments": reports, "joins": joins}
            (version / "review.json").write_text(json.dumps(output, indent=2) + "\n")
            print(json.dumps({"version": version.name, **output}))
