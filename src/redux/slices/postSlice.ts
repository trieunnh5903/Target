import { postAPI } from "@/api";
import { Post, RequestStatus } from "@/types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Asset } from "expo-media-library";
import Utils from "@/utils";
import { ImageManipulator, ImageResult } from "expo-image-manipulator";

interface PostState {
  initialStatus: RequestStatus;
  loadMoreStatus: RequestStatus;
  reloadStatus: RequestStatus;
  posting: RequestStatus;
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}

interface CroppedImage {
  thumbnailUri: ImageResult;
  baseUri: ImageResult;
}

const cropImage = async (
  assets: Asset[],
  translateAssets: {
    [id: string]: {
      x: number;
      y: number;
    };
  }
) => {
  try {
    return await Promise.all(
      assets.map(async (item) => {
        const rect = Utils.generateImageCropOptions({
          originalHeight: item.height,
          originalWidth: item.width,
          translationX: translateAssets[item.id]?.x ?? 0,
          translationY: translateAssets[item.id]?.y ?? 0,
        });
        const context = ImageManipulator.manipulate(item.uri);
        const [thumbnailUri, baseUri] = await Promise.all([
          context
            .crop(rect)
            .resize({ width: Math.min(1080, item.width) })
            .renderAsync()
            .then((rendered) => rendered.saveAsync({ compress: 1 })),

          context
            .resize({ width: Math.min(1920, item.width) })
            .renderAsync()
            .then((rendered) => rendered.saveAsync({ compress: 1 })),
        ]);

        return { thumbnailUri, baseUri };
      })
    );
  } catch (error) {
    throw error;
  }
};

const uploadPostImages = async (images: CroppedImage[]) => {
  try {
    return await Promise.all(
      images.map(async (image) => {
        try {
          const baseUrl = await postAPI.uploadImage(image.baseUri.uri);
          const thumbnailUrl = await postAPI.uploadImage(
            image.thumbnailUri.uri
          );

          return {
            thumbnailUrl: {
              source: thumbnailUrl,
              width: image.thumbnailUri.width,
              height: image.thumbnailUri.height,
            },
            baseUrl: {
              width: image.baseUri.width,
              height: image.baseUri.height,
              source: baseUrl,
            },
          };
        } catch (e) {
          throw e;
        }
      })
    );
  } catch (error) {
    console.log("uploadPostImages", error);
    throw error;
  }
};

export const sendPost = createAsyncThunk<
  Post,
  {
    translateAssets: {
      [id: string]: {
        x: number;
        y: number;
      };
    };
    assets: Asset[];
    caption: string;
  },
  { state: RootState; rejectValue: string }
>("posts/sendPost", async ({ assets, translateAssets, caption }, thunkAPI) => {
  const userId = thunkAPI.getState().auth.currentUser?.id;
  if (!userId) return thunkAPI.rejectWithValue("user doesnt exisit");
  const croppedImages = await cropImage(assets, translateAssets);
  const sourceImages = await uploadPostImages(croppedImages);
  const post = await postAPI.createPost({
    caption: caption.trim(),
    images: sourceImages,
    userId: userId,
  });
  if (post) {
    return post;
  } else {
    return thunkAPI.rejectWithValue("Server error");
  }
});

export const fetchInitialPosts = createAsyncThunk(
  "posts/fetchInitial",
  async () => {
    const response = await postAPI.fetchAll({
      limit: 10,
    });
    return response;
  }
);

export const refetchInitialPosts = createAsyncThunk(
  "posts/refetchInitialPosts",
  async () => {
    const response = await postAPI.fetchAll({
      limit: 10,
    });
    return response;
  }
);

export const fetchMorePosts = createAsyncThunk(
  "posts/fetchMorePosts",
  async (lastPost: PostState["lastPost"]) => {
    const response = await postAPI.fetchAll({
      limit: 10,
      lastPost,
    });
    return response;
  }
);

export const postsAdapter = createEntityAdapter({
  selectId: (post: Post) => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

const initialState = postsAdapter.getInitialState<PostState>({
  lastPost: null,
  initialStatus: "idle",
  loadMoreStatus: "idle",
  reloadStatus: "idle",
  posting: "idle",
});

const postsSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
  },
  extraReducers(builder) {
    builder.addCase(fetchMorePosts.pending, (state) => {
      state.loadMoreStatus = "loading";
    });
    builder.addCase(fetchMorePosts.fulfilled, (state, action) => {
      state.loadMoreStatus = "succeeded";
      const { lastPost, posts } = action.payload;
      state.lastPost = lastPost;
      postsAdapter.upsertMany(state, posts);
    });
    builder.addCase(fetchMorePosts.rejected, (state) => {
      state.loadMoreStatus = "failed";
    });

    builder.addCase(fetchInitialPosts.pending, (state) => {
      state.initialStatus = "loading";
    });
    builder.addCase(fetchInitialPosts.fulfilled, (state, action) => {
      state.initialStatus = "succeeded";
      const { lastPost, posts } = action.payload;
      state.lastPost = lastPost;
      postsAdapter.upsertMany(state, posts);
    });
    builder.addCase(fetchInitialPosts.rejected, (state) => {
      state.initialStatus = "failed";
    });

    builder.addCase(refetchInitialPosts.pending, (state) => {
      state.reloadStatus = "loading";
    });
    builder.addCase(refetchInitialPosts.fulfilled, (state, action) => {
      state.reloadStatus = "succeeded";
      const { lastPost, posts } = action.payload;
      state.lastPost = lastPost;
      postsAdapter.setAll(state, posts);
    });
    builder.addCase(refetchInitialPosts.rejected, (state) => {
      state.reloadStatus = "failed";
    });

    builder
      .addCase(sendPost.pending, (state) => {
        state.posting = "loading";
      })
      .addCase(sendPost.fulfilled, (state, action) => {
        state.posting = "succeeded";
        postsAdapter.addOne(state, action.payload);
        console.log(state, action.payload);
      })
      .addCase(sendPost.rejected, (state, action) => {
        state.posting = "failed";
      });
  },
});
export default postsSlice;
export const { postAdded, postUpdated, postRemoved } = postsSlice.actions;
export const { selectAll: selectAllPosts, selectById: selectPostById } =
  postsAdapter.getSelectors((state: RootState) => state.posts);
