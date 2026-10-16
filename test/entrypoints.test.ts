import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const path of ["src/main.ts", "src/register.ts", "scripts/setup.mjs"]) {
  test(`${path} exits safely without credentials or writes`, () => {
    const parent = resolve(tmpdir());
    const dir = mkdtempSync(join(parent, "snowdropid-smoke-"));
    const env = { ...process.env };
    delete env.DISCORD_TOKEN;
    delete env.DISCORD_APPLICATION_ID;
    delete env.DISCORD_GUILD_ID;
    try {
      const run = spawnSync(process.execPath, [join(root, path)], {
        cwd: dir,
        env,
        encoding: "utf8",
        timeout: 15000,
      });
      assert.equal(run.status, 1, run.stderr);
      assert.equal(run.error, undefined);
      assert.equal(readdirSync(dir).length, 0);
      assert(!run.stderr.includes("https://discord.com/api"));
    } finally {
      assert(
        resolve(dir).startsWith(parent + sep) &&
          dirname(dir) === parent &&
          dir.includes("snowdropid-smoke-"),
      );
      rmSync(dir, { recursive: true });
    }
  });
}
