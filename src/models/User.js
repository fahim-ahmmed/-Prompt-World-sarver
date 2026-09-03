import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoURL: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
    },
    subscription: {
      type: String,
      enum: ["Free", "Premium"],
      default: "Free",
    },
  },
  { timestamps: true }
);

// ডিফল্ট এক্সপোর্ট নিশ্চিত করা
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;