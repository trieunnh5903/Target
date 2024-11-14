import { StyleSheet } from "react-native";
import React from "react";
import { User } from "@/types";
import { Avatar } from "react-native-paper";

interface CustomAvatarProps {
  user: User;
  size: "large" | "small" | number;
}
const CustomAvatar: React.FC<CustomAvatarProps> = ({
  user,
  size = "small",
}) => {
  const sizeValue = size === "large" ? 90 : size === "small" ? 44 : size;
  if (user.photoURL) {
    return (
      <Avatar.Image
        size={sizeValue}
        source={{ uri: user?.photoURL }}
        style={{ backgroundColor: "white" }}
      />
    );
  }
  if (user.displayName) {
    return (
      <Avatar.Text size={sizeValue} label={user.displayName.slice(0, 1)} />
    );
  }

  return <Avatar.Icon size={sizeValue} icon={"account-circle-outline"} />;
};

export default CustomAvatar;

const styles = StyleSheet.create({});
