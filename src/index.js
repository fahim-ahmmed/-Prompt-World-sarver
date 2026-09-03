import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Route Imports
import authRoutes from "./routes/authRoutes.js"; // আপনার বিদ্যমান Auth Routes (যদি থাকে)
import promptRoutes from "./routes/promptRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/promptworld");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Base Route for Health Check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "PromptWorld API Server is Running Smoothly 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Error Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Server Initialization
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});