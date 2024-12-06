import { PropsWithChildren, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  setError,
  setExpoPushToken,
  setNotification,
} from "@/redux/slices/notificationSlice";
import { userAPI } from "@/api";

const NotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const userId = useAppSelector((state) => state.auth.currentUser?.uid);
  const pushToken = useRef<string>();

  useEffect(() => {
    (async () => {
      try {
        if (userId && pushToken.current && pushToken.current.length > 0) {
          await userAPI.updatePushToken(pushToken.current, userId);
        }
      } catch (e) {}
    })();
    return () => {};
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        dispatch(setExpoPushToken(token));
        pushToken.current = token;
      } catch (error) {
        dispatch(setExpoPushToken(undefined));
        dispatch(setError(`${error}`));
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "addNotificationReceivedListener",
          JSON.stringify(notification)
        );
        dispatch(setNotification(notification));
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "addNotificationResponseReceivedListener",
          JSON.stringify(response)
        );
        dispatch(setNotification(response.notification));
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
