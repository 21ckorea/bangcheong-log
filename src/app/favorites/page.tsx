import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.config";
import FavoritesClient from "./FavoritesClient";
import { getFavoritePrograms } from "@/app/actions/user";

export default async function FavoritesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const result = await getFavoritePrograms();

    if (!result.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load favorites</p>
            </div>
        );
    }

    return <FavoritesClient favorites={result.data || []} />;
}
