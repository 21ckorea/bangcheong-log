import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.config";
import LogClient from "./LogClient";
import { getApplicationLogs } from "@/app/actions/log";

export default async function LogPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const result = await getApplicationLogs();

    if (!result.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load logs</p>
            </div>
        );
    }

    return <LogClient logs={result.data || []} />;
}
