// Встановлює залежності демо: git і gh (Node.js вже є — інакше цей скрипт
// не запустився б). Запуск: node install.mjs
// macOS — Homebrew, Windows — winget, Linux — apt. Що не вдалося поставити
// автоматично — друкує з підказкою, не падає.
// DEMO_DRY_RUN=1 — лише показує, що було б виконано.
import { spawnSync } from "node:child_process";
import { platform } from "node:os";
import { has } from "./hooks/lib.mjs";

const os = platform();
const dryRun = Boolean(process.env.DEMO_DRY_RUN);

const run = (command, args) => {
  if (dryRun) {
    console.log(`(dry-run) ${command} ${args.join(" ")}`);
    return true;
  }
  return spawnSync(command, args, { stdio: "inherit", shell: os === "win32" }).status === 0;
};

const winget = (id) =>
  run("winget", ["install", "--id", id, "-e", "--accept-source-agreements", "--accept-package-agreements"]);

const installers = {
  darwin: {
    git: () => has("brew") && run("brew", ["install", "git"]),
    gh: () => has("brew") && run("brew", ["install", "gh"]),
  },
  win32: {
    git: () => has("winget") && winget("Git.Git"),
    gh: () => has("winget") && winget("GitHub.cli"),
  },
  linux: {
    git: () => has("apt-get") && run("sudo", ["-n", "apt-get", "install", "-y", "git"]),
    gh: () => false,
  },
}[os];

if (!installers) {
  console.log(`✗ непідтримувана ОС: ${os}. Встановіть вручну: git, gh (https://cli.github.com).`);
  process.exit(0);
}

for (const tool of ["git", "gh"]) {
  if (!has(tool)) installers[tool]();
}

const hints = {
  git: "https://git-scm.com/downloads",
  gh: "https://cli.github.com (потрібен лише для справжнього PR у демо 4)",
};
console.log();
for (const tool of ["git", "gh"]) {
  console.log(
    has(tool)
      ? `✓ ${tool}`
      : `✗ ${tool} не встановлено автоматично — ${hints[tool]}; після встановлення перезапустіть термінал`,
  );
}
