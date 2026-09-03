import express from "express";
import Prompt from "../models/Prompt.js";
import User from "../models/User.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// মিডলওয়্যার দিয়ে অ্যাডমিন প্রটেকশন
router.use(verifyToken, checkRole(["admin"]));

// ১. পেন্ডিং প্রম্পট এপ্রুভ করা
router.patch("/prompt/approve/:id", async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ success: true, message: "Prompt Approved Successfully!", prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ২. প্রম্পট রিজেক্ট করা (ফিডব্যাকসহ)
router.patch("/prompt/reject/:id", async (req, res) => {
  try {
    const { feedback } = req.body;
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionFeedback: feedback },
      { new: true }
    );
    res.json({ success: true, message: "Prompt Rejected with Feedback.", prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ৩. ইউজারদের তালিকা দেখা
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ৪. ইউজারের রোল পরিবর্তন করা (User/Creator/Admin)
router.patch("/user/role/:id", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json({ success: true, message: "User Role Updated", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;