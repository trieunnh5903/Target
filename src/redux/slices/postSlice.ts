import { postAPI } from "@/api";
import { FetchPostsResponse, Post, RequestStatus, User } from "@/types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  createAction,
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Asset } from "expo-media-library";

interface PostState {
  loadMoreStatus: RequestStatus;
  reloadStatus: RequestStatus;
  posting: RequestStatus;
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
  error: string | undefined;
}

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

export const likePostRequest = createAction<{
  postId: string;
}>("post/likePostRequest");

export const fetchPostsRequest = createAction<{
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}>("post/fetchPostsRequest");

export const sendPost = createAction<{
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}>("post/fetchPostsRequest");

export const postsAdapter = createEntityAdapter({
  selectId: (post: Post) => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

const initialState = postsAdapter.getInitialState<PostState>({
  lastPost: null,
  loadMoreStatus: "idle",
  reloadStatus: "idle",
  posting: "idle",
  error: undefined,
});

const postsSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
    sendPostRequest: (
      state,
      action: PayloadAction<{
        translateAssets: {
          [id: string]: {
            x: number;
            y: number;
          };
        };
        assets: Asset[];
        caption: string;
      }>
    ) => {
      state.posting = "loading";
    },

    sendPostSuccess: (state, action: PayloadAction<Post>) => {
      state.posting = "succeeded";
      console.log("sendPostSuccess", action.payload);
      postsAdapter.addOne(state, action.payload);
    },

    sendPostFailure: (state, action: PayloadAction<string>) => {
      state.posting = "failed";
      state.error = action.payload;
    },

    optimisticlikePost: (
      state,
      action: PayloadAction<{ postId: string; userId: string }>
    ) => {
      const postId = action.payload.postId;
      const userId = action.payload.userId;

      const post = state.entities[postId];
      const isLiked = !!post?.likes?.[userId];
      const likeCountChange = isLiked ? -1 : 1;
      postsAdapter.updateOne(state, {
        id: postId,
        changes: {
          likes: {
            ...post?.likes,
            [userId]: !isLiked,
          },
          likesCount: (post?.likesCount || 0) + likeCountChange,
        },
      });
    },

    fetchPostsSuccess: (state, action: PayloadAction<FetchPostsResponse>) => {
      const { lastPost, posts } = action.payload;
      state.lastPost = lastPost;
      postsAdapter.upsertMany(state, posts);
    },

    resetPosting: (state) => {
      state.posting = "idle";
    },
    updateUserInPosts: (
      state,
      action: PayloadAction<{
        userId: User["id"];
        updateData: Partial<User>;
      }>
    ) => {
      const { userId, updateData } = action.payload;
      state.entities = Object.fromEntries(
        Object.entries(state.entities).map(([id, post]) => {
          if (post?.postedBy.id === userId) {
            return [
              id,
              { ...post, postedBy: { ...post.postedBy, ...updateData } },
            ];
          }
          return [id, post];
        })
      );
    },
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
  },
});
export default postsSlice.reducer;
export const {
  sendPostRequest,
  sendPostFailure,
  sendPostSuccess,
  resetPosting,
  postAdded,
  postUpdated,
  postRemoved,
  optimisticlikePost,
  updateUserInPosts,
  fetchPostsSuccess,
} = postsSlice.actions;
export const { selectAll: selectAllPosts, selectById: selectPostById } =
  postsAdapter.getSelectors((state: RootState) => state.posts);
