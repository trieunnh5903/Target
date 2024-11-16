import auth from "@react-native-firebase/auth";

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
  try {
    console.log("signIn");

    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );

    return {
      error: null,
      userCredential,
    };
  } catch (error: any) {
    let errorMessage = "Đã xảy ra lỗi khi đăng nhập";
    const errorCode = error.message.split(" ")[0];
    console.log(errorCode);

    switch (errorCode) {
      case "[auth/invalid-email]":
        errorMessage = "Email không hợp lệ";
        break;
      case "[auth/user-disabled]":
        errorMessage = "Tài khoản đã bị vô hiệu hóa";
        break;
      case "[auth/user-not-found]":
        errorMessage = "Không tìm thấy tài khoản";
        break;
      case "[auth/wrong-password]":
        errorMessage = "Mật khẩu không đúng";
        break;
    }
    return {
      error: errorMessage,
      userCredential: null,
    };
  }
};

const signOut = async () => {
  try {
    console.log("signOut");

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

export const authAPI = { signIn, signUp, signOut, resetPassword };
