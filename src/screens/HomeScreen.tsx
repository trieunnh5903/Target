import { RefreshControl, StyleSheet } from "react-native";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  CustomView,
  ImageModal,
  PostMultipleImage,
  PostSingleImage,
} from "@/components";
import { Post, PostImage } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SPACING,
} from "@/constants";
import { CommentBottomSheet } from "@/components/bottomSheet";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchMorePosts,
  likePostRequest,
  refetchInitialPosts,
  selectAllPosts,
} from "@/redux/slices/postSlice";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { StatusBar } from "expo-status-bar";
import { RootTabScreenProps } from "@/types/navigation";
import {
  ActivityIndicator,
  Banner,
  Divider,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { Pressable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HomeScreen: React.FC<RootTabScreenProps<"Home">> = ({ navigation }) => {
  const posts = useAppSelector(selectAllPosts);
  const dispatch = useAppDispatch();
  const { lastPost, loadMoreStatus, reloadStatus, posting } = useAppSelector(
    (state) => state.posts
  );
  const theme = useTheme();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const listRef = useRef<FlashList<Post>>(null);
  const [bottomSheetPost, setBottomSheetPost] = useState<Post | null>(null);
  const commentBottomSheetRef = useRef<BottomSheetModal>(null);
  const [imageModalSource, setImageModalSource] = useState<
    PostImage["baseUrl"] | null
  >(null);

  useLayoutEffect(() => {
    const scrollToTop = () =>
      listRef.current?.scrollToOffset({ offset: 0, animated: true });

    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <CustomView paddingLeft={SPACING.medium}>
          <Pressable style={GLOBAL_STYLE.rowCenter} onPress={scrollToTop}>
            <CustomView paddingRight={SPACING.small}>
              <Image
                source={require("../../assets/splash.png")}
                style={{ height: 40, aspectRatio: 1 }}
              />
            </CustomView>

            <Text style={{ fontWeight: "900", fontSize: 18 }}>Target</Text>
          </Pressable>
        </CustomView>
      ),
      headerRight: () => (
        <CustomView>
          <IconButton
            containerColor="#f0f0f0"
            mode="contained-tonal"
            icon={"chat-outline"}
            onPress={() => navigation.navigate("ListChatRoom")}
          ></IconButton>
        </CustomView>
      ),
    });
    return () => {};
  }, [navigation]);

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
      dispatch(likePostRequest({ postId }));
    },
    [currentUser?.id, dispatch]
  );

  const onImagePress = useCallback((source: PostImage["baseUrl"]) => {
    setImageModalSource(source);
  }, []);

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
    <CustomView style={styles.container}>
      <StatusBar style="auto" />
      <FlashList
        overScrollMode="never"
        contentContainerStyle={{ backgroundColor: theme.colors.background }}
        ListHeaderComponent={
          <Banner
            visible={posting === "loading"}
            icon={({ color }) => (
              <MaterialCommunityIcons name="check" size={24} color={color} />
            )}
            contentStyle={{ backgroundColor: theme.colors.background }}
          >
            Your post is creating
          </Banner>
        }
        ref={listRef}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        estimatedItemSize={373}
        estimatedListSize={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT - 49 - 80,
        }}
        getItemType={(item) => {
          return item.images.length;
        }}
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
          <CustomView style={styles.loadingContainer}>
            {loadMoreStatus === "loading" && <ActivityIndicator size="small" />}
          </CustomView>
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
