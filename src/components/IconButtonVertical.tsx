import { StyleSheet, View } from "react-native";
import React, { ComponentProps } from "react";
import { Pressable } from "react-native-gesture-handler";
import { GLOBAL_STYLE } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";

interface IconButtonVerticalProps {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconSize?: number;
  label: string;
  onPress: () => void;
}
const IconButtonVertical: React.FC<IconButtonVerticalProps> = ({
  icon,
  label,
  iconSize = 24,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <View style={GLOBAL_STYLE.center}>
        <MaterialCommunityIcons name={icon} size={iconSize} color="black" />
        <Text variant="titleMedium">{label}</Text>
      </View>
    </Pressable>
  );
};

export default IconButtonVertical;

const styles = StyleSheet.create({});
