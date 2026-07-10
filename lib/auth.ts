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
    
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
      : []),

    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        
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

        if (!business.emailVerified) {
          throw new Error("Account not verified. Please check your email.");
        }

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
      
      if (account?.provider === "google" && user.email) {
        try {
          const existing = await db.query.businesses.findFirst({
            where: eq(businesses.email, user.email.toLowerCase()),
          });

          if (!existing) {
            const [newBusiness] = await db
              .insert(businesses)
              .values({
                id: crypto.randomUUID(),
                name: user.name || user.email.split("@")[0],
                email: user.email.toLowerCase(),
                passwordHash: "",
                emailVerified: new Date(),
              })
              .returning();

            user.id = newBusiness.id;
          } else {
            user.id = existing.id;
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      
      if (user && account) {
        if (account.provider === "google" && user.email) {
          
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
