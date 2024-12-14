import { postAPI } from "@/api";
import { Post } from "@/types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../store";

interface PostState {
  initialStatus: "idle" | "loading" | "succeeded" | "failed";
  loadMoreStatus: "idle" | "loading" | "succeeded" | "failed";
  reloadStatus: "idle" | "loading" | "succeeded" | "failed";
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}

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
});
const initialState = postsAdapter.getInitialState<PostState>({
  lastPost: null,
  initialStatus: "idle",
  loadMoreStatus: "idle",
  reloadStatus: "idle",
});

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
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
  },
});
export default postSlice;
export const { selectAll: selectAllPosts } = postsAdapter.getSelectors(
  (state: RootState) => state.posts
);
