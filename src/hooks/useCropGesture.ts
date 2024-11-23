import { CROP_SIZE } from "@/constants";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming } from "react-native-reanimated";

interface CropGestureConfig {
  resizeFull: boolean;
  limitTranslateY: number;
  limitTranslateX: number;
  possibleTranslateY: number;
  possibleTranslateX: number;
  displayHeight: number;
}

export const useCropsGesture = ({
  resizeFull,
  displayHeight,
  limitTranslateX,
  limitTranslateY,
  possibleTranslateX,
  possibleTranslateY,
}: CropGestureConfig) => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const gridOpacity = useSharedValue(0);
  const gridTranslateX = useSharedValue(0);
  const gridTranslateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      gridOpacity.value = withTiming(1);
    })
    .onTouchesUp(() => {
      gridOpacity.value = withTiming(0);
    })
    .onStart((e) => {
      prevTranslationY.value = translationY.value;
      prevTranslationX.value = translationX.value;
    })
    .onUpdate((event) => {
      const newTranslationY = prevTranslationY.value + event.translationY;
      const newTranslationX = prevTranslationX.value + event.translationX;

      if (resizeFull) {
        translationY.value = Math.max(
          -limitTranslateY,
          Math.min(limitTranslateY, newTranslationY)
        );
      } else {
        translationY.value =
          CROP_SIZE < displayHeight
            ? Math.max(
                -limitTranslateY,
                Math.min(limitTranslateY, newTranslationY)
              )
            : 0;
      }

      translationX.value = Math.max(
        -limitTranslateX,
        Math.min(limitTranslateX, newTranslationX)
      );

      if (Math.abs(translationY.value) > possibleTranslateY) {
        gridTranslateY.value =
          translationY.value > 0
            ? translationY.value - possibleTranslateY
            : translationY.value + possibleTranslateY;
      } else {
        gridTranslateY.value = 0;
      }

      if (resizeFull) {
        if (Math.abs(translationX.value) > possibleTranslateX) {
          gridTranslateX.value =
            translationX.value > 0
              ? translationX.value - possibleTranslateX
              : translationX.value + possibleTranslateX;
        } else {
          gridTranslateX.value = 0;
        }
      } else {
        gridTranslateX.value = translationX.value;
      }
    })
    .onEnd(() => {
      if (resizeFull) {
        if (translationY.value > possibleTranslateY) {
          translationY.value = withTiming(possibleTranslateY);
        } else if (translationY.value < -possibleTranslateY) {
          translationY.value = withTiming(-possibleTranslateY);
        }

        if (translationX.value > possibleTranslateX) {
          translationX.value = withTiming(possibleTranslateX);
        } else if (translationX.value < -possibleTranslateX) {
          translationX.value = withTiming(-possibleTranslateX);
        }
      } else {
        translationX.value = withTiming(0);
        if (CROP_SIZE < displayHeight) {
          if (translationY.value > possibleTranslateY) {
            translationY.value = withTiming(possibleTranslateY);
          } else if (translationY.value < -possibleTranslateY) {
            translationY.value = withTiming(-possibleTranslateY);
          }
        } else {
          translationY.value = withTiming(0);
        }
      }

      gridTranslateY.value = withTiming(0);
      gridTranslateX.value = withTiming(0);
    });

  const resetGesture = () => {
    translationX.value = withTiming(0);
    translationY.value = withTiming(0);
  };

  return {
    gesture: pan,
    resetGesture,
    translationX,
    translationY,
    gridOpacity,
    gridTranslateX,
    gridTranslateY,
  };
};
