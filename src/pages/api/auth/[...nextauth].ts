import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";
import type { Session, Account } from "next-auth";

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,   // non-null assertion
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt(
            { token, account }: { token: JWT; account?: Account | null }
        ) {
            // only set when provider returns it
            if (account?.access_token) {
                token.accessToken = account.access_token; // save to JWT
            }
            return token;
        },
        async session(
            { session, token }: { session: Session; token: JWT }
        ) {
            // expose token value on session
            if (token.accessToken) {
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
});
