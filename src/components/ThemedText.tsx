import { StyleSheet, Text, View } from "react-native";
import React, { PropsWithChildren } from "react";

interface ThemedTextProps extends PropsWithChildren {}
const ThemedText: React.FC<ThemedTextProps> = ({ children }) => {
  return <Text>{children}</Text>;
};

export default ThemedText;

const styles = StyleSheet.create({});
