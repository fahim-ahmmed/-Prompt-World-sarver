import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
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

// Middlewares - Fixed CORS configuration to support all origins without crashing
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// Serverless-friendly MongoDB Connection Handler (Caching)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected via Serverless Cache");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Middleware to ensure DB connection on every request before reaching routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ DB Connection Middleware Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Database Connection Failed",
      error: error.message,
    });
  }
});

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

// Fallback Route - Returns JSON instead of HTML 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Error Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

// MUST export app for Vercel Serverless Functions
export default app;