#!/usr/bin/env bash
# PreToolUse hook — перевіряє КОЖНУ Bash-команду перед виконанням.
# Мета: заборонити прямий коміт у master/main в обхід Pull Request —
# вимога безпеки (без рев'ю коду й без CI-гейтів прямий коміт заборонено).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

input="$(cat)"
command_text="$(jq -r '.tool_input.command // empty' <<< "$input")"

# Реагуємо лише на саму команду git commit (на початку або після ; && | ),
# а не на будь-який текст, де зустрічається "git commit"
commit_re='(^|[;&|][[:space:]]*)git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?commit([[:space:]]|$)'
if [[ ! "$command_text" =~ $commit_re ]]; then
  say "🌿 block_direct_master_commit: це не git commit — пропущено"
  exit 0
fi

current_branch="$(git branch --show-current 2>/dev/null || echo "")"

if [[ "$current_branch" == "master" || "$current_branch" == "main" ]]; then
  echo "🌿 Заблоковано хуком block_direct_master_commit.sh: прямий коміт у гілку '$current_branch' заборонено політикою безпеки. Створіть feature-гілку й відкрийте Pull Request." >&2
  exit 2
fi

say "🌿 block_direct_master_commit: гілка '$current_branch' — коміт дозволено"
exit 0
