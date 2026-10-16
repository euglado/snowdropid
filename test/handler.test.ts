import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  MessageFlags,
  MessageFlagsBitField,
  PermissionsBitField,
} from "discord.js";
import { Reports } from "../src/handler.ts";

type Payload = {
  content?: string;
  flags?: number;
  components?: unknown[];
  allowedMentions?: { parse: unknown[] };
};
function fixture() {
  let now = Date.UTC(2026, 9, 16);
  const reports = new Reports("2", "3", () => now);
  const calls: { kind: string; payload: Payload }[] = [];
  const command = {
    applicationId: "3",
    guildId: "2",
    channelId: "4",
    user: { id: "5" },
    locale: "en",
    commandName: "snowdropid",
    memberPermissions: new PermissionsBitField(1024n),
    appPermissions: new PermissionsBitField(1024n),
    options: {
      getString: (key: string): string | null =>
        key === "id" ? "175928847299117063" : null,
    },
    isChatInputCommand: () => true,
    reply: async (payload: Payload) => {
      calls.push({ kind: "reply", payload });
    },
    deferReply: async (payload: Payload) => {
      calls.push({ kind: "defer", payload });
    },
    editReply: async (payload: Payload) => {
      calls.push({ kind: "edit", payload });
      return { id: "6" };
    },
  };
  const run = () =>
    reports.handle(command as unknown as ChatInputCommandInteraction);
  const button = (action = "formats") => ({
    ...command,
    isChatInputCommand: () => false,
    customId: `sd:${[...reports.sessions.keys()][0]}:${action}`,
    message: {
      id: "6",
      author: { id: "3" },
      flags: new MessageFlagsBitField(MessageFlags.Ephemeral),
    },
    update: async (payload: Payload) => {
      calls.push({ kind: "update", payload });
    },
  });
  return {
    reports,
    calls,
    command,
    run,
    button,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
test("initial result is private and binds the response before enabling controls", async () => {
  const f = fixture();
  await f.run();
  assert.equal(f.calls[0]?.payload.flags, MessageFlags.Ephemeral);
  assert.equal(f.calls[1]?.kind, "edit");
  assert.deepEqual(f.calls[1]?.payload.allowedMentions, { parse: [] });
  const session = [...f.reports.sessions.values()][0];
  assert.equal(session?.message, "6");
  assert.equal(session?.busy, false);
  assert.equal(f.calls[1]?.payload.components?.length, 1);
});
test("format and close update only the original private reply and delete RAM", async () => {
  const f = fixture();
  await f.run();
  await f.reports.handle(f.button() as unknown as ButtonInteraction);
  assert(f.calls.at(-1)?.payload.content?.includes("Copyable"));
  f.advance(1000);
  await f.reports.handle(f.button("close") as unknown as ButtonInteraction);
  assert.equal(f.reports.sessions.size, 0);
  assert.deepEqual(f.calls.at(-1)?.payload.components, []);
});
for (const tamper of [
  "owner",
  "guild",
  "channel",
  "message",
  "author",
  "public",
  "customId",
  "application",
] as const) {
  test(`reject ${tamper} binding mismatch`, async () => {
    const f = fixture();
    await f.run();
    const b = f.button();
    if (tamper === "owner") b.user = { id: "99" };
    if (tamper === "guild") b.guildId = "99";
    if (tamper === "channel") b.channelId = "99";
    if (tamper === "message") b.message.id = "99";
    if (tamper === "author") b.message.author.id = "99";
    if (tamper === "public") b.message.flags = new MessageFlagsBitField(0);
    if (tamper === "customId") b.customId += ":junk";
    if (tamper === "application") b.applicationId = "99";
    await f.reports.handle(b as unknown as ButtonInteraction);
    assert.equal(f.calls.at(-1)?.kind, "reply");
    assert.equal(f.calls.at(-1)?.payload.flags, MessageFlags.Ephemeral);
    assert.equal(f.reports.sessions.size, 1);
  });
}
test("expired and restarted sessions cannot be used", async () => {
  const f = fixture();
  await f.run();
  const b = f.button();
  f.advance(300000);
  await f.reports.handle(b as unknown as ButtonInteraction);
  assert.equal(f.reports.sessions.size, 0);
  assert(f.calls.at(-1)?.payload.content?.includes("expired"));
  await new Reports("2", "3").handle(b as unknown as ButtonInteraction);
  assert.equal(f.calls.at(-1)?.kind, "reply");
});
test("denied user or bot permissions and Administrator fail closed", async () => {
  for (const mode of ["user", "bot", "admin"]) {
    const f = fixture();
    if (mode === "user")
      f.command.memberPermissions = new PermissionsBitField(0n);
    if (mode === "bot") f.command.appPermissions = new PermissionsBitField(0n);
    if (mode === "admin")
      f.command.appPermissions = new PermissionsBitField(8n);
    await f.run();
    assert.equal(f.reports.sessions.size, 0);
    assert.equal(f.calls[0]?.kind, "reply");
  }
});
test("command cooldown, capacity and periodic pruning are bounded", async () => {
  const f = fixture();
  await f.run();
  await f.run();
  assert(f.calls.at(-1)?.payload.content?.includes("Too fast"));
  f.advance(5000);
  await f.run();
  assert.equal(f.reports.sessions.size, 2);
  for (let n = 0; n < 1000; n++)
    f.reports.cooldowns.set(`other${n}`, Date.UTC(2027, 0, 1));
  f.command.user.id = "new";
  await f.run();
  assert.equal(f.reports.sessions.size, 2);
  f.advance(366 * 86400000);
  f.reports.prune();
  assert.equal(f.reports.sessions.size, 0);
  assert.equal(f.reports.cooldowns.size, 0);
});
test("full session storage rejects without leaking another result", async () => {
  const f = fixture();
  await f.run();
  const s = [...f.reports.sessions.values()][0];
  assert(s);
  for (let n = 0; n < 100; n++) f.reports.sessions.set(`key${n}`, s);
  f.command.user.id = "another";
  await f.run();
  assert.equal(f.calls.at(-1)?.kind, "reply");
});
test("concurrent clicks are rejected while update is in flight", async () => {
  const f = fixture();
  await f.run();
  const b = f.button();
  let release = () => {};
  b.update = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  const pending = f.reports.handle(b as unknown as ButtonInteraction);
  await f.reports.handle(f.button() as unknown as ButtonInteraction);
  assert(f.calls.at(-1)?.payload.content?.includes("Too fast"));
  release();
  await pending;
});
test("a failed initial response deletes the pending session", async () => {
  const f = fixture();
  f.command.editReply = async () => {
    throw new Error("sensitive transport detail");
  };
  await assert.rejects(f.run(), /response/);
  assert.equal(f.reports.sessions.size, 0);
});
test("close deletes memory even if Discord update fails", async () => {
  const f = fixture();
  await f.run();
  const b = f.button("close");
  b.update = async () => {
    throw new Error("offline");
  };
  await assert.rejects(f.reports.handle(b as unknown as ButtonInteraction));
  assert.equal(f.reports.sessions.size, 0);
});
test("invalid input is private and never stored; language is selected explicitly", async () => {
  const f = fixture();
  f.command.options.getString = (key) => (key === "id" ? "@everyone" : "tr");
  await f.run();
  assert.equal(f.reports.sessions.size, 0);
  assert(f.calls.at(-1)?.payload.content?.includes("Yalnızca"));
  assert(!f.calls.at(-1)?.payload.content?.includes("@everyone"));
});
