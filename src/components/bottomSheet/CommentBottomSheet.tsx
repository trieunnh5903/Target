import { StyleSheet } from "react-native";
import React, {
  forwardRef,
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

interface CommentBottomSheetProps {
  selectedPost: Post | null;
}

const CommentBottomSheet = forwardRef<
  BottomSheetModal,
  CommentBottomSheetProps
>(({ selectedPost }, ref) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [comments, setComments] = useState<Comment[]>([]);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const animatedPosition = useSharedValue(0);
  const commentText = useRef("");
  const { bottom: bottomSafeArea, top: topSafeArea } = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.currentUser);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const snapPoints = useMemo(() => ["100%"], []);
  const { dismissAll } = useBottomSheetModal();
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

  console.log("CommentBottomSheetComponent");

  useEffect(() => {
    (async () => {
      try {
        if (!selectedPost?.id) return;
        setIsFetching(true);
        const data = await postAPI.fetchComments(selectedPost.id);
        setComments(data);
      } catch (error) {
        setComments([]);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [selectedPost]);

  useBackHandler(() => {
    if (isBottomSheetOpen) {
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
    if (commentText.current.trim() === "" || !selectedPost?.id || !user?.id)
      return;
    const now = dayjs();
    const newCommentData: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      content: commentText.current,
      createdAt: {
        seconds: Math.floor(now.valueOf() / 1000),
        nanoseconds: now.valueOf(),
      },
      avatarURL: user.avatarURL,
      displayName: user.displayName || "User",
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
          userId: user.id,
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
  }, [selectedPost?.id, user]);

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
      } catch (error) {}
    })();
  }, [notificationNewComment, sendCommentToServer]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index !== -1 && !isBottomSheetOpen) {
        setIsBottomSheetOpen(true);
      }
    },
    [isBottomSheetOpen]
  );
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

  const renderFooter = (props: BottomSheetFooterProps) => {
    return (
      <CommentBottomSheetFooter
        emojis={unicodeArray}
        {...props}
        user={user}
        onChangeText={onCommentTextChange}
        onSendPress={onSendMessagePress}
      />
    );
  };
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
        data={comments}
        keyExtractor={(comment) => comment.id}
        renderItem={({ item }) => (
          <CommentItem comment={item} commentSendingId={sendingId} />
        )}
      />
    </BottomSheetModal>
  );
});
CommentBottomSheet.displayName = "CommentBottomSheet";
export default CommentBottomSheet;

const styles = StyleSheet.create({
  listCommentContainer: { padding: 16, gap: 24, minHeight: "70%" },
});
