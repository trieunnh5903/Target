import React from "react";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigationContainer } from "@/navigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  NotificationProvider,
  setupNotificationHandler,
} from "@/notifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useColorScheme } from "react-native";
import { PaperDarkTheme, PaperLightTheme } from "@/config/theme";

setupNotificationHandler();

GoogleSignin.configure({
  webClientId:
    "1098310179471-mv3lrl6o7akn8gb0b259kud7kvsgea8n.apps.googleusercontent.com",
});

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? PaperDarkTheme : PaperLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NotificationProvider>
          <PaperProvider theme={theme}>
            <BottomSheetModalProvider>
              <AppNavigationContainer />
            </BottomSheetModalProvider>
          </PaperProvider>
        </NotificationProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
