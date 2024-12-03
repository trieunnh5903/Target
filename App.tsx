import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { IconButton, PaperProvider } from "react-native-paper";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as StatusBar from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import {
  CameraScreen,
  EditImage,
  EditProfile,
  SignInScreen,
  SignUpScreen,
} from "@/screens";
import CustomBottomTab from "@/navigation/CustomBottomTab";
import { fetchUserById } from "@/redux/slices/authSlice";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetManager } from "@/components";

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // const { init } = useNotificationObserver();

  useEffect(() => {
    StatusBar.setStatusBarStyle("auto");
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      // init(user);
      if (user) {
        store.dispatch(fetchUserById(user.uid));
      }
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                <Stack.Group>
                  <Stack.Screen name="Tabs" component={CustomBottomTab} />
                  <Stack.Screen name="CameraScreen" component={CameraScreen} />
                  <Stack.Group
                    screenOptions={{
                      headerShown: true,
                      headerShadowVisible: false,
                    }}
                  >
                    <Stack.Screen
                      name="EditProfile"
                      options={{ headerTitle: "Edit your profile" }}
                      component={EditProfile}
                    />
                    <Stack.Screen
                      name="EditImage"
                      options={() => {
                        return {
                          headerTitle: "",
                        };
                      }}
                      component={EditImage}
                    />
                  </Stack.Group>
                </Stack.Group>
              ) : (
                <Stack.Group
                  screenOptions={{
                    animation: "slide_from_right",
                    headerShown: true,
                    headerTitle: "",
                    headerShadowVisible: false,
                  }}
                >
                  <Stack.Screen name="SignIn" component={SignInScreen} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} />
                </Stack.Group>
              )}
            </Stack.Navigator>
            <BottomSheetManager />
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
