import { GLOBAL_STYLE } from "@/constants";
import React, { forwardRef, memo, useRef, useState } from "react";
import { StyleSheet, View, TextInput as RNTextInput } from "react-native";
import {
  HelperText,
  TextInputProps,
  TextInput,
  useTheme,
  IconButton,
} from "react-native-paper";
import CustomView from "./CustomView";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

export interface ValidationError {
  message: string;
  type: "error" | "info";
}

interface CustomTextInputProps extends TextInputProps {
  helperText?: ValidationError | null;
  onChangeText: (text: string) => void;
}

const CustomTextInput = forwardRef<any, CustomTextInputProps>(
  ({ helperText, value, onChangeText, secureTextEntry, ...rest }, ref) => {
    const [text, setText] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(true);
    const inputRef = useRef<RNTextInput>(null);
    const [focus, setFocus] = useState(false);
    const errorColor = useTheme().colors.error;
    const borderColor = helperText ? errorColor : !focus ? "#E4E7EC" : "black";
    const onClearPress = () => {
      setText("");
    };

    const handleOnChangeText = (value: string) => {
      setText(value);
      onChangeText(value);
    };

    const onEyePress = () => {
      setPasswordVisible(!passwordVisible);
    };
    return (
      <View
        style={{
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <CustomView style={GLOBAL_STYLE.rowHCenter}>
          <TextInput
            ref={inputRef}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            mode="flat"
            onChangeText={handleOnChangeText}
            value={text}
            style={{
              flex: 1,
            }}
            secureTextEntry={secureTextEntry && passwordVisible}
            underlineStyle={{ opacity: 0 }}
            theme={{
              colors: {
                primary: "black",
                surfaceVariant: "white",
              },
              roundness: 16,
            }}
            {...rest}
          />
          {text && (
            <Animated.View entering={FadeIn}>
              <MaterialCommunityIcons
                onPress={onClearPress}
                name="close"
                size={24}
                style={{ padding: 8 }}
              />
            </Animated.View>
          )}
          {secureTextEntry && (
            <IconButton
              icon={passwordVisible ? "eye" : "eye-off"}
              onPress={onEyePress}
            />
          )}
        </CustomView>

        {helperText && (
          <HelperText
            type={helperText.type}
            visible={true}
            style={styles.errorText}
          >
            {helperText.message}
          </HelperText>
        )}
      </View>
    );
  }
);

CustomTextInput.displayName = "CustomTextInput";

export default memo(CustomTextInput);

const styles = StyleSheet.create({
  errorText: {
    marginTop: 4,
  },
});
