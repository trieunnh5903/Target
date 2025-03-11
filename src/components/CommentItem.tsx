import React from "react";
import { Comment } from "@/types";
import CustomView from "./CustomView";
import CustomAvatar from "./CustomAvatar";
import { Text } from "react-native-paper";
import { GLOBAL_STYLE } from "@/constants";
import { dayJs } from "@/utils/dayJs";

interface CommentItemProps {
  comment: Comment;
  commentSendingId?: string | null;
}
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  commentSendingId,
}) => {
  return (
    <CustomView style={[GLOBAL_STYLE.rowHCenter, { gap: 8 }]}>
      <CustomAvatar size={"medium"} avatarUrl={comment.avatarURL} />
      <CustomView>
        <CustomView style={GLOBAL_STYLE.rowHCenter}>
          <Text variant="labelLarge">{comment.displayName || "User"}</Text>
          <CustomView paddingLeft={8}>
            {comment.id !== commentSendingId && (
              <Text variant="labelMedium">
                {dayJs.getTimeFromNow(comment.createdAt)}
              </Text>
            )}
          </CustomView>
        </CustomView>
        <Text variant="bodyMedium">{comment.content}</Text>
        {comment.id === commentSendingId && (
          <Text style={{ fontSize: 12 }}>Sending...</Text>
        )}
      </CustomView>
    </CustomView>
  );
};

export default CommentItem;

