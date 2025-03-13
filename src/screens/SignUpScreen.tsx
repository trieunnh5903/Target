import { Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { CustomView } from "@/components";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import CustomTextInput from "@/components/CustomTextInput";
import { RootStackScreenProps } from "@/types/navigation";

const SignUpScreen: React.FC<RootStackScreenProps<"SignUp">> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleError = (error: string) => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
    }
    console.log(error);
  };

  const handleSignUp = async () => {
    try {
      if (!email || !password) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }
      if (password !== confirmPassword) {
        throw new Error("Mật khẩu không khớp");
      }
      const { error, userCredential } = await authAPI.signUp(email, password);
      if (error || !userCredential) throw new Error(error);
      const { error: createUserError } = await userAPI.createUserProfile(
        userCredential.user
      );
      if (createUserError) throw new Error(createUserError);
    } catch (error) {
      handleError((error as Error).message);
    }
  };

  return (
    <CustomView
      padding={SPACING.medium}
      style={[GLOBAL_STYLE.justifyContentCenter, GLOBAL_STYLE.flex_1]}
    >
      <CustomView style={styles.form}>
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomTextInput
          label="Password"
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomTextInput
          label="Confirm Password"
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <Button mode="contained">Register</Button>
        <CustomView style={{ flex: 1 }} />
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  languageContainer: { position: "absolute", top: 0 },
  form: {
    gap: 16,
    justifyContent: "center",
    flex: 1,
  },
  container: {
    flex: 1,
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

export default SignUpScreen;
