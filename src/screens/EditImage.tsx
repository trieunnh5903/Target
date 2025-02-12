import { StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { Image } from "expo-image";
import { EMOJI_SIZE, GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { useAppDispatch, useCropDimensions, useCropsGesture } from "@/hooks";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  CustomView,
  EmojiList,
  EmojiPicker,
  EmojiSticker,
  IconButtonVertical,
} from "@/components";
import { DraggableTagType, EmojiType } from "@/types";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ViewShot, { captureRef } from "react-native-view-shot";
import { updatePostAsset } from "@/redux/slices/postSlice";
import { useHeaderHeight } from "@react-navigation/elements";
import { EditTagModal, LoadingModal } from "@/components/modal";
import { TextInputProps } from "react-native";
import { DraggableTag } from "@/components/tag";

const EditImage: React.FC<RootStackScreenProps<"EditImage">> = ({
  navigation,
  route,
}) => {
  const { asset, translateOption } = route.params;
  const [tags, setTags] = useState<DraggableTagType[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const translate = useSharedValue({ x: 0, y: 0 });

  const {
    displayHeight,
    displayWidth,
    boundaryTranslateX,
    boundaryTranslateY,
  } = useCropDimensions({
    originalHeight: asset.height,
    originalWidth: asset.width,
  });

  const { gesture, translationX, translationY } = useCropsGesture({
    initialTranslateY: translateOption?.y ?? 0,
    inititalTranslateX: translateOption?.x ?? 0,
    displayHeight,
    boundaryTranslateX,
    boundaryTranslateY,
    onTranslateFinished(x, y) {
      translate.value = { x, y };
    },
  });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const caculateInitialEmojiOffset = () => {
    return {
      offsetX: displayWidth / 2 - translationX.value - EMOJI_SIZE / 2,
      offsetY: displayHeight / 2 - translationY.value - EMOJI_SIZE / 2,
    };
  };

  const showModalTag = () => setTagModalVisible(true);
  const trashIconOffset = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const trashIconRef = useRef<View>(null);
  const trashProgress = useSharedValue(0);
  const isDrag = useSharedValue(false);
  const headerHeight = useHeaderHeight();
  const getTrashIconOffset = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    trashIconOffset.current = {
      x,
      y,
      width,
      height,
    };
  };

  const onCloseEditTagModal = ({
    backgroundColor,
    tagValue,
    textAlign,
    textColor,
    fontSize,
    contentSize,
  }: {
    tagValue: string;
    backgroundColor: string;
    textAlign: TextInputProps["textAlign"];
    textColor: string;
    fontSize: number;
    contentSize: {
      width: number;
      height: number;
    };
  }) => {
    if (tagValue.length > 0) {
      const offsetX = displayWidth / 2 - translationX.value;
      const offsetY = displayHeight / 2 - translationY.value;
      setTags((pre) => [
        ...pre,
        {
          offsetX,
          offsetY,
          value: tagValue,
          id: Date.now(),
          backgroundColor,
          textAlign,
          textColor,
          fontSize,
          contentSize,
        },
      ]);
    }
    hideModal();
  };

  const hideModal = () => setTagModalVisible(false);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<EmojiType[]>([]);
  const [capturing, setCapturing] = useState(false);
  const dispatch = useAppDispatch();
  const viewShotRef = useRef<ViewShot>(null);

  const onAddStickerPres = () => {
    setIsModalVisible(true);
  };

  const onSelectEmoji = (emoji: Omit<EmojiType, "offsetX" | "offsetY">) => {
    const centerOffset = caculateInitialEmojiOffset();
    setPickedEmoji((pre) => [
      ...pre,
      { ...emoji, ...centerOffset, id: Date.now().toString() },
    ]);
  };

  const onEmojiModalClose = () => {
    setIsModalVisible(false);
  };

  const deleteEmoji = (emoji: EmojiType) => {
    setPickedEmoji((pre) => pre.filter((item) => item.id !== emoji.id));
  };

  const handleDeleteTag = (tag: DraggableTagType) => {
    setTags((pre) => pre.filter((item) => item.id !== tag.id));
  };

  const captureImage = async () => {
    try {
      const localUri = await captureRef(viewShotRef, {
        height: asset.height,
        width: asset.width,
        format: "jpg",
      });
      return localUri;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const onNextPress = async () => {
    setCapturing(true);
    try {
      let newAsset = { ...asset };
      if (pickedEmoji.length > 0 || tags.length > 0) {
        const uri = await captureImage();
        newAsset.uri = uri;
      }
      dispatch(
        updatePostAsset({
          assets: newAsset,
          translateOption: translate.value,
        })
      );
      navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setCapturing(false);
    }
  };

  const trashAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isDrag.value ? 1 : 0,
      backgroundColor: trashProgress.value === 0 ? "rgba(0,0,0,0.5)" : "red",
      transform: [
        {
          scale: interpolate(
            trashProgress.value,
            [0, 1],
            [1, 1.1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <CustomView style={[GLOBAL_STYLE.flex_1]}>
      <Animated.View>
        <Animated.View style={[styles.imageArea]}>
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={[
                {
                  width: displayWidth,
                  height: displayHeight,
                },
                animatedImageStyle,
              ]}
            >
              <ViewShot ref={viewShotRef}>
                <CustomView style={[GLOBAL_STYLE.fullSize]}>
                  <Image
                    source={{ uri: asset?.uri }}
                    style={{ width: displayWidth, height: displayHeight }}
                  />
                  {pickedEmoji.map((emoji) => (
                    <EmojiSticker
                      key={emoji.id}
                      emoji={emoji}
                      trashProgress={trashProgress}
                      trashOffset={trashIconOffset.current}
                      isDrag={isDrag}
                      onDelete={deleteEmoji}
                      headerHeight={headerHeight}
                    />
                  ))}
                  {tags.map((tag) => (
                    <DraggableTag
                      key={tag.id}
                      tag={tag}
                      trashProgress={trashProgress}
                      trashOffset={trashIconOffset.current}
                      isDrag={isDrag}
                      headerHeight={headerHeight}
                      onDelete={handleDeleteTag}
                    />
                  ))}
                </CustomView>
              </ViewShot>
            </Animated.View>
          </GestureDetector>

          <Animated.View
            ref={trashIconRef}
            style={[styles.trash, trashAnimatedStyle]}
            onLayout={({ nativeEvent: { layout } }) =>
              getTrashIconOffset(
                layout.x,
                layout.y,
                layout.width,
                layout.height
              )
            }
          >
            <MaterialCommunityIcons name="delete" size={32} color={"white"} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.footer]}>
        <View style={styles.editOptionsContainer}>
          <IconButtonVertical
            onPress={showModalTag}
            icon="format-text"
            iconSize={24}
            label="Text"
          />
          <IconButtonVertical
            onPress={onAddStickerPres}
            icon="sticker-emoji"
            iconSize={24}
            label="Sticker"
          />
        </View>
        <Button
          mode="contained"
          style={styles.nextButton}
          onPress={onNextPress}
        >
          Finished
        </Button>
      </Animated.View>

      <EmojiPicker isVisible={isModalVisible} onClose={onEmojiModalClose}>
        <EmojiList onCloseModal={onEmojiModalClose} onSelect={onSelectEmoji} />
      </EmojiPicker>

      <EditTagModal
        visible={tagModalVisible}
        // onChangeTagInputText={onChangeTagInputText}
        // tagValue={tagValue}
        onClose={onCloseEditTagModal}
      />

      <LoadingModal visible={capturing} loadingContent="Saving" />
    </CustomView>
  );
};

export default EditImage;

const styles = StyleSheet.create({
  footer: {
    flex: 1,
  },
  trash: {
    alignSelf: "center",
    padding: SPACING.small,
    borderRadius: 100,
    position: "absolute",
    bottom: SPACING.medium,
    backgroundColor: "black",
    width: 51,
    height: 51,
  },
  tagInput: {
    color: "black",
    fontWeight: "bold",
  },
  tagContainer: {
    padding: SPACING.small,
    position: "absolute",
    borderRadius: 12,
  },
  tagModal: {
    width: SCREEN_WIDTH,
    flex: 1,
    ...GLOBAL_STYLE.center,
  },
  nextButton: { alignSelf: "flex-end", margin: SPACING.medium },
  editOptionsContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    padding: SPACING.medium,
    flexDirection: "row",
    gap: SPACING.large,
  },
  imageArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    ...GLOBAL_STYLE.center,
    overflow: "hidden",
  },
});
