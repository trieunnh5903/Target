import { StyleProp, View, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";
import { useTheme } from "react-native-paper";

interface ThemedViewProps extends PropsWithChildren {
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: StyleProp<ViewStyle>;
}
const ThemedView: React.FC<ThemedViewProps> = ({
  children,
  padding,
  paddingBottom,
  paddingHorizontal,
  paddingTop,
  paddingLeft,
  paddingRight,
  paddingVertical,
  style,
}) => {
  return (
    <View
      style={[
        {
          paddingHorizontal,
          paddingVertical,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ThemedView;
