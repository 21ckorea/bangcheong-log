"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { Button } from "@/components/ui/Button";
import { createReview } from "@/app/actions/community";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";

export default function WriteClient() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용을 모두 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createReview({ title, content });
            if (result.success) {
                toast.success("후기가 등록되었습니다!");
                router.push("/community");
                router.refresh();
            } else {
                toast.error("등록에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MobileWrapper>
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 bg-background sticky top-0 z-50">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-secondary/20 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-md">후기 작성</h1>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-violet-400 font-medium hover:text-violet-300 hover:bg-transparent p-0"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "등록"}
                </Button>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <Input
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-bold border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent rounded-none border-b border-white/10 pb-2"
                    />
                </div>

                <div className="space-y-2">
                    <textarea
                        placeholder="방청 현장의 분위기나 꿀팁을 자유롭게 나눠주세요!"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[300px] bg-transparent resize-none focus:outline-none text-base leading-relaxed placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>
        </MobileWrapper>
    );
}
