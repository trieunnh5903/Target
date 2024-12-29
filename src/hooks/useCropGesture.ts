import { CROP_SIZE } from "@/constants";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface CropGestureConfig {
  boundaryTranslateX: number;
  boundaryTranslateY: number;
  displayHeight: number;
  onTranslateFinished?: (x: number, y: number) => void;
}

export const useCropsGesture = ({
  displayHeight,
  boundaryTranslateX,
  boundaryTranslateY,
  onTranslateFinished,
}: CropGestureConfig) => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const gridOpacity = useSharedValue(1);
  const gridTranslateX = useSharedValue(0);
  const gridTranslateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      gridOpacity.value = 1;
    })
    .onTouchesUp(() => {
      gridOpacity.value = withDelay(2000, withTiming(0));
    })
    .onStart((e) => {
      prevTranslationY.value = translationY.value;
      prevTranslationX.value = translationX.value;
    })
    .onUpdate((event) => {
      const newTranslationY = prevTranslationY.value + event.translationY;
      const newTranslationX = prevTranslationX.value + event.translationX;

      // Phương pháp tính toán hệ số ma sát
      // 1 - Math.log(Math.abs(overscroll) + 1) / sensitivity
      // Math.abs(overscroll): Lấy giá trị tuyệt đối của khoảng cách vượt giới hạn
      // + 1: Tránh logarit của 0
      // Math.log(...): Tính logarit tự nhiên
      // / 10: Điều chỉnh độ nhạy
      // 1 - ...: Đảm bảo hệ số luôn giảm từ 1 xuống gần 0

      //Math.log() Tăng chậm dần khi đầu vào tăng - Luôn dương và liên tục

      // Ví dụ
      // Overscroll = 0: friction = 1 (di chuyển bình thường)
      // Overscroll = 50: friction ≈ 0.8 (chậm lại một chút)
      // Overscroll = 100: friction ≈ 0.5 (chậm hơn)
      // Overscroll = 200: friction ≈ 0.2 (gần như dừng lại)

      if (newTranslationX < -boundaryTranslateX) {
        const overScroll = -boundaryTranslateX - newTranslationX;
        const friction = 1 - Math.log(Math.abs(overScroll) + 1) / 10;
        translationX.value = -boundaryTranslateX - overScroll * friction;
      } else if (newTranslationX > boundaryTranslateX) {
        const overScroll = newTranslationX - boundaryTranslateX;
        const friction = 1 - Math.log(Math.abs(overScroll) + 1) / 10;
        translationX.value = boundaryTranslateX + overScroll * friction;
      } else {
        translationX.value = newTranslationX;
      }

      if (newTranslationY < -boundaryTranslateY) {
        const overScroll = -boundaryTranslateY - newTranslationY;
        const friction = 1 - Math.log(Math.abs(overScroll) + 1) / 10;
        translationY.value = -boundaryTranslateY - overScroll * friction;
      } else if (newTranslationY > boundaryTranslateY) {
        const overScroll = newTranslationY - boundaryTranslateY;
        const friction = 1 - Math.log(Math.abs(overScroll) + 1) / 10;
        translationY.value = boundaryTranslateY + overScroll * friction;
      } else {
        translationY.value = newTranslationY;
      }

      if (displayHeight < CROP_SIZE) {
        gridTranslateY.value = translationY.value;
      } else {
        if (Math.abs(translationY.value) > boundaryTranslateY) {
          gridTranslateY.value =
            translationY.value > 0
              ? translationY.value - boundaryTranslateY
              : translationY.value + boundaryTranslateY;
        } else {
          gridTranslateY.value = 0;
        }
      }

      if (Math.abs(translationX.value) > boundaryTranslateX) {
        gridTranslateX.value =
          translationX.value > 0
            ? translationX.value - boundaryTranslateX
            : translationX.value + boundaryTranslateX;
      } else {
        gridTranslateX.value = 0;
      }
    })
    .onEnd(() => {
      let finalX = translationX.value;
      let finalY = translationY.value;

      if (translationY.value > boundaryTranslateY) {
        translationY.value = withTiming(
          boundaryTranslateY,
          {},
          (isFinished) => {
            if (isFinished) {
              finalY = boundaryTranslateY;
              if (onTranslateFinished) {
                runOnJS(onTranslateFinished)(finalX, finalY);
              }
            }
          }
        );
      } else if (translationY.value < -boundaryTranslateY) {
        translationY.value = withTiming(
          -boundaryTranslateY,
          {},
          (isFinished) => {
            if (isFinished) {
              finalY = -boundaryTranslateY;
              if (onTranslateFinished) {
                runOnJS(onTranslateFinished)(finalX, finalY);
              }
            }
          }
        );
      }

      if (translationX.value > boundaryTranslateX) {
        translationX.value = withTiming(
          boundaryTranslateX,
          {},
          (isFinished) => {
            if (isFinished) {
              finalX = boundaryTranslateX;
              if (onTranslateFinished) {
                runOnJS(onTranslateFinished)(finalX, finalY);
              }
            }
          }
        );
      } else if (translationX.value < -boundaryTranslateX) {
        translationX.value = withTiming(
          -boundaryTranslateX,
          {},
          (isFinished) => {
            if (isFinished) {
              finalX = -boundaryTranslateX;
              if (onTranslateFinished) {
                runOnJS(onTranslateFinished)(finalX, finalY);
              }
            }
          }
        );
      }

      gridTranslateY.value = withTiming(0);
      gridTranslateX.value = withTiming(0);

      if (
        translationX.value >= -boundaryTranslateX &&
        translationX.value <= boundaryTranslateX &&
        translationY.value >= -boundaryTranslateY &&
        translationY.value <= boundaryTranslateY
      ) {
        if (onTranslateFinished) {
          runOnJS(onTranslateFinished)(finalX, finalY);
        }
      }
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
