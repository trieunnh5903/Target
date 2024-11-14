import { StyleSheet, View } from "react-native";
import React, { PropsWithChildren } from "react";

const Container = ({ children }: PropsWithChildren) => {
  return <View style={styles.container}>{children}</View>;
};

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
