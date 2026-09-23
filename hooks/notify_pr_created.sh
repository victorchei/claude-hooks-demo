#!/usr/bin/env bash
# PostToolUse hook — спрацьовує ПІСЛЯ виконання Bash-команди.
# Якщо командою було створення Pull Request через GitHub CLI
# (gh pr create), шле push-сповіщення на телефон через ntfy.sh —
# щоб знати, що PR відкрито й чекає рев'ю, навіть не за комп'ютером.
# Використовує той самий NTFY_TOPIC, що й notify_mobile.sh.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

input="$(cat)"
command_text="$(jq -r '.tool_input.command // empty' <<< "$input")"

# Реагуємо лише на саму команду створення PR — усе інше пропускаємо
pr_re='(^|[;&|][[:space:]]*)gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)'
if [[ ! "$command_text" =~ $pr_re ]]; then
  say "📣 notify_pr_created: це не gh pr create — пропущено"
  exit 0
fi

topic="${NTFY_TOPIC:-}"
if [[ -z "$topic" ]]; then
  say "📣 ⚠ notify_pr_created: PR створено, але NTFY_TOPIC не задано — пуш не надіслано"
  exit 0
fi

pr_url="$(jq -r '.tool_response.stdout // empty' <<< "$input" | grep -Eo 'https://github.com/[^ ]+' | tail -1 || true)"
message="Pull Request відкрито${pr_url:+: $pr_url}"

http_code="$(curl -s -o /dev/null -w '%{http_code}' -d "$message" "https://ntfy.sh/$topic" || true)"
if [[ "$http_code" == "200" ]]; then
  say "📣 ✓ notify_pr_created: пуш надіслано на ntfy.sh/$topic — $message"
else
  say "📣 ✗ notify_pr_created: ntfy.sh відповів HTTP '${http_code:-немає відповіді}' — пуш не доставлено"
fi
exit 0
