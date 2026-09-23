// PreToolUse hook — спрацьовує ДО запуску Write/Edit.
// Якщо цільовий файл — .env або схожий на секрети, блокує дію кодом
// виходу 2 і пояснює причину у stderr (це бачить Claude).
import { beep, deny, readInput, say } from "./lib.mjs";

const input = await readInput();
const filePath = input.tool_input?.file_path ?? "";

if (filePath.includes(".env") || filePath.includes("secrets")) {
  deny(
    `🔒 Заблоковано хуком protect_env: правка '${filePath}' без явного дозволу людини заборонена.`,
  );
}

beep("Pop");
say(`🔒 protect_env: '${filePath}' не секретний — правку дозволено`);
