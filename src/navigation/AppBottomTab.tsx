import { Alert, Pressable } from "react-native";
import React from "react";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "@/types/navigation";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  HomeScreen,
  ImagePickerScreen,
  ProfileScreen,
  SearchScreen,
} from "@/screens";
import { IconButton } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { logout } from "@/redux/slices/authSlice";
import { CustomAvatar } from "@/components";
import { RouteProp } from "@react-navigation/native";
import { authAPI } from "@/api";

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS = {
  Home: (props: { focused: boolean; color: string; size: number }) => (
    <MaterialCommunityIcons
      name={props.focused ? "home" : "home-outline"}
      size={props.size}
      color={props.color}
    />
  ),
  Search: (props: { focused: boolean; color: string; size: number }) => (
    <Ionicons name="search" size={props.size} color={props.color} />
  ),
  ImagePicker: (props: { color: string; size: number }) => (
    <MaterialCommunityIcons
      name="plus-box-outline"
      size={props.size}
      color={props.color}
    />
  ),
  Profile: (props: {
    focused: boolean;
    color: string;
    size: number;
    avatarUrl?: string | null;
  }) => (
    <CustomAvatar
      size={props.size}
      avatarUrl={props.avatarUrl}
      focused={props.focused}
      color={props.color}
    />
  ),
};

const AppBottomTab = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const handleLogout = async () => {
    dispatch(logout());
    // try {
    //   if (currentUser?.id) {
    //     const { error } = await authAPI.signOut(currentUser.id);
    //     if (!error) {
    //       dispatch(logout());
    //     }
    //   }
    // } catch (error) {
    //   console.log(error);
    //   Alert.alert("Error", "Failed logout. Please try again.", [
    //     { text: "OK" },
    //   ]);
    // }
  };

  const screenOptions: (props: {
    route: RouteProp<RootTabParamList, keyof RootTabParamList>;
    navigation: any;
  }) => BottomTabNavigationOptions = ({ route }) => ({
    headerTitle: "",
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: "black",
    tabBarInactiveTintColor: "black",
    headerShadowVisible: false,
    tabBarIcon: ({ focused, color }) => {
      const size = 32;
      const IconComponent = TAB_ICONS[route.name];
      return IconComponent({
        focused,
        color,
        size,
        avatarUrl: currentUser?.avatarURL,
      });
    },
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="ImagePicker"
        component={ImagePickerScreen}
        options={({ navigation }) => ({
          headerTitle: "Image picker",
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
