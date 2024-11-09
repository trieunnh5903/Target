import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import auth from "@react-native-firebase/auth";
const CreatePostScreen = () => {
  const currentUser = auth().currentUser;
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string>(
    "https://media.istockphoto.com/id/1128826884/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment.jpg?s=612x612&w=0&k=20&c=390e76zN_TJ7HZHJpnI7jNl7UBpO3UP7hpR2meE1Qd4="
  );

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  const onSubmit = () => {
    console.log(selectedImage);
    console.log(description);
    console.log(currentUser);
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={selectedImage} selectedImage={selectedImage} />
      </View>
      <View>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={{
            borderWidth: 1,
            width: 320,
            borderRadius: 12,
            minHeight: 60,
            marginBottom: 12,
            backgroundColor: "#fff",
            padding: 8,
          }}
          placeholder="What do you think?"
          multiline
        />
      </View>
      <View style={styles.footerContainer}>
        <Button
          theme="primary"
          label="Choose a photo"
          onPress={pickImageAsync}
        />
        <Button label="Use this photo" onPress={onSubmit} />
      </View>
    </View>
  );
};

type ImageViewerProps = {
  imgSource: string;
  selectedImage?: string;
};

function ImageViewer({ imgSource, selectedImage }: ImageViewerProps) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.image} />;
}

type Props = {
  label: string;
  theme?: "primary";
  onPress?: () => void;
};

function Button({ label, theme, onPress }: Props) {
  if (theme === "primary") {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 4, borderColor: "#ffd33d", borderRadius: 18 },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: "#fff" }]}
          onPress={onPress}
        >
          <FontAwesome
            name="picture-o"
            size={18}
            color="#25292e"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonLabel, { color: "#25292e" }]}>
            {label}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

export default CreatePostScreen;

const styles = StyleSheet.create({
  image: {
    width: 320,
    aspectRatio: 1,
    // height: 440,
    borderRadius: 18,
  },
  container: {
    flex: 1,
    // backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    alignItems: "center",
  },

  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: "#000",
    fontSize: 16,
  },
});
