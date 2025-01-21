import { DraggableTagType } from "@/types";
import { useState } from "react";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface DraggableTagProps {
  tag: DraggableTagType;
  trashOffset: { x: number; y: number };
  onDeleteTag: (tag: DraggableTagType) => void;
  trashProgress: SharedValue<number>;
  isDrag: SharedValue<number>;
}
const DraggableTag: React.FC<DraggableTagProps> = ({
  tag,
  trashProgress,
  trashOffset: { y: trashY },
  isDrag,
  onDeleteTag,
}) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(tag.offsetX);
  const translateY = useSharedValue(tag.offsetY);
  const [dimension, setDimension] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const textDrag = Gesture.Pan()
    .onStart(() => {
      isDrag.value = withTiming(0);
    })
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
      if (translateY.value > trashY) {
        opacity.value = 0;
        // runOnJS(onDeleteTag)(tag);
        trashProgress.value = withTiming(1);
      } else {
        opacity.value = 1;
        trashProgress.value = withTiming(0);
      }
    })
    .onEnd(() => {
      console.log("onEnd");
      isDrag.value = withTiming(-1);
    })
    .onFinalize(() => {
      console.log("onFinalize");
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value - dimension.width * 0.5 },
        { translateY: translateY.value - dimension.height * 0.5 },
      ],
    };
  });
  return (
    <GestureDetector gesture={textDrag}>
      <Animated.View
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setDimension({ height, width });
        }}
        style={[
          animatedStyle,
          {
            position: "absolute",
          },
        ]}
      >
        <Pressable
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "white",
            borderWidth: 1,
          }}
        >
          <Text
            style={[
              {
                color: "red",
              },
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
