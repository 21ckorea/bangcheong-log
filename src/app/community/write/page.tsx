
import { auth } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import WriteClient from "./WriteClient";

export default async function WritePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin?callbackUrl=/community/write");
    }

    return <WriteClient />;
}
