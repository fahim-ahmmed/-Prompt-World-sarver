import mongoose from "mongoose";

let isConnected = false;

// Better Auth talks to MongoDB through its own native-driver adapter (see lib/auth.js).
// This mongoose connection is separate and is only for OUR domain models (Prompt, Review, etc).
// Both point at the same MONGODB_URI / database - they just use different drivers.
export async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log(`[db] mongoose connected -> ${mongoose.connection.name}`);
  return mongoose.connection;
}
