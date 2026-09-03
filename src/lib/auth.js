import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable in .env");
}

// MongoDB Client Connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

const isProd = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

export const auth = betterAuth({
  // BROWSER Origin Configuration
  baseURL: clientUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [clientUrl],

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Map Google profile picture to photoURL
      mapProfileToUser: (profile) => ({
        photoURL: profile.picture,
      }),
    },
  },

  // Role-based access control & custom fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user", // user | creator | admin
        input: false,
      },
      isPremium: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      photoURL: {
        type: "string",
        required: false,
      },
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    },
  },
});