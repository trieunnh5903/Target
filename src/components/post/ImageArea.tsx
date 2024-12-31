import { StyleSheet, View } from "react-native";
import React, { memo, useMemo } from "react";
import CustomView from "../CustomView";
import { GLOBAL_STYLE, POST_IMAGE_SIZE, SCREEN_WIDTH } from "@/constants";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { PostImage } from "@/types";

interface ImageAreaProps {
  source: PostImage;
  onDoubleTapPress: () => void;
  aleadyLiked: boolean;
  heartProgress: SharedValue<number>;
  isDoubleTap: SharedValue<boolean>;
  animatedIsLiked: SharedValue<boolean>;
  onPress: (source: PostImage["baseUrl"]) => void;
}
const ImageArea: React.FC<ImageAreaProps> = memo(
  ({
    source,
    aleadyLiked,
    onDoubleTapPress,
    heartProgress,
    isDoubleTap,
    animatedIsLiked,
    onPress,
  }) => {
    const isHeartHidden = useSharedValue(-1);
    // const imageRef = useRef<View>(null);
    // const { originImageLayout, updateOriginImageLayout } = useOriginImageLayout({
    //   imageRef,
    // });

    const singleTapGesture = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(1)
          .onEnd(() => {
            runOnJS(onPress)(source.baseUrl);
          }),
      [onPress, source.baseUrl]
    );

    const doubleTapGesture = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(2)
          .onStart(() => {
            isDoubleTap.value = true;
            isHeartHidden.value = 1;
            animatedIsLiked.value = aleadyLiked;
          })
          .onEnd(() => {
            heartProgress.value = 0;
            heartProgress.value = withSpring(1, {}, () => {
              isHeartHidden.value = withDelay(500, withTiming(-1));
              isDoubleTap.value = false;
            });
            if (!aleadyLiked) {
              runOnJS(onDoubleTapPress)();
            }
          }),
      [
        aleadyLiked,
        animatedIsLiked,
        heartProgress,
        isDoubleTap,
        isHeartHidden,
        onDoubleTapPress,
      ]
    );

    const heartAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity:
          isHeartHidden.value === 1
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
        <GestureDetector
          gesture={Gesture.Exclusive(doubleTapGesture, singleTapGesture)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={source.thumbnailUrl.source}
              style={GLOBAL_STYLE.fullSize}
            />
          </View>
        </GestureDetector>

        <Animated.View
          pointerEvents={"none"}
          style={[styles.bigHeartContainer, heartAnimatedStyle]}
        >
          <Octicons
            name="heart-fill"
            size={SCREEN_WIDTH * 0.3}
            color={"white"}
          />
        </Animated.View>
      </CustomView>
    );
  }
);
ImageArea.displayName = "ImageArea";
export default ImageArea;

const styles = StyleSheet.create({
  imageContainer: {
    width: POST_IMAGE_SIZE,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
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
