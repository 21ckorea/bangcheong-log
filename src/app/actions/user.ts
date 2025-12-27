"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export async function getUserProfile() {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            favorites: {
                include: {
                    program: true,
                },
            },
        },
    });

    return { success: true, data: user };
}

export async function getFavoritePrograms() {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, error: "User not found" };
    }

    const favorites = await prisma.favoriteProgram.findMany({
        where: { userId: user.id },
        include: {
            program: true,
        },
    });

    return { success: true, data: favorites };
}

export async function toggleFavoriteProgram(programId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, error: "User not found" };
    }

    const existing = await prisma.favoriteProgram.findUnique({
        where: {
            userId_programId: {
                userId: user.id,
                programId: programId,
            },
        },
    });

    if (existing) {
        await prisma.favoriteProgram.delete({
            where: { id: existing.id },
        });
        return { success: true, action: "removed" };
    } else {
        await prisma.favoriteProgram.create({
            data: {
                userId: user.id,
                programId: programId,
            },
        });
        return { success: true, action: "added" };
    }
}
