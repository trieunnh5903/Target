import { FetchPostsResponse, Post, User } from "@/types";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  currentUser: User | null;
  loading: "idle" | "pending";
  errorMessage: string | null;
  ownPosts: Post[];
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
  isReady: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  loading: "idle",
  errorMessage: null,
  ownPosts: [],
  lastPost: null,
  isReady: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initialized: (state) => {
      state.isReady = true;
    },

    verifiedAccountLocal: (state) => {
      if (state.currentUser) {
        state.currentUser.verified = true;
      }
    },

    loginSuccess: (state) => {
      state.loading = "idle";
    },
    loginRequest: (
      state,
      action: PayloadAction<{ email: string; password: string }>
    ) => {
      state.loading = "pending";
      state.errorMessage = null;
    },

    clearError: (state) => {
      state.errorMessage = null;
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = "idle";
      state.errorMessage = action.payload;
    },

    updateCurrentUser: (state, action: PayloadAction<{ data: User }>) => {
      state.currentUser = action.payload.data;
    },

    updatePhotoURL: (state, action: PayloadAction<{ avatarURL: string }>) => {
      if (state.currentUser) {
        state.currentUser.avatarURL = action.payload.avatarURL;
      }
    },

    logout: (state) => {
      state.loading = "idle";
      state.currentUser = null;
      state.lastPost = null;
      state.errorMessage = null;
      state.ownPosts = [];
    },

    addPost: (state, action: PayloadAction<Post>) => {
      state.ownPosts.unshift(action.payload);
    },

    fetchOwnPostSuccess: (state, action: PayloadAction<FetchPostsResponse>) => {
      const { lastPost, posts } = action.payload;
      state.ownPosts = [...state.ownPosts, ...posts];
      state.lastPost = lastPost;
    },
  },
});

export const {
  verifiedAccountLocal,
  logout,
  loginRequest,
  updateCurrentUser,
  updatePhotoURL,
  addPost,
  loginSuccess,
  loginFailure,
  fetchOwnPostSuccess,
  clearError,
  initialized,
} = authSlice.actions;
export default authSlice.reducer;
