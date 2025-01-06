import {
  Alert,
  Dimensions,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { RootStackScreenProps } from "@/types/navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomView, GridCrop } from "@/components";
import {
  CROP_SIZE,
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
// import * as NavigationBar from "expo-navigation-bar";
import * as MediaLibrary from "expo-media-library";
import { ActivityIndicator, Modal, Portal, Text } from "react-native-paper";

const CameraScreen: React.FC<RootStackScreenProps<"CameraScreen">> = ({
  navigation,
  route,
}) => {
  const newestImage = route.params.newestImage;
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState<FlashMode>("off");
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const focused = useIsFocused();
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (permission && !permission.granted) {
          const { canAskAgain } = await requestPermission();
          if (!canAskAgain) {
            Alert.alert(
              "Permission Blocked",
              "Camera permission is blocked. Please enable it in the app settings.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: handleGoBack,
                },
                {
                  text: "Open Settings",
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ]
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [handleGoBack, permission, requestPermission]);

  const onFlashPress = () => {
    switch (flash) {
      case "off":
        setFlash("on");
        break;

      case "on":
        setFlash("auto");
        break;

      default:
        setFlash("off");
        break;
    }
  };

  const onCapture = async () => {
    if (cameraRef.current && isCameraReady) {
      setCapturing(true);
      try {
        console.log("onCapture");
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
        });

        console.log("onCapture", photo);

        if (!photo) return;
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        navigation.navigate("CreatePost", {
          assets: [asset],
          translateAssets: {},
        });
      } catch (error) {
        console.log("Error taking picture:", error);
      } finally {
        setCapturing(false);
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (!permission || !permission.granted) {
    return <View />;
  }

  return (
    <View style={[GLOBAL_STYLE.flex_1]}>
      <StatusBar backgroundColor={"transparent"} barStyle={"default"} />

      <CameraView
        flash={flash}
        animateShutter={false}
        onCameraReady={() => setIsCameraReady(true)}
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={[styles.overlay]}>
          <Pressable style={styles.close} onPress={handleGoBack}>
            <MaterialCommunityIcons name="close" size={32} color="white" />
          </Pressable>

          <Pressable style={[styles.flash]} onPress={onFlashPress}>
            <MaterialCommunityIcons
              name={
                flash === "on"
                  ? "flash"
                  : flash === "off"
                  ? "flash-off"
                  : "flash-auto"
              }
              size={32}
              color="white"
            />
          </Pressable>
        </View>

        <View pointerEvents="none" style={styles.gridContainer}>
          <GridCrop style={styles.gridCrop} />
        </View>

        <View style={[styles.controlsContainer, styles.overlay]}>
          <Pressable onPress={handleGoBack}>
            <Image
              source={{ uri: newestImage.uri }}
              style={styles.newestImage}
            />
          </Pressable>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.captureButton}
            onPress={onCapture}
          />
          <Pressable onPress={toggleCameraFacing}>
            <MaterialCommunityIcons
              name="rotate-3d-variant"
              size={32}
              color="white"
            />
          </Pressable>
        </View>
      </CameraView>

      <Portal>
        <Modal dismissable={false} visible={capturing}>
          <CustomView style={styles.modalContent}>
            <ActivityIndicator />
            <Text>Loading</Text>
          </CustomView>
        </Modal>
      </Portal>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  modalContent: {
    alignSelf: "center",
    padding: SPACING.medium,
    gap: SPACING.small,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  camera: {
    flex: 1,
  },
  focusIndicator: {
    position: "absolute",

    borderWidth: 2,
    borderColor: "#fff",
  },

  flash: {
    marginTop: StatusBar.currentHeight,
    padding: 20,
  },

  close: {
    padding: 20,
    marginTop: StatusBar.currentHeight,
  },

  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  gridContainer: {
    width: Dimensions.get("window").width,
    aspectRatio: 1,
  },
  gridCrop: { borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" },
  newestImage: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  controlsContainer: {
    padding: 20,
    alignItems: "flex-end",
  },

  overlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
    height: (SCREEN_HEIGHT - CROP_SIZE) / 2,
    width: SCREEN_WIDTH,
  },

  controlsTop: {
    top: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
