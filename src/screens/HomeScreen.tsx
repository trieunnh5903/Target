import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  CustomView,
  ImageModal,
  PostMultipleImage,
  PostSingleImage,
} from "@/components";
import { Post, PostImage } from "@/types";
import { postAPI } from "@/api/postApi";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GLOBAL_STYLE, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants";
import { CommentBottomSheet } from "@/components/bottomSheet";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { notificationAPI } from "@/api";
import {
  fetchMorePosts,
  postUpdated,
  refetchInitialPosts,
  selectAllPosts,
  selectPostById,
} from "@/redux/slices/postSlice";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { store } from "@/redux/store";
import { StatusBar } from "expo-status-bar";

const HomeScreen = () => {
  const posts = useAppSelector(selectAllPosts);
  const dispatch = useAppDispatch();
  const { lastPost, loadMoreStatus, reloadStatus } = useAppSelector(
    (state) => state.posts
  );
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [bottomSheetPost, setBottomSheetPost] = useState<Post | null>(null);
  const commentBottomSheetRef = useRef<BottomSheetModal>(null);
  const [imageModalSource, setImageModalSource] = useState<
    PostImage["baseUrl"] | null
  >(null);
  const onRefresh = React.useCallback(async () => {
    dispatch(refetchInitialPosts());
  }, [dispatch]);

  const handleLoadMore = async () => {
    if (!lastPost) return;
    dispatch(fetchMorePosts(lastPost));
  };

  const handleOpenComment = useCallback((post: Post) => {
    setBottomSheetPost(post);
    commentBottomSheetRef.current?.present();
  }, []);

  const onToggleLikePress = useCallback(
    async (postId: string) => {
      if (!currentUser?.id) return;
      const post = selectPostById(store.getState(), postId);
      const isLiked = !!post?.likes?.[currentUser?.id ?? ""];
      const likeCountChange = isLiked ? -1 : 1;
      dispatch(
        postUpdated({
          id: postId,
          changes: {
            likes: {
              ...post?.likes,
              [currentUser?.id]: !isLiked,
            },
            likesCount: (post?.likesCount || 0) + likeCountChange,
          },
        })
      );

      const { isSuccess } = await postAPI.likePost(
        postId,
        currentUser?.id!,
        isLiked ? "dislike" : "like"
      );

      try {
        if (isSuccess) {
          const isInteracted = post.likes?.hasOwnProperty(currentUser.id);
          const shouldNotification =
            !isInteracted && post.postedBy.id !== currentUser?.id;
          if (shouldNotification) {
            await notificationAPI.notificationPostLiked(
              post.postedBy.id,
              currentUser?.displayName ?? "Someone",
              postId
            );
          }
        } else {
          dispatch(
            postUpdated({
              id: postId,
              changes: {
                likes: {
                  ...post?.likes,
                  [currentUser?.id]: isLiked,
                },
                likesCount: post?.likesCount || 0,
              },
            })
          );
        }
      } catch {}
    },
    [currentUser?.displayName, currentUser?.id, dispatch]
  );

  const onImagePress = useCallback((source: PostImage["baseUrl"]) => {
    setImageModalSource(source);
  }, []);

  const renderItem: ListRenderItem<Post> = ({ item }) => {
    if (item.images.length === 1) {
      return (
        <PostSingleImage
          onPress={onImagePress}
          currentUser={currentUser}
          data={item}
          onCommentPress={() => handleOpenComment(item)}
          onToggleLikePress={onToggleLikePress}
        />
      );
    } else {
      return (
        <PostMultipleImage
          onPress={onImagePress}
          currentUser={currentUser}
          data={item}
          onCommentPress={() => handleOpenComment(item)}
          onToggleLikePress={onToggleLikePress}
        />
      );
    }
  };
  return (
    <CustomView style={styles.container}>
      <StatusBar style="auto" />
      <FlashList
        estimatedItemSize={366.5}
        estimatedListSize={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT - 49 - 80,
        }}
        getItemType={(item) => {
          return item.images.length;
        }}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={reloadStatus === "loading"}
            onRefresh={onRefresh}
          />
        }
        scrollEventThrottle={16}
        data={posts}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <View style={styles.loadingContainer}>
            {loadMoreStatus === "loading" && <ActivityIndicator size="small" />}
          </View>
        }
      />

      <CommentBottomSheet
        ref={commentBottomSheetRef}
        selectedPost={bottomSheetPost}
      />

      {imageModalSource && (
        <ImageModal
          isOpen={!!imageModalSource}
          onClose={() => setImageModalSource(null)}
          source={imageModalSource}
        />
      )}
    </CustomView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  footerInput: {
    ...GLOBAL_STYLE.rowHCenter,
    gap: 10,
  },
  container: { flex: 1, backgroundColor: "white" },
  loadingContainer: {
    padding: 16,
  },
});
