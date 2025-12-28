"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Send, Trash2 } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createComment, deleteComment } from "@/app/actions/comment";
import { Input } from "@/components/ui/Input";

interface Comment {
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    programId: string;
    initialComments: Comment[];
}

export default function CommentSection({ programId, initialComments }: CommentSectionProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state with props when revalidated
    if (initialComments !== comments) {
        // Simple way to keep in sync if parent re-renders with new data
        // For proper sync, use useEffect or just rely on router.refresh() 
        // updating the key of the parent component.
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            signIn("google");
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await createComment(programId, newComment);
            if (result.success && result.data) {
                setNewComment("");
                toast.success("댓글이 등록되었습니다.");
                router.refresh();
            } else {
                toast.error("댓글 등록 실패");
            }
        } catch {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;

        try {
            const result = await deleteComment(commentId);
            if (result.success) {
                toast.success("삭제되었습니다.");
                router.refresh();
            } else {
                toast.error("삭제 실패");
            }
        } catch {
            toast.error("오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">댓글 <span className="text-violet-400">{initialComments.length}</span></h3>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={session ? "궁금한 점이나 팁을 공유해보세요!" : "로그인 후 작성할 수 있습니다."}
                        disabled={isSubmitting}
                        className="pr-10"
                    />
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-violet-600 hover:bg-violet-500"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>

            {/* List */}
            <div className="space-y-4">
                {initialComments.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">아직 댓글이 없습니다.</p>
                ) : (
                    initialComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8 mt-1 border border-white/10">
                                <AvatarImage src={comment.user.image || undefined} />
                                <AvatarFallback>{comment.user.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-secondary/10 rounded-2xl rounded-tl-none p-3 relative group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-muted-foreground">{comment.user.name}</span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                {session?.user?.id === comment.userId && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
