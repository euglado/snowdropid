import { existsSync } from "node:fs";
import { parseId } from "./snowflake.ts";
export type Config = { token: string; applicationId: string; guildId: string };
export function config(env: NodeJS.ProcessEnv = process.env): Config {
  const token = env.DISCORD_TOKEN ?? "";
  const applicationId = env.DISCORD_APPLICATION_ID ?? "";
  const guildId = env.DISCORD_GUILD_ID ?? "";
  try {
    if (!/^[A-Za-z0-9._-]{30,200}$/.test(token) || token.trim() !== token)
      throw new Error();
    parseId(applicationId);
    parseId(guildId);
  } catch {
    throw new Error(
      "Configuration missing/invalid. Run setup.cmd or ./setup.sh. Yapılandırma eksik/geçersiz; kurulum yardımcısını çalıştırın.",
    );
  }
  return { token, applicationId, guildId };
}
export function loadConfig(): Config {
  if (existsSync(".env")) process.loadEnvFile(".env");
  return config();
}
