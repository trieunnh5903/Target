import { chatsCollection } from "./collections";
import firestore from "@react-native-firebase/firestore";

const fetchUserChats = async (userId: string) => {
  const chatList = await chatsCollection
    .where("participants", "array-contains", userId)
    .get();

  return chatList.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const fetchMessages = async (chatId: string) => {
  const messagesRef = chatsCollection.doc(chatId).collection("messages");
  const q = messagesRef.orderBy("timestamp", "asc");
  const messages = await q.get();
  return messages.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const timestamp = firestore.FieldValue.serverTimestamp(); // Thời gian hiện tại

  try {
    // Thêm tin nhắn mới vào subcollection
    await chatsCollection.doc(chatId).collection("messages").add({
      senderId,
      text,
      timestamp: timestamp,
      type: "text",
    });

    // Cập nhật thông tin tin nhắn cuối cùng trong document chat
    await firestore().collection("chats").doc(chatId).update({
      lastMessage: text,
      lastMessageTime: timestamp,
      lastMessageSender: senderId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const chatsAPI = {
  fetchUserChats,
  fetchMessages,
};
