import { SlashCommandBuilder } from "discord.js";
export const command = new SlashCommandBuilder()
  .setName("snowdropid")
  .setDescription("Privately inspect the creation time encoded in a Discord ID")
  .setDescriptionLocalizations({
    tr: "Discord ID içindeki oluşturulma zamanını özel olarak incele",
  })
  .addStringOption((o) =>
    o
      .setName("id")
      .setDescription(
        "Copy ID with Discord Developer Mode; no links or mentions",
      )
      .setDescriptionLocalizations({
        tr: "Discord Geliştirici Modu ile ID kopyalayın; bağlantı/etiket girmeyin",
      })
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(20),
  )
  .addStringOption((o) =>
    o
      .setName("language")
      .setDescription("Report language / Rapor dili")
      .addChoices(
        { name: "Türkçe", value: "tr" },
        { name: "English", value: "en" },
      ),
  );
