"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import CommentSection from "@/components/program/CommentSection";
import ShareButton from "@/components/common/ShareButton";
import { formatDate } from "date-fns";
import { LocationCard } from "@/components/program/LocationCard";
import { TipsSection } from "@/components/program/TipsSection";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

interface Program {
    id: string;
    title: string;
    broadcaster: string;
    recordDate: Date;
    applyStartDate: Date;
    applyEndDate: Date;
    link: string | null;
    image: string | null;
    status: string; // derived
    tips?: string | null;
}

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface ProgramDetailClientProps {
    program: Program;
    initialComments: Comment[];
    userId?: string;
}

export default function ProgramDetailClient({ program, initialComments, userId }: ProgramDetailClientProps) {
    const router = useRouter();

    return (
        <MobileWrapper className="pb-24">
            <Header
                title={program.broadcaster}
                showBack
                rightElement={<ShareButton title={program.title} text={`[방청로그] ${program.title} 함께 신청해요!`} />}
            />

            <div className="min-h-[50vh]">
                {/* Hero Image */}
                <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    {program.image ? (
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-0" />
                            <img
                                src={program.image}
                                alt={program.title}
                                className="absolute inset-0 w-full h-full object-contain z-10"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl font-bold opacity-20">{program.broadcaster}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                {program.broadcaster}
                            </span>
                            {program.status === 'active' && (
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    접수중
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold leading-tight mb-4">{program.title}</h1>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/10 p-4 rounded-xl">
                                <span className="text-xs text-muted-foreground block mb-1">녹화일</span>
                                <span className="font-semibold text-lg block">
                                    {new Date(program.recordDate).toLocaleDateString("ko-KR", { month: 'long', day: 'numeric', weekday: 'short' })}
                                </span>
                            </div>
                            <div className="bg-secondary/10 p-4 rounded-xl">
                                <span className="text-xs text-muted-foreground block mb-1">신청 마감</span>
                                <span className="font-semibold text-lg block text-red-500">
                                    {new Date(program.applyEndDate).toLocaleDateString("ko-KR", { month: 'long', day: 'numeric', weekday: 'short' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Official Link */}
                    {program.link && (
                        <a
                            href={program.link}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full py-4 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
                        >
                            공식 홈페이지에서 신청하기
                        </a>
                    )}

                    {/* Tips Section */}
                    <TipsSection tips={program.tips} />

                    {/* Location Map */}
                    <LocationCard broadcaster={program.broadcaster} />

                    <div className="h-px bg-border" />

                    {/* Comments */}
                </div>
            </div>
        </MobileWrapper>
    );
}
