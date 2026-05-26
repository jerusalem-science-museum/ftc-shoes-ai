import express from "express";
import { hasOpenAIKey, saveOpenAIKey } from "../config/openaiKey.js";

const router = express.Router();

router.route("/status").get((req, res) => {
  res.status(200).json({ hasOpenAIKey: hasOpenAIKey() });
});

router.route("/openai-key").post(async (req, res) => {
  try {
    await saveOpenAIKey(req.body.apiKey);
    res.status(200).json({
      success: true,
      hasOpenAIKey: true,
      message: "API key saved locally.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Could not save API key.",
    });
  }
});

export default router;
