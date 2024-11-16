import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";

interface ContainerProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}
const Container: React.FC<ContainerProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
