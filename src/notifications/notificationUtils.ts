import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { NotificationPayload } from "@/types";
import { randomUUID } from "expo-crypto";

const NOTIFICATIONS_STORAGE_KEY = "APP_NOTIFICATIONS";

export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const saveNotificationToStorage = async (
  notification: Omit<NotificationPayload, "id">
) => {
  try {
    if (notification.date === 0) return;
    const notificationWithId = {
      id: randomUUID(),
      ...notification,
    };

    const existingNotificationsJson = await AsyncStorage.getItem(
      NOTIFICATIONS_STORAGE_KEY
    );
    const existingNotifications: NotificationPayload[] =
      existingNotificationsJson ? JSON.parse(existingNotificationsJson) : [];

    const updatedNotifications = [notificationWithId, ...existingNotifications];

    const limitedNotifications = updatedNotifications.slice(0, 100);

    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(limitedNotifications)
    );

    return notificationWithId.id;
  } catch (error) {
    console.error("Lỗi khi lưu thông báo:", error);
    throw error;
  }
};

export const getNotificationsFromStorage = async () => {
  try {
    const notificationsJson = await AsyncStorage.getItem(
      NOTIFICATIONS_STORAGE_KEY
    );
    return (
      notificationsJson ? JSON.parse(notificationsJson) : []
    ) as NotificationPayload[];
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    return [];
  }
};

export const markNotificationAsRead = async (
  notificationId: NotificationPayload["id"]
) => {
  try {
    const notifications = await getNotificationsFromStorage();

    const updatedNotifications = notifications.map((notification) => {
      if (notification.id === notificationId) {
        return { ...notification, isRead: true };
      }
      return notification;
    });

    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
    return updatedNotifications;
  } catch (error) {
    console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const notifications = await getNotificationsFromStorage();

    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", error);
    throw error;
  }
};

export const deleteNotification = async (
  notificationId: NotificationPayload["id"]
) => {
  try {
    const notifications = await getNotificationsFromStorage();

    const filteredNotifications = notifications.filter(
      (notification) => notification.id !== notificationId
    );

    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(filteredNotifications)
    );
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    throw error;
  }
};

export const deleteAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error("Lỗi khi xóa tất cả thông báo:", error);
    throw error;
  }
};

export const countUnreadNotifications = async () => {
  try {
    const notifications = await getNotificationsFromStorage();
    return notifications.filter((notification) => !notification.isRead).length;
  } catch (error) {
    console.error("Lỗi khi đếm thông báo chưa đọc:", error);
    return 0;
  }
};
