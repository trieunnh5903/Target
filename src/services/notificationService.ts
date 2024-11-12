import { Post } from "@/types";
import { usersCollection } from "./collections";

export async function notificationNewPost(post: Post) {
  try {
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
