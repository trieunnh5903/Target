import { ListRenderItem, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { CustomAvatar } from "@/components";
import { SPACING } from "@/constants";
import chatAPI from "@/api/chatApi";
import { useAppSelector } from "@/hooks";
import { IChatRoom } from "@/types";
import { dayJs } from "@/utils/dayJs";

const ListChatScreen: React.FC<RootStackScreenProps<"ListChatRoom">> = ({
  navigation,
}) => {
  const currentId = useAppSelector((state) => state.auth.currentUser?.id);
  const [rooms, setRooms] = useState<IChatRoom[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const listRooms = await chatAPI.fetcAllChats(currentId!);
        console.log("listRooms", listRooms);

        setRooms(listRooms);
      } catch {}
    })();
    return () => {};
  }, [currentId]);

  const onChatItemPress = (otherUser: {
    avatarURL: string | null | undefined;
    displayName: string | null | undefined;
    id: string | undefined;
  }) => {
    if (otherUser.avatarURL && otherUser.displayName && otherUser.id)
      navigation.navigate("ChatRoom", {
        avatarURL: otherUser.avatarURL,
        displayName: otherUser.displayName,
        userId: otherUser.id,
      });
  };

  const renderItem: ListRenderItem<IChatRoom> = ({ item }) => {
    const otherUserId = item.participants.find((id) => id !== currentId);
    const otherUser = otherUserId
      ? item.participantsDetails[otherUserId]
      : null;
    const lastMessage = item.lastMessage;
    const lastMessageContent =
      lastMessage.senderId === currentId
        ? `You: ${lastMessage.content}`
        : lastMessage.content;
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          onChatItemPress({
            id: otherUserId,
            avatarURL: otherUser?.avatarURL,
            displayName: otherUser?.displayName,
          })
        }
      >
        {/* Avatar */}
        <CustomAvatar avatarUrl={otherUser?.avatarURL} size={"medium"} />

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{otherUser?.displayName ?? "User"}</Text>
          <Text style={styles.lastMessage}>{lastMessageContent}</Text>
        </View>

        {/* Time */}
        <Text style={styles.time}>{dayJs.getTime(lastMessage.createdAt)}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
      />
    </View>
  );
};

export default ListChatScreen;

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
    flex: 1,
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
