#!/usr/bin/env bash
# Встановлює залежності демо: jq, git, curl, gh, node, black.
# Запуск: bash install.sh
set -euo pipefail

have() { command -v "$1" >/dev/null 2>&1; }

case "$(uname -s)" in
  Darwin)
    have brew || { echo "✗ потрібен Homebrew: https://brew.sh"; exit 1; }
    for pkg in jq git gh node pipx; do
      have "$pkg" || brew install "$pkg"
    done
    ;;
  Linux)
    have apt-get || { echo "✗ підтримується лише apt (Debian/Ubuntu)"; exit 1; }
    for pkg in jq git curl pipx; do
      have "$pkg" || sudo apt-get install -y "$pkg"
    done
    have node || sudo apt-get install -y nodejs npm
    have gh || echo "⚠ gh: https://github.com/cli/cli#installation"
    ;;
  *)
    echo "✗ непідтримувана ОС: $(uname -s)"
    exit 1
    ;;
esac

have black || pipx install black

echo
for tool in jq git curl gh node black; do
  if have "$tool"; then
    echo "✓ $tool"
  else
    echo "✗ $tool не знайдено (перезапустіть термінал: pipx додає PATH через 'pipx ensurepath')"
  fi
done
