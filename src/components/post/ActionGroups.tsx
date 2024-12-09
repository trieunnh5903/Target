import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomView from "../CustomView";
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import ThemedText from "../ThemedText";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { debounce } from "lodash";

interface ActionGroupsProps {
  isDoubleTap: SharedValue<boolean>;
  animatedIsLiked: SharedValue<boolean>;
  alreadyLiked: boolean;
  heartProgress: SharedValue<number>;
  onLikePress: () => void;
  likesCount: number;
  commentsCount: number;
  onCommentPress: () => void;
}
const ActionGroups: React.FC<ActionGroupsProps> = ({
  heartProgress,
  isDoubleTap,
  animatedIsLiked,
  onLikePress,
  likesCount,
  alreadyLiked,
  onCommentPress,
  commentsCount,
}) => {
  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale:
            isDoubleTap.value && animatedIsLiked.value
              ? Math.max(1, heartProgress.value)
              : heartProgress.value,
        },
      ],
    };
  });

  return (
    <View style={styles.actionsWrapper}>
      <CustomView style={styles.action}>
        <Animated.View style={heartAnimatedStyle}>
          <Octicons
            name={alreadyLiked ? "heart-fill" : "heart"}
            onPress={onLikePress}
            size={24}
            color={alreadyLiked ? "red" : "black"}
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
          {commentsCount && commentsCount > 0 ? commentsCount : ""}
        </ThemedText>
      </CustomView>
    </View>
  );
};

export default ActionGroups;

const styles = StyleSheet.create({
  reactions: {
    paddingHorizontal: 16,
  },
  actionsWrapper: {
    gap: SPACING.medium,
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
    ...GLOBAL_STYLE.rowHCenter,
  },
  textBold: {
    fontWeight: "bold",
  },
  action: {
    flexDirection: "row",
    gap: SPACING.small,
    alignItems: "center",
  },
});
