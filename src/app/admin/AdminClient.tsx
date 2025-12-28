"use client";

import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Heart, UserPlus, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateProgramRequestStatus } from "@/app/actions/request";
import { getTrendData } from "@/app/actions/stats";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import TrendChart from "@/components/admin/TrendChart";

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

interface ProgramRequest {
    id: string;
    url: string;
    title: string | null;
    status: string;
    isAnonymous: boolean;
    createdAt: Date;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

interface ExtendedStats {
    userCount: number;
    programCount: number;
    logCount: number;
    requestCount: number;
    reviewCount: number;
}

interface AdminClientProps {
    users: User[];
    stats: Stats;
    extendedStats?: ExtendedStats;
    requests: ProgramRequest[];
}

export default function AdminClient({ users, stats, extendedStats, requests }: AdminClientProps) {
    const [updatingState, setUpdatingState] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Trend Chart State
    const [trendType, setTrendType] = useState<'users' | 'requests' | 'logs' | null>(null);
    const [trendData, setTrendData] = useState<{ date: string, count: number }[]>([]);
    const [trendLoading, setTrendLoading] = useState(false);

    async function openTrend(type: 'users' | 'requests' | 'logs') {
        setTrendType(type);
        setTrendLoading(true);
        const res = await getTrendData(type);
        if (res.success && res.data) {
            setTrendData(res.data);
        } else {
            setTrendData([]);
        }
        setTrendLoading(false);
    }

    async function handleStatusUpdate(id: string, newStatus: string) {
        if (newStatus === 'rejected') {
            setRejectId(id);
            setRejectionReason("");
            return;
        }

        setUpdatingState(id);
        await updateProgramRequestStatus(id, newStatus);
        setUpdatingState(null);
    }

    async function confirmRejection() {
        if (!rejectId) return;

        setUpdatingState(rejectId);
        setRejectId(null); // Close dialog
        await updateProgramRequestStatus(rejectId, 'rejected', rejectionReason);
        setUpdatingState(null);
    }
    return (
        <MobileWrapper className="pb-24">
            <Header />

            <div className="px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
                    <p className="text-muted-foreground">가입한 사용자 정보를 확인하세요</p>
                </div>

                <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="stats">현황</TabsTrigger>
                        <TabsTrigger value="requests">프로그램 요청</TabsTrigger>
                        <TabsTrigger value="users">사용자 목록</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            <Card
                                className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openTrend('users')}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-violet-500" />
                                        <span className="text-xs text-muted-foreground">전체 사용자</span>
                                    </div>
                                    <p className="text-2xl font-bold">{extendedStats?.userCount ?? stats.totalUsers}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart className="w-4 h-4 text-pink-500" />
                                        <span className="text-xs text-muted-foreground">관심 등록 유저</span>
                                    </div>
                                    <p className="text-2xl font-bold">{stats.usersWithFavorites}</p>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openTrend('users')}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserPlus className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs text-muted-foreground">신규 가입 (7일)</span>
                                    </div>
                                    <p className="text-2xl font-bold">{stats.recentUsers}</p>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-0 bg-secondary/10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openTrend('requests')}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-muted-foreground">활성 프로그램</span>
                                    </div>
                                    <p className="text-2xl font-bold">{extendedStats?.programCount ?? 0}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">클릭하여 요청 추세 보기</p>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-0 bg-secondary/10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openTrend('logs')}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-muted-foreground">누적 신청 로그</span>
                                    </div>
                                    <p className="text-2xl font-bold">{extendedStats?.logCount ?? 0}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">클릭하여 신청 추세 보기</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="requests">
                        <div className="space-y-3 mb-8">
                            <h2 className="text-lg font-bold mb-3">프로그램 요청 ({requests.filter(r => r.status === 'pending').length}건 대기중)</h2>
                            {requests.length === 0 ? (
                                <p className="text-sm text-muted-foreground">접수된 요청이 없습니다.</p>
                            ) : (
                                requests.map((request) => (
                                    <Card key={request.id} className="border-0 bg-secondary/10">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                request.status === 'processed' ? 'bg-green-500/10 text-green-500' :
                                                                    'bg-red-500/10 text-red-500'
                                                                }`}>
                                                                {request.status === 'pending' ? '대기중' :
                                                                    request.status === 'processed' ? '완료' : '거절됨'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(request.createdAt).toLocaleDateString("ko-KR")}
                                                            </span>
                                                            {request.isAnonymous && <span className="text-xs text-muted-foreground">(익명)</span>}
                                                        </div>
                                                        <h3 className="font-semibold mt-1">
                                                            {request.title || "제목 없음"}
                                                        </h3>
                                                        <a
                                                            href={request.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1 truncate max-w-[300px]"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            {request.url}
                                                        </a>
                                                        {!request.isAnonymous && request.user && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                요청자: {request.user.name} ({request.user.email})
                                                            </p>
                                                        )}
                                                    </div>

                                                    {request.status === 'pending' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                                                                onClick={() => handleStatusUpdate(request.id, 'processed')}
                                                                disabled={updatingState === request.id}
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                                disabled={updatingState === request.id}
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold mb-3">사용자 목록 ({users.length}명)</h2>
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
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />

            {/* Rejection Dialog */}
            <Dialog
                isOpen={!!rejectId}
                onClose={() => setRejectId(null)}
                title="등록 거절 사유 입력"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        거절 사유를 입력하면 요청자에게 알림으로 전송됩니다.
                    </p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="예: 유효하지 않은 URL입니다."
                        className="w-full h-32 p-3 rounded-lg border bg-background focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setRejectId(null)}>
                            취소
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={confirmRejection}
                        >
                            거절하기
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Trend Chart Dialog */}
            <Dialog
                isOpen={!!trendType}
                onClose={() => setTrendType(null)}
                title={`${trendType === 'users' ? '사용자 가입' : trendType === 'requests' ? '프로그램 요청' : trendType === 'logs' ? '신청 로그' : ''} 일별 통계 (최근 30일)`}
            >
                <div className="py-4 h-64">
                    {trendLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            불러오는 중...
                        </div>
                    ) : (
                        <TrendChart
                            data={trendData}
                            color={
                                trendType === 'users' ? '#8b5cf6' :
                                    trendType === 'requests' ? '#3b82f6' :
                                        '#ec4899'
                            }
                        />
                    )}
                </div>
                <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => setTrendType(null)}>닫기</Button>
                </div>
            </Dialog>
        </MobileWrapper>
    );
}
