import { Alert, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Text } from "react-native-paper";
import { authAPI, userAPI } from "@/api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clearError, loginRequest } from "@/redux/slices/authSlice";
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
  const dispatch = useAppDispatch();
  const { errorMessage } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return navigation.addListener("blur", () => {
      setLoading(false);
    });
  }, [navigation]);

  useEffect(() => {
    if (errorMessage) {
      setLoading(false);
      Alert.alert("Error", errorMessage, [
        {
          text: "OK",
          onPress() {
            dispatch(clearError());
          },
        },
      ]);
    }
    return () => {};
  }, [dispatch, errorMessage]);

  const handleSignIn = async () => {
    setLoading(true);
    dispatch(loginRequest({ email, password }));
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { user } = await authAPI.signInGoogle();
      await userAPI.createUserProfile(user);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container style={[GLOBAL_STYLE.justifyContentCenter]}>
      <CustomView padding={16} style={styles.form}>
        <CustomView style={GLOBAL_STYLE.center}>
          <Text variant="titleMedium">English</Text>
        </CustomView>
        <CustomView paddingTop={24} style={[GLOBAL_STYLE.alignItemsCenter]}>
          <Image
            source={require("../../assets/adaptive-icon.png")}
            style={{ width: 100, height: 100 }}
          />
        </CustomView>
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
        <View style={{ flex: 1 }} />
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
  googleLogin: {
    gap: 8,
    borderColor: "lightgray",
    borderWidth: 1,
    padding: 8,
    borderRadius: 20,
  },
  form: {
    gap: 16,
    flex: 2,
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
