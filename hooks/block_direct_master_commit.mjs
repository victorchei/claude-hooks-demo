// PreToolUse hook — перевіряє КОЖНУ Bash-команду перед виконанням.
// Мета: заборонити прямий коміт у master/main в обхід Pull Request —
// вимога безпеки (без рев'ю коду й без CI-гейтів прямий коміт заборонено).
import { spawnSync } from "node:child_process";
import { beep, deny, readInput, say } from "./lib.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";

// Реагуємо лише на саму команду git commit (на початку або після ; && | ),
// а не на будь-який текст, де зустрічається "git commit"
const commitCommand = /(^|[;&|]\s*)git\s+(-C\s+\S+\s+)?commit(\s|$)/;
if (!commitCommand.test(command)) {
  say("🌿 block_direct_master_commit: це не git commit — пропущено");
  process.exit(0);
}

const branch = spawnSync("git", ["branch", "--show-current"], {
  cwd: input.cwd ?? process.cwd(),
  encoding: "utf8",
}).stdout?.trim();

if (branch === "master" || branch === "main") {
  deny(
    `🌿 Заблоковано хуком block_direct_master_commit: прямий коміт у гілку '${branch}' заборонено політикою безпеки. Створіть feature-гілку й відкрийте Pull Request.`,
  );
}

beep("Pop");
say(`🌿 block_direct_master_commit: гілка '${branch}' — коміт дозволено`);
