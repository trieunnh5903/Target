import { Alert, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch } from "@/hooks";
import { fetchUserById } from "@/redux/slices/authSlice";
import { Container, CustomView } from "@/components";
import { GLOBAL_STYLE } from "@/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import CustomTextInput from "@/components/CustomTextInput";
import { RootStackScreenProps } from "@/types/navigation";

const SignInScreen: React.FC<RootStackScreenProps<"SignIn">> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleError = (error: string | null) => {
    if (error) {
      setError(error);
      Alert.alert("Lỗi", error, [{ text: "OK" }]);
    } else {
      setError("");
    }

    console.log(error);
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }

      const { error, userCredential } = await authAPI.signIn(email, password);
      if (error || !userCredential) throw new Error(error);
      dispatch(fetchUserById(userCredential.user.uid));
    } catch (error) {
      handleError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // const handleResetPassword = async () => {
  //   if (!email) {
  //     setError("Vui lòng nhập email");
  //     return;
  //   }

  //   const { error: resetError } = await authAPI.resetPassword(email);
  //   if (resetError) {
  //     setError(resetError);
  //   } else {
  //     setError("Email đặt lại mật khẩu đã được gửi");
  //   }
  // };

  return (
    <Container style={[GLOBAL_STYLE.justifyContentCenter]}>
      <CustomView style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
        <CustomView style={styles.languageContainer}>
          <Text variant="titleMedium">English</Text>
        </CustomView>
        <CustomView paddingTop={24} style={[GLOBAL_STYLE.alignItemsCenter]}>
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 60, height: 60 }}
          />
        </CustomView>
      </CustomView>

      <CustomView padding={16} style={styles.form}>
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button mode="contained" loading={loading} onPress={handleSignIn}>
          Login
        </Button>
      </CustomView>

      <CustomView
        padding={16}
        style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.justifyContentBetween]}
      >
        <Button>You forget password?</Button>
        <Button mode="outlined" onPress={() => navigation.navigate("SignUp")}>
          Create new account
        </Button>
      </CustomView>
    </Container>
  );
};

const styles = StyleSheet.create({
  languageContainer: { position: "absolute", top: 0 },

  form: {
    gap: 16,
    flex: 1,
  },
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
