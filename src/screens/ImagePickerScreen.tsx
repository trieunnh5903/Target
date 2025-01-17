import {
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Button,
  IconButton,
  useTheme,
} from "react-native-paper";
import { RootTabScreenProps } from "@/types/navigation";
import Animated, {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  CROP_SIZE,
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "@/constants";
import { CustomView, ImageCropper } from "@/components";
import { AlbumBottomSheet } from "@/components/bottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  useAppDispatch,
  useAppSelector,
  useCropDimensions,
  useCropsGesture,
} from "@/hooks";
import { fetchMedia, setAlbum } from "@/redux/slices/mediaSlice";

const HEADER_LIST_HEIGHT = 50;
const SPACING = 1;
const NUM_COLUMNS = 4;
const ImagePickerScreen: React.FC<RootTabScreenProps<"ImagePicker">> = ({
  navigation,
}) => {
  const theme = useTheme();
  const dimension = useWindowDimensions();
  const IMAGE_SIZE =
    (dimension.width - (NUM_COLUMNS - 1) * SPACING) / NUM_COLUMNS;
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const listRef = useAnimatedRef<Animated.FlatList<any>>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dispatch = useAppDispatch();
  const { media, loading, hasMore, selectedAlbum } = useAppSelector(
    (state) => state.media
  );
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset[]>();
  const [previewAsset, setPreviewAsset] = useState<MediaLibrary.Asset>();
  const [multipleSelect, setMultipleSelect] = useState(false);
  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const isBeginDrag = useSharedValue(false);
  const lastTranslateY = useSharedValue(0);
  const translateSelectedAssets = useSharedValue<{
    [id: string]: {
      x: number;
      y: number;
    };
  }>({});
  const listMeasurementHeight = useSharedValue(0);
  const imagePressed = useSharedValue(false);

  const {
    displayHeight,
    displayWidth,
    gridHeight,
    gridWidth,
    boundaryTranslateX,
    boundaryTranslateY,
  } = useCropDimensions({
    originalHeight: previewAsset?.height,
    originalWidth: previewAsset?.width,
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
    onTranslateFinished(x, y) {
      if (!previewAsset) return;
      if (!multipleSelect) {
        translateSelectedAssets.value = { [previewAsset.id]: { x, y } };
      } else {
        const existed = selectedAsset?.some(
          (item) => item.id === previewAsset?.id
        );
        if (existed) {
          addTranslatedAsset(previewAsset.id, x, y);
        } else if (selectedAsset?.length === 0) {
          translateSelectedAssets.value = { [previewAsset.id]: { x, y } };
        }
      }
    },
  });

  const addTranslatedAsset = (id: string, x: number, y: number) => {
    translateSelectedAssets.value = {
      ...translateSelectedAssets.value,
      [id]: { x, y },
    };
  };

  const removeTranslatedAsset = (id: string) => {
    const newAssets = { ...translateSelectedAssets.value };
    delete newAssets[id];
    translateSelectedAssets.value = newAssets;
  };

  useEffect(() => {
    if (media.length > 0) {
      setPreviewAsset(media[0]);
      setSelectedAsset([media[0]]);
    }
    return () => {};
  }, [media, selectedAlbum]);

  useLayoutEffect(() => {
    const onNextPress = async () => {
      if (!previewAsset) return;
      let assets: MediaLibrary.Asset[];
      if (multipleSelect) {
        assets =
          selectedAsset && selectedAsset.length > 0
            ? selectedAsset
            : [previewAsset];
      } else {
        assets = [previewAsset];
      }

      if (assets.length > 0) {
        const translateValue = translateSelectedAssets.value;
        navigation.navigate("CreatePost", {
          assets,
          translateAssets: translateValue,
        });
      }
    };

    navigation.setOptions({
      headerRight: () => {
        return (
          <Button disabled={loading} onPress={onNextPress}>
            Next
          </Button>
        );
      },
    });
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multipleSelect, navigation, previewAsset, selectedAsset]);

  useEffect(() => {
    const checkPermission = async () => {
      if (!permissionResponse) {
        await requestPermission();
      }
    };
    checkPermission();
  }, [permissionResponse, requestPermission]);

  useEffect(() => {
    if (permissionResponse?.status === "granted") {
      if (media.length === 0 && !loading) {
        dispatch(fetchMedia());
      }
    }
  }, [dispatch, loading, media.length, permissionResponse?.status]);

  const handleLoadMore = useCallback(async () => {
    if (!loading && media.length > 0 && hasMore) {
      dispatch(fetchMedia());
    }
  }, [dispatch, hasMore, loading, media.length]);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleScrollToSelectedImage = (index: number) => {
    isBeginDrag.value = false;
    const scrollIndex = Math.floor(index / 4);
    const remainOffset =
      contentHeight.value -
      (scrollIndex * (IMAGE_SIZE + scrollIndex) +
        CROP_SIZE +
        HEADER_LIST_HEIGHT);
    if (listMeasurementHeight.value === 0) {
      //unscrolled list
      translateY.value = withTiming(0, {}, (finished) => {
        if (finished) {
          scrollTo(listRef, 0, scrollIndex * IMAGE_SIZE + scrollIndex, true);
        }
      });
    } else if (remainOffset < listMeasurementHeight.value) {
      //list scrolled to end page
      listRef.current?.scrollToOffset({
        offset: contentHeight.value - (listMeasurementHeight.value + CROP_SIZE),
      });
      translateY.value = withTiming(0);
    } else {
      translateY.value = withTiming(0, {}, (finished) => {
        if (finished) {
          scrollTo(listRef, 0, scrollIndex * IMAGE_SIZE + scrollIndex, true);
        }
      });
    }
  };

  const saveAsset = (image: MediaLibrary.Asset) => {
    let updatedAsset = [...(selectedAsset ?? [])];

    if (multipleSelect) {
      const assetIndex = updatedAsset?.findIndex(
        (asset) => asset.id === image?.id
      );
      if (assetIndex >= 0) {
        if (previewAsset?.id === image.id) {
          updatedAsset = updatedAsset.filter((asset) => asset.id !== image?.id);
        }
      } else {
        updatedAsset.push(image);
      }
    } else {
      updatedAsset = [image];
    }

    setSelectedAsset(updatedAsset);
  };

  const updateTranslateAsset = (image: MediaLibrary.Asset) => {
    if (!multipleSelect) {
      translateSelectedAssets.value = {};
      resetGesture();
    } else {
      const existed = selectedAsset?.some((asset) => asset.id === image?.id);
      if (existed) {
        if (previewAsset?.id === image.id) {
          removeTranslatedAsset(image.id);
        }
      }
      translationX.value = withTiming(
        translateSelectedAssets.value[image.id]?.x ?? 0,
        { duration: 0 }
      );
      translationY.value = withTiming(
        translateSelectedAssets.value[image.id]?.y ?? 0,
        { duration: 0 }
      );
    }
  };

  const onImagePress = (image: MediaLibrary.Asset, index: number) => {
    imagePressed.value = true;
    lastTranslateY.value = 0;
    handleScrollToSelectedImage(index);
    setPreviewAsset(image);
    saveAsset(image);
    updateTranslateAsset(image);
  };

  const onCameraPress = () => {
    navigation.navigate("CameraScreen", { newestImage: media[0] });
  };

  const handleMultipleSelectPress = () => {
    setMultipleSelect((prev) => !prev);
    if (!previewAsset) return;
    if (!multipleSelect) {
      if (selectedAsset?.[0]?.id !== previewAsset.id) {
        setSelectedAsset([previewAsset]);
      }
    } else {
      if (selectedAsset?.length === 0) {
        setSelectedAsset([previewAsset]);
      }
    }
  };

  const handleSelectedAlbum = (album: MediaLibrary.Album) => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    translateY.value = 0;
    dispatch(setAlbum(album));
    dispatch(fetchMedia());
    setPreviewAsset(undefined);
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
      console.log(isBeginDrag.value);

      if (isBeginDrag.value) {
        if (velocityY > 0) {
          console.log("b");

          translateY.value = Math.max(
            translateY.value + (scrollY.value - y),
            -CROP_SIZE
          );
        } else {
          if (y < CROP_SIZE || imagePressed.value) {
            console.log("a");

            translateY.value = Math.min(
              translateY.value + (scrollY.value - y),
              0
            );
          }
        }
      }
      scrollY.value = y;
    },
    onMomentumEnd: ({
      contentOffset: { y },
      contentSize: { height },
      layoutMeasurement,
    }) => {
      listMeasurementHeight.value = layoutMeasurement.height;
      contentHeight.value = height;
      lastTranslateY.value = translateY.value;
      if (translateY.value === 0 || translateY.value === -CROP_SIZE) {
        imagePressed.value = false;
        return;
      }
      if (isBeginDrag.value) {
        if (Math.abs(translateY.value) >= SCREEN_WIDTH / 2) {
          scrollTo(
            listRef,
            0,
            y + (SCREEN_WIDTH - Math.abs(lastTranslateY.value)),
            true
          );
        } else {
          scrollTo(listRef, 0, y - Math.abs(lastTranslateY.value), true);
        }
      }
    },
  });
  
  useAnimatedReaction(
    () => scrollY.value,
    (v) => {
      if (v === CROP_SIZE) {
        translateY.value = withTiming(-CROP_SIZE);
      }
    }
  );

  const imagePreviewAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const renderItem: ListRenderItem<MediaLibrary.Asset> = ({ item, index }) => {
    const isPreviewed = item.id === previewAsset?.id;
    const selectedAssetIndex = (selectedAsset ?? []).findIndex(
      (asset) => asset?.id === item.id
    );
    return (
      <ImageEntry
        multipleSelect={multipleSelect}
        isPreviewed={isPreviewed}
        selectedIndex={selectedAssetIndex}
        uri={item.uri}
        size={IMAGE_SIZE}
        onPress={() => onImagePress(item, index)}
      />
    );
  };

  const renderFooter = () => {
    if (!loading || media.length === 0) return null;

    return (
      <CustomView style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </CustomView>
    );
  };

  return (
    <CustomView style={styles.container}>
      <Animated.View
        style={[styles.transitionWrapper, imagePreviewAnimatedStyle]}
      >
        <CustomView style={[styles.imageWrapper]}>
          {loading && <CustomView style={styles.imagePreviewSkeleton} />}
          {previewAsset && (
            <ImageCropper
              animatedGrid
              displayHeight={displayHeight}
              displayWidth={displayWidth}
              gesture={gesture}
              gridHeight={gridHeight}
              gridOpacity={gridOpacity}
              gridWidth={gridWidth}
              translationX={translationX}
              translationY={translationY}
              uri={previewAsset.uri}
              gridTranslateX={gridTranslateX}
              gridTranslateY={gridTranslateY}
            />
          )}
        </CustomView>
        <CustomView style={styles.listHeader}>
          <Button icon={"chevron-down"} onPress={handlePresentModalPress}>
            {selectedAlbum?.title ?? "Photo"}
          </Button>

          <CustomView style={GLOBAL_STYLE.rowCenter}>
            <IconButton
              icon={"checkbox-multiple-blank-outline"}
              mode="contained-tonal"
              size={18}
              onPress={handleMultipleSelectPress}
            />
            <IconButton
              icon={"camera"}
              mode="contained-tonal"
              size={18}
              onPress={onCameraPress}
            />
          </CustomView>
        </CustomView>
      </Animated.View>
      <Animated.FlatList
        contentContainerStyle={{ backgroundColor: theme.colors.background }}
        initialNumToRender={20}
        maxToRenderPerBatch={NUM_COLUMNS * 3}
        windowSize={NUM_COLUMNS * 5}
        removeClippedSubviews
        onScroll={onScroll}
        ref={listRef}
        overScrollMode={"never"}
        data={media}
        scrollEnabled={!loading}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.filename}
        columnWrapperStyle={{ gap: SPACING }}
        getItemLayout={(data, index) => ({
          length: IMAGE_SIZE + SPACING,
          offset: Math.floor(index / NUM_COLUMNS) * (IMAGE_SIZE + SPACING),
          index,
        })}
        ItemSeparatorComponent={() => (
          <CustomView style={{ height: SPACING }} />
        )}
        ListHeaderComponent={
          <Animated.View style={{ height: CROP_SIZE + HEADER_LIST_HEIGHT }} />
        }
        ListEmptyComponent={
          <CustomView style={styles.loadingContainer}>
            {Array.from({
              length: Math.ceil((SCREEN_HEIGHT - CROP_SIZE) / IMAGE_SIZE) * 4,
            }).map((_, index) => (
              <CustomView
                key={index}
                style={[
                  styles.imageSkeleton,
                  { width: IMAGE_SIZE, height: IMAGE_SIZE },
                ]}
              />
            ))}
          </CustomView>
        }
        numColumns={NUM_COLUMNS}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      <AlbumBottomSheet
        ref={bottomSheetModalRef}
        onAlbumSelected={handleSelectedAlbum}
      />
    </CustomView>
  );
};

