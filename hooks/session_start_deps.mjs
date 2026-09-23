// SessionStart hook — спрацьовує на початку сесії.
// Завжди показує підсумок у терміналі (systemMessage): або що всі залежності
// вже встановлено, або що бракувало і що зробив install.mjs.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { beep, has, say } from "./lib.mjs";

const tools = ["git", "gh"];
const missing = tools.filter((tool) => !has(tool));

if (missing.length === 0) {
  beep("Hero");
  say(`✓ Node ${process.versions.node} + усі залежності вже встановлено: ${tools.join(" ")}`);
  process.exit(0);
}

beep("Sosumi");
const installer = fileURLToPath(new URL("../install.mjs", import.meta.url));
const output = spawnSync(process.execPath, [installer], { encoding: "utf8" });
const tail = `${output.stdout ?? ""}${output.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n");
say(`⚠ Бракувало: ${missing.join(" ")} — запущено install.mjs\n${tail}`);
