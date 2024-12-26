import { Alert, Pressable } from "react-native";
import React from "react";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "@/types/navigation";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CreatePostScreen, HomeScreen, ProfileScreen } from "@/screens";
import { IconButton } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { logout } from "@/redux/slices/authSlice";
import { CustomAvatar } from "@/components";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STATUS_BAR_HEIGHT } from "@/constants";

const Tab = createBottomTabNavigator<RootTabParamList>();
const AppBottomTab = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const handleLogout = async () => {
    try {
      if (currentUser?.id) {
        await userAPI.deletePushToken(currentUser.id);
      }

      const { error } = await authAPI.signOut();
      if (!error) {
        dispatch(logout());
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed logout. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const screenOptions: (props: {
    route: RouteProp<RootTabParamList, keyof RootTabParamList>;
    navigation: any;
  }) => BottomTabNavigationOptions = ({ route }) => ({
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: "black",
    tabBarInactiveTintColor: "black",
    headerShadowVisible: false,
    tabBarIcon: ({ focused, color }) => {
      const size = 32;
      let icon = (
        <CustomAvatar
          size={size}
          avatarUrl={currentUser?.avatarURL}
          focused={focused}
          color={color}
        />
      );

      switch (route.name) {
        case "Home":
          icon = (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          );
          break;

        case "Create":
          icon = (
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={size}
              color={color}
            />
          );

        default:
          break;
      }

      return icon;
    },
  });

  return (
    <Tab.Navigator initialRouteName="Create" screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
        options={({ navigation }) => ({
          title: "New post",
          tabBarStyle: { display: "none" },
          headerLeft() {
            return (
              <Pressable
                hitSlop={4}
                onPress={() => navigation.goBack()}
                style={{ paddingLeft: 16 }}
              >
                <MaterialIcons name="close" size={24} color="black" />
              </Pressable>
            );
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerRight() {
            return <IconButton onPress={handleLogout} icon={"logout"} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default AppBottomTab;
