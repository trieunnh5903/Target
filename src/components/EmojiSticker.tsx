import { StyleSheet } from "react-native";
import React from "react";
import { EmojiType } from "@/types";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EMOJI_SIZE, SCREEN_WIDTH, SPACING } from "@/constants";

interface EmojiStickerProps {
  emoji: EmojiType;
  trashOffset: { x: number; y: number; width: number; height: number };
  isDrag: SharedValue<boolean>;
  trashProgress: SharedValue<number>;
  onDelete: (emoji: EmojiType) => void;
  headerHeight: number;
}
const EmojiSticker: React.FC<EmojiStickerProps> = ({
  emoji,
  isDrag,
  trashOffset,
  onDelete,
  trashProgress,
  headerHeight,
}) => {
  const translateX = useSharedValue(emoji.offsetX);
  const translateY = useSharedValue(emoji.offsetY);

  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const opacity = useSharedValue(1);
  const absoluteX = useSharedValue(0);
  const absoluteY = useSharedValue(0);
  const deletable = useSharedValue(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    })
    .blocksExternalGesture();

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    })
    .blocksExternalGesture();

  const dragGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      isDrag.value = true;
    })
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
      absoluteX.value = event.absoluteX;
      absoluteY.value = event.absoluteY;

      if (
        absoluteY.value >=
          SCREEN_WIDTH + headerHeight - trashOffset.height - SPACING.medium &&
        absoluteY.value <= SCREEN_WIDTH + headerHeight - SPACING.medium &&
        absoluteX.value >= trashOffset.x &&
        absoluteX.value <= trashOffset.x + trashOffset.width
      ) {
        trashProgress.value = withTiming(1);
        opacity.value = 0;
        deletable.value = true;
      } else {
        trashProgress.value = withTiming(0);
        opacity.value = 1;
        deletable.value = false;
      }
    })
    .onEnd(() => {
      if (deletable.value) {
        opacity.value = 0;
        runOnJS(onDelete)(emoji);
      }
      isDrag.value = false;
    })
    .onFinalize(() => {
      trashProgress.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const composed = Gesture.Race(
    Gesture.Simultaneous(zoomGesture, rotateGesture),
    dragGesture
  );

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.stickerContainer, animatedStyle]}>
        <emoji.component width={EMOJI_SIZE + 10} height={EMOJI_SIZE + 10} />
      </Animated.View>
    </GestureDetector>
  );
};

export default EmojiSticker;

const styles = StyleSheet.create({
  stickerContainer: {
    position: "absolute",
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
    borderRadius: EMOJI_SIZE,
  },
});
