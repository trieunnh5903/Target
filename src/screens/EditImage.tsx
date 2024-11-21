import { CustomView } from "@/components";
import { GLOBAL_STYLE } from "@/constants";
import { RootStackScreenProps } from "@/types/navigation";
import {
  ImageResult,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";
import React, { useMemo, useState } from "react";
import { View, Image, StyleSheet, Dimensions, Modal } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Button, IconButton, Text } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width: cropSize } = Dimensions.get("window");

const CropImageScreen: React.FC<RootStackScreenProps<"EditImage">> = ({
  route,
}) => {
  const {
    asset: {
      uri: imageUri,
      width: originalWidth = cropSize,
      height: originalHeight = cropSize,
    },
  } = route.params;
  const originalRatio = originalWidth / originalHeight;
  const [image, setImage] = useState<ImageResult | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1 / 1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const girdOverlayOpacity = useSharedValue(0);

  const displayWidth = useMemo(
    () =>
      originalWidth > originalHeight ? cropSize * originalRatio : cropSize,
    [originalHeight, originalRatio, originalWidth]
  );

  const displayHeight = useMemo(
    () =>
      originalWidth > originalHeight ? cropSize : cropSize / originalRatio,
    [originalHeight, originalRatio, originalWidth]
  );

  const limitTranslateY = useMemo(
    () => cropSize / 2 - displayHeight / 2,
    [displayHeight]
  );
  const limitTranslateX = useMemo(
    () => cropSize / 2 - displayWidth / 2,
    [displayWidth]
  );

  // const displaySize =
  //   originalWidth > originalHeight
  //     ? { height: cropSize, width: cropSize * (originalWidth / originalHeight) }
  //     : {
  //         width: cropSize,
  //         height: cropSize / (originalWidth / originalHeight),
  //       };

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const girdOverlayStyle = useAnimatedStyle(() => ({
    opacity: girdOverlayOpacity.value,
  }));

  const pan = Gesture.Pan()
    .onTouchesDown((e) => {
      girdOverlayOpacity.value = withTiming(1);
    })
    .onTouchesUp(() => {
      girdOverlayOpacity.value = withTiming(0);
    })
    .onStart(() => {
      prevTranslationY.value = translationY.value;
      prevTranslationX.value = translationX.value;
    })
    .onUpdate((event) => {
      translationY.value = prevTranslationY.value + event.translationY;
      translationX.value = prevTranslationX.value + event.translationX;
    })
    .onEnd(() => {
      if (translationY.value > Math.abs(limitTranslateY)) {
        translationY.value = withTiming(-limitTranslateY);
      } else if (translationY.value < -Math.abs(limitTranslateY)) {
        translationY.value = withTiming(limitTranslateY);
      }

      if (translationX.value > Math.abs(limitTranslateX)) {
        translationX.value = withTiming(-limitTranslateX);
      } else if (translationX.value < -Math.abs(limitTranslateX)) {
        translationX.value = withTiming(limitTranslateX);
      }
    });

  const handleCrop = async () => {
    if (!imageUri) return;
    const scale = originalWidth / displayWidth;
    const cropXDisplay = (displayWidth - cropSize) / 2 - translationX.value;
    const cropYDisplay = (displayHeight - cropSize) / 2 - translationY.value;
    const cropXOriginal = cropXDisplay * scale;
    const cropYOriginal = cropYDisplay * scale;
    const cropWidthOriginal = cropSize * scale;
    const cropHeightOriginal = cropSize * scale;

    try {
      const manipResult = await manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: cropXOriginal,
              originY: cropYOriginal,
              width: cropWidthOriginal,
              height: cropHeightOriginal,
            },
          },
        ],
        { compress: 1, format: SaveFormat.PNG }
      );
      // console.log(manipResult);
      setImage(manipResult);
    } catch (error) {
      console.log("handleCrop", error);
      alert("Crop failed.");
    }
  };
  return (
    <View style={styles.container}>
      <View style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
        <View style={styles.imageArea}>
          {/*image */}
          <GestureDetector gesture={pan}>
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                { width: displayWidth, height: displayHeight },
                animatedImageStyle,
              ]}
            />
          </GestureDetector>
          {/* grid crop */}
          <Animated.View
            style={[styles.cropBox, girdOverlayStyle]}
            pointerEvents="none"
          >
            <CameraGridOverlay />
          </Animated.View>
        </View>
      </View>

      <CustomView padding={16}>
        <Button mode="contained" onPress={handleCrop}>
          Next
        </Button>
      </CustomView>

      <Modal animationType="slide" visible={!!image}>
        <IconButton icon={"close"} onPress={() => setImage(null)} />
        {image && (
          <Image
            source={{ uri: image.uri }}
            width={cropSize}
            height={cropSize / (image.width / image.height)}
          />
        )}
      </Modal>
    </View>
  );
};

const CameraGridOverlay = () => {
  const screenWidth = Dimensions.get("window").width;
  const cellSize = screenWidth / 3;

  return (
    <View style={styles.girdOverlay}>
      {/* vertial line */}
      <View style={[styles.verticalLine, { left: cellSize }]} />
      <View style={[styles.verticalLine, { left: cellSize * 2 }]} />

      {/* horizontal line */}
      <View style={[styles.horizontalLine, { top: cellSize }]} />
      <View style={[styles.horizontalLine, { top: cellSize * 2 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  girdOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  verticalLine: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  horizontalLine: {
    position: "absolute",
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,1)",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageArea: {
    width: cropSize,
    height: cropSize,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 16,
  },
  image: {
    width: cropSize * 1.5, // Tăng kích thước ảnh để dễ crop hơn
    height: cropSize * 1.5,
  },
  cropBox: {
    position: "absolute",
    width: cropSize,
    height: cropSize,
    borderColor: "white",
  },
});

export default CropImageScreen;
