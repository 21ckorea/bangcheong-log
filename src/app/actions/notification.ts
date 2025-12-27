"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limit to last 20 notifications
        });
        return { success: true, data: notifications };
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
}

export async function markNotificationAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.notification.update({
            where: {
                id,
                userId: session.user.id, // Ensure ownership
            },
            data: {
                isRead: true,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return { success: false, error: "Failed to mark notification as read" };
    }
}

export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        return { success: false, error: "Failed to mark all notifications as read" };
    }
}
