import { IChatRoom, IMessage } from "@/types";
import firestore from "@react-native-firebase/firestore";

const chatAPI = {
  fetchConverstation: async (userIds: string[]) => {
    try {
      const chatDocId = userIds.sort().join("_");
      const messages = await firestore()
        .collection("chats")
        .doc(chatDocId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .get();
      if (messages.size > 0) {
        return messages.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
              createdAt: doc.data().createdAt.seconds,
            } as IMessage)
        );
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      throw error;
    }
  },

  sendMessage: async (
    chatDocId: string,
    text: string,
    senderId: string,
    participants: IChatRoom["participants"],
    participantsDetails: IChatRoom["participantsDetails"]
  ) => {
    try {
      const message: Omit<IMessage, "id" | "createdAt"> = {
        senderId: senderId,
        content: text,
      };

      const chatDoc = await firestore()
        .collection("chats")
        .doc(chatDocId)
        .get();

      if (chatDoc.exists) {
        await firestore()
          .collection("chats")
          .doc(chatDocId)
          .update({
            lastMessage: {
              ...message,
              createdAt: firestore.FieldValue.serverTimestamp(),
            },
          });
      } else {
        const room: Omit<IChatRoom, "createdAt" | "id"> = {
          participantsDetails,
          participants,
          lastMessage: {
            ...message,
            createdAt: firestore.FieldValue.serverTimestamp() as any,
          },
        };

        await firestore()
          .collection("chats")
          .doc(chatDocId)
          .set({
            ...room,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      await firestore()
        .collection("chats")
        .doc(chatDocId)
        .collection("messages")
        .add({
          ...message,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  fetcAllChats: async (userId: string) => {
    try {
      const querySnapshot = await firestore()
        .collection("chats")
        .where("participants", "array-contains", userId)
        .orderBy("createdAt", "desc")
        .get();

      if (querySnapshot.size > 0) {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.seconds,
            lastMessage: {
              ...data.lastMessage,
              createdAt: data.lastMessage.createdAt.seconds,
            },
          } as IChatRoom;
        });
      } else return [];
    } catch (error) {
      console.error("Error fetch User Chats", error);
      throw error;
    }
  },
};

export default chatAPI;
