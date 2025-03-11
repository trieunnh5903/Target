import { StyleSheet, Image } from "react-native";
import React, { memo } from "react";
import CustomView from "../CustomView";
import { GLOBAL_STYLE, POST_IMAGE_SIZE } from "@/constants";
import { Pressable } from "react-native-gesture-handler";
import { PostImage } from "@/types";

interface ImageAreaProps {
  source: PostImage;
  onPress: (source: PostImage["baseUrl"]) => void;
}
const ImageArea: React.FC<ImageAreaProps> = memo(({ source, onPress }) => {
  return (
    <CustomView style={GLOBAL_STYLE.center}>
      <Pressable onPress={() => onPress(source.baseUrl)}>
        <CustomView style={styles.imageContainer}>
          <Image
            source={{ uri: source.thumbnailUrl.source }}
            style={GLOBAL_STYLE.fullSize}
          />
        </CustomView>
      </Pressable>
    </CustomView>
  );
});
ImageArea.displayName = "ImageArea";
export default ImageArea;

const styles = StyleSheet.create({
  imageContainer: {
    width: POST_IMAGE_SIZE,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  bigHeartContainer: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
});
