import { Keyboard, ListRenderItem, StyleSheet } from "react-native";
import React, { useLayoutEffect, useRef, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { Asset } from "expo-media-library";
import { CustomView } from "@/components";
import { Image } from "expo-image";
import {
  GLOBAL_STYLE,
  POST_IMAGE_SIZE,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { deleteAsset, sendPostRequest } from "@/redux/slices/postSlice";
import { useBackHandler } from "@react-native-community/hooks";

interface ImageEntryProps {
  asset: Asset;
  translateOption:
    | {
        x: number;
        y: number;
      }
    | undefined;
  onDeletePress: (assetId: string) => void;
  onEditImagePress: (asset: Asset) => void;
}

const ImageEntry: React.FC<ImageEntryProps> = ({
  asset,
  translateOption,
  onDeletePress,
  onEditImagePress,
}) => {
  const aspectRatio = asset.width / asset.height;
  const displayWidth =
    asset.width < asset.height
      ? POST_IMAGE_SIZE
      : aspectRatio * POST_IMAGE_SIZE;
  const displayHeight = displayWidth / aspectRatio;

  const scaleFactor = SCREEN_WIDTH / POST_IMAGE_SIZE;
  const translateX = (translateOption?.x ?? 0) / scaleFactor;
  const translateY = (translateOption?.y ?? 0) / scaleFactor;

  return (
    <Animated.View exiting={FadeOut} style={styles.imageContainer}>
      <Image
        source={asset.uri}
        style={{
          width: displayWidth,
          height: displayHeight,
          transform: [{ translateX }, { translateY }],
        }}
      />

      <IconButton
        icon={"image-edit"}
        containerColor="black"
        iconColor="white"
        style={{ position: "absolute", top: 0, left: 0 }}
        size={20}
        onPress={() => onEditImagePress(asset)}
      />

      <IconButton
        size={20}
        icon={"delete"}
        containerColor="black"
        iconColor="white"
        style={{ position: "absolute", top: 0, right: 0 }}
        onPress={() => onDeletePress(asset.id)}
      />
    </Animated.View>
  );
};

const CreatePostScreen: React.FC<RootStackScreenProps<"CreatePost">> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [caption, setCaption] = useState("");
  const {
    posting,
    assets,
    translateAssetOptions: translateAssets,
  } = useAppSelector((state) => state.posts);
  const listRef = useRef<FlatList<any>>(null);

  useLayoutEffect(() => {
    const onSendPress = async () => {
      Keyboard.dismiss();
      if (!assets) return;
      dispatch(sendPostRequest({ assets, caption, translateAssets }));
      navigation.navigate("Tabs", { screen: "Home" });
    };

    navigation.setOptions({
      headerRight() {
        return (
          <Button
            mode="contained"
            disabled={!caption && assets?.length === 0}
            onPress={onSendPress}
          >
            Post
          </Button>
        );
      },
    });
    return () => {};
  }, [assets, caption, dispatch, navigation, translateAssets]);

  const handleDeleteAsset = (assetId: string) => {
    if (assets?.length === 1) {
      navigation.goBack();
    }
    const index = assets?.findIndex((item) => item.id === assetId);
    if (index && assets?.length && assets.length - index === 1) {
      listRef.current?.scrollToEnd();
    }
    dispatch(deleteAsset({ assetId }));
  };

  useBackHandler(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  });

  const handleEditImage = (asset: Asset) => {
    navigation.navigate("EditImage", {
      asset,
      translateOption: translateAssets[asset.id],
    });
  };

  const renderItem: ListRenderItem<Asset> = ({ index, item }) => {
    return (
      <ImageEntry
        onEditImagePress={handleEditImage}
        asset={item}
        translateOption={translateAssets[item.id]}
        onDeletePress={handleDeleteAsset}
      />
    );
  };

  if (!assets) return null;
  return (
    <CustomView style={GLOBAL_STYLE.flex_1}>
      {assets.length > 0 && (
        <CustomView>
          <Animated.FlatList
            ref={listRef}
            data={assets}
            horizontal
            contentContainerStyle={{
              padding: SPACING.medium,
              gap: SPACING.medium,
            }}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            getItemLayout={(data, index) => ({
              length: POST_IMAGE_SIZE + SPACING.medium,
              offset: (POST_IMAGE_SIZE + SPACING.medium) * index,
              index,
            })}
          />
        </CustomView>
      )}
      <CustomView
        style={[GLOBAL_STYLE.flex_1]}
        padding={SPACING.medium}
        paddingTop={0}
      >
        <TextInput
          style={[GLOBAL_STYLE.flex_1]}
          multiline
          textAlignVertical="top"
          placeholder="What are you thinking?"
          onChangeText={setCaption}
        />
      </CustomView>
      <Portal>
        <Modal dismissable={false} visible={posting === "loading"}>
          <CustomView style={styles.posting}>
            <ActivityIndicator />
            <Text>Posting</Text>
          </CustomView>
        </Modal>
      </Portal>
    </CustomView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  posting: {
    alignSelf: "center",
    padding: SPACING.medium,
    gap: SPACING.small,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: POST_IMAGE_SIZE,
    height: POST_IMAGE_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});
