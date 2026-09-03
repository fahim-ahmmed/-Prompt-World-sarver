import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    promptCode: { type: String, required: true },
    category: { type: String, required: true },
    aiTool: { type: String, required: true },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Pro"], default: "Beginner" },
    thumbnail: { type: String },
    visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
    copyCount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionFeedback: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("Prompt", promptSchema);