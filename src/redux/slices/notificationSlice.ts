import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "expo-notifications";

interface NotificationState {
  expoPushToken: string | undefined;
  notification: Notification | undefined;
  error: string | undefined;
  //   notificaiton type
}

const initialState: NotificationState = {
  error: undefined,
  expoPushToken: undefined,
  notification: undefined,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setExpoPushToken: (state, action: PayloadAction<string | undefined>) => {
      state.expoPushToken = action.payload;
    },
    setNewNotification: (
      state,
      action: PayloadAction<Notification | undefined>
    ) => {
      state.notification = action.payload;
    },
    clearNewNotification: (state) => {
      state.notification = undefined;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
  },
});

const { actions, reducer: notificationReducer } = notificationSlice;
export const {
  setError,
  setExpoPushToken,
  setNewNotification,
  clearNewNotification,
} = actions;
export default notificationReducer;
