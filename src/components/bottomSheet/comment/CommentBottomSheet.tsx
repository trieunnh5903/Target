import { StyleSheet } from "react-native";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetFooterProps,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useBackHandler } from "@react-native-community/hooks";
import firestore from "@react-native-firebase/firestore";
import { notificationAPI, postAPI } from "@/api";
import { Comment, Post } from "@/types";
import CommentItem from "../../CommentItem";
import dayjs from "dayjs";
import { postsCollection } from "@/api/collections";
import {
  GLOBAL_STYLE,
  SCREEN_HEIGHT,
  SPACING,
  STATUS_BAR_HEIGHT,
} from "@/constants";
import { CommentSkeleton } from "../../skeleton";
import CustomView from "../../CustomView";
import { postUpdated } from "@/redux/slices/postSlice";
import CommentBottomSheetFooter from "./CommentBottomSheetFooter";
import { Text } from "react-native-paper";

interface CommentBottomSheetProps {
  selectedPost: Post | null;
}
const FOOTER_HEIGHT = 102;
const unicodeArray = [
  "\u2764", // ❤
  "\u{1F64C}", // 🙌
  "\u{1F60E}", // 😎
  "\u{1F600}", // 😀
  "\u{1F601}", // 😁
  "\u{1F602}", // 😂
  "\u{1F923}", // 🤣
  "\u{1F60A}", // 😊
  "\u{1F60D}", // 😍
  "\u{1F914}", // 🤔
  "\u{1F44D}", // 👍
  "\u{1F44C}", // 👌
];
const CommentBottomSheet = forwardRef<
  BottomSheetModal,
  CommentBottomSheetProps
