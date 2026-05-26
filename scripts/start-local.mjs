import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const serverDir = path.join(rootDir, "server");
const clientDir = path.join(rootDir, "client");
const serverEnvPath = path.join(serverDir, ".env");

function hasDependencies(dir) {
  return existsSync(path.join(dir, "node_modules"));
}

function hasConfiguredApiKey() {
  if (!existsSync(serverEnvPath)) return false;
  const env = readFileSync(serverEnvPath, "utf8");
  const match = env.match(/^OPENAI_API_KEY=(.+)$/m);
  return Boolean(match && !match[1].includes("paste-your-api-key"));
}

if (!hasDependencies(serverDir) || !hasDependencies(clientDir)) {
  console.error("Dependencies are missing. Run: npm run setup");
  process.exit(1);
}

if (!hasConfiguredApiKey()) {
  console.warn("OPENAI_API_KEY is not configured in server/.env.");
  console.warn("The app will open, but image generation will show a setup error until the key is added.");
}

function prefixOutput(prefix, stream) {
  stream.on("data", (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/u)) {
      if (line.trim()) console.log(`[${prefix}] ${line}`);
    }
  });
}

function start(name, args, cwd) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });

  prefixOutput(name, child.stdout);
  prefixOutput(name, child.stderr);
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  return child;
}

const server = start("server", ["run", "dev"], serverDir);
const client = start("client", ["run", "dev", "--", "--host", "127.0.0.1"], clientDir);

console.log("");
console.log("ShoeImagine is starting.");
console.log("Open the Local URL printed by Vite, usually http://127.0.0.1:5173/create-post");
console.log("Press Ctrl+C to stop.");

function stop() {
  server.kill();
  client.kill();
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
