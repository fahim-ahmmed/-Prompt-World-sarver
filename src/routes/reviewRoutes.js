import express from "express";
import Review from "../models/Review.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ১. নতুন রিভিউ যোগ করা
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { promptId, rating, comment } = req.body;
    const userId = req.user.id;

    const newReview = new Review({
      prompt: promptId,
      user: userId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ success: true, message: "Review submitted successfully!", review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ২. নির্দিষ্ট প্রম্পটের রিভিউ পাওয়া
router.get("/prompt/:promptId", async (req, res) => {
  try {
    const reviews = await Review.find({ prompt: req.params.promptId })
      .populate("user", "name email photoURL")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;