import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";
import {
  fetchPostsSuccess,
  likePostRequest,
  optimisticlikePost,
  selectPostById,
  sendPostFailure,
  sendPostRequest,
  sendPostSuccess,
} from "../slices/postSlice";
import { notificationAPI, postAPI } from "@/api";
import { FetchPostsResponse, Post } from "@/types";
import { eventChannel, EventChannel } from "redux-saga";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { RootState } from "../store";
import { Asset } from "expo-media-library";
import { ImageManipulator, ImageResult } from "expo-image-manipulator";
import Utils from "@/utils";
import { addPost } from "../slices/authSlice";

interface AuthState {
  user: FirebaseAuthTypes.User | null;
}

interface CroppedImage {
  thumbnailUri: ImageResult;
  baseUri: ImageResult;
}

interface UploadImage {
  thumbnailUrl: {
    source: string;
    width: number;
    height: number;
  };
  baseUrl: {
    width: number;
    height: number;
    source: string;
  };
}

export function* watchPostSaga() {
  yield fork(fetchPost);
  yield takeLatest(sendPostRequest.type, sendPostWorker);
  yield fork(watchLikePost);
}

const processImage = async (
  item: Asset,
  translate: { x: number; y: number }
) => {
  const rect = Utils.generateImageCropOptions({
    originalHeight: item.height,
    originalWidth: item.width,
    translationX: translate.x,
    translationY: translate.y,
  });

  const [thumbnailUri, baseUri] = await Promise.all([
    ImageManipulator.manipulate(item.uri)
      .crop(rect)
      .resize({ width: Math.min(700, item.width) })
      .renderAsync()
      .then((rendered) => rendered.saveAsync()),

    ImageManipulator.manipulate(item.uri)
      .resize({ width: Math.min(1080, item.width) })
      .renderAsync()
      .then((rendered) => rendered.saveAsync()),
  ]);

  return { thumbnailUri, baseUri };
};

const cropImages = async (
  assets: Asset[],
  translateAssets: {
    [id: string]: {
      x: number;
      y: number;
    };
  }
) => {
  try {
    return await Promise.all(
      assets.map(async (item) => {
        const translate = translateAssets[item.id] || { x: 0, y: 0 };
        return await processImage(item, translate);
      })
    );
  } catch (error) {
    throw new Error(`cropImage ${error} `);
  }
};

const uploadPostImages = async (images: CroppedImage[]) => {
  try {
    return await Promise.all(
      images.map(async (image) => {
        const baseUrl = await postAPI.uploadImage(image.baseUri.uri);
        const thumbnailUrl = await postAPI.uploadImage(image.thumbnailUri.uri);

        return {
          thumbnailUrl: {
            source: thumbnailUrl,
            width: image.thumbnailUri.width,
            height: image.thumbnailUri.height,
          },
          baseUrl: {
            width: image.baseUri.width,
            height: image.baseUri.height,
            source: baseUrl,
          },
        } as UploadImage;
      })
    );
  } catch (error) {
    console.log("uploadPostImages", error);
    throw new Error(error + "");
  }
};

function* sendPostWorker(action: ReturnType<typeof sendPostRequest>) {
  const { assets, caption, translateAssets } = action.payload;
  const userId: string | undefined = yield select(
    (state: RootState) => state.auth.currentUser?.id
  );

  if (!userId) {
    yield put(sendPostFailure("User doesnt exists"));
    return;
  }

  try {
    const croppedImages: CroppedImage[] = yield call(
      cropImages,
      assets,
      translateAssets
    );
    if (croppedImages.length === 0) {
      yield put(sendPostFailure("Failed to crop image"));
      return;
    }
    const sourceImages: UploadImage[] = yield call(
      uploadPostImages,
      croppedImages
    );

    const post: Post | undefined = yield call(postAPI.createPost, {
      userId,
      caption,
      images: sourceImages,
    });

    if (post) {
      yield put(sendPostSuccess(post));
      yield put(addPost(post));
    } else {
      yield put(sendPostFailure("Server error"));
    }
  } catch (error) {
    yield put(sendPostFailure(error + ""));
  }
}

function* watchLikePost() {
  while (true) {
    yield take(fetchPostsSuccess);
    yield takeLatest(likePostRequest.type, likePostWorker);
  }
}

function createAuthChannel(): EventChannel<AuthState> {
  return eventChannel((emitter) => {
    return auth().onAuthStateChanged((user) => {
      emitter({ user });
    });
  });
}

function* likePostWorker(action: ReturnType<typeof likePostRequest>) {
  const postId = action.payload.postId;

  const state: RootState = yield select();
  const currentUser = state.auth.currentUser;

  const post: Post | undefined = yield select(selectPostById, postId);
  if (currentUser?.id && post) {
    const isLiked = !!post?.likes?.[currentUser?.id];
    yield put(optimisticlikePost({ postId, userId: currentUser.id }));

    const {
      isSuccess,
    }: {
      isSuccess: boolean;
    } = yield call(
      postAPI.likePost,
      postId,
      currentUser.id,
      isLiked ? "dislike" : "like"
    );

    try {
      if (isSuccess) {
        // send notification
        const isInteracted = post.likes?.hasOwnProperty(currentUser.id);
        const shouldNotification =
          !isInteracted && post.postedBy.id !== currentUser?.id;
        if (shouldNotification) {
          const likeBy =
            currentUser?.displayName !== "User"
              ? currentUser?.displayName ?? "Someone"
              : "Someone";
          yield call(
            notificationAPI.notificationPostLiked,
            post.postedBy.id,
            likeBy,
            postId
          );
        } else {
          throw new Error("Already send notification");
        }
      } else {
        yield put(optimisticlikePost({ postId, userId: currentUser.id }));
      }
    } catch (error) {
      console.log(error);
    }
  }
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
