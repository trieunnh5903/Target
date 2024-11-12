import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import React, { Fragment, memo } from "react";
import ThemedView from "../ThemedView";
import { Post, User } from "@/types";
import { Image } from "expo-image";
import ThemedText from "../ThemedText";
import Animated from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SPACING } from "@/constants";
import { dayJs } from "@/utils/dayJs";

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

const PostHeader = ({ displayName, photoURL }: User) => {
  return (
    <ThemedView style={styles.postHeader}>
      <ThemedView style={styles.avatar}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={33}
            color="black"
          />
        )}
      </ThemedView>
      <ThemedText>{displayName}</ThemedText>
    </ThemedView>
  );
};

const PostMedia = ({ data }: PostItemProps) => {
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
        <ThemedView
          style={{
            flexDirection: "row",
            gap: SPACING.small / 2,
            alignItems: "center",
          }}
        >
          <Pressable>
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color={theme.colors.onBackground}
            />
          </Pressable>
          <ThemedText style={styles.textBold}>
            {data.likes?.length || 0}
          </ThemedText>
        </ThemedView>
      </View>
      <View style={styles.description}>
        <Text>
          <Text style={styles.textBold}>{data.postedBy.displayName}</Text>
          {"  "}
          {data.content}
        </Text>
        <Text>{dayJs.getTimeFromNow(data.createdAt.seconds)}</Text>
      </View>
    </Fragment>
  );
};

export default memo(PostItem);
const styles = StyleSheet.create({
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
    gap: SPACING.small,
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
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
