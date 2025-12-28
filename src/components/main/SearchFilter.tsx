"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
// Assuming Input component exists or I'll use standard input. 
// I'll check libraries later or just use standard HTML input with styles for now to be safe.
import { cn } from "@/lib/utils";

const BROADCASTERS = ["KBS", "MBC", "SBS", "JTBC", "TVChosun"];
const STATUSES = [
    { label: "전체", value: "all" },
    { label: "접수중", value: "active" },
    { label: "마감임박", value: "closing" },
];

export default function SearchFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [broadcaster, setBroadcaster] = useState(searchParams.get("broadcaster") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "all");

    // Debouce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateParams({ search });
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateParams = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        router.replace(`/?${params.toString()}`, { scroll: false });
    };

    const handleBroadcasterClick = (bc: string) => {
        const newValue = broadcaster === bc ? "" : bc;
        setBroadcaster(newValue);
        updateParams({ broadcaster: newValue });
    };

    const handleStatusClick = (st: string) => {
        setStatus(st);
        updateParams({ status: st });
    };

    return (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pb-4 pt-2 space-y-3">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="프로그램명 또는 방송사 검색"
                    className="w-full h-10 pl-9 pr-4 rounded-full bg-secondary/10 border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                {STATUSES.map((st) => (
                    <button
                        key={st.value}
                        onClick={() => handleStatusClick(st.value)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            status === st.value || (status === "" && st.value === "all")
                                ? "bg-violet-500 text-white border-violet-500"
                                : "bg-secondary/5 text-muted-foreground border-white/10 hover:bg-secondary/10"
                        )}
                    >
                        {st.label}
                    </button>
                ))}
            </div>

            {/* Broadcaster Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                {BROADCASTERS.map((bc) => (
                    <button
                        key={bc}
                        onClick={() => handleBroadcasterClick(bc)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            broadcaster === bc
                                ? "bg-white text-black border-white"
                                : "bg-secondary/5 text-muted-foreground border-white/10 hover:bg-secondary/10"
                        )}
                    >
                        {bc}
                    </button>
                ))}
            </div>
        </div>
    );
}
