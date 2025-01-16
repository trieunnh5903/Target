import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";
import CustomView from "./CustomView";

interface ContainerProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}
const Container: React.FC<ContainerProps> = ({ children, style }) => {
  return <CustomView style={[styles.container, style]}>{children}</CustomView>;
};

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
