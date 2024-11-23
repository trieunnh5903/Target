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
import { CROP_SIZE } from "@/constants";
import { IconButton } from "react-native-paper";

interface ImageCropperProps {
  onResizePress: () => void;
  gridHeight: number;
  gridWidth: number;
  imageUri: string;
  gesture: ComposedGesture | GestureType;
  displayWidth: number;
  displayHeight: number;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  gridOpacity: SharedValue<number>;
  gridTranslateX: SharedValue<number>;
  gridTranslateY: SharedValue<number>;
}
const ImageCropper: React.FC<ImageCropperProps> = ({
  onResizePress,
  gridHeight,
  gridWidth,
  imageUri,
  displayHeight,
  displayWidth,
  gesture,
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
      { translateX: gridTranslateX.value },
      { translateY: gridTranslateY.value },
    ],
  }));

  return (
    <View style={styles.imageArea}>
      {/*image */}
      <GestureDetector gesture={gesture}>
        <Animated.Image
          source={{ uri: imageUri }}
          style={[
            { width: displayWidth, height: displayHeight },
            animatedImageStyle,
          ]}
        />
      </GestureDetector>

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
          {/* vertial line */}
          <View style={[styles.verticalLine, { left: spacingLineVertical }]} />
          <View
            style={[styles.verticalLine, { left: spacingLineVertical * 2 }]}
          />

          {/* horizontal line */}
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
  verticalLine: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  horizontalLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(255,255,255,1)",
  },

  girdOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cropBox: {
    position: "absolute",
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  resize: { position: "absolute", bottom: 4, left: 4 },

  imageArea: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
});
