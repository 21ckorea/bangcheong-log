"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { createProgramRequest } from "@/app/actions/request";
import { Loader2, Send } from "lucide-react";

interface RequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestDialog({ isOpen, onClose }: RequestDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const result = await createProgramRequest(formData);

        if (result.success) {
            onClose();
            // Reset form handled by dialog unmounting usually, but if reusable, maybe generic reset.
            // Since Dialog unmounts on close, state resets.
            alert("요청이 접수되었습니다! 관리자가 확인 후 처리합니다."); // Simple feedback
        } else {
            setError(result.error || "요청 접수에 실패했습니다.");
        }
        setIsLoading(false);
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="프로그램 신청 요청">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                        방청 신청 페이지 URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="url"
                        name="url"
                        type="url"
                        required
                        placeholder="https://..."
                        className="w-full p-2 rounded-lg border bg-background focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        해당 프로그램의 공식 방청 신청 페이지 주소를 입력해주세요.
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                        프로그램 제목 (선택)
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="예: 나혼자산다"
                        className="w-full p-2 rounded-lg border bg-background focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="isAnonymous"
                        name="isAnonymous"
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <label htmlFor="isAnonymous" className="text-sm">
                        익명으로 요청하기 (내 정보가 관리자에게도 공개되지 않음)
                    </label>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                접수 중...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                요청 보내기
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
