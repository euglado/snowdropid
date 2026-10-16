import assert from "node:assert/strict";
import { test } from "node:test";
import { command } from "../src/commands.ts";
import { config } from "../src/config.ts";
import {
  decode,
  EPOCH,
  MAX_ID,
  parseId,
  problem,
  report,
  styles,
} from "../src/snowflake.ts";

for (const input of [
  "",
  "0",
  "01",
  "-1",
  "+1",
  "1.0",
  "1e18",
  " 1",
  "1 ",
  "١٢٣",
  "<@123>",
  "https://discord.com/channels/1/2/3",
  "18446744073709551616",
  "999999999999999999999",
  "123\n",
]) {
  test(`reject malformed ID ${JSON.stringify(input)}`, () =>
    assert.throws(() => parseId(input)));
}
test("official Discord example decodes exactly", () => {
  assert.equal(
    decode("175928847299117063", Date.UTC(2026, 9, 16)).iso,
    "2016-04-30T11:18:25.796Z",
  );
});
test("early IDs are valid numbers without existence claims", () => {
  assert.equal(decode("1", Number(EPOCH)).milliseconds, Number(EPOCH));
  assert.equal(parseId(MAX_ID.toString()), MAX_ID);
});
test("all 22 lower bits leave the timestamp unchanged", () => {
  const ms = BigInt(Date.UTC(2025, 5, 1, 12, 34, 56, 789));
  const high = (ms - EPOCH) << 22n;
  for (let low = 0n; low < 4194304n; low += 7919n)
    assert.equal(
      decode((high | low).toString(), Number(ms)).milliseconds,
      Number(ms),
    );
  assert.equal(
    decode((high | 4194303n).toString(), Number(ms)).milliseconds,
    Number(ms),
  );
});
test("independent arithmetic oracle covers 10,000 timestamps without Number ID precision loss", () => {
  for (let n = 1; n <= 10000; n++) {
    const elapsed = BigInt(n) * 27182818n;
    const id = elapsed * 4194304n + BigInt(n % 4096);
    assert.equal(
      decode(id.toString(), Number(EPOCH + elapsed)).milliseconds,
      Number(EPOCH + elapsed),
    );
  }
});
test("future time and invalid clocks fail explicitly", () => {
  const now = Date.UTC(2026, 9, 16);
  const future = ((BigInt(now + 1) - EPOCH) << 22n).toString();
  assert.throws(() => decode(future, now), /future/);
  for (const clock of [NaN, Infinity, 1, 1420070400000.5])
    assert.throws(() => decode("1", clock), /clock/);
});
for (const lang of ["tr", "en"] as const) {
  test(`${lang} report preserves UTC milliseconds and floors Discord seconds`, () => {
    const result = decode("175928847299117063");
    const normal = report(result, lang);
    const formats = report(result, lang, true);
    assert(normal.includes("2016-04-30T11:18:25.796Z"));
    for (const style of styles)
      assert(formats.includes(`\`<t:1462015105:${style}>\``));
    assert(formats.length < 2000);
    assert(!formats.includes("@"));
    assert(normal.includes(lang === "tr" ? "doğrulanmaz" : "not verified"));
  });
  test(`${lang} errors never echo untrusted content`, () => {
    for (const code of [
      "id",
      "future",
      "clock",
      "busy",
      "session",
      "access",
      "closed",
      "unavailable",
      "@everyone",
    ])
      assert(!problem(lang, code).includes("@everyone"));
  });
}
test("configuration fails without echoing secrets and validates both IDs", () => {
  const token = "x".repeat(40);
  for (const env of [
    {},
    { DISCORD_TOKEN: token },
    {
      DISCORD_TOKEN: token,
      DISCORD_APPLICATION_ID: "1",
      DISCORD_GUILD_ID: "01",
    },
  ])
    assert.throws(
      () => config(env),
      (error) => error instanceof Error && !error.message.includes(token),
    );
  assert.equal(
    config({
      DISCORD_TOKEN: token,
      DISCORD_APPLICATION_ID: "1",
      DISCORD_GUILD_ID: "2",
    }).guildId,
    "2",
  );
});
test("registration is bounded, localized and string-based", () => {
  const json = command.toJSON();
  assert.equal(json.name, "snowdropid");
  assert.equal(json.options?.[0]?.type, 3);
  assert.equal(json.options?.[0]?.required, true);
  assert(json.description_localizations?.tr);
});
