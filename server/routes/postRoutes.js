import express from "express";
import { createPost, listPosts } from "../storage/posts.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    const posts = await listPosts(req);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Fetching posts failed, please try again",
    });
  }
});

router.route("/").post(async (req, res) => {
  try {
    const newPost = await createPost(req.body, req);
    res.status(201).json({
      success: true,
      data: newPost,
      message: "The file has been saved!",
    });
  } catch (error) {
    console.error(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

export default router;
