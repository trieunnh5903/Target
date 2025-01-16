import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import Animated, {
  AnimatedStyle,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { CROP_SIZE } from "@/constants";
import CustomView from "./CustomView";

interface GridCropProps {
  width?: number;
  height?: number;
  isAnimated?: boolean;
  animatedOpacity?: SharedValue<number>;
  animatedTranslateX?: SharedValue<number>;
  animatedTranslateY?: SharedValue<number>;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
}
const GridCrop: React.FC<GridCropProps> = ({
  height = CROP_SIZE,
  width = CROP_SIZE,
  animatedOpacity,
  animatedTranslateX,
  animatedTranslateY,
  style,
}) => {
  const spacingLineHorizontal = height / 3;
  const spacingLineVertical = width / 3;

  const gridAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity?.value ?? 1,
    transform: [
      { translateX: animatedTranslateX?.value ?? 0 },
      { translateY: animatedTranslateY?.value ?? 0 },
    ],
  }));

  return (
    <Animated.View
      style={[styles.cropBox, { width, height }, style, gridAnimatedStyle]}
      pointerEvents="none"
    >
      <CustomView style={[styles.girdOverlay, { width, height }]}>
        {/* vertial line */}
        <CustomView
          style={[styles.verticalLine, { left: spacingLineVertical }]}
        />
        <CustomView
          style={[styles.verticalLine, { left: spacingLineVertical * 2 }]}
        />

        {/* horizontal line */}
        <CustomView
          style={[
            styles.horizontalLine,
            { width: width, top: spacingLineHorizontal },
          ]}
        />
        <CustomView
          style={[
            styles.horizontalLine,
            { width: width, top: spacingLineHorizontal * 2 },
          ]}
        />
      </CustomView>
    </Animated.View>
  );
};

export default GridCrop;

const styles = StyleSheet.create({
  cropBox: {
    position: "absolute",
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  girdOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  verticalLine: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  horizontalLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
