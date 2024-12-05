import { StatusBar, StyleSheet, Text, View } from "react-native";
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
  BottomSheetFooterProps,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "@/hooks";
import { useSharedValue } from "react-native-reanimated";
import { useBackHandler } from "@react-native-community/hooks";

import CommentBottomSheetFooter from "./CommentBottomSheetFooter";
import { postAPI } from "@/api";
import { Comment } from "@/types";
import CommentItem from "../CommentItem";
import dayjs from "dayjs";

interface CommentBottomSheetProps {
  postId: string | null;
}

const CommentBottomSheet = forwardRef<
  BottomSheetModal,
  CommentBottomSheetProps
>(({ postId }, ref) => {
  const [comments, setComments] = useState<Comment[]>([]);
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
        if (!postId) return;
        setIsFetching(true);
        const data = await postAPI.fetchComments(postId);
        setComments(data);
      } catch (error) {
        setComments([]);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [postId]);

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

  const handleSendMessage = useCallback(async () => {
    if (commentText.current.trim() === "" || !postId || !user?.uid) return;
    const now = dayjs();
    const newCommentData: Comment = {
      id: Date.now().toString(),
      userId: user.uid,
      content: commentText.current,
      createdAt: {
        seconds: Math.floor(now.valueOf() / 1000),
        nanoseconds: now.valueOf(),
      },
      avatarUrl: user.photoURL!,
      displayName: user.displayName || "User",
      postId,
    };

    setSendingId(newCommentData.id);
    setComments((prevComments) => [newCommentData, ...prevComments]);
    try {
      await postAPI.addComment({
        content: commentText.current.trim(),
        postId: postId,
        userId: user.uid,
      });
    } catch (error) {
      console.error("Lỗi thêm bình luận:", error);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== newCommentData.id)
      );
    }

    setTimeout(() => {
      setSendingId(null);
    }, 1000);
  }, [postId, user]);

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
        onSendPress={handleSendMessage}
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
