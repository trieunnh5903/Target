import { StyleSheet, ListRenderItem } from "react-native";
import React, { memo, useCallback } from "react";
import { Post, PostImage, User } from "@/types";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";
import Header from "./Header";
import ActionGroups from "./ActionGroups";
import ImageArea from "./ImageArea";
import { FlatList } from "react-native-gesture-handler";
import CustomView from "../CustomView";
import { Text } from "react-native-paper";

interface PostMultipleImageProps {
  liked: boolean;
  data: Post;
  onCommentPress: () => void;
  currentUser: User | null;
  onToggleLikePress: (postId: string) => void;
  onPress: (source: PostImage["baseUrl"]) => void;
}

const PostMultipleImage: React.FC<PostMultipleImageProps> = memo(
  ({ data, onCommentPress, onToggleLikePress, liked, onPress }) => {
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

    const renderItem: ListRenderItem<PostImage> = useCallback(
      ({ item }) => {
        return (
          <ImageArea
            onPress={onPress}
            key={item.baseUrl.source}
            source={item}
          />
        );
      },
      [onPress]
    );
    return (
      <CustomView>
        <Header
          displayName={data.postedBy.displayName}
          avatarURL={data.postedBy.avatarURL}
        />

        <CustomView>
          <FlatList
            keyExtractor={(item) => item.baseUrl.source}
            data={data.images}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SPACING.medium,
            }}
            initialNumToRender={2}
            ItemSeparatorComponent={() => (
              <CustomView style={{ width: SPACING.medium }} />
            )}
            horizontal
            renderItem={renderItem}
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

        <CustomView style={styles.description}>
          {data.caption?.length > 0 && (
            <Text>
              <Text style={styles.textBold}>{data.postedBy.displayName}</Text>
              {"  "}
              {data.caption}
            </Text>
          )}
          <Text>{dayJs.getTimeFromNow(data.createdAt)}</Text>
        </CustomView>
      </CustomView>
    );
  }
);

PostMultipleImage.displayName = "PostMultipleImage";

export default PostMultipleImage;

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
