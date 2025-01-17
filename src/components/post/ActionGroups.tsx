import { StyleSheet } from "react-native";
import React from "react";
import CustomView from "../CustomView";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Octicons } from "@expo/vector-icons";
import ThemedText from "../ThemedText";
import { GLOBAL_STYLE, SPACING } from "@/constants";
import { Icon, IconButton, useTheme } from "react-native-paper";
import { useAppTheme } from "@/config/theme";

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
  const theme = useAppTheme();
  return (
    <CustomView style={styles.actionsWrapper}>
      <CustomView style={styles.action}>
        <Animated.View style={heartAnimatedStyle}>
          <Octicons
            name={alreadyLiked ? "heart-fill" : "heart"}
            onPress={onLikePress}
            size={24}
            color={alreadyLiked ? "#ce2127" : theme.colors.icon}
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
          color={theme.colors.icon}
        />
        <ThemedText style={styles.textBold}>
          {commentsCount && commentsCount > 0 ? commentsCount : ""}
        </ThemedText>
      </CustomView>
    </CustomView>
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
    alignItems: "center",
    gap: SPACING.small
  },
});
