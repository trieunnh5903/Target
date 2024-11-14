import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as StatusBar from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { EditProfile, SignInScreen } from "@/screens";
import { useAppDispatch, useNotificationObserver } from "@/hooks";
import CustomBottomTab from "@/navigation/CustomBottomTab";
import { fetchUserById } from "@/redux/slices/authSlice";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { init } = useNotificationObserver();

  useEffect(() => {
    StatusBar.setStatusBarStyle("auto");
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      init(user);
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
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Group>
                <Stack.Screen name="Tabs" component={CustomBottomTab} />
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
                </Stack.Group>
              </Stack.Group>
            ) : (
              <Stack.Group>
                <Stack.Screen name="Auth" component={SignInScreen} />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
