import { CustomView, ImageCropper } from "@/components";
import { CROP_SIZE, GLOBAL_STYLE, SCREEN_WIDTH } from "@/constants";
import { useCropDimensions, useCropsGesture } from "@/hooks";
import { RootStackScreenProps } from "@/types/navigation";
import { generateImageCropOptions } from "@/utils";
import { Image } from "expo-image";
import {
  ImageResult,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";
import { Asset } from "expo-media-library";
import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert, Modal } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Menu,
  Text,
} from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";

const IMAGE_AREA_SIZE = SCREEN_WIDTH - 100;
const SNAP_INTERVAL =
  IMAGE_AREA_SIZE + 30 - (SCREEN_WIDTH - IMAGE_AREA_SIZE - 24) / 2;
const CropImageScreen: React.FC<RootStackScreenProps<"EditImage">> = ({
  route,
}) => {
  const { assets: assetsParam, imageOption } = route.params;
  const [resizeFull, setResizeFull] = useState(imageOption?.resizeFull ?? true);
  const [assets, setAssets] = useState(assetsParam);
  const [isCropping, setIsCropping] = useState(false);
  const [imageCropped, setImageCropped] = useState<ImageResult[]>([]);

  const {
    boundaryTranslateX,
    boundaryTranslateY,
    displayHeight,
    displayWidth,
    gridHeight,
    gridWidth,
  } = useCropDimensions({
    originalHeight: assets[0].height,
    originalWidth: assets[0].width,
    resizeFull,
  });

  const {
    gesture,
    gridOpacity,
    gridTranslateX,
    gridTranslateY,
    translationX,
    resetGesture,
    translationY,
  } = useCropsGesture({
    boundaryTranslateX,
    boundaryTranslateY,
    displayHeight,
    resizeFull,
    initTranslateX: imageOption?.translateX,
    initTranslateY: imageOption?.translateY,
  });

  const onResizePress = () => {
    setResizeFull(!resizeFull);
    resetGesture();
  };

  const onDeletePress = (asset: Asset) => {
    setAssets((pre) => pre.filter((item) => item.id !== asset.id));
  };

  const cropSingleImage = async () => {
    const cropOptions = generateImageCropOptions({
      displayCropSize: SCREEN_WIDTH,
      originalHeight: assets[0].height,
      originalWidth: assets[0].width,
      displayHeight: displayHeight,
      displayWidth: displayWidth,
      translationX,
      translationY,
    });
    try {
      setIsCropping(true);
      const manipResult = await manipulateAsync(
        assets[0].uri,
        [
          { crop: cropOptions },
          { resize: { width: Math.min(1080, assets[0].width) } },
        ],
        { compress: 1, format: SaveFormat.JPEG, base64: false }
      );
      setImageCropped([manipResult]);
      showModal();
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

  const cropMultipleImage = async () => {
    const generateCropOptions = (asset: Asset) => {
      // square
      const scaleFactor = asset.width / IMAGE_AREA_SIZE;
      const originY =
        (IMAGE_AREA_SIZE / (asset.width / asset.height) - IMAGE_AREA_SIZE) / 2;
      return {
        originX: 0,
        originY: originY * scaleFactor,
        width: IMAGE_AREA_SIZE * scaleFactor,
        height: IMAGE_AREA_SIZE * scaleFactor,
      };
    };
    try {
      setIsCropping(true);
      const result = await Promise.all(
        assets.map((asset) =>
          manipulateAsync(
            asset.uri,
            [
              {
                crop: generateCropOptions(asset),
              },
              { resize: { width: Math.min(1080, asset.width) } },
            ],
            { compress: 1, format: SaveFormat.JPEG, base64: false }
          )
        )
      );
      setImageCropped(result);
      showModal();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCropping(false);
    }

    // const cropOptions = generateImageCropOptions({
    //   displayCropSize: IMAGE_AREA_SIZE,
    //   originalHeight: assets[0].height,
    //   originalWidth: assets[0].width,
    //   displayHeight: displayHeight,
    //   displayWidth: displayWidth,
    //   translationX,
    //   translationY,
    // });
  };

  const handleCrop = async () => {
    if (assets.length === 1) {
      cropSingleImage();
    } else if (assets.length > 1) {
      cropMultipleImage();
    }
  };
  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  return (
    <View style={styles.container}>
      <View style={[GLOBAL_STYLE.flex_1]}>
        {assets && assets.length === 1 && (
          <ImageCropper
            displayHeight={displayHeight}
            displayWidth={displayWidth}
            gesture={gesture}
            gridHeight={gridHeight}
            gridOpacity={gridOpacity}
            gridTranslateX={gridTranslateX}
            gridTranslateY={gridTranslateY}
            gridWidth={gridWidth}
            uri={assets[0].uri}
            onResizePress={onResizePress}
            translationX={translationX}
            translationY={translationY}
            borderRadius={16}
          />
        )}
        {assets && assets.length > 1 && (
          <Carousel assets={assets} onDeleteImagePress={onDeletePress} />
        )}
      </View>

      <CustomView paddingRight={12}>
        <Button
          icon={"arrow-right"}
          style={{ alignSelf: "flex-end" }}
          contentStyle={{ flexDirection: "row-reverse" }}
          mode="contained"
          onPress={handleCrop}
        >
          Next
        </Button>
      </CustomView>

      <Modal animationType="slide" visible={visible}>
        <View>
          <IconButton icon={"close"} onPress={hideModal} iconColor="black" />
          <ScrollView horizontal>
            {imageCropped.map((item) => (
              <View
                key={item.uri}
                style={{
                  flexDirection: "row",
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: SCREEN_WIDTH,
                    aspectRatio: item.width / item.height,
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={isCropping}>
        <View
          style={[
            GLOBAL_STYLE.flex_1,
            GLOBAL_STYLE.center,
            { backgroundColor: "rgba(0,0,0,0.3)" },
          ]}
        >
          <CustomView style={styles.modalLoadingContainer}>
            <ActivityIndicator />
            <Text>Loading</Text>
          </CustomView>
        </View>
      </Modal>
    </View>
  );
};

interface CarouselProps {
  assets: Asset[];
  onDeleteImagePress: (image: Asset) => void;
}
type ImageType = "square" | "horizontal" | "vertical";
const Carousel: React.FC<CarouselProps> = ({ assets, onDeleteImagePress }) => {
  const [resizeMenuVisible, setResizeMenuVisible] = React.useState(false);
  const [selectedType, setSelectedType] = useState<ImageType>("square");
  const openResizeMenu = () => setResizeMenuVisible(true);
  const closeResizeMenu = () => setResizeMenuVisible(false);
  const type = useMemo(() => {
    const { width, height } = assets[0];
    if (width === height) return "square";
    if (width > height) return "horizontal";
    if (width < height) return "vertical";
  }, [assets]);

  const handleMenuPress = (type: ImageType) => {
    setSelectedType(type);
    setResizeMenuVisible(false);
  };

  const imageWidth = useMemo(() => {
    switch (selectedType) {
      case "horizontal":
        return IMAGE_AREA_SIZE;
      case "vertical":
        return (4 / 5) * IMAGE_AREA_SIZE;
      default:
        return IMAGE_AREA_SIZE;
    }
  }, [selectedType]);

  const imageHeight = useMemo(() => {
    switch (selectedType) {
      case "vertical":
        return IMAGE_AREA_SIZE;
      case "horizontal":
        return IMAGE_AREA_SIZE / (assets[0].width / assets[0].height);
      default:
        return IMAGE_AREA_SIZE;
    }
  }, [assets, selectedType]);

  return (
    <>
      <View style={{ height: IMAGE_AREA_SIZE }}>
        <ScrollView
          horizontal
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 30,
          }}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate={"normal"}
        >
          <Animated.View style={styles.gridContainer}>
            {assets.map((item) => (
              <Animated.View
                key={item.id}
                layout={LinearTransition}
                style={[styles.imageArea]}
              >
                <Animated.View
                  style={{ width: imageWidth, height: imageHeight }}
                >
                  <Image source={item.uri} style={styles.image} />
                  <IconButton
                    icon={"close"}
                    mode="contained-tonal"
                    size={14}
                    containerColor="black"
                    iconColor="white"
                    style={styles.close}
                    onPress={() => onDeleteImagePress(item)}
                  />
                </Animated.View>
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      </View>

      {type !== "square" && (
        <Menu
          visible={resizeMenuVisible}
          onDismiss={closeResizeMenu}
          anchorPosition="top"
          contentStyle={{ borderRadius: 16 }}
          theme={{ colors: { elevation: { level2: "white" } } }}
          anchor={
            <IconButton
              icon={"resize"}
              mode="contained"
              containerColor="black"
              iconColor="white"
              style={styles.resize}
              onPress={openResizeMenu}
            />
          }
        >
          <Menu.Item
            leadingIcon={"crop-square"}
            onPress={() => handleMenuPress("square")}
            title="Square"
            trailingIcon={selectedType === "square" ? "check" : undefined}
          />
          {type === "horizontal" && (
            <Menu.Item
              leadingIcon={"crop-landscape"}
              onPress={() => handleMenuPress("horizontal")}
              title="Horizontal"
              trailingIcon={selectedType === "horizontal" ? "check" : undefined}
            />
          )}
          {type === "vertical" && (
            <Menu.Item
              leadingIcon={"crop-portrait"}
              onPress={() => handleMenuPress("vertical")}
              title="Vertical"
              trailingIcon={selectedType === "vertical" ? "check" : undefined}
            />
          )}
        </Menu>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  modalLoadingContainer: {
    ...GLOBAL_STYLE.rowCenter,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  close: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  image: {
    ...GLOBAL_STYLE.fullSize,
    borderRadius: 16,
  },
  gridContainer: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "flex-start",
  },
  previewEntry: {
    width: IMAGE_AREA_SIZE,
    height: IMAGE_AREA_SIZE,
  },
  resize: { marginTop: -20, marginLeft: 15 },
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
    justifyContent: "center",
    alignItems: "center",
    height: IMAGE_AREA_SIZE,
  },

  cropBox: {
    position: "absolute",
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CropImageScreen;
