import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["Inappropriate Content", "Spam", "Copyright Violation", "Other"],
      required: true
    },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);