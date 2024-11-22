import { CustomView } from "@/components";
import { GLOBAL_STYLE } from "@/constants";
import { RootStackScreenProps } from "@/types/navigation";
import {
  ImageResult,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";
import React, { useMemo, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Button, IconButton } from "react-native-paper";
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
  const [resizeFull, setResizeFull] = useState(true);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const girdOverlayOpacity = useSharedValue(0);
  const girdOverlayTranslateX = useSharedValue(0);
  const girdOverlayTranslateY = useSharedValue(0);

  const displayWidth = useMemo(
    () =>
      resizeFull
        ? originalWidth > originalHeight
          ? cropSize * originalRatio
          : cropSize
        : originalWidth > originalHeight
        ? cropSize
        : cropSize - 70,
    [originalHeight, originalRatio, originalWidth, resizeFull]
  );

  const displayHeight = useMemo(
    () =>
      resizeFull
        ? originalWidth > originalHeight
          ? cropSize
          : cropSize / originalRatio
        : originalWidth > originalHeight
        ? cropSize / originalRatio
        : (cropSize - 70) / originalRatio,
    [originalHeight, originalRatio, originalWidth, resizeFull]
  );

  const possibleTranslateY = useMemo(
    () => cropSize / 2 - displayHeight / 2,
    [displayHeight]
  );

  console.log(possibleTranslateY);

  const possibleTranslateX = useMemo(
    () => cropSize / 2 - displayWidth / 2,
    [displayWidth]
  );

  const limitTranslateY = useMemo(
    () => Math.abs(cropSize / 2 - displayHeight / 2 - 100),
    [displayHeight]
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const girdOverlayStyle = useAnimatedStyle(() => ({
    opacity: girdOverlayOpacity.value,
    transform: [
      { translateX: girdOverlayTranslateX.value },
      { translateY: girdOverlayTranslateY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      girdOverlayOpacity.value = withTiming(1);
    })
    .onTouchesUp(() => {
      girdOverlayOpacity.value = withTiming(0);
    })
    .onStart((e) => {
      prevTranslationY.value = translationY.value;
      prevTranslationX.value = translationX.value;
    })
    .onUpdate((event) => {
      const newTranslationY = prevTranslationY.value + event.translationY;
      const newTranslationX = prevTranslationX.value + event.translationX;

      if (resizeFull) {
        translationY.value = Math.max(
          -limitTranslateY,
          Math.min(limitTranslateY, newTranslationY)
        );
      } else {
        translationY.value =
          cropSize < displayHeight
            ? Math.max(
                -limitTranslateY,
                Math.min(limitTranslateY, newTranslationY)
              )
            : 0;
      }

      translationX.value = Math.max(
        -Math.abs(possibleTranslateX - 100),
        Math.min(Math.abs(possibleTranslateX - 100), newTranslationX)
      );

      if (Math.abs(translationY.value) > Math.abs(possibleTranslateY)) {
        girdOverlayTranslateY.value =
          translationY.value > 0
            ? translationY.value - Math.abs(possibleTranslateY)
            : translationY.value + Math.abs(possibleTranslateY);
      } else {
        girdOverlayTranslateY.value = 0;
      }

      if (resizeFull) {
        if (Math.abs(translationX.value) > Math.abs(possibleTranslateX)) {
          girdOverlayTranslateX.value =
            translationX.value > 0
              ? translationX.value - Math.abs(possibleTranslateX)
              : translationX.value + Math.abs(possibleTranslateX);
        } else {
          girdOverlayTranslateX.value = 0;
        }
      } else {
        girdOverlayTranslateX.value = translationX.value;
      }
    })
    .onEnd(() => {
      if (resizeFull) {
        if (translationY.value > Math.abs(possibleTranslateY)) {
          translationY.value = withTiming(-possibleTranslateY);
        } else if (translationY.value < -Math.abs(possibleTranslateY)) {
          translationY.value = withTiming(possibleTranslateY);
        }

        if (translationX.value > Math.abs(possibleTranslateX)) {
          translationX.value = withTiming(-possibleTranslateX);
        } else if (translationX.value < -Math.abs(possibleTranslateX)) {
          translationX.value = withTiming(possibleTranslateX);
        }
      } else {
        translationX.value = withTiming(0);
        if (cropSize < displayHeight) {
          if (translationY.value > Math.abs(possibleTranslateY)) {
            translationY.value = withTiming(-possibleTranslateY);
          } else if (translationY.value < -Math.abs(possibleTranslateY)) {
            translationY.value = withTiming(possibleTranslateY);
          }
        } else {
          translationY.value = withTiming(0);
        }
      }

      girdOverlayTranslateY.value = withTiming(0);
      girdOverlayTranslateX.value = withTiming(0);
    });

  const changeAspectRatio = () => {
    setResizeFull(!resizeFull);
    translationX.value = withTiming(0);
    translationY.value = withTiming(0);
  };

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
      setImage(manipResult);
    } catch (error) {
      console.log("handleCrop", error);
      Alert.alert(
        "Crop error",
        error instanceof Error ? error.message : "Crop image failed"
      );
    }
  };

  const gridCropWidth = resizeFull
    ? cropSize
    : displayWidth > displayHeight
    ? cropSize
    : displayWidth;

  const gridCropHeight = resizeFull
    ? cropSize
    : displayWidth > displayHeight
    ? displayHeight
    : cropSize;

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
            style={[
              styles.cropBox,
              { width: cropSize, height: cropSize },
              girdOverlayStyle,
            ]}
            pointerEvents="none"
          >
            <GridOverlay width={gridCropWidth} height={gridCropHeight} />
          </Animated.View>

          <IconButton
            icon={"resize"}
            mode="contained"
            containerColor="black"
            iconColor="white"
            style={styles.resize}
            onPress={changeAspectRatio}
          />
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

interface GridOverlayProps {
  width: number;
  height: number;
}
const GridOverlay: React.FC<GridOverlayProps> = ({ width, height }) => {
  const spacingLineHorizontal = height / 3;
  const spacingLineVertical = width / 3;

  return (
    <View style={[styles.girdOverlay, { width, height }]}>
      {/* vertial line */}
      <View style={[styles.verticalLine, { left: spacingLineVertical }]} />
      <View style={[styles.verticalLine, { left: spacingLineVertical * 2 }]} />

      {/* horizontal line */}
      <View
        style={[
          styles.horizontalLine,
          { width: width, top: spacingLineHorizontal },
        ]}
      />
      <View
        style={[
          styles.horizontalLine,
          { width: width, top: spacingLineHorizontal * 2 },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  resize: { position: "absolute", bottom: 4, left: 4 },
  girdOverlay: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "red",
  },

  cropBox: {
    position: "absolute",
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CropImageScreen;
