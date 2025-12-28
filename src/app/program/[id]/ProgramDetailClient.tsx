"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { Program } from "@prisma/client";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import CommentSection from "@/components/program/CommentSection";
import ShareButton from "@/components/common/ShareButton";
import { formatDate } from "date-fns";

interface ProgramDetailClientProps {
    program: Program;
    comments: any[];
}

export default function ProgramDetailClient({ program, comments }: ProgramDetailClientProps) {
    const router = useRouter();

    let programData: any = {};
    try {
        programData = JSON.parse(program.castData);
    } catch (e) { }

    return (
        <MobileWrapper className="pb-24">
            {/* Header */}
            <div className="h-14 px-4 flex items-center gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-lg truncate flex-1">{program.title}</span>
                <ShareButton title={program.title} text={`${program.broadcaster} ${program.category} 방청 신청하세요!`} />
            </div>

            <div className="p-0">
                {/* Hero Image */}
                <div className="aspect-video w-full bg-secondary/20 relative overflow-hidden">
                    {programData.image ? (
                        <img src={programData.image} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            이미지 없음
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/60">
                            {program.broadcaster}
                        </Badge>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Title & Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm text-violet-400 font-medium">
                            <span>{program.category}</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-4 leading-tight">{program.title}</h1>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/10 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs text-muted-foreground mb-1">방청일</p>
                                <p className="font-bold">{formatDate(program.recordDate, 'MM.dd(EEE)')}</p>
                            </div>
                            <div className="bg-secondary/10 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs text-muted-foreground mb-1">신청 마감</p>
                                <p className="font-bold">{formatDate(program.applyEndDate, 'MM.dd(EEE)')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="space-y-3">
                        <Button
                            className="w-full h-12 text-lg font-bold bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/20"
                            onClick={() => {
                                if (programData.link) window.open(programData.link, '_blank');
                            }}
                        >
                            신청하러 가기 <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                        {programData.guideLink && (
                            <Button
                                variant="outline"
                                className="w-full h-10 text-sm border-white/10 hover:bg-white/5"
                                onClick={() => window.open(programData.guideLink, '_blank')}
                            >
                                응모 가이드 대본 보기
                            </Button>
                        )}
                    </div>

                    <div className="h-[1px] bg-white/10 my-6" />

                    {/* Comments */}
                    <CommentSection programId={program.id} initialComments={comments} />
                </div>
            </div>
        </MobileWrapper>
    );
}
