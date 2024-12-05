import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { NavigationContainer } from "@react-navigation/native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AppBottomTab from "./AppBottomTab";
import {
  CameraScreen,
  EditImage,
  EditProfile,
  SignInScreen,
  SignUpScreen,
} from "@/screens";
import { useAppDispatch } from "@/hooks";
import { fetchUserById } from "@/redux/slices/authSlice";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigationContainer = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const dispatch = useAppDispatch();
  // const { init } = useNotificationObserver();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      // init(user);
      if (user) {
        dispatch(fetchUserById(user.uid));
      }
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [dispatch, initializing]);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Group>
            <Stack.Screen name="Tabs" component={AppBottomTab} />
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
    </NavigationContainer>
  );
};

export default AppNavigationContainer;
