// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

// Extend the NextAuth session to include accessToken and refreshToken
declare module "next-auth" {
    interface Session {
        accessToken?: string;  // Access token stored in session
        refreshToken?: string;  // Refresh token stored in session
    }
}

// Extend the JWT token interface to include accessToken and refreshToken
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;  // Access token in JWT
        refreshToken?: string;  // Refresh token in JWT
    }
}
