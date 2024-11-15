import React from "react";
import { User } from "@/types";
import { Avatar } from "react-native-paper";

interface CustomAvatarProps {
  user: User | null;
  size: "large" | "small" | "medium" | number;
}
const CustomAvatar: React.FC<CustomAvatarProps> = ({
  user,
  size = "small",
}) => {
  const sizeValue =
    size === "large"
      ? 90
      : size === "medium"
      ? 33
      : size === "small"
      ? 24
      : size;

  if (user?.photoURL) {
    return (
      <Avatar.Image
        size={sizeValue}
        source={{ uri: user?.photoURL }}
        style={{ backgroundColor: "white" }}
      />
    );
  } else if (user?.displayName) {
    return (
      <Avatar.Text size={sizeValue} label={user.displayName.slice(0, 1)} />
    );
  }

  return <Avatar.Icon size={sizeValue} icon={"account-circle-outline"} />;
};

export default CustomAvatar;
