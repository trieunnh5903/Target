import { SCREEN_WIDTH, SPACING } from "@/constants";
import { DraggableTagType } from "@/types";
import { StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface DraggableTagProps {
  tag: DraggableTagType;
  trashProgress: SharedValue<number>;
  isDrag: SharedValue<boolean>;
  headerHeight: number;
  trashOffset: { x: number; y: number; width: number; height: number };
  onDelete: (tag: DraggableTagType) => void;
}
const DraggableTag: React.FC<DraggableTagProps> = ({
  tag,
  trashProgress,
  trashOffset,
  isDrag,
  headerHeight,
  onDelete,
}) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(tag.offsetX - tag.contentSize.width / 2);
  const translateY = useSharedValue(tag.offsetY - tag.contentSize.height / 2);
  const absoluteX = useSharedValue(0);
  const absoluteY = useSharedValue(0);
  const deletable = useSharedValue(false);

  const textDrag = Gesture.Pan()
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
        runOnJS(onDelete)(tag);
      }
      isDrag.value = false;
    })
    .onFinalize(() => {
      trashProgress.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });
  return (
    <GestureDetector gesture={textDrag}>
      <Animated.View style={[animatedStyle, { position: "absolute" }]}>
        <Pressable
          style={[
            { backgroundColor: tag.backgroundColor },
            styles.tagContainer,
          ]}
        >
          <Text
            style={[
              {
                color: tag.textColor,
                textAlign: tag.textAlign,
              },
              styles.text,
            ]}
          >
            {tag.value}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableTag;
const styles = StyleSheet.create({
  tagContainer: {
    padding: SPACING.small,
    borderRadius: 8,
    minHeight: 44,
  },
  text: {
    textAlignVertical: "center",
    height: "100%",
  },
});
