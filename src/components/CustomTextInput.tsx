import React, { useState } from "react";
import { TextInput } from "react-native-paper";

interface CustomTextInputProps {
  label?: string | undefined;
  value?: string | undefined;
  editable?: boolean;
  onChangeText?: (((text: string) => void) & Function) | undefined;
}
const CustomTextInput: React.FC<CustomTextInputProps> = ({
  editable,
  label,
  value,
  onChangeText,
}) => {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      onChangeText={onChangeText}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      label={label}
      value={value}
      mode="flat"
      activeOutlineColor="red"
      style={{
        borderWidth: 2,
        borderColor: !focus ? "#E4E7EC" : "black",
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
      editable={editable}
    />
  );
};

export default CustomTextInput;
