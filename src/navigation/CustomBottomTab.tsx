import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "@/types/navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { CreatePostScreen, HomeScreen, ProfileScreen } from "@/screens";

const Tab = createBottomTabNavigator<RootTabParamList>();
const CustomBottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <MaterialIcons name={"home"} size={size} color={color} />;
          } else if (route.name === "Create") {
            return <MaterialIcons name={"create"} size={size} color={color} />;
          }
          return (
            <MaterialIcons name={"account-circle"} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreatePostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default CustomBottomTab;

const styles = StyleSheet.create({});
