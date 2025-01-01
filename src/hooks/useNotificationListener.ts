import * as Notifications from "expo-notifications";
import { Post } from "@/types";

export const useNotificationListener = () => {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  if (
    lastNotificationResponse &&
    lastNotificationResponse.notification.request.content.data &&
    lastNotificationResponse.actionIdentifier ===
      Notifications.DEFAULT_ACTION_IDENTIFIER
  ) {
    const data = lastNotificationResponse.notification.request.content.data;
    if (data && data.postId) {
      return data.postId as Post["id"];
    }
  }
};
