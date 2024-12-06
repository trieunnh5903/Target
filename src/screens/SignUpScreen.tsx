import { Alert, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, Text } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch } from "@/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import {
  Container,
  CustomKeyboardAvoidingView,
  CustomView,
} from "@/components";
import { GLOBAL_STYLE } from "@/constants";
import { Image } from "expo-image";
import CustomTextInput from "@/components/CustomTextInput";
import { RootStackScreenProps } from "@/types/navigation";

const SignUpScreen: React.FC<RootStackScreenProps<"SignUp">> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();

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

      const { error, userCredential } = await authAPI.signUp(email, password);
      if (error || !userCredential) throw new Error(error);
      const { error: createUserError } = await userAPI.createUserProfile(
        userCredential.user
      );
      if (createUserError) throw new Error(createUserError);
      dispatch(fetchCurrentUser(userCredential.user.uid));
    } catch (error) {
      handleError((error as Error).message);
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
    <CustomKeyboardAvoidingView>
      <Container style={[GLOBAL_STYLE.justifyContentCenter]}>
        <CustomView style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
          <View style={styles.languageContainer}>
            <Text variant="titleMedium">English</Text>
          </View>
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
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button mode="contained" onPress={handleSignUp}>
            Register
          </Button>
        </CustomView>

        <CustomView
          padding={16}
          style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.justifyContentBetween]}
        >
          <Button>You forget password?</Button>
          <Button mode="outlined" onPress={() => navigation.navigate("SignIn")}>
            Already have account
          </Button>
        </CustomView>
      </Container>
    </CustomKeyboardAvoidingView>
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
