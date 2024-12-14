import React, { useCallback, useEffect, useState } from "react";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
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
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import * as SplashScreen from "expo-splash-screen";
import { fetchInitialPosts } from "@/redux/slices/postSlice";

const Stack = createNativeStackNavigator<RootStackParamList>();
SplashScreen.preventAutoHideAsync();

const AppNavigationContainer = () => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const { initialStatus } = useAppSelector((state) => state.posts);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [dispatch, initializing]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser(user.uid));
    }
    dispatch(fetchInitialPosts());
  }, [dispatch, user]);

  useEffect(() => {
    setIsAppReady(!initializing && initialStatus === "succeeded");
  }, [initialStatus, initializing]);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  const authScreenOptions: NativeStackNavigationOptions = {
    animation: "slide_from_right",
    headerTitle: "",
    headerShadowVisible: false,
  };

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <Stack.Navigator>
        {user ? (
          <Stack.Group screenOptions={{ headerShadowVisible: false }}>
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Tabs" component={AppBottomTab} />
              <Stack.Screen name="CameraScreen" component={CameraScreen} />
            </Stack.Group>

            <Stack.Screen
              name="EditProfile"
              options={{ headerTitle: "Edit your profile" }}
              component={EditProfile}
            />
            <Stack.Screen
              name="EditImage"
              options={{ headerTitle: "" }}
              component={EditImage}
            />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={authScreenOptions}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigationContainer;
