// src/pages/dashboard.tsx
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn(undefined, { callbackUrl: "/dashboard" });
        },
    });

    if (status === "loading") return <p className="text-center mt-10">Loading...</p>;

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    Dashboard <span className="text-sm text-gray-500">(protected)</span>
                </h1>

                <p className="text-gray-700 text-center mb-6">
                    Signed in as{" "}
                    <span className="font-medium text-blue-600">
                        {session?.user?.email ?? session?.user?.name ?? "Unknown"}
                    </span>
                </p>

                <button
                    onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
                >
                    Sign out
                </button>
            </div>
        </main>
    );
}
