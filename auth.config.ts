import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    // We will define the full provider in auth.ts
    // This file is for middleware-compatible config
  ],
  callbacks: {
    authorized() {
      // Return true to disable default NextAuth redirects and let middleware.ts handle all route protection.
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id || (user as any)._id?.toString();
        token.name = user.name;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || "MEMBER";
        session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
