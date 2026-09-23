#!/usr/bin/env bash
# SessionStart hook — спрацьовує на початку сесії.
# Завжди показує підсумок у терміналі (systemMessage): або що всі залежності
# вже встановлено, або що бракувало і що зробив install.sh.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tools=(jq git curl gh node black)

missing=()
for tool in "${tools[@]}"; do
  command -v "$tool" >/dev/null 2>&1 || missing+=("$tool")
done

if [[ ${#missing[@]} -eq 0 ]]; then
  jq -n --arg m "✓ Усі залежності вже встановлено: ${tools[*]}" '{systemMessage: $m}'
  exit 0
fi

install_log="$(bash "$root/install.sh" 2>&1 | tail -n 15 || true)"
jq -n --arg m "⚠ Бракувало: ${missing[*]} — запущено install.sh
$install_log" '{systemMessage: $m}'

exit 0
