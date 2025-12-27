"use client";

import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Heart, UserPlus } from "lucide-react";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
    _count: {
        favorites: number;
    };
}

interface Stats {
    totalUsers: number;
    usersWithFavorites: number;
    recentUsers: number;
}

interface AdminClientProps {
    users: User[];
    stats: Stats;
}

export default function AdminClient({ users, stats }: AdminClientProps) {
    return (
        <MobileWrapper className="pb-24">
            <Header />

            <div className="px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
                    <p className="text-muted-foreground">가입한 사용자 정보를 확인하세요</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-violet-500" />
                                <span className="text-xs text-muted-foreground">전체 사용자</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span className="text-xs text-muted-foreground">관심 등록</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.usersWithFavorites}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <UserPlus className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">최근 7일</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.recentUsers}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* User List */}
                <div className="space-y-3">
                    <h2 className="text-lg font-bold mb-3">사용자 목록</h2>
                    {users.map((user) => (
                        <Card key={user.id} className="border-0 bg-secondary/10">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name || "User"}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{user.name || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                                            </span>
                                            <span className="text-xs text-violet-400">
                                                관심 프로그램: {user._count.favorites}개
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <BottomNav />
        </MobileWrapper>
    );
}
