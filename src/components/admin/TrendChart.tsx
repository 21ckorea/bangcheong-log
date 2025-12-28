"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TrendData {
    date: string;
    count: number;
}

interface TrendChartProps {
    data: TrendData[];
    color?: string;
    className?: string;
}

export default function TrendChart({ data, color = "#8b5cf6", className }: TrendChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Fill missing dates
    const filledData = useMemo(() => {
        if (!data.length) return [];

        // Sort by date just in case
        const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const start = new Date(sorted[0].date);
        const end = new Date(); // Up to today
        const filled: TrendData[] = [];

        // Ensure at least 30 days lookback to fill the chart nicely
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

        // Use the earlier of data start or 30 days ago
        let current = start < thirtyDaysAgo ? start : thirtyDaysAgo;

        // If data is very sparse and starts way later than 30 days ago, we still want 30 days context
        // But if data is empty, we handled it. 
        // We iterate from 'current' to 'end'

        // Normalize time portion to avoid infinite loops if time isn't 00:00:00
        current.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Safety break
        let safety = 0;
        while (current <= end && safety < 100) {
            const dateStr = current.toISOString().split('T')[0];
            // match by string
            const existing = sorted.find(s => s.date === dateStr);
            filled.push({
                date: dateStr,
                count: existing ? existing.count : 0
            });
            current.setDate(current.getDate() + 1);
            safety++;
        }

        return filled.slice(-30); // Ensure max 30 days displayed
    }, [data]);

    const maxVal = Math.max(...filledData.map(d => d.count), 5); // Minimum max scale of 5

    // SVG Dimensions
    const svgWidth = 500;
    const svgHeight = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const barWidth = chartWidth / (filledData.length || 1);
    const gap = barWidth * 0.3;
    const effectiveBarWidth = Math.max(barWidth - gap, 1);

    // Y-axis ticks (5 ticks)
    const yTicks = useMemo(() => {
        const ticks = [];
        for (let i = 0; i <= 5; i++) {
            ticks.push(Math.round((maxVal / 5) * i));
        }
        return [...new Set(ticks)]; // Dedupe if maxVal is small
    }, [maxVal]);

    return (
        <div className={cn("w-full h-full relative group bg-white dark:bg-slate-950 rounded-lg p-2", className)}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full text-xs select-none" preserveAspectRatio="xMidYMid meet">
                {/* Y-Axis Grid & Labels */}
                {yTicks.map((tick, i) => {
                    const y = margin.top + chartHeight - ((tick / maxVal) * chartHeight);
                    return (
                        <g key={`y-${tick}`}>
                            <line
                                x1={margin.left}
                                y1={y}
                                x2={svgWidth - margin.right}
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                strokeDasharray={i === 0 ? "" : "4 4"}
                                vectorEffect="non-scaling-stroke"
                            />
                            <text
                                x={margin.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                fill="#9ca3af" // text-gray-400
                                fontSize="10"
                                className="font-mono"
                            >
                                {tick}
                            </text>
                        </g>
                    )
                })}

                {/* X-Axis Labels (Every 5th day) */}
                {filledData.map((d, i) => {
                    // Always show first and last. Intermediate every 5.
                    const showLabel = i === 0 || i === filledData.length - 1 || i % 5 === 0;

                    if (!showLabel) return null;

                    const x = margin.left + (i * barWidth) + (barWidth / 2);
                    // Format date MM/DD
                    const dateLabel = d.date.substring(5).replace('-', '/');

                    return (
                        <text
                            key={`x-${d.date}`}
                            x={x}
                            y={svgHeight - 10}
                            textAnchor="middle"
                            fill="#9ca3af"
                            fontSize="10"
                            className="font-mono"
                        >
                            {dateLabel}
                        </text>
                    );
                })}

                {/* Bars */}
                {filledData.map((d, i) => {
                    const barHeight = (d.count / maxVal) * chartHeight;
                    const x = margin.left + (i * barWidth) + (gap / 2);
                    const y = margin.top + chartHeight - barHeight;

                    return (
                        <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                            <rect
                                x={x}
                                y={y}
                                width={effectiveBarWidth}
                                height={barHeight}
                                fill={color}
                                opacity={hoveredIndex === i ? 1 : 0.7}
                                rx="2"
                            />
                            {/* Invisible Hit Area (full column width) */}
                            <rect
                                x={margin.left + (i * barWidth)}
                                y={margin.top}
                                width={barWidth}
                                height={chartHeight}
                                fill="transparent"
                                className="cursor-pointer"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && filledData[hoveredIndex] && (
                <div
                    className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-xl pointer-events-none z-20 whitespace-nowrap"
                    style={{
                        left: `${((margin.left + (hoveredIndex * barWidth) + (barWidth / 2)) / svgWidth) * 100}%`,
                        top: `${((margin.top + chartHeight - ((filledData[hoveredIndex].count / maxVal) * chartHeight)) / svgHeight) * 100}%`,
                        transform: "translate(-50%, -120%)"
                    }}
                >
                    <div className="text-[10px] opacity-80 mb-0.5">{filledData[hoveredIndex].date}</div>
                    <div className="text-center font-bold text-sm">{filledData[hoveredIndex].count}건</div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
}
