import express from "express";
import Report from "../models/Report.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// প্রম্পট রিপোর্ট করা
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { promptId, reason, description } = req.body;
    const reporterId = req.user.id;

    const newReport = new Report({
      prompt: promptId,
      reporter: reporterId,
      reason,
      description
    });

    await newReport.save();
    res.status(201).json({ success: true, message: "Report submitted to admin for review." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;