"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";

export const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-lg">
            <div className="flex items-center gap-2">
                <img
                    src="/icon.png"
                    alt="방청로그"
                    className="h-8 w-8 rounded-lg"
                />
                <span className="font-bold text-lg tracking-tight">방청로그</span>
            </div>
            <div className="flex items-center gap-2">
                {session ? (
                    <>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <UserMenu />
                    </>
                ) : (
                    <LoginButton />
                )}
            </div>
        </header>
    );
};
