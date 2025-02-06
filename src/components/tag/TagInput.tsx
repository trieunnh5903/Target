import { StyleSheet, TextInput, TextInputProps } from "react-native";
import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SCREEN_WIDTH, SPACING } from "@/constants";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface TagInputProps {
  backgroundColor: string;
  value: string;
  onChangeText?: (text: string) => void;
  fontSizeSharedValue: SharedValue<number>;
  textAlign: TextInputProps["textAlign"];
  tagInputRef: React.RefObject<TextInput>;
  textColor: "#000000" | "#FFFFFF";
  onContentSizeChange: (width: number, height: number) => void;
}
const TagInput: React.FC<TagInputProps> = ({
  backgroundColor,
  value,
  textAlign,
  onChangeText,
  fontSizeSharedValue,
  tagInputRef,
  textColor,
  onContentSizeChange,
}) => {
  const tagInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: fontSizeSharedValue.value,
    };
  });

  const handleContentSizeChange = ({
    height,
    width,
  }: {
    width: number;
    height: number;
  }) => {
    if (width < SCREEN_WIDTH - 40) {
      onContentSizeChange(width, height);
    }
  };

  return (
    <>
      <AnimatedTextInput
        value={value}
        onContentSizeChange={(e) =>
          handleContentSizeChange(e.nativeEvent.contentSize)
        }
        textAlign={textAlign}
        textAlignVertical={"center"}
        multiline
        style={[
          { backgroundColor },
          textAlign === "left" && { left: 0 },
          textAlign === "right" && { right: 0 },
          styles.inputBackground,
          tagInputAnimatedStyle,
        ]}
        editable={false}
      />

      <AnimatedTextInput
        ref={tagInputRef}
        value={value}
        textAlign={textAlign}
        textAlignVertical={"center"}
        onChangeText={onChangeText}
        multiline
        style={[
          {
            color: textColor,
          },
          styles.inputText,
          tagInputAnimatedStyle,
        ]}
      />
    </>
  );
};

export default TagInput;

const styles = StyleSheet.create({
  inputText: {
    zIndex: 1,
    fontSize: 16,
    padding: SPACING.small,
  },
  inputBackground: {
    fontSize: 16,
    borderRadius: 8,
    color: "transparent",
    position: "absolute",
    minHeight: 44,
    zIndex: -2,
    alignSelf: "center",
    padding: SPACING.small,
  },
});
