import {
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import auth from "@react-native-firebase/auth";
import { RootTabScreenProps } from "@/types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { notificationAPI, postAPI } from "@/api";

const CreatePostScreen: React.FC<RootTabScreenProps<"Create">> = ({
  navigation,
}) => {
  const currentUser = auth().currentUser;
  const [description, setDescription] = useState("");
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const dimension = useWindowDimensions();
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: true,
            aspect: [1, 1],
          });

          if (!result.canceled) {
            setAssets(result.assets[0]);
          } else {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }
        } catch (error) {
          console.log(error);
          Alert.alert("Error", "Failed to pick image. Please try again.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      })();
    }, [navigation])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setAssets(null);
      setDescription("");
    });
    return unsubscribe;
  }, [navigation]);

  const onSubmit = async () => {
    if (loading || !assets || !currentUser?.uid) {
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();

      const image = await postAPI.uploadImage(assets);
      if (!image) {
        throw new Error("Failed to upload image");
      }

      const newPost = await postAPI.createPost({
        content: description.trim(),
        images: image,
        userId: currentUser.uid,
      });

      if (newPost) {
        await notificationAPI.notificationNewPost(newPost);
        setDescription("");
        setAssets(null);
        navigation.goBack();
      }
    } catch (error) {
      console.log("onSubmit", error);
      Alert.alert("Error", "Failed to create post. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!assets) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.flex1}>
        {assets?.uri && (
          <Image source={{ uri: assets.uri }} style={styles.image} />
        )}
      </View>
      <View style={styles.flex1}>
        <View style={[styles.inputWrapper, { width: dimension.width - 40 }]}>
          <TextInput
            autoFocus
            value={description}
            onChangeText={setDescription}
            style={[styles.input]}
            placeholder="What do you think?"
            multiline
            maxLength={500}
            editable={!loading}
          />
          <View style={styles.buttonContainer}>
            <View style={styles.flex1} />
            <IconButton
              icon={"send"}
              onPress={onSubmit}
              loading={loading}
              containerColor={loading ? "#cccccc" : "black"}
              disabled={loading}
              mode="contained"
              iconColor="white"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: "100%",
    aspectRatio: 1,
    borderRadius: 20,
  },
  inputContainer: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: "#eaeaea",
    borderRadius: 20,
    margin: 20,
    padding: 6,
    flex: 1,
  },
  input: {
    padding: 8,
    flex: 1,
    textAlignVertical: "top",
    fontSize: 16,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex1: {
    flex: 1,
  },
});
