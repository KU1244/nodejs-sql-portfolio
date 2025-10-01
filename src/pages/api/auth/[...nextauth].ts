// src/pages/api/auth/[...nextauth].ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// Define what part of User we want to expose in session/JWT
type SafeUser = {
    id: string;
    email: string;
    name?: string | null;
};

export const authOptions: NextAuthOptions = {
    providers: [
        // Email/Password login
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(
                credentials
            ): Promise<SafeUser | null> {
                // 1) Validate incoming credentials
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // 2) Find user in DB
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user || !user.passwordHash) {
                    return null;
                }

                // 3) Compare password using bcrypt
                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );
                if (!isValid) {
                    return null;
                }

                // 4) Return a safe object (no passwordHash)
                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                };
            },
        }),

        // Optional: OAuth providers
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // JWT valid for 30 days
        updateAge: 24 * 60 * 60,   // Refresh every 24h
    },

    callbacks: {
        // Store user id into JWT
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as SafeUser).id;
            }
            return token;
        },

        // Expose user id inside session
        async session({ session, token }) {
            if (session.user && token?.id) {
                session.user.id = String(token.id);
            }
            return session;
        },
    },

    pages: {
        signIn: "/login", // Custom login page
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
