#!/bin/zsh
set -euo pipefail

项目目录="${0:A:h:h}"
输出目录="$项目目录/output/交付"
包名="LumiQ-Codex-接力包-2026-09-03"
压缩包="$输出目录/$包名.zip"
校验文件="$压缩包.sha256"
临时目录="$(mktemp -d)"
暂存目录="$临时目录/$包名"

清理() {
  rm -rf -- "$临时目录"
}
trap 清理 EXIT

mkdir -p "$暂存目录" "$输出目录"

复制() {
  local 相对路径="$1"
  if [[ -e "$项目目录/$相对路径" ]]; then
    rsync -a \
      --exclude='.DS_Store' \
      --exclude='Thumbs.db' \
      "$项目目录/$相对路径" "$暂存目录/${相对路径:h}/"
  fi
}

for 文件 in \
  AGENTS.md README.md 新Codex接力说明.md 打包说明.md \
  lumiq_balanced_prd.xml lumiq_compact_prd.xml lumiq_only_grid.xml \
  lumiq_only_ia.xml lumiq_prd_compressed.xml; do
  复制 "$文件"
done

for 目录 in \
  .libtv feishu lumiq_doc_visuals design-audit \
  analysis/materials analysis/contact-sheets analysis/docx-render \
  output/audit output/product-reference-check output/imagegen \
  output/交付/H版静态页面 \
  output/交付/甲方反馈改版-2026-09-03 \
  output/libtv/lumiq-parallax-scenes \
  output/libtv/lumiq-clean-originals \
  output/libtv/lumiq-8-floor-static \
  outputs/libtv-4k-redraw/generated \
  outputs/libtv-4k-redraw/previews \
  outputs/lumiq-home-assembled-final; do
  复制 "$目录"
done

for 文件 in \
  analysis/make_contact_sheets.py \
  analysis/make_five_direction_overview.py \
  tools/打包给新Codex.sh \
  output/交付/H版静态页面.zip \
  output/交付/甲方反馈改版-2026-09-03.zip \
  output/libtv/lumiq-h3-six-floor-final.mp4 \
  output/libtv/h3-variants/lumiq-h3-variant-h-final.mp4 \
  output/libtv/h3-variants/lumiq-h3-variant-i-balanced-final-v2.mp4 \
  outputs/libtv-4k-redraw/高清重绘通用提示词.md; do
  复制 "$文件"
done

(
  cd "$暂存目录"
  find . -type f ! -name '文件清单.tsv' -print0 \
    | sort -z \
    | while IFS= read -r -d '' 文件; do
        大小=$(stat -f '%z' "$文件")
        摘要=$(shasum -a 256 "$文件" | awk '{print $1}')
        printf '%s\t%s\t%s\n' "$摘要" "$大小" "${文件#./}"
      done > 文件清单.tsv
)

rm -f -- "$压缩包" "$校验文件"
(
  cd "$临时目录"
  zip -q -r -y "$压缩包" "$包名"
)

shasum -a 256 "$压缩包" > "$校验文件"

echo "已生成：$压缩包"
echo "校验文件：$校验文件"
du -h "$压缩包"
