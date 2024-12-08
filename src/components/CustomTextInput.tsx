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

export interface ValidationError {
  message: string;
  type: "error" | "info";
}

interface CustomTextInputProps extends TextInputProps {
  helperText?: ValidationError | null;
  onChangeText?: (text: string) => void;
}

const CustomTextInput = forwardRef<any, CustomTextInputProps>(
  ({ helperText, onChangeText, secureTextEntry, ...rest }, ref) => {
    const [text, setText] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [focus, setFocus] = useState(false);
    const errorColor = useTheme().colors.error;
    const borderColor = helperText ? errorColor : !focus ? "#E4E7EC" : "black";
    const onClearPress = () => {
      setText("");
      onChangeText?.("");
    };

    const handleOnChangeText = (value: string) => {
      setText(value);
      onChangeText?.(value);
    };

    const onEyePress = () => {
      setPasswordVisible(!passwordVisible);
    };
    return (
      <View>
        <CustomView
          style={[
            styles.input,
            {
              borderColor: borderColor,
            },
          ]}
        >
          <TextInput
            ref={ref}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            mode="flat"
            secureTextEntry={secureTextEntry && !passwordVisible}
            onChangeText={handleOnChangeText}
            value={text}
            underlineStyle={{ opacity: 0 }}
            style={[GLOBAL_STYLE.flex_1]}
            contentStyle={{ paddingRight: 0 }}
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
            <IconButton
              icon={"close"}
              onPress={onClearPress}
              style={secureTextEntry !== undefined && { margin: 0 }}
              animated
            />
          )}
          {secureTextEntry && (
            <IconButton
              icon={!passwordVisible ? "eye" : "eye-off"}
              onPress={onEyePress}
              style={{ marginLeft: 0 }}
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
  input: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: "hidden",
    ...GLOBAL_STYLE.rowHCenter,
  },
  errorText: {
    marginTop: 4,
  },
});
