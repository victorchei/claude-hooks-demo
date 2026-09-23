// PostToolUse hook — спрацьовує ПІСЛЯ виконання Bash-команди.
// Якщо командою було створення Pull Request через GitHub CLI
// (gh pr create), шле push-сповіщення на телефон через ntfy.sh —
// щоб знати, що PR відкрито й чекає рев'ю, навіть не за комп'ютером.
// Використовує той самий NTFY_TOPIC, що й notify_mobile.mjs.
import { beep, notify, readInput, say } from "./lib.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";

// Реагуємо лише на саму команду створення PR — усе інше пропускаємо
if (!/(^|[;&|]\s*)gh\s+pr\s+create(\s|$)/.test(command)) {
  say("📣 notify_pr_created: це не gh pr create — пропущено");
  process.exit(0);
}

const topic = process.env.NTFY_TOPIC;
if (!topic) {
  beep("Sosumi");
  say("📣 ⚠ notify_pr_created: PR створено, але NTFY_TOPIC не задано — пуш не надіслано");
  process.exit(0);
}

const stdout = String(input.tool_response?.stdout ?? "");
const prUrl = stdout.match(/https:\/\/github\.com\/\S+/g)?.at(-1);
const message = `Pull Request відкрито${prUrl ? `: ${prUrl}` : ""}`;

const result = await notify(topic, message, "📣 notify_pr_created");
beep(result.ok ? "Submarine" : "Sosumi");
say(result.text);
