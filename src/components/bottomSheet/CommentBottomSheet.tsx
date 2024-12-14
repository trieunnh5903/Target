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
import { useAppSelector } from "@/hooks";
import { useSharedValue } from "react-native-reanimated";
import { useBackHandler } from "@react-native-community/hooks";
import firestore from "@react-native-firebase/firestore";
import CommentBottomSheetFooter from "./CommentBottomSheetFooter";
import { notificationAPI, postAPI } from "@/api";
import { Comment, Post } from "@/types";
import CommentItem from "../CommentItem";
import dayjs from "dayjs";
import { postsCollection } from "@/api/collections";
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from "@/constants";
import { CommentSkeleton } from "../skeleton";
import CustomView from "../CustomView";

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
  const animatedPosition = useSharedValue(0);
  const commentText = useRef("");
  const { bottom: bottomSafeArea, top: topSafeArea } = useSafeAreaInsets();
  const isBottomSheetOpen = useRef(false);
  const snapPoints = useMemo(() => ["100%"], []);
  const { dismissAll } = useBottomSheetModal();

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
    if (
      commentText.current.trim() === "" ||
      !selectedPost?.id ||
      !currentUser?.id
    )
      return;
    const now = dayjs();
    const newCommentData: Comment = {
      id: Date.now().toString(),
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
          commentsCount: postSnapshot.data()?.commentsCount ?? 0 + 1,
        });
      });
    } catch (error) {
      console.error("Lỗi thêm bình luận:", error);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== newCommentData.id)
      );
      throw new Error(`${error}`);
    }

    setTimeout(() => {
      setSendingId(null);
    }, 1000);
  }, [selectedPost?.id, currentUser]);

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

  const onSendMessagePress = useCallback(() => {
    (async () => {
      try {
        await sendCommentToServer();
        await notificationNewComment();
      } catch {}
    })();
  }, [notificationNewComment, sendCommentToServer]);

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
    if (!isFetching) return;
    return (
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
      animatedPosition={animatedPosition}
      bottomInset={bottomSafeArea}
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
