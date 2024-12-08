import { Alert, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Button, IconButton, Text } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch } from "@/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import { Container, CustomView } from "@/components";
import { GLOBAL_STYLE } from "@/constants";
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
      dispatch(fetchCurrentUser(userCredential.user.uid));
    } catch (error) {
      handleError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { user } = await authAPI.signInGoogle();
      const { error } = await userAPI.createUserProfile(user);
      if (!error) {
        dispatch(fetchCurrentUser(user.uid));
      }
    } catch (error) {
      console.log(error);
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
            source={require("../../assets/adaptive-icon.png")}
            style={{ width: 100, height: 100 }}
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
        style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.justifyContentEnd]}
      >
        <Pressable
          style={[GLOBAL_STYLE.rowCenter, styles.googleLogin]}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={require("../../assets/icons8-google-48.png")}
            style={{ width: 24, height: 24 }}
          />
          <Text>Sign in with Google</Text>
        </Pressable>
        <Button mode="outlined" onPress={() => navigation.navigate("SignUp")}>
          Create new account
        </Button>
      </CustomView>
    </Container>
  );
};

const styles = StyleSheet.create({
  languageContainer: { position: "absolute", top: 0 },
  googleLogin: {
    gap: 8,
    borderColor: "lightgray",
    borderWidth: 1,
    padding: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
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
