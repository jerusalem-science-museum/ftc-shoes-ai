import { copyFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
    });
  });
}

function ensureEnvFile() {
  const envPath = path.join(rootDir, "server", ".env");
  const examplePath = path.join(rootDir, "server", ".env.example");

  if (!existsSync(envPath)) {
    copyFileSync(examplePath, envPath);
    console.log("Created server/.env from server/.env.example");
  }
}

ensureEnvFile();

await run(npmCommand, ["install"], path.join(rootDir, "server"));
await run(npmCommand, ["install"], path.join(rootDir, "client"));

console.log("");
console.log("Setup complete.");
console.log("Edit server/.env and replace paste-your-api-key-here with the museum OpenAI API key.");
console.log("Then run: npm run dev");
