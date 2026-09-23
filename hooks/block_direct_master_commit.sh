#!/usr/bin/env bash
# PreToolUse hook — перевіряє КОЖНУ Bash-команду перед виконанням.
# Мета: заборонити прямий коміт у master/main в обхід Pull Request —
# вимога безпеки (без рев'ю коду й без CI-гейтів прямий коміт заборонено).
set -euo pipefail

input="$(cat)"
command_text="$(jq -r '.tool_input.command // empty' <<< "$input")"

# Реагуємо лише на команди git commit — усе інше пропускаємо одразу
if [[ "$command_text" != *"git commit"* ]]; then
  exit 0
fi

current_branch="$(git branch --show-current 2>/dev/null || echo "")"

if [[ "$current_branch" == "master" || "$current_branch" == "main" ]]; then
  echo "Заблоковано хуком block_direct_master_commit.sh: прямий коміт у гілку '$current_branch' заборонено політикою безпеки. Створіть feature-гілку й відкрийте Pull Request." >&2
  exit 2
fi

exit 0
