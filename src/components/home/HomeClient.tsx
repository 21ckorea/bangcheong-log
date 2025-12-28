"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Program } from "@prisma/client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import FavoriteButton from "@/components/programs/FavoriteButton";
import ApplicationLogButton from "@/components/programs/ApplicationLogButton";
import SearchFilter from "@/components/main/SearchFilter";

// Helper to calculate D-Day
function calculateDDay(targetDate: Date) {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "마감";
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
}

// Helper to format date
function formatDate(date: Date) {
    const d = new Date(date);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;

    const dateStr = d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    });

    if (hasTime) {
        const timeStr = d.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${dateStr} ${timeStr}`;
    }

    return dateStr;
}

// Helper to get random gradient based on ID (deterministic)
function getGradient(id: string) {
    const gradients = [
        "from-slate-400 to-slate-500",        // Sophisticated gray
        "from-purple-300 to-purple-400",      // Soft purple
        "from-rose-300 to-pink-400",          // Gentle rose
        "from-sky-300 to-blue-400",           // Soft sky blue
        "from-emerald-300 to-teal-400",       // Muted teal
        "from-amber-300 to-orange-400",       // Warm amber
    ];
    // Simple hash of standard UUID or string to pick index
    const charCode = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    return gradients[charCode % gradients.length];
}

interface HomeClientProps {
    programs: Program[];
    favoriteIds: string[];
    loggedProgramIds: string[];
}

export default function HomeClient({ programs, favoriteIds, loggedProgramIds }: HomeClientProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});
    const { data: session } = useSession();

    const filteredPrograms = selectedCategory === "전체"
        ? programs
        : programs.filter(p => p.category === selectedCategory);

    return (
        <MobileWrapper className="pb-24">
            <Header />

            {/* Hero Section */}
            <section className="px-6 pt-8 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-2 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                        ✨ 모든 방송사 방청 정보가 한곳에!
                    </div>
                    <h1 className="text-3xl font-bold leading-tight">
                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                            방청로그
                        </span>
                        에서<br />
                        당첨의 기회를 잡아봐!
                    </h1>
                </motion.div>
            </section>

            {/* Search & Filter */}
            <section className="px-6 mb-6 sticky top-0 z-40">
                <SearchFilter />
            </section>

            {/* Program List */}
            <section className="px-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">진행중인 방청</h2>
                </div>

                {filteredPrograms.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed border-white/10">
                        <p>검색 결과가 없습니다.</p>
                        <p className="text-xs mt-1 opacity-50">다른 검색어나 필터를 선택해보세요! 🕵️</p>
                    </div>
                ) : (
                    filteredPrograms.map((program) => (
                        <Card
                            key={program.id}
                            onClick={() => router.push(`/program/${program.id}`)}
                            className="overflow-hidden border-0 bg-secondary/10 hover:bg-secondary/20 transition-colors group cursor-pointer"
                        >
                            <CardContent className="p-0 flex h-auto min-h-40">
                                {/* Left Section: Split into Gradient Top + Image Bottom */}
                                <div className="w-28 h-full flex flex-col shrink-0 overflow-hidden">
                                    {/* Top: D-Day Badge with Gradient */}
                                    <div className={`w-full h-16 flex items-center justify-center bg-gradient-to-br ${getGradient(program.id)} p-2`}>
                                        <div className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap border border-black/5">
                                            {calculateDDay(program.applyEndDate)}
                                        </div>
                                    </div>

                                    {/* Bottom: Program Image */}
                                    <div className="w-full flex-1 relative bg-gray-200">
                                        {(() => {
                                            try {
                                                const data = JSON.parse(program.castData);
                                                if (data.image && !errorImages[program.id]) {
                                                    return (
                                                        <img
                                                            src={data.image}
                                                            alt={program.title}
                                                            className="w-full h-full object-cover"
                                                            onError={() => {
                                                                setErrorImages(prev => ({ ...prev, [program.id]: true }));
                                                            }}
                                                        />
                                                    );
                                                }
                                                // Fallback gradient if no image
                                                return <div className={`w-full h-full bg-gradient-to-br ${getGradient(program.id)} opacity-30`} />;
                                            } catch (e) {
                                                return <div className={`w-full h-full bg-gradient-to-br ${getGradient(program.id)} opacity-30`} />;
                                            }
                                        })()}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background/50 text-muted-foreground backdrop-blur-sm">
                                                    {program.category}
                                                </Badge>
                                                <span className="text-xs font-bold text-primary/80">{program.broadcaster}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <ApplicationLogButton
                                                    programId={program.id}
                                                    initialHasLog={loggedProgramIds.includes(program.id)}
                                                />
                                                <FavoriteButton
                                                    programId={program.id}
                                                    initialIsFavorite={favoriteIds.includes(program.id)}
                                                />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{program.title}</h3>

                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <span className="w-12 font-medium opacity-70">방청일</span>
                                                <span className="font-medium text-foreground/80">{formatDate(program.recordDate)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <span className="w-12 font-medium opacity-70 text-violet-400">발표일</span>
                                                <span className="font-medium text-violet-300">{formatDate(program.applyEndDate)}</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex justify-end mt-2">
                                        <div className="flex gap-2">
                                            {(() => {
                                                try {
                                                    const data = JSON.parse(program.castData);
                                                    return data.guideLink ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs px-3 hover:bg-primary/10 hover:text-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(data.guideLink, '_blank');
                                                            }}
                                                        >
                                                            📝 응모 가이드
                                                        </Button>
                                                    ) : null;
                                                } catch (e) {
                                                    return null;
                                                }
                                            })()}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs px-3 hover:bg-primary/10 hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Navigate to detail page
                                                    router.push(`/program/${program.id}`);
                                                }}
                                            >
                                                자세히 보기 &rarr;
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </section>

            <BottomNav />
        </MobileWrapper>
    );
}
