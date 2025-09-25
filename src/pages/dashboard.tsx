import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Dashboard = () => {
    const { data: session, status } = useSession();  // Type for session is automatically inferred by next-auth
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;  // Do nothing while the session is loading
        if (!session) {
            router.push("/login");  // Redirect to login page if the user is not logged in
        }
    }, [session, status, router]);

    if (!session) {
        return null;  // Do not render the page if the user is not logged in
    }

    return (
        <div>
            <h1>Welcome to your Dashboard</h1>
        </div>
    );
};

export default Dashboard;
