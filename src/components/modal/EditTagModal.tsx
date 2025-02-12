import { StyleSheet, TextInputProps, View } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TagColors } from "@/config/theme";
import { useKeyboardHeight } from "@/hooks";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { Button, IconButton, Modal, Portal } from "react-native-paper";
import { TagSlider } from "@/slider";
import ColorPicker from "../ColorPicker";
import { TextInput } from "react-native-gesture-handler";
import { useKeyboard } from "@react-native-community/hooks";
import { TagInput } from "../tag";

interface EditTagModalProps {
  visible: boolean;
  onClose: (args: {
    tagValue: string;
    backgroundColor: string;
    textAlign: TextInputProps["textAlign"];
    textColor: string;
    fontSize: number;
    contentSize: {
      width: number;
      height: number;
    };
  }) => void;
}

const EditTagModal: React.FC<EditTagModalProps> = ({ visible, onClose }) => {
  const tagColors = useMemo(() => TagColors, []);
  const { keyboardHeight } = useKeyboardHeight();
  const [backgroundColor, setBackgroundColor] = useState(tagColors[1]);
  const fontSizeSharedValue = useSharedValue(16);
  const tagInputRef = useRef<TextInput>(null);
  const keyboard = useKeyboard();
  const [tagValue, setTagValue] = useState("");
  const textColor = useMemo(() => {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  }, [backgroundColor]);
  const [textAlign, settextAlign] =
    useState<TextInputProps["textAlign"]>("center");
  const tagInputContentSize = useSharedValue<{
    width: number;
    height: number;
  }>({ height: 0, width: 0 });

  const fakeViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: Math.abs(keyboardHeight.value),
    };
  });

  const handleFinishedEdit = useCallback(() => {
    onClose({
      backgroundColor,
      tagValue,
      textAlign,
      textColor,
      fontSize: fontSizeSharedValue.value,
      contentSize: {
        width: tagInputContentSize.value.width,
        height: tagInputContentSize.value.height,
      },
    });
    clearTagValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundColor, onClose, tagValue, textAlign, textColor]);

  const onDonePress = () => {
    tagInputRef.current?.blur();
  };

  const clearTagValue = () => {
    setTagValue("");
  };

  useEffect(() => {
    if (!keyboard.keyboardShown) {
      handleFinishedEdit();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard.keyboardShown]);

  useEffect(() => {
    if (visible) {
      fontSizeSharedValue.value = 16;
      setTimeout(() => {
        tagInputRef.current?.focus();
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onTextAlignPress = () => {
    switch (textAlign) {
      case "center":
        settextAlign("left");
        break;
      case "left":
        settextAlign("right");
        break;
      default:
        settextAlign("center");
        break;
    }
  };

  const textAligntIcon =
    textAlign === "center"
      ? "format-align-center"
      : textAlign === "left"
      ? "format-align-left"
      : "format-align-right";

  const onContentSizeChange = (width: number, height: number) => {
    if (width < SCREEN_WIDTH - 40) {
      tagInputContentSize.value = { width, height: 44 };
    } else tagInputContentSize.value = { width, height };
  };

  return (
    <Portal>
      <Modal
        dismissable={false}
        theme={{ colors: { backdrop: "rgba(0,0,0,0.9)" } }}
        visible={visible}
        contentContainerStyle={[GLOBAL_STYLE.flex_1]}
      >
        <View style={styles.headerOptions}>
          <IconButton
            icon={textAligntIcon}
            iconColor="white"
            onPress={onTextAlignPress}
            style={{ zIndex: 10 }}
          />
          <Button onPress={onDonePress} mode="contained-tonal">
            Done
          </Button>
        </View>

        <View style={[styles.tagModal]}>
          <View style={styles.tagContainer}>
            <View>
              <TagSlider
                minimumValue={10}
                maximumValue={40}
                value={16}
                onValueChange={(value) => {
                  fontSizeSharedValue.value = value;
                }}
              />
            </View>
            <View style={[styles.tagArea]}>
              <TagInput
                textColor={textColor}
                tagInputRef={tagInputRef}
                backgroundColor={backgroundColor}
                fontSizeSharedValue={fontSizeSharedValue}
                value={tagValue}
                onChangeText={setTagValue}
                textAlign={textAlign}
                onContentSizeChange={onContentSizeChange}
              />
            </View>
          </View>
          <ColorPicker onColorPress={setBackgroundColor} />
          <Animated.View style={fakeViewAnimatedStyle} />
        </View>
      </Modal>
    </Portal>
  );
};

export default EditTagModal;

const styles = StyleSheet.create({
  tagArea: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  slider: {
    height: 40,
    transform: [{ rotate: "-90deg" }, { translateX: 40 }],
    transformOrigin: "40px 40px",
  },
  sliderContainer: {
    width: 40,
    alignSelf: "flex-start",
    justifyContent: "flex-end",
  },
  headerOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.small,
  },
  tagModal: {
    width: SCREEN_WIDTH,
    flex: 1,
    ...GLOBAL_STYLE.center,
  },
  tagInput: {
    color: "black",
    fontWeight: "bold",
  },
  tagContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
});
