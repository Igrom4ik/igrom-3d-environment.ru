import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getSecret } from "@/utils/secrets";

class TwoFactorRequired extends CredentialsSignin {
  code = "2fa_required"
}

const { handlers } = NextAuth({
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

        const storedEmail = getSecret('ADMIN_EMAIL');
        const storedPass = getSecret('ADMIN_PASSWORD');
        const storedHash = getSecret('ADMIN_PASSWORD_HASH');
        const stored2FA = getSecret('ADMIN_SECRET_2FA') || getSecret('TOTP_SECRET');

        // 1. First Run / Setup Mode
        // If no security is configured, allow anyone in to set it up
        if (!storedEmail && !storedPass && !storedHash) {
          return { id: "1", email: credentials.email as string, name: "Admin (Setup)" };
        }
        
        // 2. Validation
        // If email is configured, it must match. If not, skip email check.
        const isValidEmail = storedEmail ? credentials.email === storedEmail : true;
        
        let isValidPassword = false;
        if (storedHash) {
          isValidPassword = await compare(credentials.password as string, storedHash);
        } else if (storedPass) {
          isValidPassword = credentials.password === storedPass;
        }

        if (!isValidEmail || !isValidPassword) return null;
        
        // 3. 2FA Check
        if (stored2FA) {
           if (!credentials.token) {
             throw new TwoFactorRequired();
           }
           
           const speakeasy = require("speakeasy");
           const verified = speakeasy.totp.verify({
             secret: stored2FA,
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
  secret: getSecret('NEXTAUTH_SECRET') || process.env.NEXTAUTH_SECRET,
});

export const GET = handlers.GET;
export const POST = handlers.POST;

export async function generateStaticParams() {
  return [{ nextauth: ['signin'] }];
}
