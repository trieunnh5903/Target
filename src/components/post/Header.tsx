import { StyleSheet } from "react-native";
import React from "react";
import CustomView from "../CustomView";
import ThemedText from "../ThemedText";
import CustomAvatar from "../CustomAvatar";
import { User } from "@/types";
import { SPACING } from "@/constants";

const Header = ({
  avatarURL,
  displayName,
}: Pick<User, "avatarURL" | "displayName">) => {
  return (
    <CustomView style={styles.postHeader}>
      <CustomAvatar size={"small"} avatarUrl={avatarURL} />
      <ThemedText>{displayName}</ThemedText>
    </CustomView>
  );
};

export default Header;

const styles = StyleSheet.create({
  postHeader: {
    paddingHorizontal: 16,
    paddingVertical: SPACING.medium,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
