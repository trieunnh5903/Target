import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bottomSheetReducer from "./slices/bottomSheetSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bottomSheet: bottomSheetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
