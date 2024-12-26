import * as MediaLibrary from "expo-media-library";
import { useCallback, useState } from "react";

const ITEMS_PER_PAGE = 200;

export const useMediaLoader = (selectedAlbum?: MediaLibrary.Album) => {
  const [media, setMedia] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<MediaLibrary.AssetRef>();

  const loadImages = useCallback(
    async (after?: MediaLibrary.AssetRef) => {
      try {
        const {
          assets,
          endCursor: newEndCursor,
          hasNextPage,
        } = await MediaLibrary.getAssetsAsync({
          album: selectedAlbum?.id === "all" ? undefined : selectedAlbum,
          mediaType: "photo",
          sortBy: ["creationTime"],
          first: ITEMS_PER_PAGE,
          after,
        });

        setMedia((prev) => (after ? [...prev, ...assets] : assets));
        setEndCursor(newEndCursor);
        setHasMore(hasNextPage);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedAlbum]
  );

  return {
    media,
    loading,
    loadingMore,
    hasMore,
    endCursor,
    loadImages,
    setLoadingMore,
  };
};
