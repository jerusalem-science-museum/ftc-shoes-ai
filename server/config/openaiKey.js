import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(serverDir, ".env");

export function hasOpenAIKey() {
  return Boolean(
    process.env.OPENAI_API_KEY &&
      !process.env.OPENAI_API_KEY.includes("paste-your-api-key")
  );
}

function isValidApiKey(apiKey) {
  return (
    typeof apiKey === "string" &&
    apiKey.trim().length >= 20 &&
    !apiKey.includes("\n") &&
    !apiKey.includes("\r")
  );
}

function upsertEnvValue(envText, key, value) {
  const escapedValue = value.replace(/\\/gu, "\\\\").replace(/"/gu, '\\"');
  const line = `${key}=${escapedValue}`;
  const matcher = new RegExp(`^${key}=.*$`, "mu");

  if (matcher.test(envText)) {
    return `${envText.replace(matcher, line).trimEnd()}\n`;
  }

  return `${envText.trimEnd()}\n${line}\n`;
}

async function readEnvFile() {
  try {
    return await fs.readFile(envPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

export async function saveOpenAIKey(apiKey) {
  const trimmedKey = String(apiKey || "").trim();

  if (!isValidApiKey(trimmedKey)) {
    const error = new Error("Please enter a valid OpenAI API key.");
    error.status = 400;
    throw error;
  }

  const envText = await readEnvFile();
  await fs.writeFile(envPath, upsertEnvValue(envText, "OPENAI_API_KEY", trimmedKey));
  process.env.OPENAI_API_KEY = trimmedKey;
}
