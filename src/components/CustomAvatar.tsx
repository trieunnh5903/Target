import React from "react";
import { User } from "@/types";
import { Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomView from "./CustomView";
import { OpaqueColorValue, StyleSheet } from "react-native";

interface CustomAvatarProps {
  avatarUrl: string | null | undefined;
  size: "large" | "small" | "medium" | number;
  focused?: boolean;
  color?: string | OpaqueColorValue | undefined;
}
const CustomAvatar: React.FC<CustomAvatarProps> = ({
  avatarUrl,
  focused,
  size = "small",
  color,
}) => {
  const sizeValue =
    size === "large"
      ? 90
      : size === "medium"
      ? 40
      : size === "small"
      ? 32
      : size;

  if (avatarUrl) {
    return (
      <CustomView style={[focused === true ? styles.avatarFocus : null]}>
        <Avatar.Image
          size={sizeValue}
          source={{ uri: avatarUrl }}
          style={{
            backgroundColor: "white",
          }}
        />
      </CustomView>
    );
  }

  return (
    <MaterialCommunityIcons
      name={
        focused === undefined
          ? "account-circle"
          : true
          ? "account-circle"
          : "account-circle-outline"
      }
      size={sizeValue}
      color={color}
    />
  );
};

export default CustomAvatar;

const styles = StyleSheet.create({
  avatarFocus: {
    borderRadius: 10000,
    borderWidth: 1,
  },
});
