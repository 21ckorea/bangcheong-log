"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth.config";
import { revalidatePath } from "next/cache";

export async function getReviews(page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const reviews = await prisma.review.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        const total = await prisma.review.count();

        return { success: true, data: reviews, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

export async function createReview(data: { title: string; content: string; images?: string[] }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const review = await prisma.review.create({
            data: {
                ...data,
                userId: session.user.id,
            },
        });
        revalidatePath("/community");
        return { success: true, data: review };
    } catch (error) {
        console.error("Failed to create review:", error);
        return { success: false, error: "Failed to create review" };
    }
}

export async function getReview(id: string) {
    try {
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    }
                }
            }
        });

        // Increment views
        if (review) {
            await prisma.review.update({
                where: { id },
                data: { views: { increment: 1 } }
            });
        }

        return { success: true, data: review };
    } catch (error) {
        return { success: false, error: "Failed to fetch review" };
    }
}
