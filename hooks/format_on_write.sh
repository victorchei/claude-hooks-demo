#!/usr/bin/env bash
# PostToolUse hook — спрацьовує ПІСЛЯ Edit або Write.
# Отримує JSON контексту на stdin, дістає шлях файлу через jq
# і форматує його відповідним форматером, якщо такий є.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

file_path="$(jq -r '.tool_input.file_path // empty')"

if [[ -z "$file_path" || ! -f "$file_path" ]]; then
  say "🎨 format_on_write: файлу '$file_path' немає — форматувати нічого"
  exit 0
fi

case "$file_path" in
  *.py)
    if command -v black >/dev/null 2>&1; then
      black --quiet "$file_path" 2>/dev/null || true
      say "🎨 ✓ black: $file_path"
    else
      say "🎨 ⚠ black не встановлено — файл не відформатовано (bash install.sh)"
    fi
    ;;
  *.js|*.jsx|*.ts|*.tsx|*.json|*.css|*.md)
    if command -v npx >/dev/null 2>&1; then
      npx --yes prettier --write "$file_path" >/dev/null 2>&1 || true
      say "🎨 ✓ prettier: $file_path"
    else
      say "🎨 ⚠ npx не знайдено — '$file_path' не відформатовано"
    fi
    ;;
  *)
    say "🎨 format_on_write: для '$file_path' форматера немає — пропущено"
    ;;
esac

exit 0
