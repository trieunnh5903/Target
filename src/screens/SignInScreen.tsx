import { Button, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch } from "@/hooks";
import { fetchUserById } from "@/redux/slices/authSlice";

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState("");
  const dispatch = useAppDispatch();

  const handleError = (error: string | null) => {
    if (error) {
      setError(error);
    } else {
      setError("");
    }
    console.log(error);
  };

  const handleAuth = async () => {
    try {
      if (!email || !password || (!isLogin && !userName)) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }

      const { error, userCredential } = await (isLogin
        ? authAPI.signIn(email, password)
        : authAPI.signUp(email, password));

      if (error || !userCredential) throw new Error(error);

      if (!isLogin) {
        const { error: createUserError } = await userAPI.createUserProfile(
          userCredential.user,
          userName
        );
        if (createUserError) throw new Error(createUserError);
      }
      dispatch(fetchUserById(userCredential.user.uid));
    } catch (error) {
      handleError((error as Error).message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    const { error: resetError } = await authAPI.resetPassword(email);
    if (resetError) {
      setError(resetError);
    } else {
      setError("Email đặt lại mật khẩu đã được gửi");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Đăng nhập" : "Đăng ký"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Display name"
          value={userName}
          onChangeText={setUserName}
          keyboardType="default"
          autoCapitalize="sentences"
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={isLogin ? "Đăng nhập" : "Đăng ký"} onPress={handleAuth} />

      <Button
        title={`Chuyển sang ${isLogin ? "đăng ký" : "đăng nhập"}`}
        onPress={() => setIsLogin(!isLogin)}
      />

      {isLogin && (
        <Button title="Quên mật khẩu?" onPress={handleResetPassword} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignInScreen;
