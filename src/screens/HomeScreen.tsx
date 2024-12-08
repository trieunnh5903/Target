import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { PostItem, CustomView } from "@/components";
import { Post } from "@/types";
import { postAPI } from "@/api/postApi";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GLOBAL_STYLE } from "@/constants";
import { CommentBottomSheet } from "@/components/bottomSheet";
import { useAppSelector } from "@/hooks";
import { notificationAPI } from "@/api";

const HomeScreen = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const currentToken = useAppSelector(
    (state) => state.notification.expoPushToken
  );
  console.log("currentToken", currentToken);
  const [bottomSheetPost, setBottomSheetPost] = useState<Post | null>(null);
  const commentBottomSheetRef = useRef<BottomSheetModal>(null);
  const [lastPost, setLastPost] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(
      null
    );

  const onRefresh = React.useCallback(async () => {
    try {
      const data = await postAPI.getPosts({ limit: 10 });
      setPosts(data.posts);
      setLastPost(data.lastPost);
      setRefreshing(false);
    } catch (error) {
      console.log("onRefresh", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await postAPI.getPosts({ limit: 10 });
        setPosts(data.posts);
        setLastPost(data.lastPost);
      } catch (error) {
        console.log("getPosts", error);
      }
    })();
  }, []);

  const handleLoadMore = async () => {
    if (!lastPost || loading) return;
    try {
      setLoading(true);
      const data = await postAPI.getPosts({ limit: 10, lastPost });
      setPosts([...posts, ...data.posts]);
      setLastPost(data.lastPost);
    } catch (error) {
      console.log("handleLoadMore", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenComment = useCallback((post: Post) => {
    setBottomSheetPost(post);
    commentBottomSheetRef.current?.present();
  }, []);

  const onToggleLikePress = useCallback(
    async (
      postId: string,
      postAuthorId: string,
      alreadyLiked: boolean,
      shouldNotification: boolean
    ) => {
      try {
        const { isSuccess } = await postAPI.likePost(
          postId,
          currentUser?.id!,
          alreadyLiked ? "dislike" : "like"
        );
        if (!isSuccess) return { isLikeSuccess: isSuccess };
        if (shouldNotification) {
          await notificationAPI.notificationPostLiked(
            postAuthorId,
            currentUser?.displayName ?? "Someone",
            postId
          );
        }
        return { isLikeSuccess: isSuccess };
      } catch (error) {
        return { isLikeSuccess: true };
      }
    },
    [currentUser?.displayName, currentUser?.id]
  );
  return (
    <CustomView style={styles.container}>
      <Animated.FlatList
        overScrollMode="never"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        data={posts}
        renderItem={({ item }) => {
          return (
            <PostItem
              data={item}
              onCommentPress={() => handleOpenComment(item)}
              onToggleLikePress={onToggleLikePress}
            />
          );
        }}
        pinchGestureEnabled={false}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<ActivityIndicator size="small" />}
        ListFooterComponent={
          <View style={styles.loadingContainer}>
            {loading && <ActivityIndicator size="small" />}
          </View>
        }
      />
      <CommentBottomSheet
        ref={commentBottomSheetRef}
        selectedPost={bottomSheetPost}
      />
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
