import { StyleSheet } from "react-native";
import React, { useState } from "react";
import { SPACING } from "@/constants";
import { IMessage } from "@/types";
import { dayJs } from "@/utils/dayJs";
import CustomView from "../CustomView";
import { Pressable } from "react-native-gesture-handler";
import { Text } from "react-native-paper";

interface MessageProps {
  message: IMessage;
  isSender: boolean;
  index: number;
}
const Message: React.FC<MessageProps> = ({ message, isSender, index }) => {
  const [showTime, setShowTime] = useState(false);
  return (
    <CustomView style={[styles.container, isSender && styles.containerSender]}>
      <Pressable onPress={() => setShowTime(!showTime)}>
        <CustomView
          style={[styles.messageContainer, isSender && styles.messageSender]}
        >
          <Text style={[styles.text, isSender && styles.textSender]}>
            {message.content}
          </Text>
        </CustomView>

        {(index === 0 || showTime) && (
          <CustomView paddingHorizontal={SPACING.small}>
            <Text style={styles.time}>{dayJs.getTime(message.createdAt)}</Text>
          </CustomView>
        )}
      </Pressable>
    </CustomView>
  );
};

export default Message;

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: SPACING.small,
    alignSelf: "flex-start",

  },
  messageSender: {
    backgroundColor: "blue",
    alignSelf: "flex-end",
  },
  time: {
    fontSize: 12,
  },
  text: {
    color: "black",
    fontSize: 17,
  },
  containerSender: {
    marginLeft: "auto",
  },
  textSender: {
    color: "white",
  },
  container: {
    margin: SPACING.small,
    alignSelf: "flex-start",
    maxWidth: "75%",
  },
});
