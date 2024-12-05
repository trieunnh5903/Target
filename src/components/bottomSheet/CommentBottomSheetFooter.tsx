import { StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { Divider, IconButton, Text } from "react-native-paper";
import { GLOBAL_STYLE, SCREEN_WIDTH } from "@/constants";
import CustomView from "../CustomView";
import CustomAvatar from "../CustomAvatar";
import { User } from "@/types";
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";

interface CommentBottomSheetFooterProps extends BottomSheetFooterProps {
  user: User | null;
  emojis: string[];
  onChangeText: (text: string) => void;
  onSendPress: () => void;
}
const CommentBottomSheetFooter = ({
  animatedFooterPosition,
  user,
  onChangeText,
  onSendPress,
  emojis,
}: CommentBottomSheetFooterProps) => {
  const inputRef = useRef<TextInput>(null);
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const { animatedIndex } = useBottomSheet();
  const [commentText, setCommentText] = useState("");
  const handleInputChange = (text: string) => {
    setCommentText(text);
    onChangeText(text);
  };

  const onEmojiPress = (emoji: string) => {
    setCommentText((pre) => pre.concat(emoji));
    onChangeText(commentText.concat(emoji));
  };

  const dismissKeyboard = () => {
    if (inputRef.current?.isFocused()) {
      inputRef.current.blur();
    }
  };

  useAnimatedReaction(
    () => animatedIndex.value,
    (cur, pre) => {
      if (!pre) return;
      if (cur < pre) {
        runOnJS(dismissKeyboard)();
      }
    }
  );

  return (
    <BottomSheetFooter
      bottomInset={bottomSafeArea}
      animatedFooterPosition={animatedFooterPosition}
    >
      <Divider />
      <CustomView padding={10} style={{ width: SCREEN_WIDTH }}>
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
          <CustomAvatar avatarUrl={user?.photoURL} size={"medium"} />
          <BottomSheetTextInput
            ref={inputRef}
            placeholder="Comment..."
            style={{ height: "100%", flex: 1, marginLeft: 10 }}
            value={commentText}
            onChangeText={handleInputChange}
          />
          {commentText && (
            <Animated.View
              entering={FadeInDown}
              style={{ position: "absolute", right: 0 }}
            >
              <IconButton
                icon={"arrow-up"}
                size={22}
                onPress={onSendPress}
                mode="contained"
              />
            </Animated.View>
          )}
        </CustomView>
      </CustomView>
    </BottomSheetFooter>
  );
};

export default CommentBottomSheetFooter;

const styles = StyleSheet.create({
  emoji: {
    flex: 1,
    aspectRatio: 1,
    fontSize: 22,
    textAlign: "center",
  },
  footerInput: {
    ...GLOBAL_STYLE.rowHCenter,
  },
});
