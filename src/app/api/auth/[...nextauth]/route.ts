import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        const isValidPassword = await compare(credentials.password as string, process.env.ADMIN_PASSWORD_HASH || "");
        
        if (!isValidEmail || !isValidPassword) return null;
        
        if (process.env.TOTP_SECRET && credentials.token) {
          const speakeasy = require("speakeasy");
          const verified = speakeasy.totp.verify({
            secret: process.env.TOTP_SECRET,
            encoding: "base32",
            token: credentials.token,
            window: 2,
          });
          if (!verified) return null;
        }
        
        return { id: "1", email: credentials.email as string, name: "Admin" };
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
