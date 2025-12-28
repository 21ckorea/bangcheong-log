"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/Card";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'deadline' | 'record'; // deadline = applyEndDate, record = recordDate
}

interface CalendarViewProps {
    events: CalendarEvent[];
}

export default function CalendarView({ events }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty cells for start of month alignment
    const startDay = getDay(monthStart); // 0 = Sunday
    const emptyDays = Array(startDay).fill(null);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const selectedEvents = events.filter(e => isSameDay(e.date, selectedDate));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-violet-500" />
                    {format(currentDate, "yyyy년 M월")}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-full">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-secondary/10 rounded-2xl p-4">
                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-muted-foreground">
                    <div className="text-red-400">일</div>
                    <div>월</div>
                    <div>화</div>
                    <div>수</div>
                    <div>목</div>
                    <div>금</div>
                    <div className="text-blue-400">토</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2">
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {daysInMonth.map((day) => {
                        const dayEvents = events.filter(e => isSameDay(e.date, day));
                        const hasDeadline = dayEvents.some(e => e.type === 'deadline');
                        const hasRecord = dayEvents.some(e => e.type === 'record');
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <div
                                key={day.toISOString()}
                                className="flex flex-col items-center cursor-pointer relative py-2"
                                onClick={() => setSelectedDate(day)}
                            >
                                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                  ${isToday(day) ? 'bg-violet-500 text-white' : ''}
                  ${isSelected && !isToday(day) ? 'bg-white/10 text-white' : ''}
                  ${!isSameMonth(day, currentDate) ? 'text-muted-foreground opacity-50' : ''}
                `}>
                                    {format(day, "d")}
                                </div>

                                {/* Dots */}
                                <div className="flex gap-0.5 mt-1 h-1.5">
                                    {hasDeadline && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                    {hasRecord && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Details */}
            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-semibold text-lg px-1">
                    {format(selectedDate, "M월 d일 (EEE)", { locale: ko })}
                </h3>

                {selectedEvents.length === 0 ? (
                    <p className="text-muted-foreground text-sm px-1 py-4 text-center bg-secondary/5 rounded-xl">
                        일정이 없습니다.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {selectedEvents.map((event, idx) => (
                            <Card key={`${event.id}-${idx}`} className="border-0 bg-secondary/10">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className={`w-1.5 h-10 rounded-full ${event.type === 'deadline' ? 'bg-red-400' : 'bg-green-400'}`} />
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className={`text-xs ${event.type === 'deadline' ? 'text-red-400' : 'text-green-400'}`}>
                                            {event.type === 'deadline' ? '신청 마감' : '녹화일'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>신청 마감</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>녹화일</span>
                </div>
            </div>
        </div>
    );
}
