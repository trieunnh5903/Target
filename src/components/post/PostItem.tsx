import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import React, { Fragment, memo, useState } from "react";
import { Post } from "@/types";
import ThemedText from "../ThemedText";
import CustomView from "../CustomView";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";
import { useAppSelector } from "@/hooks";
import CustomAvatar from "../CustomAvatar";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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
  const dimension = useWindowDimensions();
  const theme = useTheme();
  const heartProgress = useSharedValue(1);
  const isDoubleTap = useSharedValue(false);
  const preLikedShareValue = useSharedValue(liked);

  const onLikePress = () => {
    isDoubleTap.value = false;
    toggleLike();
  };

  const toggleLike = async () => {
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
    }
  };

  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      isDoubleTap.value = true;
      preLikedShareValue.value = liked;
    })
    .onEnd(() => {
      heartProgress.value = 0;
      heartProgress.value = withSpring(1);
      if (!liked) {
        runOnJS(toggleLike)();
      }
    });

  const bigHeartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isDoubleTap.value
        ? interpolate(
            heartProgress.value,
            [0.8, 1],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
      transform: [
        {
          scale: heartProgress.value,
        },
      ],
    };
  });

  const smallHeartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale:
            isDoubleTap.value && preLikedShareValue.value
              ? Math.max(1, heartProgress.value)
              : heartProgress.value,
        },
      ],
    };
  });

  return (
    <CustomView>
      <CustomView style={styles.postHeader}>
        <CustomAvatar size={"small"} avatarUrl={data.postedBy.avatarURL} />
        <ThemedText>{data.postedBy.displayName}</ThemedText>
      </CustomView>

      <Fragment>
        <Animated.ScrollView
          scrollEventThrottle={16}
          pagingEnabled
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          <CustomView style={GLOBAL_STYLE.center}>
            <GestureDetector gesture={tapGesture}>
              <Animated.Image
                source={{ uri: data.images }}
                style={{ width: dimension.width, aspectRatio: 1 }}
              />
            </GestureDetector>
            <Animated.View
              pointerEvents={"none"}
              style={[styles.bigHeartContainer, bigHeartAnimatedStyle]}
            >
              <Octicons
                name="heart-fill"
                size={SCREEN_WIDTH * 0.3}
                color={"white"}
              />
            </Animated.View>
          </CustomView>
        </Animated.ScrollView>

        <View style={styles.actionsWrapper}>
          <CustomView style={styles.action}>
            <Animated.View style={smallHeartAnimatedStyle}>
              <Octicons
                name={liked ? "heart-fill" : "heart"}
                onPress={onLikePress}
                size={24}
                color={liked ? theme.colors.error : theme.colors.onBackground}
              />
            </Animated.View>

            {likesCount > 0 && (
              <ThemedText style={styles.textBold}>{likesCount}</ThemedText>
            )}
          </CustomView>

          <CustomView style={styles.action}>
            <Octicons
              name="comment-discussion"
              onPress={onCommentPress}
              size={24}
              color="black"
            />
            <ThemedText style={styles.textBold}>
              {data.commentsCount && data.commentsCount > 0
                ? data.commentsCount
                : ""}
            </ThemedText>
          </CustomView>
        </View>

        <View style={styles.description}>
          <Text>
            <Text style={styles.textBold}>{data.postedBy.displayName}</Text>
            {"  "}
            {data.caption}
          </Text>
          <Text>{dayJs.getTimeFromNow(data.createdAt.seconds)}</Text>
        </View>
      </Fragment>
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
  postHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerAccount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
