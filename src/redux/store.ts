import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./slices/notificationSlice";
import mediaSlice from "./slices/mediaSlice";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import { authReducer, postReducer } from "./slices";

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    posts: postReducer,
    media: mediaSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
