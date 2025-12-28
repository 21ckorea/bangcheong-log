"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Bell, Calendar, List, Settings, LogOut, Mail, Smartphone } from "lucide-react";
import { signOut } from "next-auth/react";
import { Switch } from "@/components/ui/Switch";
import CalendarView from "@/components/mypage/CalendarView";
import { updateNotificationSettings } from "@/app/actions/mypage";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";

interface MyPageClientProps {
    data: {
        user: {
            name: string | null;
            email: string | null;
            image: string | null;
            emailNotification: boolean;
            pushNotification: boolean;
        };
        logs: any[];
        favorites: any[];
    };
}

export default function MyPageClient({ data }: MyPageClientProps) {
    const [emailNotif, setEmailNotif] = useState(data.user.emailNotification);
    const [pushNotif, setPushNotif] = useState(data.user.pushNotification);

    const handleToggle = async (key: 'emailNotification' | 'pushNotification', checked: boolean) => {
        // Optimistic update
        if (key === 'emailNotification') setEmailNotif(checked);
        if (key === 'pushNotification') setPushNotif(checked);

        const result = await updateNotificationSettings(key, checked);
        if (result.success) {
            toast.success("설정이 저장되었습니다.");
        } else {
            // Revert on failure
            if (key === 'emailNotification') setEmailNotif(!checked);
            if (key === 'pushNotification') setPushNotif(!checked);
            toast.error("설정 저장에 실패했습니다.");
        }
    };

    // Transform data for calendar
    const calendarEvents = [
        ...data.logs.map(log => {
            // Assuming program has recordDate. Logic depends on what we want to show.
            // Usually user wants to see "Recording Date" for what they applied.
            return {
                id: `log-${log.id}`,
                title: `[녹화] ${log.program.title}`,
                date: new Date(log.program.recordDate),
                type: 'record' as const
            };
        }),
        ...data.favorites.map(fav => {
            return {
                id: `fav-${fav.id}`,
                title: `[마감] ${fav.program.title}`,
                date: new Date(fav.program.applyEndDate),
                type: 'deadline' as const
            };
        })
    ].filter(e => e.date); // Filter out invalid dates if any

    return (
        <MobileWrapper className="pb-24">
            <Header />

            {/* Profile Section */}
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-white/10">
                        <AvatarImage src={data.user.image || ""} />
                        <AvatarFallback>{data.user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold">{data.user.name}</h1>
                        <p className="text-sm text-muted-foreground">{data.user.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <Card className="border-0 bg-secondary/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{data.logs.length}</span>
                            <span className="text-xs text-muted-foreground mt-1">신청 내역</span>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-secondary/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{data.favorites.length}</span>
                            <span className="text-xs text-muted-foreground mt-1">관심 프로그램</span>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="activity" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-secondary/20 p-1 rounded-xl mb-6">
                        <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-background">
                            <List className="w-4 h-4 mr-2" /> 활동
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-background">
                            <Calendar className="w-4 h-4 mr-2" /> 캘린더
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-background">
                            <Settings className="w-4 h-4 mr-2" /> 설정
                        </TabsTrigger>
                    </TabsList>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-3">
                        <h2 className="text-lg font-bold mb-4">최근 신청 내역</h2>
                        {data.logs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>아직 신청한 프로그램이 없습니다.</p>
                            </div>
                        ) : (
                            data.logs.map(log => (
                                <Card key={log.id} className="border-0 bg-secondary/5">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={
                                                log.status === 'APPLIED' ? 'default' :
                                                    log.status === 'ACCEPTED' ? 'secondary' : 'outline'
                                            } className={
                                                log.status === 'APPLIED' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                                                    log.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 text-green-400' : ''
                                            }>
                                                {log.status === 'APPLIED' ? '신청완료' :
                                                    log.status === 'ACCEPTED' ? '당첨' :
                                                        log.status === 'REJECTED' ? '미당첨' : '대기'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">{log.program.title}</h3>
                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                            <p>녹화일: {new Date(log.program.recordDate).toLocaleDateString()}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar">
                        <CalendarView events={calendarEvents} />
                        <div className="mt-6 p-4 bg-secondary/5 rounded-xl text-xs text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1">
                                <li><span className="text-red-400 font-bold">빨간 점</span>: 관심 등록한 프로그램의 신청 마감일</li>
                                <li><span className="text-green-400 font-bold">초록 점</span>: 내가 신청한 프로그램의 녹화일</li>
                            </ul>
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">알림 설정</h3>
                            <Card className="border-0 bg-secondary/10">
                                <CardContent className="p-4 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-full">
                                                <Mail className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">이메일 알림</p>
                                                <p className="text-xs text-muted-foreground">마감 임박, 신청 시작 등을 메일로 받기</p>
                                            </div>
                                        </div>
                                        <Switch checked={emailNotif} onCheckedChange={(c) => handleToggle('emailNotification', c)} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-full">
                                                <Smartphone className="w-5 h-5 text-pink-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">앱 푸시 알림</p>
                                                <p className="text-xs text-muted-foreground">주요 정보를 푸시 메시지로 받기</p>
                                            </div>
                                        </div>
                                        <Switch checked={pushNotif} onCheckedChange={(c) => handleToggle('pushNotification', c)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="font-bold text-lg">계정 관리</h3>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/10 border-white/10"
                                onClick={() => signOut()}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                로그아웃
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />
        </MobileWrapper>
    );
}
