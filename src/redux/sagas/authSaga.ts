import { takeLatest, call, put, take, fork, all } from "redux-saga/effects";
import {
  fetchOwnPostSuccess,
  initialized,
  loginFailure,
  loginRequest,
  loginSuccess,
  logout,
  updateCurrentUser,
} from "../slices/authSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { authAPI, postAPI, userAPI } from "@/api";
import { EventChannel, eventChannel } from "redux-saga";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { FetchPostsResponse, User } from "@/types";

interface AuthState {
  user: FirebaseAuthTypes.User | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

export function* watchAuthSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield fork(authStateListener);
}

function* logoutSaga() {
  try {
    if (auth().currentUser) {
      yield call([auth(), "signOut"]);
      yield put(logout());
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function createAuthChannel(): EventChannel<AuthState> {
  return eventChannel((emitter) => {
    return auth().onAuthStateChanged((user) => {
      emitter({ user });
    });
  });
}

function* fetchUserData(userId: string) {
  try {
    const [userDetail, userPosts]: [User, FetchPostsResponse] = yield all([
      call(userAPI.fetchUserById, userId),
      call(postAPI.fetchAllUserPost, userId),
    ]);

    yield put(updateCurrentUser({ data: userDetail }));
    yield put(fetchOwnPostSuccess(userPosts));
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

function* authStateListener() {
  const channel = createAuthChannel();
  try {
    while (true) {
      const { user }: AuthState = yield take(channel);
      if (user) {
        yield call(fetchUserData, user.uid);
      }
      yield put(initialized());
    }
  } finally {
    channel.close();
  }
}

function* loginSaga(action: PayloadAction<LoginPayload>) {
  try {
    const { email, password } = action.payload;
    if (!email || !password) {
      yield put(loginFailure("Fields cannot be empty"));
      return;
    }
    const credential: FirebaseAuthTypes.UserCredential = yield call(
      authAPI.signIn,
      email,
      password
    );
    if (credential.user.uid) {
      yield put(loginSuccess());
    }
  } catch (error: any) {
    let errorMessage = "Login failed";
    const errorCode = error.code;
    console.log(errorCode);
    switch (errorCode) {
      case "auth/invalid-email":
        errorMessage = "Invalid email";
        break;
      case "auth/user-disabled":
        errorMessage = "User disabled";
        break;
      case "auth/user-not-found":
        errorMessage = "User not found";
        break;
      case "auth/wrong-password":
        errorMessage = "Invalid password";
        break;
    }
    yield put(loginFailure(errorMessage));
  }
}
