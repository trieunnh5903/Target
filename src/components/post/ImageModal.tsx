import { Modal, StyleSheet } from "react-native";
import React, { useLayoutEffect } from "react";
import { IconButton } from "react-native-paper";
import { Image } from "expo-image";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SPACING,
  STATUS_BAR_HEIGHT,
} from "@/constants";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

interface ImageModalProps {
  source: string;
  isOpen: boolean;
  onClose: () => void;
  origin: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  origin,
  source,
}) => {
  const { width: originImageWidth, height: originImageHeight } = origin;
  const scale = useSharedValue(1);
  const focal = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: 0, y: 0 });
  const isDraging = useSharedValue(false);
  const INITIAL_OFFSET_Y = origin.y + STATUS_BAR_HEIGHT;
  const DRAG_DISMISS_THRESHOLD_Y = origin.height * 0.3;
  const DRAG_DISMISS_THRESHOLD_X = origin.width * 0.2;
  const DRAG_DISMISS_VELOCITY = 800;
  const CENTER_SCREEN_OFFSET_Y =
    (SCREEN_HEIGHT - origin.height) / 2 + STATUS_BAR_HEIGHT;
  const animatedBacground = useSharedValue(0);
  useAnimatedReaction(
    () => offset.value,
    (v) => {
      console.log(v.y);
    }
  );

  useLayoutEffect(() => {
    offset.value = { x: 0, y: INITIAL_OFFSET_Y };
    animatedBacground.value = withTiming(1);
    offset.value = withTiming({
      x: 0,
      y: CENTER_SCREEN_OFFSET_Y,
    });
  }, [CENTER_SCREEN_OFFSET_Y, INITIAL_OFFSET_Y, animatedBacground, offset]);

  const handleClose = () => {
    animatedBacground.value = withTiming(0);
    offset.value = withTiming({ x: 0, y: INITIAL_OFFSET_Y }, {}, () => {
      runOnJS(onClose)();
    });
  };

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    opacity:
      isDraging.value === false && offset.value.y < CENTER_SCREEN_OFFSET_Y
        ? 0
        : scale.value === 1
        ? 1
        : 0,
  }));

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDraging.value = true;
    })
    .averageTouches(true)
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX,
        y: CENTER_SCREEN_OFFSET_Y + e.translationY,
      };
    })

    .onEnd(({ translationY, velocityY, velocityX, translationX }) => {
      isDraging.value = false;
      if (
        scale.value === 1 &&
        (Math.abs(translationY) > DRAG_DISMISS_THRESHOLD_Y ||
          Math.abs(velocityY) > DRAG_DISMISS_VELOCITY ||
          Math.abs(velocityX) > DRAG_DISMISS_VELOCITY ||
          Math.abs(translationX) > DRAG_DISMISS_THRESHOLD_X)
      ) {
        runOnJS(handleClose)();
      } else {
        offset.value = withTiming({ x: 0, y: CENTER_SCREEN_OFFSET_Y });
      }
    })
    .runOnJS(true);

  const pingGesture = Gesture.Pinch()
    .onStart((event) => {
      focal.value = { x: event.focalX, y: event.focalY };
    })
    .onUpdate((event) => {
      scale.value = Math.max(event.scale, 0.5);
    })
    .onEnd(() => {
      scale.value = withTiming(1);
    })
    .runOnJS(true);

  const frameAimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { translateX: focal.value.x },
        { translateY: focal.value.y },
        { translateX: -origin.width / 2 },
        { translateY: -origin.height / 2 },
        { scale: scale.value },
        { translateX: origin.width / 2 },
        { translateY: origin.height / 2 },
        { translateX: -focal.value.x },
        { translateY: -focal.value.y },
      ],
    };
  });
  return (
    <Modal transparent visible={isOpen} statusBarTranslucent>
      <GestureHandlerRootView style={GLOBAL_STYLE.flex_1}>
        <Background animatedBackground={animatedBacground} />

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
          <Animated.View
            style={[
              {
                position: "absolute",
                width: originImageWidth,
                height: originImageHeight,
                zIndex: 1,
              },
              frameAimatedStyle,
            ]}
          >
            <Image source={source} style={GLOBAL_STYLE.fullSize} />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

interface BackgroundProps {
  animatedBackground: SharedValue<number>;
}
const Background: React.FC<BackgroundProps> = ({ animatedBackground }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedBackground.value,
      // backgroundColor: "black",
    };
  });
  return (
    <Animated.View
      style={[GLOBAL_STYLE.flex_1, { backgroundColor: "black" }, animatedStyle]}
    ></Animated.View>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  close: {
    position: "absolute",
    zIndex: 3,
    top: SPACING.medium,
    left: SPACING.small,
  },
});
