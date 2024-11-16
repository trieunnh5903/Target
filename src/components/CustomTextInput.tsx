import React, { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  HelperText,
  TextInputProps,
  TextInput,
  useTheme,
} from "react-native-paper";

export interface ValidationError {
  message: string;
  type: "error" | "info";
}

interface CustomTextInputProps extends TextInputProps {
  helperText?: ValidationError | null;
}

const CustomTextInput = forwardRef<any, CustomTextInputProps>(
  ({ helperText, ...rest }, ref) => {
    const [focus, setFocus] = useState(false);
    const errorColor = useTheme().colors.error;
    const borderColor = helperText ? errorColor : !focus ? "#E4E7EC" : "black";
    return (
      <View>
        <TextInput
          ref={ref}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          mode="flat"
          style={{
            borderWidth: 2,
            borderColor: borderColor,
            borderRadius: 16,
          }}
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

export default CustomTextInput;

const styles = StyleSheet.create({
  errorText: {
    marginTop: 4,
  },
});
