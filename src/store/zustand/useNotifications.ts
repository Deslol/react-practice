import {create} from "zustand";
import type {NotificationItem, NotificationsState} from "../../interfaces/notifications.ts";

export const useNotifications = create<NotificationsState>()((set, get) => {
    return {
        notifications: [],
        filter: "all",
        addNotification: (notification: NotificationItem) => {
            set((state) => ({
                notifications: [...state.notifications, notification],
            }))
        },
        markAllAsRead: () => {
            set((state) => ({
                notifications: state.notifications.map((notification: NotificationItem) => ({
                    ...notification,
                    read: true
                }))
            }))
        },
        markAsRead: (notificationId: string) => {
            set((state) => ({
                notifications: state.notifications.map((notification: NotificationItem) =>
                    notification.id === notificationId ? {...notification, read: true} : notification,
                )
            }))
        },
        removeNotification: (notificationId) => {
            set((state) => ({
                notifications: state.notifications.filter((notification: NotificationItem) => notification.id !== notificationId)
            }))
        },
        setFilter: (filter) => set(() => ({filter})),
        clearAll: () => {
            set(() => ({notifications: []}))
        }
    }
})