import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import * as MediaLibrary from "expo-media-library";

interface MediaState {
  endCursor: MediaLibrary.AssetRef | undefined;
  media: MediaLibrary.Asset[];
  selectedAlbum?: MediaLibrary.Album | undefined;
  loading: boolean;
  hasMore: boolean;
  albums: AlbumCover[] | null;
}
type AlbumCover = MediaLibrary.Album & {
  coverPhotoUri: string;
  assetCount: number;
};

const ITEMS_PER_PAGE = 200;
export const fetchMedia = createAsyncThunk<
  MediaLibrary.PagedInfo<MediaLibrary.Asset>,
  MediaLibrary.AssetRef | undefined,
  { state: RootState }
>(
  "media/fetchMedia",
  async (after: MediaLibrary.AssetRef | undefined, { getState }) => {
    const selectedAlbum = getState().media.selectedAlbum;
    const result = await MediaLibrary.getAssetsAsync({
      album: selectedAlbum,
      mediaType: "photo",
      sortBy: ["creationTime"],
      first: ITEMS_PER_PAGE,
      after: after,
    });
    return result;
  }
);

export const fetchAlbum = createAsyncThunk("media/fetchAlbum", async () => {
  const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const albumsWithCoverPhoto = await Promise.all(
    fetchedAlbums.map(async (album) => {
      const albumAssets = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: "photo",
        sortBy: "creationTime",
        first: 1,
      });
      const coverPhotoUri = albumAssets.assets[0]?.uri;
      if (coverPhotoUri) {
        return {
          ...album,
          coverPhotoUri,
          assetCount: albumAssets.totalCount,
        };
      }
      return;
    })
  );

  const lastestAsset = await MediaLibrary.getAssetsAsync({
    sortBy: "creationTime",
    mediaType: "photo",
  });

  const photoAlbum: AlbumCover = {
    assetCount: lastestAsset.totalCount,
    id: "all",
    title: "Photos",
    coverPhotoUri: lastestAsset.assets[0]?.uri ?? "",
    startTime: 0,
    endTime: 0,
  };
  const filteredAlbums = albumsWithCoverPhoto.filter(
    (album) => album !== undefined
  );
  return [photoAlbum, ...filteredAlbums];
});

const initialState: MediaState = {
  endCursor: undefined,
  media: [],
  selectedAlbum: undefined,
  loading: false,
  hasMore: true,
  albums: null,
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    setAlbum(state, action: PayloadAction<MediaLibrary.Album>) {
      state.selectedAlbum =
        action.payload.id === "all" ? undefined : action.payload;
      state.endCursor = undefined;
      state.media = [];
      //   fetchMedia();
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.media = state.media.concat(action.payload.assets);
        state.endCursor = action.payload.endCursor;
        state.hasMore = action.payload.hasNextPage;
      })
      .addCase(fetchMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedia.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(fetchAlbum.fulfilled, (state, action) => {
      state.albums = action.payload;
    });
  },
});

export default mediaSlice;
export const { setAlbum } = mediaSlice.actions;
