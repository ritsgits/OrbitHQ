import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    // We will define the full provider in auth.ts
    // This file is for middleware-compatible config
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = 
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/crm") ||
        nextUrl.pathname.startsWith("/projects") ||
        nextUrl.pathname.startsWith("/tasks") ||
        nextUrl.pathname.startsWith("/team") ||
        nextUrl.pathname.startsWith("/settings");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup"))) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.name = user.name;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
