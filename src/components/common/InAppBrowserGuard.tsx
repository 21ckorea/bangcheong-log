"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Copy } from "lucide-react";

export default function InAppBrowserGuard() {
    const [isInApp, setIsInApp] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const userAgent = navigator.userAgent.toLowerCase();
        const isKakao = userAgent.includes("kakaotalk");
        const isNaver = userAgent.includes("naver");
        const isInstagram = userAgent.includes("instagram");
        const isFacebook = userAgent.includes("fbav");

        if (isKakao || isNaver || isInstagram || isFacebook) {
            setIsInApp(true);
        }
    }, []);

    const handleOpenExternal = () => {
        if (typeof window === "undefined") return;

        const userAgent = navigator.userAgent.toLowerCase();
        const currentUrl = window.location.href;

        // Android: Use intent scheme
        if (userAgent.includes("android")) {
            // Try to open Chrome via intent
            // intent://[url]#Intent;scheme=http;package=com.android.chrome;end
            const scheme = currentUrl.replace(/^https?:\/\//, "");
            const intentUrl = `intent://${scheme}#Intent;scheme=https;package=com.android.chrome;end`;
            window.location.href = intentUrl;
        }
        // iOS: Cannot force open Chrome/Safari easily from in-app browser without specific schemes
        // But we can try the googlechrome:// scheme if they have it installed
        else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            // Just guide them, pushing buttons often doesn't work well on iOS restriction
            // But we can try to open app store or chrome if specific deep link exists
            // For now, the copy link is the most reliable fallback.
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isInApp) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="max-w-xs w-full space-y-8">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
                        <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                        보안 브라우저에서<br />열어 주세요
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed">
                        카카오톡·네이버 등 앱 내 브라우저에서는<br />
                        Google 로그인이 차단될 수 있습니다.
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <p className="text-sm text-white/80">
                            우측 상단 또는 하단의 <span className="text-white font-bold">⋮</span> 메뉴를 눌러주세요.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <p className="text-sm text-white/80">
                            <span className="text-white font-bold">"다른 브라우저로 열기"</span><br />또는 <span className="text-white font-bold">"Safari로 열기"</span>를 선택하세요.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <Button
                        className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl text-md"
                        onClick={handleOpenExternal}
                    >
                        크롬/사파리로 열기
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full h-12 bg-transparent text-white border-white/20 hover:bg-white/10 rounded-xl"
                        onClick={handleCopyLink}
                    >
                        {copied ?
                            <span className="flex items-center gap-2 text-green-400">링크가 복사되었습니다!</span> :
                            <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> 링크 복사하기</span>
                        }
                    </Button>

                    <button
                        onClick={() => setIsInApp(false)}
                        className="text-white/40 text-xs underline decoration-white/20 mt-4 hover:text-white/60"
                    >
                        로그인 없이 계속 이 브라우저에서 보기
                    </button>
                </div>
            </div>
        </div>
    );
}
