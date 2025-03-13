import React, { useCallback, useEffect, useMemo } from "react";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import AppBottomTab from "./AppBottomTab";
import {
  CameraScreen,
  ChatRoomScreen,
  CreatePostScreen,
  EditImage,
  EditProfile,
  ListChatScreen,
  NotificationScreen,
  PostDetailScreen,
  PremiumScreen,
  PremiumSuccessScreen,
  SignInScreen,
  SignUpScreen,
  UserDetailScreen,
} from "@/screens";
import { useAppDispatch, useAppSelector } from "@/hooks";
import * as SplashScreen from "expo-splash-screen";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { StatusBar } from "expo-status-bar";
import { Pressable } from "react-native-gesture-handler";
import { SPACING } from "@/constants";
import { CustomView } from "@/components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchPostsRequest } from "@/redux/slices/postSlice";
import { useColorScheme } from "react-native";
import { NavigationDarkTheme, NavigationLightTheme } from "@/config/theme";
import * as Linking from "expo-linking";
import { navigationRef } from "./NavigationService";

const Stack = createNativeStackNavigator<RootStackParamList>();
SplashScreen.preventAutoHideAsync();
const prefix = Linking.createURL("/");

const AppNavigationContainer = () => {
  const notificationPostId = useNotificationListener();
  const { currentUser, isReady } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? NavigationDarkTheme : NavigationLightTheme;

  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: [prefix],
    config: {
      screens: {
        Premium: "payment",
      },
    },
  };

  useEffect(() => {
    dispatch(fetchPostsRequest({ lastPost: null }));
    return () => {};
  }, [dispatch]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  const authScreenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      animation: "slide_from_right",
      headerTitle: "",
      headerShadowVisible: false,
    }),
    []
  );

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      onReady={onLayoutRootView}
      ref={navigationRef}
      theme={theme}
      linking={linking}
    >
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName={"Tabs"}>
        {currentUser ? (
          <Stack.Group screenOptions={{ headerShadowVisible: false }}>
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Tabs" component={AppBottomTab} />
              <Stack.Screen name="CameraScreen" component={CameraScreen} />
            </Stack.Group>

            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen
              name="ListChatRoom"
              component={ListChatScreen}
              options={{ headerTitle: "Messages" }}
            />
            <Stack.Screen name="UserDetail" component={UserDetailScreen} />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={({ navigation }) => ({
                headerLeft(props) {
                  return (
                    <Pressable
                      hitSlop={4}
                      onPress={() =>
                        navigation.canGoBack()
                          ? navigation.goBack()
                          : navigation.navigate("Tabs", { screen: "Home" })
                      }
                    >
                      <CustomView paddingRight={SPACING.small}>
                        <MaterialCommunityIcons name="arrow-left" size={24} />
                      </CustomView>
                    </Pressable>
                  );
                },
                title: "Post detail",
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

            <Stack.Screen
              name="Premium"
              options={{ headerTitle: "" }}
              component={PremiumScreen}
            />

            <Stack.Screen
              name="PremiumSuccess"
              options={{ headerShown: false }}
              component={PremiumSuccessScreen}
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
