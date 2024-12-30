import { Comment, Post } from "@/types";
import firestore, {
  Filter,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import axios from "axios";
import { ImagePickerAsset } from "expo-image-picker";
import { userAPI } from "./userApi";
import {
  commentsCollection,
  postsCollection,
  usersCollection,
} from "./collections";
import Utils from "@/utils";

const fetchAll = async ({
  lastPost,
  limit,
}: {
  lastPost?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
  limit: number;
}) => {
  try {
    console.log("getPosts");

    const postsSnapshot = await (lastPost
      ? postsCollection
          .orderBy("createdAt", "desc")
          .startAfter(lastPost)
          .limit(limit)
          .get()
      : postsCollection.orderBy("createdAt", "desc").limit(limit).get());

    const posts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const postData = doc.data();
        const userDoc = await usersCollection.doc(postData.userId).get();
        return {
          id: doc.id,
          ...postData,
          createdAt: postData.createdAt.seconds,
          postedBy: userDoc.data(),
        };
      })
    );

    return {
      posts: posts as unknown as Post[],
      lastPost: postsSnapshot.docs[postsSnapshot.docs.length - 1],
    };
  } catch (error) {
    console.log("getPosts", error);
    throw error;
  }
};

const uploadImage = async (uri: string) => {
  console.log("uploadImage");

  const formData = new FormData();
  formData.append(
    "upload_preset",
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  );

  formData.append("file", {
    uri: uri,
    name: new Date().getTime().toString() + Math.random(),
    type: Utils.getMimeType(uri) ?? "image/jpeg",
  } as any);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.secure_url as string;
  } catch (error) {
    console.error("uploadImage:", error);
    throw error;
  }
};

const likePost = async (
  postId: string,
  likeById: string,
  type: "like" | "dislike"
) => {
  try {
    const postRef = postsCollection.doc(postId);
    await firestore().runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) {
        throw new Error("Post does not exist!");
      }
      const currentLikesCount = postDoc.data()?.likesCount ?? 0;
      const plusWith = type === "dislike" ? -1 : 1;
      const newLikesCount = currentLikesCount + plusWith;
      transaction.update(postRef, {
        likesCount: Math.max(0, newLikesCount),
        [`likes.${likeById}`]: type === "like",
      });
    });

    return { isSuccess: true };
  } catch (error) {
    console.log("likePost", error);
    return { isSuccess: false };
  }
};

const createPost = async ({
  content,
  images,
  userId,
}: {
  userId: string;
  content: string;
  images: {
    id: string;
    thumbnailUrl: string;
    baseUrl: string;
  }[];
}) => {
  try {
    console.log("createPost");

    const { id } = await postsCollection.add({
      userId,
      content,
      images,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    const data = (await postsCollection.doc(id).get()).data();
    if (data) {
      const user = await userAPI.fetchUserById(userId);
      const post = { ...data, id, postedBy: user };
      return post as Post;
    }
  } catch (error) {
    console.error("uploadFirestore", error);
  }
};

const fetchComments = async (postId: string) => {
  try {
    console.log("fetchComments");

    const querySnapshot = await commentsCollection
      .where(Filter("postId", "==", postId))
      .orderBy("createdAt", "desc")
      .get();
    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.seconds,
    })) as Omit<Comment, "avatarURL" | "displayName">[];

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const userData = await userAPI.fetchUserById(comment.userId);
        if (userData) {
          return {
            ...comment,
            displayName: userData.displayName,
            avatarURL: userData.avatarURL,
          };
        } else {
          return comment;
        }
      })
    );
    return enrichedComments as Comment[];
  } catch (error) {
    console.log("fetchComments", error);
    throw error;
  }
};

const addComment = async (
  comment: Pick<Comment, "content" | "postId" | "userId">
) => {
  try {
    await commentsCollection.add({
      ...comment,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.log("createComment", error);
  }
};
export const postAPI = {
  createPost,
  fetchAll,
  uploadImage,
  addComment,
  fetchComments,
  likePost,
};
