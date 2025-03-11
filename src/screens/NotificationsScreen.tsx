import React, { useState, useEffect } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import {
  getNotificationsFromStorage,
  markNotificationAsRead,
} from "@/notifications";
import { RootStackScreenProps } from "@/types/navigation";
import { NotificationLikedData, NotificationPayload } from "@/types";
import { ListRenderItem } from "react-native";
import { dayJs } from "@/utils/dayJs";
import { CustomView } from "@/components";

export default function NotificationsScreen({
  navigation,
}: RootStackScreenProps<"Notification">) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    loadNotifications();
    const subscription = Notifications.addNotificationReceivedListener((s) => {
      loadNotifications();
    });

    return () => subscription.remove();
  }, []);

  const loadNotifications = async () => {
    const storedNotifications = await getNotificationsFromStorage();
    setNotifications(storedNotifications);
  };

  const handleNotificationPress = async (notification: NotificationPayload) => {
    const updatedNotifications = await markNotificationAsRead(notification.id);

    if (notification.data.type === "like") {
      navigation.navigate("PostDetail", { postId: notification.data.postId });
    }
    setNotifications(updatedNotifications);
    // loadNotifications();
  };

  const renderNotificationItem: ListRenderItem<NotificationPayload> = ({
    item,
  }) => {
    let title = "";
    if (item.data.type === "like") {
      const data = item.data as NotificationLikedData;
      title = `${data.likedBy.displayName} already liked your post`;
    }

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <Text style={styles.notificationText}>{title}</Text>
        <Text style={styles.timeText}>{dayJs.getTimeFromNow(item.date)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <CustomView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notification</Text>
        }
      />
    </CustomView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  unreadItem: {
    backgroundColor: "#f0f8ff",
  },
  notificationText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#888",
  },
});
