import { randomBytes } from "node:crypto";
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import {
  decode,
  type Lang,
  problem,
  type Result,
  report,
} from "./snowflake.ts";

type Interaction = ButtonInteraction | ChatInputCommandInteraction;
type Session = {
  owner: string;
  guild: string;
  channel: string;
  message: string;
  expires: number;
  result: Result;
  lang: Lang;
  busy: boolean;
  clicked: number;
};
const TTL = 300000;
export class Reports {
  readonly sessions = new Map<string, Session>();
  readonly cooldowns = new Map<string, number>();
  readonly guildId: string;
  readonly applicationId: string;
  readonly now: () => number;
  constructor(guildId: string, applicationId: string, now = Date.now) {
    this.guildId = guildId;
    this.applicationId = applicationId;
    this.now = now;
  }
  prune(): void {
    const now = this.now();
    for (const [key, s] of this.sessions)
      if (s.expires <= now) this.sessions.delete(key);
    for (const [key, until] of this.cooldowns)
      if (until <= now) this.cooldowns.delete(key);
  }
  buttons(key: string, lang: Lang) {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`sd:${key}:report`)
          .setLabel(lang === "tr" ? "Rapor" : "Report")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`sd:${key}:formats`)
          .setLabel(lang === "tr" ? "Tarih biçimleri" : "Date formats")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`sd:${key}:close`)
          .setLabel(lang === "tr" ? "Kapat" : "Close")
          .setStyle(ButtonStyle.Danger),
      ),
    ];
  }
  async handle(i: Interaction): Promise<void> {
    this.prune();
    const lang: Lang = i.locale === "tr" ? "tr" : "en";
    const replyError = async (code: string, selected = lang) => {
      await i.reply({
        content: problem(selected, code),
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    };
    if (
      i.applicationId !== this.applicationId ||
      i.guildId !== this.guildId ||
      !i.channelId ||
      !i.memberPermissions?.has(PermissionFlagsBits.ViewChannel) ||
      !i.appPermissions?.has(PermissionFlagsBits.ViewChannel) ||
      i.appPermissions.has(PermissionFlagsBits.Administrator)
    ) {
      await replyError("access");
      return;
    }
    if (i.isChatInputCommand()) {
      if (i.commandName !== "snowdropid") return;
      const requested = i.options.getString("language");
      const selected: Lang =
        requested === "tr" || requested === "en" ? requested : lang;
      const gate = `${i.guildId}:${i.user.id}`;
      if (
        this.sessions.size >= 100 ||
        this.cooldowns.size >= 1000 ||
        this.cooldowns.has(gate)
      ) {
        await replyError("busy", selected);
        return;
      }
      this.cooldowns.set(gate, this.now() + 5000);
      let result: Result;
      try {
        result = decode(i.options.getString("id", true), this.now());
      } catch (error) {
        await replyError(
          error instanceof Error ? error.message : "id",
          selected,
        );
        return;
      }
      const key = randomBytes(16).toString("hex");
      const s: Session = {
        owner: i.user.id,
        guild: i.guildId,
        channel: i.channelId,
        message: "",
        expires: this.now() + TTL,
        result,
        lang: selected,
        busy: true,
        clicked: 0,
      };
      this.sessions.set(key, s);
      try {
        await i.deferReply({ flags: MessageFlags.Ephemeral });
        const message = await i.editReply({
          content: report(result, selected),
          components: this.buttons(key, selected),
          allowedMentions: { parse: [] },
        });
        s.message = message.id;
        s.busy = false;
      } catch {
        this.sessions.delete(key);
        throw new Error("response");
      }
      return;
    }
    const match = /^sd:([a-f0-9]{32}):(report|formats|close)$/.exec(i.customId);
    const key = match?.[1];
    const action = match?.[2];
    const s = key ? this.sessions.get(key) : undefined;
    if (
      !s ||
      !key ||
      s.owner !== i.user.id ||
      s.guild !== i.guildId ||
      s.channel !== i.channelId ||
      s.message !== i.message.id ||
      i.message.author.id !== this.applicationId ||
      !i.message.flags.has(MessageFlags.Ephemeral)
    ) {
      await replyError("session");
      return;
    }
    if (s.busy || this.now() - s.clicked < 1000) {
      await replyError("busy", s.lang);
      return;
    }
    s.busy = true;
    s.clicked = this.now();
    if (action === "close") this.sessions.delete(key);
    try {
      await i.update({
        content:
          action === "close"
            ? problem(s.lang, "closed")
            : report(s.result, s.lang, action === "formats"),
        components: action === "close" ? [] : this.buttons(key, s.lang),
        allowedMentions: { parse: [] },
      });
    } finally {
      s.busy = false;
    }
  }
}
