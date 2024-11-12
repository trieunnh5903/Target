import { Post } from "@/types";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import { ImagePickerAsset } from "expo-image-picker";
import { getUserById } from "./userService";

const postsCollection = firestore().collection("posts");

export const getPosts = async () => {
  try {
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

export const uploadImage = async (assets: ImagePickerAsset) => {
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

export const createPost = async ({
  content,
  images,
  userId,
}: {
  userId: string;
  content: string;
  images: string;
}) => {
  try {
    const { id } = await postsCollection.add({
      userId,
      content,
      images,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    const data = (await postsCollection.doc(id).get()).data();
    if (data) {
      const user = await getUserById(userId);
      const post = { ...data, id, postedBy: user };
      return post as Post;
    }
  } catch (error) {
    console.error("uploadFirestore", error);
  }
};
