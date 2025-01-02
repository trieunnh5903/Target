import { Modal, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { IconButton } from "react-native-paper";
import { Image } from "expo-image";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { PostImage } from "@/types";

interface ImageModalProps {
  source: PostImage["baseUrl"];
  isOpen: boolean;
  onClose: () => void;
}
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, source }) => {
  const preScale = useSharedValue(1);
  const scale = useSharedValue(1);
  const focal = useSharedValue({ x: 0, y: 0 });
  const aspectRatio = source.width / source.height;
  const offset = useSharedValue({ x: 0, y: 0 });
  const isZooming = useSharedValue(false);
  const isDraging = useSharedValue(false);
  const imageHeight = SCREEN_WIDTH / aspectRatio;
  const DRAG_DISMISS_THRESHOLD_Y = imageHeight * 0.3;
  const DRAG_DISMISS_VELOCITY = 800;

  useEffect(() => {
    if (isOpen) {
      offset.value = { x: 0, y: 0 };
      isDraging.value = false;
    }

    return () => {};
  }, [isDraging, isOpen, offset]);

  const handleClose = () => {
    onClose();
  };

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isZooming.value || isDraging.value ? 0 : 1,
  }));

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDraging.value = true;
    })
    .averageTouches(true)
    .onUpdate((e) => {
      if (isZooming.value === false) {
        offset.value = {
          x: 0,
          y: e.translationY,
        };
      } else {
        offset.value = {
          x: e.translationX,
          y: e.translationY,
        };
      }
    })
    .onEnd(({ translationY, velocityY }) => {
      if (
        Math.abs(translationY) > DRAG_DISMISS_THRESHOLD_Y ||
        Math.abs(velocityY) > DRAG_DISMISS_VELOCITY
      ) {
        const direction = translationY > 0 ? 1 : -1;
        offset.value = withTiming(
          { x: 0, y: direction * SCREEN_HEIGHT },
          {},
          () => {
            runOnJS(handleClose)();
          }
        );
      } else {
        isDraging.value = false;
        offset.value = withTiming({ x: 0, y: 0 });
      }
    });

  const pingGesture = Gesture.Pinch()
    .onStart((event) => {
      isZooming.value = true;
      preScale.value = scale.value;
      focal.value = {
        x: event.focalX,
        y: event.focalY,
      };
    })
    .onUpdate((event) => {
      scale.value = Math.max(event.scale * preScale.value, 0.5);
    })
    .onEnd(() => {
      scale.value = withTiming(1);

      isZooming.value = false;
    });

  const imageAimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { translateX: focal.value.x },
        { translateY: focal.value.y },
        { translateX: -SCREEN_WIDTH / 2 },
        { translateY: -(SCREEN_WIDTH / aspectRatio) / 2 },
        { scale: scale.value },
        { translateX: SCREEN_WIDTH / 2 },
        { translateY: SCREEN_WIDTH / aspectRatio / 2 },
        { translateX: -focal.value.x },
        { translateY: -focal.value.y },
      ],
    };
  });

  return (
    <Modal
      transparent
      visible={isOpen}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Background offset={offset} imageHeight={imageHeight} />
      <GestureHandlerRootView
        style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}
      >
        <Animated.View style={[styles.close, closeAnimatedStyle]}>
          <IconButton
            icon={"close"}
            containerColor="rgba(255,255,255,0.2)"
            onPress={handleClose}
            iconColor="white"
          />
        </Animated.View>

        <GestureDetector
          gesture={Gesture.Simultaneous(pingGesture, dragGesture)}
        >
          <Animated.View style={[imageAimatedStyle]}>
            <Image
              source={source.source}
              style={[
                {
                  width: SCREEN_WIDTH,
                  aspectRatio: aspectRatio,
                },
              ]}
            />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

interface BackgroundProps {
  offset: SharedValue<{
    x: number;
    y: number;
  }>;
  imageHeight: number;
}
const Background: React.FC<BackgroundProps> = ({ offset, imageHeight }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        Math.abs(offset.value.y),
        [0, (SCREEN_HEIGHT - imageHeight) / 2 + imageHeight],
        [1, 0],
        Extrapolation.CLAMP
      ),
      backgroundColor: "black",
    };
  });
  return (
    <Animated.View
      style={[
        { backgroundColor: "black" },
        StyleSheet.absoluteFill,
        animatedStyle,
      ]}
    ></Animated.View>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  image: {
    height: "auto",
    width: SCREEN_WIDTH,
  },
  close: {
    position: "absolute",
    zIndex: 3,
    top: SPACING.medium,
    left: SPACING.small,
  },
});
