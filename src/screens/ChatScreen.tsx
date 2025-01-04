import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { RootStackScreenProps } from "@/types/navigation";

const ChatScreen: React.FC<RootStackScreenProps<"Chat">> = () => {
  return (
    <View>
      <Text>ChatScreen</Text>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
