import { Image, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import CustomView from "../CustomView";
import { GLOBAL_STYLE, SCREEN_WIDTH } from "@/constants";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";

interface ImageAreaProps {
  source: string;
  onDoubleTapPress: () => void;
  aleadyLiked: boolean;
  heartProgress: SharedValue<number>;
  isDoubleTap: SharedValue<boolean>;
  animatedIsLiked: SharedValue<boolean>;
}
const ImageArea: React.FC<ImageAreaProps> = ({
  source,
  aleadyLiked,
  onDoubleTapPress,
  heartProgress,
  isDoubleTap,
  animatedIsLiked,
}) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (source) {
      Image.getSize(
        source,
        (width, height) => {
          setAspectRatio(width / height);
        },
        (error) => {
          console.error("Lỗi khi lấy kích thước ảnh:", error);
        }
      );
    }
  }, [source]);

  const isHidden = useSharedValue(-1);

  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      isDoubleTap.value = true;
      isHidden.value = 1;
      animatedIsLiked.value = aleadyLiked;
    })
    .onEnd(() => {
      heartProgress.value = 0;
      heartProgress.value = withSpring(1, {}, () => {
        isHidden.value = withDelay(500, withTiming(-1));
        isDoubleTap.value = false;
      });
      if (!aleadyLiked) {
        runOnJS(onDoubleTapPress)();
      }
    });

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        isHidden.value === 1
          ? interpolate(
              heartProgress.value,
              [0.8, 1],
              [0, 1],
              Extrapolation.CLAMP
            )
          : 0,
      transform: [
        {
          scale: heartProgress.value,
        },
      ],
    };
  });

  return (
    <CustomView style={GLOBAL_STYLE.center}>
      <GestureDetector gesture={tapGesture}>
        <ExpoImage
          source={{ uri: source }}
          style={{
            width: SCREEN_WIDTH,
            aspectRatio: aspectRatio,
          }}
        />
      </GestureDetector>
      <Animated.View
        pointerEvents={"none"}
        style={[styles.bigHeartContainer, heartAnimatedStyle]}
      >
        <Octicons name="heart-fill" size={SCREEN_WIDTH * 0.3} color={"white"} />
      </Animated.View>
    </CustomView>
  );
};

export default ImageArea;

const styles = StyleSheet.create({
  bigHeartContainer: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
});
