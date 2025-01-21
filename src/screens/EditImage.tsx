import { StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { Image } from "expo-image";
import {
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";
import { useCropDimensions, useCropsGesture, useKeyboardHeight } from "@/hooks";
import {
  GestureDetector,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native-gesture-handler";
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
  IconButtonVertical,
} from "@/components";
import DraggableTag from "@/components/Tag/DraggableTag";
import { DraggableTagType } from "@/types";
import { Button, Modal, Portal, Text } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TagColors, useAppTheme } from "@/config/theme";
import Slider from "@react-native-community/slider";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
const EditImage: React.FC<RootStackScreenProps<"EditImage">> = ({
  navigation,
  route,
}) => {
  const asset = route.params;
  const [tags, setTags] = useState<DraggableTagType[]>([]);
  // const [tagModalVisible, setTagModalVisible] = useState(false);
  // const [tagValue, setTagValue] = useState<string>("");
  // const tagInputRef = useRef<TextInput>(null);
  const theme = useAppTheme();

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
    displayHeight,
    boundaryTranslateX,
    boundaryTranslateY,
    // onTranslateFinished(x, y) {
    //   if (!previewAsset) return;
    //   if (!multipleSelect) {
    //     translateSelectedAssets.value = { [previewAsset.id]: { x, y } };
    //   } else {
    //     const existed = selectedAsset?.some(
    //       (item) => item.id === previewAsset?.id
    //     );
    //     if (existed) {
    //       addTranslatedAsset(previewAsset.id, x, y);
    //     } else if (selectedAsset?.length === 0) {
    //       translateSelectedAssets.value = { [previewAsset.id]: { x, y } };
    //     }
    //   }
    // },
  });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  // useEffect(() => {
  //   const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
  //     if (tagValue.length > 0) {
  //       const offsetX = displayWidth / 2 - translationX.value;
  //       const offsetY = displayHeight / 2 - translationY.value;
  //       setTags((pre) => [
  //         ...pre,
  //         {
  //           offsetX,
  //           offsetY,
  //           value: tagValue,
  //           id: Date.now(),
  //         },
  //       ]);
  //       clearTagValue();
  //     }
  //     // hideModalTag();
  //   });
  //   return () => {
  //     hideSubscription.remove();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [displayHeight, displayWidth, tagValue]);

  // const clearTagValue = () => setTagValue("");
  // const showModalTag = () => setTagModalVisible(true);
  // const hideModalTag = () => setTagModalVisible(false);
  const trashIconOffset = useRef({ x: 0, y: 0 });
  const trashIconRef = useRef<View>(null);
  const trashProgress = useSharedValue(0);
  const isDrag = useSharedValue(-1);
  const getTrashIconOffset = (x: number, y: number) => {
    trashIconOffset.current = {
      x,
      y,
    };
  };

  const trashAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isDrag.value, [-1, 0], [0, 1], Extrapolation.CLAMP),
      borderColor:
        trashProgress.value === 0
          ? theme.colors.outline
          : theme.colors.surfaceVariant,
      backgroundColor:
        trashProgress.value === 0
          ? theme.colors.background
          : theme.colors.surfaceVariant,
      transform: [
        {
          scale: interpolate(
            trashProgress.value,
            [0, 1],
            [1, 1.2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const trashIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      color:
        trashProgress.value === 0
          ? theme.colors.onSurfaceVariant
          : theme.colors.primary,
    };
  });

  const footerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isDrag.value, [-1, 0], [1, 0], Extrapolation.CLAMP),
    };
  });

  const imageAreaAnimatedStyle = useAnimatedStyle(() => {
    return { overflow: isDrag.value === 0 ? "visible" : "hidden" };
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const onAddSticker = () => {
    console.log("sadsad");

    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };
  return (
    <CustomView style={[GLOBAL_STYLE.flex_1]}>
      <CustomView style={[{ flex: 0.1 }, GLOBAL_STYLE.fullWidth]}></CustomView>
      <Animated.View style={imageAreaAnimatedStyle}>
        <CustomView style={styles.imageArea}>
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={[
                { width: displayWidth, height: displayHeight },
                animatedImageStyle,
              ]}
            >
              <CustomView style={GLOBAL_STYLE.fullSize}>
                <Image
                  source={{ uri: asset?.uri }}
                  style={GLOBAL_STYLE.fullSize}
                />
              </CustomView>
            </Animated.View>
          </GestureDetector>
        </CustomView>

        {/* {tags.map((tag) => (
          <DraggableTag
            key={tag.value}
            tag={tag}
            trashProgress={trashProgress}
            trashOffset={trashIconOffset.current}
            onDeleteTag={(tag) => {
              console.log(tag.id);
            }}
            isDrag={isDrag}
          />
        ))} */}
        <Animated.View
          ref={trashIconRef}
          style={[styles.trash, trashAnimatedStyle]}
          onLayout={(event) =>
            getTrashIconOffset(
              event.nativeEvent.layout.x,
              event.nativeEvent.layout.y
            )
          }
        >
          <AnimatedIcon
            name="delete"
            size={32}
            style={trashIconAnimatedStyle}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <View style={styles.editOptionsContainer}>
          <IconButtonVertical
            onPress={onAddSticker}
            icon="sticker-emoji"
            iconSize={24}
            label="Sticker"
          />
        </View>
        <Button
          mode="contained"
          icon={"arrow-right"}
          contentStyle={{ flexDirection: "row-reverse" }}
          style={styles.nextButton}
        >
          Next
        </Button>
      </Animated.View>
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        {/* A list of emoji component will go here */}
        <EmojiList onCloseModal={onModalClose} />
      </EmojiPicker>
      {/* <TagModal
        tagModalVisible={tagModalVisible}
        tagValue={tagValue}
        setTagValue={setTagValue}
        tagInputRef={tagInputRef}
      /> */}
    </CustomView>
  );
};

// const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
// interface TagModalProps {
//   tagModalVisible: boolean;
//   tagValue: string;
//   setTagValue: (value: string) => void;
//   tagInputRef: React.RefObject<TextInput>;
// }
// const TagModal: React.FC<TagModalProps> = ({
//   setTagValue,
//   tagInputRef,
//   tagModalVisible,
//   tagValue,
// }) => {
//   const tagColors = useMemo(() => TagColors, []);
//   const { keyboardHeight } = useKeyboardHeight();
//   const [backgroundColor, setBackgroundColor] = useState(tagColors[0]);
//   const textColor = useMemo(() => {
//     const r = parseInt(backgroundColor.slice(1, 3), 16);
//     const g = parseInt(backgroundColor.slice(3, 5), 16);
//     const b = parseInt(backgroundColor.slice(5, 7), 16);
//     const brightness = (r * 299 + g * 587 + b * 114) / 1000;
//     return brightness > 128 ? "#000000" : "#FFFFFF";
//   }, [backgroundColor]);

//   const fontSizeSharedValue = useSharedValue(16);
//   const fontSizeAnimatedStyle = useAnimatedStyle(() => ({
//     fontSize: fontSizeSharedValue.value,
//   }));
//   return (
//     <Portal>
//       <Modal
//         dismissable={false}
//         theme={{ colors: { backdrop: "rgba(0,0,0,0.9)" } }}
//         visible={tagModalVisible}
//         style={{ flex: 1 }}
//       >
//         <Slider
//           style={{
//             width: (SCREEN_HEIGHT - keyboardHeight) / 2,
//             height: 40,
//             position: "absolute",
//             transform: [{ rotate: "-90deg" }],
//             transformOrigin: "40px 40px",
//           }}
//           onValueChange={(value) => {
//             console.log(value);
//             fontSizeSharedValue.value = value;
//           }}
//           minimumValue={12}
//           maximumValue={46}
//           thumbTintColor={"#FFFFFF"}
//           minimumTrackTintColor="#FFFFFF"
//           maximumTrackTintColor="#f0f0f0"
//         />
//         <View
//           style={[styles.tagModal, { height: SCREEN_HEIGHT - keyboardHeight }]}
//         >
//           <Animated.View style={[styles.tagContainer, { backgroundColor }]}>
//             <AnimatedTextInput
//               ref={tagInputRef}
//               autoFocus
//               onChangeText={setTagValue}
//               value={tagValue}
//               style={[
//                 styles.tagInput,
//                 { color: textColor },
//                 fontSizeAnimatedStyle,
//               ]}
//             />
//             {/* <Animated.Text
//               style={[
//                 styles.tagInput,
//                 { color: textColor },
//                 fontSizeAnimatedStyle,
//               ]}
//             >
//               dsadasd
//             </Animated.Text> */}
//           </Animated.View>

//           <View
//             style={{
//               position: "absolute",
//               bottom: SPACING.large,
//               left: 0,
//               right: 0,
//             }}
//           >
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={{
//                 padding: SPACING.small,
//                 gap: SPACING.large,
//               }}
//             >
//               {tagColors.map((color) => (
//                 <Pressable
//                   key={color}
//                   onPress={() => setBackgroundColor(color)}
//                 >
//                   <View
//                     style={{
//                       backgroundColor: color,
//                       width: 20,
//                       height: 20,
//                       borderRadius: 20,
//                       borderWidth: 1,
//                       borderColor: "white",
//                       transform: [
//                         { scale: backgroundColor === color ? 1.3 : 1 },
//                       ],
//                     }}
//                   />
//                 </Pressable>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </Portal>
//   );
// };

export default EditImage;

const styles = StyleSheet.create({
  footer: {
    flex: 1,
  },
  trash: {
    alignSelf: "center",
    marginTop: SPACING.medium,
    padding: SPACING.small,
    borderRadius: 100,
    borderWidth: 1,
    position: "absolute",
    top: SCREEN_WIDTH,
  },
  tagInput: {
    color: "black",
    fontWeight: "bold",
    // textAlign: "center",
  },
  tagContainer: {
    alignSelf: "center",
    padding: SPACING.small,
    borderRadius: 12,
  },
  tagModal: {
    width: SCREEN_WIDTH,
    ...GLOBAL_STYLE.center,
  },
  nextButton: { alignSelf: "flex-end", margin: SPACING.medium },
  editOptionsContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    padding: SPACING.medium,
    flexDirection: "row",
    gap: SPACING.medium,
  },
  imageArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    ...GLOBAL_STYLE.center,
    overflow: "hidden",
  },
});
