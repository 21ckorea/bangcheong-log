"use client";

import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, Heart, Mail, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
    favorites: Array<{
        id: string;
        program: {
            id: string;
            title: string;
            category: string;
            broadcaster: string;
        };
    }>;
}

interface ProfileClientProps {
    user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
    const joinDate = new Date(user.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <MobileWrapper className="pb-24">
            <Header />

            <div className="px-6 py-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-24 h-24 rounded-full mb-4 ring-4 ring-violet-500/20"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-violet-500/20">
                            {user.name?.charAt(0) || "U"}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold mb-1">{user.name || "사용자"}</h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-violet-500" />
                                <span className="text-xs text-muted-foreground">가입일</span>
                            </div>
                            <p className="text-sm font-bold">{joinDate}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span className="text-xs text-muted-foreground">관심 프로그램</span>
                            </div>
                            <p className="text-2xl font-bold">{user.favorites.length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Info */}
                <Card className="border-0 bg-secondary/10 mb-6">
                    <CardContent className="p-4">
                        <h2 className="text-lg font-bold mb-4">계정 정보</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-violet-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">이메일</p>
                                    <p className="text-sm font-medium truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">로그인 방식</p>
                                    <p className="text-sm font-medium">Google</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logout Button */}
                <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="w-full border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                >
                    로그아웃
                </Button>
            </div>

            <BottomNav />
        </MobileWrapper>
    );
}
