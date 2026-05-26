import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import postRoutes from "./routes/postRoutes.js";
import dalleRoutes from "./routes/dalleRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import { imagesDir } from "./storage/posts.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      const isLocalOrigin =
        !origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/u.test(origin);

      callback(isLocalOrigin ? null : new Error("Not allowed by CORS"), isLocalOrigin);
    },
  })
);
app.use(express.json({ limit: "50mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/api/v1/post", postRoutes);
app.use("/api/v1/dalle", dalleRoutes);
app.use("/api/config", configRoutes);

app.use("/images", express.static(imagesDir));

app.get("/", async (req, res) => {
  res.send("ShoeImagine local server is running");
});

app.get("/api/health", async (req, res) => {
  res.status(200).json({ ok: true });
});

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});
