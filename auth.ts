import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import connectDB from "./lib/db";
import User from "./models/User";
import { z } from "zod";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          await connectDB();
          const user = await User.findOne({ email });
          
          if (!user || !user.password) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            const WorkspaceMember = (await import("./models/WorkspaceMember")).default;
            const membership = await WorkspaceMember.findOne({ userId: user._id });
            const workspaceRole = membership ? membership.role : "MEMBER";

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: workspaceRole,
            };
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
