#!/usr/bin/env bash
# Notification hook — спрацьовує, коли САМ Claude Code шле сповіщення
# (наприклад: потрібен дозвіл на дію, або довга задача завершилась).
# Пересилає повідомлення як push через ntfy.sh — безкоштовний сервіс
# push-сповіщень із застосунком для Android/iOS, тож повідомлення
# приходить на телефон, навіть якщо ви відійшли від ноутбука.
#
# Налаштування: створіть собі приватний топік (будь-який унікальний
# рядок) і додайте його в оточення:
#   export NTFY_TOPIC="my-claude-code-a1b2c3"
# Встановіть застосунок ntfy на телефон і підпишіться на цей топік.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

input="$(cat)"
message="$(jq -r '.message // "Claude Code потребує уваги"' <<< "$input")"
topic="${NTFY_TOPIC:-}"

# Без налаштованого топіка хук нічого не шле і нічого не блокує
if [[ -z "$topic" ]]; then
  say "🔔 ⚠ notify_mobile: NTFY_TOPIC не задано — пуш не надіслано (\"$message\")"
  exit 0
fi

http_code="$(curl -s -o /dev/null -w '%{http_code}' -d "$message" "https://ntfy.sh/$topic" || true)"
if [[ "$http_code" == "200" ]]; then
  say "🔔 ✓ notify_mobile: пуш надіслано на ntfy.sh/$topic — $message"
else
  say "🔔 ✗ notify_mobile: ntfy.sh відповів HTTP '${http_code:-немає відповіді}' — пуш не доставлено"
fi
exit 0
