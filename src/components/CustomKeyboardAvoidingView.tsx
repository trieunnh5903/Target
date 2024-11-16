import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import React, { PropsWithChildren } from "react";
import { GLOBAL_STYLE } from "@/constants";

const CustomKeyboardAvoidingView = ({ children }: PropsWithChildren) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={GLOBAL_STYLE.flex_1}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          console.log("KeyboardAvoidingView");
        }}
      >
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CustomKeyboardAvoidingView;
