import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import CustomBottomTab from "@/navigation/CustomBottomTab";
import { PaperProvider } from "react-native-paper";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as StatusBar from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { SignInScreen } from "@/screens";

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    StatusBar.setStatusBarStyle("auto");
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Group>
              <Stack.Screen name="Tabs" component={CustomBottomTab} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Auth" component={SignInScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
