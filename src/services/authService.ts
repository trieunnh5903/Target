import { User } from "@/types";
import auth from "@react-native-firebase/auth";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { usersCollection } from "./collections";

const generateKeywords = (displayName: string) => {
  const keywords: string[] = [];
  let currentStr = "";
  displayName
    .toLowerCase()
    .split("")
    .forEach((char) => {
      currentStr += char;
      keywords.push(currentStr);
    });
  return keywords;
};

const createUserProfile = async (
  userData: FirebaseAuthTypes.User,
  displayName: string
) => {
  try {
    const { uid, email, metadata, photoURL, phoneNumber } = userData;
    const keywords = displayName ? generateKeywords(displayName) : null;
    const user: User = {
      email: email as string,
      creationTime: metadata.creationTime as string,
      lastSignInTime: metadata.lastSignInTime as string,
      displayName,
      phoneNumber,
      photoURL,
      uid,
      keywords,
    };
    await usersCollection.doc(uid).set(user);

    return { error: null };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { error: "Lỗi khi tạo thông tin người dùng" };
  }
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    console.log("signUp");

    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    await createUserProfile(userCredential.user, displayName);
    console.log(userCredential);

    return {
      error: null,
    };
  } catch (error: any) {
    console.log("error", error);

    let errorMessage = "Đã xảy ra lỗi khi đăng ký";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email này đã được sử dụng";
        break;
      case "auth/invalid-email":
        errorMessage = "Email không hợp lệee";
        break;
      case "auth/weak-password":
        errorMessage = "Mật khẩu phải có ít nhất 6 ký tự";
        break;
    }
    console.log("error", error);

    return {
      error: errorMessage,
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log("signIn");
    await auth().signInWithEmailAndPassword(email, password);

    return {
      error: null,
    };
  } catch (error: any) {
    console.log(error);

    let errorMessage = "Đã xảy ra lỗi khi đăng nhập";
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Email không hợp lệ";
        break;
      case "auth/user-disabled":
        errorMessage = "Tài khoản đã bị vô hiệu hóa";
        break;
      case "auth/user-not-found":
        errorMessage = "Không tìm thấy tài khoản";
        break;
      case "auth/wrong-password":
        errorMessage = "Mật khẩu không đúng";
        break;
    }
    return {
      error: errorMessage,
    };
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    return { error: null };
  } catch {
    return { error: "Đã xảy ra lỗi khi đăng xuất" };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
    return { error: null };
  } catch (error: any) {
    let errorMessage = "Đã xảy ra lỗi khi đặt lại mật khẩu";
    if (error.code === "auth/user-not-found") {
      errorMessage = "Không tìm thấy email này";
    }
    return { error: errorMessage };
  }
};

export const updatePushToken = async (token: string, userId: string) => {
  try {
    await usersCollection.doc(userId).update({
      pushToken: token,
    });
  } catch (error) {
    console.log("updatePushToken", error);
  }
};
