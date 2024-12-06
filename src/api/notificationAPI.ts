import { usersCollection } from "./collections";
import axios from "axios";

const expoPushInstance = axios.create({
  baseURL: "https://exp.host",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Accept-encoding": "gzip, deflate",
  },
});

const notificationPostLiked = async (
  postAuthorId: string,
  likedBy: string,
  postId: string
) => {
  try {
    console.log("notificationLiked");
    const pushToken = (await usersCollection.doc(postAuthorId).get()).data()
      ?.pushToken;
    if (!pushToken) return;
    const message = {
      to: pushToken,
      sound: "default",
      body: `${likedBy} liked your post.`,
      data: {
        postId: postId,
      },
    };

    const res = await expoPushInstance.post("/--/api/v2/push/send", message);
    console.log(res.data);
  } catch (error) {
    console.log("notificationPostLiked", error);
  }
};

const notificationPostCommented = async (
  postAuthorId: string,
  displayNameCommented: string | null | undefined = "Someone",
  postId: string
) => {
  try {
    console.log("notificationPostCommented");
    const pushToken = (await usersCollection.doc(postAuthorId).get()).data()
      ?.pushToken;
    if (!pushToken) return;
    const message = {
      to: pushToken,
      sound: "default",
      body: `${displayNameCommented} commented on your post`,
      data: {
        postId: postId,
      },
    };

    const res = await expoPushInstance.post("/--/api/v2/push/send", message);
    console.log(res.data);
  } catch (error) {
    console.log("notificationPostCommented", error);
  }
};

export const notificationAPI = {
  notificationPostLiked,
  notificationPostCommented,
};