const ImageEntry: React.FC<{
  uri: string;
  size: number;
  onPress: () => void;
  isPreviewed: boolean;
  selectedIndex: number;
  multipleSelect: boolean;
}> = memo(function ImageEntry({
  uri,
  size,
  onPress,
  isPreviewed,
  selectedIndex,
  multipleSelect,
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <CustomView style={{ opacity: isPreviewed ? 0.2 : 1 }}>
        <Image
          source={{ uri: uri }}
          style={[styles.image, { width: size, height: size }]}
        />
      </CustomView>

      {multipleSelect && (
        <CustomView
          style={[styles.circle, selectedIndex >= 0 && styles.selectedCircle]}
        >
          {selectedIndex >= 0 && (
            <Text style={{ fontWeight: "bold" }}>{selectedIndex + 1}</Text>
          )}
        </CustomView>
      )}
    </TouchableOpacity>
  );
});

export default ImagePickerScreen;

const styles = StyleSheet.create({
  imageSkeleton: {
    borderWidth: 0.2,
    borderColor: "gray",
    backgroundColor: "lightgray",
  },
  imagePreviewSkeleton: {
    ...GLOBAL_STYLE.fullSize,
    backgroundColor: "lightgray",
  },
  selectedCircle: {
    flex: 1,
    ...GLOBAL_STYLE.center,
    backgroundColor: "lightblue",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 15,
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "rgba(255,255,2555,0.5)",
    borderColor: "white",
    borderWidth: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - CROP_SIZE,
  },
  imageWrapper: {
    width: CROP_SIZE,
    height: CROP_SIZE,
  },
  transitionWrapper: {
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
