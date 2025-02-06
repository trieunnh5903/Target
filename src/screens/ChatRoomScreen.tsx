import { StyleSheet } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { CustomView, Message, MessageInput } from "@/components";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { FlatList } from "react-native-gesture-handler";
import { useAppSelector, useKeyboardHeight } from "@/hooks";
import chatAPI from "@/api/chatApi";
import { IChatRoom, IMessage } from "@/types";
import dayjs from "dayjs";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const ChatRoomScreen: React.FC<RootStackScreenProps<"ChatRoom">> = ({
  route,
  navigation,
}) => {
  const { avatarURL, displayName, userId } = route.params;
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState("");
  const { keyboardHeight } = useKeyboardHeight();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: displayName,
    });
    return () => {};
  }, [displayName, navigation]);

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      try {
        const chatData = await chatAPI.fetchConverstation([
          currentUser.id,
          userId,
        ]);
        console.log("chatData", chatData);

        setMessages(chatData);
      } catch {}
    })();

    return () => {};
  }, [avatarURL, currentUser, displayName, userId]);

  const onSendPress = async () => {
    const chatDocId = [currentUser?.id!, userId].sort().join("_");
    const newMessage: IMessage = {
      content: message,
      createdAt: dayjs().unix(),
      id: dayjs().unix().toString(),
      senderId: currentUser?.id!,
    };

    const participants: IChatRoom["participants"] = [currentUser?.id!, userId];
    const participantsDetails: IChatRoom["participantsDetails"] = {
      [userId]: {
        avatarURL: avatarURL,
        displayName,
      },
      [currentUser?.id!]: {
        avatarURL: currentUser?.avatarURL ?? null,
        displayName: currentUser?.displayName ?? null,
      },
    };
    try {
      setMessages((pre) => [newMessage, ...pre]);
      await chatAPI.sendMessage(
        chatDocId,
        message,
        currentUser?.id!,
        participants,
        participantsDetails
      );
    } catch {
      setMessages(messages.filter((item) => item.id !== newMessage.id));
    } finally {
      setMessage("");
    }
    console.log(newMessage);
  };

  const fakeViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: Math.abs(keyboardHeight.value),
    };
  });
  return (
    <CustomView style={GLOBAL_STYLE.flex_1}>
      <FlatList
        data={messages}
        inverted
        renderItem={({ item, index }) => {
          return (
            <Message
              message={item}
              isSender={item.senderId === currentUser?.id}
              index={index}
            />
          );
        }}
      />
      <CustomView padding={SPACING.small}>
        <MessageInput
          onPress={onSendPress}
          value={message}
          onChangeText={setMessage}
        />
      </CustomView>
      <Animated.Image style={fakeViewAnimatedStyle}/>
    </CustomView>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({});
