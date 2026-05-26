import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const releaseDir = path.join(rootDir, "release");
const zipName = "ShoeImagineP-local.zip";
const zipPath = path.join(releaseDir, zipName);

const excludePatterns = [
  "*.DS_Store",
  "*/.DS_Store",
  ".git/*",
  "release/*",
  "client/node_modules/*",
  "client/dist/*",
  "server/node_modules/*",
  "server/.env",
  "server/data/*",
  "server/dalleImages/*",
  "mongodb-macos-x86_64-6.0.6/*",
];

await mkdir(releaseDir, { recursive: true });
await rm(zipPath, { force: true });

const args = [
  "-qr",
  zipPath,
  ".",
  "-x",
  ...excludePatterns,
];

const zip = spawn("zip", args, {
  cwd: rootDir,
  stdio: "inherit",
});

zip.on("close", (code) => {
  if (code !== 0) {
    console.error(`zip failed with code ${code}`);
    process.exit(code || 1);
  }

  console.log(`Created ${path.join("release", zipName)}`);
  console.log("Send this ZIP to the museum. It does not include API keys or generated images.");
});
