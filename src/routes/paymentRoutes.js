import express from "express";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// পেমেন্ট সাকসেস রেকর্ড ও সাবস্ক্রিপশন আপডেট
router.post("/success", verifyToken, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    const userId = req.user.id;

    const newPayment = new Payment({
      user: userId,
      transactionId: transactionId || "TXN_" + Date.now(),
      email: req.user.email || "user@example.com",
      amount: amount || 5,
    });
    await newPayment.save();

    // ইউজারের সাবস্ক্রিপশন Premium এ আপডেট
    await User.findByIdAndUpdate(userId, { subscription: "Premium" });

    res.json({
      success: true,
      message: "Subscription Upgraded to Premium Successfully!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;