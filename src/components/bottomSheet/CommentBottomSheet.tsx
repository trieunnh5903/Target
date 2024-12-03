import { Keyboard, StyleSheet, Text } from "react-native";
import React from "react";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlatList, TextInput } from "react-native-gesture-handler";
import CustomAvatar from "../CustomAvatar";
import { useAppSelector } from "@/hooks";
import CustomView from "../CustomView";
import { GLOBAL_STYLE } from "@/constants";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { useKeyboard } from "@react-native-community/hooks";

interface CommentBottomSheetProps {
  inputRef: React.RefObject<TextInput>;
}

const CommentBottomSheet: React.FC<CommentBottomSheetProps> = ({
  inputRef,
}) => {
  const { animatedPosition } = useBottomSheet();
  const keyboard = useKeyboard();

  const dismissKeyboard = () => {
    if (!keyboard.keyboardShown) return;
    Keyboard.dismiss();
  };

  const handleFocusKeyboard = () => {
    if (!inputRef.current) return;
    if (!inputRef.current.isFocused()) {
      inputRef.current.focus();
    }
  };

  useAnimatedReaction(
    () => animatedPosition.value,
    (curr, pre) => {
      if (!pre) {
        runOnJS(handleFocusKeyboard)();
      } else if (curr > pre) {
        runOnJS(dismissKeyboard)();
      }
    }
  );

  return (
    <BottomSheetView>
      <Text>CommentBottomSheet</Text>
    </BottomSheetView>
  );
};

interface CommentBottomSheetFooterProps extends BottomSheetFooterProps {
  inputRef: React.RefObject<TextInput>;
}

export const CommentBottomSheetFooter = (
  props: CommentBottomSheetFooterProps
) => {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.currentUser);
  const unicodeArray = [
    "\u2764", // ❤
    "\u{1F64C}", // 🙌
    "\u{1F60E}", // 😎
    "\u{1F600}", // 😀
    "\u{1F601}", // 😁
    "\u{1F602}", // 😂
    "\u{1F923}", // 🤣
    "\u{1F60A}", // 😊
    "\u{1F60D}", // 😍
    "\u{1F914}", // 🤔
    "\u{1F44D}", // 👍
    "\u{1F44C}", // 👌
  ];

  return (
    <BottomSheetFooter {...props} bottomInset={bottomSafeArea}>
      <CustomView paddingVertical={16} style={styles.footerContainer}>
        <CustomView paddingBottom={16}>
          <FlatList
            data={unicodeArray}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 16,
              alignItems: "center",
            }}
            renderItem={({ item }) => (
              <Text style={{ fontSize: 22 }}>{item}</Text>
            )}
          />
        </CustomView>

        <CustomView paddingHorizontal={16} style={styles.footerInput}>
          <CustomAvatar user={user} size={"medium"} />
          <BottomSheetTextInput ref={props.inputRef} placeholder="Comment..." />
        </CustomView>
      </CustomView>
    </BottomSheetFooter>
  );
};

export default CommentBottomSheet;

const styles = StyleSheet.create({
  footerInput: {
    ...GLOBAL_STYLE.row,
    gap: 16,
  },

  footerContainer: {
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  footerText: {
    textAlign: "center",
    color: "white",
    fontWeight: "800",
  },
});
