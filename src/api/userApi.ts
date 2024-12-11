import { User } from "@/types";
import { usersCollection } from "./collections";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { generateKeywords } from "@/utils/userUtils";
import { ImagePickerAsset } from "expo-image-picker";
import axios from "axios";
import firestore from "@react-native-firebase/firestore";

const uploadAvatar = async (assets: ImagePickerAsset) => {
  console.log("uploadAvatar");

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
    throw error;
  }
};

const createUserProfile = async (userData: FirebaseAuthTypes.User) => {
  try {
    console.log("createUserProfile");

    const { uid, email, metadata, photoURL, phoneNumber, displayName } =
      userData;
    const keywords = displayName ? generateKeywords(displayName) : null;
    const user: User = {
      email: email as string,
      creationTime: metadata.creationTime as string,
      lastSignInTime: metadata.lastSignInTime as string,
      displayName: displayName ?? "No Name",
      phoneNumber,
      avatarURL: photoURL,
      id: uid,
      keywords,
    };
    await usersCollection.doc(uid).set(user);
    return { error: null };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { error: "Lỗi khi tạo thông tin người dùng" };
  }
};

const updateUser = async (
  userId: string,
  value: Partial<{
    [x: string]: any;
  }>
) => {
  try {
    await usersCollection.doc(userId).update(value);
  } catch (error) {
    console.log("updateUser", error);
  }
};

const fetchUserById = async (userId: string) => {
  try {
    return (await usersCollection.doc(userId).get()).data() as User;
  } catch (error) {
    console.log("getUserById", error);
    throw error;
  }
};

const updatePushToken = async (token: string, userId: string) => {
  try {
    console.log("updatePushToken");
    await usersCollection.doc(userId).update({
      pushToken: token,
    });
  } catch (error) {
    console.log("updatePushToken", error);
  }
};

const deletePushToken = async (userId: string) => {
  try {
    console.log("deletePushToken");
    await usersCollection.doc(userId).update({
      pushToken: firestore.FieldValue.delete(),
    });
  } catch (error) {
    console.log("deletePushToken", error);
    throw error;
  }
};

const searchUsersByDisplayName = async (searchTerm: string, limit = 10) => {
  try {
    console.log("searchUsersByDisplayName");

    const searchTermLower = searchTerm.toLowerCase();
    const snapshot = await usersCollection
      .where("keywords", "array-contains", searchTermLower)
      .limit(limit)
      .get();

    const users = snapshot.docs.map((doc) => doc.data());

    return {
      users: users as User[],
      error: null,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      users: [],
      error: "Có lỗi xảy ra khi tìm kiếm người dùng",
    };
  }
};

export const userAPI = {
  fetchUserById,
  searchUsersByDisplayName,
  updatePushToken,
  createUserProfile,
  updateUser,
  uploadAvatar,
  deletePushToken,
};
