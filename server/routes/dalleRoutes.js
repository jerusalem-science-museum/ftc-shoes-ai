import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { hasOpenAIKey } from "../config/openaiKey.js";

dotenv.config();

const router = express.Router();

const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const imageSize = process.env.OPENAI_IMAGE_SIZE || "1024x1024";
const imageQuality = process.env.OPENAI_IMAGE_QUALITY || "low";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function buildShoePrompt(prompt) {
  return [
    "Create a realistic studio product image of a pair of shoes on a clean white background.",
    "Interpret the visitor description directly, even if it is written in Hebrew, Arabic, or English.",
    "Do not add text, labels, logos, or watermarks unless the visitor explicitly requested them.",
    `Visitor description: ${prompt}`,
  ].join(" ");
}

router.route("/").get((req, res) => {
  res.send("Hello from Dalle");
});

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!String(prompt || "").trim()) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    if (!hasOpenAIKey()) {
      return res.status(400).json({
        code: "missing_api_key",
        needsApiKey: true,
        message: "Missing OpenAI API key. Enter it below to save it locally.",
      });
    }

    const aiResponse = await getOpenAIClient().images.generate({
      model: imageModel,
      prompt: buildShoePrompt(prompt),
      n: 1,
      size: imageSize,
      quality: imageQuality,
      moderation: "auto",
    });

    const image = aiResponse.data?.[0]?.b64_json;
    if (!image) {
      throw new Error("OpenAI did not return image data.");
    }

    res.status(200).json({ photo: image });
  } catch (error) {
    const message =
      error?.error?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Image generation failed.";
    const isApiKeyError =
      error?.status === 401 ||
      error?.code === "invalid_api_key" ||
      /api key/iu.test(message);

    console.error(message);
    res.status(error.status || 500).json({
      code: isApiKeyError ? "api_key_error" : "image_generation_failed",
      needsApiKey: isApiKeyError,
      message,
    });
  }
});

export default router;
