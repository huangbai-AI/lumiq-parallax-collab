"""Join approved five-second segments with shared endpoint keyframes."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
project = root.parents[2]
version = int(sys.argv[1])
assert 1 <= version <= 5
inputs = [root / f"version-{version}/segment-{n}.mp4" for n in range(1, 7)]
assert all(path.is_file() for path in inputs), "All six segments must exist"
target = project / f"related/website/public/assets/background-variants-20260911/version-{version}.mp4"
target.parent.mkdir(parents=True, exist_ok=True)
args = ["ffmpeg", "-y", "-v", "error", "-filter_complex_threads", "2"]
for path in inputs:
    args += ["-i", str(path)]
filters = [f"[{n}:v]trim=duration=5,setpts=PTS-STARTPTS,fps=24,setsar=1[v{n}]" for n in range(6)]
filters += ["".join(f"[v{n}]" for n in range(6)) + "concat=n=6:v=1:a=0[out]"]
args += ["-filter_complex", ";".join(filters), "-map", "[out]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "-g", "12", "-keyint_min", "12", "-sc_threshold", "0", "-threads", "4", "-movflags", "+faststart", str(target)]
subprocess.run(args, check=True)
duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(target)]))
assert abs(duration - 30) < .05, duration
print(target)
