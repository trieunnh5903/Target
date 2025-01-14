import { call, fork, put, take, takeLatest } from "redux-saga/effects";
import { fetchPostsSuccess } from "../slices/postSlice";
import { postAPI } from "@/api";
import { FetchPostsResponse } from "@/types";
import { eventChannel, EventChannel } from "redux-saga";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface AuthState {
  user: FirebaseAuthTypes.User | null;
}

export function* watchPostSaga() {
  yield fork(fetchPost);
}

function createAuthChannel(): EventChannel<AuthState> {
  return eventChannel((emitter) => {
    return auth().onAuthStateChanged((user) => {
      emitter({ user });
    });
  });
}

function* fetchPost() {
  const channel = createAuthChannel();

  try {
    while (true) {
      const { user }: AuthState = yield take(channel);
      if (user) {
        const initialPost: FetchPostsResponse = yield call(postAPI.fetchAll, {
          limit: 10,
        });
        yield put(fetchPostsSuccess(initialPost));
      }
    }
  } finally {
    channel.close();
  }
}
