import {
  ActivityIndicator,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { Button, IconButton } from "react-native-paper";
import { RootTabScreenProps } from "@/types/navigation";
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import {
  CROP_SIZE,
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "@/constants";
import { useIsFocused } from "@react-navigation/native";
import { CustomView, ImageCropper } from "@/components";
interface ImageItemProps {
  uri: string;
  size: number;
  onPress: () => void;
}

const ImageItem: React.FC<ImageItemProps> = memo(function ImageItem({
  uri,
  size,
  onPress,
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.imageWrapper]}>
        <Image
          source={{ uri: uri }}
          style={[styles.image, { width: size, height: size }]}
        />
      </View>
    </TouchableOpacity>
  );
});

const HEADER_LIST_HEIGHT = 50;
const CreatePostScreen: React.FC<RootTabScreenProps<"Create">> = ({
  navigation,
}) => {
  const [media, setMedia] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<
    MediaLibrary.AssetRef | undefined
  >();
  const dimension = useWindowDimensions();
  const imageSize = dimension.width / 4;
  const ITEMS_PER_PAGE = useMemo(
    () => Math.floor((SCREEN_HEIGHT / (SCREEN_WIDTH / 4)) * 4 * 2),
    []
  );
  const scrollY = useSharedValue(0);
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset>(
    media[0]
  );
  const isFocused = useIsFocused();
  const loadImages = useCallback(
    async (after: MediaLibrary.AssetRef | undefined = undefined) => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status === "granted") {
          const {
            assets,
            endCursor: newEndCursor,
            hasNextPage,
          } = await MediaLibrary.getAssetsAsync({
            mediaType: "photo",
            sortBy: ["creationTime"],
            first: ITEMS_PER_PAGE,
            after: after,
          });

          if (after) {
            setMedia((prevMedia) => [...prevMedia, ...assets]);
          } else {
            setMedia(assets);
          }

          setEndCursor(newEndCursor);
          setHasMore(hasNextPage);
        }
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [ITEMS_PER_PAGE]
  );

  useEffect(() => {
    if (media.length > 0 && !selectedAsset) {
      setSelectedAsset(media[0]);
    }
    return () => {};
  }, [media, selectedAsset]);

  useLayoutEffect(() => {
    const onNextPress = async () => {
      console.log(
        boundaryImagePreviewX.current,
        boundaryImagePreviewY.current,
        displayImagePreviewHeight.current,
        displayImagePreviewWidth.current
      );
    };

    navigation.setOptions({
      headerRight: () => {
        return <Button onPress={onNextPress}>Next</Button>;
      },
      headerShown: true,
    });
    return () => {};
  }, [media, navigation]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      await loadImages(endCursor);
    }
  };

  const handleImagePress = (image: MediaLibrary.Asset, index: number) => {
    setSelectedAsset({ ...image });
    const remainingOffset = contentHeight.value - scrollY.value;
    isBeginDrag.value = false;

    // last page
    if (remainingOffset <= SCREEN_HEIGHT + CROP_SIZE) {
      translateY.value = withTiming(0, {}, (finished) => {
        if (finished) {
          scrollTo(
            animatedRef,
            0,
            contentHeight.value - SCREEN_HEIGHT - CROP_SIZE,
            true
          );
        }
      });
      return;
    }

    translateY.value = withTiming(0, {}, (finished) => {
      if (finished) {
        scrollTo(animatedRef, 0, Math.floor(index / 4) * imageSize, true);
      }
    });
    lastTranslateY.value = 0;
    return;
  };

  const translateY = useSharedValue(0);
  const animatedRef = useAnimatedRef<Animated.FlatList<any>>();
  const contentHeight = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const isBeginDrag = useSharedValue(false);
  const lastTranslateY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: ({ contentOffset: { y } }) => {
      isBeginDrag.value = true;
      lastOffsetY.value = y;
    },
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const velocityY = event.velocity?.y;
      if (!velocityY) {
        scrollY.value = y;
        return;
      }

      if (isBeginDrag.value) {
        if (velocityY > 0) {
          translateY.value = Math.max(
            translateY.value + (scrollY.value - y),
            -CROP_SIZE
          );
        } else {
          if (y < CROP_SIZE) {
            translateY.value = Math.min(
              translateY.value + (scrollY.value - y),
              0
            );
          }
        }
      }
      scrollY.value = y;
    },
    onMomentumEnd: ({ contentOffset: { y }, contentSize: { height } }) => {
      contentHeight.value = height;
      lastTranslateY.value = translateY.value;

      if (y > lastOffsetY.value) {
        isBeginDrag.value = false;
        if (CROP_SIZE - Math.abs(lastTranslateY.value) > CROP_SIZE / 2) {
          translateY.value = withTiming(0, {}, () => {
            scrollTo(animatedRef, 0, lastOffsetY.value, true);
          });
        } else if (CROP_SIZE - Math.abs(lastTranslateY.value) < CROP_SIZE / 2) {
          scrollTo(
            animatedRef,
            0,
            y + (CROP_SIZE - Math.abs(lastTranslateY.value)),
            true
          );
          translateY.value = withTiming(-CROP_SIZE);
        }
      } else if (y < lastOffsetY.value) {
        if (y < CROP_SIZE) {
          if (y < CROP_SIZE / 2) {
            // translateY.value = withTiming(0);
            scrollTo(animatedRef, 0, 0, true);
          } else if (y < CROP_SIZE) {
            scrollTo(animatedRef, 0, CROP_SIZE, true);
            translateY.value = withTiming(-CROP_SIZE);
          }
        }
      }
    },
  });

  const imagePreviewAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const boundaryImagePreviewX = useRef<number>();
  const boundaryImagePreviewY = useRef<number>();
  const displayImagePreviewWidth = useRef<number>();
  const displayImagePreviewHeight = useRef<number>();

  const handleDimesionChange = useCallback(
    (
      displayHeight: number,
      displayWidth: number,
      boundaryX: number,
      boundaryY: number
    ) => {
      boundaryImagePreviewX.current = boundaryX;
      boundaryImagePreviewY.current = boundaryY;
      displayImagePreviewWidth.current = displayWidth;
      displayImagePreviewHeight.current = displayHeight;
    },
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderItem: ListRenderItem<MediaLibrary.Asset> = ({ item, index }) => {
    return (
      <ImageItem
        uri={item.uri}
        size={imageSize}
        onPress={() => handleImagePress(item, index)}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isFocused ? (
        <StatusBar style="inverted" animated hidden />
      ) : (
        <StatusBar style="auto" animated hidden={false} />
      )}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            zIndex: 1,
          },
          imagePreviewAnimatedStyle,
        ]}
      >
        <View
          style={[
            {
              width: CROP_SIZE,
              height: CROP_SIZE,
            },
          ]}
        >
          {selectedAsset && (
            <ImageCropper
              asset={selectedAsset}
              animatedGrid
              onDimensionChange={handleDimesionChange}
              // onDimensionChange={handleDimesionChange}
            />
          )}
        </View>
        <CustomView style={styles.listHeader}>
          <IconButton icon={"camera"} mode="contained-tonal" size={18} />
        </CustomView>
      </Animated.View>
      <Animated.FlatList
        onScroll={onScroll}
        ref={animatedRef}
        overScrollMode={"never"}
        data={media}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.filename}
        ListHeaderComponent={
          <Animated.View style={{ height: CROP_SIZE + HEADER_LIST_HEIGHT }} />
        }
        numColumns={4}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  listHeader: { height: HEADER_LIST_HEIGHT, ...GLOBAL_STYLE.rowCenter },
  scrollBarContainer: {
    width: 6,
    backgroundColor: "transparent",
    borderRadius: 3,
    marginRight: 2,
    position: "absolute",
    right: 0,
  },
  scrollIndicator: {
    width: 6,
    borderRadius: 3,
    backgroundColor: "red",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {},
  imageWrapper: {},
  image: {},
  footerLoader: {
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
});
