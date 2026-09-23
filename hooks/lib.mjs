// Спільний хелпер для хуків. Node 18+, без залежностей, однаково працює
// на macOS, Windows і Linux в будь-якому шеллі (bash, PowerShell, cmd).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { delimiter, join } from "node:path";

export const isWindows = platform() === "win32";

// pipx кладе black у ~/.local/bin, якого може не бути в PATH поточної сесії
// (особливо одразу після автоустановки) — додаємо, щоб хуки його знаходили.
process.env.PATH = `${process.env.PATH ?? ""}${delimiter}${join(homedir(), ".local", "bin")}`;

// Контекст виклику хука — JSON на stdin.
export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

// say — рядок для користувача: JSON {"systemMessage": ...} на stdout при
// exit 0. Plain-текст на stdout у звичайному режимі не видно.
export function say(message) {
  process.stdout.write(JSON.stringify({ systemMessage: message }) + "\n");
}

// deny — блокування PreToolUse: причина в stderr + exit code 2.
export function deny(message) {
  beep("Basso");
  process.stderr.write(message + "\n");
  process.exit(2);
}

export function has(command) {
  return (
    spawnSync(isWindows ? "where" : "which", [command], { stdio: "ignore" })
      .status === 0
  );
}

// beep — системний звук, у фоні, не довше 3 с. Назви — з macOS
// (Basso, Pop, Glass, Hero, Sosumi, Submarine, Ping). DEMO_MUTE=1 вимикає.
//   macOS   — afplay /System/Library/Sounds/<Назва>.aiff
//   Windows — System.Media.SystemSounds через powershell.exe
//   інше    — дзвінок термінала (\a) у /dev/tty
export function beep(name) {
  if (process.env.DEMO_MUTE) return;
  const background = (command, args) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      detached: true,
      timeout: 3000,
      windowsHide: true,
    });
    child.on("error", () => {});
    child.unref();
  };
  switch (platform()) {
    case "darwin": {
      const file = `/System/Library/Sounds/${name}.aiff`;
      if (existsSync(file)) background("afplay", [file]);
      break;
    }
    case "win32": {
      const sound =
        { Basso: "Hand", Sosumi: "Hand", Hero: "Exclamation", Submarine: "Exclamation" }[
          name
        ] ?? "Asterisk";
      background("powershell.exe", [
        "-NoProfile",
        "-Command",
        `[System.Media.SystemSounds]::${sound}.Play(); Start-Sleep -Milliseconds 1500`,
      ]);
      break;
    }
    default:
      try {
        writeFileSync("/dev/tty", "\x07");
      } catch {
        // немає керуючого термінала — звук пропускаємо
      }
  }
}

// notify — push через ntfy.sh. Повертає рядок для say().
export async function notify(topic, message, label) {
  try {
    const response = await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      body: message,
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      return { ok: true, text: `${label}: ✓ пуш надіслано на ntfy.sh/${topic} — ${message}` };
    }
    return { ok: false, text: `${label}: ✗ ntfy.sh відповів HTTP ${response.status} — пуш не доставлено` };
  } catch (error) {
    return { ok: false, text: `${label}: ✗ ntfy.sh недоступний (${error.name}) — пуш не доставлено` };
  }
}
