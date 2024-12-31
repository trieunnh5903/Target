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
};

export type Comment = Pick<User, "avatarURL" | "displayName"> & {
  id: string;
  userId: User["id"];
  content: string;
  createdAt: number;
  postId: Post["id"];
};
