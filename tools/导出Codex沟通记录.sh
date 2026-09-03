#!/bin/zsh
set -euo pipefail

项目目录="${0:A:h:h}"
输出目录="$项目目录/沟通记录"
会话索引="/Users/a1/.codex/session_index.jsonl"

mkdir -p "$输出目录"
find "$输出目录" -type f -name '*.md' ! -name 'README.md' -delete
: > "$输出目录/会话索引.tsv"
printf '开始时间\t标题\t会话编号\t原工作目录\t消息数\t文件\n' >> "$输出目录/会话索引.tsv"

清理文本() {
  perl -0pe '
    s/gh[opsu]_[A-Za-z0-9_]{20,}/[已遮盖的 GitHub 凭证]/g;
    s/sk-[A-Za-z0-9_-]{16,}/[已遮盖的接口密钥]/g;
    s/(Bearer\s+)[A-Za-z0-9._~+\/-]{16,}/${1}[已遮盖]/gi;
    s/((?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*[=:]\s*)[^\s"'"'"']+/${1}[已遮盖]/gi;
  '
}

找标题() {
  local 编号="$1"
  jq -r --arg id "$编号" 'select(.id==$id) | .thread_name' "$会话索引" 2>/dev/null | tail -1
}

应该导出() {
  local 路径="$1"
  local 标题="$2"
  if [[ "$路径" == *'/ChatGPT/LumiQ 8.26 开发'* || "$路径" == *'/.codex/worktrees/'*'/LumiQ'* || "$路径" == *'/.codex/worktrees/lumiq-'* ]]; then
    return 0
  fi
  if [[ "$路径" == *'/Documents/LumiQ'* && "$标题" =~ '(LumiQ|Lumiq|lumiq|官网|首页|品牌故事|产品总览|套餐与价格|媒体与评价|常见问题|前端|设计提案|LibTV|视差|滚动)' ]]; then
    return 0
  fi
  if [[ "$标题" =~ '(LumiQ|Lumiq|lumiq)' ]]; then
    return 0
  fi
  return 1
}

while IFS= read -r -d '' 记录文件; do
  首行=$(head -1 "$记录文件")
  [[ -n "$首行" ]] || continue
  路径=$(printf '%s' "$首行" | jq -r 'select(.type=="session_meta") | .payload.cwd // empty' 2>/dev/null)
  [[ -n "$路径" ]] || continue
  编号=$(printf '%s' "$首行" | jq -r '.payload.id // .payload.session_id // empty')
  [[ -n "$编号" ]] || continue
  开始时间=$(printf '%s' "$首行" | jq -r '.payload.timestamp // empty')
  标题=$(找标题 "$编号")
  [[ -n "$标题" ]] || 标题='未命名会话'
  应该导出 "$路径" "$标题" || continue

  安全标题=$(printf '%s' "$标题" | tr '/:' '__' | cut -c1-48)
  日期=${开始时间%%T*}
  时间标识=$(printf '%s' "$开始时间" | tr -cd '0-9' | cut -c1-14)
  输出文件="$输出目录/${日期}-${时间标识}-${安全标题}-${编号[1,8]}.md"

  {
    printf '# %s\n\n' "$标题"
    printf -- '- 会话编号：`%s`\n' "$编号"
    printf -- '- 开始时间：`%s`\n' "$开始时间"
    printf -- '- 原工作目录：`%s`\n\n' "$路径"

    jq -r '
      select(.type=="response_item" and .payload.type=="message")
      | select(.payload.role=="user" or .payload.role=="assistant")
      | {
          time: .timestamp,
          role: .payload.role,
          phase: (.payload.phase // ""),
          text: ([.payload.content[]? | .text? // empty] | join("\n\n"))
        }
      | select(.text != "")
      | @base64
    ' "$记录文件" | while IFS= read -r 编码; do
      消息=$(printf '%s' "$编码" | base64 -D)
      时间=$(printf '%s' "$消息" | jq -r '.time')
      角色=$(printf '%s' "$消息" | jq -r '.role')
      阶段=$(printf '%s' "$消息" | jq -r '.phase')
      内容=$(printf '%s' "$消息" | jq -r '.text')
      case "$内容" in
        '<external_'* | '<recommended_plugins>'* | '# AGENTS.md instructions'* | '<environment_context>'* | '<app-context>'* | '<permissions instructions>'* | '<skills_instructions>'*)
          continue
          ;;
      esac
      if [[ "$角色" == 'user' ]]; then
        printf '## 用户 · %s\n\n' "$时间"
      elif [[ "$阶段" == 'final_answer' ]]; then
        printf '## Codex 最终回复 · %s\n\n' "$时间"
      else
        printf '## Codex · %s\n\n' "$时间"
      fi
      printf '%s\n\n' "$内容" | 清理文本
    done
  } > "$输出文件"

  消息数=$(rg -c '^## (用户|Codex)' "$输出文件" || true)
  相对文件=${输出文件#$项目目录/}
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$开始时间" "$标题" "$编号" "$路径" "$消息数" "$相对文件" >> "$输出目录/会话索引.tsv"
done < <(find /Users/a1/.codex/sessions /Users/a1/.codex/archived_sessions -type f -name '*.jsonl' -print0 2>/dev/null)

临时索引="$(mktemp)"
head -1 "$输出目录/会话索引.tsv" > "$临时索引"
tail -n +2 "$输出目录/会话索引.tsv" | LC_ALL=C sort -t $'\t' -k1,1 >> "$临时索引"
mv "$临时索引" "$输出目录/会话索引.tsv"
echo "已导出 $(find "$输出目录" -type f -name '*.md' ! -name 'README.md' | wc -l | tr -d ' ') 段会话。"
