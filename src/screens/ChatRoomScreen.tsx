import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { CustomAvatar } from "@/components";
import { SPACING } from "@/constants";
import { RootStackScreenProps } from "@/types/navigation";

const ChatRoomScreen: React.FC<RootStackScreenProps<"ChatRoom">> = ({
  navigation,
}) => {
  const chatList = [
    {
      id: "1",
      avatar: "https://picsum.photos/700",
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      time: "10:45 AM",
    },
    {
      id: "2",
      avatar: "https://picsum.photos/700",
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      time: "9:30 AM",
    },
    {
      id: "3",
      avatar: "https://picsum.photos/700",
      name: "Michael Brown",
      lastMessage: "Can you call me back?",
      time: "8:15 AM",
    },
  ];

  const onChatItemPress = (chatItem) => {
    navigation.navigate("Chat", { userId: chatItem.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onChatItemPress(item)}
    >
      {/* Avatar */}
      <CustomAvatar avatarUrl={item.avatar} size={"medium"} />

      {/* Chat Info */}
      <View style={styles.chatInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>

      {/* Time */}
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={chatList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
      />
    </View>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatList: {
    padding: SPACING.medium,
    paddingTop: 0,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: SPACING.small,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1, // Chiếm không gian còn lại
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});
