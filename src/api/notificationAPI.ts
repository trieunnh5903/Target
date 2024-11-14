import { Post } from "@/types";
import { usersCollection } from "./collections";
import axios from "axios";

async function notificationNewPost(post: Post) {
  try {
    console.log("notificationNewPost");
    const users = (await usersCollection.get()).docs;
    const tokens: string[] = [];
    users.forEach((user) => {
      const data = user.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "New Post",
      body: `${post.postedBy.displayName} just created a new post.`,
      data: {
        post: post.id,
      },
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (error) {
    console.log("notificationNewPost", error);
  }
}

const notificationLiked = async (
  postById: string,
  userLikedName: string,
  postId: string
) => {
  try {
    console.log("notificationLiked");
    const pushToken = (await usersCollection.doc(postById).get()).data()
      ?.pushToken;
    if (!pushToken) return;
    const message = {
      to: pushToken,
      sound: "default",
      body: `${userLikedName} liked your post.`,
      data: {
        postId: postId,
      },
    };

    const res = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      message,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-encoding": "gzip, deflate",
        },
      }
    );
    console.log(res.data);
  } catch (error) {
    console.log("notificationLiked", error);
  }
};

export const notificationAPI = { notificationNewPost, notificationLiked };
