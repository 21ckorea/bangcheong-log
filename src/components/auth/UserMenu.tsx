"use client";

import { signOut, useSession } from "next-auth/react";
import { User, LogOut, Heart, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin
        const checkAdmin = async () => {
            const response = await fetch("/api/admin/check");
            const data = await response.json();
            setIsAdmin(data.isAdmin);
        };

        if (session?.user) {
            checkAdmin();
        }
    }, [session]);

    if (!session?.user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
            >
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0) || "U"}
                    </div>
                )}
                <span className="hidden sm:inline text-sm font-medium">
                    {session.user.name}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                        <div className="py-1">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-violet-600 dark:text-violet-400 font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Shield className="w-4 h-4" />
                                    관리자 대시보드
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                프로필
                            </Link>
                            <Link
                                href="/favorites"
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Heart className="w-4 h-4" />
                                관심 프로그램
                            </Link>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
