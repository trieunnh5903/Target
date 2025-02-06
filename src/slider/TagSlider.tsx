import { StyleSheet } from "react-native";
import React, { useRef } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Slider, { SliderProps } from "@react-native-community/slider";
import { SCREEN_HEIGHT } from "@/constants";
import { useKeyboardHeight } from "@/hooks";

const AnimatedSlider = Animated.createAnimatedComponent(Slider);

const TagSlider: React.FC<SliderProps> = ({
  onValueChange,
  style,
  ...rest
}) => {
  const { keyboardHeight } = useKeyboardHeight();
  const sliderAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: (SCREEN_HEIGHT - keyboardHeight.value) / 2,
    };
  });

  const sliderContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: (SCREEN_HEIGHT - keyboardHeight.value) / 2,
    };
  });

  return (
    <Animated.View
      style={[styles.sliderContainer, sliderContainerAnimatedStyle]}
    >
      <AnimatedSlider
        style={[styles.slider, style, sliderAnimatedStyle]}
        onValueChange={onValueChange}
        thumbTintColor={"#FFFFFF"}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#f0f0f0"
        {...rest}
      />
    </Animated.View>
  );
};

export default TagSlider;

const styles = StyleSheet.create({
  slider: {
    height: 40,
    transform: [{ rotate: "-90deg" }, { translateX: 40 }],
    transformOrigin: "40px 40px",
  },
  sliderContainer: {
    width: 40,
    alignSelf: "flex-start",
    justifyContent: "flex-end",
  },
});
