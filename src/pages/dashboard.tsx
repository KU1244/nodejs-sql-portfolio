// src/pages/dashboard.tsx
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn(undefined, { callbackUrl: "/dashboard" });
        },
    });

    if (status === "loading") return <p>Loading...</p>;

    return (
        <main style={{ padding: 24 }}>
            <h1>Dashboard (protected)</h1>
            <p>Signed in as {session?.user?.email ?? session?.user?.name ?? "Unknown"}</p>

            {/*  Added logout button */}
            <button onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}>
                Sign out
            </button>
        </main>
    );
}
