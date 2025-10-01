// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; // Add user id to session
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        accessToken?: string;   // Keep OAuth accessToken
        refreshToken?: string;  // Keep OAuth refreshToken
    }

    interface User {
        id: string; // Ensure User always has an id
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;            // Persist user id in JWT
        accessToken?: string;   // Persist OAuth accessToken
        refreshToken?: string;  // Persist OAuth refreshToken
    }
}
