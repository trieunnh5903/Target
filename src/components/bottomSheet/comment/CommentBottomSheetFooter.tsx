import { StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { Divider, IconButton, Text } from "react-native-paper";
import { GLOBAL_STYLE, SCREEN_WIDTH } from "@/constants";
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import { useAppSelector } from "@/hooks";
import CustomAvatar from "@/components/CustomAvatar";
import CustomView from "@/components/CustomView";

interface CommentBottomSheetFooterProps extends BottomSheetFooterProps {
  emojis: string[];
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  height: number;
}
const CommentBottomSheetFooter = ({
  animatedFooterPosition,
  emojis,
  onChangeText,
  onSendPress,
  height,
}: CommentBottomSheetFooterProps) => {
  console.log("CommentBottomSheetFooter");
  const inputRef = useRef<TextInput>(null);
  const user = useAppSelector((state) => state.auth.currentUser);
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const { animatedIndex } = useBottomSheet();
  const [commentText, setCommentText] = useState("");
  const isMaxIndex = useSharedValue(false);

  const handleInputChange = (text: string) => {
    setCommentText(text);
    onChangeText(text);
  };

  const handleSendPress = () => {
    onSendPress();
    setCommentText("");
  };

  const onEmojiPress = (emoji: string) => {
    setCommentText((pre) => pre.concat(emoji));
    onChangeText(commentText.concat(emoji));
  };

  const dismissKeyboard = () => {
    isMaxIndex.value = false;
    if (inputRef.current?.isFocused()) {
      inputRef.current.blur();
    }
  };

  useAnimatedReaction(
    () => animatedIndex.value,
    (cur, pre) => {
      if (!pre) return;
      if (cur === 0) {
        isMaxIndex.value = true;
      }

      if (cur < pre) {
        if (isMaxIndex.value) {
          runOnJS(dismissKeyboard)();
        }
      }
    }
  );

  return (
    <BottomSheetFooter
      bottomInset={bottomSafeArea}
      animatedFooterPosition={animatedFooterPosition}
    >
      <Animated.View style={GLOBAL_STYLE.justifyContentEnd}>
        <Divider />
        <CustomView padding={10} style={{ width: SCREEN_WIDTH, height }}>
          <View style={[GLOBAL_STYLE.row, { gap: 4 }]}>
            {emojis.slice(0, 10).map((emoji) => (
              <Text
                onPress={() => onEmojiPress(emoji)}
                key={emoji}
                style={styles.emoji}
              >
                {emoji}
              </Text>
            ))}
          </View>

          <CustomView paddingTop={10} style={styles.footerInput}>
            <CustomAvatar avatarUrl={user?.avatarURL} size={"medium"} />
            <BottomSheetTextInput
              ref={inputRef}
              placeholder="Comment..."
              style={styles.textInput}
              value={commentText}
              onChangeText={handleInputChange}
              autoFocus
            />
            {commentText && (
              <Animated.View entering={FadeInDown} style={styles.sendContainer}>
                <IconButton
                  icon={"arrow-up"}
                  size={22}
                  onPress={handleSendPress}
                  mode="contained"
                />
              </Animated.View>
            )}
          </CustomView>
        </CustomView>
      </Animated.View>
    </BottomSheetFooter>
  );
};

CommentBottomSheetFooter.displayName = "CommentBottomSheetFooter";
export default CommentBottomSheetFooter;

const styles = StyleSheet.create({
  sendContainer: { position: "absolute", right: 0 },
  emoji: {
    flex: 1,
    aspectRatio: 1,
    fontSize: 22,
    textAlign: "center",
  },
  textInput: { height: "100%", flex: 1, marginLeft: 10 },
  footerInput: {
    ...GLOBAL_STYLE.rowHCenter,
  },
});
