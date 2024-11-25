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
  useState,
} from "react";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { IconButton } from "react-native-paper";
import { RootTabScreenProps } from "@/types/navigation";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
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
  const ITEMS_PER_PAGE = 20;
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
    []
  );

  useLayoutEffect(() => {
    const onCameraPress = async () => {
      navigation.navigate("CameraScreen", { newestImage: media[0] });
    };

    navigation.setOptions({
      headerRight: () => {
        return <IconButton icon={"camera"} onPress={onCameraPress} />;
      },
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

  const handleImagePress = (image: MediaLibrary.Asset) => {
    navigation.navigate("EditImage", {
      asset: { height: image.height, width: image.width, uri: image.uri },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderItem: ListRenderItem<MediaLibrary.Asset> = ({ item }) => {
    return (
      <ImageItem
        uri={item.uri}
        size={imageSize}
        onPress={() => handleImagePress(item)}
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
      <StatusBar style="auto" animated />
      <Animated.FlatList
        onScroll={onScroll}
        data={media}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.filename}
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
