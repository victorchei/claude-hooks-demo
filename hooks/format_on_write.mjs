// PostToolUse hook — спрацьовує ПІСЛЯ Edit або Write.
// Отримує JSON контексту на stdin, дістає шлях файлу і форматує його
// відповідним форматером, якщо такий є.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { beep, has, isWindows, readInput, say } from "./lib.mjs";

const input = await readInput();
const filePath = input.tool_input?.file_path ?? "";

if (!filePath || !existsSync(filePath)) {
  say(`🎨 format_on_write: файлу '${filePath}' немає — форматувати нічого`);
  process.exit(0);
}

if (filePath.endsWith(".py")) {
  if (has("black")) {
    spawnSync("black", ["--quiet", filePath], { stdio: "ignore" });
    beep("Glass");
    say(`🎨 ✓ black: ${filePath}`);
  } else {
    beep("Sosumi");
    say("🎨 ⚠ black не встановлено — .py не відформатовано (демо форматує .js через prettier)");
  }
} else if (/\.(js|jsx|ts|tsx|json|css|md)$/.test(filePath)) {
  if (has("npx")) {
    spawnSync("npx", ["--yes", "prettier", "--write", filePath], {
      stdio: "ignore",
      shell: isWindows,
    });
    beep("Glass");
    say(`🎨 ✓ prettier: ${filePath}`);
  } else {
    say(`🎨 ⚠ npx не знайдено — '${filePath}' не відформатовано`);
  }
} else {
  say(`🎨 format_on_write: для '${filePath}' форматера немає — пропущено`);
}
