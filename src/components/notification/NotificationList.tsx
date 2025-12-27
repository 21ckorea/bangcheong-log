"use client";

import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notification";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Notification {
    id: string;
    message: string;
    type: string | null;
    isRead: boolean;
    createdAt: Date;
}

interface NotificationListProps {
    isOpen: boolean;
    onClose: () => void;
    onUnreadCountChange: (count: number) => void;
}

export default function NotificationList({ isOpen, onClose, onUnreadCountChange }: NotificationListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        const result = await getNotifications();
        if (result.success && result.data) {
            setNotifications(result.data);
            const unreadCount = result.data.filter((n: Notification) => !n.isRead).length;
            onUnreadCountChange(unreadCount);
        }
        setLoading(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch when opened
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        onUnreadCountChange(notifications.filter(n => !n.isRead && n.id !== id).length); // Update count

        await markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onUnreadCountChange(0);

        await markAllNotificationsAsRead();
    };

    const getIcon = (type: string | null) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={onClose}
            />
            <div className="absolute right-0 top-12 w-80 bg-background border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold text-sm">알림</h3>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" />
                            모두 읽음
                        </button>
                    )}
                </div>

                <div className="overflow-y-auto flex-1 p-1">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">로딩 중...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <span className="text-sm">새로운 알림이 없습니다.</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 rounded-lg text-sm flex gap-3 transition-colors ${notification.isRead ? 'opacity-60 hover:bg-secondary/50' : 'bg-violet-50/50 hover:bg-violet-50'
                                        }`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="leading-snug">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
