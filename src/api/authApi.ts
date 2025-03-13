import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { userAPI } from "./userApi";

const signUp = async (email: string, password: string) => {
  try {
    console.log("signUp");

    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    return {
      error: null,
      userCredential,
    };
  } catch (error: any) {
    let errorMessage = "Đã xảy ra lỗi khi đăng ký";
    const errorCode = error.message.split(" ")[0];
    switch (errorCode) {
      case "[auth/email-already-in-use]":
        errorMessage = "Email này đã được sử dụng";
        break;
      case "[auth/invalid-email]":
        errorMessage = "Email không hợp lệ";
        break;
      case "[auth/weak-password]":
        errorMessage = "Mật khẩu phải có ít nhất 6 ký tự";
        break;
    }
    return {
      error: errorMessage,
      userCredential: null,
    };
  }
};

const signIn = async (email: string, password: string) => {
  // try {
  console.log("signIn");
  return await auth().signInWithEmailAndPassword(email, password);
  // return {
  //   errorMessage: null,
  //   userCredential,
  // };
  // } catch (error: any) {
  // let errorMessage = "Login failed";
  // // const errorCode = error.message.split(" ")[0];
  // const errorCode = error.code;
  // console.log(errorCode);
  // switch (errorCode) {
  //   case "auth/invalid-email":
  //     errorMessage = "Invalid email";
  //     break;
  //   case "auth/user-disabled":
  //     errorMessage = "User disabled";
  //     break;
  //   case "auth/user-not-found":
  //     errorMessage = "User not found";
  //     break;
  //   case "auth/wrong-password":
  //     errorMessage = "Invalid password";
  //     break;
  // }
  // return {
  //   errorMessage: errorMessage,
  //   userCredential: null,
  // };
  // }
};

const signOut = async (userId: string) => {
  try {
    console.log("signOut");
    await userAPI.deletePushToken(userId);
    await auth().signOut();
    return { error: null };
  } catch {
    return { error: "Đã xảy ra lỗi khi đăng xuất" };
  }
};

const resetPassword = async (email: string) => {
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

const signInGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;
    if (!idToken) {
      throw new Error("No ID token found");
    }
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    throw new Error(`${error}`);
  }
};



export const authAPI = { signIn, signUp, signOut, resetPassword, signInGoogle };
