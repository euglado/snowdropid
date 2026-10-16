import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Options,
} from "discord.js";
import { loadConfig } from "./config.ts";
import { Reports } from "./handler.ts";
import { problem } from "./snowflake.ts";

async function main() {
  const settings = loadConfig();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [] },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
      GuildMemberManager: 0,
      UserManager: 0,
    }),
    rest: { retries: 0, timeout: 10000, rejectOnRateLimit: () => true },
  });
  const reports = new Reports(settings.guildId, settings.applicationId);
  const timer = setInterval(() => reports.prune(), 30000);
  timer.unref();
  client.once(Events.ClientReady, (ready) => {
    if (ready.user.id !== settings.applicationId) {
      console.error(
        "Application ID does not match bot. Uygulama ID botla eşleşmiyor.",
      );
      client.destroy();
      process.exitCode = 1;
      return;
    }
    console.log(
      "SnowdropID ready / hazır. Private reports only / Yalnızca özel raporlar.",
    );
  });
  client.on(Events.InteractionCreate, async (i) => {
    if (!i.isChatInputCommand() && !i.isButton()) return;
    try {
      await reports.handle(i);
    } catch {
      console.error(
        "Interaction failed; no interaction content logged. Etkileşim başarısız.",
      );
      const payload = {
        content: problem(i.locale === "tr" ? "tr" : "en"),
        allowedMentions: { parse: [] as never[] },
      };
      try {
        if (i.deferred && !i.replied)
          await i.editReply({ ...payload, components: [] });
        else if (!i.replied)
          await i.reply({ ...payload, flags: MessageFlags.Ephemeral });
      } catch {
        /* Expired or unavailable interaction; no retries. */
      }
    }
  });
  client.on(Events.Error, () =>
    console.error("Discord connection error. Discord bağlantı hatası."),
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(timer);
      reports.sessions.clear();
      reports.cooldowns.clear();
      client.destroy();
    });
  await client.login(settings.token);
}
main().catch(() => {
  console.error(
    "Cannot start. Run setup.cmd or ./setup.sh; check token and network. Başlatılamadı; kurulum, token ve bağlantıyı kontrol edin.",
  );
  process.exitCode = 1;
});
