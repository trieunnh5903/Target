import { Button, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { resetPassword, signIn, signUp } from "@/services/authService";

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState("");

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!isLogin && !userName) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const { error: authError } = await (isLogin
      ? signIn(email, password)
      : signUp(email, password, userName));

    if (authError) {
      setError(authError);
    } else {
      setError("");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    const { error: resetError } = await resetPassword(email);
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
