import React from "react";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigationContainer } from "@/navigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <BottomSheetModalProvider>
            <AppNavigationContainer />
          </BottomSheetModalProvider>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
