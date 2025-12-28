"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth.config";
import { revalidatePath } from "next/cache";

export async function getMyPageData() {
    const session = await auth();
    if (!session?.user?.email) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            logs: {
                include: {
                    program: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            favorites: {
                include: {
                    program: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });

    if (!user) return null;

    // Serialize for Client Component
    return JSON.parse(JSON.stringify({
        user: {
            name: user.name,
            email: user.email,
            image: user.image,
            emailNotification: user.emailNotification,
            pushNotification: user.pushNotification,
        },
        logs: user.logs,
        favorites: user.favorites,
    }));
}

export async function updateNotificationSettings(key: 'emailNotification' | 'pushNotification', value: boolean) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                [key]: value,
            },
        });

        revalidatePath("/my");
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
