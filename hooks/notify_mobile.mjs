// Notification hook — спрацьовує, коли САМ Claude Code шле сповіщення
// (наприклад: потрібен дозвіл на дію, або Claude чекає на вас).
// Пересилає повідомлення як push через ntfy.sh — безкоштовний сервіс
// push-сповіщень із застосунком для Android/iOS, тож повідомлення
// приходить на телефон, навіть якщо ви відійшли від ноутбука.
//
// Налаштування: створіть собі приватний топік (будь-який унікальний
// рядок) і додайте його в оточення:
//   macOS/Linux (bash/zsh): export NTFY_TOPIC="my-claude-code-a1b2c3"
//   Windows PowerShell:     $env:NTFY_TOPIC = "my-claude-code-a1b2c3"
// Встановіть застосунок ntfy на телефон і підпишіться на цей топік.
//
// Ручний запуск для показу (без події Claude Code): node hooks/notify_mobile.mjs --demo
import { beep, notify, readInput, say } from "./lib.mjs";

const input = process.argv.includes("--demo")
  ? { message: "Claude чекає вашого дозволу (демо)" }
  : await readInput();
const message = input.message ?? "Claude Code потребує уваги";
const topic = process.env.NTFY_TOPIC;

// Без налаштованого топіка хук нічого не шле і нічого не блокує
if (!topic) {
  beep("Ping");
  say(`🔔 ⚠ notify_mobile: NTFY_TOPIC не задано — пуш не надіслано ("${message}")`);
  process.exit(0);
}

const result = await notify(topic, message, "🔔 notify_mobile");
beep(result.ok ? "Ping" : "Sosumi");
say(result.text);
