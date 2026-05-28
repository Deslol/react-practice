export interface NotificationsState {
    filter: filterType
    notifications: NotificationItem[]
    addNotification: (notification: NotificationItem) => void,
    markAsRead: (notificationId: string) => void,
    removeNotification: (notificationId: string) => void
    clearAll: () => void,
    setFilter: (filter: filterType) => void
    markAllAsRead: () => void,
}

type filterType = "all" | "read" | "unread"

export interface NotificationItem {
    id: string;
    title: string;
    text: string;
    read: boolean;
}