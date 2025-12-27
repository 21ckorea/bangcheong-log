import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.config";
import ProfileClient from "./ProfileClient";
import { getUserProfile } from "@/app/actions/user";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const result = await getUserProfile();

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load profile</p>
            </div>
        );
    }

    return <ProfileClient user={result.data} />;
}
