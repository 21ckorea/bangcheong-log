"use client";

import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Heart } from "lucide-react";
import FavoriteButton from "@/components/programs/FavoriteButton";

interface Favorite {
    id: string;
    program: {
        id: string;
        title: string;
        category: string;
        broadcaster: string;
        recordDate: Date;
        applyEndDate: Date;
        castData: string;
    };
}

interface FavoritesClientProps {
    favorites: Favorite[];
}

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

export default function FavoritesClient({ favorites }: FavoritesClientProps) {
    return (
        <MobileWrapper className="pb-24">
            <Header />

            <div className="px-6 py-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-6 h-6 text-pink-500 fill-current" />
                        <h1 className="text-3xl font-bold">관심 프로그램</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {favorites.length}개의 프로그램을 관심 등록했어요
                    </p>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground mb-2">
                            아직 관심 프로그램이 없어요
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                            프로그램 카드의 하트 버튼을 눌러 관심 등록해보세요!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {favorites.map((favorite) => {
                            const program = favorite.program;
                            return (
                                <Card
                                    key={favorite.id}
                                    className="overflow-hidden border-0 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] h-5 px-1.5"
                                                    >
                                                        {program.category}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-primary/80">
                                                        {program.broadcaster}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] h-5 px-1.5 border-violet-500/30 text-violet-400"
                                                    >
                                                        {calculateDDay(program.applyEndDate)}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 line-clamp-1">
                                                    {program.title}
                                                </h3>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <span className="w-12 font-medium opacity-70">
                                                            방청일
                                                        </span>
                                                        <span className="font-medium text-foreground/80">
                                                            {formatDate(program.recordDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <span className="w-12 font-medium opacity-70 text-violet-400">
                                                            발표일
                                                        </span>
                                                        <span className="font-medium text-violet-300">
                                                            {formatDate(program.applyEndDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <FavoriteButton
                                                programId={program.id}
                                                initialIsFavorite={true}
                                            />
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
