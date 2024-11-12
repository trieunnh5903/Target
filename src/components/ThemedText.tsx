import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import React, { PropsWithChildren } from "react";

interface ThemedTextProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
}
const ThemedText: React.FC<ThemedTextProps> = ({ children, style }) => {
  return <Text style={style}>{children}</Text>;
};

export default ThemedText;

const styles = StyleSheet.create({});
