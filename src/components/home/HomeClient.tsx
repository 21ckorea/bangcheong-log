"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Program } from "@/generated/client/client";
import { useState } from "react";

const CATEGORIES = ["전체", "음악방송", "토크쇼", "예능", "공개방송"];

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
        "from-blue-500 to-indigo-500",
        "from-violet-500 to-purple-500",
        "from-pink-500 to-rose-500",
        "from-cyan-400 to-blue-400",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
    ];
    // Simple hash of standard UUID or string to pick index
    const charCode = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    return gradients[charCode % gradients.length];
}

interface HomeClientProps {
    programs: Program[];
}

export default function HomeClient({ programs }: HomeClientProps) {
    const [selectedCategory, setSelectedCategory] = useState("전체");

    const filteredPrograms = selectedCategory === "전체"
        ? programs
        : programs.filter(p => p.category === selectedCategory);

    return (
        <MobileWrapper className="pb-24">
            <Header />

            {/* Hero Section */}
            <section className="px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-2 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                        ✨ 모든 방송사 방청 정보가 한곳에!
                    </div>
                    <h1 className="text-3xl font-bold leading-tight">
                        흩어진 방청 신청, <br />
                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                            알림 받고 한 번에
                        </span>
                        <br />
                        성공해봐!
                    </h1>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                        최소한의 노력으로 최대의 당첨 확률! <br />
                        방청 기록은 덤이야 😉
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    className="mt-6 relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="어떤 방송을 찾고 있니?"
                        className="w-full h-12 rounded-2xl bg-secondary/30 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50 text-foreground"
                    />
                </motion.div>
            </section>

            {/* Categories */}
            <section className="pl-6 overflow-x-auto scrollbar-hide mb-8">
                <div className="flex gap-2 pr-6 w-max">
                    {CATEGORIES.map((cat, idx) => (
                        <motion.button
                            key={cat}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border border-white/5"
                                }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Program List */}
            <section className="px-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">마감 임박! 🔥</h2>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors">전체보기</button>
                </div>

                {filteredPrograms.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed border-white/10">
                        <p>등록된 방청 정보가 없습니다.</p>
                        <p className="text-xs mt-1 opacity-50">크롤러가 열심히 일하는 중일지도 몰라요! 🤖</p>
                    </div>
                ) : (
                    filteredPrograms.map((program) => (
                        <Card key={program.id} className="overflow-hidden border-0 bg-secondary/10 hover:bg-secondary/20 transition-colors group cursor-pointer">
                            <CardContent className="p-0 flex h-auto min-h-32">
                                {/* Image Placeholder with Gradient */}
                                <div className={`w-28 h-full bg-gradient-to-br ${getGradient(program.id)} flex flex-col items-center justify-center text-white p-2 relative shrink-0`}>
                                    <div className="absolute top-3 left-3">
                                        <div className="bg-white/90 text-black px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                                            {calculateDDay(program.applyEndDate)}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background/50 text-muted-foreground backdrop-blur-sm">
                                                {program.category}
                                            </Badge>
                                            <span className="text-xs font-bold text-primary/80">{program.broadcaster}</span>
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
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs px-3 hover:bg-primary/10 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click
                                                try {
                                                    const data = JSON.parse(program.castData);
                                                    if (data.link) {
                                                        window.open(data.link, '_blank');
                                                    }
                                                } catch (err) {
                                                    // Fallback or ignore
                                                }
                                            }}
                                        >
                                            자세히 보기 &rarr;
                                        </Button>
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
