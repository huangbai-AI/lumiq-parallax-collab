import json
import subprocess
from pathlib import Path

project = 'ce4b2e427eb24bce9345c74d98ae393b'
reference = '8a41127f-308b-43e1-aa2b-49558a079089'
folder = Path(__file__).parent
base = '''参考图 {{Node 8a41127f-308b-43e1-aa2b-49558a079089}} 仅定义唯一的实体书产品：竖版精装儿童绘本，封面是满版深蓝夜空、绿色极光、冰雪城堡，以及穿蓝色刺绣长外套飞翔的卷发女孩。必须精确保留参考封面全部构图、女孩身份与衣服、城堡位置、蓝色书脊、长宽比例。封面插画是印在纸面上的平面图案，不能变成书外的人或立体城堡。不是白色书，不是白底线稿，不添加金边或金色书脊。只出现一本书。高端家庭品牌官网真实摄影，柔和自然光，书封清晰细腻，真实纸张厚度与装订，不添加标题、字母、数字、logo、水印，不出现手机平板。人物若有则为自然真实摄影风格。构图四周留约12%安全区，适用于网站4:3卡片。'''
scenes = {
    'gift': '明亮简洁客厅，温柔母亲把合上的这本蓝色绘本递给约7岁的孩子，孩子喜悦地双手接住，书在画面中央偏下，封面朝镜头且完整可辨，人物半身自然，不挡住女孩与城堡的主要封面图案，背景奶油白和浅木色。',
    'craft': '实体书装帧产品特写，这本蓝色书合上平放在浅灰白石材台面，俯视三分之四角度，整本书四边和封面完整可见，蓝色书脊、薄而真实的白色纸张书口、精装圆润书角清晰。没有人没有手，没有其他书，避免厚重圣经式纸页和金属边。',
    'reading': '温暖卧室沙发，母亲与孩子坐在一起共读同一本书，书打开形成自然V形，外侧蓝色封面朝镜头，正面插画完整位于书的右侧外封面，背面为同色极光天空不复制女孩。母子注视内页，窗光与小台灯温暖但不昏暗，手指自然扶住底部边缘。只有一本真实硬壳纸质绘本。',
    'pages': '俯视近景，这本书自然打开平放在浅木桌上，蓝色硬壳封面的细边和书脊保持一致，展示两页满版精美蓝色冰雪城堡冒险插画，主角是参考封面同一位蓝外套卷发女孩。两页属于同一场景的连续跨页画面，只出现一个女孩在右页，真实纸张中缝与书页弧度。不添加任何文字或大片白色空白，不出现人物手。'}
for index, (key, scene) in enumerate(scenes.items()):
    existing = folder / f'{key}-result.json'
    if existing.exists() and any(json.loads(line).get('status') == 2 for line in existing.read_text().splitlines() if line.strip()):
        continue
    prompt = base + '\n场景：' + scene
    (folder / f'{key}-prompt.txt').write_text(prompt)
    command = ['libtv', 'node', '--x', '600', '--y', str(index * 400), 'create', f'Print同款-{key}-4K', '-t', 'image']
    result = subprocess.run(command + ['-p', project, '--left', reference, '-s', 'model=General image Pro', '-s', 'modeType=image2image', '-s', 'quality=4K', '-s', 'ratio=4:3', '--prompt', prompt, '--run'], text=True, stdout=subprocess.PIPE)
    (folder / f'{key}-result.json').write_text(result.stdout)
    print(key, result.stdout, flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
