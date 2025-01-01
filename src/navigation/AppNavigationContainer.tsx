import React, { useCallback, useEffect, useState } from "react";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AppBottomTab from "./AppBottomTab";
import {
  CameraScreen,
  CreatePostScreen,
  EditImage,
  EditProfile,
  NotificationScreen,
  PostDetailScreen,
  SignInScreen,
  SignUpScreen,
} from "@/screens";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import * as SplashScreen from "expo-splash-screen";
import { fetchInitialPosts } from "@/redux/slices/postSlice";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { CustomView } from "@/components";
import { SPACING } from "@/constants";

const Stack = createNativeStackNavigator<RootStackParamList>();
SplashScreen.preventAutoHideAsync();
export const navigationRef = createNavigationContainerRef();

const AppNavigationContainer = () => {
  const notificationPostId = useNotificationListener();
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
    <NavigationContainer onReady={onLayoutRootView} ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={notificationPostId ? "PostDetail" : "Tabs"}
      >
        {user ? (
          <Stack.Group screenOptions={{ headerShadowVisible: false }}>
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Tabs" component={AppBottomTab} />
              <Stack.Screen name="CameraScreen" component={CameraScreen} />
            </Stack.Group>

            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={({ navigation }) => ({
                title: "Post detail",
                headerLeft() {
                  return (
                    <Pressable
                      onPress={() =>
                        navigation.canGoBack()
                          ? navigation.goBack()
                          : navigation.navigate("Tabs")
                      }
                    >
                      <CustomView paddingRight={SPACING.small}>
                        <MaterialCommunityIcons name="arrow-left" size={24} />
                      </CustomView>
                    </Pressable>
                  );
                },
              })}
              initialParams={{ postId: notificationPostId }}
            />

            <Stack.Screen
              name="CreatePost"
              options={{ headerTitle: "Create post" }}
              component={CreatePostScreen}
            />

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
