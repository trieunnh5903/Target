import { PropsWithChildren, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  setError,
  setExpoPushToken,
  setNewNotification,
} from "@/redux/slices/notificationSlice";
import { userAPI } from "@/api";
import { saveNotificationToStorage } from "./notificationUtils";
import { NotificationPayload } from "@/types";
import { navigationRef } from "@/navigation/AppNavigationContainer";

const NotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const userId = useAppSelector((state) => state.auth.currentUser?.id);
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const payload = notification.request.content.data;
        saveNotificationToStorage({
          data: payload as NotificationPayload["data"],
          date: notification.date,
          isRead: false,
        });
        dispatch(setNewNotification(notification));
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const payload = response.notification.request.content.data;
        saveNotificationToStorage({
          data: payload as NotificationPayload["data"],
          date: response.notification.date,
          isRead: false,
        });
        navigationRef.current?.navigate("Notification");
      });
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [dispatch]);

  useEffect(() => {
    const getUserPushToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        dispatch(setExpoPushToken(token));
        return token;
      } catch (error) {
        dispatch(setExpoPushToken(undefined));
        dispatch(setError(`${error}`));
      }
    };

    const updateUserPushToken = async () => {
      try {
        const pushToken = await getUserPushToken();
        if (userId && pushToken && pushToken?.length > 0) {
          await userAPI.updatePushToken(pushToken, userId);
        }
      } catch {}
    };
    updateUserPushToken();
  }, [dispatch, userId]);

  return children;
};

function handleRegistrationError(errorMessage: string) {
  console.log(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default NotificationProvider;
