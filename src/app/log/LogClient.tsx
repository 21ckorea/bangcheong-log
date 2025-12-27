"use client";

import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PenTool, Trash2 } from "lucide-react";
import { useState } from "react";
import { updateApplicationStatus, deleteApplicationLog } from "@/app/actions/log";

interface Log {
    id: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    program: {
        id: string;
        title: string;
        category: string;
        broadcaster: string;
        recordDate: Date;
        applyEndDate: Date;
    };
}

interface LogClientProps {
    logs: Log[];
}

const STATUS_OPTIONS = [
    { value: "applied", label: "신청완료", color: "bg-blue-500/20 text-blue-500" },
    { value: "pending", label: "대기중", color: "bg-yellow-500/20 text-yellow-500" },
    { value: "accepted", label: "당첨", color: "bg-green-500/20 text-green-500" },
    { value: "rejected", label: "탈락", color: "bg-red-500/20 text-red-500" },
];

// Helper to format date
function formatDate(date: Date) {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export default function LogClient({ logs: initialLogs }: LogClientProps) {
    const [logs, setLogs] = useState(initialLogs);

    const handleStatusChange = async (logId: string, newStatus: string) => {
        const result = await updateApplicationStatus(logId, newStatus);
        if (result.success && result.data) {
            setLogs(logs.map(log => log.id === logId ? result.data : log));
        }
    };

    const handleDelete = async (logId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        const result = await deleteApplicationLog(logId);
        if (result.success) {
            setLogs(logs.filter(log => log.id !== logId));
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
        return statusOption || STATUS_OPTIONS[0];
    };

    return (
        <MobileWrapper className="pb-24">
            <Header />

            <div className="px-6 py-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <PenTool className="w-6 h-6 text-violet-500" />
                        <h1 className="text-3xl font-bold">방청 신청 로그</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {logs.length}개의 신청 기록이 있어요
                    </p>
                </div>

                {logs.length === 0 ? (
                    <div className="text-center py-20">
                        <PenTool className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground mb-2">
                            아직 신청 기록이 없어요
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                            프로그램 카드의 체크 버튼을 눌러 신청을 기록해보세요!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => {
                            const statusBadge = getStatusBadge(log.status);
                            return (
                                <Card
                                    key={log.id}
                                    className="overflow-hidden border-0 bg-secondary/10"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] h-5 px-1.5"
                                                    >
                                                        {log.program.category}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-primary/80">
                                                        {log.program.broadcaster}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1 line-clamp-1">
                                                    {log.program.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    신청일: {formatDate(log.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Status Selector */}
                                        <div className="flex gap-2 flex-wrap">
                                            {STATUS_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleStatusChange(log.id, option.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${log.status === option.value
                                                            ? option.color
                                                            : "bg-secondary/20 text-muted-foreground hover:bg-secondary/30"
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </MobileWrapper>
    );
}
