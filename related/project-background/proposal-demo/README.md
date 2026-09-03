# LUMIQ 本地整站源码 + 首页双方向原型

## 本地运行

```bash
npm install
npm run dev
```

默认访问 `http://127.0.0.1:4173/`。

## 两个方向

- `01 Mask`：静态图片覆盖在循环视频上，鼠标控制柔边遮罩位置。
- `02 Scroll`：视频保持暂停，滚动进度直接控制视频时间与四段叙事文案。

## 本地页面

- `/`：首页两套方向
- `/story`：品牌故事
- `/products`：产品总览与切换
- `/products/tablet`、`/products/ola`、`/products/print`：产品详情
- `/plans`：硬件与订阅计划
- `/media`：媒体与读者反馈
- `/faq`：搜索与折叠问答
- `/prelaunch`：本地预约表单与确认状态

全部导航和按钮均为本地路径，不再跳回旧站。页面结构取自现官网，产品名称与正文以 2026-07-27 品牌资料为准；旧站图片只保存在 `references/` 作为构图参考，正式可见物料使用生成图与生成视频。

## 验证

```bash
npm run build
npm run test:sites
```
