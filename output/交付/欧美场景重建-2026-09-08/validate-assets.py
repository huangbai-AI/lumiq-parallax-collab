from pathlib import Path
from PIL import Image
import json
root=Path.cwd();out=root/'output/交付/欧美场景重建-2026-09-08';web=root/'related/website';items=json.loads((out/'prompts.json').read_text());mapping=json.loads((out/'replacement-map.json').read_text());manifest=json.loads((web/'lib/home-image-manifest.json').read_text());source='\n'.join(p.read_text() for d in ['app','components'] for p in (web/d).rglob('*.tsx'))
assert len(items)==len(mapping)==13
for x in items:
 assert x['quality']=='medium' and x['resolution']=='4K'
 assert x['source'] not in source,x['source']
 target=web/'public'/mapping[x['source']].lstrip('/'); im=Image.open(target); assert im.size==tuple(x['generatedDimensions']); assert im.width*im.height>=7900000
 if x['id'] in [0,1,2,3]:
  record=manifest[mapping[x['source']]];assert x['source'] not in manifest
  for w in record['widths']:
   f=web/'public'/(record['base'].lstrip('/')+f'-{w}.webp');assert Image.open(f).width==w
print('PASS: 13 medium/4K images, original URLs removed, responsive derivatives and dimensions verified')
