import express from "express";
import Prompt from "../models/Prompt.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ১. প্রম্পট তৈরি করা (ফ্রি ইউজারের জন্য ৩টি প্রম্পট লিমিটেশন)
router.post("/create", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user && user.subscription === "Free") {
      const existingPrompts = await Prompt.countDocuments({ creator: userId });
      if (existingPrompts >= 3) {
        return res.status(403).json({
          message: "Free limit reached (Max 3 prompts). Please upgrade to Premium!",
        });
      }
    }

    const newPrompt = new Prompt({
      ...req.body,
      creator: userId,
      status: "pending", // অ্যাডমিন এপ্রুভালের জন্য বাই-ডিফল্ট পেন্ডিং
    });

    await newPrompt.save();
    res.status(201).json({
      success: true,
      message: "Prompt submitted! Waiting for Admin Approval.",
      prompt: newPrompt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ২. মার্কেটপ্লেসের জন্য ফিল্টার, সার্চ ও প্যাগিনেশনসহ এপিআই
router.get("/all", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search = "",
      category,
      aiTool,
      difficulty,
      sort,
    } = req.query;

    const query = { status: "approved" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { aiTool: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") query.category = category;
    if (aiTool && aiTool !== "All") query.aiTool = aiTool;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;

    let sortOption = { createdAt: -1 };
    if (sort === "Most Copied") sortOption = { copyCount: -1 };

    const prompts = await Prompt.find(query)
      .populate("creator", "name email photoURL")
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Prompt.countDocuments(query);

    res.json({
      success: true,
      prompts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalPrompts: total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ৩. কপি কাউন্ট আপডেট
router.patch("/copy/:id", verifyToken, async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { copyCount: 1 } },
      { new: true }
    );
    res.json({ success: true, copyCount: prompt.copyCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ৪. নির্দিষ্ট প্রম্পট ডিটেইলস
router.get("/:id", async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id).populate(
      "creator",
      "name email photoURL"
    );
    if (!prompt) {
      return res.status(404).json({ success: false, message: "Prompt not found" });
    }
    res.json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;