>(({ selectedPost }, ref) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [comments, setComments] = useState<Comment[]>([]);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const commentText = useRef("");
  const { bottom: bottomSafeArea, top: topSafeArea } = useSafeAreaInsets();
  const isBottomSheetOpen = useRef(false);
  const snapPoints = useMemo(() => ["100%"], []);
  const { dismissAll } = useBottomSheetModal();
  const dispatch = useAppDispatch();
  console.log("CommentBottomSheetComponent");

  useEffect(() => {
    (async () => {
      setComments([]);
      setIsFetching(true);
      try {
        if (!selectedPost?.id) return;
        const data = await postAPI.fetchComments(selectedPost.id);
        setComments(data);
      } catch {
        setComments([]);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [selectedPost]);

  useBackHandler(() => {
    if (isBottomSheetOpen.current) {
      dismissAll();
      return true;
    }
    return false;
  });

  const onCommentTextChange = useCallback(
    (value: string) => (commentText.current = value),
    []
  );

  const sendCommentToServer = useCallback(async () => {
    if (!currentUser || !selectedPost) return;
    try {
      await firestore().runTransaction(async (transaction) => {
        await postAPI.addComment({
          content: commentText.current.trim(),
          postId: selectedPost.id,
          userId: currentUser.id,
        });

        const postSnapshot = await transaction.get(
          postsCollection.doc(selectedPost.id)
        );
        if (!postSnapshot.exists) return;
        transaction.update(postsCollection.doc(selectedPost.id), {
          commentsCount: (postSnapshot.data()?.commentsCount ?? 0) + 1,
        });
      });
    } catch (error) {
      console.error("Lỗi thêm bình luận:", error);
      throw new Error(`${error}`);
    }

    setTimeout(() => {
      setSendingId(null);
    }, 1000);
  }, [currentUser, selectedPost]);

  const notificationNewComment = useCallback(async () => {
    if (!selectedPost) return;
    try {
      const isInteracted = selectedPost.comments?.hasOwnProperty(
        currentUser?.id ?? ""
      );
      if (!isInteracted && currentUser?.id !== selectedPost.postedBy.id) {
        await notificationAPI.notificationPostCommented(
          selectedPost.postedBy.id,
          currentUser?.displayName,
          selectedPost.id
        );
      }
    } catch (error) {
      console.log("notificationNewComment", error);
      throw new Error(error as string);
    }
  }, [currentUser?.displayName, currentUser?.id, selectedPost]);

  const handleOptimisticUpdateFailed = useCallback(
    (commentId: string) => {
      if (!selectedPost?.id) return;
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      dispatch(
        postUpdated({
          id: selectedPost.id,
          changes: {
            commentsCount: selectedPost?.commentsCount,
          },
        })
      );
    },
    [dispatch, selectedPost]
  );

  const handleOptimisticUpdateSuccess = useCallback(
    (commentId: string) => {
      if (
        commentText.current.trim() === "" ||
        !selectedPost?.id ||
        !currentUser?.id
      )
        return;
      const now = dayjs();
      const newCommentData: Comment = {
        id: commentId,
        userId: currentUser.id,
        content: commentText.current,
        createdAt: Math.floor(now.valueOf() / 1000),
        avatarURL: currentUser.avatarURL,
        displayName: currentUser.displayName,
        postId: selectedPost.id,
      };

      setSendingId(newCommentData.id);
      setComments((prevComments) => [newCommentData, ...prevComments]);
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
      dispatch(
        postUpdated({
          id: selectedPost.id,
          changes: {
            commentsCount: (selectedPost?.commentsCount || 0) + 1,
          },
        })
      );
    },
    [currentUser, dispatch, selectedPost]
  );

  const onSendMessagePress = useCallback(() => {
    (async () => {
      if (!selectedPost?.id || !currentUser?.id) return;
      const optimisticCommentId = Date.now().toString();
      handleOptimisticUpdateSuccess(optimisticCommentId);
      try {
        await sendCommentToServer();
      } catch {
        handleOptimisticUpdateFailed(optimisticCommentId);
      }
      try {
        await notificationNewComment();
      } catch {}
    })();
  }, [
    currentUser?.id,
    handleOptimisticUpdateFailed,
    handleOptimisticUpdateSuccess,
    notificationNewComment,
    selectedPost?.id,
    sendCommentToServer,
  ]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index !== -1 && !isBottomSheetOpen.current) {
      isBottomSheetOpen.current = true;
    }
  }, []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      return (
        <CommentBottomSheetFooter
          height={FOOTER_HEIGHT}
          emojis={unicodeArray}
          onChangeText={onCommentTextChange}
          onSendPress={onSendMessagePress}
          {...props}
        />
      );
    },
    [onCommentTextChange, onSendMessagePress]
  );

  const renderEmptyComponent = useCallback(() => {
    return isFetching ? (
      <CustomView>
        {Array.from({
          length: Math.ceil(
            (SCREEN_HEIGHT - 24 - STATUS_BAR_HEIGHT - FOOTER_HEIGHT) / 60
          ),
        }).map((_, index) => {
          return (
            <CustomView key={`CommentSkeleton-${index}`}>
              <CommentSkeleton />
            </CustomView>
          );
        })}
      </CustomView>
    ) : (
      <CustomView
        paddingTop={SPACING.large}
        style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.alignItemsCenter]}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          No comments yet
        </Text>
        <Text>Start a conversation</Text>
      </CustomView>
    );
  }, [isFetching]);

  return (
    <BottomSheetModal
      ref={ref}
      onChange={handleSheetChanges}
      snapPoints={snapPoints}
      topInset={topSafeArea}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      bottomInset={bottomSafeArea}
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetFlatList
        ref={listRef}
        contentContainerStyle={[styles.listCommentContainer]}
        ListEmptyComponent={renderEmptyComponent}
        data={comments}
        keyExtractor={(comment) => comment.id}
        renderItem={({ item }) => (
          <CommentItem comment={item} commentSendingId={sendingId} />
        )}
        ListFooterComponent={<CustomView paddingTop={FOOTER_HEIGHT} />}
      />
    </BottomSheetModal>
  );
});
CommentBottomSheet.displayName = "CommentBottomSheet";
export default memo(CommentBottomSheet);

const styles = StyleSheet.create({
  listCommentContainer: {
    padding: 16,
    paddingBottom: 0,
    gap: 24,
    minHeight: SCREEN_HEIGHT - 24 - STATUS_BAR_HEIGHT,
  },
});
