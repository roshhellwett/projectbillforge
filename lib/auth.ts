import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { db } from "./db";
import { businesses } from "./schema";
import { eq } from "drizzle-orm";
import { getLoginRateLimiter, checkRateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // ── Google OAuth ──
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
      : []),

    // ── Email/Password Credentials ──
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit by email
        const limiter = getLoginRateLimiter();
        const { success } = await checkRateLimit(limiter, credentials.email.trim().toLowerCase());
        if (!success) {
          throw new Error("Too many login attempts. Please try again in a minute.");
        }

        const business = await db.query.businesses.findFirst({
          where: eq(businesses.email, credentials.email.trim().toLowerCase()),
        });

        if (!business || !business.passwordHash || business.passwordHash.length === 0) return null;

        const isValid = await compare(credentials.password, business.passwordHash);
        if (!isValid) return null;

        return {
          id: business.id,
          name: business.name,
          email: business.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: auto-create business record on first login
      if (account?.provider === "google" && user.email) {
        const existing = await db.query.businesses.findFirst({
          where: eq(businesses.email, user.email.toLowerCase()),
        });

        if (!existing) {
          // Create a new business record for the Google user
          const [newBusiness] = await db
            .insert(businesses)
            .values({
              id: crypto.randomUUID(),
              name: user.name || user.email.split("@")[0],
              email: user.email.toLowerCase(),
              passwordHash: "", // No password for OAuth users
            })
            .returning();
          // Override the user id with the DB id
          user.id = newBusiness.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Only runs on initial sign-in (user is populated); subsequent refreshes skip DB lookup
      if (user && account) {
        if (account.provider === "google" && user.email) {
          // id was already set in signIn callback via user.id = newBusiness.id
          token.id = user.id;
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & { id?: string };
        sessionUser.id = token.id as string;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
};
