import { StyleSheet, Text, View } from "react-native";
import React, { memo, useState } from "react";
import { Post } from "@/types";
import CustomView from "../CustomView";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";
import { useAppSelector } from "@/hooks";
import Header from "./Header";
import ImageArea from "./ImageArea";
import ActionGroups from "./ActionGroups";

interface PostItemProps {
  data: Post;
  onCommentPress: () => void;
  onToggleLikePress: (
    postId: string,
    postAuthorId: string,
    alreadyLiked: boolean,
    shouldNotification: boolean
  ) => Promise<{
    isLikeSuccess: boolean;
  }>;
}

const PostItem: React.FC<PostItemProps> = ({
  data,
  onCommentPress,
  onToggleLikePress,
}) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [liked, setLiked] = useState(
    data.likes && data.likes[currentUser?.id as string] === true ? true : false
  );
  const [likesCount, setLikesCount] = useState(data.likesCount ?? 0);
  const heartProgress = useSharedValue(1);
  const isDoubleTap = useSharedValue(false);
  const animatedIsLiked = useSharedValue(liked);

  const onLikePress = async () => {
    isDoubleTap.value = false;
    await toggleLike();
  };

  let isProcessing = false;
  const toggleLike = async () => {
    if (isProcessing) return; // Nếu đang xử lý, không gửi thêm yêu cầu
    isProcessing = true;
    if (!isDoubleTap.value) {
      heartProgress.value = 0;
      heartProgress.value = withSpring(1);
    }

    setLiked(!liked);
    setLikesCount(likesCount + (liked ? -1 : 1));

    const isInteracted = data.likes?.hasOwnProperty(currentUser?.id ?? "");
    const shouldNotification =
      !isInteracted && data.postedBy.id !== currentUser?.id;

    try {
      const { isLikeSuccess } = await onToggleLikePress(
        data.id,
        data.postedBy.id,
        liked,
        shouldNotification
      );

      if (!isLikeSuccess) {
        setLiked(liked);
      }
    } catch (error) {
      console.log("toggleLike", error);
    } finally {
      isProcessing = false;
    }
  };

  return (
    <CustomView>
      <Header
        displayName={data.postedBy.displayName}
        avatarURL={data.postedBy.avatarURL}
      />

      <ImageArea
        animatedIsLiked={animatedIsLiked}
        heartProgress={heartProgress}
        isDoubleTap={isDoubleTap}
        aleadyLiked={liked}
        onDoubleTapPress={toggleLike}
        source={data.images}
      />

      <ActionGroups
        alreadyLiked={liked}
        animatedIsLiked={animatedIsLiked}
        commentsCount={data.commentsCount ?? 0}
        heartProgress={heartProgress}
        isDoubleTap={isDoubleTap}
        likesCount={likesCount}
        onCommentPress={onCommentPress}
        onLikePress={onLikePress}
      />

      <View style={styles.description}>
        <Text>
          <Text style={styles.textBold}>{data.postedBy.displayName}</Text>
          {"  "}
          {data.caption}
        </Text>
        <Text>{dayJs.getTimeFromNow(data.createdAt.seconds)}</Text>
      </View>
    </CustomView>
  );
};

export default memo(PostItem);

const styles = StyleSheet.create({
  bigHeartContainer: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  action: {
    flexDirection: "row",
    gap: SPACING.small / 2,
    alignItems: "center",
  },
  description: {
    paddingHorizontal: SPACING.medium,
  },
  textBold: {
    fontWeight: "bold",
  },
  shadow: {
    textShadowRadius: 20,
    textShadowOffset: { width: 1, height: 1 },
  },
  heart: {
    position: "absolute",
  },
  indicatorContainer: {
    gap: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 20,
    backgroundColor: "red",
  },
  activeIndicator: {},
  reactions: {
    paddingHorizontal: 16,
  },
  actionsWrapper: {
    gap: SPACING.medium,
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
    ...GLOBAL_STYLE.rowHCenter,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 1000,
  },

  headerAccount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
