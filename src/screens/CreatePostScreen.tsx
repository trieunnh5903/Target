import { ListRenderItem, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Asset } from "expo-media-library";
import { CustomView } from "@/components";
import { Image } from "expo-image";
import {
  GLOBAL_STYLE,
  POST_IMAGE_SIZE,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";

interface ImageEntryProps {
  asset: Asset;
  translateOption:
    | {
        x: number;
        y: number;
      }
    | undefined;
}

const ImageEntry: React.FC<ImageEntryProps> = ({ asset, translateOption }) => {
  const aspectRatio = asset.width / asset.height;
  const displayWidth =
    asset.width < asset.height ? POST_IMAGE_SIZE : aspectRatio * POST_IMAGE_SIZE;
  const displayHeight = displayWidth / aspectRatio;

  const scaleFactor = SCREEN_WIDTH / POST_IMAGE_SIZE;
  const translateX = (translateOption?.x ?? 0) / scaleFactor;
  const translateY = (translateOption?.y ?? 0) / scaleFactor;
  return (
    <CustomView
      style={{
        width: POST_IMAGE_SIZE,
        height: POST_IMAGE_SIZE,
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={asset.uri}
        style={{
          width: displayWidth,
          height: displayHeight,
          transform: [{ translateX }, { translateY }],
        }}
      />
    </CustomView>
  );
};

const CreatePostScreen: React.FC<RootStackScreenProps<"CreatePost">> = ({
  navigation,
  route,
}) => {
  const { assets: assetsParam, translateAssets } = route.params;
  const [assets, setAssets] = useState(assetsParam);
  console.log("CreatePostScreen", assets);

  const renderItem: ListRenderItem<Asset> = ({ index, item }) => {
    return (
      <ImageEntry asset={item} translateOption={translateAssets[item.id]} />
    );
  };
  return (
    <CustomView style={GLOBAL_STYLE.flex_1}>
      <View>
        <Animated.FlatList
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
          itemLayoutAnimation={LinearTransition}
          snapToInterval={POST_IMAGE_SIZE + SPACING.medium}
          snapToAlignment={"center"}
          decelerationRate={"fast"}
        />
      </View>
      <Text>CreatePostScreen</Text>
    </CustomView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({});
