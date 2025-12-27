"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function createProgramRequest(formData: FormData) {
    const session = await auth();
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const isAnonymous = formData.get("isAnonymous") === "on";

    if (!url) {
        return { success: false, error: "URL is required" };
    }

    try {
        await prisma.programRequest.create({
            data: {
                url,
                title,
                isAnonymous,
                // If user is logged in and not choosing anonymous (or even if anon, we might want to track for abuse, but for now let's respect anon flag strictly or save ID but UI hides it.
                // Plan said: Save User ID if logged in but respect isAnonymous flag for display.
                userId: session?.user?.id ? session.user.id : null,
            },
        });

        // Revalidate admin page so they see it immediately if they are looking
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to create request:", error);
        return { success: false, error: "Failed to create request" };
    }
}

export async function getProgramRequests() {
    const admin = await isAdmin();
    if (!admin) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const requests = await prisma.programRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return { success: true, data: requests };
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

export async function updateProgramRequestStatus(id: string, status: string, reason?: string) {
    const admin = await isAdmin();
    if (!admin) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const request = await prisma.programRequest.update({
            where: { id },
            data: {
                status,
                rejectionReason: reason
            },
            include: { user: true },
        });

        // Create notification if user exists and is not anonymous (or even if anon, if we linked userId)
        if (request.userId) {
            let message = '';
            if (status === 'processed') {
                message = `'${request.title || '요청하신 프로그램'}'의 등록이 완료되었습니다.`;
            } else if (status === 'rejected') {
                message = `'${request.title || '요청하신 프로그램'}'의 등록이 거절되었습니다.`;
                if (reason) {
                    message += ` 사유: ${reason}`;
                }
            }

            await prisma.notification.create({
                data: {
                    userId: request.userId,
                    message,
                    type: status === 'processed' ? 'success' : 'error',
                },
            });
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to update request:", error);
        return { success: false, error: "Failed to update request" };
    }
}
