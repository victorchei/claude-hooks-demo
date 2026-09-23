# claude-hooks-demo

Навчальний репозиторій до доповіді «Claude Code: Хуки». П'ять робочих
прикладів хуків, які можна побачити наживо за кілька хвилин.

## Структура

```
claude-hooks-demo/
├── .claude/
│   └── settings.json                  # реєструє всі п'ять хуків
├── hooks/
│   ├── format_on_write.sh             # PostToolUse — автоформат після Edit/Write
│   ├── protect_env.sh                 # PreToolUse — блокує правки .env
│   ├── block_direct_master_commit.sh  # PreToolUse — блокує прямий коміт у master/main
│   ├── notify_pr_created.sh           # PostToolUse — push-сповіщення при створенні PR
│   └── notify_mobile.sh               # Notification — дублює сповіщення Claude на телефон
├── src/
│   └── app.py                         # файл для експериментів
├── .env.example
└── README.md
```

## Як запустити демо

1. Встановити [залежності](#залежності-для-локального-запуску), клонувати репозиторій і запустити `claude` **з кореня** репо
   (шляхи в `.claude/settings.json` відносні), підтвердивши довіру до теки й проектних хуків:
   ```bash
   git clone https://github.com/victorchei/claude-hooks-demo
   cd claude-hooks-demo
   claude
   ```
2. **Демо 1 — автоформат (PostToolUse).** Попросіть Claude Code:
   > додай у src/app.py функцію greet(name), яка повертає рядок "Привіт, {name}!"

   Після запису файлу побачите `✓ black: src/app.py` — файл відформатовано
   автоматично, без нагадувань у CLAUDE.md.

3. **Демо 2 — блокування .env (PreToolUse).** Попросіть Claude Code:
   > перейменуй .env.example на .env і додай туди новий ключ

   Заблоковано: `protect_env.sh` поверне exit code 2 з поясненням у stderr.

4. **Демо 3 — заборона прямого коміту в master (PreToolUse, безпека).**
   Перебуваючи на гілці `master`, попросіть:
   > закомить поточні зміни з повідомленням "test"

   `block_direct_master_commit.sh` перевіряє поточну гілку через
   `git branch --show-current`; якщо це `master`/`main` — блокує коміт
   (exit 2) і пояснює, що потрібен feature-branch + Pull Request. На
   будь-якій іншій гілці коміт проходить безперешкодно.

5. **Демо 4 — сповіщення про створений PR (PostToolUse).** На
   feature-гілці попросіть Claude Code відкрити Pull Request через
   `gh pr create`. Після успішного виконання `notify_pr_created.sh`
   пришле push-сповіщення на телефон із посиланням на PR.

6. **Демо 5 — власний канал сповіщень (Notification, опційно).** Коли
   самому Claude Code потрібна ваша увага (наприклад, запит дозволу на
   дію), `notify_mobile.sh` дублює це сповіщення як push через ntfy.sh.

   **Але спершу перевір нативний спосіб — він простіший і не потребує
   жодного хука:**

   1. Постав застосунок **Claude** на телефон (iOS/Android), увійди
      тим самим акаунтом, що й у терміналі.
   2. У `~/.claude/settings.json` додай:
      ```json
      { "remoteControlAtStartup": true }
      ```
      (або тумблер **Enable Remote Control for all sessions** у `/config`)
   3. У `/config` → блок **Notifications** — увімкни:
      - **Push when actions required** — пуш, коли Claude чекає дозволу
      - **Push when Claude decides** — пуш, коли сам Claude вирішив
        сповістити (задача завершена тощо)

   Після цього нотифікації йдуть напряму у застосунок Claude на
   телефоні. `notify_mobile.sh` лишається в репозиторії як приклад
   **власного** каналу сповіщень (Discord, Slack, Pushover тощо) —
   бери його за основу, коли потрібен канал, відмінний від застосунку
   Claude, або коли хочеш і push, і, наприклад, запис у Slack-канал
   команди одночасно.

   ⚠️ Відома проблема: іноді пуші не доходять навіть при увімкнених
   тумблерах (частіше на Windows) — пристрій показує "прив'язаний", але
   сповіщення не приходять. Якщо це твій випадок — це не помилка
   налаштування, а відомий баг.

### Налаштування push-сповіщень через ntfy.sh (демо 4 і 5)

Обидва сповіщення йдуть через безкоштовний сервіс [ntfy.sh](https://ntfy.sh):

```bash
export NTFY_TOPIC="my-claude-code-<унікальний-суфікс>"
```

Встановіть застосунок **ntfy** на телефон (Android/iOS) і підпишіться на
той самий топік. Без заданого `NTFY_TOPIC` обидва хуки просто нічого не
роблять (exit 0) — це не ламає інші дії.

## Якщо щось не спрацювало

| Симптом | Причина |
|---------|---------|
| Хуки не запускаються | `claude` запущено не з кореня репо, або не підтверджено довіру до проектних хуків |
| Немає `✓ black` | не встановлено `black` |
| Хуки падають | не встановлено `jq` |
| Коміт у `main` не блокується | поточна гілка не `main`/`master` (`git branch --show-current`) |
| Немає пуша | не задано `NTFY_TOPIC` або немає підписки на топік |

Після репетиції верніть `src/app.py` до чистого стану: `git restore .`

## Як влаштовані хуки

- `.claude/settings.json` реєструє події `PreToolUse`, `PostToolUse` і
  `Notification`, кожна вказує на shell-скрипт у `hooks/`.
- Хук отримує контекст виклику як **JSON на stdin** — читаємо його один
  раз у змінну (`input="$(cat)"`) і далі парсимо через `jq` скільки
  потрібно разів, щоб не втратити дані з другого читання stdin.
- `exit 0` — дія дозволена; `exit 2` у `PreToolUse` — дія заблокована, і
  `stderr` повертається Claude як причина відмови.
- `PostToolUse` і `Notification` не можуть скасувати дію (вона вже
  сталась) — тільки реагувати: форматувати, логувати, сповіщати.

## Залежності для локального запуску

| Пакет | Для чого | Обов'язковий |
|-------|----------|--------------|
| `jq` | парсинг JSON контексту в усіх хуках | так |
| `git` | визначення поточної гілки (`block_direct_master_commit.sh`) | так |
| `black` | форматування `.py` (демо 1) | для демо 1 |
| `gh` (GitHub CLI) | створення PR (демо 4) | для демо 4 |
| `curl` | push-сповіщення через ntfy.sh (демо 4, 5) | для демо 4, 5 |
| `node` (`npx`, `prettier`) | форматування `.js .jsx .ts .tsx .json .css .md` | ні |

Встановлення:

```bash
# macOS (Homebrew)
brew install jq git gh node
pipx install black        # або: pip install black

# Debian/Ubuntu
sudo apt install jq git curl nodejs npm
pipx install black        # або: pip install black
# gh: https://github.com/cli/cli#installation
```

Перевірка:

```bash
jq --version && git --version && gh --version && black --version && npx --version
```

Якщо якогось інструмента немає — відповідний хук або пропускає крок
(`|| true`), або мовчки виходить (`exit 0`), не ламаючи основну дію.

## Презентація

- **Назва:** «Claude Code: Хуки» (`claude-hooks-15min.pptx`)
- **Формат:** 15 хвилин, для інженерів та менеджерів
- **Відкрити в браузері:** [claude-hooks-15min.pptx](https://drive.google.com/file/d/1bTMxDjEOO0oU_MDOpmpvQErJVv8yLV7m/view)

## Джерело

Матеріал доповіді «Claude Code: Хуки» (15 хв, інженери та менеджери).
Офіційна документація: `code.claude.com/docs` → Hooks.
