"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { createApplicationLog } from "@/app/actions/log";
import { cn } from "@/lib/utils";

interface ApplicationLogButtonProps {
    programId: string;
    initialHasLog?: boolean;
}

export default function ApplicationLogButton({ programId, initialHasLog = false }: ApplicationLogButtonProps) {
    const { data: session } = useSession();
    const [hasLog, setHasLog] = useState(initialHasLog);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Check if user is logged in
        if (!session) {
            signIn("google");
            return;
        }

        if (hasLog) {
            // Already logged, do nothing or navigate to log page
            return;
        }

        setIsLoading(true);
        const result = await createApplicationLog(programId, "applied");

        if (result.success) {
            setHasLog(true);
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || hasLog}
            className={cn(
                "p-2 rounded-full transition-all duration-200",
                hasLog
                    ? "bg-green-500/20 text-green-500 cursor-default"
                    : "bg-secondary/20 text-muted-foreground hover:bg-secondary/30 hover:text-green-500"
            )}
            title={hasLog ? "신청 완료" : "신청 기록하기"}
        >
            <CheckCircle2
                className={cn(
                    "w-5 h-5 transition-all",
                    hasLog && "fill-current"
                )}
            />
        </button>
    );
}
