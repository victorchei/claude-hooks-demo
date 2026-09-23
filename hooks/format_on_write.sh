#!/usr/bin/env bash
# PostToolUse hook — спрацьовує ПІСЛЯ Edit або Write.
# Отримує JSON контексту на stdin, дістає шлях файлу через jq
# і форматує його відповідним форматером, якщо такий є.
set -euo pipefail

file_path="$(jq -r '.tool_input.file_path // empty')"

if [[ -z "$file_path" || ! -f "$file_path" ]]; then
  exit 0
fi

case "$file_path" in
  *.py)
    if command -v black >/dev/null 2>&1; then
      black --quiet "$file_path" 2>/dev/null || true
      echo "✓ black: $file_path"
    fi
    ;;
  *.js|*.jsx|*.ts|*.tsx|*.json|*.css|*.md)
    if command -v npx >/dev/null 2>&1; then
      npx --yes prettier --write "$file_path" >/dev/null 2>&1 || true
      echo "✓ prettier: $file_path"
    fi
    ;;
esac

exit 0
