import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

export const useKeyboardHeight = () => {
  const keyboardHeight = useSharedValue(0);
  useKeyboardHandler(
    {
      onStart: (e) => {
        "worklet";
      },
      onMove: (e) => {
        "worklet";
        keyboardHeight.value = e.height;
      },
      onInteractive: (e) => {
        "worklet";
      },
      onEnd: (e) => {
        "worklet";
      },
    },
    []
  );

  return { keyboardHeight };
};
