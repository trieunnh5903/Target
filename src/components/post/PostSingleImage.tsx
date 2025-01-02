import { StyleSheet, Text, View } from "react-native";
import React, { memo, useCallback } from "react";
import { Post, PostImage, User } from "@/types";
import CustomView from "../CustomView";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";
import Header from "./Header";
import ActionGroups from "./ActionGroups";
import ImageArea from "./ImageArea";

interface PostSingleImageProps {
  data: Post;
  onCommentPress: () => void;
  currentUser: User | null;
  onToggleLikePress: (postId: string) => void;
  onPress: (source: PostImage["baseUrl"]) => void;
}

const PostSingleImage: React.FC<PostSingleImageProps> = memo(
  ({ data, onCommentPress, onToggleLikePress, currentUser, onPress }) => {
    const liked = !!data.likes?.[currentUser?.id as string];
    const animatedIsLiked = useSharedValue(liked);
    const heartProgress = useSharedValue(1);
    const isDoubleTap = useSharedValue(false);

    const onActionLikePress = async () => {
      isDoubleTap.value = false;
      await handeToggleLike();
    };

    const handeToggleLike = useCallback(async () => {
      if (!isDoubleTap.value) {
        heartProgress.value = 0;
        heartProgress.value = withSpring(1);
      }
      onToggleLikePress(data.id);
    }, [data.id, heartProgress, isDoubleTap, onToggleLikePress]);

    return (
      <View>
        <Header
          displayName={data.postedBy.displayName}
          avatarURL={data.postedBy.avatarURL}
        />

        <CustomView
          paddingLeft={SPACING.medium}
          style={{ alignItems: "flex-start" }}
        >
          <ImageArea
            onPress={onPress}
            animatedIsLiked={animatedIsLiked}
            heartProgress={heartProgress}
            isDoubleTap={isDoubleTap}
            aleadyLiked={liked}
            onDoubleTapPress={handeToggleLike}
            source={data.images[0]}
          />
        </CustomView>

        <ActionGroups
          alreadyLiked={liked}
          animatedIsLiked={animatedIsLiked}
          commentsCount={data.commentsCount ?? 0}
          heartProgress={heartProgress}
          isDoubleTap={isDoubleTap}
          likesCount={data.likesCount ?? 0}
          onCommentPress={onCommentPress}
          onLikePress={onActionLikePress}
        />

        <View style={styles.description}>
          {data.caption?.length > 0 ? (
            <>
              <Text>
                <Text style={styles.textBold}>{data.postedBy.displayName}</Text>
                {"  "}
                {data.caption}
              </Text>
              <Text>{dayJs.getTimeFromNow(data.createdAt)}</Text>
            </>
          ) : (
            <Text>{dayJs.getTimeFromNow(data.createdAt)}</Text>
          )}
        </View>
      </View>
    );
  }
);

PostSingleImage.displayName = "PostSingleImage";

export default PostSingleImage;

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
    paddingBottom: SPACING.medium,
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
