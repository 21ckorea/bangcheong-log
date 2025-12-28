"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface TipsSectionProps {
    tips?: string | null;
}

export function TipsSection({ tips }: TipsSectionProps) {
    if (!tips) return null;

    return (
        <Card className="border-0 bg-yellow-500/10 dark:bg-yellow-500/5">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-full shrink-0">
                        <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-400 mb-2">방청 꿀팁</h3>
                        <div className="text-sm leading-relaxed text-yellow-900/80 dark:text-yellow-200/80 whitespace-pre-wrap">
                            {tips}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
