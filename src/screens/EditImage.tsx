import { CustomView, ImageCropper } from "@/components";
import { CROP_SIZE, GLOBAL_STYLE } from "@/constants";
import { useCropDimensions, useCropsGesture } from "@/hooks";
import { RootStackScreenProps } from "@/types/navigation";
import {
  ImageResult,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";
import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, Modal } from "react-native";
import { Button, IconButton } from "react-native-paper";

const CropImageScreen: React.FC<RootStackScreenProps<"EditImage">> = ({
  route,
}) => {
  const {
    asset: {
      uri: imageUri,
      width: originalWidth = CROP_SIZE,
      height: originalHeight = CROP_SIZE,
    },
  } = route.params;

  const [image, setImage] = useState<ImageResult | null>(null);
  const [resizeFull, setResizeFull] = useState(true);
  const [isCropping, setIsCropping] = useState(false);

  const {
    displayHeight,
    displayWidth,
    gridHeight,
    gridWidth,
    boundaryTranslateX,
    boundaryTranslateY,
  } = useCropDimensions({
    resizeFull,
    originalHeight,
    originalWidth,
  });

  const {
    gesture,
    gridOpacity,
    gridTranslateX,
    gridTranslateY,
    resetGesture,
    translationX,
    translationY,
  } = useCropsGesture({
    displayHeight,
    boundaryTranslateX,
    boundaryTranslateY,
    resizeFull,
  });

  const handleResize = () => {
    setResizeFull(!resizeFull);
    resetGesture();
  };

  const generateCropOption = () => {
    const cropXDisplay =
      displayWidth > CROP_SIZE ? boundaryTranslateX - translationX.value : 0;

    const cropYDisplay =
      displayHeight > CROP_SIZE ? boundaryTranslateY - translationY.value : 0;

    const scale = originalWidth / displayWidth;
    const cropXOriginal = cropXDisplay * scale;
    const cropYOriginal = cropYDisplay * scale;
    const cropWidthOriginal = Math.min(displayWidth, CROP_SIZE) * scale;
    const cropHeightOriginal = Math.min(displayHeight, CROP_SIZE) * scale;

    return {
      height: Math.min(cropHeightOriginal, originalHeight),
      originX: cropXOriginal,
      originY: cropYOriginal,
      width: Math.min(cropWidthOriginal, originalWidth),
    };
  };

  const handleCrop = async () => {
    if (!imageUri || isCropping) return;
    const cropOption = generateCropOption();
    try {
      setIsCropping(true);
      const manipResult = await manipulateAsync(
        imageUri,
        [
          {
            crop: cropOption,
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
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
        {imageUri && (
          <ImageCropper
            displayHeight={displayHeight}
            displayWidth={displayWidth}
            gesture={gesture}
            gridHeight={gridHeight}
            gridOpacity={gridOpacity}
            gridTranslateX={gridTranslateX}
            gridTranslateY={gridTranslateY}
            gridWidth={gridWidth}
            uri={imageUri}
            onResizePress={handleResize}
            translationX={translationX}
            translationY={translationY}
          />
        )}
      </View>

      <CustomView padding={16}>
        <Button mode="contained" loading={isCropping} onPress={handleCrop}>
          Next
        </Button>
      </CustomView>

      <Modal animationType="slide" visible={!!image}>
        <View>
          <IconButton
            icon={"close"}
            onPress={() => setImage(null)}
            iconColor="black"
          />

          {image && (
            <View
              style={{
                width: CROP_SIZE,
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: image.uri }}
                width={CROP_SIZE}
                height={CROP_SIZE}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  resize: { position: "absolute", bottom: 4, left: 4 },
  girdOverlay: {
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
    width: CROP_SIZE,
    height: CROP_SIZE,
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
