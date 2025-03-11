import { StyleProp, TextStyle } from "react-native";
import React, { PropsWithChildren } from "react";
import { Text } from "react-native-paper";

interface ThemedTextProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
}
const ThemedText: React.FC<ThemedTextProps> = ({ children, style }) => {
  return <Text style={style}>{children}</Text>;
};

export default ThemedText;
