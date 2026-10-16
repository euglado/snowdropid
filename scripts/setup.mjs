import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { parseId } from "../src/snowflake.ts";

export async function hiddenToken(
  input = process.stdin,
  output = process.stdout,
) {
  if (!input.isTTY || !input.setRawMode) throw new Error("TTY");
  output.write("Bot token (hidden / gizli): ");
  const wasRaw = input.isRaw;
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      input.off("data", data);
      input.setRawMode(wasRaw);
      input.pause();
      output.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const data = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003" || char === "\u0004") {
          finish(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (/^[A-Za-z0-9._-]$/.test(char)) value += char;
        else {
          finish(new Error("Invalid token characters"));
          return;
        }
        if (value.length > 200) {
          finish(new Error("Token too long"));
          return;
        }
      }
    };
    input.on("data", data);
  });
}

async function setup() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error(
      "Open an interactive terminal / Etkileşimli terminal açın.",
    );
  if (existsSync(".env"))
    throw new Error(
      ".env exists; rename it privately before setup / .env var; önce güvenli şekilde yeniden adlandırın.",
    );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let applicationId;
  let guildId;
  try {
    applicationId = (
      await rl.question("Application ID / Uygulama ID: ")
    ).trim();
    guildId = (await rl.question("Server ID / Sunucu ID: ")).trim();
    parseId(applicationId);
    parseId(guildId);
  } finally {
    rl.close();
  }
  const token = await hiddenToken();
  if (!/^[A-Za-z0-9._-]{30,200}$/.test(token))
    throw new Error("Invalid token format / Token biçimi geçersiz.");
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${applicationId}\nDISCORD_GUILD_ID=${guildId}\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Saved locally / Yerel kaydedildi. Never share .env / .env dosyasını paylaşmayın.",
  );
  console.log(
    `Install / Davet: https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=1024&integration_type=0&scope=bot%20applications.commands`,
  );
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  setup().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
