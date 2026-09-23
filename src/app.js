// Іграшковий застосунок для демонстрації хуків Claude Code.
// Попросіть Claude Code додати сюди функцію greet(name) — після запису
// файлу спрацює хук PostToolUse і відформатує код через prettier.

function greet(name) {
  return `Привіт, ${name}!`;
}

function main() {
  console.log("claude-hooks-demo");
}

main();
