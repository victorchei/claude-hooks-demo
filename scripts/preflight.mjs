// Перевірка перед показом: node scripts/preflight.mjs
// Працює на macOS, Windows і Linux. Нічого не змінює.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { has } from "../hooks/lib.mjs";

const git = (...args) => spawnSync("git", args, { encoding: "utf8" }).stdout?.trim() ?? "";
const check = (ok, good, bad) => console.log(ok ? `✓ ${good}` : `✗ ${bad}`);

const nodeMajor = Number(process.versions.node.split(".")[0]);
check(nodeMajor >= 18, `Node ${process.versions.node}`, `Node ${process.versions.node} — потрібен 18+`);
check(has("git"), "git", "git не знайдено — потрібен для демо 3 (node install.mjs)");
check(has("npx"), "npx / prettier (демо 1)", "npx не знайдено — демо 1 не відформатує файл (входить до Node.js)");
check(has("gh"), "gh (демо 4, необов'язково)", "gh не знайдено — демо 4 лише як імітація (node install.mjs)");

const branch = git("branch", "--show-current");
console.log(`ℹ гілка: ${branch || "(невідомо — не git-репозиторій?)"}`);
check(git("status", "--short") === "", "робоче дерево чисте", "є незакомічені зміни (git status --short)");

const app = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check(!app.includes("function greet"), "src/app.js чистий (без function greet)", "у src/app.js вже є function greet — git restore src/app.js");

check(Boolean(process.env.NTFY_TOPIC), `NTFY_TOPIC=${process.env.NTFY_TOPIC}`, "NTFY_TOPIC не задано — демо 4–5 покажуть лише ⚠");
if (process.env.DEMO_MUTE) console.log("ℹ DEMO_MUTE задано — звуки вимкнено");
