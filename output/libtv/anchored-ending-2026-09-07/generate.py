from pathlib import Path
import subprocess
b=Path(__file__).resolve().parent
args=["libtv","node","create","候补清透玻璃-4K","-p","d62d3781dab446fca6f33eb1d1c9dea9","-t","image","-s","model=Lib Image","-s","resolution=4K","-s","quality=high","-s","ratio=16:9","--prompt",(b/"join-crystal.txt").read_text(),"--run"]
p=subprocess.run(args,capture_output=True,text=True)
(b/"result.jsonl").write_text(p.stdout)
print(p.stdout[-1200:]);print(p.stderr[-500:])
raise SystemExit(p.returncode)
