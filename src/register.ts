import { REST, Routes } from "discord.js";
import { command } from "./commands.ts";
import { loadConfig } from "./config.ts";

async function register() {
  const settings = loadConfig();
  const rest = new REST({
    version: "10",
    retries: 0,
    timeout: 10000,
    rejectOnRateLimit: () => true,
  }).setToken(settings.token);
  await rest.post(
    Routes.applicationGuildCommands(settings.applicationId, settings.guildId),
    { body: command.toJSON() },
  );
  console.log(
    "/snowdropid registered in the configured server. Komut yapılandırılmış sunucuya kaydedildi.",
  );
}
register().catch(() => {
  console.error(
    "Registration failed. Run setup; check application/server IDs, install, token and network. Kayıt başarısız; kurulumu, ID'leri, bot davetini ve bağlantıyı kontrol edin.",
  );
  process.exitCode = 1;
});
