import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import * as Notifications from "expo-notifications";
import {
  getNotificationsFromStorage,
  markNotificationAsRead,
  deleteNotification,
} from "@/notifications";
import { RootStackScreenProps } from "@/types/navigation";
import { NotificationLikedData, NotificationPayload } from "@/types";
import { ListRenderItem } from "react-native";
import { dayJs } from "@/utils/dayJs";
import { CustomView, ThemedText } from "@/components";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { SPACING } from "@/constants";

export default function NotificationsScreen({
  navigation,
}: RootStackScreenProps<"Notification">) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const selectedId = useRef<string>();
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  useEffect(() => {
    loadNotifications();
    const subscription = Notifications.addNotificationReceivedListener((s) => {
      loadNotifications();
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (res) => {
        loadNotifications();
      }
    );
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
  };

  const onNotificationLongPress = (id: string) => {
    handlePresentModalPress();
    selectedId.current = id;
  };

  const onDeleteNotificationPress = () => {
    if (selectedId.current) {
      deleteNotification(selectedId.current);
      setNotifications((pre) => pre.filter((i) => i.id !== selectedId.current));
    }
    closeModal();
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
        onLongPress={() => onNotificationLongPress(item.id)}
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <Text style={styles.notificationText}>{title}</Text>
        <Text style={styles.timeText}>{dayJs.getTimeFromNow(item.date)}</Text>
      </TouchableOpacity>
    );
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Pressable onPress={onDeleteNotificationPress}>
            <ThemedText style={styles.deleteText}>
              Delete notification
            </ThemedText>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </CustomView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
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
  deleteText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
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
