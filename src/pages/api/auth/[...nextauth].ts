import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT, account: any }) {
            // account情報からaccess_tokenを取得してtokenに追加
            if (account && account.access_token) {
                token.accessToken = account.access_token; // accessTokenをtokenに追加
            }
            return token;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            // トークンからaccessTokenをセッションに追加
            if (token?.accessToken) {
                session.accessToken = token.accessToken; // accessTokenをsessionに追加
            }
            return session;
        },
    },
});
