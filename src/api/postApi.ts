import { Post } from "@/types";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import { ImagePickerAsset } from "expo-image-picker";
import { userAPI } from "./userApi";
import { likesCollection } from "./collections";

const postsCollection = firestore().collection("posts");

const getPosts = async () => {
  try {
    console.log("getPosts");

    const postsSnapshot = await postsCollection
      .orderBy("createdAt", "desc")
      .get();

    const posts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const postData = doc.data();
        const userDoc = await firestore()
          .collection("users")
          .doc(postData.userId)
          .get();

        return {
          id: doc.id,
          ...postData,
          postedBy: userDoc.data(),
        };
      })
    );
    return posts as unknown as Post[];
  } catch (error) {
    console.log("getPosts", error);
  }
};

const uploadImage = async (assets: ImagePickerAsset) => {
  console.log("uploadImage");

  const formData = new FormData();
  formData.append(
    "upload_preset",
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  );

  if (assets) {
    formData.append("file", {
      uri: assets.uri,
      name: assets.fileName,
      type: assets.mimeType,
    } as any);
  }

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
  }
};

const createPost = async ({
  content,
  images,
  userId,
}: {
  userId: string;
  content: string;
  images: string;
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

export const postAPI = { createPost, getPosts, uploadImage };
