import { StyleProp, View, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";

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

export default CustomView;
