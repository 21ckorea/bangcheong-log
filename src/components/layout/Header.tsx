"use client";

import { Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";
import { useState } from "react";
import RequestDialog from "@/components/request/RequestDialog";
import NotificationList from "@/components/notification/NotificationList";

export const Header = () => {
    const { data: session } = useSession();
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    onClick={() => setIsRequestOpen(true)}
                >
                    <PlusCircle className="h-5 w-5" />
                </Button>
                {session ? (
                    <>
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background" />
                                )}
                            </Button>
                            <NotificationList
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                onUnreadCountChange={setUnreadCount}
                            />
                        </div>
                        <UserMenu />
                    </>
                ) : (
                    <LoginButton />
                )}
            </div>
            <RequestDialog isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
        </header>
    );
};
