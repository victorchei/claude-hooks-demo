#!/usr/bin/env bash
# PreToolUse hook — спрацьовує ДО запуску Write/Edit.
# Якщо цільовий файл — .env або схожий на секрети, блокує дію
# кодом виходу 2 і пояснює причину у stderr (це бачить Claude).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

file_path="$(jq -r '.tool_input.file_path // empty')"

if [[ "$file_path" == *.env* || "$file_path" == *secrets* ]]; then
  echo "🔒 Заблоковано хуком protect_env.sh: правка '$file_path' без явного дозволу людини заборонена." >&2
  exit 2
fi

say "🔒 protect_env: '$file_path' не секретний — правку дозволено"
exit 0
