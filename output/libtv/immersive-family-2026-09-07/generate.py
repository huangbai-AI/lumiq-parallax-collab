"""Run one named LibTV job from the repository root; never use generated inputs."""
from pathlib import Path
import subprocess
import sys

base = Path(__file__).resolve().parent
project = "5ed032eaf73248ed8c1a7e540b8fab7f"
jobs = {
    "design": ("沉浸视觉方向-4K", "3:4", []),
    "trust-wide": ("沉浸信任母子-4K", "16:9", ["原始Tablet产品"]),
    "morning": ("早晨家庭-4K", "16:9", ["客户确认Nest15外观与界面"]),
    "afternoon": ("午后发现-4K", "16:9", ["原始Tablet产品", "原始OLA产品"]),
    "evening": ("睡前故事-4K", "16:9", ["原始Print产品"]),
}
key = sys.argv[1]
name, ratio, references = jobs[key]
args = ["libtv", "node", "create", name, "-p", project, "-t", "image",
        "-s", "model=Lib Image", "-s", "resolution=4K", "-s", "quality=high",
        "-s", f"ratio={ratio}", "--prompt", (base / f"{key}.txt").read_text()]
if references:
    args += ["-s", "modeType=image2image"]
for reference in references:
    args += ["--left", reference]
result = subprocess.run(args + ["--run"], capture_output=True, text=True)
(base / f"{key}-result.jsonl").write_text(result.stdout)
print(result.stdout[-2500:])
print(result.stderr[-1200:])
raise SystemExit(result.returncode)
