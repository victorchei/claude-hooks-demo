#!/usr/bin/env bash
# PostToolUse hook — спрацьовує ПІСЛЯ виконання Bash-команди.
# Якщо командою було створення Pull Request через GitHub CLI
# (gh pr create), шле push-сповіщення на телефон через ntfy.sh —
# щоб знати, що PR відкрито й чекає рев'ю, навіть не за комп'ютером.
# Використовує той самий NTFY_TOPIC, що й notify_mobile.sh.
set -euo pipefail

input="$(cat)"
command_text="$(jq -r '.tool_input.command // empty' <<< "$input")"

# Реагуємо лише на команди створення PR — усе інше пропускаємо
if [[ "$command_text" != *"gh pr create"* ]]; then
  exit 0
fi

topic="${NTFY_TOPIC:-}"
if [[ -z "$topic" ]]; then
  exit 0
fi

pr_url="$(jq -r '.tool_response.stdout // empty' <<< "$input" | grep -Eo 'https://github.com/[^ ]+' | tail -1 || true)"
message="Pull Request відкрито${pr_url:+: $pr_url}"

curl -s -d "$message" "https://ntfy.sh/$topic" >/dev/null || true
exit 0
