"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toggleFavoriteProgram } from "@/app/actions/user";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    programId: string;
    initialIsFavorite?: boolean;
}

export default function FavoriteButton({ programId, initialIsFavorite = false }: FavoriteButtonProps) {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Check if user is logged in
        if (!session) {
            signIn("google");
            return;
        }

        setIsLoading(true);
        const result = await toggleFavoriteProgram(programId);

        if (result.success) {
            setIsFavorite(result.action === "added");
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "p-2 rounded-full transition-all duration-200",
                isFavorite
                    ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30"
                    : "bg-secondary/20 text-muted-foreground hover:bg-secondary/30 hover:text-pink-500"
            )}
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-all",
                    isFavorite && "fill-current"
                )}
            />
        </button>
    );
}
