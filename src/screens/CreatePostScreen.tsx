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
import { AlbumBottomSheet } from "@/components/bottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
interface ImageEntryProps {
  uri: string;
  size: number;
  onPress: () => void;
}

const ImageEntry: React.FC<ImageEntryProps> = memo(function ImageEntry({
  uri,
  size,
  onPress,
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View>
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
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
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
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset>();
  const isFocused = useIsFocused();
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album>();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const translateY = useSharedValue(0);
  const listRef = useAnimatedRef<Animated.FlatList<any>>();
  const contentHeight = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const isBeginDrag = useSharedValue(false);
  const lastTranslateY = useSharedValue(0);

  const boundaryImagePreviewX = useRef<number>();
  const boundaryImagePreviewY = useRef<number>();
  const displayImagePreviewWidth = useRef<number>();
  const displayImagePreviewHeight = useRef<number>();

  const loadImages = useCallback(
    async (after: MediaLibrary.AssetRef | undefined = undefined) => {
      try {
        if (permissionResponse?.status !== "granted") {
          await requestPermission();
        }
        const {
          assets,
          endCursor: newEndCursor,
          hasNextPage,
        } = await MediaLibrary.getAssetsAsync({
          album: selectedAlbum?.id === "all" ? undefined : selectedAlbum,
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
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      ITEMS_PER_PAGE,
      permissionResponse?.status,
      requestPermission,
      selectedAlbum,
    ]
  );

  useEffect(() => {
    if (media.length > 0) {
      setSelectedAsset(media[0]);
    }
    return () => {};
  }, [media, selectedAlbum]);

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
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleImagePress = (image: MediaLibrary.Asset, index: number) => {
    setSelectedAsset({ ...image });
    const remainingOffset = contentHeight.value - scrollY.value;
    isBeginDrag.value = false;

    // last page
    if (remainingOffset <= SCREEN_HEIGHT + CROP_SIZE) {
      translateY.value = withTiming(0, {}, (finished) => {
        if (finished) {
          scrollTo(
            listRef,
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
        scrollTo(listRef, 0, Math.floor(index / 4) * imageSize, true);
      }
    });
    lastTranslateY.value = 0;
    return;
  };

  const handleSelectedAlbum = (album: MediaLibrary.Album) => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    translateY.value = 0;
    setEndCursor(undefined);
    setSelectedAlbum(album);
    setMedia([]);
    setSelectedAsset(undefined);
    setLoading(true);
    bottomSheetModalRef.current?.dismiss();
  };

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
            scrollTo(listRef, 0, lastOffsetY.value, true);
          });
        } else if (CROP_SIZE - Math.abs(lastTranslateY.value) < CROP_SIZE / 2) {
          scrollTo(
            listRef,
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
            scrollTo(listRef, 0, 0, true);
          } else if (y < CROP_SIZE) {
            scrollTo(listRef, 0, CROP_SIZE, true);
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

  const renderItem: ListRenderItem<MediaLibrary.Asset> = ({ item, index }) => {
    return (
      <ImageEntry
        uri={item.uri}
        size={imageSize}
        onPress={() => handleImagePress(item, index)}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore || media.length === 0) return null;

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
      <Animated.View style={[styles.imageWrapper, imagePreviewAnimatedStyle]}>
        <View
          style={[
            {
              width: CROP_SIZE,
              height: CROP_SIZE,
            },
          ]}
        >
          {loading && (
            <View
              style={{ ...GLOBAL_STYLE.fullSize, backgroundColor: "lightgray" }}
            />
          )}
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
          <Button icon={"chevron-down"} onPress={handlePresentModalPress}>
            {selectedAlbum?.title ?? "Photo"}
          </Button>
          <IconButton
            icon={"camera"}
            mode="contained-tonal"
            size={18}
            onPress={handlePresentModalPress}
          />
        </CustomView>
      </Animated.View>
      <Animated.FlatList
        onScroll={onScroll}
        ref={listRef}
        overScrollMode={"never"}
        data={media}
        scrollEnabled={!loading}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.filename}
        ListHeaderComponent={
          <Animated.View style={{ height: CROP_SIZE + HEADER_LIST_HEIGHT }} />
        }
        ListEmptyComponent={
          <View style={styles.loadingContainer}>
            {Array.from({
              length: Math.ceil((SCREEN_HEIGHT - CROP_SIZE) / imageSize) * 4,
            }).map((_, index) => (
              <View
                key={index}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderWidth: 0.2,
                  borderColor: "gray",
                  backgroundColor: "lightgray",
                }}
              />
            ))}
          </View>
        }
        numColumns={4}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      <AlbumBottomSheet
        ref={bottomSheetModalRef}
        onAlbumSelected={handleSelectedAlbum}
      />
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - CROP_SIZE,
  },
  imageWrapper: {
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  listHeader: {
    height: HEADER_LIST_HEIGHT,
    ...GLOBAL_STYLE.row,
    justifyContent: "space-between",
    alignItems: "center",
  },
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

  list: {},
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
