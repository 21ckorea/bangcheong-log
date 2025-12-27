import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminClient from "./AdminClient";
import { getAllUsers, getUserStats } from "@/app/actions/admin";
import { getProgramRequests } from "@/app/actions/request";

export default async function AdminPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/");
    }

    const [usersResult, statsResult, requestsResult] = await Promise.all([
        getAllUsers(),
        getUserStats(),
        getProgramRequests(),
    ]);

    if (!usersResult.success || !statsResult.success || !requestsResult.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load admin data</p>
            </div>
        );
    }

    return <AdminClient users={usersResult.data || []} stats={statsResult.data || { totalUsers: 0, usersWithFavorites: 0, recentUsers: 0 }} requests={requestsResult.data || []} />;
}
