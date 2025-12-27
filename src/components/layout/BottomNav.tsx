"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Calendar, PenTool, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "홈", path: "/", icon: Home },
        { name: "로그", path: "/log", icon: PenTool },
        { name: "MY", path: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 gradient-mask-t pointer-events-none">
            <nav className="glass mx-auto flex h-16 w-full max-w-[440px] items-center justify-around rounded-full border border-white/10 bg-black/40 px-6 backdrop-blur-md shadow-2xl pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-2 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 -z-10 rounded-full bg-white/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">{item.name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};
