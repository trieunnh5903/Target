export type Post = {
  id: string;
  postedBy: User;
  content: string;
  images: string;
  createdAt: { nanoseconds: number; seconds: number };
  likes?: { [userId: string]: boolean };
  commentIds?: { [userId: string]: boolean };
  likesCount?: number;
  commentsCount?: number;
};

export type User = {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  creationTime: string;
  lastSignInTime: string;
  phoneNumber: string | null;
  keywords: string[] | null;
};

export type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: { nanoseconds: number; seconds: number };
  postId: string;
  avatarUrl: string;
  displayName: string;
};
