# LumiQ 六楼层智能多参考动效

## 最终交付

- `final-nav/01-hero-nav.png` 至 `final-nav/06-waitlist-nav.png`：六张统一导航的 2048×1152 最终参考图
- `final-nav/six-floor-contact-sheet.png`：六层总览
- `h3-variant-a-hologram-relay.txt`：A 版“全息角色接力”提示词
- `h3-variant-b-ribbon-flow.txt`：B 版“珍珠光带导览”提示词
- `h3-variant-c-portal-depth.txt`：C 版“空间门户转场”提示词
- `h3-variant-d-real-scroll.txt`：D 版“真实网页视差滚动”提示词
- `00-loading-libimage-2k.png`：新增的首屏前 Loading 楼层，2048×1152，无导航
- `h3-variant-e-loading-scroll.txt`：E 版“Loading＋七层网页滚动”提示词
- `00-loading-background-only-2k.png`：纯背景 Loading 首帧，2048×1152，无产品、Logo、文字和导航
- `h3-variant-f-logo-loading-scroll.txt`：F 版“Logo逐字浮现＋七层网页滚动”提示词
- `00-loading-glass-lumiq-2k.png`：玻璃LUMIQ首帧，2048×1152，无STUDIO、产品和导航
- `h3-variant-g-glass-logo-scroll.txt`：G 版“玻璃Logo退入首屏背景＋网页滚动”提示词
- `00-loading-small-glass-lumiq-2k.png`：H 版小尺寸玻璃LUMIQ过渡帧，2048×1152
- `h3-variant-h-small-letters-glass-scroll.txt`：H 版“小字母依次出现并退入首屏背景＋网页滚动”提示词
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/imagegen/lumiq-revision-2026-09-03/03-products-dusk-nav.png`：提亮后的暮蓝产品展厅，使用放大正式导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/imagegen/lumiq-revision-2026-09-03/05-trust-pearl-nav.png`：珍珠浅色信任页，使用放大正式导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/imagegen/lumiq-revision-2026-09-03/h3-variant-i-balanced-light-scroll.txt`：I 版“明暗平衡＋浅色信任页”提示词
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-a-final.mp4`：A 版，2560×1440，15.08 秒，已覆盖统一导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-b-final.mp4`：B 版，2560×1440，15.08 秒，已覆盖统一导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-c-final.mp4`：C 版，2560×1440，15.08 秒，已覆盖统一导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-d-final.mp4`：D 版，2560×1440，15.08 秒，已覆盖统一导航
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-f-final.mp4`：F 版，纯背景起始、Logo逐字浮现，2560×1440，15.08 秒，导航在Loading结束后淡入并固定
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-g-final.mp4`：G 版，玻璃LUMIQ退入首屏背景，2560×1440，15.08 秒，Loading结束后导航淡入并固定
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-h-final.mp4`：H 版，小尺寸LUMIQ逐字出现后沿景深退入首屏背景，2560×1440，15.08 秒，导航淡入并固定
- `/Users/a1/Documents/ChatGPT/LumiQ 8.26 开发/output/libtv/h3-variants/lumiq-h3-variant-i-balanced-final-v2.mp4`：I 版，产品段提亮、第5屏改为珍珠浅色，2560×1440，15.13 秒，放大正式导航固定

## 检查结论

- A 版：六层完整，浅色视觉最稳定，导航基本一致，优先推荐。
- B 版：物件光带衔接明显，但中段模型加入深色航拍背景，适合作为动效方向参考。
- C 版：空间门户与景深变化最强，生态到信任段偏暗，适合作为强化空间感的备选。
- D 版：以持续网页滚动为主，前三层连续衔接，后三层单出单入；整体最接近真实官网浏览关系。
- F 版：纯背景Loading开场，LUMIQ STUDIO逐字显影；女孩从OLA迈出，随后渐隐，五张产品卡依次向上滚入。
- G 版：只显示玻璃LUMIQ开场，Logo沿景深退后并成为首屏背景；其余动效沿用F版。
- H 版：L、U、M、I、Q 以小尺寸依次显现，组成完整Logo后整体后移、放大并融入首屏背景；后续六层结构保持不变。
- I 版：第3屏改为暮蓝灰玻璃展厅并额外提升暗部，第5屏改为暖白家庭信任页；导航使用甲方正式Logo并统一放大。

LibTV 画布：<https://www.liblib.tv/canvas?spaceId=7201858&projectId=4ca26d0deb404019a9d164c49c977529>

参考视频只用于人工拆解动效规律，没有上传给 H3。H 版接收空白背景、小Logo过渡帧和六张最终楼层图。
