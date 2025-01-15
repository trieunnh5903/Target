import { StyleProp, View, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";
import { useTheme } from "react-native-paper";

interface CustomViewProps extends PropsWithChildren {
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: StyleProp<ViewStyle>;
}
const CustomView: React.FC<CustomViewProps> = ({
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
  const theme = useTheme();

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
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default CustomView;
