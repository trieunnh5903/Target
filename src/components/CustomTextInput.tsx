import React, { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText, TextInput, useTheme } from "react-native-paper";

export interface ValidationError {
  message: string;
  type: "error" | "info";
}

interface CustomTextInputProps {
  label?: string | undefined;
  value?: string | undefined;
  editable?: boolean;
  onChangeText?: (((text: string) => void) & Function) | undefined;
  error?: ValidationError | null;
  maxLength?: number | undefined;
  right?: React.ReactNode;
  autoFocus?: boolean | undefined;
}

const CustomTextInput = forwardRef<any, CustomTextInputProps>((props, ref) => {
  const [focus, setFocus] = useState(false);
  const errorColor = useTheme().colors.error;
  const borderColor = props.error ? errorColor : !focus ? "#E4E7EC" : "black";
  return (
    <View>
      <TextInput
        ref={ref}
        autoFocus={props.autoFocus}
        maxLength={props.maxLength}
        onChangeText={props.onChangeText}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        label={props.label}
        value={props.value}
        mode="flat"
        right={props.right}
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
        editable={props.editable}
      />
      {props.error && (
        <HelperText
          type={props.error.type}
          visible={true}
          style={styles.errorText}
        >
          {props.error.message}
        </HelperText>
      )}
    </View>
  );
});

CustomTextInput.displayName = "CustomTextInput";

export default CustomTextInput;

const styles = StyleSheet.create({
  errorText: {
    marginTop: 4,
  },
});
