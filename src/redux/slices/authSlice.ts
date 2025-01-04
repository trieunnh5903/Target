import { postAPI, userAPI } from "@/api";
import { Post, User } from "@/types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface AuthState {
  currentUser: User | null;
  loading: "idle" | "pending";
  error: string | null;
  ownPosts: Post[];
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}

const initialState: AuthState = {
  currentUser: null,
  loading: "idle",
  error: null,
  ownPosts: [],
  lastPost: null,
};

export const fetchOwnPosts = createAsyncThunk<
  {
    posts: Post[];
    lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
  },
  string,
  { state: RootState }
>("auth/fetchOwnPosts", async (userId, thunkAPI) => {
  try {
    if (!userId) {
      return { posts: [], lastPost: null };
    }
    const posts = await postAPI.fetchAllUserPost(
      userId,
      thunkAPI.getState().auth.lastPost
    );

    return posts;
  } catch {
    return { posts: [], lastPost: null };
  }
});

export const fetchCurrentUser = createAsyncThunk(
  "users/fetchByIdStatus",
  async (userId: string) => {
    return await userAPI.fetchUserById(userId);
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateCurrentUser: (state, action: PayloadAction<{ data: User }>) => {
      state.currentUser = action.payload.data;
    },

    updatePhotoURL: (state, action: PayloadAction<{ avatarURL: string }>) => {
      if (state.currentUser) {
        state.currentUser.avatarURL = action.payload.avatarURL;
      }
    },

    logout: (state) => {
      state.currentUser = null;
    },

    addPostToOwnPost: (state, action: PayloadAction<Post>) => {
      state.ownPosts.unshift(action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchCurrentUser.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, actions) => {
      state.loading = "idle";
      state.currentUser = actions.payload;
    });

    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.loading = "idle";
      state.error = "fetchCurrentUser error";
    });

    builder.addCase(fetchOwnPosts.fulfilled, (state, action) => {
      state.lastPost = action.payload.lastPost;
      state.ownPosts = action.payload.posts;
    });
  },
});

const { actions, reducer: authReducer } = authSlice;
export const { logout, updateCurrentUser, updatePhotoURL, addPostToOwnPost } = actions;
export default authReducer;
