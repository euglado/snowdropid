import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const approved = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "MIT OR Apache-2.0",
  "(MIT OR Apache-2.0)",
]);
let dependencies = 0;
for (const [path, item] of Object.entries(lock.packages)) {
  if (!path) continue;
  assert(approved.has(item.license), `Unreviewed dependency license: ${path}`);
  assert(
    typeof item.resolved === "string" &&
      item.resolved.startsWith("https://registry.npmjs.org/"),
    `Untrusted registry: ${path}`,
  );
  assert(
    /^sha512-[A-Za-z0-9+/]+=*$/.test(item.integrity ?? ""),
    `Missing SHA-512: ${path}`,
  );
  assert(!item.hasInstallScript, `Unreviewed installation script: ${path}`);
  dependencies++;
}
const patterns = [
  /mfa\.[A-Za-z0-9_-]{50,}/,
  /[A-Za-z0-9_-]{23,30}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/,
  /(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /DISCORD_TOKEN[ \t]*=[ \t]*[A-Za-z0-9._-]{20,}/,
];
let files = 0;
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) scan(path);
    else {
      assert(
        !/^\.env(?:\.|$)/.test(entry.name) || entry.name === ".env.example",
        `Private env file in source: ${relative(".", path)}`,
      );
      const source = readFileSync(path, "utf8");
      for (const pattern of patterns)
        assert(
          !pattern.test(source),
          `Credential pattern: ${relative(".", path)}`,
        );
      files++;
    }
  }
}
scan(".");
console.log(
  `${dependencies} dependency license/registry/SHA-512/no-install-script records and ${files} source credential-pattern scans passed.`,
);
