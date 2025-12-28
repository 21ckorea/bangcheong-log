
import { auth } from "@/lib/auth.config";
import { getReviews } from "@/app/actions/community";
import CommunityClient from "./CommunityClient";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
    const session = await auth();
    const { data: reviews, success } = await getReviews(1, 20); // Initial load

    return (
        <CommunityClient
            initialReviews={success && reviews ? reviews : []}
            userId={session?.user?.id}
        />
    );
}
