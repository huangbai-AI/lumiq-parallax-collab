# LumiQ 官网视觉与动效项目

这是 LumiQ 官网首页的视觉改版与 15 秒滚动动效协作仓库。项目包含品牌资料、产品原始素材、历次视觉探索、当前六屏正式静态稿、视频生成提示词、已生成的视频、真实网站代码关联仓库和 Codex 沟通记录。

## 打开项目后先看

1. `当前进度.md`：准确标记当前静态稿、视频和网站代码版本。
2. `新Codex接力说明.md`：当前进度、正式版本和继续方法。
3. `output/交付/甲方反馈改版-2026-09-03/六屏总览.png`：最新页面全貌。
4. `迁移与协作.md`：在另一台电脑完整恢复的方法。
5. `沟通记录/README.md`：历史 Codex 沟通记录索引。
6. `output/imagegen/lumiq-h3-floors-v2/README.md`：动效版本沿革与检查结论。
7. `lumiq_balanced_prd.xml`：首页内容与结构依据。

## 当前正式结果

- 六张 2048×1152 静态页面：`output/交付/甲方反馈改版-2026-09-03/`
- 推荐视频：`output/libtv/h3-variants/lumiq-h3-variant-i-balanced-final-v2.mp4`
- 推荐提示词：`output/imagegen/lumiq-revision-2026-09-03/h3-variant-i-balanced-light-scroll.txt`

## 目录说明

- `analysis/materials/`：Tablet、Go、Nest 等产品原始图与三维文件。
- `analysis/docx-render/`：品牌故事与产品介绍资料。
- `analysis/contact-sheets/`：产品素材缩略总览。
- `feishu/`、根目录 `lumiq_*.xml`：文档版本与页面结构稿。
- `output/imagegen/`：页面生成图、导航素材和提示词。
- `output/libtv/`：动效、参考帧和视频结果。
- `output/交付/`：已整理的正式交付。
- `outputs/`：较早期的长图探索与高清重绘素材。
- `related/website/`：真实官网代码关联仓库，当前视差滚动分支。
- `related/project-background/`：原 LumiQ 资料与提案关联仓库。
- `沟通记录/`：历史可见对话与会话索引。

## 环境说明

阅读图片、文档和视频不需要安装项目依赖。继续生成视觉稿需要新 Codex 自带的图片生成能力；继续生成视频需要可用的视频生成服务。`.libtv/project.json` 只记录原画布编号，不包含密钥，也不保证新账号拥有访问权。

完整迁移优先使用 GitHub 克隆，步骤见 `迁移与协作.md`。运行 `tools/打包给新Codex.sh` 仍可生成离线接力压缩包。
