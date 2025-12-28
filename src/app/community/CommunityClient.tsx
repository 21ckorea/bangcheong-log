"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface Review {
    id: string;
    title: string;
    content: string;
    images: string[];
    userId: string;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface CommunityClientProps {
    initialReviews: Review[];
    userId?: string;
}

export default function CommunityClient({ initialReviews, userId }: CommunityClientProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);

    return (
        <MobileWrapper className="pb-24 bg-secondary/5">
            <Header />

            <div className="px-6 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">방청 후기</h1>
                    <p className="text-sm text-muted-foreground">생생한 방청 현장 이야기를 들려주세요!</p>
                </div>

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 bg-background/50 rounded-2xl border border-dashed border-white/10">
                            <p className="text-muted-foreground mb-2">아직 작성된 후기가 없어요.</p>
                            <p className="text-sm opacity-50">첫 번째 후기의 주인공이 되어보세요! ✍️</p>
                        </div>
                    ) : (
                        reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-background rounded-2xl p-5 shadow-sm border border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8 border border-white/10">
                                            <AvatarImage src={review.user.image || undefined} />
                                            <AvatarFallback>{review.user.name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{review.user.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{review.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {review.content}
                                </p>

                                {review.images && review.images.length > 0 && (
                                    <div className="mb-4 rounded-xl overflow-hidden h-40 relative">
                                        <img src={review.images[0]} alt="Review attachment" className="w-full h-full object-cover" />
                                        {review.images.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                                                +{review.images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/5">
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1">
                                            조회 {review.views}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <Link href="/community/write">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-violet-600 rounded-full shadow-lg shadow-violet-600/30 flex items-center justify-center text-white z-50 hover:bg-violet-500 transition-colors"
                >
                    <Plus className="w-6 h-6" />
                </motion.button>
            </Link>

            <BottomNav />
        </MobileWrapper>
    );
}
