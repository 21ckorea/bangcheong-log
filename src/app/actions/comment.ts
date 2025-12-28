"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth.config";
import { revalidatePath } from "next/cache";

export async function getComments(programId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { programId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return { success: true, data: comments };
    } catch (error) {
        console.error("Failed to fetch comments:", error);
        return { success: false, error: "Failed to fetch comments" };
    }
}

export async function createComment(programId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                programId,
                userId: session.user.id,
            },
        });
        revalidatePath(`/program/${programId}`);
        return { success: true, data: comment };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
}

export async function deleteComment(commentId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        // We can't easily revalidate the specific program page here without the program ID.
        // But usually invalidating the current path (which called this action) works if called from Client Component.
        // However, standard revalidatePath takes a string path. 
        // We will return success and Client can trigger reload or Optimistic update.
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete comment" };
    }
}
