import { StyleSheet } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { postAPI } from "@/api";
import { Post, PostImage } from "@/types";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { GLOBAL_STYLE, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants";
import {
  CustomView,
  ImageModal,
  PostMultipleImage,
  PostSingleImage,
} from "@/components";
import { useAppSelector } from "@/hooks";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CommentBottomSheet } from "@/components/bottomSheet";
import { Divider } from "react-native-paper";
import { useBackHandler } from "@react-native-community/hooks";
import { useHeaderHeight } from "@react-navigation/elements";

const PostDetailScreen: React.FC<RootStackScreenProps<"PostDetail">> = ({
  route,
  navigation,
}) => {
  const { postId, initialScrollIndex, posts: postParam } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [imageModalSource, setImageModalSource] = useState<
    PostImage["baseUrl"] | null
  >(null);
  const [bottomSheetPost, setBottomSheetPost] = useState<Post | null>(null);
  const commentBottomSheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<FlashList<Post>>(null);

  useBackHandler(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (!postId) {
      if (postParam) {
        setPosts(postParam);
      }
    } else {
      const fetchPost = async () => {
        try {
          const posts = await postAPI.fetchOne(postId);
          if (posts) {
            setPosts(posts);
          }
        } catch (error) {}
      };
      fetchPost();
    }

    return () => {};
  }, [postId, postParam]);

  useEffect(() => {
    if (posts.length > 0 && initialScrollIndex && listRef.current) {
      // console.log(
      //   "PostDetailScreen -> postId",
      //   postParam?.length,
      //   initialScrollIndex
      // );
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: initialScrollIndex,
          animated: false,
        });
      });
    }
    return () => {};
  }, [initialScrollIndex, posts.length]);

  const handleOpenComment = useCallback((post: Post) => {
    setBottomSheetPost(post);
    commentBottomSheetRef.current?.present();
  }, []);

  const onImagePress = useCallback((source: PostImage["baseUrl"]) => {
    setImageModalSource(source);
  }, []);

  const onToggleLikePress = useCallback(
    async (postId: string) => {
      if (!currentUser?.id) return;
      const post = posts.find((item) => item.id === postId);
      const isLiked = !!post?.likes?.[currentUser?.id ?? ""];
      const oldPosts = [...posts];
      const updatedPost = posts.map((item) => {
        if (item.id === postId) {
          const isLiked = !!item?.likes?.[currentUser?.id ?? ""];
          const likeCountChange = isLiked ? -1 : 1;
          return {
            ...item,
            likesCount: (item?.likesCount || 0) + likeCountChange,
            likes: {
              ...item?.likes,
              [currentUser?.id]: !isLiked,
            },
          };
        }
      }) as Post[];

      setPosts(updatedPost);

      const { isSuccess } = await postAPI.likePost(
        postId,
        currentUser?.id!,
        isLiked ? "dislike" : "like"
      );

      try {
        if (!isSuccess) {
          setPosts(oldPosts);
        }
      } catch {}
    },
    [currentUser?.id, posts]
  );
  const headerHeight = useHeaderHeight();
  const renderItem: ListRenderItem<Post> = ({ item }) => {
    const liked = !!item.likes?.[currentUser?.id as string];
    return item.images.length === 1 ? (
      <PostSingleImage
        onPress={onImagePress}
        currentUser={currentUser}
        data={item}
        onCommentPress={() => handleOpenComment(item)}
        onToggleLikePress={onToggleLikePress}
        liked={liked}
      />
    ) : (
      <PostMultipleImage
        liked={liked}
        onPress={onImagePress}
        currentUser={currentUser}
        data={item}
        onCommentPress={() => handleOpenComment(item)}
        onToggleLikePress={onToggleLikePress}
      />
    );
  };

  return (
    <CustomView style={GLOBAL_STYLE.flex_1}>
      <FlashList
        ref={listRef}
        estimatedItemSize={375}
        estimatedListSize={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT - headerHeight,
        }}
        getItemType={(item) => {
          return item.images.length;
        }}
        ItemSeparatorComponent={() => <Divider />}
        scrollEventThrottle={16}
        data={posts}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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

export default PostDetailScreen;

const styles = StyleSheet.create({});
