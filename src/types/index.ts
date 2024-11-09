export type Post = {
  postId: string;
  postedBy: Pick<User, "avatarUrl" | "username" | "userId">;
  content: string;
  images: string[];
  createdAt: number;
  likes: Pick<User, "avatarUrl" | "username" | "userId">[];
  shares: string[];
  commentsCount: number;
};

export type User = {
  userId: string;
  username: string;
  password: string;
  email: string;
  avatarUrl: string;
  bio: string;
  following: string[];
  followers: string[];
  createdAt: number;
};
