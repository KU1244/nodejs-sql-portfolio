// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        accessToken?: string;  // Adding accessToken to session type
        refreshToken?: string;  // Adding refreshToken to session type
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;  // Adding accessToken to JWT type
        refreshToken?: string;  // Adding refreshToken to JWT type
    }
}

