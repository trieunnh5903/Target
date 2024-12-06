import React from "react";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigationContainer } from "@/navigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NotificationProvider } from "@/provider";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NotificationProvider>
          <PaperProvider>
            <BottomSheetModalProvider>
              <AppNavigationContainer />
            </BottomSheetModalProvider>
          </PaperProvider>
        </NotificationProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
