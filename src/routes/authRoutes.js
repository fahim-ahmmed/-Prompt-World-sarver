import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ১. রেজিস্ট্রেশন এপিআই (User/Creator রোল সাপোর্ট সহ)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoURL, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // সিকিউরিটির জন্য শুধুমাত্র "creator" অথবা "user" রোল গ্রহণ করা হবে (admin হিসেবে রেজিস্টার করা যাবে না)
    const assignedRole = role === "creator" ? "creator" : "user";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || "",
      role: assignedRole,
      subscription: "Free",
    });

    await newUser.save();

    // JWT টোকেন জেনারেট
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        photoURL: newUser.photoURL,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ২. লগইন এপিআই
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        subscription: user.subscription || "Free",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;