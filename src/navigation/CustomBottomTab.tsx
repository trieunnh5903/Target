import { Alert, Pressable } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "@/types/navigation";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CreatePostScreen, HomeScreen, ProfileScreen } from "@/screens";
import { IconButton } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { logout } from "@/redux/slices/authSlice";
import { CustomAvatar } from "@/components";

const Tab = createBottomTabNavigator<RootTabParamList>();
const CustomBottomTab = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const handleLogout = async () => {
    try {
      if (currentUser?.uid) {
        await userAPI.deletePushToken(currentUser.uid);
      }
      await authAPI.signOut().then(() => {
        dispatch(logout());
      });
    } catch (error) {
      Alert.alert("Error", "Failed logout. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return (
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={size}
                color="black"
              />
            );
          } else if (route.name === "Create") {
            return (
              <MaterialCommunityIcons
                name="plus-box-outline"
                size={size}
                color="black"
              />
            );
          }
          return <CustomAvatar user={currentUser} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
        options={({ route, navigation }) => ({
          title: "Create a post",
          headerShown: true,
          tabBarStyle: { display: "none" },
          headerLeft() {
            return (
              <Pressable
                hitSlop={4}
                onPress={() => navigation.goBack()}
                style={{ paddingLeft: 16 }}
              >
                <MaterialIcons name="arrow-back" size={24} color="black" />
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

export default CustomBottomTab;
