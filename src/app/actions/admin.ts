"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function getAllUsers() {
    const admin = await isAdmin();

    if (!admin) {
        return { success: false, error: "Unauthorized" };
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    favorites: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return { success: true, data: users };
}

export async function getUserStats() {
    const admin = await isAdmin();

    if (!admin) {
        return { success: false, error: "Unauthorized" };
    }

    const totalUsers = await prisma.user.count();
    const usersWithFavorites = await prisma.user.count({
        where: {
            favorites: {
                some: {},
            },
        },
    });

    const recentUsers = await prisma.user.count({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
        },
    });

    return {
        success: true,
        data: {
            totalUsers,
            usersWithFavorites,
            recentUsers,
        },
    };
}
