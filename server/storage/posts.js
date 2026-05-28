import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(serverDir, "data");
const postsFile = path.join(dataDir, "posts.json");
const submissionsFile = path.join(dataDir, "submissions.json");

export const imagesDir = path.join(serverDir, "dalleImages");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
}

function imageUrl(fileName, req) {
  const configuredBaseUrl = process.env.PUBLIC_SERVER_URL;
  const baseUrl = configuredBaseUrl || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/images/${encodeURIComponent(fileName)}`;
}

function serializePost(post, req) {
  return {
    _id: post._id,
    name: post.name,
    prompt: post.prompt,
    photo: imageUrl(post.fileName, req),
    createdAt: post.createdAt,
  };
}

function getLegacyName(fileName) {
  const parsed = path.parse(fileName);
  const match = parsed.name.match(/^(.*)-(\d{10,})$/u);
  return (match?.[1] || "Visitor").trim() || "Visitor";
}

function getLegacyDate(fileName) {
  const parsed = path.parse(fileName);
  const match = parsed.name.match(/-(\d{10,})$/u);
  const timestamp = Number(match?.[1]);
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : new Date().toISOString();
}

async function seedLegacyPosts() {
  if (!(await pathExists(imagesDir))) return [];

  const files = await fs.readdir(imagesDir);
  return files
    .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()))
    .map((fileName) => ({
      _id: crypto.randomUUID(),
      name: getLegacyName(fileName),
      prompt: "Legacy generated image",
      fileName,
      createdAt: getLegacyDate(fileName),
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function readPosts() {
  await ensureStorage();

  if (!(await pathExists(postsFile))) {
    const legacyPosts = await seedLegacyPosts();
    await writePosts(legacyPosts);
    return legacyPosts;
  }

  const raw = await fs.readFile(postsFile, "utf8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

async function writePosts(posts) {
  await ensureStorage();
  await fs.writeFile(postsFile, `${JSON.stringify(posts, null, 2)}\n`);
}

async function logSubmission(entry) {
  await ensureStorage();
  let log = [];
  try {
    const raw = await fs.readFile(submissionsFile, "utf8");
    if (raw.trim()) log = JSON.parse(raw);
  } catch {
    // file doesn't exist yet — start fresh
  }
  log.push(entry);
  await fs.writeFile(submissionsFile, `${JSON.stringify(log, null, 2)}\n`);
}

function safeFileNamePart(value) {
  const safe = value
    .trim()
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .replace(/\s+/gu, "_")
    .slice(0, 60);

  return safe || "visitor";
}

function parseImageDataUrl(photo) {
  const match = photo.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/u);
  if (!match) {
    const error = new Error("Photo must be a base64 image data URL.");
    error.status = 400;
    throw error;
  }

  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  return {
    extension,
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function listPosts(req) {
  const posts = await readPosts();
  return posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => serializePost(post, req));
}

export async function createPost({ name, prompt, photo }, req) {
  const trimmedName = String(name || "").trim();
  const trimmedPrompt = String(prompt || "").trim();

  if (!trimmedName || !trimmedPrompt || !photo) {
    const error = new Error("Name, prompt, and generated photo are required.");
    error.status = 400;
    throw error;
  }

  const { extension, buffer } = parseImageDataUrl(photo);
  const fileName = `${safeFileNamePart(trimmedName)}-${Date.now()}-${crypto
    .randomUUID()
    .slice(0, 8)}.${extension}`;

  await ensureStorage();
  await fs.writeFile(path.join(imagesDir, fileName), buffer);

  let posts = await readPosts();
  const post = {
    _id: crypto.randomUUID(),
    name: trimmedName,
    prompt: trimmedPrompt,
    fileName,
    createdAt: new Date().toISOString(),
  };

  await logSubmission({ name: trimmedName, prompt: trimmedPrompt, createdAt: post.createdAt });

  posts.push(post);

  const MAX_POSTS = 1000;
  if (posts.length > MAX_POSTS) {
    const sorted = posts.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const toDelete = sorted.slice(0, posts.length - MAX_POSTS);
    const toDeleteIds = new Set(toDelete.map((p) => p._id));
    posts = posts.filter((p) => !toDeleteIds.has(p._id));
    await Promise.allSettled(
      toDelete.map((p) => fs.unlink(path.join(imagesDir, p.fileName)))
    );
  }

  await writePosts(posts);

  return serializePost(post, req);
}
