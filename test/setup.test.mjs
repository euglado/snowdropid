import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { hiddenToken } from "../scripts/setup.mjs";

function terminal() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (raw) => {
    input.isRaw = raw;
  };
  input.resume = () => {};
  input.pause = () => {};
  let output = "";
  return {
    input,
    output: {
      write: (text) => {
        output += text;
      },
    },
    printed: () => output,
  };
}
test("hidden token input never echoes characters and restores terminal mode", async () => {
  const t = terminal();
  const secret = "x".repeat(40);
  const pending = hiddenToken(t.input, t.output);
  t.input.emit("data", Buffer.from(`${secret}\r`));
  assert.equal(await pending, secret);
  assert(!t.printed().includes(secret));
  assert.equal(t.input.isRaw, false);
  assert.equal(t.input.listenerCount("data"), 0);
});
test("hidden token backspace works and cancellation restores mode", async () => {
  const t = terminal();
  const pending = hiddenToken(t.input, t.output);
  t.input.emit("data", Buffer.from("ab\u007fc\r"));
  assert.equal(await pending, "ac");
  const cancelled = hiddenToken(t.input, t.output);
  t.input.emit("data", Buffer.from("\u0003"));
  await assert.rejects(cancelled, /Cancelled/);
  assert.equal(t.input.isRaw, false);
});
test("invalid pasted token and noninteractive input fail closed", async () => {
  const t = terminal();
  const pending = hiddenToken(t.input, t.output);
  t.input.emit("data", Buffer.from("abc def\r"));
  await assert.rejects(pending);
  assert.equal(t.input.isRaw, false);
  t.input.isTTY = false;
  await assert.rejects(hiddenToken(t.input, t.output));
});
