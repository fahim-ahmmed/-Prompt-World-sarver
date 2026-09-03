import express from "express";
import Prompt from "../models/Prompt.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// বুকমার্ক টগল (Add/Remove Toggle)
router.post("/toggle/:promptId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const promptId = req.params.promptId;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    const isBookmarked = prompt.bookmarks.includes(userId);

    if (isBookmarked) {
      // রিমুভ বুকমার্ক
      await Prompt.findByIdAndUpdate(promptId, { $pull: { bookmarks: userId } });
      res.json({ success: true, isBookmarked: false, message: "Bookmark removed!" });
    } else {
      // এড বুকমার্ক (ডুপ্লিকেট প্রতিরোধ করবে $addToSet)
      await Prompt.findByIdAndUpdate(promptId, { $addToSet: { bookmarks: userId } });
      res.json({ success: true, isBookmarked: true, message: "Prompt bookmarked!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ইউজারের বুকমার্ক করা প্রম্পট তালিকা
router.get("/my-bookmarks", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const savedPrompts = await Prompt.find({ bookmarks: userId }).populate("creator", "name email");

    res.json({ success: true, savedPrompts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;