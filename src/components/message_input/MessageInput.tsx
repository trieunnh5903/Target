import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TextInput } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import CustomView from "../CustomView";

interface MessageInputProps {
  onPress: () => void;
  value: string;
  onChangeText?: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onPress,
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <CustomView padding={SPACING.small} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Send message"
          value={value}
          onChangeText={onChangeText}
        />
      </CustomView>

      <View style={styles.sendContainer}>
        <IconButton icon={"send"} onPress={onPress} />
      </View>
    </View>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
  },
  inputContainer: {
    height: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    flex: 1,
    overflow: "hidden",
  },
  sendContainer: {
    ...GLOBAL_STYLE.center,
  },
  container: {
    width: "100%",
    height: 50,
    ...GLOBAL_STYLE.rowHCenter,
  },
});
