import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import React, { Fragment, memo, useCallback } from "react";
import ThemedView from "../ThemedView";
import { Post, User } from "@/types";
import { Image } from "expo-image";
import ThemedText from "../ThemedText";
import Animated from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SPACING } from "@/constants";

interface PostItemProps {
  data: Post;
}

const PostItem: React.FC<PostItemProps> = ({ data }) => {
  return (
    <ThemedView>
      <PostHeader {...data.postedBy} />
      <PostMedia data={data} />
    </ThemedView>
  );
};

const PostHeader = ({
  avatarUrl,
  username,
}: Pick<User, "avatarUrl" | "username" | "userId">) => {
  return (
    <ThemedView style={styles.postHeader}>
      <ThemedView style={styles.avatar}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      </ThemedView>
      <ThemedText>{username}</ThemedText>
    </ThemedView>
  );
};

const PostMedia = ({ data }: PostItemProps) => {
  const [liked, setLiked] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
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
        {data.images.map((item) => {
          return (
            <Image
              key={item}
              source={item}
              style={{ width: dimension.width, aspectRatio: 1 }}
            />
          );
        })}
      </Animated.ScrollView>
      <View style={styles.actionsWrapper}>
        <View style={[styles.indicatorContainer]}>
          {data.images?.map((item, index) => {
            return (
              <View
                key={"dots" + item}
                style={[
                  styles.indicator,
                  { backgroundColor: theme.colors.outline },
                  currentIndex === index
                    ? { backgroundColor: theme.colors.primary }
                    : null,
                ]}
              />
            );
          })}
        </View>
        <ThemedView style={{flexDirection: 'row', gap: SPACING.small}}>
          <Pressable>
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color={theme.colors.onBackground}
            />
          </Pressable>
          <ThemedText>{data.likes.length}</ThemedText>
        </ThemedView>
      </View>
    </Fragment>
  );
};

export default PostItem;
const styles = StyleSheet.create({
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
    gap: SPACING.small,
    padding: SPACING.medium,
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
