"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-lg">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">
                    B
                </div>
                <span className="font-bold text-lg tracking-tight">방청로그</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
            </Button>
        </header>
    );
};
