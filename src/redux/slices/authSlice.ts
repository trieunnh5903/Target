import { userAPI } from "@/api";
import { User } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  currentUser: User | null;
  loading: "idle" | "pending";
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  loading: "idle",
  error: null,
};

export const fetchUserById = createAsyncThunk(
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

    updatePhotoURL: (state, action: PayloadAction<{ photoURL: string }>) => {
      if (state.currentUser) {
        state.currentUser.photoURL = action.payload.photoURL;
      }
    },

    logout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchUserById.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });
    builder.addCase(fetchUserById.fulfilled, (state, actions) => {
      state.loading = "idle";
      state.currentUser = actions.payload;
    });

    builder.addCase(fetchUserById.rejected, (state) => {
      state.loading = "idle";
      state.error = "fetchUserById error";
    });
  },
});

const { actions, reducer: authReducer } = authSlice;
export const { logout, updateCurrentUser, updatePhotoURL } = actions;
export default authReducer;
