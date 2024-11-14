import {
  Keyboard,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
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
  const dimesion = useWindowDimensions();
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: assets ? true : false,
    });
  }, [navigation, assets]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled) {
          setAssets(result.assets[0]);
        } else {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }
      })();
    }, [navigation])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setAssets(null);
    });
    return unsubscribe;
  }, [navigation]);

  const onSubmit = async () => {
    if (loading === true) {
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    if (!assets || !currentUser?.uid) return;

    const image = await postAPI.uploadImage(assets);
    if (!image) return;

    const newPost = await postAPI.createPost({
      content: description,
      images: image,
      userId: currentUser.uid,
    });

    if (newPost) {
      await notificationAPI.notificationNewPost(newPost);
    }

    setDescription("");
    setAssets(null);
    setLoading(false);
    navigation.goBack();
  };

  if (!assets) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {assets?.uri && (
          <Image source={{ uri: assets.uri }} style={styles.image} />
        )}
      </View>
      <View style={styles.flex_1}>
        <View
          style={{
            backgroundColor: "#eaeaea",
            borderRadius: 20,
            width: dimesion.width - 40,
            margin: 20,
            padding: 6,
            flex: 1,
          }}
        >
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input]}
            placeholder="What do you think?"
            multiline
          />
          <View style={{ flexDirection: "row" }}>
            <View style={styles.flex_1} />
            <IconButton
              icon={"send"}
              onPress={onSubmit}
              loading={loading}
              mode="contained"
              containerColor="black"
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
  input: {
    padding: 8,
    flex: 1,
    textAlignVertical: "top",
    fontSize: 16,
    width: "100%",
  },
  flex_1: {
    flex: 1,
  },
  image: {
    height: "100%",
    aspectRatio: 1,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    alignItems: "center",
  },
});
