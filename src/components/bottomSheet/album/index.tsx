import { Pressable, StyleSheet, View } from "react-native";
import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Album, usePermissions } from "expo-media-library";
import CustomView from "@/components/CustomView";
import { Image } from "expo-image";
import { Text } from "react-native-paper";
import { GLOBAL_STYLE } from "@/constants";
import { useBackHandler } from "@react-native-community/hooks";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchAlbum } from "@/redux/slices/mediaSlice";

interface AlbumSheetProps {
  onAlbumSelected: (album: AlbumCover) => void;
}

type AlbumCover = Album & { coverPhotoUri: string; assetCount: number };
const AlbumSheet = forwardRef<BottomSheetModal, AlbumSheetProps>(
  ({ onAlbumSelected }, ref) => {
    const albums = useAppSelector((state) => state.media.albums);
    const dispatch = useAppDispatch();
    const [permissionResponse, requestPermission] = usePermissions();
    const isBottomSheetOpen = useRef(false);
    const { dismissAll } = useBottomSheetModal();
    const insets = useSafeAreaInsets();
    useEffect(() => {
      (async () => {
        if (permissionResponse?.status !== "granted") {
          await requestPermission();
        } else {
          dispatch(fetchAlbum());
        }
      })();
    }, [dispatch, permissionResponse?.status, requestPermission]);

    useBackHandler(() => {
      if (isBottomSheetOpen.current) {
        dismissAll();
        return true;
      }
      return false;
    });

    const handleSheetChanges = useCallback((index: number) => {
      if (index !== -1 && !isBottomSheetOpen.current) {
        isBottomSheetOpen.current = true;
      }
    }, []);

    return (
      <BottomSheetModal
        topInset={insets.top}
        onChange={handleSheetChanges}
        ref={ref}
      >
        <BottomSheetFlatList
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <CustomView paddingVertical={16} style={GLOBAL_STYLE.center}>
              <Pressable
                style={{ position: "absolute", left: 0 }}
                onPress={() => dismissAll()}
              >
                <Text style={{ fontSize: 19 }}>Cancel</Text>
              </Pressable>
              <Text style={{ fontSize: 19, fontWeight: "bold" }}>Albums</Text>
            </CustomView>
          }
          numColumns={2}
          data={albums}
          keyExtractor={(album) => album.id}
          renderItem={({ item }) => (
            <AlbumEntry album={item} onAlbumSelected={onAlbumSelected} />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          columnWrapperStyle={{ gap: 16 }}
        ></BottomSheetFlatList>
      </BottomSheetModal>
    );
  }
);

const AlbumEntry: React.FC<{
  onAlbumSelected: (album: AlbumCover) => void;
  album: Album & {
    coverPhotoUri: string;
    assetCount: number;
  };
}> = ({ album, onAlbumSelected }) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = 0.95;
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[GLOBAL_STYLE.flex_1, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onAlbumSelected(album)}
      >
        <CustomView style={GLOBAL_STYLE.flex_1}>
          <Image source={{ uri: album.coverPhotoUri }} style={styles.image} />
          <CustomView paddingTop={16} style={GLOBAL_STYLE.center}>
            <Text>{album.title}</Text>
            <Text>{album.assetCount}</Text>
          </CustomView>
        </CustomView>
      </Pressable>
    </Animated.View>
  );
};

AlbumSheet.displayName = "AlbumSheet";
export default AlbumSheet;

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 1, borderRadius: 8 },
});
