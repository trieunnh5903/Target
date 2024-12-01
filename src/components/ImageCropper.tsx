import { StyleSheet, View } from "react-native";
import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  ComposedGesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import { CROP_SIZE, GLOBAL_STYLE } from "@/constants";
import { IconButton } from "react-native-paper";

interface ImageCropperProps {
  onResizePress: () => void;
  gridHeight: number;
  gridWidth: number;
  uri: string;
  gesture: ComposedGesture | GestureType;
  displayWidth: number;
  displayHeight: number;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  gridOpacity: SharedValue<number>;
  gridTranslateX?: SharedValue<number>;
  gridTranslateY?: SharedValue<number>;
  animatedGrid?: boolean;
}
const ImageCropper: React.FC<ImageCropperProps> = ({
  onResizePress,
  gridHeight,
  gridWidth,
  uri,
  displayHeight,
  displayWidth,
  gesture,
  animatedGrid,
  translationX,
  translationY,
  gridOpacity,
  gridTranslateX,
  gridTranslateY,
}) => {
  const spacingLineHorizontal = gridHeight / 3;
  const spacingLineVertical = gridWidth / 3;
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const gridAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
    transform: [
      { translateX: animatedGrid ? gridTranslateX?.value ?? 0 : 0 },
      { translateY: animatedGrid ? gridTranslateY?.value ?? 0 : 0 },
    ],
  }));

  if (!uri) return null;

  return (
    <View style={styles.imageArea}>
      {/*image */}
      <View
        style={[
          { width: gridWidth, height: gridHeight },
          styles.imageContainer,
        ]}
      >
        <GestureDetector gesture={gesture}>
          <Animated.Image
            source={{ uri }}
            style={[
              {
                width: displayWidth,
                height: displayHeight,
              },
              animatedImageStyle,
            ]}
          />
        </GestureDetector>
      </View>

      <Animated.View
        style={[
          styles.cropBox,
          { width: CROP_SIZE, height: CROP_SIZE },
          gridAnimatedStyle,
        ]}
        pointerEvents="none"
      >
        <View
          style={[styles.girdOverlay, { width: gridWidth, height: gridHeight }]}
        >
          <View style={[styles.verticalLine, { left: spacingLineVertical }]} />
          <View
            style={[styles.verticalLine, { left: spacingLineVertical * 2 }]}
          />

          <View
            style={[
              styles.horizontalLine,
              { width: gridWidth, top: spacingLineHorizontal },
            ]}
          />
          <View
            style={[
              styles.horizontalLine,
              { width: gridWidth, top: spacingLineHorizontal * 2 },
            ]}
          />
        </View>
      </Animated.View>

      <IconButton
        icon={"resize"}
        mode="contained"
        containerColor="black"
        iconColor="white"
        style={styles.resize}
        onPress={onResizePress}
      />
    </View>
  );
};

export default ImageCropper;

const styles = StyleSheet.create({
  imageContainer: {
    overflow: "hidden",
    borderRadius: 16,
    ...GLOBAL_STYLE.center,
  },
  verticalLine: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "lightgray",
  },
  horizontalLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "lightgray",
  },

  girdOverlay: {
    ...GLOBAL_STYLE.center,
    backgroundColor: "transparent",
  },
  cropBox: {
    position: "absolute",
    borderColor: "white",
    ...GLOBAL_STYLE.center,
  },
  resize: { position: "absolute", bottom: 4, left: 4 },

  imageArea: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    ...GLOBAL_STYLE.center,
    overflow: "hidden",
    borderRadius: 16,
  },
});
