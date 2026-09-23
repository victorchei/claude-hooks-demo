#!/usr/bin/env bash
# Спільний хелпер для хуків (source, не запускається окремо).
# say <текст> — друкує JSON {"systemMessage": ...} на stdout: Claude Code
# показує це повідомлення користувачу в терміналі при exit 0, тож видно,
# що хук спрацював. Plain-текст на stdout у звичайному режимі не видно.

say() {
  jq -n --arg m "$1" '{systemMessage: $m}'
}
