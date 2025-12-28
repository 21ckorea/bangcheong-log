"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;
        const shareData = {
            title,
            text: text ? `\n${text}` : title,
            url: shareUrl,
        };

        // Use Web Share API if available
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Error sharing:", err);
                }
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("링크가 복사되었습니다!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("링크 복사에 실패했습니다.");
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/10"
            onClick={handleShare}
        >
            {copied ? (
                <Check className="w-5 h-5 text-green-400" />
            ) : (
                <Share2 className="w-5 h-5" />
            )}
        </Button>
    );
}
