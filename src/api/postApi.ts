import { Comment, FetchPostsResponse, Post, PostImage } from "@/types";
import firestore, {
  Filter,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import axios from "axios";
import { userAPI } from "./userApi";
import {
  commentsCollection,
  postsCollection,
  usersCollection,
} from "./collections";
import Utils from "@/utils";

const fetchAllUserPost = async (
  userId: string,
  lastPost?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null
) => {
  try {
    const postsSnapshot = await (lastPost
      ? postsCollection
          .where(Filter("userId", "==", userId))
          .orderBy("createdAt", "desc")
          .startAfter(lastPost)
          .limit(50)
          .get()
      : postsCollection
          .where(Filter("userId", "==", userId))
          .orderBy("createdAt", "desc")
          .limit(50)
          .get());

    const userIds = postsSnapshot.docs.map((doc) => doc.data().userId);
    const userDocs = await usersCollection.where("id", "in", userIds).get();

    const usersMap = userDocs.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {} as Record<string, FirebaseFirestoreTypes.DocumentData>);

    const posts = postsSnapshot.docs.map((doc) => {
      const postData = doc.data();
      const userData = usersMap[postData.userId];
      return {
        id: doc.id,
        ...postData,
        createdAt: postData.createdAt.seconds,
        postedBy: userData || null,
      };
    });

    return {
      posts: posts as Post[],
      lastPost: postsSnapshot.docs[postsSnapshot.docs.length - 1],
    } as FetchPostsResponse;
  } catch (error) {
    console.log("fetchAllUserPost", error);
    return {
      posts: [],
      lastPost: null,
    } as FetchPostsResponse;
  }
};

const fetchOne = async (postId: Post["id"]) => {
  try {
    const postsSnapshot = (await postsCollection.doc(postId).get()).data();
    if (!postsSnapshot) return;
    const userDoc = (
      await usersCollection.doc(postsSnapshot.userId).get()
    ).data();
    return [
      {
        id: postId,
        ...postsSnapshot,
        createdAt: postsSnapshot.createdAt.seconds,
        postedBy: userDoc,
      },
    ] as Post[];
  } catch (error) {
    console.log("fetchOne", error);
    throw error;
  }
};

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

    const userIds = postsSnapshot.docs.map((doc) => doc.data().userId);
    if (userIds.length === 0) {
      return {
        posts: [],
        lastPost: null,
      };
    }
    const userDocs = await usersCollection.where("id", "in", userIds).get();

    const usersMap = userDocs.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {} as Record<string, FirebaseFirestoreTypes.DocumentData>);

    const posts = postsSnapshot.docs.map((doc) => {
      const postData = doc.data();
      const userData = usersMap[postData.userId];
      return {
        id: doc.id,
        ...postData,
        createdAt: postData.createdAt.seconds,
        postedBy: userData || null,
      };
    });
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
  const formData = new FormData();
  formData.append("upload_preset", "default");

  formData.append("file", {
    uri,
    name: new Date().getTime().toString() + Math.random(),
    type: Utils.getMimeType(uri) ?? "image/jpeg",
  } as any);

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dg9phlaar/image/upload",
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
    throw new Error("uploadImage " + error + " " + uri);
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

      const postData = postDoc.data();
      const currentLikesCount = postData?.likesCount ?? 0;
      const plusWith = type === "dislike" ? -1 : 1;
      const newLikesCount = Math.max(0, currentLikesCount + plusWith);
      transaction.update(postRef, {
        likesCount: newLikesCount,
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
  caption,
  images,
  userId,
}: {
  userId: string;
  caption: string;
  images: PostImage[];
}) => {
  try {
    console.log("createPost");

    const { id } = await postsCollection.add({
      userId,
      caption,
      images,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    const data = (await postsCollection.doc(id).get()).data();
    if (data) {
      const user = await userAPI.fetchUserById(userId);
      const post = {
        ...data,
        id,
        postedBy: user,
        createdAt: data.createdAt.seconds,
      };
      return post as Post;
    }
  } catch (error) {
    console.error("uploadFirestore", error);
    throw error;
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

    const userIds = [...new Set(comments.map((comment) => comment.userId))];
    if (userIds.length === 0) return [];
    const usersData = await userAPI.fetchUsersByIds(userIds);

    const enrichedComments = comments.map((comment) => {
      const userData = usersData[comment.userId];
      return userData
        ? {
            ...comment,
            displayName: userData.displayName,
            avatarURL: userData.avatarURL,
          }
        : comment;
    });

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
  fetchOne,
  fetchAllUserPost,
};
