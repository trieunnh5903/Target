import { StyleSheet } from "react-native";
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
        <CustomView style={GLOBAL_STYLE.row}>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>
            {comment.displayName || "No name"}
          </Text>
          <CustomView paddingLeft={8}>
            <Text style={{ fontSize: 12 }}>
              {dayJs.getTimeFromNow(comment.createdAt.seconds)}
            </Text>
          </CustomView>
        </CustomView>
        <Text>{comment.content}</Text>
        {comment.id === commentSendingId && (
          <Text style={{ fontSize: 12 }}>Sending...</Text>
        )}
      </CustomView>
    </CustomView>
  );
};

export default CommentItem;

const styles = StyleSheet.create({});
