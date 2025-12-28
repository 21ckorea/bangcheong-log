"use client";

import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getLocation } from "@/lib/constants/locations";

interface LocationCardProps {
    broadcaster: string;
}

export function LocationCard({ broadcaster }: LocationCardProps) {
    const location = getLocation(broadcaster);

    if (!location) return null;

    return (
        <Card className="border-0 bg-secondary/10 overflow-hidden">
            <CardContent className="p-0">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-violet-500" />
                        <h3 className="font-bold text-lg">녹화 장소 안내</h3>
                    </div>
                    <div className="ml-7">
                        <p className="font-medium text-base">{location.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{location.address}</p>
                    </div>
                </div>

                {/* Map Links */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
                    <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(location.naverMapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-black/5 active:bg-black/10 transition-colors"
                    >
                        <Navigation className="w-4 h-4 text-green-500" />
                        네이버 지도
                    </a>
                    <a
                        href={`https://map.kakao.com/link/search/${encodeURIComponent(location.kakaoMapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-black/5 active:bg-black/10 transition-colors"
                    >
                        <Navigation className="w-4 h-4 text-yellow-500" />
                        카카오맵
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
