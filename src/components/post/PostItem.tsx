import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import React, { Fragment, memo, useState } from "react";
import { Post, User } from "@/types";
import { Image } from "expo-image";
import ThemedText from "../ThemedText";
import CustomView from "../CustomView";
import Animated from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";
import { postsCollection } from "@/api/collections";
import firestore from "@react-native-firebase/firestore";
import { useAppSelector } from "@/hooks";
import { notificationAPI } from "@/api";
import CustomAvatar from "../CustomAvatar";
import { isNumber } from "lodash";

interface PostItemProps {
  data: Post;
  onCommentPress: () => void;
}

interface PostMediaProps extends PostItemProps {
  isLike: boolean;
  toggleLike: () => void;
  likesCount: number;
}

const PostItem: React.FC<PostItemProps> = ({ data, onCommentPress }) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [liked, setLiked] = useState(
    data.likes && data.likes[currentUser?.uid as string] === true ? true : false
  );
  const [likesCount, setLikesCount] = useState(data.likesCount ?? 0);
  const toggleLike = async () => {
    setLiked(!liked);
    setLikesCount(likesCount + (liked ? -1 : 1));
    try {
      const postRef = postsCollection.doc(data.id);
      await firestore().runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error("Post does not exist!");
        }
        const currentLikesCount = postDoc.data()?.likesCount ?? 0;
        const plusWith = liked ? -1 : 1;
        const newLikesCount = currentLikesCount + plusWith;
        transaction.update(postRef, {
          likesCount: newLikesCount,
          [`likes.${currentUser?.uid}`]: !liked,
        });
      });

      const isInteracted = data.likes?.hasOwnProperty(currentUser?.uid ?? "");

      if (!isInteracted && data.postedBy.uid !== currentUser?.uid) {
        await notificationAPI.notificationPostLiked(
          data.postedBy.uid,
          currentUser?.displayName ?? "Someone",
          data.id
        );
      }
    } catch (error) {
      console.log("toggleLike", error);
      setLiked(liked);
    }
  };

  return (
    <CustomView>
      <PostHeader {...data.postedBy} />
      <PostMedia
        onCommentPress={onCommentPress}
        data={data}
        isLike={liked}
        likesCount={likesCount}
        toggleLike={toggleLike}
      />
    </CustomView>
  );
};

const PostHeader = (props: User) => {
  return (
    <CustomView style={styles.postHeader}>
      <CustomAvatar size={"small"} avatarUrl={props.avatarURL} />
      <ThemedText>{props.displayName}</ThemedText>
    </CustomView>
  );
};

const PostMedia = ({
  data,
  isLike,
  toggleLike,
  likesCount,
  onCommentPress,
}: PostMediaProps) => {
  const dimension = useWindowDimensions();
  const theme = useTheme();

  return (
    <Fragment>
      <Animated.ScrollView
        scrollEventThrottle={16}
        pagingEnabled
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        <Image
          source={data.images}
          style={{ width: dimension.width, aspectRatio: 1 }}
        />
      </Animated.ScrollView>

      <View style={styles.actionsWrapper}>
        <CustomView style={styles.action}>
          <MaterialCommunityIcons
            name={isLike ? "heart" : "heart-outline"}
            onPress={toggleLike}
            size={24}
            color={isLike ? theme.colors.error : theme.colors.onBackground}
          />
          <ThemedText style={styles.textBold}>{likesCount}</ThemedText>
        </CustomView>

        <CustomView style={styles.action}>
          <Ionicons
            onPress={onCommentPress}
            name="chatbubble-outline"
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
  );
};

export default memo(PostItem);

const styles = StyleSheet.create({
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
