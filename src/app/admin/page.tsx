import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminClient from "./AdminClient";
import { getAllUsers, getUserStats } from "@/app/actions/admin";

export default async function AdminPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/");
    }

    const [usersResult, statsResult] = await Promise.all([
        getAllUsers(),
        getUserStats(),
    ]);

    if (!usersResult.success || !statsResult.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load admin data</p>
            </div>
        );
    }

    return <AdminClient users={usersResult.data || []} stats={statsResult.data || { totalUsers: 0, usersWithFavorites: 0, recentUsers: 0 }} />;
}
