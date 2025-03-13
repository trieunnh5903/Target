import { EMOJIS } from "@/constants";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { TextInputProps } from "react-native";

export type PostImage = {
  thumbnailUrl: {
    source: string;
    width: number;
    height: number;
  };
  baseUrl: {
    width: number;
    height: number;
    source: string;
  };
};

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface FetchPostsResponse {
  posts: Post[];
  lastPost: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null;
}

export type Post = {
  id: string;
  postedBy: User;
  caption: string;
  images: PostImage[];
  createdAt: number;
  likes?: { [userId: string]: boolean };
  comments?: { [userId: string]: boolean };
  likesCount?: number;
  commentsCount?: number;
};

export type User = {
  id: string;
  displayName: string | null;
  email: string;
  avatarURL: string | null;
  creationTime: string;
  lastSignInTime: string;
  phoneNumber: string | null;
  keywords: string[] | null;
  bio: string;
  verified?: boolean;
};

export type Comment = Pick<User, "avatarURL" | "displayName"> & {
  id: string;
  userId: User["id"];
  content: string;
  createdAt: number;
  postId: Post["id"];
};
export type TranslateAssetOptions = {
  [id: string]: {
    x: number;
    y: number;
  };
};
export type EmojiType = (typeof EMOJIS)[0] & {
  offsetX: number;
  offsetY: number;
};
export interface DraggableTagType {
  offsetX: number;
  offsetY: number;
  value: string;
  id: number;
  fontSize: number;
  backgroundColor: string;
  textAlign: TextInputProps["textAlign"];
  textColor: string;
  contentSize: {
    width: number;
    height: number;
  };
}

export type IMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: number;
};

export type IChatRoom = {
  id: string;
  participants: string[];
  participantsDetails: {
    [id: string]: {
      displayName: User["displayName"];
      avatarURL: User["avatarURL"];
    };
  };
  createdAt: number;
  lastMessage: Omit<IMessage, "id">;
};

export type NotificationPayload = {
  data: Record<string, any> & {
    type: "like" | "comment";
  };
  date: number;
  isRead: boolean;
  id: string;
};

export interface NotificationLikedData {
  postBy: {
    id: string;
    displayName: string;
  };
  likedBy: {
    id: string;
    displayName: string;
  };
  postId: string;
  type: "like";
}

export type ZaloPayOrder = {
  app_id: number;
  app_user: string;
  app_time: number;
  amount: number;
  app_trans_id: string;
  embed_data: string;
  item: string;
  description: string;
  mac: string;
};

export type ZaloPayOrderResponse = {
  return_code: 1 | 2;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
  order_url: string;
  zp_trans_token: string;
  order_token: string;
  qr_code: string;
};

export type PlanType = "monthly" | "yearly";
